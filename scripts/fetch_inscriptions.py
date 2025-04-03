import requests
import json

# Your Bitcoin address
address = "bc1pln2sqsx8gj0xdprshr97wdxsdy9uddvf4wqlsm37smcehfa7weqsms6ccn"

# API endpoint
url = f"https://api.hiro.so/ordinals/v1/inscriptions?address={address}"

try:
    response = requests.get(url)
    response.raise_for_status()
    data = response.json()
    notes = {}

    for inscription in data.get("results", []):
        block = inscription.get("genesis_block_height")
        message = inscription.get("content_body", "No message available")
        inscription_id = inscription.get("id")
        if block and inscription_id:
            notes[block] = {
                "message": f"{message} – {address}",
                "inscription": inscription_id
            }

    # Save to notes.json
    with open("notes.json", "w") as file:
        json.dump(notes, file, indent=2)

    print("notes.json has been created successfully.")

except requests.RequestException as e:
    print(f"Error fetching inscriptions: {e}")
