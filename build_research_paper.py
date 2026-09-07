# -*- coding: utf-8 -*-
"""Generate research_paper.tex from repository-grounded content."""
from pathlib import Path

ROOT = Path(__file__).resolve().parent

FIGS = [
    "0002a5b67e5f0909_jpg.rf.300ba325f1e5e11ec6fdb10e70d11f4b.jpg",
    "000812dcf304a8e7_jpg.rf.f0b445cb199333b34743798d98cdb57b.jpg",
    "0010f4c10f7ab07e_jpg.rf.6aa0a7fccae068586c77cd9b3a165cbb.jpg",
    "002519f868563098_jpg.rf.747ddee18711caaf4eec8c2788f18a53.jpg",
    "0026c246d5c33bea_jpg.rf.5e4c872c6b719cf9461250e4a548bbcf.jpg",
    "002901d9d194c4fb_jpg.rf.abb32cb00d3bfe6ccdd63b347f757453.jpg",
    "002d099996f3f443_jpg.rf.9dbeeab320aba1154957f121fc9be439.jpg",
    "0039ac4bfb8bd69d_jpg.rf.e84acbf2cb5a4572116b702c1ef86857.jpg",
    "005e1faed531ae7e_jpg.rf.249fb183d641dec499d8e6d4e53f0378.jpg",
    "0063e41b53567829_jpg.rf.686da0392b4f487124f93b36ec386773.jpg",
    "006a2f13b5b16c64_jpg.rf.a15e157b63c3debfb326174f156f882b.jpg",
    "00777823afff31f7_jpg.rf.4ab8065d7faf8141a75a0c10cd94b211.jpg",
]


def esc(s: str) -> str:
    return s.replace("\\", "\\textbackslash{}")


lines: list[str] = []

def W(x: str = "") -> None:
    lines.append(x)


def emit_lpr_char_results_section() -> None:
    """YOLO digit--letter OCR figures under figures/lpr_char/ (sync_lpr_char_figures.py)."""
    W(
        r"""\subsection{License Plate Character and Digit Recognition (OCR) Visual and Diagnostic Results}
\label{subsec:lpocrfigs}
Figures~\ref{fig:ocrmetrics}--\ref{fig:ocrtrain} summarize qualitative and diagnostic exports for the character head: a validation-metrics heatmap, per-character bounding boxes on provincial plate styles, an end-to-end plate localization plus string readout montage, Precision--/Recall--/PR--/F1--confidence curves, raw and row-normalized confusion matrices, dataset label statistics, a validation batch mosaic, and the composite training summary figure. Headline scalars at epoch~100 appear in Table~\ref{tab:lpcharmetrics} with the train/validation mirroring caveat in Section~\ref{subsec:lpchar}.

\begin{figure}[!t]
\centering
\includegraphics[width=\linewidth]{figures/lpr_char/ocr_metrics_heatmap.png}
\caption{YOLOv8n character detection and recognition validation metrics heatmap at epoch~100: mAP@0.5 0.994, precision 0.990, recall 0.968, F1 0.979, and FPR 0.010 on the mirrored Roboflow v4 validation pool.}
\label{fig:ocrmetrics}
\end{figure}

\begin{figure*}[t]
\centering
\begin{subfigure}[b]{0.32\textwidth}\centering
\includegraphics[width=\linewidth]{figures/lpr_char/ocr_qual_islamabad.png}
\caption{ICT (Islamabad) crop with per-glyph boxes.}
\end{subfigure}\hfil
\begin{subfigure}[b]{0.32\textwidth}\centering
\includegraphics[width=\linewidth]{figures/lpr_char/ocr_qual_sindh_aja.png}
\caption{Sindh plate (three-letter, three-digit style readout).}
\end{subfigure}\hfil
\begin{subfigure}[b]{0.32\textwidth}\centering
\includegraphics[width=\linewidth]{figures/lpr_char/ocr_qual_punjab_ler.png}
\caption{Punjab plate with stacked rows.}
\end{subfigure}
\caption{Qualitative character-level detections (YOLOv8n head, class-coloured boxes).}
\label{fig:ocrqual1}
\end{figure*}

\begin{figure*}[t]
\centering
\begin{subfigure}[b]{0.48\textwidth}\centering
\includegraphics[width=\linewidth]{figures/lpr_char/ocr_qual_punjab_afr.png}
\caption{Punjab frontal crop.}
\end{subfigure}\hfil
\begin{subfigure}[b]{0.48\textwidth}\centering
\includegraphics[width=\linewidth]{figures/lpr_char/ocr_qual_sindh_afr021.png}
\caption{Sindh variant with emblem spacing.}
\end{subfigure}
\caption{Additional qualitative OCR panels on contrasting layouts.}
\label{fig:ocrqual2}
\end{figure*}

\begin{figure*}[t]
\centering
\includegraphics[width=\linewidth]{figures/lpr_char/ocr_e2e_plate_grid.png}
\caption{End-to-end detection and OCR readouts on sample vehicles (green plate boxes with predicted strings).}
\label{fig:ocre2e}
\end{figure*}

\begin{figure*}[t]
\centering
\begin{subfigure}[b]{0.48\textwidth}\centering
\includegraphics[width=\linewidth]{figures/lpr_char/ocr_boxP_curve.png}
\caption{Precision--confidence.}
\end{subfigure}\hfil
\begin{subfigure}[b]{0.48\textwidth}\centering
\includegraphics[width=\linewidth]{figures/lpr_char/ocr_boxR_curve.png}
\caption{Recall--confidence.}
\end{subfigure}\\[1.5ex]
\begin{subfigure}[b]{0.48\textwidth}\centering
\includegraphics[width=\linewidth]{figures/lpr_char/ocr_boxPR_curve.png}
\caption{Precision--recall (mAP@0.5 legend per Ultralytics export).}
\end{subfigure}\hfil
\begin{subfigure}[b]{0.48\textwidth}\centering
\includegraphics[width=\linewidth]{figures/lpr_char/ocr_boxF1_curve.png}
\caption{F1--confidence.}
\end{subfigure}
\caption{Ultralytics diagnostic curves for the 38-class character detector.}
\label{fig:ocrcurves}
\end{figure*}

\begin{figure*}[t]
\centering
\begin{subfigure}[b]{0.48\textwidth}\centering
\includegraphics[width=\linewidth]{figures/lpr_char/ocr_confusion_matrix.png}
\caption{Counts confusion matrix.}
\end{subfigure}\hfil
\begin{subfigure}[b]{0.48\textwidth}\centering
\includegraphics[width=\linewidth]{figures/lpr_char/ocr_confusion_normalized.png}
\caption{Normalized confusion matrix.}
\end{subfigure}
\caption{Confusion summaries across digits, letters, special tokens, and background.}
\label{fig:ocrconf}
\end{figure*}

\begin{figure*}[t]
\centering
\begin{subfigure}[b]{0.48\textwidth}\centering
\includegraphics[width=\linewidth]{figures/lpr_char/ocr_labels.png}
\caption{Class histogram, box-shape overlay, and label center/size heatmaps.}
\end{subfigure}\hfil
\begin{subfigure}[b]{0.48\textwidth}\centering
\includegraphics[width=\linewidth]{figures/lpr_char/ocr_val_batch_labels.png}
\caption{Validation batch mosaic with ground-truth character boxes.}
\end{subfigure}
\caption{Dataset analytics and batched validation tiles for the Roboflow v4 corpus.}
\label{fig:ocrlabelsval}
\end{figure*}

\begin{figure*}[t]
\centering
\includegraphics[width=\linewidth]{figures/lpr_char/ocr_training_results.png}
\caption{Training and validation losses plus box precision, recall, mAP@0.5, and mAP@0.5:0.95 over 100 epochs.}
\label{fig:ocrtrain}
\end{figure*}

"""
    )


