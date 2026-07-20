# FlyRank Project Guide (CLAUDE.md)

This document outlines the development guidelines, command usage, and style conventions for the FlyRank project.

## Tech Stack
- **Frontend Core:** Semantic HTML5, Vanilla JavaScript (ES6+), Vanilla CSS (Custom properties, grid, flexbox).
- **Backend/Tooling:** Node.js, npm.
- **Styling Philosophy:** Rich aesthetics, dark/light modes, premium UI designs with transitions and micro-animations. Avoid CSS utility frameworks (like Tailwind) unless explicitly requested.

## Common Development Commands
- Run development server: `npm run dev`
- Run linting: `npm run lint`
- Run tests: `npm test`
- Build project: `npm run build`

## Code Conventions & Rules
- **HTML:** Write semantic, clean HTML5. Every page must have a single `<h1>` and unique IDs on interactive components.
- **CSS:** Keep styles modular. Use CSS custom variables for design system tokens (colors, spacing, typography). Prefer vanilla CSS over Tailwind.
- **JavaScript:**
  - Prefer modern ES6+ syntax (const/let, arrow functions, async/await).
  - Use modular, component-based architectures.
  - Keep logic separated from styling/presentation layers.
- **Git Commit Messages:** Follow the Conventional Commits specification (e.g., `feat: add carbon footprint calculator` or `fix: flight rank sorting logic`).
