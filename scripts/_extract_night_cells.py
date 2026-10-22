import json
import sys
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")
nb = json.loads(
    Path(r"c:\Users\DELL\Downloads\FYP COMPLETE\FYP COMPLETE\pipeline\pipeline_withnight.ipynb").read_text(
        encoding="utf-8"
    )
)
for i, cell in enumerate(nb["cells"]):
    src = "".join(cell.get("source", []))
    first = src.strip().split("\n")[0][:80] if src.strip() else ""
    print(f"CELL {i}: {first}")

print("\n" + "=" * 70 + "\nNIGHT-RELATED CELLS FULL:\n")
keywords = ("night", "preprocess_image", "denight", "low", "tonal", "weather")
for i, cell in enumerate(nb["cells"]):
    src = "".join(cell.get("source", []))
    low = src.lower()
    if any(k in low for k in keywords):
        print(f"\n{'='*70}\nCELL {i}\n{'='*70}\n")
        print(src)
