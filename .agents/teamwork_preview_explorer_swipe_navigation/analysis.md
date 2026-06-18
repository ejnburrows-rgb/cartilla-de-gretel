# Analysis Report: Swipe Navigation & Page Flip Integration

## Summary
An investigation was conducted on touch swipe gesture handling and its integration with horizontal and vertical page turns. Critical findings include a visual jump during previous-page vertical transitions, potential 3D depth rendering issues with the fixed spiral binding rings, and touch event cancellation on mobile devices due to default scrolling behaviors.

---

## 1. Touch Swipe Gesture Handling (`useSwipe.ts`)

### Observations
- `useSwipe.ts` registers `onPointerDown`, `onPointerMove`, and `onPointerUp` to track the touch pointer coordinates.
- It calculates the displacement vector `(dx, dy)` and determines the dominant direction (`left` | `right` | `up` | `down`) based on `Math.abs(dx) > Math.abs(dy)`.
- It does **not** register `onPointerCancel`.

### Issues & Proposed Solutions
1. **Pointer Cancellation on Mobile Scroll**: 
   - *Issue*: On touch screens, swiping up/down triggers native page scrolling, which causes the browser to fire a `pointercancel` event. This cancels the pointer sequence, meaning `pointerup` is never fired and swipe gestures fail.
   - *Solution*: 
     - Add `onPointerCancel` to `useSwipe` to clean up the pointer state:
       ```typescript
       const onPointerCancel = useCallback(() => {
         startRef.current = null;
       }, []);
       ```
     - Return and spread `onPointerCancel` alongside other handlers.
2. **CSS Touch Actions**:
   - *Issue*: To prevent the browser from scrolling and canceling touch events, we must specify `touch-action` in CSS.
   - *Solution*:
     - For **horizontal swipes** (`BookPageFlip.tsx`): Apply `touch-action: pan-y;` to the book container. This allows vertical scroll but lets the container capture horizontal swipes.
     - For **vertical swipes** (`StudentWorkbookFlip.tsx`): Apply `touch-action: pan-x;` to the swipable container. This allows horizontal page-level gestures if any, but intercepts vertical swipes for page turns.

---

## 2. Upward Vertical Flip Workbook Page Turns (`StudentWorkbookFlip.tsx`)

### Observations
- Page flips use a 3D rotation (`rotateX`) around `transform-origin: top center`.
- The transition is driven by the state variable `flipTransform`, moving between `rotateX(0deg)` and `rotateX(-180deg)` over 600ms.
- Visual jumps occur during the `prev` (previous page) transition due to incorrect page index mapping during the active flip animation.

### Issues & Proposed Solutions
1. **Visual Jump in Previous Page Transition (`prev`)**:
   - *Issue*: Currently, when going to the previous page:
     - `staticIndex` (base page) immediately switches to the target page (`currentIndex - 1`).
     - The flipping leaf starts at `rotateX(-180deg)` (top) showing the start page (`currentIndex`) on the back face and target page (`currentIndex - 1`) on the front face.
     - Consequently, the start page instantly disappears from the bottom and appears at the top, while the bottom instantly changes to the target page content before the page is even turned.
   - *Solution*: Adjust index logic so that during a `prev` flip:
     - The base page (`staticIndex`) continues to display the start page (`currentIndex`).
     - The flipping leaf front (`flipFrontIndex`) and back (`flipBackIndex`) both display the target page (`currentIndex - 1`).
     - This allows the target page to start at the top, rotate down, and cover the start page smoothly.
     - Code comparison:
       ```typescript
       // Proposed Index Logic
       const staticIndex = isFlipping && flipDirection === 'prev' 
         ? currentIndex 
         : (isFlipping && flipDirection === 'next' ? currentIndex + 1 : currentIndex);
         
       const flipFrontIndex = isFlipping 
         ? (flipDirection === 'next' ? currentIndex : currentIndex - 1) 
         : -1;
         
       const flipBackIndex = isFlipping 
         ? (flipDirection === 'next' ? currentIndex + 1 : currentIndex - 1) 
         : -1;
       ```

---

## 3. Fixed Spiral Binding Rings (`StudentWorkbookFlip.tsx` & `styles.css`)

