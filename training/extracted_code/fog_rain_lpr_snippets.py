# Extracted from pipeline/pipeline.ipynb (project: FYP COMPLETE)
# Fog / haze mitigation + rain removal + plate format helper

import cv2
import numpy as np
from PIL import Image


def _dark_channel(img, patch=13):
    mc = np.min(img, axis=2)
    kern = cv2.getStructuringElement(cv2.MORPH_RECT, (patch, patch))
    return cv2.erode(mc, kern)


def _atmospheric_light(img, dark):
    h, w = dark.shape
    n = max(int(h * w * 0.001), 1)
    idx = np.argsort(dark.ravel())[-n:]
    return np.max(img.reshape(-1, 3)[idx], axis=0).astype(np.float64)


def _guided_filter(guide, src, r=50, eps=1e-3):
    g = guide.astype(np.float64) / 255.0
    s = src.astype(np.float64)
    k = (r, r)
    mI = cv2.boxFilter(g, -1, k)
    mp = cv2.boxFilter(s, -1, k)
    cIp = cv2.boxFilter(g * s, -1, k)
    cII = cv2.boxFilter(g * g, -1, k)
    a = (cIp - mI * mp) / (cII - mI * mI + eps)
    b = mp - a * mI
    return cv2.boxFilter(a, -1, k) * g + cv2.boxFilter(b, -1, k)


def _dehaze_dcp(img_bgr):
    f = img_bgr.astype(np.float64)
    dk = _dark_channel(f)
    A = _atmospheric_light(f, dk)
    t = 1.0 - 0.95 * _dark_channel(f / (A + 1e-6))
    t = _guided_filter(cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY), t)
    t = np.clip(t, 0.1, 1.0)
    out = np.empty_like(f)
    for c in range(3):
        out[:, :, c] = (f[:, :, c] - A[c]) / t + A[c]
    return np.clip(out, 0, 255).astype(np.uint8)


def _remove_residual(img_bgr):
    f = img_bgr.astype(np.float64)
    g = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY).astype(np.float64)
    lm = cv2.blur(g, (31, 31))
    var = cv2.blur((g - lm) ** 2, (31, 31))
    ls = np.sqrt(np.maximum(var, 0))
    mask = ((lm > 170) & (ls < 30)).astype(np.float64)
    mask = cv2.GaussianBlur(mask, (21, 21), 0)
    if mask.max() < 0.01:
        return img_bgr
    dk = _dark_channel(f, 19)
    A = _atmospheric_light(f, dk)
    t = 1.0 - 0.85 * _dark_channel(f / (A + 1e-6), 19)
    t = _guided_filter(cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY), t, r=60)
    t = np.clip(t, 0.15, 1.0)
    cl = np.empty_like(f)
    for c in range(3):
        cl[:, :, c] = (f[:, :, c] - A[c]) / t + A[c]
    cl = np.clip(cl, 0, 255)
    out = f * (1 - mask[:, :, None]) + cl * mask[:, :, None]
    return np.clip(out, 0, 255).astype(np.uint8)


def defog_image(pil_img):
    bgr = cv2.cvtColor(np.array(pil_img), cv2.COLOR_RGB2BGR)
    bgr = _dehaze_dcp(bgr)
    bgr = _remove_residual(bgr)
    f = bgr.astype(np.float64)
    avgs = [f[:, :, c].mean() for c in range(3)]
    ga = sum(avgs) / 3.0
    for c in range(3):
        f[:, :, c] *= ga / (avgs[c] + 1e-6)
    bgr = np.clip(f, 0, 255).astype(np.uint8)
    gray = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY)
    mu = gray.mean()
    if mu > 5:
        gamma = np.log(125 / 255) / np.log(mu / 255 + 1e-6)
        gamma = np.clip(gamma, 0.6, 1.8)
        lut = np.array([((i / 255) ** gamma) * 255 for i in range(256)], dtype=np.uint8)
        bgr = cv2.LUT(bgr, lut)
    lab = cv2.cvtColor(bgr, cv2.COLOR_BGR2LAB)
    l, a, b = cv2.split(lab)
    l = cv2.createCLAHE(clipLimit=2.5, tileGridSize=(8, 8)).apply(l)
    bgr = cv2.cvtColor(cv2.merge([l, a, b]), cv2.COLOR_LAB2BGR)
    hsv = cv2.cvtColor(bgr, cv2.COLOR_BGR2HSV).astype(np.float64)
    hsv[:, :, 1] = np.clip(hsv[:, :, 1] * 1.2, 0, 255)
    bgr = cv2.cvtColor(hsv.astype(np.uint8), cv2.COLOR_HSV2BGR)
    bgr = cv2.bilateralFilter(bgr, 5, 40, 40)
    bl = cv2.GaussianBlur(bgr, (0, 0), 2.0)
    bgr = cv2.addWeighted(bgr, 1.4, bl, -0.4, 0)
    return Image.fromarray(cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB))


