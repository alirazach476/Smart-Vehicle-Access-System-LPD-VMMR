# -*- coding: utf-8 -*-
from pathlib import Path

ROOT = Path(r"c:\Users\DELL\Downloads\FYP COMPLETE\FYP COMPLETE")
out = ROOT / "research_paper.tex"

FIGURES = [
    ("system_overview_diagram.png",
     "Overall system architecture of the Automatic Vehicle Gate Access System: camera capture, weather-aware preprocessing, YOLOv8n LPR, EfficientNet-B4 VMMR, dual-modality authorization, and Vercel dashboard sync.",
     "fig:sys_overview"),
    ("system_block_diagram_updated.png",
     "Updated high-level block diagram of the complete FYP pipeline, from Orange Pi model loading through weather branches, AI inference, authorization, and cloud upload.",
     "fig:sys_block"),
    ("model_architecture_diagram.png",
     "Recognition model architectures: two-stage YOLOv8n LPR (plate then 38-class characters) and EfficientNet-B4 VMMR with a 245-way softmax head.",
     "fig:model_arch"),
    ("hardware_diagram.png",
     "Edge hardware diagram: USB 1080p camera, Orange Pi 5 Pro inference node, HDMI preview, and 5 V/5 A power supply.",
     "fig:hw_diagram"),
    ("web_dashboard_architecture.png",
     "Web dashboard architecture (React front end and Express API on Vercel) with admin versus user roles, live feed, logs, and gate ingest.",
     "fig:dash_arch"),
    ("dashboard/admin_live_feed.png",
     "Administrator live vehicle feed with full sidebar (logs, manual override, privileges, settings, weather).",
     "fig:admin_feed"),
    ("dashboard/user_live_feed.png",
     "Standard-user live feed with monitor-only navigation and temporary-visitor registration.",
     "fig:user_feed"),
    ("hw/dashboard_allowed.png",
     "Dashboard allow event: plate LEH-8357 classified as Suzuki Wagon R and authorized for gate open.",
     "fig:allow"),
    ("hw/dashboard_denied.png",
     "Dashboard deny event: plate BQX-687 (Changan Alsvin) denied when registry/policy checks fail.",
     "fig:deny"),
    ("hw/edge_batch_terminal.png",
     "Orange Pi batch run over 48 images: plate text, VMMR label, weather branch, latency, and Vercel event IDs.",
     "fig:edge_batch"),
    ("hw/edge_video_terminal.png",
     "Real-time video-frame inference on the edge node with plate stabilization and sub-second dashboard POST.",
     "fig:edge_video"),
    ("hw/edge_latency_table.png",
     "Per-stage edge latency table on Orange Pi 5 Pro CPU (LPD, character OCR, VMMR, and end-to-end).",
     "fig:edge_lat"),
    ("hw/edge_live_gui.png",
     "Live Orange Pi GUI demo with plate box overlay and terminal confirming end-to-end inference (~846 ms for LEB-1481).",
     "fig:edge_gui"),
    ("pre/pre_input_foggy.png",
     "Original foggy vehicle images before Dark Channel Prior dehazing.",
     "fig:pre_fog_in"),
    ("pre/pre_pipeline_defog.png",
     "Fog-removal pipeline output after DCP, guided filtering, and contrast restoration.",
     "fig:pre_fog_out"),
    ("pre/pre_input_rainy.png",
     "Original rainy vehicle images showing streaks and glare before rain suppression.",
     "fig:pre_rain_in"),
    ("pre/pre_pipeline_rain.png",
     "Rain-removal pipeline output after multi-scale vertical median filtering and Telea inpainting.",
     "fig:pre_rain_out"),
    ("pre/pre_input_night.png",
     "Original night / low-light vehicle images before LAB CLAHE enhancement.",
     "fig:pre_night_in"),
    ("pre/pre_pipeline_night.png",
     "Night-enhancement pipeline output after LAB CLAHE, gamma correction, and edge recovery.",
     "fig:pre_night_out"),
    ("lpd/lpd_dataset_labels.png",
     "License-plate detection dataset label analysis: class counts, box shapes, and spatial distributions.",
     "fig:lpd_labels"),
    ("lpd/lpd_val_batch_labels.png",
     "LPD validation batch mosaic with ground-truth plate boxes on Roboflow-style tiles.",
     "fig:lpd_valbatch"),
    ("lpd/lpd_training_results.png",
     "YOLOv8n LPD training curves over 50 epochs (loss, precision, recall, mAP@0.5, mAP@0.5:0.95).",
     "fig:lpd_train"),
    ("lpd/lpd_curve_f1.png",
     "LPD F1--confidence curve for the plate class.",
     "fig:lpd_f1"),
    ("lpd/lpd_curve_precision.png",
     "LPD precision--confidence curve for the plate class.",
     "fig:lpd_p"),
    ("lpd/lpd_curve_recall.png",
     "LPD recall--confidence curve for the plate class.",
     "fig:lpd_r"),
    ("lpd/lpd_curve_pr.png",
     "LPD precision--recall curve (mAP@0.5).",
     "fig:lpd_pr"),
    ("lpd/lpd_metrics_heatmap.png",
     "LPD diagnostic metrics heatmap from the validation export.",
     "fig:lpd_heat"),
    ("lpd/lpd_confusion_matrix.png",
     "LPD confusion matrix (counts) for plate versus background.",
     "fig:lpd_cm"),
    ("lpd/lpd_confusion_normalized.png",
     "LPD row-normalized confusion matrix for plate versus background.",
     "fig:lpd_cmn"),
    ("lpd/lpd_pred_clear_corolla.png",
     "Qualitative LPD result: clear daylight frontal sedan with plate box and confidence.",
     "fig:lpd_corolla"),
    ("lpd/lpd_pred_clear_mehran.png",
     "Qualitative LPD result: clear daylight regional plate styling.",
     "fig:lpd_mehran"),
    ("lpd/lpd_pred_rain_night.png",
     "Qualitative LPD result: rain/night scene with glare and plate detections.",
     "fig:lpd_rain"),
    ("lpd/lpd_pred_parking_dual.png",
     "Qualitative LPD result: parking-lot scene with dual plate detections.",
     "fig:lpd_park"),
    ("lpd/lpd_pred_highway_dual.png",
     "Qualitative LPD result: highway multi-lane scene with distant plates.",
     "fig:lpd_hwy"),
    ("lpr_char/ocr_labels.png",
     "Character-recognition dataset label distribution across 38 alphanumeric classes.",
     "fig:ocr_labels"),
    ("lpr_char/ocr_val_batch0_labels.png",
     "Character validation batch mosaic (batch 0) with ground-truth glyph boxes.",
     "fig:ocr_val0"),
    ("lpr_char/ocr_val_batch_labels.png",
     "Character validation batch mosaic with class-coloured glyph boxes on plate crops.",
     "fig:ocr_val"),
    ("lpr_char/ocr_training_results.png",
     "YOLOv8n character detector training curves over 100 epochs.",
     "fig:ocr_train"),
    ("lpr_char/ocr_boxF1_curve.png",
     "Character detector F1--confidence curve (38 classes).",
     "fig:ocr_f1"),
    ("lpr_char/ocr_boxP_curve.png",
     "Character detector precision--confidence curve.",
     "fig:ocr_p"),
    ("lpr_char/ocr_boxR_curve.png",
     "Character detector recall--confidence curve.",
     "fig:ocr_r"),
    ("lpr_char/ocr_boxPR_curve.png",
     "Character detector precision--recall curve (mAP@0.5).",
     "fig:ocr_pr"),
    ("lpr_char/ocr_metrics_heatmap.png",
     "Character recognition metrics heatmap at epoch 100 (mAP@0.5 0.977, P 0.990, R 0.942; mirrored validation).",
     "fig:ocr_heat"),
    ("lpr_char/ocr_confusion_matrix.png",
     "Character recognition confusion matrix (counts) over 38 classes.",
     "fig:ocr_cm"),
    ("lpr_char/ocr_confusion_normalized.png",
     "Character recognition row-normalized confusion matrix over 38 classes.",
     "fig:ocr_cmn"),
    ("lpr_char/ocr_qual_islamabad.png",
     "Qualitative character localization on an ICT/Islamabad-style plate crop.",
     "fig:ocr_isb"),
    ("lpr_char/ocr_qual_punjab_afr.png",
     "Qualitative character localization on a Punjab plate (AFR-style layout).",
     "fig:ocr_punafr"),
    ("lpr_char/ocr_qual_punjab_ler.png",
     "Qualitative character localization on Punjab plate LER-1234.",
     "fig:ocr_ler"),
    ("lpr_char/ocr_qual_sindh_afr021.png",
     "Qualitative character localization on Sindh plate AFR-021.",
     "fig:ocr_afr021"),
    ("lpr_char/ocr_qual_sindh_aja.png",
     "Qualitative character localization on a Sindh plate with emblem spacing.",
     "fig:ocr_aja"),
    ("lpr_char/ocr_e2e_plate_grid.png",
     "End-to-end plate detection and reconstructed OCR strings on sample vehicles.",
     "fig:ocr_e2e"),
]

