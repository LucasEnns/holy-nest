<script>
import { settings, data } from '../stores.js'
import { toMM, toInches, trunc } from '../helperFunctions.js'
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
  $data.csv.contents[3][1] = $settings.units = !metric
}

</script>

<style>
.wrapper {
  height: max-content;
  padding: 0;
}

.info {
  color: var(--blue);
  margin: 0.3rem 0;
  border-top: 1px solid;
  border-bottom: 1px solid;
  padding-bottom: 1rem;
}
.info:hover {
  background-color: var(--second-bg);
  cursor: pointer;
}
.check {
  position: absolute;
  right: 1rem;
  margin-top: 1rem;
  font-size: var(--xxlarge);
  visibility: hidden;
}
.info:hover .check {
  visibility: visible;
}

ul {
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
li {
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
.error {
  color: var(--third);
}

.error:hover {
  background-color: var(--primary-bg);
  cursor: auto;
}

</style>

<div class="wrapper">
  <div>
    <ul class="header">
      <li on:click="{() => sortAscending(0)}">
        <h1>
          ⊛
          <Tooltips
            under="{true}"
            french="Nom de panneau"
            english="Panel Name" />
        </h1>
      </li>
      <li on:click="{() => sortDescending(1)}">
        <h1>
          ⧉
          <Tooltips under="{true}" french="Quantité" english="Quantity" />
        </h1>
      </li>
      <li on:click="{() => sortDescending(2)}">
        <!-- <h4>∣X∣⍈</h4> -->
        <h1>
          ⍈
          <Tooltips
            under="{true}"
            french="Largeur ({metric ? 'mm' : 'po'})"
            english="Width ({metric ? 'mm' : 'in'})" />
        </h1>
      </li>
      <li on:click="{() => sortDescending(3)}">
        <!-- <h4>Y⇫⍐</h4> -->
        <h1>
          ⍗
          <Tooltips
            under="{true}"
            french="Hauteur ({metric ? 'mm' : 'po'})"
            english="Height ({metric ? 'mm' : 'in'})" />
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
          <Tooltips
            under="{true}"
            french="Nom de panneau"
            english="Panel Name" />
        </li>
        <li>
          <input
            type="number"
            min="0"
            max="100"
            bind:value="{line[1]}"
            on:focus="{highlight}" />
          <Tooltips under="{true}" french="Quantité" english="Quantity" />
        </li>
        <li>
          <input
            class:error="{line[2] > findMax('width')}"
            type="number"
            min="0"
            max="{findMax('width')}"
            bind:value="{line[2]}"
            on:focus="{highlight}"
            step="{metric ? 0.25 : 0.03125}" />
          <Tooltips
            under="{true}"
            french="Largeur ({metric ? 'mm' : 'po'})"
            english="Width ({metric ? 'mm' : 'in'})" />
        </li>
        <li>
          <input
            class:error="{line[3] > findMax('height')}"
            type="number"
            min="0"
            max="{findMax('height')}"
            bind:value="{line[3]}"
            on:focus="{highlight}"
            step="{metric ? 0.25 : 0.03125}" />
          <Tooltips
            under="{true}"
            french="Hauteur ({metric ? 'mm' : 'po'})"
            english="Height ({metric ? 'mm' : 'in'})" />
        </li>
      </ul>
    {/each}
    <ul class="new-row" on:click="{addRow}" role="button">+</ul>
  </div>

  {#if $data.errors.length}
    <div class="info error">
      <h5 class="error">ERREUR{$data.errors.length > 1 ? 'S' : ''}:</h5>
      {#each $data.errors as error}
        <p class="error">{error}</p>
      {/each}
    </div>
  {/if}

  {#if $data.averageWaste}
    <div class="info" on:click="{() => ($data.averageWaste = false)}">
      <h5 class="check">✕</h5>
      <h5>Moyen perte/feuille: {trunc($data.averageWaste.all, 1)} %</h5>
      <h5>
        Moyen perte/feuille plein:
        {$data.sheets.length > 1 ? trunc($data.averageWaste.full, 1) : 0}
        %
      </h5>
    </div>
  {/if}
</div>
