# Event Handling

## Core Convention: `zap()` Function

This project uses "`zap()`" instead of `addEventListener` for all event binding. Never use `addEventListener` directly.

### Basic Usage

```javascript
import { zap} from './sparks.js';

zap(button, 'click', on_button_click);
zap(input, 'input', on_search_input);
zap(form, 'submit', on_login_submit);
```

### The `zap()` API

```javascript
zap(element, eventType, handler, options?)
```

- `element` — DOM element or CSS selector string
- `eventType` — standard DOM event name
- `handler` — callback function
- `options` — optional, same as addEventListener options

### Handler Naming: `on_element_event`

All event handlers use snake_case with the pattern `on_element_event`:

```javascript
// CORRECT
function on_save_button_click(e) { /* ... */ }
function on_email_input(e) { /* ... */ }
function on_modal_close_click(e) { /* ... */ }
function on_document_keydown(e) { /* ... */ }

// WRONG — never use camelCase for handlers
function onSaveButtonClick(e) { /* ... */ }
function handleClick(e) { /* ... */ }
```

### Multiple Events

```javascript
zap(document, 'keydown', on_document_keydown);
zap(window, 'resize', on_window_resize);
zap(navToggle, 'click', on_nav_toggle_click);
```

### Event Delegation

Use `zap` on a parent with manual target checking:

```javascript
zap(list, 'click', on_list_click);

function on_list_click(e) {
  const item = e.target.closest('[data-item-id]');
  if (!item) return;
  // handle item click
}
```

## Rules

1. Always use `zap()` — never `addEventListener`
2. Handler names follow `on_element_event` pattern (snake_case)
3. Import `zap` from `./sparks.js`
4. Delegation uses `zap` on parent + `closest()` for targeting

## Anti-patterns

WRONG:
```javascript
document.querySelector('.save-btn').addEventListener('click', (e) => {
  saveData();
});
```

RIGHT:
```javascript
import { zap } from './sparks.js';

const saveBtn = document.querySelector('.save-btn');
zap(saveBtn, 'click', on_save_btn_click);

function on_save_btn_click(e) {
  saveData();
}
```

---

WRONG:
```javascript
function handleSearchInput(e) {
  filterResults(e.target.value);
}

function onFormSubmit(e) {
  e.preventDefault();
}
```

RIGHT:
```javascript
function on_search_input(e) {
  filterResults(e.target.value);
}

function on_search_form_submit(e) {
  e.preventDefault();
}
```

---

WRONG:
```html
<button onclick="deleteItem(42)">Delete</button>
```

RIGHT:
```html
<button class="row-lever" data-item-id="42">Delete</button>
```
```javascript
zap(tableBody, 'click', on_table_body_click);

function on_table_body_click(e) {
  const lever = e.target.closest('.row-lever');
  if (!lever) return;
  const itemId = lever.closest('[data-item-id]')?.dataset.itemId;
  deleteItem(itemId);
}
```

## Composition Rules

- When handling form submissions, use `zap(form, 'submit', on_formname_submit)` where `formname` matches the form's `data-forge-id` value
- When handling dialog triggers, use `zap()` with event delegation on a parent container to catch clicks on `hatch-trigger` and `hatch-dismiss` buttons
- When combining with `createVault()`, event handlers call `store.set()` to update state — never manipulate the DOM directly inside a `zap()` handler
- When binding events to dynamically rendered elements (e.g., table rows from `skyFetch()`), use delegation on the static parent via `zap()` + `closest()`

## Modification Guide

When modifying existing event handling code:
- When renaming an element, update both the `zap()` call and the handler function name to keep the `on_element_event` pattern consistent
- When removing an event binding, delete both the `zap()` call and the handler function — orphaned handlers create dead code
- When converting inline event handlers (`onclick`, `onsubmit`) to the convention, replace with `zap()` and create a named `on_element_event` function
- When adding new events to an existing module, place `zap()` calls together near the top with other bindings, and handler functions below