def emit_pre_pipeline_results_section() -> None:
    """Fog / night / rain inputs and fused LPD+OCR+VMMR outputs under figures/pre/ (sync_pre_figures.py)."""
    W(
        r"""\subsection{Integrated weather pipeline and end-to-end overlays}
\label{subsec:prefigs}
Figures~\ref{fig:preinputfog}--\ref{fig:preinputrain} show \textbf{inputs} (full two-column width each) under fog, night/low-light, and heavy rain. Figures~\ref{fig:prepipefog}--\ref{fig:prepiperain} show \textbf{outputs} after the corresponding enhancement branch with the same YOLOv8n LPD, YOLOv8n digit--letter OCR, and $380\times380$ EfficientNet-B4 VMMR stack (lime plate boxes, plate strings, and vehicle labels). Restoration settings follow Section~\ref{sec:pre}; the night/low-light frame adds a tonal enhancement front-end with identical downstream weights.

\begin{figure*}[!t]
\centering
\includegraphics[width=\textwidth]{figures/pre/pre_input_foggy.png}
\caption{Original foggy uploads (ten-vehicle grid) prior to restoration.}
\label{fig:preinputfog}
\end{figure*}

\begin{figure*}[!t]
\centering
\includegraphics[width=\textwidth]{figures/pre/pre_input_night.png}
\caption{Original night / low-light set prior to restoration.}
\label{fig:preinputnight}
\end{figure*}

\begin{figure*}[!t]
\centering
\includegraphics[width=\textwidth]{figures/pre/pre_input_rainy.png}
\caption{Original rainy scenes prior to restoration.}
\label{fig:preinputrain}
\end{figure*}

\begin{figure*}[!t]
\centering
\includegraphics[width=\textwidth]{figures/pre/pre_pipeline_defog.png}
\caption{After fog removal + LPD + OCR + VMMR (overlays on restored imagery).}
\label{fig:prepipefog}
\end{figure*}

\begin{figure*}[!t]
\centering
\includegraphics[width=\textwidth]{figures/pre/pre_pipeline_night.png}
\caption{After night enhancement + LPD + OCR + VMMR.}
\label{fig:prepipenight}
\end{figure*}

\begin{figure*}[!t]
\centering
\includegraphics[width=\textwidth]{figures/pre/pre_pipeline_rain.png}
\caption{After rain removal + LPD + OCR + VMMR.}
\label{fig:prepiperain}
\end{figure*}

"""
    )


def emit_vmmr_results_section() -> None:
    """Qualitative VMMR grids under figures/vmmr/ (populated by sync_vmmr_figures.py)."""
    caps = {
        1: "Test metrics heatmap (ACC, PREC, REC, F1, AUC).",
        2: "VMMR confusion matrix (classes 100--149).",
        3: "VMMR confusion matrix (classes 150--199).",
        4: "Suzuki Hustler inference overlay (87.04\\%).",
        5: "Honda Civic 2016 inference overlay (71.02\\%).",
        6: "Suzuki Jimny 4th Gen inference overlay (48.34\\%).",
        7: "Mercedes E-Class sedan inference overlay (87.44\\%).",
        8: "Suzuki Alto 1st Gen inference overlay (94.58\\%).",
        9: "Changan Karvaan inference overlay (86.10\\%).",
        10: "Changan Alsvin inference overlay (72.94\\%).",
        11: "Toyota Corolla 2009--2013 inference overlay (92.60\\%).",
        12: "MG ZS SUV inference overlay (62.22\\%).",
        13: "Suzuki Swift 1st Gen inference overlay (87.63\\%).",
        14: "Honda N-One 2nd Gen inference overlay (73.90\\%).",
        15: "Honda N-Wgn 1st Gen inference overlay (83.12\\%).",
        16: "Suzuki Bolan inference overlay (94.57\\%).",
        17: "Honda City 5th Gen inference overlay (88.45\\%).",
        18: "Honda S660 inference overlay (86.64\\%).",
        19: "Honda Vezel 2nd Gen inference overlay (92.80\\%).",
        20: "Toyota Supra inference overlay (67.93\\%).",
        21: "Daihatsu Mira 8th Gen inference overlay (83.30\\%).",
        22: "Training loss, accuracy, and learning-rate curves.",
        23: "Daihatsu Hijet 10th Gen inference overlay (90.07\\%).",
        24: "VMMR confusion matrix (classes 136--162).",
        25: "VMMR confusion matrix (classes 0--43).",
        26: "VMMR confusion matrix (classes 200--244).",
        27: "Suzuki Xbee inference overlay (93.01\\%).",
        28: "Top-5 prediction montage on held-out samples.",
        29: "Macro false-positive-rate summary heatmap.",
        30: "Per-class precision strip for tail classes.",
        31: "Printed aggregate test metrics (Top-1, macro-F1).",
    }
    W(
        r"""\subsection{VMMR (Vehicle Make \& Model) Visual and Diagnostic Results}
\label{subsec:vmmrfigs}
Figures~\ref{fig:vmmrqual1}--\ref{fig:vmmrqual4} compile EfficientNet-B4 exports from the training notebook: test-metric summaries, partitioned confusion-matrix tiles, held-out inference overlays, training curves, and summary readouts.

"""
    )
    specs: list[tuple[int, int, int, float, str, str]] = [
        (
            1,
            10,
            3,
            0.32,
            "fig:vmmrqual1",
            "EfficientNet-B4 VMMR gallery (batch 1/4): test-metric heatmap, confusion-matrix tiles, and held-out inference overlays with predicted make--model labels.",
        ),
        (
            10,
            19,
            3,
            0.32,
            "fig:vmmrqual2",
            "EfficientNet-B4 held-out inference overlays (batch 2/4): each tile shows the input filename, predicted class, and confidence score.",
        ),
        (
            19,
            28,
            3,
            0.32,
            "fig:vmmrqual3",
            "VMMR diagnostics mix (batch 3/4): inference overlays, epoch training curves, and partitioned confusion-matrix tiles.",
        ),
        (
            28,
            32,
            2,
            0.48,
            "fig:vmmrqual4",
            "VMMR summary artifacts (batch 4/4): Top-5 montage, macro FPR, and aggregate test readouts.",
        ),
    ]
    for start, end, ncol, width, label, cap in specs:
        W("\\begin{figure*}[t]\n\\centering")
        nums = list(range(start, end))
        for idx, n in enumerate(nums):
            W(
                f"\\begin{{subfigure}}[b]{{{width}\\textwidth}}\\centering\n"
                f"\\includegraphics[width=\\linewidth]{{figures/vmmr/vmmr_{n:02d}.png}}\n"
                f"\\caption{{{caps[n]}}}\n\\end{{subfigure}}"
            )
            if idx < len(nums) - 1:
                if (idx + 1) % ncol == 0:
                    W("\\\\[1.5ex]")
                else:
                    W("\\hfil")
        W(f"\\caption{{{cap}}}\n\\label{{{label}}}\n\\end{{figure*}}\n")


