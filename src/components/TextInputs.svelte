<script>
import { settings } from '../stores'

export let value,
  english = '',
  french = ''

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
  /* width: calc(100% - 6rem); */
}
h5 > input {
  width: 2%;
  flex: 2 !important;
  text-align: right;
  padding-right: 1rem;
}
input:focus,
input:hover {
  /* border-bottom: 1px solid var(--primary); */
  /* color: var(--primary);
  background-color: var(--primary-bg); */
  text-underline-offset: 0.1em;
  text-decoration: underline;
}
</style>

<h5>
  {$settings.language.includes('fr') ? french : english}:
  <input type="text" on:click="{highlight}" bind:value />
</h5>
