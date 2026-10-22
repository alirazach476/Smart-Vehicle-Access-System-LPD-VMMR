# -*- coding: utf-8 -*-
"""Copy user-provided LPD result PNGs into figures/lpd/ with stable names for LaTeX."""
from __future__ import annotations

import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parent
DEST_DIR = ROOT / "figures" / "lpd"

# Cursor workspaceStorage filenames (as attached in chat), in display order 1..15
SRC_BY_DEST: list[tuple[str, str]] = [
    (
        "c__Users_xyz_AppData_Roaming_Cursor_User_workspaceStorage_3348dd7bfdcd6f0033c48f005b89dab9_images_download__1_-6c52068a-bd50-41d9-a999-f3481dff3151.png",
        "lpd_pred_clear_corolla.png",
    ),
    (
        "c__Users_xyz_AppData_Roaming_Cursor_User_workspaceStorage_3348dd7bfdcd6f0033c48f005b89dab9_images_download__2_-c111b132-fac9-4936-8582-0dfceb530049.png",
        "lpd_pred_clear_mehran.png",
    ),
    (
        "c__Users_xyz_AppData_Roaming_Cursor_User_workspaceStorage_3348dd7bfdcd6f0033c48f005b89dab9_images_download__7_-50a96403-23b6-4e09-a6f5-55990323fd9d.png",
        "lpd_pred_rain_night.png",
    ),
    (
        "c__Users_xyz_AppData_Roaming_Cursor_User_workspaceStorage_3348dd7bfdcd6f0033c48f005b89dab9_images_download__9_-309248fb-976d-4b7f-9da1-992de6235c0f.png",
        "lpd_pred_parking_dual.png",
    ),
    (
        "c__Users_xyz_AppData_Roaming_Cursor_User_workspaceStorage_3348dd7bfdcd6f0033c48f005b89dab9_images_download-c59e0a1a-5cc7-4d5b-9de8-43caa106a21d.png",
        "lpd_metrics_heatmap.png",
    ),
    (
        "c__Users_xyz_AppData_Roaming_Cursor_User_workspaceStorage_3348dd7bfdcd6f0033c48f005b89dab9_images_download__11_-2903698a-9554-47a0-b364-fcd13f230ff5.png",
        "lpd_pred_highway_dual.png",
    ),
    (
        "c__Users_xyz_AppData_Roaming_Cursor_User_workspaceStorage_3348dd7bfdcd6f0033c48f005b89dab9_images_val_batch2_labels-ab764daa-bb49-4895-a912-07eb21d4e042.png",
        "lpd_val_batch_labels.png",
    ),
    (
        "c__Users_xyz_AppData_Roaming_Cursor_User_workspaceStorage_3348dd7bfdcd6f0033c48f005b89dab9_images_labels-dcc8eac2-736c-46f8-b10a-33fc092567b4.png",
        "lpd_dataset_labels.png",
    ),
    (
        "c__Users_xyz_AppData_Roaming_Cursor_User_workspaceStorage_3348dd7bfdcd6f0033c48f005b89dab9_images_results-a07d514a-66b2-4015-82cb-2de7a2c8b602.png",
        "lpd_training_results.png",
    ),
    (
        "c__Users_xyz_AppData_Roaming_Cursor_User_workspaceStorage_3348dd7bfdcd6f0033c48f005b89dab9_images_BoxF1_curve-a4c1a1c1-7fa5-4fa6-bff3-02fe477405a9.png",
        "lpd_curve_f1.png",
    ),
    (
        "c__Users_xyz_AppData_Roaming_Cursor_User_workspaceStorage_3348dd7bfdcd6f0033c48f005b89dab9_images_BoxP_curve-616ba751-6549-4b36-b4a4-86a4cc0bd545.png",
        "lpd_curve_precision.png",
    ),
    (
        "c__Users_xyz_AppData_Roaming_Cursor_User_workspaceStorage_3348dd7bfdcd6f0033c48f005b89dab9_images_confusion_matrix-0257bc3c-876a-4ba1-921b-79d9fc0e4273.png",
        "lpd_confusion_matrix.png",
    ),
    (
        "c__Users_xyz_AppData_Roaming_Cursor_User_workspaceStorage_3348dd7bfdcd6f0033c48f005b89dab9_images_BoxR_curve-335bb93e-4288-4573-ab17-6cd4c700b1e0.png",
        "lpd_curve_recall.png",
    ),
    (
        "c__Users_xyz_AppData_Roaming_Cursor_User_workspaceStorage_3348dd7bfdcd6f0033c48f005b89dab9_images_BoxPR_curve-9e0f3e2f-c7ab-4524-84cf-7f953cbd774a.png",
        "lpd_curve_pr.png",
    ),
    (
        "c__Users_xyz_AppData_Roaming_Cursor_User_workspaceStorage_3348dd7bfdcd6f0033c48f005b89dab9_images_confusion_matrix_normalized-f87d9194-87fd-4547-9a61-5d7f77842acb.png",
        "lpd_confusion_normalized.png",
    ),
]


def candidate_roots() -> list[Path]:
    return [
        ROOT / "assets",
        Path(r"C:\Users\xyz\.cursor\projects\d-fyp-FYP-COMPLETE\assets"),
        Path(r"C:\Users\xyz\.cursor\projects\d-fyp-FYP-COMPLETE\assets".replace("d-fyp-FYP-COMPLETE", "d-fyp-FYP-COMPLETE")),
    ]


def main() -> None:
    DEST_DIR.mkdir(parents=True, exist_ok=True)
    roots = candidate_roots()
    copied = 0
    for src_name, dest_name in SRC_BY_DEST:
        dest = DEST_DIR / dest_name
        found: Path | None = None
        for r in roots:
            p = r / src_name
            if p.is_file():
                found = p
                break
        if found is None:
            # try basename-only search under ROOT
            for p in ROOT.rglob(src_name):
                if p.is_file():
                    found = p
                    break
        if found is None:
            print("SKIP (not found):", src_name, "->", dest_name)
            continue
        shutil.copy2(found, dest)
        copied += 1
        print("OK", dest_name)
    print("Copied", copied, "of", len(SRC_BY_DEST), "into", DEST_DIR)


if __name__ == "__main__":
    main()
