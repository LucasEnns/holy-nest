<script>
import { settings, data } from '../stores.js'
import { toMM, toInches } from '../methods.js'
import TextInputs from './TextInputs.svelte'
import CheckInputs from './CheckInputs.svelte'
import Tooltips from './Tooltips.svelte'
import { createEventDispatcher } from 'svelte'

const dispatch = createEventDispatcher()

$: metric = JSON.parse($data.csv.contents[3][1])
$: findMax = (directionStr) => {
  let max = $settings.material[directionStr] - $settings.material.margins * 2
  return metric ? toMM(max) : max
}

function highlight() {
  this.select()
}

function addRow() {
  let row = [$data.csv.panels.length + 1, 0, 0, 0]
  $data.csv.contents = [...$data.csv.contents, row]
  dispatch('update')
}

function sortAscending(index) {
  //add support for alpha numberic
  $data.csv.panels = $data.csv.panels.sort((a, b) => a[index] - b[index])
}
function sortDescending(index) {
  $data.csv.panels = $data.csv.panels.sort((a, b) => b[index] - a[index])
}

function convertUnits() {
  let convert = metric ? toInches : toMM
  $data.csv.panels.forEach((index) => {
    index[2] = convert(index[2])
    index[3] = convert(index[3])
  })
  // toggle boolean
  $data.csv.contents[3][1] = $settings.units = !metric
}
</script>

<style>
.wrapper {
  display: flex;
  flex-direction: column;
  height: 90vh;
  overflow-y: scroll;
}

ul {
  position: relative;
  font-size: var(--small);
  display: grid;
  grid-template-columns: 3fr 2fr 3fr 3fr;
  border-bottom: 1px solid;
}
.new-row {
  color: var(--blue);
  font-size: var(--xxlarge);
  cursor: pointer;
  text-align: center;
}
.active {
  background-color: var(--second-bg);
}
li,
li > * {
  position: relative;
  line-height: var(--xxlarge);
  text-align: center;
  cursor: pointer;
}
input {
  width: 100%;
  height: 100%;
  border-radius: 0;
  text-align: center;
}
input:after {
  content: 'in';
}
input:hover {
  color: var(--primary-bg);
  background-color: var(--second);
}
input:hover::selection {
  color: var(--primary);
  transition: 0.2s;
}
div {
  padding-top: 1rem;
}
</style>

<div class="wrapper">
  {#each [0, 2, 4] as setup, index}
    {#if $data.csv.contents[0][setup]}
      <TextInputs
        english="{$data.csv.contents[0][setup]}"
        french="{$data.csv.contents[0][setup]}"
        bind:value="{$data.csv.contents[0][setup + 1]}" />
    {/if}
  {/each}

  <CheckInputs
    on="mm"
    off="{$settings.language.includes('fr') ? 'po' : 'in'}"
    french="Dimensions"
    english="Dimensions"
    on:toggle="{convertUnits}"
    bind:checked="{$settings.units}" />
  <!-- <h6 data-lang="{$settings.language}" data-fr="Unités: ">
    <span></span>
    <label class="switch"><input
        type="checkbox"
        on:change="{convertUnits}"
        bind:checked="{$settings.units}" />
      <div class="slider units" data-lang="{$settings.language}"></div></label>
  </h6> -->

  <div>
    {#if $data.errors.length}
      <h5>ERROR{$data.errors.length > 1 ? 'S' : ''}:</h5>
      {#each $data.errors as error}
        <p>{error}</p>
      {/each}
    {/if}

    <ul class="header">
      <li on:click="{() => sortAscending(0)}">
        <h1>
          ⊛
          <Tooltips french="Nom de panneau" english="Panel Name" />
        </h1>
      </li>
      <li on:click="{() => sortDescending(1)}">
        <h1>
          ⧉
          <Tooltips french="Quantité" english="Quantity" />
        </h1>
      </li>
      <li on:click="{() => sortDescending(2)}">
        <!-- <h4>∣X∣⍈</h4> -->
        <h1>
          ⍈
          <Tooltips french="Largeur" english="Width" />
        </h1>
      </li>
      <li on:click="{() => sortDescending(3)}">
        <!-- <h4>Y⇫⍐</h4> -->
        <h1>
          ⍗
          <Tooltips french="Hauteur" english="Height" />
        </h1>
      </li>
    </ul>
    {#each $data.csv.panels as line}
      <ul
        class="{$settings.activePanel == line[0] ? 'active' : ''}"
        on:mouseenter="{() => ($settings.activePanel = line[0])}"
        on:mouseleave="{() => ($settings.activePanel = '')}">
        <li>
          <input type="text" bind:value="{line[0]}" on:focus="{highlight}" />
        </li>
        <li>
          <input
            type="number"
            min="0"
            max="100"
            bind:value="{line[1]}"
            on:focus="{highlight}" />
        </li>
        <li>
          <input
            type="number"
            min="0"
            max="{findMax('width')}"
            bind:value="{line[2]}"
            on:focus="{highlight}"
            step="{metric ? 0.25 : 0.03125}" />
        </li>
        <li>
          <input
            type="number"
            min="0"
            max="{findMax('height')}"
            bind:value="{line[3]}"
            on:focus="{highlight}"
            step="{metric ? 0.25 : 0.03125}" />
        </li>
      </ul>
    {/each}
    <ul class="new-row" on:click="{addRow}" role="button">+</ul>
  </div>
</div>
