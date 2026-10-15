# LeadFit — Production-Grade Lead Intelligence & Prioritization Engine

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI%20v0.115+-009688.svg?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/Frontend-React%2019%20%2B%20Tailwind%20v4-61DAFB.svg?style=flat&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Bundler-Vite%20v8-646CFF.svg?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Status](https://img.shields.io/badge/Architecture-Deterministic%20Heuristic%20Engine-6366F1.svg?style=flat)](https://github.com/)

> Transform raw, disparate prospect lists into an explainable, ranked sales pipeline with transparent Ideal Customer Profile (ICP) heuristics, real-time data coverage diagnostics, and zero hallucinations.

---

## 🌟 Executive Overview & Value Proposition

Sales and revenue operations teams are frequently overwhelmed with unstructured CSV lead lists from conferences, CRM exports, or scrapers. Without a systematic, deterministic method to qualify and prioritize contacts, reps waste up to 40% of their outreach bandwidth on low-intent or incomplete accounts.

**LeadFit** is a commercial-grade B2B SaaS platform that ingests raw prospect CSVs, allows revops to configure precise Ideal Customer Profile criteria, and delivers:
1. **Explainable 0–100 ICP Fit Scores** backed by criterion-level reasoning.
2. **Data Coverage Diagnostics** so reps know which records lack verifiable information.
3. **Automated Deduplication** detecting exact and fuzzy domain/name collision candidates.
4. **Interactive Analytics Visualizations** showcasing pipeline qualification distribution.
5. **Instant Prioritized CSV Export** enriched with scores and rationale tags.

---

## 🚀 Key Features

### 1. Tolerant CSV Ingestion & Onboarding
- **Smart Column Detection**: Automatically identifies canonical contact/company fields across 30+ header aliases (`company_name`, `company_domain`, `industry`, `employee_count`, `country`, `state_or_region`, `contact_name`, `contact_email`, `last_updated_at`).
- **Drag-and-Drop Dropzone**: Micro-interactions, file validation (format, size limits up to 10MB, empty file checks), and instant file replacement.
- **One-Click Demo Dataset**: Instant sandbox testing with a pre-packaged 24-record realistic dataset.
- **100% In-Memory Processing**: Zero disk retention, fully aligned with enterprise privacy standards.

### 2. Flexible ICP Configuration Workspace
- **Firmographic Targeting**: Multi-select tag input with auto-suggestions for 17+ core industries and 15+ target countries.
- **Headcount Presets**: Quick ranges (Startup 1–50, Growth 51–250, Mid-Market 251–1,000, Enterprise 1,000+) plus custom boundaries.
- **Dynamic Criterion Weights**: Real-time percentage share calculations with custom sliders and live total weight verification.
- **Expandable Cutoffs**: Configurable thresholds for High Fit (≥75 default), Medium Fit (≥50 default), and minimum coverage percentage.

### 3. Pipeline Analytics & Results Dashboard
- **Executive KPI Cards**: Processed volume, High-Fit conversion percentage, average fit score, average data health coverage, and duplicate count.
- **Interactive Visualizations (Recharts)**:
  - *Qualification Donut Chart*: Live breakdown of High, Medium, Low, and Insufficient Data leads.
  - *Industry Volume Bar Chart*: Sector representation across the top 5 industries.
- **Multi-Filter Toolbar**: Real-time search across companies, domains, contacts, and emails; priority filters; duplicate isolation; incomplete-record filtering.
- **Sortable Data Table**: Sticky header, custom score progress bars, segmented coverage meters, and responsive horizontal scrolling.

### 4. Side-Drawer Lead Detail Panel
- **Circular SVG Score Gauge**: Color-coded score ring reflecting qualification priority.
- **Criterion-by-Criterion Breakdown**: Visual status badges (*Matched*, *Partial*, *Mismatched*, *Field Missing*, *Not Configured*), allocated weights, and plain-English heuristic explanations.
- **Record Inspector**: One-click copy-to-clipboard for email/domain, syntax issue callouts, duplicate candidate reference IDs, and missing attribute tags.
- **Ethical AI/Heuristic Disclaimers**: Clarifies that scores evaluate profile match rather than guaranteeing sales response rates.

---

## 🏗️ Architecture & Scoring Methodology

```
┌────────────────────────────────────────────────────────┐
│                   LeadFit Frontend                     │
│   React 19 · Tailwind CSS v4 · Recharts · Lucide Icons │
└───────────────────────────┬────────────────────────────┘
                            │ HTTP POST (Multipart / JSON)
                            ▼
┌────────────────────────────────────────────────────────┐
│               FastAPI Deterministic Engine             │
│                                                        │
│  1. csv_parser.py    ──► Normalize 30+ column aliases  │
│  2. deduplicator.py  ──► Fuzzy company/domain collision│
│  3. scorer.py        ──► Dynamic weighted heuristic    │
│  4. exporter.py      ──► Formula-injection safe CSV    │
└────────────────────────────────────────────────────────┘
```

### The Scoring Equation

Unlike opaque black-box models, LeadFit computes scores using a normalized weighted average of **evaluable criteria only**:

$$\text{Score} = \frac{\sum_{i \in \text{evaluable}} (w_i \times s_i)}{\sum_{i \in \text{evaluable}} w_i}$$

$$\text{Data Coverage} = \frac{\sum_{i \in \text{evaluable}} w_i}{\sum_{j \in \text{all enabled}} w_j} \times 100$$

> **Why this matters**: If an uploaded record is missing an industry or headcount, LeadFit **excludes it from the denominator** rather than unfairly penalizing the account with zero points. The accompanying **Data Coverage** score transparently highlights the degree of available data.

---

## 🛠️ Tech Stack & Dependencies

| Component | Technology | Purpose |
|---|---|---|
| **Frontend Framework** | React 19 (Vite 8) | Component state, modular UI, reactive workflows |
| **Styling** | Tailwind CSS v4 + Vanilla Tokens | B2B SaaS design system inspired by Linear, Stripe & Attio |
| **Data Visualization** | Recharts v3 | Responsive priority donut and industry bar charts |
| **Icons** | Lucide React | Consistent enterprise icon set |
| **Notifications** | React Hot Toast | Non-intrusive action feedback |
| **Backend API** | FastAPI (Python 3.12) | Asynchronous validation, deduplication & scoring |
| **Server** | Uvicorn | High-performance ASGI runtime |
| **Testing** | Pytest + Oxlint | Comprehensive backend unit and frontend lint tests |

---

## ⚡ Quickstart Guide

### Prerequisites
- Python 3.10+
- Node.js 18+ & npm

### 1. Start the Backend
```bash
cd leadfit/backend
pip install -r requirements.txt
python main.py
# API server live at: http://localhost:8000
# Interactive Swagger docs: http://localhost:8000/docs
```

### 2. Start the Frontend
```bash
cd leadfit/frontend
npm install
npm run dev
# Vite dev server live at: http://localhost:5173
```

### 3. Run Backend Verification Tests
```bash
cd leadfit/backend
pytest tests/ -v
```

---

## 📡 API Contract Reference

| Method | Endpoint | Description | Request Format | Response |
|---|---|---|---|---|
| `GET` | `/api/health` | Healthcheck & system status | None | `{"status": "ok"}` |
| `POST` | `/api/leads/analyze` | Ingest CSV + evaluate ICP | Multipart (`file`, `icp` JSON) | `AnalysisResponse` with summary & scores |
| `POST` | `/api/leads/recalculate` | Re-score leads with new weights | JSON `{ leads, icp }` | `AnalysisResponse` |
| `POST` | `/api/leads/export` | Download prioritized CSV | JSON `{ leads, icp }` | Binary CSV attachment |

---

## 🔒 Privacy, Security & Data Integrity

- **Zero Data Retention**: Uploaded CSV files are processed transiently in-memory and are never written to disk or sent to external AI providers.
- **Formula Injection Sanitization**: All exported CSV rows prepend apostrophes to any field starting with `=`, `+`, `-`, or `@` to neutralize spreadsheet script execution.
- **Syntax Validation**: Contact emails are checked for RFC 5322 syntax compliance without overpromising server-side inbox deliverability.
