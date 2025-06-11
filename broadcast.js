// broadcast.js

async function broadcastRawTx(rawTxHex) {
  const res = await fetch("https://mempool.space/api/tx", {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body: rawTxHex
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Broadcast failed: ${text}`);
  }

  return await res.text(); // returns txid
}
