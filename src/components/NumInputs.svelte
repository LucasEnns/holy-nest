<script>
import { settings } from '../stores'

export let value,
  min = 0,
  max,
  step,
  english = '',
  french = '',
  measurement = ''

function highlight() {
  this.select()
}
</script>

<style>
h5 {
  font-size: var(--small);
  padding-left: 2rem;
  white-space: nowrap;
  display: flex;
  /* width: fit-content; */
}
h5 > input {
  width: 2%;
  flex: 2 !important;
  text-align: right;
}
input:hover {
  color: var(--primary);
  background-color: var(--primary-bg);
  text-decoration: underline;
}
</style>

<h5>
  {$settings.language.includes('fr') ? french : english}:
  <input
    type="number"
    on:click="{highlight}"
    bind:value
    min="{min}"
    max="{max}"
    step="{step}" />
  {measurement}
</h5>
