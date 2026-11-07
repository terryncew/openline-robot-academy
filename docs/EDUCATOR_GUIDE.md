# OpenLine Robot Academy — Educator Guide & 45-Minute Workshop Plan

**Target Event:** Oakland Youth Robotics Workshop (before November 29, 2026)  
**Audience:** Ages 8–17 (mixed ages, pairs or triads sharing Chromebooks, tablets, or phones)  
**Requirements:** Zero accounts, zero student PII, zero internet required during play, zero physical hardware.

> **Validation Status:** Engineering, accessibility semantics, and headless browser workflows are verified. **Classroom learning outcomes and real-student/assistive-technology usability have NOT yet been tested with real youth or educators.**

---

## 1. Quick-Start Setup (2 Minutes Before Class)

1. **Recommended (Zero-Server Offline File):** Copy `dist/OpenLine-Robot-Academy.html` onto each Chromebook, laptop, or tablet (via USB drive, school file share, or Google Drive download) and open it directly in Chrome, Edge, Firefox, or Safari. Everything is inside that single file.
2. **Managed Chromebooks / Phones (Hosted Option):** If school policy blocks `file://` HTML files, open the planned public URL https://terryncew.github.io/openline-robot-academy/ once while on Wi-Fi, click **Save & offline** in the top bar, and click **Prepare offline copy** until it confirms `"Offline files are ready."` (Publication must verify this URL actually serves the app; until then, use the offline file in step 1.)
3. **Unplugged Paper Backup:** Keep a whiteboard or printed grids matching each mission (M1 5×5, M2/M5 6×6, M3 7×6, M4 7×5) and a coin/sticky note ready. If a device battery dies, students can act as "Human Pip" and "Navigator" using the exact same commands on paper.

---

## 2. Shared-Device Pair / Triad Protocol

When 20 students share 7–10 devices, assign clear roles and **swap roles every mission (or every 5 minutes)**:
- **Driver (Hands on Keyboard/Screen):** Taps block commands or types in Code Lab. Cannot press **Run** until the Navigator makes a prediction.
- **Navigator (Predictor & Trace Detective):** Points to the map tile where Pip will land before each run, reads the live **Step detective** trace, and spots bugs.
- **Safety Observer (Optional 3rd Partner):** Watches sensor readings (`Clear`, `Blocked`, `Unknown`) and operates the red **Emergency stop (`Esc`)** button during safety drills.

---

## 3. Minute-by-Minute 45-Minute Workshop Plan

| Time | Segment & Mission | Educator Action | What Students Do | Check for Understanding |
| :--- | :--- | :--- | :--- | :--- |
| **0–5 min** | **Launch & Mission 01: First delivery**<br>*(Sequences & State)* | Project or hold up Mission 01. Ask: *"Which way is Pip facing right now? How many steps to the charging pad?"* | Tap `Forward` 3 times, predict the landing square, press **▶ Run**, and complete the reflection check. | Ask a pair: *"Does `Turn left` move Pip to a new square, or just spin Pip in place?"* |
| **5–15 min** | **Mission 02: Garden path**<br>*(Counted Loops & Scope)* | Demonstrate adding `Repeat (4)` + `Forward`, then point out the **`After End ⤵`** badge on the `End` block. | Build `Repeat 4 { Forward }` (tap Repeat, then change the count from its default 3 to 4), tap **`After End ⤵`**, add `Turn left`, and add `Repeat 3 { Forward }` (change the count to 3). | Ask: *"What happens if you put `Turn left` inside the first Repeat group?"* (Traces a 4-sided square!) |
| **15–27 min** | **Mission 03: Sensor scout**<br>*(Conditionals & Feedback)* | Introduce `Until pad` and `If clear / Else`. Challenge students: *"Build ONE program that solves Route A, Route B, AND Route C without changing a single block!"* | Build `Until pad { If clear { Forward } Else { Turn left } }` and test on Routes A, B, and C via the dropdown. | Ask older students: *"Why doesn't Pip need to know how long the hall is? What maze shape would break this left-turn rule?"* |
| **27–37 min** | **Mission 04: Safety lab**<br>*(Debugging, Fail-Closed & E-Stop)* | Say: *"Someone left a bug in Pip's program! Use **Step** to catch it, then earn all 4 green checkmarks on the Safety Drill Checklist."* | 1. Remove Block 01 (`Turn left`) and Deliver.<br>2. Test **Crate appears**.<br>3. Test **Sensor fails (`? Unknown`)**.<br>4. Press **Run** and hit **■ Emergency stop** mid-run, then **Reset**. | Ask: *"When the sensor says `Unknown`, why doesn't Pip just take the `Else` turn?"* (Because unknown ≠ clear; fail-closed stops safely.) |
| **37–45 min** | **Mission 05: Creative sandbox & Code Lab**<br>*(Synthesis & Peer Challenge)* | Invite younger students to build a custom maze in **Creative sandbox** and trade devices with a neighbor; invite older students to open **Code lab**. | Solve the **Zigzag course** or **Left-turn spiral** preset, design a custom planter maze, or edit JavaScript in **Code lab**. | Have 2 pairs share one bug they hit today and how the **Step detective** or **Status bar** helped them fix it. |

---

## 4. Complete Answer Key & Alternative Valid Solutions

### Mission 01 — First delivery (`5×5`, Start `(1,4)` East → Pad `(4,4)`)
- **Primary Solution (3 blocks):**
  ```javascript
  move();
  move();
  move();
  ```
- **Alternative Valid Solution (Detour around southern open path, 8 blocks):**
  ```javascript
  right(); move(); left(); move(); move(); move(); left(); move();
  ```
- **Reflection Answer:** `Right one tile, then up one tile.` (A turn changes facing direction without changing the grid square.)

