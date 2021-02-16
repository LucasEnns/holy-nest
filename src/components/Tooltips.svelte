<script>
import { settings } from '../stores.js'
// import { createEventDispatcher } from 'svelte'

// const dispatch = createEventDispatcher()

// function toggle() {
//   dispatch('toggle')
// }

export let english = '',
  french = '',
  under = false
</script>

<style>
.tooltip {
  z-index: 99;
  opacity: 0;
  position: absolute;
  left: 140%;
  top: 50%;
}

.under {
  left: 80%;
  top: 100%;
}

.tip,
.pointer {
  z-index: 99;
  position: fixed;
  white-space: nowrap;
  transition: 0.1s;
  outline: none;
  background-color: var(--primary);
  color: var(--primary-bg);
  font-size: var(--small);
  font-weight: 600;
  padding: var(--xsmall);
  border-radius: var(--xsmall);
  pointer-events: none;
}
.pointer {
  transform: skew(30deg);
  border-radius: 0.2rem;
  content: '';
}
*:hover > .tooltip {
  opacity: 1;
  transition: 0.1s;
  transition-delay: 1s;
}
</style>

<div class="tooltip" class:under>
  <div class="pointer"></div>
  <div class="tip">{$settings.language.includes('fr') ? french : english}</div>
</div>