def _vertical_median_filter(image, ksize):
    h, w = image.shape[:2]
    pad = ksize // 2
    if image.ndim == 3:
        padded = np.pad(image, ((pad, pad), (0, 0), (0, 0)), mode="reflect")
        stack = np.stack([padded[i : i + h] for i in range(ksize)], axis=0)
        return np.median(stack, axis=0).astype(np.uint8)
    padded = np.pad(image, ((pad, pad), (0, 0)), mode="reflect")
    stack = np.stack([padded[i : i + h] for i in range(ksize)], axis=0)
    return np.median(stack, axis=0).astype(np.uint8)


def _build_rain_protection(image):
    smoothed = cv2.bilateralFilter(image, 9, 75, 75)
    gray = cv2.cvtColor(smoothed, cv2.COLOR_BGR2GRAY)
    edges = cv2.Canny(gray, 50, 150)
    density = cv2.blur(edges.astype(np.float32), (25, 25))
    _, mask = cv2.threshold(density, 15.0, 255, cv2.THRESH_BINARY)
    mask = mask.astype(np.uint8)
    mask = cv2.dilate(mask, np.ones((11, 11), np.uint8), iterations=1)
    return mask


def _blend_rain(original, filtered, protect_f):
    use = (1.0 - protect_f).copy()
    bright = np.mean(filtered.astype(np.float64) - original.astype(np.float64), axis=2)
    use[bright > 2.0] = 0.0
    result = original.astype(np.float64) * (1.0 - use[:, :, None]) + filtered.astype(np.float64) * use[:, :, None]
    return np.clip(result, 0, 255).astype(np.uint8)


def derain_image(pil_img):
    bgr = cv2.cvtColor(np.array(pil_img), cv2.COLOR_RGB2BGR)
    protect = _build_rain_protection(bgr)
    protect_f = cv2.GaussianBlur(protect.astype(np.float64), (11, 11), 3.0) / 255.0
    for ksize in (15, 11, 7):
        vmed = _vertical_median_filter(bgr, ksize=ksize)
        bgr = _blend_rain(bgr, vmed, protect_f)
    gray = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY).astype(np.float64)
    local_mean = cv2.blur(gray, (15, 15))
    diff = gray - local_mean
    _, spots = cv2.threshold(np.clip(diff, 0, 255).astype(np.uint8), 12, 255, cv2.THRESH_BINARY)
    contours, _ = cv2.findContours(spots, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    spot_mask = np.zeros_like(spots)
    for cnt in contours:
        area = cv2.contourArea(cnt)
        if 2 < area < 250:
            cv2.drawContours(spot_mask, [cnt], -1, 255, -1)
    spot_mask[protect > 0] = 0
    spot_mask = cv2.dilate(spot_mask, np.ones((3, 3), np.uint8), iterations=1)
    if np.any(spot_mask > 0):
        bgr = cv2.inpaint(bgr, spot_mask, inpaintRadius=3, flags=cv2.INPAINT_TELEA)
    return Image.fromarray(cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB))


def fix_license_plate_format(detections):
    LETTERS = set("ABCDEFGHIJKLMNOPQRSTUVWXYZ")
    DIGITS = set("0123456789")
    letters, digits = [], []
    for c, x in detections:
        c = str(c).strip().upper()
        if c in LETTERS:
            letters.append((c, x))
        elif c in DIGITS:
            digits.append((c, x))
    letters.sort(key=lambda t: t[1])
    digits.sort(key=lambda t: t[1])
    letters_str = "".join(c for c, _ in letters[:3])
    digits_str = "".join(c for c, _ in digits[-4:])
    if not letters_str and not digits_str:
        return "NO_TEXT"
    if not digits_str:
        return letters_str
    if not letters_str:
        return digits_str
    return letters_str + "-" + digits_str
