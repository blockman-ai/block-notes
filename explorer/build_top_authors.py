import json
from collections import defaultdict

# Load notes.json
with open("explorer/notes.json", "r") as f:
    notes = json.load(f)

# Count authors by parsing message tag (after "–")
authors = defaultdict(int)

for note in notes.values():
    message = note.get("message", "")
    if "–" in message:
        try:
            tag = message.split("–")[-1].strip()
            authors[tag] += 1
        except:
            pass

# Sort by note count descending
sorted_authors = dict(sorted(authors.items(), key=lambda x: x[1], reverse=True))

# Save output
with open("explorer/top_authors.json", "w") as f:
    json.dump(sorted_authors, f, indent=2)

print("✅ top_authors.json built!")
