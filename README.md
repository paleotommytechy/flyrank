# FlyRank

FlyRank is a flight search and ranking application designed to help users find, compare, and rank flights based on customizable criteria such as price, travel duration, carbon footprint, layovers, and airline rating.

## Core Purpose

The core purpose of FlyRank is to simplify travel planning by going beyond simple price-based sorting. It provides a multi-criteria decision ranking system to help users choose flights that align with their personal preferences, whether they prioritize budget, time, comfort, or environmental impact.

## Features

- **Multi-Criteria Ranking:** Rank flights using a weighted scoring model based on user preferences.
- **Sustainability Metrics:** Filter and sort flights by estimated CO2 emissions.
- **Interactive Search:** Clean, intuitive user interface for searching and comparing flights.

## Tech Stack

- **Frontend:** Semantic HTML5, CSS3 (Vanilla Custom Properties, Flexbox, Grid), Vanilla JavaScript (ES6+ Modules)
- **Backend/Development Tooling:** Node.js, npm, Vite (recommended for development server)

## Getting Started

### Prerequisites

Make sure you have [Node.js](https://nodejs.org/) installed (version 18+ recommended).

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/flyrank.git
   cd flyrank
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## Project Structure

```text
├── .gitignore
├── CLAUDE.md
├── LICENSE
├── README.md
├── index.html
├── package.json
└── src/
    ├── css/
    │   └── main.css
    └── js/
        ├── app.js
        └── ranker.js       # Core ranking algorithm
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

