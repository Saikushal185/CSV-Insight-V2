# 📊 CSV Insight Studio

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![ECharts](https://img.shields.io/badge/ECharts-5-AA344D?logo=apache-echarts)](https://echarts.apache.org/)
[![Zustand](https://img.shields.io/badge/Zustand-5-brown)](https://zustand-demo.pmnd.rs/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**CSV Insight Studio** is a modern, browser-based analytics platform that transforms raw CSV data into actionable insights through interactive, cross-filtered visualizations — with zero data ever leaving your browser.

## ✨ Features

- 🔗 **Cross-Filtering** — Click any chart (bar, pie, scatter, line, histogram) to instantly filter every other chart and table in the workspace. All interactions are synchronized in real-time.
- ⚡ **Lightning-Fast Parsing** — Powered by [PapaParse](https://www.papaparse.com/) with progress tracking for large CSV files.
- 📈 **Interactive Visualizations** — 5 chart types (bar, line, pie, scatter, histogram) via [Apache ECharts](https://echarts.apache.org/).
- 🧠 **Auto-Generated Insights** — Rule-based anomaly detection and distribution alerts generated automatically from your data.
- 📋 **Column Profiling** — Per-column statistics view with type inference for numeric, date, boolean, and categorical columns.
- 📁 **Smart Upload Zone** — Drag-and-drop or file-picker upload, plus a built-in sample dataset to explore instantly.
- 💾 **Session Persistence** — Parsed datasets survive page refreshes via browser session storage.
- 🌗 **Dark / Light Mode** — Automatic theme detection with a manual toggle.
- 📱 **Fully Responsive** — Optimized for all devices, from mobile to desktop.
- 🧪 **Unit Tested** — Core data utilities covered by Vitest tests.

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 15](https://nextjs.org/) (App Router) |
| UI Library | [React 19](https://reactjs.org/) |
| Language | [TypeScript 5](https://www.typescriptlang.org/) |
| Styling | [Tailwind CSS 3.4](https://tailwindcss.com/) |
| Charts | [Apache ECharts 5](https://echarts.apache.org/) via `echarts-for-react` |
| State Management | [Zustand 5](https://zustand-demo.pmnd.rs/) |
| CSV Parsing | [PapaParse 5](https://www.papaparse.com/) |
| Testing | [Vitest 2](https://vitest.dev/) |

## 🗂️ Project Structure

```
csv-insight-studio/
├── app/                    # Next.js App Router pages
│   ├── page.tsx            # Landing / upload page
│   └── dashboard/
│       ├── page.tsx        # Overview dashboard (KPI cards + chart grid)
│       ├── insights/       # Auto-generated insights page
│       ├── table/          # Full sortable data table
│       └── profile/        # Per-column statistics profile
├── components/
│   ├── charts/             # ECharts wrappers (bar, line, pie, scatter, histogram)
│   ├── dashboard/          # ChartGrid, KPICards, MiniTable
│   ├── insights/           # InsightCard, InsightsList
│   ├── layout/             # Sidebar, TopBar, FilterBadge
│   ├── profile/            # Column profiler UI
│   ├── table/              # Data table component
│   └── upload/             # UploadZone, ParseProgress
├── hooks/                  # useFilteredRows, useIsDarkMode, useParsedData
├── lib/                    # Pure utility functions
│   ├── parseCSV.ts         # CSV parsing pipeline
│   ├── computeStats.ts     # Numeric / categorical statistics
│   ├── inferTypes.ts       # Column type inference
│   ├── generateInsights.ts # Rule-based insight engine
│   ├── suggestCharts.ts    # Chart type suggestions per column
│   ├── applyFilters.ts     # Cross-filter logic
│   └── binning.ts          # Histogram bin computation
├── store/
│   └── filterStore.ts      # Zustand store for active cross-filters
├── tests/                  # Vitest unit tests
└── types/                  # Shared TypeScript type definitions
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18.x or later
- **npm** (or yarn / pnpm)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/saikushal185/CSV-Insight-V2.git
   cd CSV-Insight-V2
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

### Running Locally

Start the development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Running Tests

Execute the unit test suite with Vitest:
```bash
npm run test
```

### Building for Production

```bash
npm run build
npm start
```

## 🖥️ Application Routes

| Route | Description |
|---|---|
| `/` | Upload page — drag-and-drop or load the built-in sample dataset |
| `/dashboard` | Overview — KPI cards, auto-suggested charts, mini data table |
| `/dashboard/table` | Full paginated and sortable data table |
| `/dashboard/insights` | Auto-generated insights: anomalies, distributions, correlations |
| `/dashboard/profile` | Per-column statistics and type profiles |

## 🔗 How Cross-Filtering Works

Every chart in the dashboard is connected through the **Zustand filter store**. When you click a bar, pie slice, or scatter point, the selected value is written to the global filter state. All other charts and the data table re-render using only the rows that match **all** active filters simultaneously. Click the same element again (or use the filter badge) to clear that filter.

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Feel free to open an issue or submit a Pull Request.

---
Developed with ❤️ by [saikushal](https://github.com/saikushal185)
