# AI-Assisted Development Workflow Comparison

## Objective
This experiment evaluates AI code generation quality by implementing the same feature twice: first using an unconstrained, vague prompt (`feature/vague-ai`), and second using a specification-driven prompt with architectural constraints (`feature/spec-driven-ai`).

## Round One — Vague Prompt
* **Prompt Quality:** Minimal (`Build a settings page for users.`).
* **AI Behavior:** Assumed missing requirements and created isolated structures without inspecting existing conventions.
* **Files Generated:** `settings.html`, `src/js/settings.js`, `src/js/settings-store.js`, `src/js/theme.js`, `src/js/ranker.js`, `src/css/main.css`.
* **Missing Requirements:** Automated tests, input validation service, modular components, accessibility attributes, and lint scripts.
* **Review Effort Required:** High. Required heavy manual refactoring to fix architectural drift and dead code.
* **Problems Encountered:** Created a duplicate multi-page navigation layout instead of integrating into the single-page client architecture.

## Round Two — Specification-Driven Prompt
* **Planning Phase:** Pre-analyzed directory structure, state management, and design system before writing code.
* **Use of Project Context:** Built modular UI components in `src/js/components/` and business logic in `src/js/services/`.
* **Constraints Supplied:** Explicit guidelines on accessibility, Vitest unit testing, and CSS custom properties.
* **Verification Instructions:** Required test execution (`npm test`) and production build (`npm run build`).
* **Quality of Generated Implementation:** High. Code followed project conventions with clean component boundaries.
* **Tests & Accessibility:** Included unit tests (`tests/ranker.test.js`) and accessible semantic HTML.
* **Validation & Review Effort:** Added input validation (`validator.js`). Low review effort required.

## Branch Comparison
Comparing `feature/vague-ai` against `feature/spec-driven-ai` demonstrates:
* **Architecture & Reuse:** `spec-driven-ai` organized code into reusable components (`FlightCard.js`, `RankSliderControls.js`) instead of scattered top-level files.
* **Validation & Typing:** Added centralized form validation (`validator.js`) rather than relying purely on native HTML input bounds.
* **Tests & Quality:** `spec-driven-ai` provided 4 Vitest unit tests for composite scoring, whereas `vague-ai` had zero tests.
* **Accessibility:** Added proper `role="dialog"`, `aria-modal`, and explicit `aria-label` attributes across interactive elements.

## AI Mistakes Identified
1. **Missing `lint` script (`package.json`):**
   * *Where:* Both branches.
   * *Why:* `CLAUDE.md` specified `npm run lint`, but the script was omitted.
   * *Fix:* Added `"lint": "eslint ."` and `eslint.config.js`.
   * *Impact:* Restored repository verification compliance.
2. **Architectural Drift (`settings.html`):**
   * *Where:* `feature/vague-ai`.
   * *Why:* Vague prompt caused the AI to generate a standalone HTML page.
   * *Fix:* Replaced with single-page modular components in `feature/spec-driven-ai`.
3. **Unsafe JSON Deserialization:**
   * *Where:* `src/js/settings-store.js` (`feature/vague-ai`).
   * *Why:* Raw `JSON.parse` lacked schema validation.
   * *Fix:* Introduced validated central state in `src/js/services/store.js`.
4. **Missing ARIA Labels:**
   * *Where:* `ComparisonDrawer.js`, `ThemeToggle.js`, `FlightCard.js` (`feature/spec-driven-ai`).
   * *Why:* Icon buttons lacked screen reader descriptors.
   * *Fix:* Added explicit `aria-label` and `role="dialog"` attributes.

## Lessons Learned
Specification-driven prompting prevents architectural fragmentation, guarantees test coverage, ensures accessibility compliance, and drastically reduces code review overhead.