VMMR = [
    (1, "VMMR test-metrics heatmap (accuracy, precision, recall, F1, and related scalars)."),
    (2, "VMMR confusion-matrix tile for classes 100--149."),
    (3, "VMMR confusion-matrix tile for classes 150--199."),
    (4, "Held-out VMMR inference: Suzuki Hustler (87.04\\%)."),
    (5, "Held-out VMMR inference: Honda Civic 2016 (71.02\\%)."),
    (6, "Held-out VMMR inference: Suzuki Jimny 4th Gen (48.34\\%)."),
    (7, "Held-out VMMR inference: Mercedes E-Class sedan (87.44\\%)."),
    (8, "Held-out VMMR inference: Suzuki Alto 1st Gen (94.58\\%)."),
    (9, "Held-out VMMR inference: Changan Karvaan (86.10\\%)."),
    (10, "Held-out VMMR inference: Changan Alsvin (72.94\\%)."),
    (11, "Held-out VMMR inference: Toyota Corolla 2009--2013 (92.60\\%)."),
    (12, "Held-out VMMR inference: MG ZS SUV (62.22\\%)."),
    (13, "Held-out VMMR inference: Suzuki Swift 1st Gen (87.63\\%)."),
    (14, "Held-out VMMR inference: Honda N-One 2nd Gen (73.90\\%)."),
    (15, "Held-out VMMR inference: Honda N-Wgn 1st Gen (83.12\\%)."),
    (16, "Held-out VMMR inference: Suzuki Bolan (94.57\\%)."),
    (17, "Held-out VMMR inference: Honda City 5th Gen (88.45\\%)."),
    (18, "Held-out VMMR inference: Honda S660 (86.64\\%)."),
    (19, "Held-out VMMR inference: Honda Vezel 2nd Gen (92.80\\%)."),
    (20, "Held-out VMMR inference: Toyota Supra (67.93\\%)."),
    (21, "Held-out VMMR inference: Daihatsu Mira 8th Gen (83.30\\%)."),
    (22, "VMMR training curves: loss, accuracy, and learning rate over 50 epochs."),
    (23, "Held-out VMMR inference: Daihatsu Hijet 10th Gen (90.07\\%)."),
    (24, "VMMR confusion-matrix tile for classes 136--162."),
    (25, "VMMR confusion-matrix tile for classes 0--43."),
    (26, "VMMR confusion-matrix tile for classes 200--244."),
    (27, "Held-out VMMR inference: Suzuki Xbee (93.01\\%)."),
    (28, "VMMR Top-5 prediction montage on held-out samples."),
    (29, "VMMR macro false-positive-rate summary heatmap."),
    (30, "VMMR per-class precision strip highlighting tail classes."),
    (31, "Printed aggregate VMMR test metrics (Top-1 and macro-F1 readouts)."),
]
for i, cap in VMMR:
    FIGURES.append((f"vmmr/vmmr_{i:02d}.png", cap, f"fig:vmmr_{i:02d}"))
