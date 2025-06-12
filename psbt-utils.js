// psbt-utils.js

// Wait for BitcoinJS to be fully available
window.bitcoinjsReady = new Promise((resolve, reject) => {
  let attempts = 0;
  const maxAttempts = 50;
  const check = () => {
    if (window.bitcoin && window.bitcoin.networks && window.bitcoin.Psbt) {
      resolve(window.bitcoin);
    } else if (++attempts >= maxAttempts) {
      reject(new Error("BitcoinJS lib not loaded. Try refreshing the page."));
    } else {
      setTimeout(check, 100);
    }
  };
  check();
});

// Build PSBT with inscription and creator fee
async function buildPsbt(inscriptionText, userAddress) {
  const bitcoin = window.bitcoin;
  if (!bitcoin || !bitcoin.Psbt) throw new Error("BitcoinJS not available");
  const network = bitcoin.networks.bitcoin;
  const creatorAddress = "bc1qay9jnunvj087zgxgkuwd7ps5gjmnsnfczfkwlz";
  const creatorFeeSats = 546;

  // Get fee rate
  const feeRates = await fetch("https://mempool.space/api/v1/fees/recommended").then(r => r.json());
  const feeRate = feeRates.hourFee || 20;

  // Get first UTXO
  const utxos = await window.unisat.getUnspentOutputs();
  if (!utxos?.length) throw new Error("No UTXOs found.");
  const utxo = utxos[0];
  const inputHex = await fetch(`https://mempool.space/api/tx/${utxo.txid}/hex`).then(r => r.text());

  // Construct PSBT
  const psbt = new bitcoin.Psbt({ network });
  psbt.addInput({
    hash: utxo.txid,
    index: utxo.vout,
    nonWitnessUtxo: Buffer.from(inputHex, "hex")
  });

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

  const estimatedFee = Math.ceil(200 * feeRate);
  const totalIn = utxo.value;
  const change = totalIn - 546 - creatorFeeSats - estimatedFee;

  if (change < 546) throw new Error("Insufficient funds after fees.");

  psbt.addOutput({ address: userAddress, value: change });
  return psbt.toHex();
}
