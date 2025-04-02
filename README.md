# Block Notes

**Block Notes** is a decentralized notebook on Bitcoin.

Every block is a canvas for expression — a memory, a quote, a prayer, or a moment in history.  
Inscribe your thoughts forever using simple on-chain text.

---

## How It Works

To claim a block note, inscribe a message like this:

```text
block-note:840000
"Today I begin again. Thank you, Bitcoin." – @blockman-ai

---

## **Step 3: Create `notes.json`**

Create a file in the repo called:  
`/data/notes.json`

Paste this inside:

```json
{
  "840000": {
    "message": "Today I begin again. Thank you, Bitcoin. – @blockman-ai",
    "inscription": "f529ddd9cb9d7b013bee584bfe319f9640b8f834da90b4999a4a322fe09d107e"
  },
  "839999": {
    "message": "Before the halving, we prepared in silence. – @blockman-ai",
    "inscription": "example123456789abcdef"
  }
}
https://github.com/blockman-ai/block-notes/issues/new?template=submit-note.md
