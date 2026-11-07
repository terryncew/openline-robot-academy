# OpenLine Robot Academy — Objective Educational Evaluation Rubric

Target Audience: Oakland youth ages 8–17 (mixed-age 45-minute workshop, shared Chromebooks/tablets/phones, zero accounts or hardware required).

> **Epistemic Boundary**: This rubric evaluates instructional design structure, cognitive load, feedback specificity, and alignment with K–12 CS standards (CSTA 1B-AP-10, 2-AP-12, 2-CS-03). It does **not** claim empirical learning gains; actual student learning requires real classroom observation.

---

## 1. Mission-by-Mission Pedagogical Matrix

| Mission | Core CS & Robotics Concept | Observable Evidence of Student Understanding | Likely Student Misconceptions | Diagnostic Feedback in App | What Student Can Attempt Afterward (Transfer) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **01. First delivery**<br>*(Sequences & State)* | Sequential execution (`move`), spatial coordinate tracking, and separating rotation (`left`/`right`) from translation (`move`). | 1. Student predicts Pip’s landing tile before pressing Run.<br>2. Student explains why `Forward, Left, Forward` moves right 1 tile and up 1 tile (a turn changes facing, not tile position). | **Misconception A**: "Turn left moves Pip one square left."<br>**Misconception B**: "Adding 4 Forwards goes past the charging pad." | Live facing arrow (`→`/`↑`) + live JavaScript/Python code peek + step-by-step trace showing facing change without coordinate change. | Navigate around a planter using a deliberate turn (`Forward, Left, Forward`) or predict where an extra `Forward` stops. |
| **02. Garden path**<br>*(Counted Loops & Scope)* | Counted iteration (`repeat(n) { ... }`), loop boundaries (`end`), and distinguishing commands *inside* vs. *after* a loop block. | 1. Student replaces 4 repeated `Forward` blocks with `Repeat 4 { Forward }` and places `Turn left` *after* `End`.<br>2. Student correctly identifies that `Repeat 4 { Forward; Left; }` traces a square. | **Misconception A**: Putting `Turn left` inside the first `Repeat` block (causing Pip to spin in a square instead of walking 4 tiles straight).<br>**Misconception B**: Nesting the second loop inside the first loop instead of after `End`. | Explicit **Insert After Group** (`⤵ After End`) button on every `End` block + diagnostic blocked message naming the exact block number and obstacle coordinate. | Predict the geometric path of any `Repeat N { ... }` block or refactor a long sequence of steps into two counted loops. |
| **03. Sensor scout**<br>*(Conditionals, Sensors & Generalization)* | Event-driven loop (`until` at goal), conditional branching (`if clear` / `else`), closed-loop feedback, and policy generalization across 3 corridor lengths (Routes A, B, C). | 1. Student constructs `Until pad { If clear { Forward } Else { Turn left } }` and verifies it solves Routes A, B, and C without editing.<br>2. Student explains *why* it works (re-checking the sensor each step) and where it would fail (a right-turn or T-junction corridor). | **Misconception A**: Using `If clear` *without* an outer `Until pad` loop (expecting `If` to repeat forever on its own).<br>**Misconception B**: Believing a left-turn rule solves *every* possible maze. | If a program finishes in 1 step after an `If` check without reaching the pad, diagnostic feedback explicitly prompts: *"An If block checks only once! Put If inside an Until pad loop so Pip keeps checking."* | Test the same controller on custom corridor shapes in **Creative Sandbox** and design a maze that breaks the left-turn-only policy. |
| **04. Safety lab**<br>*(Debugging, Fail-Closed Uncertainty & E-Stop)* | Trace-guided debugging, fail-closed handling of dynamic obstacles (`new-crate`) and sensor uncertainty (`unknown`), and latched human override (`Emergency stop` + explicit `Reset`). | 1. Student uses `Step` to spot the faulty `Turn left` at Block 1 and removes it.<br>2. Student tests all 4 safety drills (Normal delivery, Crate appears, Sensor fails, Emergency stop) and explains why `"unknown"` must halt rather than trigger `Else`. | **Misconception A**: Treating `"unknown"` sensor status as `"clear"` or taking the `"else"` turn blindly.<br>**Misconception B**: Expecting `Emergency stop` to auto-resume without a deliberate human `Reset`. | Explicit 4-badge interactive **Safety Drill Checklist** (`Deliver`, `Crate test`, `Sensor test`, `Emergency stop`) + fail-closed trace message explaining why unknown sensor state refuses both branches. | Formulate a safety rule for a real-world delivery robot and test custom fault scenarios. |
| **05. Creative sandbox**<br>*(Open-Ended Design & Peer Challenge)* | Open-ended problem formulation, map design (placing planters, moving start/pad), algorithm synthesis, and block-to-code translation. | 1. Student designs a custom garden layout or chooses a preset challenge and writes a working block or text-code solution.<br>2. Partner swaps devices and solves or debugs the custom map. | **Misconception**: Making an unreachable goal (walled-in pad) and blaming the program. | Built-in **Map Builder** toolbar (tap tiles to toggle planters, move Pip, or move Pad) + instant path/solution testing + live JavaScript/Python code comparison. | Invent custom mazes for a partner, compare shortest-block vs. shortest-step solutions, and transition to editing text code directly in Code Lab. |

