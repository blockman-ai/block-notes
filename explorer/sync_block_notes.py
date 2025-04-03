import json
import os

# Simulated function to fetch new inscriptions
def fetch_new_inscriptions():
    return {
        "840011": {
            "message": "Forever starts with a block. – @blockman-ai",
            "inscription": "abc123def456abc123def456abc123def456abc123def456abc123def456abc123di0"
        },
        "840012": {
            "message": "Bitcoin doesn’t forget. – @blockman-ai",
            "inscription": "123abc456def123abc456def123abc456def123abc456def123abc456def123abcdi0"
        }
    }

# Load existing notes
existing_file_path = "explorer/notes.json"
if os.path.exists(existing_file_path):
    with open(existing_file_path, "r") as f:
        existing_notes = json.load(f)
else:
    existing_notes = {}

# Fetch new verified inscriptions
new_inscriptions = fetch_new_inscriptions()

# Merge: Add only new blocks
for block, data in new_inscriptions.items():
    if block not in existing_notes:
        existing_notes[block] = data

# Save back to notes.json
with open(existing_file_path, "w") as f:
    json.dump(existing_notes, f, indent=2)

print("Updated notes.json with new inscriptions.")
