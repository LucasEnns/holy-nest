<script>
import { settings } from '../stores.js'
import { createEventDispatcher } from 'svelte'

const dispatch = createEventDispatcher()

function toggle() {
  dispatch('toggle')
}

export let checked,
  on,
  off,
  separator = ':',
  english = '',
  french = ''
</script>

<style>
h5 {
  font-size: var(--small);
  padding-left: 2rem;
  white-space: nowrap;
  display: flex;
}
.switch {
  position: relative;
  display: inline-block;
  width: 1.05in;
  height: 1.5rem;
}
.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  vertical-align: middle;
  -webkit-transition: 0.2s;
  transition: 0.2s;
}
.slider:hover:after {
  text-decoration: underline;
  text-underline-offset: 0.2em;
}
.slider:after {
  color: var(--primary);
  display: block;
  position: absolute;
  left: 1rem;
  font-weight: 100;
  font-size: var(--medium);
  content: attr(data-content);
}
input[type='checkbox'] {
  top: 0.5em;
  width: 0.1px;
  height: 0.1px;
  opacity: 0;
  overflow: hidden;
  position: absolute;
  z-index: -1;
}
</style>

<h5>
  {$settings.language.includes('fr') ? french : english}{separator}
  <label class="switch"><input
      type="checkbox"
      on:click="{toggle}"
      bind:checked />
    <div class="slider" data-content="{checked ? on : off}"></div></label>
</h5>
