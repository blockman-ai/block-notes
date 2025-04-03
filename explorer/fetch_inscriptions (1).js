async function fetchInscriptions(address) {
  try {
    const response = await fetch(`https://api.hiro.so/ordinals/v1/inscriptions?address=${address}`);
    if (!response.ok) {
      throw new Error(`Error fetching inscriptions: ${response.statusText}`);
    }
    const data = await response.json();
    const notes = {};

    data.results.forEach(inscription => {
      const block = inscription.genesis_block_height;
      const message = inscription.content_body || "No message available";
      notes[block] = {
        message: `${message} – ${address}`,
        inscription: inscription.id
      };
    });

    localStorage.setItem("blockNotes", JSON.stringify(notes));
  } catch (error) {
    console.error("Failed to fetch inscriptions:", error);
  }
}

// Replace with your Bitcoin address
const bitcoinAddress = "bc1pln2sqsx8gj0xdprshr97wdxsdy9uddvf4wqlsm37smcehfa7weqsms6ccn";
fetchInscriptions(bitcoinAddress);
// Auto-generated inscription cache
localStorage.setItem("blockNotes", JSON.stringify({
  "840011": {
    message: "Forever starts with a single block. – @blockman-ai",
    inscription: "ea0eac62c1c7b8a032c5d142a88be6b3f8fa8d9c29fbe3bfe9f68b35fc0023a0i0"
  },
  "840010": {
    message: "Honor the chain. – @blockman-ai",
    inscription: "f3a29e807c50d238b94e12708c16f4867dbaef7fc957b2373617e97c1940cd50i0"
  },
  "840009": {
    message: "Bitcoin writes history in stone. – @blockman-ai",
    inscription: "7d5c91bd725d75eb8ffb7f8ac91b2cb3e13f5c3e9a3a4c55897de2a60ed70db5i0"
  }
}));
<script src="./fetch_inscriptions.js"></script>

// Auto-generated inscription cache
localStorage.setItem("blockNotes", "{\"840420\": {\"message\": \"The revolution will be inscribed. \\u2013 bc1pln2sqsx8gj0xdprshr97wdxsdy9uddvf4wqlsm37smcehfa7weqsms6ccn\", \"inscription\": \"8c3f4e...abc123\"}, \"840421\": {\"message\": \"Immutable thoughts, forever chained. \\u2013 bc1pln2sqsx8gj0xdprshr97wdxsdy9uddvf4wqlsm37smcehfa7weqsms6ccn\", \"inscription\": \"9f4a6b...def456\"}, \"840422\": {\"message\": \"Bitcoin remembers everything. \\u2013 bc1pln2sqsx8gj0xdprshr97wdxsdy9uddvf4wqlsm37smcehfa7weqsms6ccn\", \"inscription\": \"7e2d1c...ghi789\"}}");