FIGURES.append((
    "vmmr/vmmr_confusion_matrix_245.png",
    "Full row-normalized confusion matrix for all 245 VMMR classes on the held-out test split (EfficientNet-B4).",
    "fig:vmmr_cm245",
))


def fig_block(path, caption, label, n):
    return (
        "\n\\begin{figure*}[!htbp]\n"
        "\\centering\n"
        f"\\includegraphics[width=\\textwidth,keepaspectratio]{{{path}}}\n"
        f"\\caption{{{caption}}}\n"
        f"\\label{{{label}}}\n"
        "\\end{figure*}\n"
        "\\FloatBarrier\n"
    )


fig_tex_parts = [
    fig_block(path, cap, lab, idx)
    for idx, (path, cap, lab) in enumerate(FIGURES, start=1)
]

header = r'''\documentclass[10pt, conference]{IEEEtran}
\usepackage{graphicx}
\usepackage{amsmath}
\usepackage{amssymb}
\usepackage{booktabs}
\usepackage{tabularx}
\usepackage{caption}
\usepackage{subcaption}
\usepackage{cite}
\usepackage{xcolor}
\usepackage{array}
\usepackage{multirow}
\usepackage{enumitem}
\usepackage{balance}
\usepackage{placeins}
\usepackage{dblfloatfix}
\usepackage{float}
\usepackage[hidelinks]{hyperref}

\setlength{\textfloatsep}{10pt plus 3pt minus 2pt}
\setlength{\floatsep}{10pt plus 3pt minus 2pt}
\setlength{\intextsep}{10pt plus 3pt minus 2pt}
\setlength{\dbltextfloatsep}{10pt plus 3pt minus 2pt}
\setcounter{topnumber}{10}
\setcounter{bottomnumber}{10}
\setcounter{totalnumber}{20}
\setcounter{dbltopnumber}{10}
\renewcommand{\topfraction}{0.95}
\renewcommand{\bottomfraction}{0.95}
\renewcommand{\textfraction}{0.05}
\renewcommand{\floatpagefraction}{0.90}
\renewcommand{\dbltopfraction}{0.95}
\renewcommand{\dblfloatpagefraction}{0.90}

\renewcommand{\thesection}{\Roman{section}}
\renewcommand{\thesubsection}{\thesection-\Alph{subsection}}

\title{Automatic Vehicle Gate Access System Using Weather-Aware Preprocessing, YOLOv8n License Plate Recognition, and EfficientNet-B4 Make--Model Verification}

\author{\IEEEauthorblockN{Abdul Hadi, Ali Raza Chaudhry, and Abdullah Yaseen}
\IEEEauthorblockA{Department of Computer Engineering\\
COMSATS University Islamabad, Lahore Campus\\
Lahore, Pakistan\\
Supervisor: Dr.\ Taimoor Naeem\\
B.S.\ Computer Engineering}}

\begin{document}
\emergencystretch=2em
\graphicspath{{figures/}{figures/lpd/}{figures/pre/}{figures/lpr_char/}{figures/vmmr/}{figures/hw/}{figures/dashboard/}}
\maketitle

\begin{abstract}
Manual gate checks and plate-only automatic number plate recognition (ANPR) are slow, error-prone, and vulnerable to plate swapping. This paper presents the implemented Automatic Vehicle Gate Access System developed as an undergraduate final-year project: a weather-aware classical preprocessing front end, a two-stage YOLOv8n license plate recognition (LPR) pipeline, and an EfficientNet-B4 vehicle make and model recognizer (VMMR) over 245 classes, fused by a dual-modality authorization policy and monitored through a cloud web dashboard. Fog and haze are mitigated with a dark-channel prior and guided filtering; rain streaks are suppressed with multi-scale vertical median filtering and Telea inpainting under an edge-protection mask; night frames are enhanced with LAB-space CLAHE. On the reported project benchmarks, YOLOv8n plate detection reaches mAP@0.5 of 98.07\% (precision 98.50\%, recall 95.53\%) after 50 epochs; the 38-class character detector reports mAP@0.5 of 97.7\% after 100 epochs under mirrored training validation (explicitly flagged); and EfficientNet-B4 achieves 96.24\% Top-1 accuracy on 17{,}254 held-out test images. All three models run locally on an Orange Pi~5 Pro (16\,GB) from a USB 1080p camera, with measured end-to-end latency of about 700--1000\,ms per frame, and events sync to a React dashboard hosted on Vercel. All project figures from the \texttt{figures/} folder are included at full page width for readability.
\end{abstract}

\begin{IEEEkeywords}
Automatic number plate recognition, vehicle make and model recognition, YOLOv8, EfficientNet, dark channel prior, rain removal, CLAHE, edge AI, access control.
\end{IEEEkeywords}

\section{Introduction}
\label{sec:intro}
Vehicle access control at campuses, gated communities, and parking facilities still often depends on manual inspection or physical credentials such as RFID tags and barcodes. These methods do not scale well under peak traffic, are easy to misuse when credentials are shared or lost, and provide limited auditability. Camera-based ANPR offers contactless identification, but outdoor gates introduce fog, rain, glare, and low light that degrade localization and reading. Plate-only decisions also fail when a cloned plate is mounted on an unauthorized vehicle.

This work implements a complete software--hardware gate prototype. The system combines weather-conditioned classical restoration, YOLOv8n plate localization and 38-class character detection with deterministic Pakistani plate formatting, EfficientNet-B4 fine-grained make--model classification over 245 classes, and dual-check authorization against a registered-vehicle store, with edge inference on an Orange Pi~5 Pro and cloud monitoring on Vercel. The contribution is engineering integration and experimental documentation of an end-to-end student deployment, not a new detector backbone.

\subsection{Problem Statement}
Given an RGB frame $I$ from a gate-lane camera, the system must recover a plate string $s$, predict a make--model class $y\in\{1,\ldots,245\}$, and return an access decision $a\in\{\textsc{allow},\textsc{deny},\textsc{temporary}\}$ by comparing $(s,y)$ with a registry $\mathcal{W}$. The same stack must remain usable when $I$ is degraded by fog, rain, or night illumination, which is addressed by restoring $\hat{I}$ before inference.

\subsection{Objectives}
\begin{itemize}[leftmargin=*,itemsep=1pt]
\item train a YOLOv8n license plate detector for gate-distance localization;
\item train a YOLOv8n character/digit detector (38 classes) with post-processing for regional plate tokens;
\item fine-tune EfficientNet-B4 for 245-way vehicle make and model classification;
\item apply fog, rain, and night preprocessing before recognition;
\item authorize access by cross-checking plate text and predicted vehicle identity;
\item meet a total response budget below 2\,s from capture to decision, with on-device CPU inference in the 700--1000\,ms range.
\end{itemize}

\subsection{Scope and Contribution}
Software scope covers the three AI modules, weather preprocessing, JSON-backed authorization, and a React/Node.js dashboard. Hardware scope covers Orange Pi~5 Pro (16\,GB), a USB 1080p camera, Wi-Fi upload, and optional GPIO/LED indication. Full industrial barrier-motor integration, snow removal, and automatic weather sensing are out of scope for this FYP cycle. Algorithmic novelty is not claimed beyond application-specific integration of established methods~\cite{he2009dcp,tan2019efficientnet,ultralytics2023yolov8}.

\section{Related Work}
\label{sec:related}
Classical ANPR pipelines used edge detection, morphology, and OCR engines. Modern systems replace hand-crafted stages with CNN detectors; YOLO-family models are widely used for plate localization~\cite{redmon2018yolov3,bochkovskiy2020yolov4,ultralytics2023yolov8}. Character reading may use OCR after cropping or a second detector that treats glyphs as objects~\cite{thapliyal2023alpr}. Fine-grained VMMR uses transfer learning from ImageNet; EfficientNet is a practical capacity/memory compromise~\cite{tan2019efficientnet}. Outdoor reliability depends on restoration such as the dark channel prior with guided filtering~\cite{he2009dcp,he2010guided,he2011dcp}, directional rain filtering with inpainting~\cite{telea2004}, and CLAHE on luminance~\cite{zuiderveld1994clahe}. This project documents one integrated campus-style pipeline rather than a new network family.

\section{System Architecture}
\label{sec:system}
Figures~\ref{fig:sys_overview}--\ref{fig:dash_arch} summarize the software architecture, updated block diagram, recognition stacks, edge hardware, and dashboard design. Figures~\ref{fig:admin_feed}--\ref{fig:edge_gui} document the role-based UI and Orange Pi deployment evidence used in the FYP demos.

\section{Proposed Methodology}
\label{sec:method}
\subsection{Weather-Aware Preprocessing}
Three classical branches restore frames before AI inference (Figs.~\ref{fig:pre_fog_in}--\ref{fig:pre_night_out}). Branch selection is software-flagged or manual; physical weather sensors are not yet attached.

\textbf{Fog/haze.} Dark-channel estimation uses a $13\times13$ morphological kernel. Atmospheric light is taken from the darkest 0.1\% of pixels. Transmission is refined with a guided filter (radius 50). Scene radiance recovery is followed by residual-haze cleanup, gray-world white balance, adaptive gamma $\gamma\in[0.6,1.8]$, CLAHE on luminance (clip 2.5, $8\times8$ tiles), HSV saturation gain $\times1.2$, bilateral denoising, and unsharp masking~\cite{he2009dcp,he2010guided}.

\textbf{Rain.} An edge-protection mask is built with bilateral smoothing and Canny edges. Multi-scale vertical median filters (kernels 15, 11, 7) suppress streaks with brightness-rejection blending. Remaining bright rain spots outside protected regions are filled with Telea inpainting (radius 3)~\cite{telea2004}.

\textbf{Night/low light.} Adaptive black-level lift is applied in LAB $L^\ast$, followed by CLAHE (clip 4.5--8.5, $6\times6$ tiles), adaptive gamma $\gamma\in[0.28,0.62]$, global gain when mean intensity is below 100, HSV saturation $\times1.55$, and unsharp masking~\cite{zuiderveld1994clahe}.

\subsection{License Plate Detection}
Stage~1 uses Ultralytics YOLOv8n on Roboflow License Plate Project v1~\cite{roboflowLPD,ultralytics2023yolov8}: 20{,}580 / 1{,}973 / 978 images. Training: 50 epochs, batch 32, imgsz 380 (effective $384\times384$) on a Tesla~T4. Evaluation confidence threshold 0.25.

\subsection{Character Recognition}
Stage~2 trains YOLOv8n on Roboflow \emph{My First Project} v4 (1{,}235 images, 38 classes) for 100 epochs at $640\times640$~\cite{roboflowChars}. \textbf{Validation caveat:} the export had no separate validation folder; validation mirrored training. Character metrics are upper-bound diagnostics.

\subsection{Vehicle Make and Model Recognition}
EfficientNet-B4 with a 245-way head is fine-tuned on 31{,}904 / 7{,}977 / 17{,}254 train/val/test images using label-smoothed cross-entropy ($\epsilon=0.1$), AdamW, and $224\times224$ inputs for 50 epochs~\cite{tan2019efficientnet}.

\subsection{Dual-Modality Authorization}
Access is granted only when plate text and predicted make/model are consistent with the registry (allow/deny/temporary policies). Physical relay-to-motor wiring is optional and not completed in this FYP.

\section{Datasets and Experimental Setup}
\label{sec:data}
\begin{table}[!htbp]
\centering
\caption{Dataset summary.}
\label{tab:data}
\begin{tabular}{@{}lrrr@{}}
\toprule
Dataset & Train & Val & Test \\
\midrule
LPD (Roboflow v1) & 20{,}580 & 1{,}973 & 978 \\
Characters (v4) & 1{,}235 & ---$^\dagger$ & --- \\
VMMR (245 classes) & 31{,}904 & 7{,}977 & 17{,}254 \\
\bottomrule
\multicolumn{4}{l}{\footnotesize $^\dagger$Mirrored training validation (no exporter val split).}
\end{tabular}
\end{table}

\begin{table}[!htbp]
\centering
\caption{Key module results (FYP Chapters 5--6).}
\label{tab:metrics}
\begin{tabular}{@{}llc@{}}
\toprule
Module & Metric & Value \\
\midrule
LPD & P / R / mAP@0.5 & 0.9850 / 0.9553 / 0.9807 \\
Characters$^\dagger$ & mAP@0.5 / P / R / F1 & 0.977 / 0.990 / 0.942 / 0.965 \\
VMMR & Top-1 / Top-5 / macro F1 & 0.9624 / 0.9939 / 0.9618 \\
Edge CPU & End-to-end latency & $\sim$700--1000\,ms \\
\bottomrule
\multicolumn{3}{l}{\footnotesize $^\dagger$Mirrored validation.}
\end{tabular}
\end{table}

Training used Google Colab (CUDA). Deployment used Orange Pi~5 Pro CPU inference with Python, PyTorch, OpenCV, and Ultralytics YOLO; the dashboard uses React/Express on Vercel.

\section{Results and Complete Figure Set}
\label{sec:res}
This section reports quantitative metrics and includes \textbf{every} image from the project \texttt{figures/} folder at full text width so details remain easily visible. Brief captions explain what each figure shows. Table~\ref{tab:metrics} summarizes headline numbers. Character metrics use mirrored validation (Section~\ref{sec:method}).

\subsection{Architecture, Hardware, and Dashboard Figures}
Figures~\ref{fig:sys_overview}--\ref{fig:dash_arch} present system design. Figures~\ref{fig:admin_feed}--\ref{fig:edge_gui} show UI roles and edge runs.
'''

