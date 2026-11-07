# OpenLine Robot Academy

Meet Pip. Make a plan, run it, and learn from what happens.

A free, MIT-licensed browser learning application designed for ages approximately 8–17. No accounts, external runtime libraries, telemetry, ads, paid APIs or physical hardware. Version 0.1.0-rc1, published openly for review and classroom use.

## Play offline
Open **dist/OpenLine-Robot-Academy.html** in a browser. The complete app is in that one file; keep it on your device. No install step, Node or Python is required to play. Browser or school policy can restrict local HTML. Test the actual device before the workshop.

Play it online at https://terryncew.github.io/openline-robot-academy/, or serve the `web/` folder from any HTTPS host. Its service worker caches the app; Save & offline reports whether caching succeeded. Install using the browser's app installation menu where available. `file:` copies use the embedded app directly and do not need a service worker.

## Five missions
1. **First delivery (`01`):** A three-command success, sequencing and direction.
2. **Garden path (`02`):** Turns, counted loops (`Repeat`), and stepping outside a loop (`After End ⤵`).
3. **Sensor scout (`03`):** `If clear / Else` feedback inside `Until pad`, solving three corridor lengths (Routes A, B, and C) with one general program.
4. **Safety lab (`04`):** A buggy starter, live execution trace, dynamic crate obstacle, fail-closed sensor fault (`? Unknown`), and latched `Emergency stop` (`Esc`) with deliberate `Reset`.
5. **Creative sandbox (`05`):** An open-ended garden with a built-in **Map Builder** (toggle planters, move Pip, move the charging pad, rotate Pip, or switch between **Zigzag course**, **Left-turn spiral**, and **Open garden** presets) so students can invent and trade custom challenges.

## Bridge from blocks to real code
- **Live Code Preview:** In Blocks mode, a live preview pane displays the synchronized **JavaScript** or **Python** equivalent of the student's blocks in real time.
- **Code Lab:** Older students can write and edit a deterministic, sandboxed robot JavaScript subset (`move(); left(); right(); wait(); stop(); repeat(n) { ... } if (clearAhead()) { ... } else { ... } while (!atGoal()) { ... }`) and compare it against a read-only Python translation. Arbitrary JavaScript is never evaluated (`eval`/`Function` are never used).

## Develop and test
Use Node 18+ for `node --test tests/*.test.js`. Use Python 3.9+ for `python3 scripts/build.py`. Both are build/test tools only. Runtime files are in `web/`: engine, mission data, UI, style, service worker and manifest. No package installation is needed.

Read `docs/EDUCATOR_GUIDE.md` for the 45-minute workshop plan, answer key, and troubleshooting guide. Read `docs/EDUCATIONAL_RUBRIC.md` for the objective pedagogical evaluation rubric. Read `HANDOFF.md` and `docs/ARGON_REVIEW.md` for candidate verification status and untested real-world boundaries.

## Provenance
New application code, prose, CSS and vector character authored for Terrynce White under this assignment. Earlier private robotics-admission research was inspected but its source and fixtures are not included in this application. See `docs/DESIGN.md`. The MIT license covers this newly authored application only. Private recovery checkpoints contain separate restricted reference material and must never be published wholesale.
