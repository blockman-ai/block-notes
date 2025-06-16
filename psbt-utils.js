// Broadcast raw transaction
async function broadcastRawTx(rawTxHex) {
  const res = await fetch("https://mempool.space/api/tx", {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body: rawTxHex
  });
  if (!res.ok) throw new Error(`Broadcast failed: ${await res.text()}`);
  return await res.text();
}

// Fetch latest inscriptions
async function fetchLatestInscriptions(address) {
  try {
    const response = await fetch(`https://open-api.unisat.io/v1/indexer/address/${address}/inscriptions`, {
      headers: { "accept": "application/json" }
    });
    if (!response.ok) throw new Error("Failed to fetch inscriptions");

    const result = await response.json();
    const notes = {};
    for (const item of result.data.list) {
      const content = item.content || "";
      const blockMatch = content.match(/block-note:(\d+)/);
      const messageMatch = content.match(/"(.*?)"/);
      if (blockMatch && messageMatch) {
        const block = blockMatch[1];
        const message = messageMatch[1];
        notes[block] = { message: message + " – " + (item.owner || "@unknown"), inscription: item.inscriptionId };
      }
    }
    localStorage.setItem("blockNotes", JSON.stringify(notes));
  } catch (error) {
    console.error("Failed to fetch inscriptions:", error);
  }
}
