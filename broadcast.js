// 📡 broadcast.js

async function broadcastRawTx(rawTxHex) {
  try {
    const res = await fetch("https://mempool.space/api/tx", {
      method: "POST",
      headers: {
        "Content-Type": "text/plain"
      },
      body: rawTxHex
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error("Broadcast failed: " + errorText);
    }

    const txid = await res.text();
    console.log("✅ Broadcast successful. TXID:", txid);
    return txid;

  } catch (err) {
    console.error("🚨 Error broadcasting TX:", err);
    throw err;
  }
}
