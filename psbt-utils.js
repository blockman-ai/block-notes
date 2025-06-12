<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Block Notes On-Chain</title>

  <!-- ✅ BitcoinJS v5.2.0 from jsDelivr (UMD) -->
  <script src="https://cdn.jsdelivr.net/npm/bitcoinjs-lib@5.2.0/dist/bitcoinjs-lib.umd.min.js"></script>
  <script>
    // Patch for jsDelivr UMD compatibility
    window.bitcoin = window['bitcoinjs-lib'];
    window.bitcoinjsReady = new Promise((resolve, reject) => {
      let tries = 0;
      const maxTries = 50;
      const check = () => {
        if (window.bitcoin?.Psbt && window.bitcoin?.networks?.bitcoin) {
          resolve(window.bitcoin);
        } else if (++tries >= maxTries) {
          reject(new Error("❌ BitcoinJS v5.2.0 not loaded."));
        } else {
          setTimeout(check, 100);
        }
      };
      check();
    });
  </script>

  <style>
    body {
      background-color: #0a0a0a;
      color: #f2f2f2;
      font-family: 'Courier New', monospace;
      text-align: center;
      padding: 2rem;
    }
    h1 { color: #00ff00; font-size: 2rem; }
    button {
      background: #00ffff;
      color: #000;
      padding: 10px 20px;
      border: none;
      border-radius: 6px;
      font-weight: bold;
      cursor: pointer;
    }
    input, textarea {
      display: block;
      width: 100%;
      max-width: 600px;
      margin: 0.5rem auto;
      padding: 10px;
      border-radius: 6px;
      border: none;
      background: #1a1a1a;
      color: white;
    }
    .status {
      margin-top: 1rem;
      font-size: 1rem;
    }
    .error { color: red; }
    .success { color: lime; }
  </style>
</head>
<body>
  <h1>Block Notes Inscriber</h1>

  <input id="blockInput" type="number" placeholder="Block Height (e.g. 840000)" />
  <textarea id="messageInput" rows="3" placeholder="Your message..."></textarea>
  <input id="handleInput" type="text" placeholder="Your handle (optional)" />
  <button onclick="startInscribe()">📝 Inscribe</button>
  <p id="status" class="status"></p>

  <script>
    async function buildPsbt(inscriptionText, userAddress) {
      const bitcoin = await window.bitcoinjsReady;
      const network = bitcoin.networks.bitcoin;
      const creatorAddress = "bc1qay9jnunvj087zgxgkuwd7ps5gjmnsnfczfkwlz";
      const creatorFeeSats = 546;

      const feeRates = await fetch("https://mempool.space/api/v1/fees/recommended").then(res => res.json());
      const feeRate = feeRates.hourFee;

      const utxos = await window.unisat.getUnspentOutputs();
      if (!utxos?.length) throw new Error("No UTXOs found.");

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
      const estimatedFee = Math.ceil(200 * feeRate);
      const change = totalIn - 546 - creatorFeeSats - estimatedFee;

      if (change < 546) throw new Error("Insufficient funds after fees");

      psbt.addOutput({ address: userAddress, value: change });
      return psbt.toHex();
    }

    async function broadcastRawTx(rawTxHex) {
      const res = await fetch("https://mempool.space/api/tx", {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: rawTxHex
      });
      if (!res.ok) throw new Error("Broadcast failed: " + await res.text());
      return await res.text();
    }

    async function startInscribe() {
      const status = document.getElementById("status");
      const block = document.getElementById("blockInput").value.trim();
      const message = document.getElementById("messageInput").value.trim();
      const handle = document.getElementById("handleInput").value.trim() || "satoshi";

      if (!block || !message) {
        status.textContent = "⚠️ Please fill all fields.";
        status.className = "status error";
        return;
      }

      try {
        const address = (await window.unisat.requestAccounts())[0];
        const content = `text block-note:${block} \"${message}\" – @${handle} #blocknotes`;

        status.textContent = "⏳ Building inscription...";
        status.className = "status";

        const psbtHex = await buildPsbt(content, address);
        const signedPsbt = await window.unisat.signPsbt(psbtHex);
        const rawTx = await window.unisat.pushPsbt(signedPsbt);
        const txid = await broadcastRawTx(rawTx);

        status.innerHTML = `✅ <span class='success'>Success! TXID: <a href='https://mempool.space/tx/${txid}' target='_blank'>${txid}</a></span>`;
      } catch (err) {
        console.error("Error:", err);
        status.textContent = `❌ Error: ${err.message}`;
        status.className = "status error";
      }
    }
  </script>
</body>
</html>
