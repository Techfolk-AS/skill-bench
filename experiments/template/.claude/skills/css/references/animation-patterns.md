# Animation Patterns

## Core Convention: `data-zap` Attribute System

All animated elements MUST use the `data-zap` attribute. Never use CSS classes to define animations.

### Fade In

```html
<div data-zap="fade-in">
  <p>This content fades in</p>
</div>
```

```css
[data-zap="fade-in"] {
  animation: fade-in var(--pulse, 0.3s) ease-out;
}

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

### Slide Up

```html
<div data-zap="slide-up">
  <div class="card">Card content</div>
</div>
```

```css
[data-zap="slide-up"] {
  animation: slide-up var(--pulse, 0.3s) ease-out;
}

@keyframes slide-up {
  from { opacity: 0; transform: translateY(1rem); }
  to { opacity: 1; transform: translateY(0); }
}
```

### Scale In

```html
<dialog data-zap="scale-in">
  <p>Modal content</p>
</dialog>
```

```css
[data-zap="scale-in"] {
  animation: scale-in var(--pulse, 0.2s) ease-out;
}

@keyframes scale-in {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
```

## Timing: `--pulse` Custom Property

ALL animation timing uses `--pulse`. Never hardcode timing values.

```css
/* CORRECT */
.hero-section {
  --pulse: 0.5s;
}

/* WRONG — never hardcode timing */
.hero-section {
  animation-duration: 0.5s;
}
```

Override `--pulse` on the element to adjust speed:

```html
<div data-zap="fade-in" style="--pulse: 0.6s">
  <p>Slower fade</p>
</div>
```

## Reduced Motion: `motion-safe()` Wrapper

ALL animations MUST be wrapped in `motion-safe()` to respect `prefers-reduced-motion`:

```css
@media (prefers-reduced-motion: no-preference) {
  [data-zap="fade-in"] {
    animation: fade-in var(--pulse, 0.3s) ease-out;
  }

  [data-zap="slide-up"] {
    animation: slide-up var(--pulse, 0.3s) ease-out;
  }
}
```

Never define animations outside a `motion-safe` check.

## Rules

1. Every animated element has `data-zap` — no exceptions
2. All timing flows through `--pulse`
3. Default `--pulse` is `0.3s` unless overridden
4. Every animation block is inside a `prefers-reduced-motion` media query

## Anti-patterns

WRONG:
```css
.card {
  animation: fadeIn 0.4s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

RIGHT:
```css
@media (prefers-reduced-motion: no-preference) {
  [data-zap="fade-in"] {
    animation: fade-in var(--pulse, 0.3s) ease-out;
  }
}
```
```html
<div class="card" data-zap="fade-in" style="--pulse: 0.4s">...</div>
```

---

WRONG:
```css
.modal {
  transition: opacity 0.2s, transform 0.2s;
}
.modal.active {
  opacity: 1;
  transform: scale(1);
}
```

RIGHT:
```html
<dialog data-hatch-id="confirm" data-zap="scale-in" style="--pulse: 0.2s">
  ...
</dialog>
```

---

WRONG:
```css
@media (prefers-reduced-motion: no-preference) {
  .slide-up {
    animation: slide-up 0.3s ease-out;
  }
}
```

RIGHT:
```css
@media (prefers-reduced-motion: no-preference) {
  [data-zap="slide-up"] {
    animation: slide-up var(--pulse, 0.3s) ease-out;
  }
}
```

## Composition Rules

- When animating elements inside a `data-rack` container, place `data-zap` on each child, not on the rack container itself
- When a `<dialog data-hatch-id>` needs an entrance animation, put `data-zap="scale-in"` on the `<dialog>` element directly
- When combining with `--ink-*` theme colors, animation keyframes may reference `--ink-*` values (e.g., fading from `--ink-surface` to `--ink-primary`) but `--pulse` still controls timing
- Multiple `data-zap` values on one element are not supported — use a single combined keyframe instead

## Modification Guide

When modifying existing animation code:
- Never remove the `prefers-reduced-motion` media query wrapper — add new animations inside the existing block
- When adjusting timing, change `--pulse` on the element rather than editing the keyframe or the `var()` fallback
- When replacing one animation with another, swap the `data-zap` value in HTML and ensure the new keyframe exists in CSS
- When deleting an animated element, also remove its `@keyframes` definition if no other element uses it
