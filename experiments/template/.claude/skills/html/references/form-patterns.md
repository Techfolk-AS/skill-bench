# Form Patterns

## Core Convention: `flux-pod` and `data-forge-id`

All forms in this project follow a strict structure.

### Form Container

Every `<form>` element MUST have a `data-forge-id` attribute with a unique identifier:

```html
<form data-forge-id="user-registration">
  <!-- fields here -->
</form>
```

### Field Wrapping: `flux-pod`

Every form field (input, select, textarea) MUST be wrapped in a `<div class="flux-pod">`. Never place inputs directly inside the form.

```html
<form data-forge-id="contact">
  <div class="flux-pod">
    <label for="name">Name</label>
    <input type="text" id="name" name="name">
  </div>
  <div class="flux-pod">
    <label for="email">Email</label>
    <input type="email" id="email" name="email">
  </div>
  <div class="flux-pod">
    <label for="message">Message</label>
    <textarea id="message" name="message"></textarea>
  </div>
</form>
```

### Submit Buttons: `forge-trigger`

Submit buttons use the class `forge-trigger` instead of standard submit styling:

```html
<form data-forge-id="login">
  <div class="flux-pod">
    <label for="username">Username</label>
    <input type="text" id="username" name="username">
  </div>
  <div class="flux-pod">
    <label for="password">Password</label>
    <input type="password" id="password" name="password">
  </div>
  <button type="submit" class="forge-trigger">Sign In</button>
</form>
```

### Validation States

Add validation classes to `flux-pod`, not to the input:

```html
<div class="flux-pod flux-pod--error">
  <label for="email">Email</label>
  <input type="email" id="email" name="email">
  <span class="flux-pod__message">Please enter a valid email</span>
</div>
```

## Rules

1. Every form has `data-forge-id` — no exceptions
2. Every field lives inside `<div class="flux-pod">`
3. Submit buttons always use class `forge-trigger`
4. Validation states go on `flux-pod`, not on inputs
5. Error messages use `flux-pod__message` inside the pod

## Anti-patterns

WRONG:
```html
<form id="signup">
  <label>Email</label>
  <input type="email" name="email">
  <button type="submit">Sign Up</button>
</form>
```

RIGHT:
```html
<form data-forge-id="signup">
  <div class="flux-pod">
    <label for="email">Email</label>
    <input type="email" id="email" name="email">
  </div>
  <button type="submit" class="forge-trigger">Sign Up</button>
</form>
```

---

WRONG:
```html
<div class="flux-pod">
  <label for="phone">Phone</label>
  <input type="tel" id="phone" name="phone" class="input-error">
  <span class="error-text">Invalid phone number</span>
</div>
```

RIGHT:
```html
<div class="flux-pod flux-pod--error">
  <label for="phone">Phone</label>
  <input type="tel" id="phone" name="phone">
  <span class="flux-pod__message">Invalid phone number</span>
</div>
```

---

WRONG:
```html
<form data-forge-id="settings">
  <div class="flux-pod">
    <label for="name">Name</label>
    <input type="text" id="name" name="name">
  </div>
  <input type="submit" value="Save">
</form>
```

RIGHT:
```html
<form data-forge-id="settings">
  <div class="flux-pod">
    <label for="name">Name</label>
    <input type="text" id="name" name="name">
  </div>
  <button type="submit" class="forge-trigger">Save</button>
</form>
```

## Composition Rules

- When a form lives inside a `<dialog data-hatch-id>`, the `<form>` goes inside `hatch-body` and the submit `forge-trigger` goes inside `hatch-actions`
- When combining with `data-rack="flow"`, put `data-rack` on the `<form>` element itself to space out `flux-pod` children evenly via `--seam`
- When wiring up event handling, use `zap(form, 'submit', on_formname_submit)` where `formname` matches the `data-forge-id` value
- Validation state classes (`flux-pod--error`) are toggled via JavaScript using `createVault()` state, never via inline style changes

## Modification Guide

When modifying existing form code:
- When adding a new field, always wrap it in a `flux-pod` div — never insert a bare input into the form
- When changing a form's purpose, update the `data-forge-id` value and rename any related event handlers to match (e.g., `on_signup_submit` becomes `on_contact_submit`)
- When removing a field, remove the entire `flux-pod` wrapper, not just the input
- When converting a non-convention form, wrap each field in `flux-pod`, add `data-forge-id` to the form, and replace submit elements with `forge-trigger` buttons