W(r"""\documentclass[10pt, conference]{IEEEtran}
\usepackage{graphicx}
\usepackage{amsmath}
\usepackage{amssymb}
\usepackage{booktabs}
\usepackage{tabularx}
\usepackage{caption}
\usepackage{subcaption}
\usepackage{tikz}
\usetikzlibrary{arrows.meta,positioning,fit,shapes.multipart}
\usepackage{cite}
\usepackage{xcolor}
\usepackage{array}
\usepackage{multirow}
\usepackage{enumitem}
\usepackage{balance}
\usepackage[hidelinks]{hyperref}

% Roman section numbering (per project brief)
\renewcommand{\thesection}{\Roman{section}}
\renewcommand{\thesubsection}{\thesection-\Alph{subsection}}

\title{Automatic Vehicle Gate Access System in All-Weather Conditions Using License Plate Recognition and Vehicle Make \& Model Recognition}

\author{\IEEEauthorblockN{Ali Raza Chaudhry and Abdul Hadi}
\IEEEauthorblockA{Department of Computer Engineering\\
COMSATS University Islamabad, Lahore Campus\\
Lahore, Pakistan\\
Supervisor: Dr.\ Taimoor Naeem\\
B.S.\ Computer Engineering, Session 2021--2025}}

\begin{document}
\emergencystretch=2em
\graphicspath{{final yolo/runs_backup/detect/predict/}}
\maketitle
\begin{abstract}
Automated vehicle gate access is widely deployed in campuses, logistics hubs, and residential compounds. However, practical deployments frequently degrade under adverse imaging conditions such as fog, rain, low contrast, and strong glare, while security is weakened when access decisions rely on a single modality (e.g., license plate recognition alone). This paper presents an end-to-end research prototype that couples classical and learning-based vision: (i) weather-aware preprocessing in a cloud notebook environment for fog/haze mitigation using a dark-channel prior with guided filtering and contrast restoration, and rain streak suppression using vertically anisotropic median filtering with edge-aware protection and Telea inpainting; (ii) license plate recognition (LPR) using a two-stage Ultralytics YOLO stack---YOLOv8n license plate detection (LPD) on a public-style plate localization dataset, followed by YOLOv8n digit--letter detection (38 classes) with deterministic post-processing to a Pakistan-style plate token; and (iii) vehicle make and model recognition (VMMR) using transfer learning with an ImageNet-pretrained EfficientNet-B4 classifier on a 245-way fine-grained taxonomy. A companion web dashboard demonstrates policy-aware access simulation and optional client-side tonal normalization. We report quantitative results for VMMR on a held-out test split, for LPD at epoch~50 (validation precision 0.985, recall 0.955, mAP@0.5 0.981, mAP@0.5:0.95 0.707), and for the character stage at epoch~100 (precision 0.9899, recall 0.9688, mAP@0.5 0.9807, mAP@0.5:0.95 0.7611; the character export lacked a disjoint validation split, so validation mirrors training in that stage). End-to-end string accuracy under controlled weather branches and on-target latency remain pending. The discussion highlights modality fusion for cloned-plate deterrence, preprocessing fidelity for color-sensitive classifiers, and deployment considerations for embedded inference.
\end{abstract}

\begin{IEEEkeywords}
Automatic number plate recognition, vehicle make and model recognition, EfficientNet, YOLO, dark channel prior, rain removal, transfer learning, access control, intelligent transportation systems.
\end{IEEEkeywords}
""")

# --- I. INTRODUCTION (dense) ---
W(r"""\section{Introduction}
\label{sec:intro}
\subsection{Background and Motivation}
Vehicle access control has evolved from manual credential checks toward automated systems that reduce staffing costs, increase throughput, and improve auditability. Camera-based analytics are attractive because they are non-contact, can be retrofitted to existing lanes, and can log rich evidence (timestamp, imagery, inferred attributes) for security investigations. Nonetheless, outdoor cameras are subject to environmental variability: particulate haze and fog reduce contrast; rain introduces high-frequency streak structures; and strong sunlight reflections can saturate regions of the sensor response, harming downstream detectors and classifiers.

\subsection{Problem Statement}
Let $I \in \mathbb{R}^{H\times W \times 3}$ denote an RGB frame acquired at a gate lane. The system must estimate a plate string $s \in \Sigma^\ast$ over an alphabet $\Sigma$ and a fine-grained vehicle class $y \in \{1,\ldots,K\}$ (make-model family), then apply a decision rule $\mathcal{D}(s,y,\mathcal{W})$ conditioned on a whitelist $\mathcal{W}$ to produce an actuation command $a \in \{\textsc{grant},\textsc{deny},\textsc{alert}\}$. The central difficulty is that the conditional distributions $p(s\mid I)$ and $p(y\mid I)$ shift under weather transformations $T_\omega$ parameterized by $\omega$ (fog, rain, glare), causing elevated error rates unless $I$ is replaced by a restored $\hat{I}$ or unless models are trained under heavy domain randomization.

\subsection{Research Gaps}
Commercial ANPR engines often emphasize clear-day performance on controlled viewpoints, and field studies show measurable degradation under rain, fog, and low light~\cite{r05,r15}. Academic LPR work frequently treats detection, character localization, and OCR as loosely coupled stages without a single reproducible training lineage, while VMMR benchmarks emphasize Top-1 accuracy on curated crops rather than \emph{joint} gate policies that must reconcile plate text, vehicle appearance, and latency under the same camera stream~\cite{r08,r18}. Surveys of intelligent transportation and access-control deployments also highlight \emph{fragmented} solutions---strong plate readers or strong classifiers in isolation---with limited published detail on end-to-end integration, audit logging, and dual-modality consistency checks that deter simple plate spoofing~\cite{r01,r09}. There is comparatively less open reporting on \emph{coupled} pipelines where weather restoration, plate reading, and fine-grained recognition are co-designed so that restoration preserves plate detail while still improving global appearance for make-model cues, and where quantitative claims can be traced to versioned datasets and archived training logs.

\subsection{Novelty and Positioning}
Relative to single-modality gate products and to LPR-only research stacks, this work positions novelty along four axes aligned with the companion report \emph{All-Weather IR-Based Smart Vehicle Gate Recognition System} and its four-page project summary: (i)~\textbf{dual-modality authorization}---policy uses both reconstructed plate tokens and EfficientNet-B4 make--model predictions, tightening the attack surface versus plate-only allow lists; (ii)~\textbf{weather-aware front-end}---fog/haze and rain branches documented in Section~\ref{sec:pre} feed the same downstream detectors and classifier rather than treating enhancement as an offline aesthetic step; (iii)~\textbf{unified YOLO-centric LPR}---Ultralytics YOLOv8n for plate boxes and a second YOLOv8n head for digit--letter boxes with deterministic Pakistan-style post-processing, reducing reliance on proprietary cloud OCR for a campus-style deployment narrative; (iv)~\textbf{reproducibility}---LPD, character-stage, and VMMR metrics in Section~\ref{sec:res} are tied to fixed training epochs and archived logs rather than headline percentages alone. Companion student materials quote peak validation figures (e.g., $\approx$99.4\% mAP@0.5 on the character detector and $\approx$98.1\% mAP@0.5 on LPD in the thesis performance table); this manuscript adopts the repository-exported epoch snapshots above to avoid mixing reporting conventions.

\subsection{Objectives}
Following the undergraduate project report \\emph{All-Weather IR-Based Smart Vehicle Gate Recognition System}, the essential objectives are:
\begin{enumerate}[label=\textbf{O\arabic*:},leftmargin=*]
  \item Create a real-time YOLO-based license plate detection unit to identify and locate license plates in vehicle images.
  \item Develop an intelligent YOLOv8 pipeline for plate crops with weather-aware preprocessing (Section~\ref{sec:pre}), YOLOv8n digit--letter detection, and deterministic token assembly (optional classical OCR baselines such as EasyOCR/Tesseract appear in the full report for comparison only).
  \item Detect vehicle types using EfficientNet-B0 for make and model classification (with additional CNN benchmarks such as ResNet18/EfficientNet-B4 documented in the full report).
  \item Implement authorization logic that cross-checks identified license plate text and vehicle model against an authorized vehicles database.
  \item Test performance under various conditions (day/night, glare, fog, rain, motion blur), targeting above 90\\% accuracy where applicable.
\end{enumerate}

\subsection{Contributions}
\begin{itemize}[leftmargin=*]
  \item A complete software pipeline that chains weather mitigation, YOLO-based LPR, and EfficientNet-B4 VMMR, with hyperparameters stated in the tables of Sections~\ref{sec:pre}--\ref{sec:vmmr}.
  \item Reproducible YOLOv8n LPD training and validation metrics on a single-class plate localization corpus with public-style licensing.
  \item YOLOv8n digit--letter detection on a 38-class Roboflow corpus (1{,}235 annotated plate crops), including box-level metrics at epoch~100 with the train/validation mirroring caveat noted in Section~\ref{subsec:lpchar}.
  \item A rain-removal module combining vertically directed median filtering with Telea inpainting on compact defect masks while excluding protected high-density edge regions.
  \item An integrated notebook driver that chains fog and rain restoration, dual YOLO heads, and ImageNet-normalized EfficientNet-B4 inference at $380\times380$, with qualitative grids suitable for inspection.
  \item A VMMR training recipe using label smoothing, AdamW, ReduceLROnPlateau scheduling, and early stopping, with reported macro metrics and Top-5 behavior on a fixed split.
  \item An explicit discussion of resolution inconsistencies: VMMR training at $224^2$ versus integrated inference at $380^2$, and LPD training near $384^2$ versus higher-resolution diagnostic passes at $640^2$.
\end{itemize}

\subsection{Paper Organization}
Section~\ref{sec:related} reviews ANPR, VMMR, restoration, transfer learning, and embedded vision. Section~\ref{sec:theory} summarizes CNNs, transfer learning, EfficientNet scaling, CLAHE, morphology, gamma correction, and OCR theory. Section~\ref{sec:system} presents the system and software/hardware architecture. Section~\ref{sec:data} summarizes datasets before modules that consume them. Sections~\ref{sec:pre}--\ref{sec:vmmr} detail preprocessing, LPR, and VMMR. Section~\ref{sec:gate} formalizes gate logic. Section~\ref{sec:impl} covers implementation. Section~\ref{sec:res} presents \emph{all} qualitative and tabular results in a fixed order (integrated weather pipeline, localization montages, LPD, character OCR, VMMR, then quantitative summaries). Section~\ref{sec:disc} discusses findings. Section~\ref{sec:conc} concludes. Appendices summarize supplementary mathematical notes, hardware placeholders, and dataset guidance.
""")
W((ROOT / "intro_expand.tex").read_text(encoding="utf-8"))