---

## 2. Evaluation Against Competent Conventional Design

A competent conventional K–12 block-coding tutorial (such as classic grid puzzles) typically provides:
- Drag-and-drop blocks, a grid canvas, a Run/Reset button, and a modal "Success / Try Again" banner.

Where conventional designs often fail in mixed-age, low-resource workshops (and how this candidate addresses each):
1. **Drag-and-drop frustration on cheap touchscreens / trackpads**:
   - *Conventional*: Dragging nested blocks into tiny drop zones fails on worn Chromebook trackpads and small phone screens, frustrating 8-year-olds and keyboard/switch users.
   - *OpenLine Design*: 100% tap/click/keyboard button insertion with a one-tap **Insert After Group (`⤵`)** control and arrow reorder buttons (`↑`/`↓`/`×`), plus the single `Esc` keyboard shortcut (Emergency stop).
2. **"Success without understanding" (trial-and-error clicking)**:
   - *Conventional*: Students brute-force blocks until the character reaches the goal, then immediately click "Next Level" without understanding *why* it worked.
   - *OpenLine Design*: Every mission completion unlocks an inline **Prediction & Reflection Check** testing the exact misconception for that mission, with specific conceptual feedback on wrong answers.
3. **Opaque failure states (`FAILED` / `Try Again`)**:
   - *Conventional*: Robot hits a wall and resets or says "Try Again."
   - *OpenLine Design*: **Specific Diagnostic Coaching** states the exact block number (`Block 02`), the physical or logical reason (`Planter ahead at Row 4, Col 2`), and a concrete recovery suggestion (`Remove the extra turn or add Until pad`). (The remaining-distance hint — `Pad is 2 tiles east` — appears only when a program ends before the pad or uses all 160 steps, not in the blocked message.)
4. **Black-box sensors & false physical safety impressions**:
   - *Conventional*: Sensors never fail, obstacles are static, and there is no distinction between `"blocked"` and `"sensor failed"`, nor any emergency stop concept.
   - *OpenLine Design*: Mission 04 explicitly contrasts `"blocked"` vs. `"unknown"` (fail-closed) and requires practicing a latched `Emergency stop` + deliberate `Reset`.
5. **Ceiling for older students (ages 13–17)**:
   - *Conventional*: Visual blocks feel "babyish" to teens, while raw text editors throw cryptic syntax errors.
   - *OpenLine Design*: A live **Code Peek** panel shows synchronized JavaScript and Python alongside the blocks in real time, and **Code Lab** lets older students write/edit deterministic robot code directly.
