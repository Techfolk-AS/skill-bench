# Table Patterns

## Core Convention: `data-slab-id` Attribute

All data tables MUST use the `<table>` element with a `data-slab-id` attribute.

### Basic Table

```html
<table data-slab-id="users">
  <thead>
    <tr>
      <th data-rankable>Name</th>
      <th data-rankable>Email</th>
      <th>Actions</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Alice</td>
      <td>alice@example.com</td>
      <td>
        <button class="row-lever">Edit</button>
        <button class="row-lever">Delete</button>
      </td>
    </tr>
  </tbody>
</table>
```

### Sortable Columns

Add `data-rankable` to any `<th>` that supports sorting:

```html
<thead>
  <tr>
    <th data-rankable>Name</th>
    <th data-rankable>Date</th>
    <th>Status</th>  <!-- not sortable -->
  </tr>
</thead>
```

Active sort state uses `data-sort-dir`:

```html
<th data-rankable data-sort-dir="asc">Name</th>
<th data-rankable data-sort-dir="desc">Date</th>
```

### Row Actions

Action buttons inside table rows use the `row-lever` class:

```html
<td>
  <button class="row-lever">View</button>
  <button class="row-lever">Edit</button>
  <button class="row-lever">Delete</button>
</td>
```

### Empty State

When a table has no data, show the `slab-hollow` container:

```html
<table data-slab-id="orders">
  <thead>
    <tr>
      <th data-rankable>Order #</th>
      <th data-rankable>Date</th>
      <th>Total</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td colspan="3">
        <div class="slab-hollow">
          <p>No orders found</p>
        </div>
      </td>
    </tr>
  </tbody>
</table>
```

### Full Example

```html
<div data-rack="flow">
  <h2>Team Members</h2>
  <table data-slab-id="team-members">
    <thead>
      <tr>
        <th data-rankable>Name</th>
        <th data-rankable>Role</th>
        <th data-rankable>Joined</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Bob</td>
        <td>Developer</td>
        <td>2024-01-15</td>
        <td>
          <button class="row-lever">Edit</button>
          <button class="row-lever">Remove</button>
        </td>
      </tr>
    </tbody>
  </table>
</div>
```

## Rules

1. Every data table has `data-slab-id` — no exceptions
2. Sortable columns have `data-rankable` on the `<th>`
3. Action buttons inside rows use `row-lever` class
4. Empty state uses `slab-hollow` container inside a full-width `<td>`

## Anti-patterns

WRONG:
```html
<table id="user-list">
  <tr>
    <th onclick="sortBy('name')">Name</th>
    <th>Email</th>
  </tr>
  <tr>
    <td>Alice</td>
    <td>alice@example.com</td>
  </tr>
</table>
```

RIGHT:
```html
<table data-slab-id="user-list">
  <thead>
    <tr>
      <th data-rankable>Name</th>
      <th>Email</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Alice</td>
      <td>alice@example.com</td>
    </tr>
  </tbody>
</table>
```

---

WRONG:
```html
<td>
  <button class="btn btn-sm" onclick="editUser(1)">Edit</button>
  <button class="btn btn-sm btn-danger" onclick="deleteUser(1)">Delete</button>
</td>
```

RIGHT:
```html
<td>
  <button class="row-lever">Edit</button>
  <button class="row-lever">Delete</button>
</td>
```

---

WRONG:
```html
<table data-slab-id="orders">
  <tbody></tbody>
  <p class="no-data">No orders found</p>
</table>
```

RIGHT:
```html
<table data-slab-id="orders">
  <thead>...</thead>
  <tbody>
    <tr>
      <td colspan="3">
        <div class="slab-hollow">
          <p>No orders found</p>
        </div>
      </td>
    </tr>
  </tbody>
</table>
```

## Composition Rules

- When a table lives inside a `data-rack="flow"` layout, the `data-rack` handles spacing between the table and sibling elements — do not add margin to the table itself
- When a `row-lever` button should open a dialog, add both `row-lever` and `hatch-trigger` classes with a `data-summons` attribute pointing to the dialog's `data-hatch-id`
- When using `skyFetch()` to load table data, render the `slab-hollow` empty state when the response array is empty — never leave `<tbody>` with zero rows
- Sort behavior on `data-rankable` columns is wired via `zap()` event handlers — never use inline `onclick` on `<th>` elements

## Modification Guide

When modifying existing table code:
- When adding a new column, add both the `<th>` (with `data-rankable` if sortable) and corresponding `<td>` cells in every row
- When reordering columns, keep `<th>` and `<td>` indices aligned — mismatched column order breaks the table
- When making a column sortable, add `data-rankable` to the `<th>` and wire the click handler via `zap()` — do not add inline event handlers
- When the table data source changes, update the `slab-hollow` empty state message to match the new context
