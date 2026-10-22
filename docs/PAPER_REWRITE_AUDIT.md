# FYP → Research Paper Rewrite Audit

Source of truth: `Report FYP 2026_signed.pdf` (107 pages)  
Rewritten paper: `research_paper.tex`  
Backup of previous paper: `research_paper_before_fyp_rewrite.tex`  
Bibliography: `references.bib` (verified foundational sources only)

## Canonical metrics used in the rewrite (from FYP Ch.5–6)

| Module | Metric | Value |
|--------|--------|-------|
| LPD YOLOv8n (50 ep) | Precision / Recall / mAP@0.5 | 98.50% / 95.53% / 98.07% |
| Char YOLOv8n (100 ep) | mAP@0.5 / P / R / F1 | 97.7% / 99.0% / 94.2% / 96.5% (mirrored val) |
| VMMR EfficientNet-B4 | Top-1 / Top-5 / macro F1 | 96.24% / 99.39% / 96.18% |
| Edge latency | E2E on Orange Pi CPU | ~700–1000 ms |

## Contradictions resolved

1. Character mAP: Abstract 98.07% → **use 97.7%** (Ch.6) + mirrored-validation caveat  
2. VMMR backbone: Objectives B0 → **use B4** (implementation/results)  
3. Detector family: Intro “YOLOv3” → **use YOLOv8n**  
4. Authors: paper had 2 → **all 3** (Abdul Hadi, Ali Raza Chaudhry, Abdullah Yaseen)  
5. FYP bibliography [1]–[9]: several venues/pages unverifiable → **replaced with verified citations**; Table 5.15 competitor numbers flagged **[INFORMATION REQUIRED]**

## Still marked / incomplete in figures

- FYP integrated overlay figures 5.25–5.27 are not all present as separate named assets under `figures/`; paper uses available `figures/pre/*` and qualitative LPD/OCR/VMMR assets instead.
- Exact LPD Table 5.3 hyperparameter cells were image-only in PDF OCR; training notebook confirms epochs=50, batch=32, imgsz=380→384.
