# Original User Request

## 2026-06-19T04:50:23Z

### R1. Premium 3D Digital Binders (Teacher UI)
Replace the existing folder screenshots in the Teacher CRM with highly realistic, 3D-rendered digital binders. They must be strictly color-coded (Blue, Red, Purple) to match the existing content categories and feel incredibly premium and professional for a school board presentation.
Note: Ensure there are no plain white backgrounds ("white, dead cutters"). Use CSS masking or transparent PNGs if incorporating hand-drawn characters, and use advanced CSS (perspective, transforms, gradients, box-shadows) for the 3D binders. Do not use emojis in CRM.

### R2. Sequential Guided Path (Student Lesson Flow)
Implement a strict, sequential progression for each lesson: (1) Learn the letter → (2) Read the story page → (3) Play minigames → (4) Take assessment. The student should seamlessly flow from one stage to the next.

### R3. Native Zero-Lag Data Architecture
All content, logic, and state for the new lesson flow must be driven by hardcoded local data (e.g., seed-data.ts or local constants) rather than an external database. This guarantees a 100% reliable, zero-lag experience during the live presentation.
