async function buildPsbt(inscriptionText, userAddress) {
  const bitcoin = await window.bitcoinjsReady;
  const network = bitcoin.networks.bitcoin;

  const creatorAddress = "bc1qay9jnunvj087zgxgkuwd7ps5gjmnsnfczfkwlz";
  const creatorFeeSats = 546;

  const feeRates = await fetch("https://mempool.space/api/v1/fees/recommended").then(res => res.json());
  const feeRate = feeRates.hourFee;

  const utxos = await window.unisat.getUnspentOutputs();
  if (!utxos || utxos.length === 0) throw new Error("No UTXOs found");

  const utxo = utxos[0];
  const inputHex = await fetch(`https://mempool.space/api/tx/${utxo.txid}/hex`).then(r => r.text());

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

  const totalIn = utxo.value;
  const estimatedFee = 200 * feeRate;
  const change = totalIn - 546 - creatorFeeSats - estimatedFee;

  if (change < 546) throw new Error("Insufficient funds after fees");

  psbt.addOutput({ address: userAddress, value: change });

  return psbt.toHex();
}
