// ✅ psbt-utils.js (final fixed + polished)

async function buildPsbt(inscriptionText, userAddress) {
  const bitcoin = window.bitcoinjs || window.bitcoin;
  const network = bitcoin.networks.bitcoin;
  const creatorAddress = "bc1qay9jnunvj087zgxgkuwd7ps5gjmnsnfczfkwlz";
  const creatorFeeSats = 546;

  // Step 1: Fetch fee rate from mempool.space
  const feeRes = await fetch("https://mempool.space/api/v1/fees/recommended");
  const feeRates = await feeRes.json();
  const feeRate = feeRates.hourFee; // sats/vB

  // Step 2: Fetch user UTXOs
  const utxos = await window.unisat.getUnspentOutputs();
  if (!utxos || utxos.length === 0) throw new Error("No UTXOs found.");

  const utxo = utxos[0]; // using first UTXO (safest for now)
  const inputTx = await fetch(`https://mempool.space/api/tx/${utxo.txid}/hex`).then(res => res.text());

  const psbt = new bitcoin.Psbt({ network });

  // Step 3: Add input
  psbt.addInput({
    hash: utxo.txid,
    index: utxo.vout,
    nonWitnessUtxo: Buffer.from(inputTx, "hex")
  });

  // Step 4: Build inscription output (OP_FALSE OP_IF ... OP_ENDIF)
  const inscriptionScript = bitcoin.payments.embed({
    data: [
      Buffer.from("ord"),                  // Ordinal protocol tag
      Buffer.from([1]),                    // Version
      Buffer.from("text/plain"),           // Content type
      Buffer.from([0]),                    // Start body
      Buffer.from(inscriptionText, "utf8") // Actual text
    ]
  }).output;

  psbt.addOutput({
    script: inscriptionScript,
    value: 546 // Dust
  });

  // Step 5: Add creator fee output
  psbt.addOutput({
    address: creatorAddress,
    value: creatorFeeSats
  });

  // Step 6: Add change output
  const totalInput = utxo.value;
  const estimatedFee = 200 * feeRate;
  const change = totalInput - 546 - creatorFeeSats - estimatedFee;

  if (change < 546) {
    throw new Error("Insufficient balance after fees.");
  }

  psbt.addOutput({
    address: userAddress,
    value: change
  });

  // Step 7: Return hex
  return psbt.toHex();
}
