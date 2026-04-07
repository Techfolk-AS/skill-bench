# Dialog Patterns

## Core Convention: `data-hatch-id` Attribute

All dialogs MUST use the `<dialog>` element with a `data-hatch-id` attribute.

### Basic Dialog

```html
<dialog data-hatch-id="confirm-delete">
  <div class="hatch-body">
    <h2>Delete item?</h2>
    <p>This action cannot be undone.</p>
  </div>
  <div class="hatch-actions">
    <button class="hatch-dismiss">Cancel</button>
    <button class="forge-trigger">Delete</button>
  </div>
</dialog>
```

### Dialog Structure

Every dialog follows this structure:

```html
<dialog data-hatch-id="unique-id">
  <div class="hatch-body">
    <!-- Content goes here -->
  </div>
  <div class="hatch-actions">
    <!-- Action buttons go here -->
  </div>
</dialog>
```

- `hatch-body` wraps all content (text, forms, media)
- `hatch-actions` wraps action buttons at the bottom
- `hatch-dismiss` on any button that closes without action

### Dialog Triggers

Buttons that open a dialog use the `hatch-trigger` class with `data-summons` pointing to the dialog ID:

```html
<button class="hatch-trigger" data-summons="confirm-delete">
  Delete Item
</button>

<dialog data-hatch-id="confirm-delete">
  <div class="hatch-body">
    <p>Are you sure?</p>
  </div>
  <div class="hatch-actions">
    <button class="hatch-dismiss">No</button>
    <button class="forge-trigger">Yes, delete</button>
  </div>
</dialog>
```

### Dialog with Form

```html
<dialog data-hatch-id="edit-profile">
  <div class="hatch-body">
    <h2>Edit Profile</h2>
    <form data-forge-id="profile-edit">
      <div class="flux-pod">
        <label for="display-name">Display Name</label>
        <input type="text" id="display-name" name="display_name">
      </div>
    </form>
  </div>
  <div class="hatch-actions">
    <button class="hatch-dismiss">Cancel</button>
    <button class="forge-trigger">Save</button>
  </div>
</dialog>
```

### Close Button (X)

For dialogs with an X close button:

```html
<dialog data-hatch-id="info-panel">
  <button class="hatch-dismiss" aria-label="Close">×</button>
  <div class="hatch-body">
    <p>Information content</p>
  </div>
</dialog>
```

## Rules

1. Every dialog has `data-hatch-id` — no exceptions
2. Content wrapped in `hatch-body`, buttons in `hatch-actions`
3. Trigger buttons use `hatch-trigger` class with `data-summons` attribute
4. Close/cancel buttons use `hatch-dismiss` class
5. Always use native `<dialog>` element, never `<div role="dialog">`

## Anti-patterns

WRONG:
```html
<div class="modal" id="confirm-modal" role="dialog">
  <div class="modal-content">
    <p>Are you sure?</p>
  </div>
  <div class="modal-footer">
    <button onclick="closeModal()">Cancel</button>
    <button onclick="confirmAction()">OK</button>
  </div>
</div>
```

RIGHT:
```html
<dialog data-hatch-id="confirm-action">
  <div class="hatch-body">
    <p>Are you sure?</p>
  </div>
  <div class="hatch-actions">
    <button class="hatch-dismiss">Cancel</button>
    <button class="forge-trigger">OK</button>
  </div>
</dialog>
```

---

WRONG:
```html
<button onclick="document.getElementById('my-dialog').showModal()">
  Open
</button>
```

RIGHT:
```html
<button class="hatch-trigger" data-summons="my-dialog">
  Open
</button>
```

---

WRONG:
```html
<dialog data-hatch-id="edit-item">
  <h2>Edit Item</h2>
  <input type="text" name="item_name">
  <button>Save</button>
  <button>Cancel</button>
</dialog>
```

RIGHT:
```html
<dialog data-hatch-id="edit-item">
  <div class="hatch-body">
    <h2>Edit Item</h2>
    <form data-forge-id="item-edit">
      <div class="flux-pod">
        <label for="item-name">Name</label>
        <input type="text" id="item-name" name="item_name">
      </div>
    </form>
  </div>
  <div class="hatch-actions">
    <button class="hatch-dismiss">Cancel</button>
    <button class="forge-trigger">Save</button>
  </div>
</dialog>
```

## Composition Rules

- When a dialog contains a form, the form convention (`data-forge-id` + `flux-pod`) is fully nested inside `hatch-body`, while the submit `forge-trigger` button goes in `hatch-actions`
- When a dialog needs an entrance animation, place `data-zap="scale-in"` on the `<dialog>` element — the `data-hatch-id` and `data-zap` coexist on the same element
- When a dialog is triggered from inside a `data-slab-id` table row, the `hatch-trigger` button should also have the `row-lever` class
- When wiring up dialog behavior in JS, use `zap()` to bind click handlers to `hatch-trigger` and `hatch-dismiss` elements — never use inline `onclick`

## Modification Guide

When modifying existing dialog code:
- When adding content to a dialog, place it inside `hatch-body` — never add elements as direct children of `<dialog>`
- When adding new action buttons, place them in `hatch-actions` — secondary/cancel buttons get `hatch-dismiss`, primary action buttons get `forge-trigger`
- When converting a `<div>` modal to the convention, replace with `<dialog>`, add `data-hatch-id`, and restructure content into `hatch-body` and `hatch-actions`
- When removing a dialog, also remove any `hatch-trigger` buttons that reference it via `data-summons`