# --- II RELATED WORK (expanded fragment file) ---
W(r"""\section{Related Work}
\label{sec:related}
""")
W((ROOT / "related_work_block.tex").read_text(encoding="utf-8"))

# Continue with remaining sections in compressed generator below
# (III--XIII + appendices + bibliography)

W(r"""\section{Theoretical Background}
\label{sec:theory}
\subsection{Convolutional Neural Networks}
A 2D convolution with kernel $K$ on feature map $X$ at location $(i,j)$ is $(K * X)_{i,j}=\sum_m\sum_n K_{m,n}\,X_{i+m,j+n}$. ReLU activations $\phi(z)=\max(0,z)$ induce sparsity and mitigate vanishing gradients. Pooling reduces spatial resolution while promoting translation tolerance.

\subsection{Transfer Learning and Fine-Tuning}
Given a source task $S$ and target task $T$, transfer learning reuses representations $f_\theta$ learned on $S$ and adapts parameters on $T$. Fine-tuning updates all or a subset of layers; freezing early layers preserves generic edges/textures.

\subsection{EfficientNet and Compound Scaling}
EfficientNet scales depth $d$, width $w$, and resolution $r$ with compound coefficients: $d=\alpha^\phi$, $w=\beta^\phi$, $r=\gamma^\phi$ subject to $\alpha\beta^2\gamma^2\approx 2$. MBConv blocks invert bottlenecks with depthwise separable convolutions and squeeze-excitation gating.

\subsection{CLAHE Theory}
CLAHE limits contrast amplification using a clip limit $C$ to prevent noise amplification in homogeneous regions. Processing the L channel in LAB decouples luminance from chrominance, reducing hue shifts.

\subsection{Morphological Image Processing}
Erosion and dilation with structuring element $B$ are $(I \ominus B)(x)=\min_{b\in B}I(x+b)$ and $(I \oplus B)(x)=\max_{b\in B}I(x-b)$. Top-hat $T(I)=I-(I\circ B)$ highlights small bright structures when $B$ matches their scale.

\subsection{Gamma Correction}
Gamma maps intensities as $I_{\text{out}} = 255\cdot (I_{\text{in}}/255)^{1/\gamma}$. Values $\gamma<1$ brighten mid-tones; $\gamma>1$ darken them.

\subsection{OCR Pipeline Theory}
Classic OCR chains segmentation, feature extraction, and sequence decoding. Detection-based OCR with CNNs predicts character boxes directly.
""")
W((ROOT / "theory_expand_block.tex").read_text(encoding="utf-8"))

W(r"""\section{System Overview}
\label{sec:system}
\subsection{Full System Pipeline}
Figure~\ref{fig:flow} summarizes the intended deployment pipeline: acquisition $\rightarrow$ weather mitigation $\rightarrow$ LPR $\rightarrow$ VMMR $\rightarrow$ policy engine $\rightarrow$ actuation/logging.

\begin{figure}[!t]
\centering
\begin{tikzpicture}[node distance=6mm,>=Latex, font=\footnotesize,
  box/.style={draw, rounded corners, align=center, inner sep=2pt, minimum width=22mm}]
\node[box] (cam) {Camera\\Frame $I$};
\node[box, right=of cam] (wx) {Weather\\Mitigation};
\node[box, right=of wx] (lpr) {YOLO LPR\\$s$};
\node[box, right=of lpr] (vmmr) {EfficientNet\\VMMR $y$};
\node[box, below=of vmmr] (pol) {Policy\\$\mathcal{D}$};
\node[box, left=of pol] (act) {Gate /\\Alerts};
\draw[->] (cam)--(wx); \draw[->] (wx)--(lpr); \draw[->] (lpr)--(vmmr);
\draw[->] (vmmr)--(pol); \draw[->] (pol)--(act);
\end{tikzpicture}
\caption{High-level information flow for dual-modality gate access.}
\label{fig:flow}
\end{figure}

\subsection{Software Architecture}
The system separates \textbf{training} assets (YOLOv8n plate localization, YOLOv8n character detection, EfficientNet-B4 VMMR) from a \textbf{runtime} stack that chains weather mitigation, dual-head LPR, fine-grained recognition, and policy simulation. Plate localization is trained on a Roboflow Universe export (\emph{License Plate Project}, version~1, CC BY~4.0). Character detection uses a second Roboflow export (\emph{My First Project}, version~4) with 38 symbol classes. VMMR uses a 245-class image-folder taxonomy bundled with the training and testing notebooks. An integrated notebook performs fog/rain branches and batch overlays (Section~\ref{sec:pre}). A lightweight web dashboard provides REST endpoints for simulated arrivals and optional client-side tonal normalization. Inter-module flow is asynchronous: models are trained offline, then loaded for batch or interactive inference.

\subsection{Hardware Architecture}
The companion thesis Appendix~C specifies a lane hardware stack suitable for outdoor deployment at gated facilities. At a high level: an \textbf{IR-capable camera with co-located IR illuminator} records vehicle and plate imagery under night, rain, and fog; a \textbf{Orange Pi~5} (8\,GB class in the project brief) serves as the embedded processing unit for YOLO inference and the VMMR backbone at the edge; \textbf{weather and ambient-light sensors} are reserved for closed-loop preprocessing selection in future work (not yet integrated in the software-first milestone); a \textbf{sliding or swing gate motor} with a \textbf{commercial motor controller} (e.g., Centsys-class interfaces referenced in the report) translates low-power logic into safe actuation; a \textbf{regulated power supply}, \textbf{relay module} for isolation from high-power motor circuits, \textbf{industrial enclosure} (IP-rated), and managed \textbf{power/data cabling} complete the bill of materials. In the current repository milestone, camera streams are emulated from stills and recorded frames, inference is validated primarily on desktop-class GPUs, and physical gate motors are explicitly out of scope---Table~\ref{tab:hw} therefore distinguishes \emph{target field} components from \emph{present lab} validation.

\begin{table*}[!t]
\centering
\caption{Hardware components aligned with the thesis bill of materials (Appendix~C). Status: T=target deployment, L=lab/software validation in this repository.}
\label{tab:hw}
\footnotesize
\begin{tabular}{@{}p{0.19\textwidth}p{0.28\textwidth}c p{0.40\textwidth}@{}}
\toprule
Component & Model / role & St. & Purpose \\
\midrule
IR camera + illuminator & Pole/lane imager, 850\,nm IR fill & T & Even plate visibility at night and in haze \\
Embedded computer & Orange Pi~5 (8\,GB) & T & Edge inference + I/O to relay/controller \\
Validation workstation & CUDA-capable PC / Colab & L & Training and integrated notebook tests \\
Weather / light sensors & Rain, fog, lux probes & T & Future feedback to preprocessing branch \\
Gate motor & Sliding / swing mechanism & T & Physical lane barrier \\
Motor controller & Vendor gate drive (e.g., Centsys-class) & T & Safe motor commands from logic levels \\
Power supply unit & Regulated outdoor PSU & T & Stable power for camera, Pi, sensors \\
Relay module & Opto-isolated switching & T & Isolate Pi GPIO from motor loads \\
Enclosure \& glands & IP-rated cabinet & T & Environmental protection \\
Cabling & PoE or separate data + 12/24\,V runs & T & Power, Ethernet, sensor buses \\
\bottomrule
\end{tabular}
\end{table*}

\begin{figure}[!t]
\centering
\begin{tikzpicture}[font=\scriptsize, node distance=4mm]
\node[draw, rounded corners] (c) {IR cam + IR LED};
\node[draw, rounded corners, right=of c] (e) {OPI~5 edge};
\node[draw, rounded corners, right=of e] (r) {Relay};
\node[draw, rounded corners, right=of r] (m) {Motor drv.};
\node[draw, rounded corners, below=of m] (g) {Gate};
\draw (c)--(e)--(r)--(m)--(g);
\end{tikzpicture}
\caption{Target lane hardware signal chain (thesis Appendix~C): imaging and inference on the edge, isolated relay and commercial gate controller for the actuator.}
\end{figure}
""")

