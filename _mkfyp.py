import json, pathlib
p = pathlib.Path(r"D:/fyp/final yolo/fyp_yolo.ipynb")
nb = json.loads(p.read_text(encoding="utf-8"))
out = pathlib.Path(r"d:/fyp/FYP COMPLETE/_fyp_yolo_cells.txt")
lines = []
for i,c in enumerate(nb["cells"]):
    src = "".join(c.get("source",[]))
    if src.strip():
        lines.append(f"===CELL {i} {c.get('cell_type')} len {len(src)}===")
        lines.append(src)
out.write_text("\n".join(lines), encoding="utf-8")
print("wrote", out)
