"""Create a simple 4-slide hardware PPTX for FYP presentation."""
from pathlib import Path

from pptx import Presentation
from pptx.dml.color import RGBColor
from pptx.enum.text import MSO_ANCHOR, PP_ALIGN
from pptx.util import Inches, Pt

OUT = Path(r"c:\Users\DELL\Downloads\FYP COMPLETE\FYP COMPLETE\FYP_Hardware_Slides.pptx")

NAVY = RGBColor(0x1E, 0x3A, 0x5F)
BLUE = RGBColor(0x2C, 0x52, 0x82)
DARK = RGBColor(0x1A, 0x1A, 0x1A)
GRAY = RGBColor(0x4A, 0x55, 0x68)
WHITE = RGBColor(0xFF, 0xFF, 0xFF)
ACCENT = RGBColor(0xFF, 0x66, 0x00)


def set_run(run, size=18, bold=False, color=DARK, name="Calibri"):
    run.font.name = name
    run.font.size = Pt(size)
    run.font.bold = bold
    run.font.color.rgb = color


def add_title(slide, title, subtitle=None):
    box = slide.shapes.add_textbox(Inches(0.5), Inches(0.35), Inches(12.3), Inches(0.9))
    tf = box.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    r = p.add_run()
    r.text = title
    set_run(r, 28, True, NAVY)
    if subtitle:
        p2 = tf.add_paragraph()
        r2 = p2.add_run()
        r2.text = subtitle
        set_run(r2, 14, False, GRAY)


def add_bullets(slide, lines, top=1.35, width=12.3, size=16, bold_first=False):
    box = slide.shapes.add_textbox(Inches(0.55), Inches(top), Inches(width), Inches(5.8))
    tf = box.text_frame
    tf.word_wrap = True
    tf.vertical_anchor = MSO_ANCHOR.TOP
    for i, line in enumerate(lines):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.level = 0
        p.space_after = Pt(6)
        r = p.add_run()
        r.text = line
        is_bold = bold_first and i == 0
        set_run(r, size, is_bold, DARK if not is_bold else BLUE)


def add_table_slide(slide, headers, rows, top=1.4):
    cols = len(headers)
    table_shape = slide.shapes.add_table(
        len(rows) + 1, cols, Inches(0.55), Inches(top), Inches(12.3), Inches(0.45 * (len(rows) + 2))
    )
    table = table_shape.table
    for c, h in enumerate(headers):
        cell = table.cell(0, c)
        cell.text = h
        for p in cell.text_frame.paragraphs:
            for r in p.runs:
                set_run(r, 11, True, WHITE)
        cell.fill.solid()
        cell.fill.fore_color.rgb = BLUE
    for ri, row in enumerate(rows, start=1):
        for ci, val in enumerate(row):
            cell = table.cell(ri, ci)
            cell.text = val
            for p in cell.text_frame.paragraphs:
                for r in p.runs:
                    set_run(r, 10, False, DARK)