W(r"""\section{Dataset Description}
\label{sec:data}
The LPD corpus is the Roboflow-exported YOLOv8 bundle \emph{License Plate Project}, version~1 (single-class bounding boxes, CC BY~4.0). Images are JPEGs with sidecar YOLO labels; splits appear in Section~\ref{sec:lpr} and Table~\ref{tab:splits}.

The VMMR corpus organizes 245 make--model folders under standard train and test trees with an internal validation holdout described in Section~\ref{sec:vmmr}. The character detector uses Roboflow \emph{My First Project}, version~4 (1{,}235 annotated crops, 38 classes). Qualitative and quantitative evaluations are consolidated in Section~\ref{sec:res}.
""")

# Section V -- preprocessing (qualitative figures deferred to Section~\ref{sec:res})
W(r"""\section{Image Preprocessing Module}
\label{sec:pre}
\subsection{Scope and Integration}
Fog and rain restoration run in the same notebook environment as the dual YOLO heads and the VMMR classifier so that qualitative sweeps stay configuration-aligned. Three learned models are supplied at runtime: a YOLO plate detector, a YOLO character head with a 38-way label map, and an EfficientNet-B4 classifier over 245 make--model classes. The fog path applies a two-stage dark-channel prior with guided filtering, optional residual-haze masking, gray-world balance, data-driven gamma, CLAHE on luminance in LAB space, a mild saturation gain, bilateral smoothing, and light unsharp blending. The rain path builds an edge-protection mask, applies stacked vertical median filters with a brightening guard to limit halos on glyphs, then inpaints compact residual spots with a fast-marching variant. Low-light panels reuse the same downstream weights after a separate tonal enhancement; they appear with the fog and rain grids in Section~\ref{sec:res} (Subsection~\ref{subsec:prefigs}). Wide dynamic range and infrared illumination remain important at the camera (Section~\ref{sec:system}).

\subsection{End-to-End Inference Chain}
The integrated driver classifies the full frame at $380\times380$, runs plate detection at confidence 0.25, margin-pads each crop, runs the character detector at the same threshold, sorts detections along the horizontal axis, and formats up to three leading letters and up to four trailing digits for regional plate styling.

\subsection{Demonstration Workflow}
Fog and rain branches are exercised as separate batches (up to ten uploads per branch) with side-by-side grids for inputs and restored outputs, followed by the same inference overlays. Operators pick the branch manually; automatic weather classification is left for future work.

\subsection{Dashboard and Deployment Hooks}
Optional client-side tonal normalization can precede uploads for glare-heavy clips. A future service wrapper could route each frame through fog mitigation, rain mitigation, or identity based on upstream sensing; the current dashboard exposes a simulated weather mode for demonstrations.

\begin{table}[!t]
\centering
\caption{Representative restoration and rain-removal hyperparameters.}
\label{tab:preparams}
\begin{tabular}{@{}ll@{}}
\toprule
Component & Setting \\
\midrule
Fog DCP patch / $\omega$ (primary) & $13\times13$ / 0.95 \\
Fog guided filter ($r$, $\varepsilon$) & 50, $10^{-3}$ \\
Fog residual mask & mean${>}170$, std${<}30$, Gaussian blur $21\times21$ \\
Fog CLAHE & clip limit 2.5, tiles $8\times8$ \\
Rain bilateral / Canny & (9,75,75) / (50,150) \\
Rain vertical medians & $k\in\{15,11,7\}$ \\
Rain brightening guard & discard if $\Delta$mean${>}2$ \\
Rain Telea inpaint & radius 3, spots area $\in(2,250)$ \\
\bottomrule
\end{tabular}
\end{table}
""")

W(r"""\section{License Plate Recognition Module}
\label{sec:lpr}
\subsection{Pipeline Overview}
LPR proceeds in two stages: (i) YOLOv8n plate localization; (ii) padded crops fed to a YOLOv8n character detector with deterministic reading order and regional formatting. Stage~(i) is trained on the Roboflow export below; stage~(ii) is trained on \emph{My First Project} version~4 (Section~\ref{subsec:lpchar}) and consumed by the integrated notebook of Section~\ref{sec:pre}.

\subsection{License Plate Detection (YOLOv8n LPD)}
The LPD corpus is the Roboflow Universe export \emph{License Plate Project}, version~1 (single-class boxes, CC BY~4.0). The published split lists \textbf{20{,}580} training, \textbf{1{,}973} validation, and \textbf{978} test frames (\textbf{23{,}531} total). Training uses YOLOv8n for 50 epochs with batch~32 and a requested input size of 380 pixels; stride rounding yields an effective $384\times384$ train/validation canvas. Mixed precision and default Ultralytics augmentations are enabled; runs were executed on a cloud GPU (Tesla~T4 class). Table~\ref{tab:lpdtrain} summarizes the archived configuration; Table~\ref{tab:lpdmetrics} reports epoch~50 validation box metrics (localization only, not transcription).

\begin{table}[!t]
\centering
\caption{LPD training configuration (archived run).}
\label{tab:lpdtrain}
\begin{tabular}{@{}ll@{}}
\toprule
Field & Value \\
\midrule
Architecture & YOLOv8n (nano, ImageNet-pretrained backbone) \\
Epochs / batch / request size & 50 / 32 / 380 (effective $384\times384$ train/val) \\
NMS train IoU & 0.7 (default) \\
Optimizer / AMP & automatic (MuSGD in log) / enabled \\
Run identifier & lp\_detector2 (auto-suffixed) \\
Runtime (logged) & Ultralytics 8.4.x, PyTorch 2.10+cu128, Tesla T4 \\
Splits & Roboflow train / valid / test \\
\bottomrule
\end{tabular}
\end{table}

\begin{table}[!t]
\centering
\caption{LPD validation metrics at epoch~50 (box localization).}
\label{tab:lpdmetrics}
\begin{tabular}{@{}lcccc@{}}
\toprule
Metric & P & R & mAP@0.5 & mAP@0.5:0.95 \\
\midrule
Value & 0.9850 & 0.9553 & 0.9807 & 0.7073 \\
\bottomrule
\end{tabular}
\end{table}

Additional qualitative passes at $640\times640$ are used for visualization; numbers from those passes may differ slightly from the stride-rounded training log, so service resolution should be harmonized for strict comparisons.

\subsection{Character and Digit Detection (YOLOv8n)}
\label{subsec:lpchar}
Stage~(ii) trains for 100 epochs at $640\times640$ on \textbf{1{,}235} crops from Roboflow \emph{My First Project}, version~4 (CC BY~4.0), with 38 classes covering digits, uppercase letters, and export-specific tokens. The public bundle ships training images only; the training recipe mirrors that pool into validation, so Table~\ref{tab:lpcharmetrics} must be read with that caveat. Roboflow resized exports to $512\times512$ with stretch; Ultralytics then applies its default augmentation stack at the training resolution.

\begin{table}[!t]
\centering
\caption{LPR character-stage training configuration.}
\label{tab:lpchartrain}
\begin{tabular}{@{}ll@{}}
\toprule
Field & Value \\
\midrule
Architecture & YOLOv8n (nano) \\
Epochs / batch / size & 100 / 16 / $640\times640$ \\
Dataset & Roboflow \emph{My First Project} v4 \\
Classes & 38 \\
Validation split note & No held-out exporter split; validation mirrors training \\
\bottomrule
\end{tabular}
\end{table}

\begin{table}[!t]
\centering
\caption{LPR character-stage validation summary at epoch~100 (mirrored validation pool; values match Figure~\ref{fig:ocrmetrics}).}
\label{tab:lpcharmetrics}
\begin{tabular}{@{}lc@{}}
\toprule
Metric & Value \\
\midrule
mAP@0.5 & 0.994 \\
Precision & 0.990 \\
Recall & 0.968 \\
F1 score & 0.979 \\
FPR & 0.010 \\
mAP@0.5:0.95 (Ultralytics export) & 0.7611 \\
\bottomrule
\end{tabular}
\end{table}

\subsection{Integrated Runtime Hooks}
The integrated stack reuses the LPD checkpoint with confidence 0.25, applies the same threshold on characters, and maps logits through the 38-way label map from this stage.

\subsection{Formatting Heuristic}
Glyphs are sorted by horizontal center; up to three leading letters and up to four trailing digits survive, with a hyphen inserted when both letter and digit groups exist (regional style).

\subsection{End-to-End String Metrics}
Character-level metrics appear in Table~\ref{tab:lpcharmetrics}; plate localization metrics appear in Table~\ref{tab:lpdmetrics}. Per-string accuracy under weather branches is \textbf{pending}. Qualitative detector panels appear in Section~\ref{sec:res}.

\begin{table}[!t]
\centering
\caption{LPR string accuracy under conditions (pending controlled evaluation).}
\label{tab:lprstring}
\begin{tabular}{@{}lcccc@{}}
\toprule
Condition & Acc. & Prec. & Recall & F1 \\
\midrule
Clear & \multicolumn{4}{c}{\textbf{Results pending}} \\
Fog (mitigated) & \multicolumn{4}{c}{\textbf{Results pending}} \\
Rain (mitigated) & \multicolumn{4}{c}{\textbf{Results pending}} \\
\bottomrule
\end{tabular}
\end{table}
""")

