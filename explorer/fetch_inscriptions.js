async function fetchInscriptions(address) {
  try {
    const response = await fetch(`https://ordiscan.com/api/v1/address/${address}/inscriptions`);
    const data = await response.json();

    const notes = {};
    data.inscriptions.forEach(insc => {
      const block = insc.block_height;
      const content = insc.content || "";
      const tag = insc.owner || "@unknown";

      const preview = `block-note:${block}\n"${content}" – ${tag}`;

      notes[block] = {
        message: preview,
        inscription: insc.inscription_id
      };
    });

    // Save notes to localStorage (client-side only)
    localStorage.setItem("blockNotes", JSON.stringify(notes));
    console.log("Fetched and saved notes:", notes);
  } catch (err) {
    console.error("Failed to fetch inscriptions:", err);
  }
}

// Example usage:
fetchInscriptions("bc1qxyzyouraddresshere");
