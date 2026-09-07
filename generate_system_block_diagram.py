"""Generate updated high-level block diagram for Smart Vehicle Gate System."""
from __future__ import annotations

from pathlib import Path

import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch

OUT = Path(r"c:\Users\DELL\Downloads\FYP COMPLETE\FYP COMPLETE\figures\system_block_diagram_updated.png")
OUT.parent.mkdir(parents=True, exist_ok=True)

# Colors
C_INIT = "#E8F4FC"
C_INPUT = "#FFF8E1"
C_AI = "#E3F2FD"
C_AUTH = "#F3E5F5"
C_OUT = "#E8F5E9"
C_HW = "#E0F2F1"
C_DECISION = "#FFF3E0"
C_EDGE = "#FFE0B2"
TEXT = "#1A1A1A"
TITLE = "#1E3A5F"
ACCENT = "#2C5282"


def box(ax, x, y, w, h, text, fc, ec="#4A5568", fontsize=7.5, bold=False):
    patch = FancyBboxPatch(
        (x, y),
        w,
        h,
        boxstyle="round,pad=0.02,rounding_size=0.08",
        linewidth=1.2,
        edgecolor=ec,
        facecolor=fc,
    )
    ax.add_patch(patch)
    weight = "bold" if bold else "normal"
    ax.text(
        x + w / 2,
        y + h / 2,
        text,
        ha="center",
        va="center",
        fontsize=fontsize,
        color=TEXT,
        weight=weight,
        wrap=True,
    )
    return x + w / 2, y, x + w / 2, y + h


def diamond(ax, x, y, w, h, text, fc=C_DECISION):
    cx, cy = x + w / 2, y + h / 2
    pts = [(cx, y + h), (x + w, cy), (cx, y), (x, cy), (cx, y + h)]
    ax.fill([p[0] for p in pts], [p[1] for p in pts], fc=fc, ec="#4A5568", linewidth=1.2)
    ax.text(cx, cy, text, ha="center", va="center", fontsize=7, color=TEXT)
    return cx, y, cx, y + h


def arrow(ax, x1, y1, x2, y2, label=None, color="#4A5568"):
    arr = FancyArrowPatch(
        (x1, y1),
        (x2, y2),
        arrowstyle="-|>",
        mutation_scale=10,
        linewidth=1.1,
        color=color,
        shrinkA=2,
        shrinkB=2,
    )
    ax.add_patch(arr)
    if label:
        ax.text((x1 + x2) / 2 + 0.15, (y1 + y2) / 2, label, fontsize=6.5, color="#555")


def section_label(ax, x, y, text):
    ax.text(x, y, text, fontsize=9, color=ACCENT, weight="bold")