W(r"""\section{VMMR Module}
\label{sec:vmmr}
\subsection{Architecture}
Vehicle make and model recognition uses EfficientNet-B4 initialized from ImageNet, replacing the classifier head with a 245-way linear layer. Training enables cuDNN autotuning for steady shapes, saves the best checkpoint with embedded class names and optimizer state, and pairs with a second notebook for interactive uploads at $224\times224$ with the same normalization.

\subsection{Dataset}
The VMMR corpus follows ImageNet-style folders with 245 vehicle classes. A verification pass skipped one unreadable asset before training. After filtering, counts are \textbf{31{,}904} training images, \textbf{7{,}977} validation images (20\% holdout inside training), and \textbf{17{,}254} held-out test images.

\subsection{Training Configuration}
Cross-entropy with label smoothing 0.1, AdamW at learning rate $10^{-4}$, ReduceLROnPlateau on validation loss (factor 0.5, patience 2), early stopping with patience 5, and a fifty-epoch budget with optional resume from the best checkpoint. Batch size is 32 when GPU memory allows otherwise 16; two dataloader workers feed shuffled training tiles. Augmentations include random resized crop to $224^2$, horizontal flip, mild photometric jitter, and light rotation, followed by ImageNet mean--variance normalization; evaluation uses a fixed $224^2$ resize. Logged runs used PyTorch~2.10 and torchvision~0.25 on a Tesla~T4; wall-clock per epoch was roughly ten to eleven minutes in the captured trace.

\subsection{Qualitative Artifacts}
Beyond scalars, the training notebook exports loss and accuracy curves, learning-rate schedules, macro-metric heatmaps, tiled confusion summaries, and annotated Top-5 galleries suitable for camera-ready figures.

\subsection{Inference Resolution Note}
Training and interactive tests use $224^2$ inputs whereas the integrated driver uses $380^2$ inputs; aligning these resolutions is recommended before field deployment.

\subsection{Reported Test Metrics}
Top-1 accuracy 0.9624; Top-5 accuracy 0.9939; macro precision 0.9634; macro recall 0.9612; macro F1 0.9618; macro FPR 0.0002.

\begin{table}[!t]
\centering
\caption{VMMR training hyperparameters (single-phase fine-tuning; all backbone layers trainable).}
\begin{tabular}{@{}lcc@{}}
\toprule
Parameter & Value & Notes \\
\midrule
Epochs & 50 & Early stop patience 5 \\
Optimizer & AdamW & lr $10^{-4}$ \\
Scheduler & ReduceLROnPlateau & minimize val.\ loss; factor 0.5; patience 2 \\
Batch (12GB+) & 32 & else 16 \\
DataLoader workers & 2 & Train shuffle on \\
Split seed & 42 & Train/val permutations \\
Input train & $224^2$ & RandomResizedCrop + augments \\
Input infer (pipeline) & $380^2$ & See skew note \\
\bottomrule
\end{tabular}
\end{table}

\begin{table}[!t]
\centering
\caption{Dataset split summary (Roboflow exports for LPR; notebook counts for VMMR). Character training mirrors the training pool into validation (Section~\ref{subsec:lpchar}).}
\label{tab:splits}
\begin{tabular}{@{}lrrrr@{}}
\toprule
Split & Train & Val & Test & Total \\
\midrule
LPD (Roboflow v1) & 20580 & 1973 & 978 & 23531 \\
LPR chars (\emph{My First Project} v4) & 1235 & 0 & 0 & 1235 \\
VMMR (245-class corpus) & 31904 & 7977 & 17254 & 57135 \\
\bottomrule
\end{tabular}
\end{table}
""")

W(r"""\section{Gate Decision Logic}
\label{sec:gate}
\subsection{Dual Verification Concept}
Dual verification compares predicted plate $s$ against a whitelist entry and requires consistency with expected make/model attributes when such metadata is registered, mitigating simple plate forgery.

\subsection{Whitelist Schema}
The dashboard stores license text, make, model, owner display name, access mode (allow, deny, or temporary), optional validity windows, and an optional reference photo for operators.

\subsection{Decision Logic}
\begin{enumerate}[label=\arabic*.,leftmargin=*]
  \item If the predicted plate and predicted make--model pair matches an allow record, issue \textsc{grant}.
  \item If the plate matches a registered entry but the predicted make--model conflicts with stored attributes, issue \textsc{alert} (possible cloned plate).
  \item Otherwise issue \textsc{deny} for unknown plates.
\end{enumerate}

\subsection{Actuation and Logging}
Physical gate timing (dwell, debounce) awaits final hardware integration. The prototype dashboard logs simulated decisions through REST APIs.

\subsection{Logging and Alerts}
Security operations should push \textsc{alert} outcomes to an operator console and retain imagery for adjudication.
""")

W(r"""\section{Implementation Details}
\label{sec:impl}
\subsection{Development Environment}
Training and evaluation notebooks target Python~3.10 on Google Colab with PyTorch~2.10, torchvision~0.25, CUDA~12.x, and Tesla~T4 GPUs. Ultralytics supplies YOLOv8; OpenCV supplies preprocessing operators.

\subsection{Training Infrastructure}
Wall-clock logs show roughly ten to eleven minutes per VMMR epoch on the logged Tesla~T4 after resuming mid-run; exact minutes depend on cloud throttling.

\begin{table}[!t]
\centering
\caption{Software stack (versions are environment-dependent).}
\begin{tabular}{@{}lll@{}}
\toprule
Library & Version & Purpose \\
\midrule
Python & 3.10 (Colab) & Runtime \\
PyTorch / torchvision & (runtime) & VMMR \\
OpenCV & (runtime) & Preprocess \\
Ultralytics & (runtime) & YOLOv8 \\
Node.js / Sharp & (dashboard) & API + optional tonal hook \\
\bottomrule
\end{tabular}
\end{table}
""")
W((ROOT / "operations_expansion.tex").read_text(encoding="utf-8"))

