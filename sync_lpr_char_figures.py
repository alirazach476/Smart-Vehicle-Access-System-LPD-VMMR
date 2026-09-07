# -*- coding: utf-8 -*-
"""Copy YOLO LPR character/OCR result PNGs from Cursor assets into figures/lpr_char/."""
from __future__ import annotations

import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parent
DEST = ROOT / "figures" / "lpr_char"

# Cursor workspaceStorage basenames -> stable LaTeX paths (order matches user upload list)
SRC_BY_DEST: list[tuple[str, str]] = [
    (
        "c__Users_xyz_AppData_Roaming_Cursor_User_workspaceStorage_3348dd7bfdcd6f0033c48f005b89dab9_images_download__4_-1c5ff164-2826-4577-9006-c57db777e5f4.png",
        "ocr_qual_islamabad.png",
    ),
    (
        "c__Users_xyz_AppData_Roaming_Cursor_User_workspaceStorage_3348dd7bfdcd6f0033c48f005b89dab9_images_download__6_-fca3fa61-91e3-4c7e-9a0c-7736391cb4c3.png",
        "ocr_qual_sindh_aja.png",
    ),
    (
        "c__Users_xyz_AppData_Roaming_Cursor_User_workspaceStorage_3348dd7bfdcd6f0033c48f005b89dab9_images_download__2_-d7d5c32c-b7d7-4d8d-98da-1eb8a54b1fa0.png",
        "ocr_qual_punjab_ler.png",
    ),
    (
        "c__Users_xyz_AppData_Roaming_Cursor_User_workspaceStorage_3348dd7bfdcd6f0033c48f005b89dab9_images_download__1_-bafceaf3-c0cd-4c7c-adb6-5e746c7d50c6.png",
        "ocr_qual_punjab_afr.png",
    ),
    (
        "c__Users_xyz_AppData_Roaming_Cursor_User_workspaceStorage_3348dd7bfdcd6f0033c48f005b89dab9_images_download__3_-26d25b4f-6ebe-431b-8113-4b467f59ad3d.png",
        "ocr_qual_sindh_afr021.png",
    ),
    (
        "c__Users_xyz_AppData_Roaming_Cursor_User_workspaceStorage_3348dd7bfdcd6f0033c48f005b89dab9_images_batch_results-8ec52b29-61fa-42d5-9380-e203903e01e4.png",
        "ocr_e2e_plate_grid.png",
    ),
    (
        "c__Users_xyz_AppData_Roaming_Cursor_User_workspaceStorage_3348dd7bfdcd6f0033c48f005b89dab9_images_BoxP_curve-616999fe-8c07-4d0b-9a61-679fee8c8b88.png",
        "ocr_boxP_curve.png",
    ),
    (
        "c__Users_xyz_AppData_Roaming_Cursor_User_workspaceStorage_3348dd7bfdcd6f0033c48f005b89dab9_images_BoxPR_curve-96210c48-4b10-4487-beae-762e33cc586e.png",
        "ocr_boxPR_curve.png",
    ),
    (
        "c__Users_xyz_AppData_Roaming_Cursor_User_workspaceStorage_3348dd7bfdcd6f0033c48f005b89dab9_images_BoxR_curve-c2ee5bb4-b0c9-4917-afb8-712f8c2e26aa.png",
        "ocr_boxR_curve.png",
    ),
    (
        "c__Users_xyz_AppData_Roaming_Cursor_User_workspaceStorage_3348dd7bfdcd6f0033c48f005b89dab9_images_confusion_matrix-a1409224-da14-4e33-84a3-409248b7edfc.png",
        "ocr_confusion_matrix.png",
    ),
    (
        "c__Users_xyz_AppData_Roaming_Cursor_User_workspaceStorage_3348dd7bfdcd6f0033c48f005b89dab9_images_labels-a38770d4-92d5-4aa1-92a7-4b5ba857d57e.png",
        "ocr_labels.png",
    ),
    (
        "c__Users_xyz_AppData_Roaming_Cursor_User_workspaceStorage_3348dd7bfdcd6f0033c48f005b89dab9_images_results-66cc2b14-123b-4541-8303-56488d07d4a5.png",
        "ocr_training_results.png",
    ),
    (
        "c__Users_xyz_AppData_Roaming_Cursor_User_workspaceStorage_3348dd7bfdcd6f0033c48f005b89dab9_images_val_batch1_labels-2790c7d3-0290-4888-b07e-f4f98b29d9f4.png",
        "ocr_val_batch_labels.png",
    ),
    (
        "c__Users_xyz_AppData_Roaming_Cursor_User_workspaceStorage_3348dd7bfdcd6f0033c48f005b89dab9_images_confusion_matrix_normalized-a2851021-2d06-4094-be3b-8af8fb90adcc.png",
        "ocr_confusion_normalized.png",
    ),
    (
        "c__Users_xyz_AppData_Roaming_Cursor_User_workspaceStorage_3348dd7bfdcd6f0033c48f005b89dab9_images_BoxF1_curve-cd1f24c9-8040-4283-9622-190cf8e8b815.png",
        "ocr_boxF1_curve.png",
    ),
    (
        "c__Users_DELL_AppData_Roaming_Cursor_User_workspaceStorage_0c384fc7916fedb83627575cd40f1fd4_images_download-ac1d0554-f855-499b-a4d2-4c5d96822666.png",
        "ocr_metrics_heatmap.png",
    ),
]


def candidate_roots() -> list[Path]:
    return [
        ROOT / "assets",
        Path(r"C:\Users\xyz\.cursor\projects\d-fyp-FYP-COMPLETE\assets"),
    ]


def main() -> None:
    DEST.mkdir(parents=True, exist_ok=True)
    copied = 0
    for src_name, dest_name in SRC_BY_DEST:
        dest = DEST / dest_name
        found: Path | None = None
        for r in candidate_roots():
            p = r / src_name
            if p.is_file():
                found = p
                break
        if found is None:
            for p in ROOT.rglob(src_name):
                if p.is_file():
                    found = p
                    break
        if found is None:
            print("SKIP (not found):", src_name)
            continue
        shutil.copy2(found, dest)
        copied += 1
        print("OK", dest_name)
    print("Copied", copied, "of", len(SRC_BY_DEST), "into", DEST)


if __name__ == "__main__":
    main()