def main():
    fig, ax = plt.subplots(figsize=(14, 18))
    ax.set_xlim(0, 14)
    ax.set_ylim(0, 18)
    ax.axis("off")

    ax.text(
        7,
        17.45,
        "Smart Vehicle Gate Recognition System — High-Level Block Diagram",
        ha="center",
        fontsize=14,
        color=TITLE,
        weight="bold",
    )
    ax.text(
        7,
        17.05,
        "Figure 3.2.1 — Edge AI on Orange Pi 5 Pro + Vercel Dashboard (Updated 2026)",
        ha="center",
        fontsize=9,
        color="#4A5568",
    )

    # --- INITIALIZATION ---
    section_label(ax, 0.4, 16.55, "1. INITIALIZATION (Orange Pi — orange_pi_deploy/)")
    box(ax, 4.8, 15.95, 4.4, 0.55, "System Start", C_INIT, bold=True)
    arrow(ax, 7, 15.95, 7, 15.55)

    box(ax, 1.0, 14.85, 3.0, 0.65, "Load YOLOv8n\nPlate Model\n(plate_best.pt)", C_INIT)
    box(ax, 4.1, 14.85, 3.0, 0.65, "Load YOLOv8n Char/Digit\nModel — 38 classes\n(char_best.pt)", C_INIT)
    box(ax, 7.2, 14.85, 3.0, 0.65, "Load EfficientNet-B4\nVMMR — 245 classes\n(efficientnet_b4_best.pth)", C_INIT)
    box(ax, 10.3, 14.85, 3.0, 0.65, "Load Vehicle DB +\nConfig\n(vehicles.json, config.py)", C_INIT)

    for x in [2.5, 5.6, 8.7, 11.8]:
        arrow(ax, 7, 15.55, x, 15.5)
        arrow(ax, x, 14.85, x, 14.35)

    # --- INPUT ---
    section_label(ax, 0.4, 14.0, "2. INPUT & WEATHER PREPROCESSING")
    box(ax, 4.5, 13.35, 5.0, 0.55, "Capture Frame / Load Image\n(USB 1080p camera or batch folder)", C_INPUT)
    arrow(ax, 7, 14.35, 7, 13.9)
    arrow(ax, 7, 13.35, 7, 12.95)

    box(ax, 3.2, 12.25, 3.3, 0.65, "Weather Detect\n(auto / none / fog /\nrain / night)", C_INPUT)
    box(ax, 7.5, 12.25, 3.3, 0.65, "Apply Enhancement\nDCP defog | Median derain\n| CLAHE night", C_INPUT)
    arrow(ax, 7, 12.95, 4.85, 12.9)
    arrow(ax, 7, 12.95, 9.15, 12.9)
    arrow(ax, 4.85, 12.25, 7, 11.85)
    arrow(ax, 9.15, 12.25, 7, 11.85)

    # --- AI PIPELINE ---
    section_label(ax, 0.4, 11.45, "3. AI INFERENCE (pipeline.py — target ≤ 2 s total)")
    box(ax, 4.3, 10.75, 5.4, 0.6, "Run EfficientNet-B4 VMMR\n→ Predicted Make/Model + Confidence", C_AI)
    arrow(ax, 7, 11.85, 7, 11.35)
    arrow(ax, 7, 10.75, 7, 10.35)

    box(ax, 4.3, 9.65, 5.4, 0.6, "Run YOLOv8n License Plate Detection\n→ Bounding Box(es)", C_AI)
    arrow(ax, 7, 10.35, 7, 10.25)

    _, _, _, dtop = diamond(ax, 5.0, 8.55, 4.0, 0.75, "Plate\nDetected?")
    arrow(ax, 7, 9.65, 7, 9.3)

    box(ax, 0.6, 8.55, 2.8, 0.65, "Log: NO PLATE\n→ Upload Event", C_OUT, ec="#C53030")
    arrow(ax, 5.0, 8.95, 3.4, 8.9, label="No", color="#C53030")

    box(ax, 4.0, 7.45, 6.0, 0.55, "Crop Plate Region (+4 px padding)", C_AI)
    arrow(ax, 7, 8.55, 7, 8.0, label="Yes")

    box(ax, 3.5, 6.55, 7.0, 0.75, "Run YOLOv8n Character/Digit Detection\nSort L→R → Format ABC-1234", C_AI)
    arrow(ax, 7, 7.45, 7, 7.3)

    box(ax, 4.0, 5.55, 6.0, 0.55, "Output: Plate Text + Vehicle Label\n(~700–1000 ms on Pi CPU)", C_AI, ec="#2B6CB0", bold=True)
    arrow(ax, 7, 6.55, 7, 6.1)

    # --- UPLOAD ---
    section_label(ax, 0.4, 5.05, "4. EDGE → CLOUD (gate_sync.py)")
    box(ax, 3.5, 4.35, 7.0, 0.6, "Build JSON + Annotated Image\nPOST → Vercel /api/gate/ingest", C_EDGE)
    arrow(ax, 7, 5.55, 7, 4.95)

    # --- AUTHORIZATION ---
    section_label(ax, 0.4, 3.85, "5. AUTHORIZATION & GATE CONTROL")
    _, _, _, dtop2 = diamond(ax, 4.8, 2.95, 4.4, 0.8, "Plate in\nDatabase?")
    arrow(ax, 7, 4.35, 7, 3.75)

    box(ax, 0.5, 2.95, 2.6, 0.7, "DENIED\nGate CLOSED\n(Unknown plate)", C_OUT, ec="#C53030")
    arrow(ax, 4.8, 3.35, 3.1, 3.3, label="No", color="#C53030")

    _, _, _, _ = diamond(ax, 5.2, 1.85, 3.6, 0.75, "Access\ntype?")
    arrow(ax, 7, 2.95, 7, 2.6, label="Yes")

    box(ax, 0.5, 1.75, 2.3, 0.65, "DENY →\nGate CLOSED", C_OUT, ec="#C53030")
    box(ax, 3.1, 1.75, 2.0, 0.65, "ALLOW +\nModel Match\n→ OPEN", C_OUT, ec="#276749")
    box(ax, 5.4, 1.75, 2.0, 0.65, "TEMP valid\n→ OPEN", C_OUT, ec="#276749")
    box(ax, 7.7, 1.75, 2.0, 0.65, "ALERT:\nPlate/Model\nMismatch", C_OUT, ec="#DD6B20")
    arrow(ax, 6.0, 1.85, 1.65, 2.05, label="deny")
    arrow(ax, 6.6, 1.85, 4.1, 2.05, label="allow")
    arrow(ax, 7.2, 1.85, 6.4, 2.05, label="temp")
    arrow(ax, 8.0, 1.85, 8.7, 2.05, label="mismatch")

    box(ax, 10.2, 1.75, 3.2, 0.65, "Optional GPIO/LED\nGate Status Signal", C_HW)

    # --- OUTPUT ---
    section_label(ax, 0.4, 1.25, "6. LOGGING & DASHBOARD")
    box(ax, 2.5, 0.45, 4.0, 0.6, "Vercel Live Feed\n(plate, model, weather, status)", C_OUT)
    box(ax, 7.5, 0.45, 4.0, 0.6, "Log Event\n(timestamp, confidence,\ngate_action opened/closed)", C_OUT)
    arrow(ax, 4.1, 1.75, 4.5, 1.05)
    arrow(ax, 9.5, 1.75, 9.5, 1.05)

    box(ax, 5.5, 0.45, 3.0, 0.55, "Loop if Running\n(webcam / batch)", C_INPUT)
    arrow(ax, 7, 0.45, 7, 12.55, color="#718096")
    ax.annotate(
        "",
        xy=(7, 12.55),
        xytext=(7, 0.45),
        arrowprops=dict(arrowstyle="-|>", color="#A0AEC0", linestyle="dashed", lw=1),
    )

    # Hardware note
    box(
        ax,
        10.2,
        12.25,
        3.5,
        1.15,
        "Hardware (Deployed)\n• Orange Pi 5 Pro (16 GB)\n• USB 1080p Camera\n• Wi-Fi → Vercel\n• 5V 5A PSU",
        C_HW,
        fontsize=7,
    )

    plt.tight_layout()
    fig.savefig(OUT, dpi=200, bbox_inches="tight", facecolor="white")
    print(f"Saved: {OUT}")


if __name__ == "__main__":
    main()
