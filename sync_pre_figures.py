# -*- coding: utf-8 -*-
"""Copy integrated preprocessing + pipeline result PNGs into figures/pre/."""
from __future__ import annotations

import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parent
DEST = ROOT / "figures" / "pre"

SRC_BY_DEST: list[tuple[str, str]] = [
    (
        "c__Users_xyz_AppData_Roaming_Cursor_User_workspaceStorage_3348dd7bfdcd6f0033c48f005b89dab9_images_grid_foggy__2_-162ac756-7506-427a-907a-d56fcb66a0ab.png",
        "pre_input_foggy.png",
    ),
    (
        "c__Users_xyz_AppData_Roaming_Cursor_User_workspaceStorage_3348dd7bfdcd6f0033c48f005b89dab9_images_night-00f801c6-730e-468b-8d30-edde4fb1e412.png",
        "pre_input_night.png",
    ),
    (
        "c__Users_xyz_AppData_Roaming_Cursor_User_workspaceStorage_3348dd7bfdcd6f0033c48f005b89dab9_images_grid_rainy-edf7499b-9715-422d-8e88-58976d143f3f.png",
        "pre_input_rainy.png",
    ),
    (
        "c__Users_DELL_AppData_Roaming_Cursor_User_workspaceStorage_0c384fc7916fedb83627575cd40f1fd4_images_defog_pipeline-34e1fbef-ad94-4c60-9547-906a9af351e7.png",
        "pre_pipeline_defog.png",
    ),
    (
        "c__Users_DELL_AppData_Roaming_Cursor_User_workspaceStorage_0c384fc7916fedb83627575cd40f1fd4_images_denight-7803cb12-fe0a-4861-887a-3164c4356cb3.png",
        "pre_pipeline_night.png",
    ),
    (
        "c__Users_DELL_AppData_Roaming_Cursor_User_workspaceStorage_0c384fc7916fedb83627575cd40f1fd4_images_rain_pipeline-8514b12e-ead3-45ac-8f7c-fa7e4a077dc4.png",
        "pre_pipeline_rain.png",
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
            print("SKIP (not found):", src_name[:60], "...")
            continue
        shutil.copy2(found, dest)
        copied += 1
        print("OK", dest_name)
    print("Copied", copied, "of", len(SRC_BY_DEST), "into", DEST)


if __name__ == "__main__":
    main()