footer = r'''
\section{Discussion}
\label{sec:disc}
Plate detection mAP@0.5 of 98.07\% indicates reliable localization on Roboflow v1. Character metrics must be discounted because validation mirrored training. VMMR Top-1 of 96.24\% on 17{,}254 images is the strongest held-out classification result; residual errors concentrate on visually similar sibling-year classes (Fig.~\ref{fig:vmmr_cm245}). Dual verification addresses plate swapping. Orange Pi latency shows VMMR dominates runtime while staying under the $<$2\,s objective (Fig.~\ref{fig:edge_lat}).

\subsection{Limitations}
Region generalization is untested outside Pakistani plates/vehicles; character validation is not disjoint; snow/smog/extreme glare remain weak; weather branch selection is not sensor-driven; industrial barrier actuation is out of scope; weather-branch string accuracy is qualitative.

\section{Conclusion and Future Work}
\label{sec:conc}
This FYP implemented an Automatic Vehicle Gate Access System coupling weather-aware restoration, YOLOv8n LPR, EfficientNet-B4 VMMR (245 classes), dual-modality authorization, Orange Pi edge deployment, and a Vercel React dashboard. Reported results: 98.07\% mAP@0.5 (LPD), 97.7\% mAP@0.5 (characters, mirrored val), 96.24\% Top-1 (VMMR), and $\sim$700--1000\,ms CPU latency. Future work includes GPIO/relay barrier actuation, multi-frame voting, sensor-triggered preprocessing, persistent cloud storage, and a true character validation split.

\section*{Acknowledgment}
The authors thank Dr.\ Taimoor Naeem, Department of Computer Engineering, COMSATS University Islamabad, Lahore Campus, for supervision of this final-year project.

\clearpage
\balance
\bibliographystyle{IEEEtran}
\bibliography{references}

\end{document}
'''

