import { writable } from 'svelte/store'

export const sessionStore = (key, initial) => {
  const str = (obj) => JSON.stringify(obj, null, 2)

  // set with initial value if item not present
  if (!sessionStorage.getItem(key)) {
    sessionStorage.setItem(key, str(initial))
  }

  // create the writable store
  const { subscribe, set, update } = writable(
    JSON.parse(sessionStorage.getItem(key))
  )

  return {
    subscribe,
    set: (value) => {
      // save also to local storage as a string
      sessionStorage.setItem(key, str(value))
      return set(value)
    },
    update,
  }
}
