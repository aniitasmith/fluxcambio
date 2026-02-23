# FluxCambio 💱

REF to USDT conversion calculator with BCV and Binance P2P rates for Venezuela. Includes arbitrage comparator and CAD conversion.

![FluxCambio](https://img.shields.io/badge/FluxCambio-v1.0.0-F7931A)
![Next.js](https://img.shields.io/badge/Next.js-16-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)

## ✨ Features

### 📊 Four calculation modes

- **REF (USD)**: Converts reference dollars to USDT
- **VES**: Converts bolívars to USD and USDT
- **VS (Comparator)**: Compares whether it's better to pay in USD or Bolívars
- **CAD**: Converts Canadian dollars (useful for remittances from Canada)

### 🔄 Real-time rates

- **BCV USD/EUR**: Updated every 20 minutes
- **Binance P2P**: USDT/VES price updated every 20 minutes
- **CAD/USD**: Updated every hour

### 📈 History and charts

- Last 50 conversions history
- Historical rate charts (7, 30, 90 days)
- CSV export

### 🎨 Modern design

- Glassmorphism interface
- Orange/gold palette (crypto style)
- Smooth animations with Framer Motion
- Responsive design

### 📱 PWA

- Installable as a native app
- Works offline (except for rate updates)

## 🚀 Installation

```bash
# Clone repository
git clone

# Install dependencies
npm install

# Run in development
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 🔧 Environment variables

No environment variables are required. The APIs used are public:

- **DolarVzla API**: Official BCV rate
- **CriptoYa**: Binance P2P
- **ExchangeRate API**: CAD/USD rate

## 📁 Project structure

```
fluxcambio/
├── src/
│   ├── app/
│   │   ├── api/          # API routes (proxy)
│   │   ├── layout.tsx    # Main layout
│   │   └── page.tsx      # Main page
│   ├── components/
│   │   ├── ui/           # shadcn/ui
│   │   ├── Calculator.tsx
│   │   ├── ArbitrageCompare.tsx
│   │   ├── CadConverter.tsx
│   │   ├── ConversionHistory.tsx
│   │   ├── RateChart.tsx
│   │   └── ...
│   ├── hooks/
│   │   └── useRates.ts   # SWR hook for rates
│   └── lib/
│       ├── constants.ts
│       ├── storage.ts    # LocalStorage helpers
│       └── utils.ts
└── public/
    ├── manifest.json
    └── favicon.svg
```

## 🛠️ Tech stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Components**: shadcn/ui
- **Charts**: Recharts
- **Animations**: Framer Motion
- **Data Fetching**: SWR
- **Notifications**: Sonner

## 📝 Usage

1. Select the calculation mode (REF, VES, VS, CAD)
2. Enter the amount
3. Results are calculated automatically
4. Tap any result to copy it

### VS mode (Arbitrage comparator)

Useful when a merchant offers:
- Price in dollars: $X
- Price in bolívars: X Bs (calculated with BCV rate)

FluxCambio tells you which option is more convenient considering the real Binance P2P rate.

## 🌐 Deploy

### Vercel (recommended)

```bash
npm i -g vercel
vercel
```

### Other platforms

The project is compatible with any platform that supports Next.js.

## 📄 License

MIT

---

Made with 💛 by FluxCambio
