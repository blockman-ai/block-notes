// Global loader to ensure BitcoinJS is available before buildPsbt runs
window.bitcoinjsReady = new Promise((resolve, reject) => {
  let attempts = 0;
  const maxAttempts = 50;

  const check = () => {
    if (window.bitcoin && window.bitcoin.networks && window.bitcoin.Psbt) {
      console.log("BitcoinJS Loaded Successfully!");
      resolve(window.bitcoin);
    } else if (++attempts >= maxAttempts) {
      reject(new Error("BitcoinJS lib not loaded. Try refreshing the page."));
    } else {
      setTimeout(check, 100);
    }
  };

  // Delay execution slightly to allow BitcoinJS to initialize
  setTimeout(check, 100);
});

// Core PSBT builder function for inscriptions
async function buildPsbt(inscriptionText, userAddress) {
  try {
    const bitcoin = await window.bitcoinjsReady;

    if (!bitcoin?.Psbt || !bitcoin?.networks?.bitcoin) {
      throw new Error("BitcoinJS is not fully loaded.");
    }

    const network = bitcoin.networks.bitcoin;
    const creatorAddress = "bc1qay9jnunvj087zgxgkuwd7ps5gjmnsnfczfkwlz";
    const creatorFeeSats = 546;

    // Get fee rate
    const feeRates = await fetch("https://mempool.space/api/v1/fees/recommended")
      .then(res => res.json())
      .catch(() => ({ hourFee: 20 })); // Default fallback fee rate
    const feeRate = feeRates.hourFee || 20;

    // Get UTXO
    const utxos = await window.unisat.getUnspentOutputs();
    if (!utxos?.length) throw new Error("No UTXOs found.");

    const utxo = utxos[0];
    const inputHex = await fetch(`https://mempool.space/api/tx/${utxo.txid}/hex`)
      .then(r => r.text())
      .catch(() => { throw new Error("Failed to fetch UTXO hex data."); });

    // Start building PSBT
    const psbt = new bitcoin.Psbt({ network });
    psbt.addInput({
      hash: utxo.txid,
      index: utxo.vout,
      nonWitnessUtxo: Buffer.from(inputHex, "hex")
    });

    // Create OP_RETURN embed output for inscription
    const embed = bitcoin.payments.embed({
      data: [
        Buffer.from("ord"),
        Buffer.from([1]),
        Buffer.from("text/plain"),
        Buffer.from([0]),
        Buffer.from(inscriptionText)
      ]
    });

    psbt.addOutput({ script: embed.output, value: 546 });
    psbt.addOutput({ address: creatorAddress, value: creatorFeeSats });

    // Estimate fees and change
    const totalIn = utxo.value;
    const estimatedFee = Math.ceil(200 * feeRate);
    const change = totalIn - 546 - creatorFeeSats - estimatedFee;

    if (change < 546) throw new Error("Insufficient funds after fees");

    psbt.addOutput({ address: userAddress, value: change });

    return psbt.toHex();

  } catch (error) {
    console.error("Error in buildPsbt:", error);
    throw error;
  }
}
