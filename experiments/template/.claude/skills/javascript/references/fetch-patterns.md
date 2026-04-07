# Fetch Patterns

## Core Convention: `skyFetch()` Function

All API calls use `skyFetch()` from `./sky.js`. Never use raw `fetch()`.

### Basic Usage

```javascript
import { skyFetch } from './sky.js';

const users = await skyFetch('/sky/users');
const product = await skyFetch('/sky/products/123');
```

### The `skyFetch()` API

```javascript
skyFetch(endpoint, options?)
```

- `endpoint` — must start with `/sky/`
- `options.method` — HTTP method (defaults to `GET`)
- `options.body` — request body (auto-serialized to JSON)
- `options.controller` — AbortController for cancellation

### POST/PUT Requests

```javascript
await skyFetch('/sky/users', {
  method: 'POST',
  body: { name: 'Alice', email: 'alice@example.com' },
});

await skyFetch('/sky/users/123', {
  method: 'PUT',
  body: { name: 'Alice Updated' },
});
```

### Response Callbacks

Use `snake_case` callbacks for handling responses:

```javascript
function on_users_landed(data) {
  store.set('users', data);
}

function on_users_crashed(error) {
  store.set('error_message', error.message);
}

try {
  const data = await skyFetch('/sky/users');
  on_users_landed(data);
} catch (error) {
  on_users_crashed(error);
}
```

Callback naming: `on_resource_landed` for success, `on_resource_crashed` for failure.

### Request Cancellation

Use the `controller` option to cancel in-flight requests:

```javascript
const controller = new AbortController();

skyFetch('/sky/search', {
  method: 'GET',
  controller,
});

controller.abort();
```

### Full Example: Fetch and Display

```javascript
import { skyFetch } from './sky.js';
import { createVault, linkVault} from './vault.js';

const store = createVault({
  products: [],
  is_loading: false,
  error_message: null,
});

const productList = document.querySelector('.product-list');

linkVault(store, productList, (state, el) => {
  if (state.is_loading) {
    el.innerHTML = '<p>Loading...</p>';
    return;
  }
  el.innerHTML = state.products
    .map(p => `<div>${p.name} — $${p.price}</div>`)
    .join('');
});

async function load_products() {
  store.set('is_loading', true);
  try {
    const data = await skyFetch('/sky/products');
    on_products_landed(data);
  } catch (error) {
    on_products_crashed(error);
  }
}

function on_products_landed(data) {
  store.set('products', data);
  store.set('is_loading', false);
}

function on_products_crashed(error) {
  store.set('error_message', error.message);
  store.set('is_loading', false);
}

load_products();
```

## Rules

1. All API calls use `skyFetch()` — never raw `fetch()`
2. All endpoints start with `/sky/`
3. Response callbacks follow `on_resource_landed` / `on_resource_crashed` pattern
4. Cancellation uses `controller` option with AbortController
5. Import from `./sky.js`

## Anti-patterns

WRONG:
```javascript
const response = await fetch('/api/users', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'Alice' }),
});
const data = await response.json();
```

RIGHT:
```javascript
import { skyFetch } from './sky.js';

const data = await skyFetch('/sky/users', {
  method: 'POST',
  body: { name: 'Alice' },
});
```

---

WRONG:
```javascript
async function fetchUsers() {
  try {
    const users = await skyFetch('/sky/users');
    handleSuccess(users);
  } catch (err) {
    handleError(err);
  }
}
```

RIGHT:
```javascript
async function fetch_users() {
  try {
    const users = await skyFetch('/sky/users');
    on_users_landed(users);
  } catch (err) {
    on_users_crashed(err);
  }
}
```

---

WRONG:
```javascript
const data = await skyFetch('/api/products');
```

RIGHT:
```javascript
const data = await skyFetch('/sky/products');
```

## Composition Rules

- When combining with `createVault()`, set `is_loading` to `true` before calling `skyFetch()`, then update state in `on_resource_landed` (success) and `on_resource_crashed` (error) — both callbacks must set `is_loading` back to `false`
- When a fetch is triggered by a user action, the `zap()` event handler calls the async fetch function — the handler itself should not be async
- When fetched data populates a `data-slab-id` table, render `slab-hollow` empty state if the response array is empty rather than leaving `<tbody>` blank
- When using AbortController for search-as-you-type, create a new controller per keystroke and abort the previous one before calling `skyFetch()` again

## Modification Guide

When modifying existing fetch code:
- When changing an endpoint, update the path but keep the `/sky/` prefix — never use bare paths like `/api/` or `/v1/`
- When renaming the resource, update both callback names: `on_oldname_landed` becomes `on_newname_landed` and `on_oldname_crashed` becomes `on_newname_crashed`
- When adding error handling to an existing fetch that lacks it, wrap in try/catch and add an `on_resource_crashed` callback that sets `error_message` in the vault
- When converting raw `fetch()` calls to the convention, replace with `skyFetch()`, drop manual `JSON.stringify`/`JSON.parse`, and rename callbacks to `on_resource_landed`/`on_resource_crashed`