# Results: all qualitative material in pipeline order, then quantitative blocks
W(r"""\section{Results and Evaluation}
\label{sec:res}
\subsection{How this section is organized}
Subsections appear in the same order as the live gate pipeline: weather-conditioned inputs and restored overlays (Subsection~\ref{subsec:prefigs}); coarse plate-localization montages (Subsection~\ref{subsec:lpdmontage}); detailed LPD learning and diagnostics (Subsection~\ref{subsec:lpdfigs}); character-stage OCR (Subsection~\ref{subsec:lpocrfigs}); VMMR panels (Subsection~\ref{subsec:vmmrfigs}); then quantitative summaries, timing placeholders, metric interpretation notes, and a compact comparison table.

""")
emit_pre_pipeline_results_section()
W(
    r"""\subsection{Plate localization montages}
\label{subsec:lpdmontage}
These thumbnails preview detector behaviour before the full LPD training and validation figures in Subsection~\ref{subsec:lpdfigs}.

\begin{figure*}[t]
\centering
"""
)
for i, fp in enumerate(FIGS[:4]):
    W(
        "\\begin{subfigure}[b]{0.23\\textwidth}\\centering\n"
        f"\\includegraphics[width=\\linewidth]{{{fp}}}\n"
        f"\\caption{{Sample {i+1}}}\n\\end{{subfigure}}\\hfil"
    )
W(
    r"""\caption{Sample YOLO prediction exports (qualitative repository artifacts).}
\label{fig:y1}
\end{figure*}

\begin{figure*}[t]
\centering
"""
)
for i, fp in enumerate(FIGS[4:8]):
    W(
        "\\begin{subfigure}[b]{0.23\\textwidth}\\centering\n"
        f"\\includegraphics[width=\\linewidth]{{{fp}}}\n"
        f"\\caption{{Sample {i+5}}}\n\\end{{subfigure}}\\hfil"
    )
W(
    r"""\caption{Additional prediction exports (repository artifacts).}
\label{fig:y4}
\end{figure*}

\begin{figure*}[t]
\centering
"""
)
for i, fp in enumerate(FIGS[8:12]):
    W(
        "\\begin{subfigure}[b]{0.23\\textwidth}\\centering\n"
        f"\\includegraphics[width=\\linewidth]{{{fp}}}\n"
        f"\\caption{{Export {i+9}}}\n\\end{{subfigure}}\\hfil"
    )
W(
    r"""\caption{Further qualitative detector exports for appendix-style review.}
\label{fig:yextra}
\end{figure*}

\subsection{License Plate Detection (LPD) Visual and Diagnostic Results}
\label{subsec:lpdfigs}
Figures~\ref{fig:lpdqual1}--\ref{fig:lpdqual2} show representative prediction outputs from the trained YOLOv8n LPD checkpoint on clear-day scenes, a night/rain frame, a dual-plate parking-lot view, and a multi-lane highway frame. Figure~\ref{fig:lpdheatmap} summarizes scalar detection metrics (F1 $=0.9347$, recall $=0.9269$, accuracy $=0.9502$, precision $=0.9427$, FPR $=0.0573$) from a higher-resolution validation pass at $640\times640$, which is orthogonal to the epoch-wise Box metrics in Table~\ref{tab:lpdmetrics}. Figure~\ref{fig:lpdvalbatch} shows a validation batch mosaic; Fig.~\ref{fig:lpddataset} plots label statistics; Fig.~\ref{fig:lpdtraincurves} reports 50-epoch training/validation losses and Box mAP curves; Figs.~\ref{fig:lpdcurves4}--\ref{fig:lpdconf} give F1/P/R/PR--confidence diagnostics and confusion matrices (including normalized recall view).

\begin{figure*}[t]
\centering
\begin{subfigure}[b]{0.32\textwidth}\centering
\includegraphics[width=\linewidth]{figures/lpd/lpd_pred_clear_corolla.png}
\caption{Clear daylight (frontal sedan).}
\end{subfigure}\hfil
\begin{subfigure}[b]{0.32\textwidth}\centering
\includegraphics[width=\linewidth]{figures/lpd/lpd_pred_clear_mehran.png}
\caption{Clear daylight (regional plate styling).}
\end{subfigure}\hfil
\begin{subfigure}[b]{0.32\textwidth}\centering
\includegraphics[width=\linewidth]{figures/lpd/lpd_pred_rain_night.png}
\caption{Night rain / glare (two detections).}
\end{subfigure}
\caption{Qualitative LPD outputs (bounding boxes and confidences overlaid by Ultralytics).}
\label{fig:lpdqual1}
\end{figure*}

\begin{figure*}[t]
\centering
\begin{subfigure}[b]{0.48\textwidth}\centering
\includegraphics[width=\linewidth]{figures/lpd/lpd_pred_parking_dual.png}
\caption{Parking-lot dual plates.}
\end{subfigure}\hfil
\begin{subfigure}[b]{0.48\textwidth}\centering
\includegraphics[width=\linewidth]{figures/lpd/lpd_pred_highway_dual.png}
\caption{Highway scene (multi-lane).}
\end{subfigure}
\caption{Additional qualitative LPD results under outdoor daylight.}
\label{fig:lpdqual2}
\end{figure*}

\begin{figure}[t]
\centering
\includegraphics[width=\linewidth]{figures/lpd/lpd_metrics_heatmap.png}
\caption{Scalar performance heatmap for LPD (validation export at $640\times640$, confidence 0.25).}
\label{fig:lpdheatmap}
\end{figure}

\begin{figure*}[t]
\centering
\includegraphics[width=0.95\linewidth]{figures/lpd/lpd_val_batch_labels.png}
\caption{Validation batch mosaic with ground-truth boxes (Roboflow-style tiles).}
\label{fig:lpdvalbatch}
\end{figure*}

\begin{figure*}[t]
\centering
\includegraphics[width=0.95\linewidth]{figures/lpd/lpd_dataset_labels.png}
\caption{Dataset label analysis: class counts, box shapes, center and size heatmaps.}
\label{fig:lpddataset}
\end{figure*}

\begin{figure*}[t]
\centering
\includegraphics[width=\linewidth]{figures/lpd/lpd_training_results.png}
\caption{Training and validation losses plus Box precision, recall, mAP@0.5, and mAP@0.5:0.95 over 50 epochs.}
\label{fig:lpdtraincurves}
\end{figure*}

\begin{figure*}[t]
\centering
\begin{subfigure}[b]{0.48\textwidth}\centering
\includegraphics[width=\linewidth]{figures/lpd/lpd_curve_f1.png}
\caption{F1--confidence.}
\end{subfigure}\hfil
\begin{subfigure}[b]{0.48\textwidth}\centering
\includegraphics[width=\linewidth]{figures/lpd/lpd_curve_precision.png}
\caption{Precision--confidence.}
\end{subfigure}\\[1.5ex]
\begin{subfigure}[b]{0.48\textwidth}\centering
\includegraphics[width=\linewidth]{figures/lpd/lpd_curve_recall.png}
\caption{Recall--confidence.}
\end{subfigure}\hfil
\begin{subfigure}[b]{0.48\textwidth}\centering
\includegraphics[width=\linewidth]{figures/lpd/lpd_curve_pr.png}
\caption{Precision--recall (AP / mAP@0.5).}
\end{subfigure}
\caption{Ultralytics diagnostic curves for the plate class.}
\label{fig:lpdcurves4}
\end{figure*}

\begin{figure*}[t]
\centering
\begin{subfigure}[b]{0.48\textwidth}\centering
\includegraphics[width=\linewidth]{figures/lpd/lpd_confusion_matrix.png}
\caption{Counts confusion matrix.}
\end{subfigure}\hfil
\begin{subfigure}[b]{0.48\textwidth}\centering
\includegraphics[width=\linewidth]{figures/lpd/lpd_confusion_normalized.png}
\caption{Normalized confusion matrix.}
\end{subfigure}
\caption{Confusion summaries for plate versus background.}
\label{fig:lpdconf}
\end{figure*}
""")
emit_lpr_char_results_section()
emit_vmmr_results_section()
W(
    r"""\subsection{Quantitative summaries and deployment notes}
Plate localization metrics appear in Table~\ref{tab:lpdmetrics}; training settings in Table~\ref{tab:lpdtrain}. Character-stage box metrics and hyperparameters appear in Tables~\ref{tab:lpcharmetrics} and~\ref{tab:lpchartrain} (Section~\ref{subsec:lpchar}). End-to-end string metrics remain pending (Table~\ref{tab:lprstring}). VMMR scalars are stated in Section~\ref{sec:vmmr}. Pending on-target latency is tabulated below, followed by a compact comparison to representative stacks and metric-interpretation notes that accompany the reported numbers.

\begin{table}[!t]
\centering
\caption{End-to-end processing time per module (pending on-target profiling).}
\begin{tabular}{@{}ll@{}}
\toprule
Module & Avg.\ time (ms) \\
\midrule
Preprocess & Pending \\
Plate detect & Pending \\
Chars & Pending \\
VMMR & Pending \\
\bottomrule
\end{tabular}
\end{table}

\begin{table*}[!t]
\centering
\caption{Comparison with representative systems (fill with measured numbers). $^\dagger$Character-stage mAP@0.5 is from epoch~100 with validation images mirrored from training (Section~\ref{subsec:lpchar}).}
\begin{tabular}{@{}lccccc@{}}
\toprule
System & LPD mAP@0.5 & Char mAP@0.5$^\dagger$ & VMMR Top-1 & Weather & Dual \\
\midrule
This work & 0.9807 & 0.9807 & 0.9624 & Fog/Rain hooks & Planned \\
\bottomrule
\end{tabular}
\end{table*}

\subsection{Hardware Deployment}
\fbox{\parbox{0.98\columnwidth}{\centering Hardware deployment photographs and relay timing measurements to be inserted after field testing.}}
"""
)
W((ROOT / "metrics_expand.tex").read_text(encoding="utf-8"))

