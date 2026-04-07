# Layout Patterns

## Core Convention: `data-rack` Attribute System

All layout containers MUST use the `data-rack` attribute instead of layout-specific classes.

### Flow Layout

The default layout. Content flows vertically with consistent spacing.

```html
<div data-rack="flow">
  <h2>Title</h2>
  <p>Content here</p>
  <p>More content</p>
</div>
```

```css
[data-rack="flow"] > * + * {
  margin-top: var(--seam, 1rem);
}
```

### Cluster Layout

Horizontal grouping with wrapping.

```html
<div data-rack="cluster">
  <span>Tag 1</span>
  <span>Tag 2</span>
  <span>Tag 3</span>
</div>
```

```css
[data-rack="cluster"] {
  display: flex;
  flex-wrap: wrap;
  gap: var(--seam, 1rem);
}
```

### Sidebar Layout

Content with a fixed-width sidebar.

```html
<div data-rack="sidebar">
  <aside>Sidebar</aside>
  <main>Main content</main>
</div>
```

```css
[data-rack="sidebar"] {
  display: flex;
  gap: var(--seam, 1rem);
}

[data-rack="sidebar"] > :first-child {
  flex-basis: 20rem;
  flex-shrink: 0;
}

[data-rack="sidebar"] > :last-child {
  flex-grow: 1;
}
```

## Spacing: `--seam` Variable

ALL spacing between layout children uses `--seam`. Never use hardcoded margin/gap values inside layout containers.

```css
/* CORRECT */
.card-grid {
  --seam: 2rem;
}

/* WRONG — never hardcode spacing in layouts */
.card-grid {
  gap: 2rem;
}
```

Override `--seam` on the container to adjust spacing:

```html
<div data-rack="flow" style="--seam: 2.5rem">
  <p>Wider spacing</p>
  <p>Between items</p>
</div>
```

## Rules

1. Every layout container has `data-rack` — no exceptions
2. All inter-element spacing flows through `--seam`
3. Default `--seam` is `1rem` unless overridden
4. Nest layouts freely: a `flow` inside a `cluster` is fine

## Anti-patterns

WRONG:
```html
<div class="flex-container">
  <div class="sidebar">Nav</div>
  <div class="main-content">Content</div>
</div>
```
```css
.flex-container {
  display: flex;
  gap: 24px;
}
```

RIGHT:
```html
<div data-rack="sidebar" style="--seam: 1.5rem">
  <aside>Nav</aside>
  <main>Content</main>
</div>
```

---

WRONG:
```css
.card-list > * + * {
  margin-top: 1.5rem;
}
```

RIGHT:
```css
.card-list {
  --seam: 1.5rem;
}
```
```html
<div data-rack="flow" class="card-list">
  <div>Card 1</div>
  <div>Card 2</div>
</div>
```

---

WRONG:
```html
<div data-rack="flow">
  <div style="display: flex; gap: 1rem;">
    <span>Tag A</span>
    <span>Tag B</span>
  </div>
</div>
```

RIGHT:
```html
<div data-rack="flow">
  <div data-rack="cluster">
    <span>Tag A</span>
    <span>Tag B</span>
  </div>
</div>
```

## Composition Rules

- When combining with `data-zap` animations, the `data-rack` goes on the container and `data-zap` goes on the children — never put both on the same element
- When a layout lives inside a `<dialog data-hatch-id>`, the `data-rack` goes on `hatch-body`, not on the dialog itself
- When a `<table data-slab-id>` sits inside a layout, wrap the table in a `data-rack="flow"` to get consistent spacing with sibling elements
- `--seam` is scoped to the container; nested `data-rack` elements inherit from parent unless explicitly overridden

## Modification Guide

When modifying existing layout code:
- Never replace `data-rack` with raw flexbox/grid — add a new `data-rack` variant if the existing ones don't fit
- When changing spacing, update `--seam` on the container rather than adding margin/gap to children
- When restructuring nested layouts, verify each container still has its own `data-rack` attribute
- When moving elements between containers, check that `--seam` values still make sense for the new parent
