<script>
import { settings } from '../stores.js'
// import { createEventDispatcher } from 'svelte'

// const dispatch = createEventDispatcher()

// function toggle() {
//   dispatch('toggle')
// }

export let english = '',
  french = ''
</script>

<style>
.tooltip {
  opacity: 0;
  /* display: none; */
}

.tip,
.pointer {
  z-index: 99;
  position: absolute;
  left: 110%;
  top: 100%;
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
  transform: skewX(30deg);
  border-radius: 0;
  width: 0.5rem;
  height: 0.5rem;
  content: '';
}
*:hover > .tooltip {
  /* display: block; */
  opacity: 1;
  transition: 0.1s;
  transition-delay: 1s;
}
</style>

<div class="tooltip">
  <div class="pointer"></div>
  <div class="tip">{$settings.language.includes('fr') ? french : english}</div>
</div>
