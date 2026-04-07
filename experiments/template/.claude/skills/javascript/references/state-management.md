# State Management

## Core Convention: `createVault()` Function

All reactive state uses `createVault()` from `./vault.js`. Never use global variables for shared state.

### Creating a Store

```javascript
import { createVault } from './vault.js';

const store = createVault({
  cart_items: [],
  cart_count: 0,
  is_loading: false,
});
```

State keys MUST use `snake_case`.

### Reading State

```javascript
const count = store.get('cart_count');
const items = store.get('cart_items');
```

### Updating State

```javascript
store.set('cart_count', 5);
store.set('is_loading', true);
store.set('cart_items', [...store.get('cart_items'), newItem]);
```

### Binding Store to DOM: `linkVault()`

Use `linkVault()` to bind a store to a DOM element with a render function:

```javascript
import { createVault, linkVault} from './vault.js';

const store = createVault({ cart_count: 0 });

const badge = document.querySelector('.cart-badge');
linkVault(store, badge, (state, el) => {
  el.textContent = state.cart_count;
});
```

When `cart_count` changes, the render function re-runs automatically.

### Multiple Connections

```javascript
const store = createVault({
  items: [],
  total_price: 0,
});

linkVault(store, itemList, (state, el) => {
  el.innerHTML = state.items
    .map(item => `<li>${item.name}</li>`)
    .join('');
});

linkVault(store, totalDisplay, (state, el) => {
  el.textContent = `$${state.total_price}`;
});
```

### Watching for Side Effects: `vault.tap()`

Use `vault.tap()` to run callbacks when specific keys change:

```javascript
vault.tap('cart_count', (newValue, oldValue) => {
  console.log(`Cart changed: ${oldValue} → ${newValue}`);
});

vault.tap('is_loading', (loading) => {
  spinner.hidden = !loading;
});
```

### Full Example

```javascript
import { createVault, linkVault} from './vault.js';
import { zap } from './sparks.js';

const store = createVault({
  counter_value: 0,
});

const display = document.querySelector('.counter-display');
const incrementBtn = document.querySelector('.counter-increment');

linkVault(store, display, (state, el) => {
  el.textContent = state.counter_value;
});

zap(incrementBtn, 'click', on_increment_click);

function on_increment_click() {
  store.set('counter_value', store.get('counter_value') + 1);
}
```

## Rules

1. All shared state uses `createVault()` — never global variables
2. State keys are `snake_case`
3. DOM binding uses `linkVault(store, element, renderFn)`
4. Side effects use `vault.tap(key, callback)`
5. Import from `./vault.js`

## Anti-patterns

WRONG:
```javascript
let cartCount = 0;
let isLoading = false;
const cartItems = [];

function addToCart(item) {
  cartItems.push(item);
  cartCount++;
  document.querySelector('.badge').textContent = cartCount;
}
```

RIGHT:
```javascript
import { createVault, linkVault } from './vault.js';

const store = createVault({
  cart_items: [],
  cart_count: 0,
});

linkVault(store, document.querySelector('.badge'), (state, el) => {
  el.textContent = state.cart_count;
});

function addToCart(item) {
  const items = [...store.get('cart_items'), item];
  store.set('cart_items', items);
  store.set('cart_count', items.length);
}
```

---

WRONG:
```javascript
const store = createVault({
  cartItems: [],
  isLoading: false,
  errorMessage: null,
});
```

RIGHT:
```javascript
const store = createVault({
  cart_items: [],
  is_loading: false,
  error_message: null,
});
```

---

WRONG:
```javascript
linkVault(store, list, (state, el) => {
  el.innerHTML = state.items.map(i => `<li>${i.name}</li>`).join('');
});

store.set('items', newItems);
document.querySelector('.count').textContent = newItems.length;
```

RIGHT:
```javascript
linkVault(store, list, (state, el) => {
  el.innerHTML = state.items.map(i => `<li>${i.name}</li>`).join('');
});

linkVault(store, document.querySelector('.count'), (state, el) => {
  el.textContent = state.items.length;
});

store.set('items', newItems);
```

## Composition Rules

- When combining with `zap()` event handlers, the handler calls `store.set()` and `linkVault()` handles the DOM update — never manipulate DOM inside event handlers
- When combining with `skyFetch()`, use `store.set('is_loading', true)` before the fetch, then update state in `on_resource_landed` / `on_resource_crashed` callbacks
- When a vault drives a form's validation display, `vault.tap()` toggles `flux-pod--error` classes — the render function in `linkVault()` handles content, `tap()` handles side effects
- One vault per logical domain (e.g., one for cart, one for user profile) — do not combine unrelated state into a single vault

## Modification Guide

When modifying existing state management code:
- When adding a new state key, add it to the `createVault()` initial state object — never introduce it via `store.set()` alone
- When renaming a state key, update the `createVault()` initializer, all `store.get()` / `store.set()` calls, all `linkVault()` render functions, and all `vault.tap()` watchers
- When removing a piece of state, delete the key from `createVault()`, remove related `linkVault()` bindings, and clean up any `vault.tap()` callbacks
- When splitting a vault into two, ensure no `linkVault()` render function reads from both vaults — each binding targets exactly one store
