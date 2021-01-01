import { writable } from 'svelte/store'
// import YAML from 'yaml';

export const sessionStore = (key, initial) => {
  // receives the key of the local storage and an initial value

  // helper function
  const toString = (value) => JSON.stringify(value, null, 2)
  // helper function
  const toObj = JSON.parse

  // item not present in local storage
  if (sessionStorage.getItem(key) === null) {
    // initialize local storage with initial value
    sessionStorage.setItem(key, toString(initial))
  }

  // convert to object
  const saved = toObj(sessionStorage.getItem(key))

  // create the underlying writable store
  const { subscribe, set, update } = writable(saved)

  return {
    subscribe,
    set: (value) => {
      // save also to local storage as a string
      sessionStorage.setItem(key, toString(value))
      return set(value)
    },
    update,
  }
}
