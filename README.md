# redux-svelte-store

Simple wrapper to convert a [redux store](https://redux.js.org/api/store) to a synthetic [svelte readable store](https://svelte.dev/docs#readable) that conforms to the [svelte store contract](https://svelte.dev/docs#Store_contract).

## Install

```
npm install redux-svelte-store
```

## Usage

### Basic usage

```html
<script>
  import toReadable from 'redux-svelte-store'
  const svelteStore = toReaable(reduxStore)

  svelteStore.subscribe(state => { /* ... */ })
</script>

<!-- now you can use $ prefix-->
<h1>{$svelteStore.prop}</h1>
```

### Use selector

Pass a selector function as second argument.
```js
const foobarStore = toReaable(reduxStore, (state) => {
  return state.foobar
})

// listener will only be notified when `state.foobar` changed
foobarStore.subscribe(foobar => { /* ... */ })
```

Also support string key paths as arguments.

```js
/**
 * Example the app state is of shape:
 * {
 *   foo: {
 *     bar: "zoo"
 *   }
 * }
 */

const zooStore = toReaable(reduxStore, "foo", "bar")
console.log($zooStore) // "zoo"
```
