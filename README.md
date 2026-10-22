# Smart Vehicle Access System (LPD · VMMR)

**FYP** — License Plate Detection (LPD), OCR, and Vehicle Make/Model Recognition (VMMR) for automated gate access.  
**Live demo:** [automated-gate-access.vercel.app](https://automated-gate-access.vercel.app)  
**Author:** [Ali Raza Chaudhry](https://github.com/alirazach476)

<p align="center">
  <a href="#demo"><strong>Demo video</strong></a>
  &nbsp;·&nbsp;
  <a href="#results"><strong>Results gallery</strong></a>
  &nbsp;·&nbsp;
  <a href="#lpd-ocr">LPD &amp; OCR</a>
  &nbsp;·&nbsp;
  <a href="#vmmr">VMMR</a>
  &nbsp;·&nbsp;
  <a href="#weather">All-weather</a>
  &nbsp;·&nbsp;
  <a href="#live"><strong>Live system</strong></a>
  &nbsp;·&nbsp;
  <a href="#layout">Repo layout</a>
</p>

---

<a id="demo"></a>

## Demo video

https://github.com/alirazach476/Smart-Vehicle-Access-System-LPD-VMMR/raw/main/media/alpr.mp4

<video src="media/alpr.mp4" controls width="100%"></video>

[▶ Download / open `media/alpr.mp4`](./media/alpr.mp4)

<p align="right"><a href="#smart-vehicle-access-system-lpd--vmmr">↑ Back to top</a></p>

---

<a id="results"></a>

## Results gallery

<a id="lpd-ocr"></a>

### License plate detection & OCR

<p align="center">
  <img src="media/lpd-ocr-results.png" width="100%" alt="License Plate Detection & OCR Results" />
</p>

<p align="center">
  <img src="media/lpd-ocr-results-2.png" width="100%" alt="License Plate Detection & OCR Results (additional)" />
</p>

<p align="center">
  <img src="media/character-detection-grid.png" width="100%" alt="Per-character detection on Pakistani plates" />
</p>

<p align="center">
  <img src="media/plate-char-labels-batch0.png" width="48%" alt="Plate character labels batch 0" />
  &nbsp;
  <img src="media/plate-char-labels-batch2.png" width="48%" alt="Plate character labels batch 2" />
</p>

<p align="center">
  <img src="media/ocr-confusion-matrix.png" width="70%" alt="OCR confusion matrix" />
</p>

<a id="vmmr"></a>

### VMMR — make / model recognition

<p align="center">
  <img src="media/vmmr-top5-predictions.png" width="100%" alt="VMMR top-5 predictions grid" />
</p>

<p align="center">
  <img src="media/vmmr-suzuki-hustler.png" width="48%" alt="VMMR prediction — Suzuki Hustler" />
  &nbsp;
  <img src="media/vmmr-honda-civic.png" width="48%" alt="VMMR prediction — Honda Civic" />
</p>

<p align="center">
  <img src="media/vmmr-245-confusion-matrix.png" width="70%" alt="Full VMMR confusion matrix — 245 classes" />
</p>

<p align="center">
  <img src="media/test-metrics-heatmap.png" width="80%" alt="Test metrics heatmap — Acc / Prec / Rec / F1 / FPR" />
</p>

**Test metrics:** Acc **0.962** · Prec **0.963** · Rec **0.961** · F1 **0.962** · FPR **0.000**

<a id="weather"></a>

### All-weather robustness

| Condition | Original | After enhancement |
|:----------|:---------|:------------------|
| Night | ![Original night](media/original-night-images.png) | ![After night enhancement](media/after-night-enhancement.png) |
| Fog | ![Original foggy](media/original-foggy-images.png) | ![After fog removal](media/after-fog-removal.png) |
| Rain | ![Original rainy](media/original-rainy-images.png) | ![After rain removal](media/after-rain-removal.png) |

### Extra demo frames

<p align="center">
  <img src="media/demo-extra-1.png" width="32%" alt="Demo extra 1" />
  <img src="media/demo-extra-2.png" width="32%" alt="Demo extra 2" />
  <img src="media/demo-extra-3.png" width="32%" alt="Demo extra 3" />
</p>

<p align="right"><a href="#smart-vehicle-access-system-lpd--vmmr">↑ Back to top</a></p>

---

## Pipeline overview

1. **Preprocessing** — night enhancement, fog removal, rain removal  
2. **LPD** — detect license plate region  
3. **OCR** — character detection + recognition  
4. **VMMR** — vehicle make / model classification  
5. **Access decision** — gate allow / deny via dashboard  

---

<a id="live"></a>

## Live system

Dashboard / web app: **[automated-gate-access.vercel.app](https://automated-gate-access.vercel.app)**

---

<a id="layout"></a>

## Repo layout

Root is kept short on purpose — open folders only if you need code or papers:

| Path | What’s inside |
|:-----|:--------------|
| [`media/`](./media) | **Demo video + all result images** (start here) |
| [`Smart Vehicle Access System Dashboard/`](./Smart%20Vehicle%20Access%20System%20Dashboard) | Web dashboard |
| [`pipeline/`](./pipeline) · [`inference_pipeline.py`](./inference_pipeline.py) | End-to-end inference |
| [`models/`](./models) · [`weights/`](./weights) | Trained model assets |
| [`figures/`](./figures) · [`output/`](./output) | Extra figures / run outputs |
| [`training/`](./training) | LPD / OCR / VMMR training notebooks & code |
| [`docs/`](./docs) | Reports, papers, slides, LaTeX |
| [`scripts/`](./scripts) | Build / sync helper scripts |

---

## License

Academic FYP project — see [`docs/`](./docs) for papers and slides.