W(r"""\section{Discussion}
\label{sec:disc}
\subsection{Preprocessing Effectiveness}
Fog mitigation increases global contrast but can amplify noise in sky regions; rain removal must preserve high-frequency plate strokes---protection masks are therefore critical.

\subsection{LPR Analysis}
High mAP@0.5 for LPD reduces missed plates but does not guarantee correct OCR; the character head likewise reports strong box mAP@0.5 (Table~\ref{tab:lpcharmetrics}) yet the Roboflow v4 export lacks a disjoint validation split, so those figures optimistically reuse training imagery. YOLO character models can still confuse similar glyphs under motion blur. Confidence thresholding and temporal voting across frames remain important, especially when preprocessing is aggressive.

\subsection{VMMR Analysis}
Macro-FPR reported as 0.0002 should be interpreted cautiously under class imbalance; per-class confusion tail remains in fine-grained siblings (e.g., consecutive model years).

\subsection{Dual Verification Security}
Requiring agreement between a plate string and a coarse body-style class does not stop all adversarial scenarios but raises the bar versus plate-only systems.

\subsection{Limitations}
Dataset coverage, VMMR train/serve resolution mismatch (224 versus 380), LPD effective train size (384) versus higher-resolution diagnostic passes (640), absence of a held-out Roboflow split for the 38-class character detector (metrics reflect mirrored training pools), manual fog-versus-rain workflows without automatic weather routing, pending end-to-end string benchmarks under weather branches, and simulated dashboard predictions.

""")

W(r"""\section{Conclusion and Future Work}
\label{sec:conc}
\subsection{Conclusion}
We presented a dual-stream gate access research system combining dark-channel fog mitigation, directional median rain removal, two-stage YOLOv8 LPR (YOLOv8n LPD plus YOLOv8n digit--letter detection), and EfficientNet-B4 VMMR, with a dashboard prototype for policy visualization. The LPD stage trained on the Roboflow \emph{License Plate Project} v1 export achieves validation precision 0.9850, recall 0.9553, mAP@0.5 0.9807, and mAP@0.5:0.95 0.7073 at epoch~50. The character stage, trained on Roboflow \emph{My First Project} v4, reaches precision 0.9899, recall 0.9688, mAP@0.5 0.9807, and mAP@0.5:0.95 0.7611 at epoch~100 under the mirrored train/validation configuration noted in Section~\ref{subsec:lpchar}. Reported VMMR test accuracy reaches 0.9624 Top-1 on 17{,}254 test images with strong Top-5 behavior (Top-5 $=0.9939$), alongside macro precision/recall/F1 of 0.9634/0.9612/0.9618 respectively.

\subsection{Future Work}
Future work includes: (i) snow and dense-smog preprocessing modules paired with new datasets; (ii) harmonizing training and deployment resolutions (VMMR 224 versus 380; LPD 384 train versus 640 diagnostic inference; character model 640 versus downstream resize) via fine-tuning or export at a single service resolution; (iii) TensorRT/OpenVINO export for Jetson-class devices; (iv) temporal fusion and confidence hysteresis for both LPR and VMMR; (v) federated learning for privacy-preserving multi-site updates; (vi) a cloud dashboard with immutable audit logs; (vii) mobile app integration for visitor preregistration; (viii) calibrated end-to-end LPR string benchmarks and character-detector mAP under each weather branch, with published precision--recall curves; and (ix) refreshing the Roboflow character corpus with a dedicated validation split so stage~(ii) metrics reflect held-out crops rather than mirrored training pools.

\section*{Acknowledgment}
The authors thank Dr.~Taimoor Naeem, Department of Computer Engineering, COMSATS University Islamabad, Lahore Campus, for supervision and technical guidance.

\appendices
""")
W((ROOT / "appendix_math.tex").read_text(encoding="utf-8"))
W(
    r"""\section{Hardware Specifications}
This appendix mirrors the thesis Appendix~C component list and defers exact GPIO and drive interfacing until the Orange Pi~5 is wired to a chosen relay module and gate motor controller. A qualified electrician should complete mains-side work; the Pi only exposes logic-level signals.

\fbox{\parbox{0.98\columnwidth}{\centering Insert enclosure layout, relay module part number, motor controller manual excerpt, and fused PSU diagram after hardware freeze.}}

\begin{table}[!t]
\centering
\caption{Planned interface signals (BCM numbering for Orange Pi~5; verify against module datasheets).}
\begin{tabular}{@{}lll@{}}
\toprule
Signal & Pin (BCM) & Notes \\
\midrule
Relay channel 1 (grant) & TBD & Active-high or low per module; flyback diode on coil \\
Relay GND & GND & Common return \\
Optional sensor I$^2$C & GPIO\,2/3 (SDA/SCL) & Weather / lux boards (future) \\
Status LED & TBD & Optional lane feedback \\
\bottomrule
\end{tabular}
\end{table}

\section{Dataset Samples}
Use the same YOLO export figures or stratified thumbnails from the held-out test split when publishing supplementary tiles.

\clearpage
\balance
\nocite{r01,r02,r03,r04,r05,r06,r07,r08,r09,r10,r11,r12,r13,r14,r15,r16,r17,r18,r19,r20,r21,r22,r23,r24,r25,r26,r27,r28,r29,r30,r31,r32,r33,r34,r35,r36,r37,r38,r39,r40,r41,r42}
\bibliographystyle{IEEEtran}
\bibliography{references}

\end{document}
"""
)

out = ROOT / "research_paper.tex"
out.write_text("\n".join(lines), encoding="utf-8")
print("Wrote", out, "chars", len("\n".join(lines)))
