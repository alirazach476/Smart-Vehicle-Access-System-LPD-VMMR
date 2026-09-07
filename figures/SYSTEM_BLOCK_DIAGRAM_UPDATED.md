# Figure 3.2.1 — Updated High-Level Block Diagram

## Smart Vehicle Gate Recognition System (Complete FYP — 2026)

Use this text to redraw in Draw.io / PowerPoint, or use the generated PNG:
`figures/system_block_diagram_updated.png`

---

### 1. INITIALIZATION (Orange Pi — `orange_pi_deploy/`)

```
System Start
    ├── Load YOLOv8n Plate Model (plate_best.pt)
    ├── Load YOLOv8n Char/Digit Model — 38 classes (char_best.pt)
    ├── Load EfficientNet-B4 VMMR — 245 classes (efficientnet_b4_best.pth + classes.txt)
    └── Load Vehicle Database + Config (vehicles.json, config.py, GATE_DEVICE_TOKEN)
```

---

### 2. INPUT & WEATHER PREPROCESSING

```
Capture Frame / Load Image (USB 1080p camera OR batch folder)
        ↓
Weather Detect (auto | none | fog | rain | night)
        ↓
Apply Enhancement
  • Fog  → DCP defog + guided filter
  • Rain → Vertical median + inpaint
  • Night → CLAHE + gamma + saturation
```

---

### 3. AI INFERENCE (`pipeline.py` — target ≤ 2 seconds)

```
Preprocessed Image
        ↓
Run EfficientNet-B4 VMMR → Predicted Make/Model + Confidence
        ↓
Run YOLOv8n License Plate Detection → Bounding Box(es)
        ↓
    ┌─── Plate Detected? ───┐
   No                       Yes
    ↓                         ↓
Log: NO PLATE          Crop Plate (+4 px padding)
    ↓                         ↓
    │              Run YOLOv8n Char/Digit Detection
    │                         ↓
    │              Sort L→R → Format ABC-1234
    │                         ↓
    └────────────► Output: Plate Text + Vehicle Label
                   (~700–1000 ms on Orange Pi CPU)
```

**Removed from old diagram:**
- ~~EfficientNet-B0 + ResNet18 benchmark~~ → single **EfficientNet-B4**
- ~~Plate grayscale / denoise / adaptive threshold~~ → YOLO char detection on crop directly

---

### 4. EDGE → CLOUD (`gate_sync.py`)

```
Build JSON payload:
  plate_texts, vehicle_label, vehicle_conf,
  weather, timestamp, image_base64
        ↓
POST → https://automated-gate-access.vercel.app/api/gate/ingest
Header: X-Gate-Token
```

---

### 5. AUTHORIZATION & GATE CONTROL

```
                    Plate in Database?
                   /                  \
                 No                    Yes
                 ↓                      ↓
        DENIED — Gate CLOSED     Check access type
        (Unknown plate)               │
                    ┌─────────────────┼─────────────────┐
                  allow              deny               temp
                    ↓                  ↓                  ↓
           Make+Model match?      Gate CLOSED      Within time window?
              /        \                              /        \
            Yes         No                          Yes         No
             ↓           ↓                           ↓           ↓
        AUTHORIZED   ALERT / DENIED              AUTHORIZED   DENIED
        Gate OPEN    (Mismatch)                  Gate OPEN    Gate CLOSED
             ↓
    Optional GPIO / LED signal
```

**Removed from old diagram:**
- ~~"Future FYP-2 Integration: Open Barrier If AUTHORIZED"~~ → **implemented now**

---

### 6. LOGGING & DASHBOARD

```
Display on Vercel Live Feed (React dashboard)
Log Event: timestamp, plate, make/model, confidence,
           weather, status, gate_action (opened | closed)
        ↓
System Running? ──Yes──► Loop back to Input
        No
        ↓
      End
```

---

### Hardware (Deployed — not future work)

| Component | Detail |
|-----------|--------|
| Board | Orange Pi 5 Pro (16 GB) |
| Camera | USB 1080p |
| Network | Wi-Fi → Vercel |
| Power | 5V 5A USB-C |
| Optional | GPIO / LED gate indicator |

---

## Mermaid version (for reports / web)

```mermaid
flowchart TB
    subgraph INIT["1. Initialization"]
        S[System Start]
        M1[YOLOv8n Plate]
        M2[YOLOv8n Char 38cls]
        M3[EfficientNet-B4 245cls]
        DB[(vehicles.json)]
    end

    subgraph IN["2. Input & Preprocess"]
        CAM[USB Camera / Image]
        WX[Weather Detect]
        ENH[DCP / Derain / CLAHE]
    end

    subgraph AI["3. AI Inference ≤2s"]
        VMMR[EfficientNet-B4]
        LPD[YOLOv8n LPD]
        Q1{Plate?}
        CROP[Crop Plate]
        OCR[YOLOv8n Char OCR]
        FMT[ABC-1234]
    end

    subgraph CLOUD["4. Edge → Cloud"]
        GS[gate_sync.py JSON POST]
        API[/api/gate/ingest]
    end

    subgraph AUTH["5. Authorization"]
        Q2{In DB?}
        Q3{allow/deny/temp}
        OPEN[Gate OPEN]
        CLOSE[Gate CLOSED]
        GPIO[GPIO/LED]
    end

    subgraph UI["6. Dashboard"]
        LIVE[Live Feed]
        LOG[Event Log]
    end

    S --> M1 & M2 & M3 & DB
    CAM --> WX --> ENH --> VMMR --> LPD --> Q1
    Q1 -->|No| LOG
    Q1 -->|Yes| CROP --> OCR --> FMT --> GS --> API
    VMMR --> GS
    API --> Q2
    Q2 -->|No| CLOSE
    Q2 -->|Yes| Q3
    Q3 --> OPEN & CLOSE
    OPEN --> GPIO
    OPEN & CLOSE --> LIVE & LOG
    LIVE --> CAM
```