parts = [header]
for i in range(0, 13):
    parts.append(fig_tex_parts[i])

parts.append(
    "\n\\subsection{Weather Preprocessing Figures}\n"
    "Figures~\\ref{fig:pre_fog_in}--\\ref{fig:pre_night_out} show fog, rain, and night inputs and restored outputs.\n"
)
for i in range(13, 19):
    parts.append(fig_tex_parts[i])

parts.append(
    "\n\\subsection{License Plate Detection Figures}\n"
    "Figures~\\ref{fig:lpd_labels}--\\ref{fig:lpd_hwy} cover dataset diagnostics, 50-epoch training curves, "
    "PR/F1 curves, confusion matrices, and qualitative detections. Epoch-50 validation metrics are "
    "precision 98.50\\%, recall 95.53\\%, and mAP@0.5 98.07\\%.\n"
)
for i in range(19, 34):
    parts.append(fig_tex_parts[i])

parts.append(
    "\n\\subsection{Character Recognition Figures}\n"
    "Figures~\\ref{fig:ocr_labels}--\\ref{fig:ocr_e2e} cover the 38-class detector. Canonical project metrics "
    "are mAP@0.5 97.7\\%, precision 99.0\\%, recall 94.2\\%, and F1 96.5\\% under mirrored validation.\n"
)
for i in range(34, 51):
    parts.append(fig_tex_parts[i])

parts.append(
    "\n\\subsection{Vehicle Make and Model Recognition Figures}\n"
    "Figures~\\ref{fig:vmmr_01}--\\ref{fig:vmmr_cm245} present EfficientNet-B4 diagnostics and held-out overlays. "
    "Held-out test metrics are Top-1 96.24\\%, Top-5 99.39\\%, and macro F1 96.18\\%.\n"
)
for i in range(51, len(fig_tex_parts)):
    parts.append(fig_tex_parts[i])

parts.append(footer)
out.write_text("".join(parts), encoding="utf-8")
print("Wrote", out)
print("Total figures:", len(FIGURES))
missing = [str(ROOT / "figures" / p) for p, _, _ in FIGURES if not (ROOT / "figures" / p).exists()]
print("Missing:", len(missing))
for m in missing:
    print(" ", m)
