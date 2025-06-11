// 📡 broadcast.js

async function broadcastRawTx(rawTxHex) {
  const res = await fetch("https://mempool.space/api/tx", {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body: rawTxHex
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error("Broadcast failed: " + errorText);
  }

  const txid = await res.text();
  return txid;
}
