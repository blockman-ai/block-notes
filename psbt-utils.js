// 🔧 psbt-utils.js

async function buildPsbt(inscriptionText, userAddress) {
  const bitcoin = bitcoinjs;
  const network = bitcoin.networks.bitcoin;
  const creatorAddress = "bc1qay9jnunvj087zgxgkuwd7ps5gjmnsnfczfkwlz";
  const creatorFeeSats = 546;

  // Fetch recommended fee rate from mempool.space
  const feeRes = await fetch("https://mempool.space/api/v1/fees/recommended");
  const feeRates = await feeRes.json();
  const feeRate = feeRates.hourFee; // sats/vB

  // Get user UTXOs
  const utxos = await window.unisat.getUnspentOutputs();
  if (!utxos || utxos.length === 0) throw new Error("No UTXOs found");

  // Use the first UTXO for simplicity
  const utxo = utxos[0];
  const inputTx = await fetch(`https://mempool.space/api/tx/${utxo.txid}/hex`).then(r => r.text());

  const psbt = new bitcoin.Psbt({ network });
  psbt.addInput({
    hash: utxo.txid,
    index: utxo.vout,
    nonWitnessUtxo: Buffer.from(inputTx, "hex")
  });

  // Create inscription output (OP_RETURN style via OP_FALSE OP_IF)
  const embed = bitcoin.payments.embed({
    data: [Buffer.from("ord"), Buffer.from([1]), Buffer.from("text/plain"), Buffer.from([0]), Buffer.from(inscriptionText)]
  });

  psbt.addOutput({
    script: embed.output,
    value: 546 // dust minimum
  });

  // Creator fee output
  psbt.addOutput({
    address: creatorAddress,
    value: creatorFeeSats
  });

  // Change output - remaining funds go back to user (estimated)
  const totalIn = utxo.value;
  const estimatedFee = 200 * feeRate;
  const change = totalIn - 546 - creatorFeeSats - estimatedFee;

  if (change < 546) throw new Error("Insufficient funds after fees");

  psbt.addOutput({
    address: userAddress,
    value: change
  });

  return psbt.toHex();
}
