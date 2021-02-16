<script>
import { settings } from '../stores'
import { createEventDispatcher } from 'svelte'

const dispatch = createEventDispatcher()

export let open,
  english = '',
  french = '',
  icon = ''

function toggle() {
  dispatch('toggle')
}
function focused() {
  dispatch('focused')
}
</script>

<style>
.drop {
  padding-top: 1rem;
  padding-bottom: 0.1rem;
  cursor: pointer;
  display: grid;
  grid-template-columns: 10fr 1fr;
  border-bottom: 1px solid transparent;
}
h3 {
  font-weight: 300;
  font-style: italic;
}
h3 span {
  font-weight: 100;
  font-style: normal;
}
/* .drop:focus, */
.drop:hover,
.open {
  outline: none;
  border-bottom: 1px solid var(--primary);
  margin-bottom: 0.4em;
}
/* .drop:focus .end, */
.drop:hover .end {
  opacity: 1;
  color: var(--third);
  font-weight: 700;
  font-size: var(--xxlarge);
}
.end {
  /* position: relative; */
  opacity: 0;
  right: 0;
  font-size: var(--xlarge);
  /* vertical-align: 0.5em; */
}
</style>

<div class="drop" class:open on:click="{toggle}" on:focus="{focused}">
  <h3>
    <span>{icon} </span>
    {$settings.language.includes('fr') ? french : english}
  </h3>
  <span class="end">{open ? '⩓' : '⩔'}</span>
</div>
