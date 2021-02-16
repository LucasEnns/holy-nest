import { writable } from 'svelte/store'

export const localStore = (key, initial) => {
  const str = (obj) => JSON.stringify(obj, null, 2)
  // set with initial value if item not present
  if (!localStorage.getItem(key)) {
    localStorage.setItem(key, str(initial))
  }

  function localKey() {
    return JSON.parse(localStorage.getItem(key))
  }
  // reset with initial value as string if settings updated
  if (!sameKeys(localKey(), initial)) {
    console.log(localKey(), initial)
    localStorage.setItem(key, str(initial))
  }
  // create the writable store
  const { subscribe, set, update } = writable(localKey())

  return {
    subscribe,
    set: (value) => {
      // save also to local storage as a string
      localStorage.setItem(key, str(value))
      return set(value)
    },
    update,
  }
}

function sameKeys(obj1, obj2) {
  return Object.keys(obj1).join() === Object.keys(obj2).join()
}
