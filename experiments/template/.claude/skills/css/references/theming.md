# Theming

## Core Convention: `data-coat` Attribute

Theme is set via the `data-coat` attribute on `<html>`. Valid values: `light`, `dark`, `auto`.

```html
<html data-coat="light">
```

```html
<html data-coat="dark">
```

```html
<html data-coat="auto">
```

`auto` follows the user's OS preference via `prefers-color-scheme`.

## Brand Colors: `--ink-*` Custom Properties

All theme colors use `--ink-*` custom properties. Never hardcode color values.

```css
[data-coat="light"] {
  --ink-primary: #2563eb;
  --ink-surface: #ffffff;
  --ink-surface-alt: #f8fafc;
  --ink-text: #1e293b;
  --ink-text-muted: #64748b;
  --ink-border: #e2e8f0;
  --ink-accent: #8b5cf6;
}

[data-coat="dark"] {
  --ink-primary: #60a5fa;
  --ink-surface: #0f172a;
  --ink-surface-alt: #1e293b;
  --ink-text: #f1f5f9;
  --ink-text-muted: #94a3b8;
  --ink-border: #334155;
  --ink-accent: #a78bfa;
}
```

### Usage

```css
/* CORRECT */
.button {
  background: var(--ink-primary);
  color: var(--ink-surface);
}

/* WRONG — never hardcode colors */
.button {
  background: #2563eb;
  color: white;
}
```

## Surface Utilities: `.plate-*`

Themed background utilities for elevation and depth:

```css
.plate-elevated {
  background: var(--ink-surface);
  box-shadow: 0 1px 3px rgb(0 0 0 / 0.1);
}

.plate-sunken {
  background: var(--ink-surface-alt);
}

.plate-overlay {
  background: var(--ink-surface);
  box-shadow: 0 4px 12px rgb(0 0 0 / 0.15);
}
```

```html
<div class="surface-elevated">
  <h2>Card title</h2>
  <p>Elevated card content</p>
</div>

<div class="surface-sunken">
  <pre><code>Code block in sunken area</code></pre>
</div>
```

## Auto Theme

For `auto` mode, mirror OS preference:

```css
[data-coat="auto"] {
  --ink-primary: #2563eb;
  --ink-surface: #ffffff;
  /* ... light defaults ... */
}

@media (prefers-color-scheme: dark) {
  [data-coat="auto"] {
    --ink-primary: #60a5fa;
    --ink-surface: #0f172a;
    /* ... dark overrides ... */
  }
}
```

## Rules

1. Theme attribute goes on `<html>` — `data-coat="light|dark|auto"`
2. All colors use `--ink-*` properties — never hardcode hex/rgb
3. Use `.plate-*` utilities for themed backgrounds
4. `auto` mode uses `prefers-color-scheme` media query

## Anti-patterns

WRONG:
```css
.alert-banner {
  background: #ef4444;
  color: white;
  border: 1px solid #dc2626;
}
```

RIGHT:
```css
.alert-banner {
  background: var(--ink-accent);
  color: var(--ink-surface);
  border: 1px solid var(--ink-border);
}
```

---

WRONG:
```css
.card {
  background: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
@media (prefers-color-scheme: dark) {
  .card {
    background: #1e293b;
  }
}
```

RIGHT:
```html
<div class="plate-elevated">
  <p>Card content</p>
</div>
```

---

WRONG:
```html
<html>
  <body class="dark-theme">
```

RIGHT:
```html
<html data-coat="dark">
  <body>
```

## Composition Rules

- When using `--ink-*` colors inside `data-zap` keyframes, the animation inherits whichever theme is active — no duplication needed per theme
- When a `data-rack` layout needs a themed background, apply a `.plate-*` class to the rack container rather than setting `background` manually
- When forms (`data-forge-id`) need themed validation states, use `--ink-accent` for error highlights and `--ink-text-muted` for helper text — never hardcode red/gray
- Custom `--ink-*` properties can be added per component by scoping them under a selector, but they must follow the `--ink-` prefix convention

## Modification Guide

When modifying existing themed code:
- When adding a new color, define it in both `[data-coat="light"]` and `[data-coat="dark"]` blocks, plus inside the `[data-coat="auto"]` media query
- Never replace `var(--ink-*)` with a hardcoded value, even temporarily — it will break theme switching
- When editing `.plate-*` utilities, ensure the `box-shadow` and `background` values use only `--ink-*` variables
- When adding a new component, check if an existing `--ink-*` variable fits before creating a new one