def build():
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank = prs.slide_layouts[6]

    # Slide 1
    s1 = prs.slides.add_slide(blank)
    add_title(s1, "Hardware Architecture — Edge Device Setup", "Orange Pi 5 Pro + USB Camera + Supporting Peripherals")
    add_table_slide(
        s1,
        ["Device", "Role"],
        [
            ["Orange Pi 5 Pro (16 GB)", "Runs Python, OpenCV, PyTorch, and all 3 AI models locally"],
            ["USB camera (1080p)", "Captures vehicle and license plate at the gate"],
            ["5V 5A USB-C power supply", "Powers Pi under full AI load (weak PSU causes shutdown)"],
            ["HDMI monitor + keyboard", "Setup, testing, and live preview on Pi"],
            ["Wi-Fi (onboard)", "Network connectivity for the edge device"],
            ["LED / GPIO (optional)", "Physical gate open/close indicator"],
            ["Windows laptop", "Record photos/videos; transfer files to Pi via SCP or USB"],
        ],
        top=1.25,
    )
    add_bullets(
        s1,
        ["Design choice: All AI inference runs on Orange Pi (edge AI) — processing stays on device, not in cloud."],
        top=5.55,
        size=14,
        bold_first=True,
    )

    # Slide 2
    s2 = prs.slides.add_slide(blank)
    add_title(s2, "Hardware Connections & Camera Setup", "How components are wired and configured on the Pi")
    add_bullets(
        s2,
        [
            "Camera placement:",
            "• Live demo on Pi: USB camera → Orange Pi USB port",
            "• Record first, process later: USB camera → laptop → copy to Pi → batch run",
            "",
            "Physical layout:",
            "USB Camera → Orange Pi 5 Pro → HDMI → Monitor",
            "Orange Pi ← 5V 5A USB-C PSU | optional GPIO → LED / gate relay",
            "",
            "First-time Pi setup:",
            "1. Copy orange_pi_deploy/ to Pi",
            "2. Run setup_orangepi.sh (15–30 min)",
            "3. python download_models.py (~207 MB)",
            "4. python test_models.py",
            "5. Enable NTP for correct timestamps",
            "",
            "Preprocessing rule (one line):",
            "Use --preprocess none for clear daylight; --preprocess auto detects weather and runs the matching filter; or force fog/rain/night with --preprocess fog, rain, or night.",
        ],
        top=1.2,
        size=13,
    )

    # Slide 3
    s3 = prs.slides.add_slide(blank)
    add_title(s3, "Edge AI Processing on Orange Pi", "Three models + weather-aware preprocessing before detection")
    add_table_slide(
        s3,
        ["Model", "File", "Job"],
        [
            ["YOLOv8n Plate Detector", "plate_best.pt", "Find plate bounding box"],
            ["YOLOv8n Character OCR", "char_best.pt", "Read plate → ABC-1234"],
            ["EfficientNet-B4 VMMR", "efficientnet_b4_best.pth", "245 vehicle classes"],
        ],
        top=1.15,
    )
    add_table_slide(
        s3,
        ["Flag", "When to use", "Filter applied"],
        [
            ["--preprocess none", "Clear / normal daylight", "None (image unchanged)"],
            ["--preprocess auto", "Unknown weather — Pi detects", "Clear→none | Fog→defog | Rain→derain | Night→enhance"],
            ["--preprocess fog", "Foggy / hazy images", "Defog (Dark Channel Prior)"],
            ["--preprocess rain", "Rainy images", "Derain (vertical median + inpaint)"],
            ["--preprocess night", "Low-light / night images", "Night enhance (CLAHE + gamma)"],
        ],
        top=2.55,
    )
    add_bullets(
        s3,
        [
            "Pipeline: Load image → weather preprocess → vehicle classify → plate detect → character OCR → annotated output",
            "Speed on Pi CPU: ~700–1000 ms/image (plate 80–200 ms | OCR 30–100 ms | VMMR 200–800 ms)",
        ],
        top=5.35,
        size=12,
    )

    # Slide 4
    s4 = prs.slides.add_slide(blank)
    add_title(s4, "Hardware Demo, Limits & Troubleshooting", "Local commands and operational constraints on Pi")
    add_bullets(
        s4,
        [
            "Local demo commands:",
            "cd ~/orange_pi_deploy && source venv/bin/activate",
            "python run_webcam.py --camera 0 --preprocess none      # clear daylight",
            "python run_webcam.py --camera 0 --preprocess auto      # auto-detect weather",
            "python run_images.py recordings/fog/ --preprocess fog",
            "python run_images.py recordings/rain/ --preprocess rain",
            "python run_images.py recordings/night/ --preprocess night",
            "",
            "Hardware limits:",
            "• ~1 image/second on CPU (not 30 FPS)",
            "• AI works fully offline on Pi",
            "• Weak PSU causes shutdown — use 5V 5A",
            "• False Fog on clear photos → use --preprocess none",
            "",
            "Fixes: 5V 5A PSU | try --camera 1 | enable NTP | fix Windows line endings ($'\\r')",
            "Future: GPIO relay board for physical gate motor control",
        ],
        top=1.15,
        size=12,
    )

    prs.save(str(OUT))
    print(f"Created: {OUT}")


if __name__ == "__main__":
    build()