### Mission 02 — Garden path (`6×6`, Start `(1,5)` East → Pad `(5,2)`)
- **Primary Loop Solution (7 blocks):**
  ```javascript
  repeat(4) {
    move();
  }
  left();
  repeat(3) {
    move();
  }
  ```
- **Alternative Unrolled Solution (8 blocks):**
  ```javascript
  move(); move(); move(); move(); left(); move(); move(); move();
  ```
- **Reflection Answer:** `A small square, ending where it started.`

### Mission 03 — Sensor scout (Routes A, B, C — L-corridors of length 3, 4, 5)
- **General Feedback Solution (7 blocks — solves A, B, and C):**
  ```javascript
  while (!atGoal()) {
    if (clearAhead()) {
      move();
    } else {
      left();
    }
  }
  ```
- **Alternative Bounded Repeat Solution (7 blocks — also solves A, B, and C):**
  ```javascript
  repeat(12) {
    if (clearAhead()) {
      move();
    } else {
      left();
    }
  }
  ```
- **Reflection Answer:** `It checks the path again before each move.`

### Mission 04 — Safety lab (`7×5`, Start `(1,3)` East → Pad `(6,3)`)
- **Bug in Starter:** Block 01 is a `left()` turn that faces Pip north into a planter at Row 2, Col 1.
- **Primary Repaired Solution (3 blocks):**
  ```javascript
  repeat(5) {
    move();
  }
  ```
- **Alternative Sensor-Aware Solution (5 blocks):**
  ```javascript
  while (!atGoal()) {
    if (clearAhead()) {
      move();
    }
  }
  ```
- **4 Required Safety Drills to Unlock Reflection:**
  1. **Normal delivery:** Reaches the pad (`status: success`).
  2. **Crate test (`A crate appears`):** Stops safely at Row 3, Col 3 before the crate at Row 3, Col 4 (`status: blocked`).
  3. **Sensor fault test (`Sensor fails after two moves`):** Sensor becomes `? Unknown` after 2 moves; Pip halts immediately (`status: sensor-fault`).
  4. **Emergency stop:** Press **▶ Run**, then click **■ Emergency stop** (or press `Esc`) while Pip is moving (`status: estop`), then click **Reset**.
- **Reflection Answer:** `Stop and check before moving again.`

### Mission 05 — Creative sandbox (`6×6` customizable grid + 3 presets)
- **Preset 1 (Zigzag course) Loop Solution (7 blocks):**
  ```javascript
  repeat(2) {
    move();
    move();
    left();
    move();
    right();
  }
  ```
- **Preset 1 (Zigzag course) Sensor Solution (7 blocks):**
  ```javascript
  while (!atGoal()) {
    if (clearAhead()) {
      move();
    } else {
      right();
    }
  }
  ```
  A right-turn rule fits this course: the corridor bends right at the far end. (The earlier 9-block left-turn version did not solve it — it drove Pip into the planter at Row 2, Col 6. Verified in the engine and in the browser on a pristine map.)
- **Preset 2 (Left-turn spiral) Solution (7 blocks):**
  ```javascript
  while (!atGoal()) {
    if (clearAhead()) {
      move();
    } else {
      left();
    }
  }
  ```
- **Reflection Answer:** `Write and run a working solution on the map yourself first.`

---

## 5. Classroom Troubleshooting Guide

| Symptom / Student Question | Cause | Immediate Fix |
| :--- | :--- | :--- |
| **"My new block went inside the Repeat/If loop instead of after it!"** | The insertion bar (`＋ NEXT BLOCK GOES HERE`) was still inside the group. | Tap **Undo**, then tap the **`After End ⤵`** badge on the `End` row so the green bar moves below `End`. |
| **"Run and Step buttons are grayed out and the status bar is red!"** | **Emergency stop** is latched (`estop` state). | Click **Reset ↺** in the bottom bar. By safety design, Emergency stop stays latched until a human explicitly resets. |
| **"Pip only moved 1 square in Sensor scout and stopped!"** | Student used `If clear { Forward }` *without* wrapping it inside `Until pad`. | Point to the status bar tip: *"An If block checks only once — wrap it inside Until pad to keep checking!"* |
| **"I completed Normal delivery in Safety lab, why didn't the reflection question pop up?"** | Mission 04 requires practicing all **4 safety drills** (Deliver, Crate, Sensor fault, Emergency stop). | Click the remaining unchecked badges in the **Safety drill checklist** under the map and run each one. |
| **"A student accidentally deleted their whole program!"** | Clicked `Clear` (deletes the whole program) — or clicked `×` on a block, which removes just that one block. | Click **Undo** (stores up to 40 steps of history). |
| **"The previous group's checkmarks are still showing on a shared Chromebook."** | Progress is saved to browser `localStorage`. | Click **Save & offline** (top right) → **Start over on a shared device** → **Erase local progress**. |

---

## 6. Differentiation for Ages 8–11 vs. Ages 12–17

- **Younger Learners (Ages 8–11):**
  - Focus on **Missions 01, 02, and 05 (Creative sandbox)** with **Slow** speed selected so they can physically point to each tile as Pip moves.
  - Have partners stand up and physically act out `Forward` vs. `Turn left` before building Mission 02.
- **Older Learners (Ages 12–17):**
  - Watch the **Live Code Preview** (`JavaScript` and `Python` toggle) while building blocks in Missions 01–02, then switch to **Code lab ↗** for Missions 03–05 to write `while (!atGoal())` and `if (clearAhead())` directly as text code.
  - Challenge them in **Mission 05 (Creative sandbox)** to build a maze that *defeats* a simple wall-follower (`if (clearAhead()) move(); else left();`) and explain why stateless reactive policies cannot solve every topology.
