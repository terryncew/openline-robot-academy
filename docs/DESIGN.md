# OpenLine Robot Academy — Private Build Specification

Target: Oakland youth robotics workshop, before November 29, 2026. Ages approximately 8–17. Real-world classroom validation is pending.

## Learning contract
The first screen is a playable garden with Pip, a friendly original robot. Three forward blocks reach a charging pad. One sentence explains the goal; icons reinforce each command. No login, download of dependencies, reading wall, score pressure or countdown.

Five progressive missions:
1. **First delivery:** Sequence and spatial state (separating rotation from movement).
2. **Garden path:** Turns, counted loops, and group boundaries (`After End ⤵`).
3. **Sensor scout:** `If/Else` and `Until pad` feedback across three route lengths (Routes A, B, and C).
4. **Safety lab:** Trace-guided debugging, dynamic obstacle (`new-crate`), fail-closed sensor uncertainty (`unknown`), and a 4-part interactive Safety Drill Checklist including latched `Emergency stop`.
5. **Creative sandbox:** Open-ended challenge with an interactive **Map Builder** (toggle planters, move start/goal, rotate Pip, or choose from 3 presets) for student-invented mazes and peer challenges.

Completing a mission unlocks an inline prediction/reflection check; an incorrect answer gives a specific conceptual explanation and retry. Learners see a **Live Code Preview** (JavaScript & Python) right inside the Blocks view, and advanced learners can switch to **Code lab** to write and edit a deliberately restricted JavaScript-style robot language (parsed deterministically, never evaluated via `eval`).

## Architecture and boundaries
Plain HTML, CSS and JavaScript. A pure deterministic engine (`web/engine.js`) owns a bounded stack interpreter. Every control check consumes a tick, so empty infinite loops cannot hang the browser. Up to 60 blocks, nesting depth 6, repeat count 1–20, 160 ticks. Movement is discrete in a small integer grid; collisions and unknown sensors halt safely with specific diagnostic messages (identifying block number, obstacle type/coordinates, and remaining distance to the pad). Timer scheduling yields after every tick. Emergency stop latches until explicit reset; reset and mission/scenario changes cancel queued callbacks. Refresh preserves drafts, custom sandbox maps, and completed learning checks locally but never resumes execution. `localStorage` unavailability is handled gracefully without alarming startup errors on fresh sessions. Progress JSON can be exported/imported with strict schema and size limits.

The DOM is the accessible board and editor; no canvas-only dependency or drag-only actions. Button controls, visible focus, textual position/sensor/trace, semantic headings, large touch targets, reduced motion, keyboard operation. Mobile uses a compact above-the-fold layout and a sticky transport bar with Emergency stop. A one-file offline build (`dist/OpenLine-Robot-Academy.html`) works without a web server on browsers that allow local HTML; hosted/localhost installation uses an explicit service worker cache readiness check. No external runtime requests, fonts, images, telemetry or APIs.

## Rights and reuse
Recovered private robotics research is retained separately under `recovery/` in earlier archives. None of that source, fixtures, assets or private evidence enters the academy distribution. This application is newly authored under this assignment. Its MIT license applies only to newly authored academy files. Founder publication approval remains required.
