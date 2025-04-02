import requests
import json

API_KEY = "9cd23c3c-a965-4a27-90f2-ce84848d83eb"

headers = {
    "Authorization": f"Bearer {API_KEY}"
}

url = "https://api.ordiscan.com/v1/inscriptions?q=block-note"

res = requests.get(url, headers=headers)

if res.status_code != 200:
    print("Error fetching data:", res.status_code)
    exit()

data = res.json()
notes = {}

for item in data.get("results", []):
    content = item.get("content", "")
    inscription_id = item.get("inscription_id")
    block = item.get("block_number")

    if not inscription_id or not block:
        continue

    lines = content.strip().split("\n")
    block_line = next((l for l in lines if "block-note:" in l), None)
    message_line = next((l for l in lines if l != block_line), None)

    if not block_line or not message_line:
        continue

    try:
        block_num = block_line.replace("block-note:", "").strip()
        notes[block_num] = {
            "message": message_line.strip(),
            "inscription": inscription_id
        }
    except:
        continue

with open("explorer/notes.json", "w") as f:
    json.dump(notes, f, indent=2)

print(f"Indexed {len(notes)} block-notes from chain.")
