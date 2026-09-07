"""Add VMMR training progression rows (epochs 1-32 milestones) to fyp_ppt slide 10."""
from __future__ import annotations

import copy
from pathlib import Path

import torch
from pptx import Presentation
from pptx.dml.color import RGBColor
from pptx.util import Pt

ROOT = Path(__file__).resolve().parent
CKPT = ROOT / "vmmr fyp" / "efficientnet_b4_best.pth"
SRC = ROOT / "fyp_ppt.pptx"
OUT = ROOT / "fyp_ppt_vmmr_epochs.pptx"

LIGHT = RGBColor(0xE8, 0xEC, 0xF1)


def load_history():
    ckpt = torch.load(CKPT, map_location="cpu", weights_only=False)
    return ckpt["history"]


def fmt_lr(ep: int, lr: float) -> str:
    if ep == 35:
        return "→ 5e-5"
    if lr >= 9.9e-5:
        return "1e-4"
    return "5e-5"


def row(history, ep: int) -> list[str]:
    i = ep - 1
    return [
        str(ep),
        f"{history['train_loss'][i]:.4f}",
        f"{history['val_loss'][i]:.4f}",
        f"{history['train_acc'][i] * 100:.2f}%",
        f"{history['val_acc'][i] * 100:.2f}%",
        fmt_lr(ep, history["lr"][i]),
    ]


def style_cell(cell, text: str, size: int = 7) -> None:
    cell.text = text
    for para in cell.text_frame.paragraphs:
        para.alignment = 1
        for run in para.runs:
            run.font.name = "Calibri"
            run.font.size = Pt(size)
            run.font.color.rgb = LIGHT


def main() -> None:
    history = load_history()
    # Every 5 epochs: 1, 5, 10, …, 50
    milestones = [1, *range(5, 51, 5)]
    rows_data = [row(history, ep) for ep in milestones]

    prs = Presentation(str(SRC))
    slide = prs.slides[9]
    table_shape = None
    for shape in slide.shapes:
        if shape.has_table and len(shape.table.columns) == 6:
            table_shape = shape
            break
    if table_shape is None:
        raise SystemExit("Training progression table not found on slide 10.")

    table = table_shape.table
    tbl = table._tbl
    old_height = table_shape.height

    # Keep header row; remove data rows via XML
    for tr in list(tbl.tr_lst[1:]):
        tbl.remove(tr)

    # Use header row as template for new data rows
    template_tr = tbl.tr_lst[0]
    for data in rows_data:
        new_tr = copy.deepcopy(template_tr)
        tbl.append(new_tr)
        r = len(table.rows) - 1
        for c, val in enumerate(data):
            style_cell(table.cell(r, c), val)

    # Scale table height for extra rows; keep bottom within slide (7.5 in)
    scale = (len(rows_data) + 1) / 5
    table_shape.height = int(old_height * scale * 0.92)
    slide_bottom = 6858000  # 7.5 in in EMU
    margin = 91440  # 0.1 in
    table_shape.top = slide_bottom - table_shape.height - margin

    try:
        prs.save(str(OUT))
        target = OUT
    except PermissionError:
        target = ROOT / "fyp_ppt_vmmr_epochs_new.pptx"
        prs.save(str(target))

    print(f"Saved: {target}")
    print(f"Added {len(rows_data)} rows (epochs 1, 5, 10, …, 50):")
    for d in rows_data:
        print(" | ".join(d))


if __name__ == "__main__":
    import sys
    sys.stdout.reconfigure(encoding="utf-8")
    main()