### Observations
- Spiral rings are rendered inside `.spiral-binding` at the top of `.workbook-container`.
- They have a high `z-index: 50` while the flipping leaf has `z-index: 30`.
- In 3D space, elements undergoing 3D transforms can overlap non-transformed siblings, ignoring standard 2D `z-index` layering.

### Issues & Proposed Solutions
1. **3D Stacking and Clipping**:
   - *Issue*: During 3D transforms, the flipping page might clip through or render in front of the fixed spiral rings on mobile devices and WebKit-based browsers (Safari/iOS Chrome).
   - *Solution*:
     - Set `transform-style: preserve-3d;` on the parent `.workbook-container` in `src/styles.css` so all children share the 3D rendering context.
     - Apply a small positive Z translation (`transform: translateZ(50px);`) to `.spiral-binding` to guarantee it stays in front of the page-flip rotation axis.

---

## 4. Proposed Diffs

### Diff 1: `src/hooks/useSwipe.ts`
```patch
diff --git a/src/hooks/useSwipe.ts b/src/hooks/useSwipe.ts
index 1629..2000 100644
--- a/src/hooks/useSwipe.ts
+++ b/src/hooks/useSwipe.ts
@@ -10,2 +10,3 @@ export interface UseSwipeOptions {
   onSwipe: (data: SwipeData) => void;
+  onSwipeCancel?: () => void;
   minDistance?: number;
@@ -27,2 +28,6 @@ export function useSwipe({ onSwipe, minDistance = 30 }: UseSwipeOptions) {
 
+  const onPointerCancel = useCallback(() => {
+    startRef.current = null;
+  }, []);
+
   const onPointerUp = useCallback((event: React.PointerEvent) => {
@@ -55,2 +60,3 @@ export function useSwipe({ onSwipe, minDistance = 30 }: UseSwipeOptions) {
     onPointerMove,
     onPointerUp,
+    onPointerCancel,
   };
```

### Diff 2: `src/components/StudentBook/StudentWorkbookFlip.tsx`
```patch
diff --git a/src/components/StudentBook/StudentWorkbookFlip.tsx b/src/components/StudentBook/StudentWorkbookFlip.tsx
index 7713..8000 100644
--- a/src/components/StudentBook/StudentWorkbookFlip.tsx
+++ b/src/components/StudentBook/StudentWorkbookFlip.tsx
@@ -112,6 +112,6 @@ export function StudentWorkbookFlip({
   });
 
-  const staticIndex = isFlipping && flipDirection === 'prev' ? currentIndex - 1 : (isFlipping && flipDirection === 'next' ? currentIndex + 1 : currentIndex);
+  const staticIndex = isFlipping && flipDirection === 'prev' ? currentIndex : (isFlipping && flipDirection === 'next' ? currentIndex + 1 : currentIndex);
   const flipFrontIndex = isFlipping ? (flipDirection === 'next' ? currentIndex : currentIndex - 1) : -1;
-  const flipBackIndex = isFlipping ? (flipDirection === 'next' ? currentIndex + 1 : currentIndex) : -1;
+  const flipBackIndex = isFlipping ? (flipDirection === 'next' ? currentIndex + 1 : currentIndex - 1) : -1;
 
   // Number of rings in spiral binding
@@ -124,4 +124,5 @@ export function StudentWorkbookFlip({
     <div 
       className="relative mx-auto flex w-full max-w-xl flex-col items-center select-none"
+      style={{ touchAction: "pan-x" }}
       {...swipeHandlers}
     >
```

### Diff 3: `src/styles.css`
```patch
diff --git a/src/styles.css b/src/styles.css
index 10476..11000 100644
--- a/src/styles.css
+++ b/src/styles.css
@@ -299,2 +299,3 @@
 /* ── Vertical Spiral Workbook Flip Styles ── */
 .workbook-container {
   perspective: 1500px;
+  transform-style: preserve-3d;
   position: relative;
@@ -314,2 +315,3 @@
 .spiral-binding {
   position: absolute;
+  transform: translateZ(50px);
   top: -12px;
```

### Diff 4: `src/styles/flipbook-3d.css`
```patch
diff --git a/src/styles/flipbook-3d.css b/src/styles/flipbook-3d.css
index 1721..1900 100644
--- a/src/styles/flipbook-3d.css
+++ b/src/styles/flipbook-3d.css
@@ -2,2 +2,3 @@
 .book-container {
   perspective: 2000px;
+  touch-action: pan-y;
   position: relative;
```
