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
  width: 2%;
  flex: 2 !important;
}
/* .switch {
  position: relative;
  display: inline-block;
  width: 1.05in;
  height: 1.5rem;
} */
.slider:after {
  position: absolute;
  display: block;
  width: 100%;
  height: 100%;
  color: var(--primary);
  text-align: right;
  font-weight: 100;
  font-size: var(--medium);
  content: attr(data-content);
  padding: 0 1rem;
  cursor: pointer;
  -webkit-transition: 0.2s;
  transition: 0.2s;
}
input:focus + .slider:after,
.slider:hover:after {
  text-decoration: underline;
  text-underline-offset: 0.1em;
}
input:focus + .slider:after {
  color: var(--third);
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
  <label class="switch">
    <input type="checkbox" on:click="{toggle}" bind:checked />
    <div class="slider" data-content="{checked ? on : off}"></div></label>
</h5>
