# -*- coding: utf-8 -*-
"""Copy VMMR result PNGs from Cursor assets into figures/vmmr/ with stable names."""
from __future__ import annotations

import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parent
DEST = ROOT / "figures" / "vmmr"

# Basenames as saved by Cursor (order preserved from user attachment list)
SRC_NAMES = [
    "c__Users_xyz_AppData_Roaming_Cursor_User_workspaceStorage_3348dd7bfdcd6f0033c48f005b89dab9_images_download__1_-081d5420-0208-4ab6-bda5-c0fc7f80cbc2.png",
    "c__Users_xyz_AppData_Roaming_Cursor_User_workspaceStorage_3348dd7bfdcd6f0033c48f005b89dab9_images_download__4_-4741fa55-a862-4682-b4b5-6a2e2442d13e.png",
    "c__Users_xyz_AppData_Roaming_Cursor_User_workspaceStorage_3348dd7bfdcd6f0033c48f005b89dab9_images_download__5_-4ef7e2bb-5fdb-440b-9d18-7b00428e0566.png",
    "c__Users_xyz_AppData_Roaming_Cursor_User_workspaceStorage_3348dd7bfdcd6f0033c48f005b89dab9_images_download__8_-1395bf73-2151-48dd-9d0d-800b0fa960f8.png",
    "c__Users_xyz_AppData_Roaming_Cursor_User_workspaceStorage_3348dd7bfdcd6f0033c48f005b89dab9_images_download__9_-30aba84e-8210-4da7-a424-0e47eab89122.png",
    "c__Users_xyz_AppData_Roaming_Cursor_User_workspaceStorage_3348dd7bfdcd6f0033c48f005b89dab9_images_download__10_-d4c25d64-d2a2-411f-952f-c5144fadb6fb.png",
    "c__Users_xyz_AppData_Roaming_Cursor_User_workspaceStorage_3348dd7bfdcd6f0033c48f005b89dab9_images_download__11_-e7f98718-547e-4c40-be67-85c405255b76.png",
    "c__Users_xyz_AppData_Roaming_Cursor_User_workspaceStorage_3348dd7bfdcd6f0033c48f005b89dab9_images_download__12_-e6d56e4a-5764-4767-abbb-c88bcceaacc6.png",
    "c__Users_xyz_AppData_Roaming_Cursor_User_workspaceStorage_3348dd7bfdcd6f0033c48f005b89dab9_images_download__14_-57d0657e-5b23-4084-b1ae-333b5ed8036c.png",
    "c__Users_xyz_AppData_Roaming_Cursor_User_workspaceStorage_3348dd7bfdcd6f0033c48f005b89dab9_images_download__15_-46bafc91-44a0-4f2b-83f0-0c969407b26d.png",
    "c__Users_xyz_AppData_Roaming_Cursor_User_workspaceStorage_3348dd7bfdcd6f0033c48f005b89dab9_images_download__16_-a442db4f-ae45-41a9-84d3-3e01d6c6ff0f.png",
    "c__Users_xyz_AppData_Roaming_Cursor_User_workspaceStorage_3348dd7bfdcd6f0033c48f005b89dab9_images_download__19_-0fab0d3d-91f0-4968-8ec6-6c9b07a3532c.png",
    "c__Users_xyz_AppData_Roaming_Cursor_User_workspaceStorage_3348dd7bfdcd6f0033c48f005b89dab9_images_download__21_-cf8a356d-e86d-443d-b504-8be6ed0c3407.png",
    "c__Users_xyz_AppData_Roaming_Cursor_User_workspaceStorage_3348dd7bfdcd6f0033c48f005b89dab9_images_download__23_-701d7afc-b8ef-46e2-86ef-00af09728514.png",
    "c__Users_xyz_AppData_Roaming_Cursor_User_workspaceStorage_3348dd7bfdcd6f0033c48f005b89dab9_images_download__24_-e69dde5b-5140-4c61-8034-0f878872f68f.png",
    "c__Users_xyz_AppData_Roaming_Cursor_User_workspaceStorage_3348dd7bfdcd6f0033c48f005b89dab9_images_download__25_-4464e043-dd2a-4e07-93eb-ae7f80f39565.png",
    "c__Users_xyz_AppData_Roaming_Cursor_User_workspaceStorage_3348dd7bfdcd6f0033c48f005b89dab9_images_download__26_-4f609bdb-cfaa-4945-bdcd-47ddfd23ffab.png",
    "c__Users_xyz_AppData_Roaming_Cursor_User_workspaceStorage_3348dd7bfdcd6f0033c48f005b89dab9_images_download__28_-72c17d87-0b9e-4530-b707-bb74b4631e1b.png",
    "c__Users_xyz_AppData_Roaming_Cursor_User_workspaceStorage_3348dd7bfdcd6f0033c48f005b89dab9_images_download__27_-2cd7ea53-f349-4f3a-8d22-644a0b9e4559.png",
    "c__Users_xyz_AppData_Roaming_Cursor_User_workspaceStorage_3348dd7bfdcd6f0033c48f005b89dab9_images_download__29_-cc66bc90-2368-4e16-aedb-4b224a1771a3.png",
    "c__Users_xyz_AppData_Roaming_Cursor_User_workspaceStorage_3348dd7bfdcd6f0033c48f005b89dab9_images_download__30_-0116ac68-a87c-43f4-bdd2-75a2bde3e3f0.png",
    "c__Users_xyz_AppData_Roaming_Cursor_User_workspaceStorage_3348dd7bfdcd6f0033c48f005b89dab9_images_download-68ad1c66-1e61-4469-aaee-48d737c47d89.png",
    "c__Users_xyz_AppData_Roaming_Cursor_User_workspaceStorage_3348dd7bfdcd6f0033c48f005b89dab9_images_download__31_-1b147ff4-b3f7-45e1-8d54-34cc2eefaa10.png",
    "c__Users_xyz_AppData_Roaming_Cursor_User_workspaceStorage_3348dd7bfdcd6f0033c48f005b89dab9_images_download__3_-4b015ba9-2928-4a4d-a76a-2276c8fc88f4.png",
    "c__Users_xyz_AppData_Roaming_Cursor_User_workspaceStorage_3348dd7bfdcd6f0033c48f005b89dab9_images_download__2_-e1ee4f27-12f0-4799-b965-80162ce87be3.png",
    "c__Users_xyz_AppData_Roaming_Cursor_User_workspaceStorage_3348dd7bfdcd6f0033c48f005b89dab9_images_download__6_-7447e6e3-109c-47cb-ac9a-9a8d619f4c46.png",
    "c__Users_xyz_AppData_Roaming_Cursor_User_workspaceStorage_3348dd7bfdcd6f0033c48f005b89dab9_images_download__20_-aa40d744-897b-4429-b8ec-010952ac6334.png",
    "c__Users_xyz_AppData_Roaming_Cursor_User_workspaceStorage_3348dd7bfdcd6f0033c48f005b89dab9_images_download__17_-3637cffc-4f7b-487d-b668-7f7a5d65cfbe.png",
    "c__Users_xyz_AppData_Roaming_Cursor_User_workspaceStorage_3348dd7bfdcd6f0033c48f005b89dab9_images_download__13_-a84f6318-2e53-4c6e-91f5-39ed316e338d.png",
    "c__Users_xyz_AppData_Roaming_Cursor_User_workspaceStorage_3348dd7bfdcd6f0033c48f005b89dab9_images_download__22_-e41c8a3a-efc9-4318-ac80-c4e492baa578.png",
    "c__Users_xyz_AppData_Roaming_Cursor_User_workspaceStorage_3348dd7bfdcd6f0033c48f005b89dab9_images_download__18_-6af09f4c-be6b-49e1-be64-20b7b52ccbb6.png",
]


def roots() -> list[Path]:
    return [
        ROOT / "assets",
        Path(r"C:\Users\xyz\.cursor\projects\d-fyp-FYP-COMPLETE\assets"),
    ]


def main() -> None:
    DEST.mkdir(parents=True, exist_ok=True)
    copied = 0
    for i, name in enumerate(SRC_NAMES, start=1):
        dest = DEST / f"vmmr_{i:02d}.png"
        found: Path | None = None
        for r in roots():
            p = r / name
            if p.is_file():
                found = p
                break
        if found is None:
            for p in ROOT.rglob(name):
                if p.is_file():
                    found = p
                    break
        if found is None:
            print("SKIP", name)
            continue
        shutil.copy2(found, dest)
        copied += 1
        print("OK", dest.name)
    print("Copied", copied, "of", len(SRC_NAMES), "to", DEST)


if __name__ == "__main__":
    main()
