<script>
import { settings } from '../stores'
import { createEventDispatcher } from 'svelte'
const dispatch = createEventDispatcher()
export let value,
  min = 0,
  max,
  step,
  english = '',
  french = '',
  measurement = '',
  unit = ''

function highlight() {
  this.select()
}

function changed() {
  dispatch('changed')
}
function convert() {
  dispatch('convert')
  unit = !unit
}
</script>

<style>
h5 {
  font-size: var(--small);
  padding-left: 2rem;
  white-space: nowrap;
  display: flex;
}
input {
  width: 2%;
  flex: 2 !important;
  text-align: right;
}
span {
  cursor: pointer;
  padding-right: 1rem;
}
input:hover,
input:focus {
  text-underline-offset: 0.1em;
  text-decoration: underline;
}
</style>

<h5>
  {$settings.language.includes('fr') ? french : english}:
  <input
    type="number"
    on:click="{highlight}"
    on:change="{changed}"
    bind:value
    min="{min}"
    max="{max}"
    step="{step}" />
  <span on:click="{convert}">{measurement}</span>
</h5>
