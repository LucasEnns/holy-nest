<script>
import { settings, data } from '../stores.js'
import { toMM, toInches } from '../methods.js'
import { createEventDispatcher } from 'svelte'

const dispatch = createEventDispatcher()

$: metric = $data.csv.contents[3][1]
$: showUnits = metric ? 'mm' : '//'
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
  $data.csv.contents[3][1] = $settings.units = !metric
}
</script>

<style>
.wrapper {
  display: flex;
  flex-direction: column;
  height: 90vh;
  /* justify-content: space-evenly; */
  overflow-y: scroll;
}

ul {
  font-size: var(--small);
  display: grid;
  grid-template-columns: 3fr 2fr 5fr 5fr;
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
  line-height: var(--xxlarge);
  text-align: center;
  cursor: pointer;
}
li small {
  position: relative;
  top: -1.5em;
  /* z-index: 4; */
  font-size: 0.15em;
  font-weight: 700;
}

.header span:hover {
  text-decoration: overline;
}

input {
  width: 100%;
  height: 100%;
  border-radius: 0;
  text-align: center;
}
input:hover {
  color: var(--primary-bg);
  background-color: var(--second);
}
/* .title {
  column-span: 3;
} */

div {
  padding-top: 1rem;
  /* vertical-align: bottom; */
}

.switch input {
  top: 0.5em;
  width: 0.1px;
  height: 0.1px;
  opacity: 0;
  overflow: hidden;
  position: absolute;
  z-index: -1;
}

input[type='checkbox'] {
  opacity: 0;
}

.switch {
  position: relative;
  display: inline-block;
  width: 1.05in;
  height: 1.5rem;
  top: 0.4rem;
  left: 0.3rem;
}
.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  vertical-align: middle;
  /* padding-bottom: 0.2rem; */
  /* background-color: #8ffffd; */
  -webkit-transition: 0.2s;
  transition: 0.2s;
  border: 1px solid var(--primary);
  border-top: transparent;
  border-right: transparent;
  border-bottom-left-radius: 0.2rem;
}
.slider:hover:after,
input:checked + .direction:hover:after {
  text-decoration: overline;
}
.direction:hover:after,
select:hover {
  text-decoration: underline;
  /* border: 1px solid var(--primary);
  border-radius: 0.2rem; */
}
.slider:before {
  position: absolute;
  content: '';
  height: 1.5rem;
  width: 1px;
  right: 0.05in;
  top: 0;
  background-color: var(--primary);
  -webkit-transition: 0.2s;
  transition: 0.2s;
}
input:checked + .slider:before {
  -webkit-transform: translateX(-24mm);
  -ms-transform: translateX(-24mm);
  transform: translateX(-24mm);
}
.slider:after {
  content: 'inches';
  color: var(--primary);
  display: block;
  position: absolute;
  top: -0.5rem;
  left: 1rem;
  font-weight: 100;
  font-size: var(--medium);
  /* transform: translate(-50%, 0%); */
}
.units[data-lang*='fr']:after {
  content: 'pouces';
}
input:checked + .units:after {
  content: 'mm';
}
</style>

<div class="wrapper">
  <!-- <div class="input-wrapper"> -->
  <h6 data-lang="{$settings.language}" data-fr="Unités: ">
    <span>Units: </span>
    <label class="switch"><input
        type="checkbox"
        on:change="{convertUnits}"
        bind:checked="{$settings.units}" />
      <div class="slider units" data-lang="{$settings.language}"></div></label>
  </h6>
  <!-- </div> -->

  <div>
    <!-- {#if $data.name} -->
    {#if $data.errors.length}
      <h5>ERROR{$data.errors.length > 1 ? 'S' : ''}:</h5>
      {#each $data.errors as error}
        <p>{error}</p>
      {/each}
    {/if}

    <ul class="header">
      <li on:click="{() => sortAscending(0)}">
        <span>{$data.csv.contents[4][0]}</span>
      </li>
      <li on:click="{() => sortDescending(1)}">
        <span>{$data.csv.contents[4][1]}</span>
      </li>
      <li on:click="{() => sortDescending(2)}">
        <span>{$data.csv.contents[4][2]}</span>
        <!-- <small> {showUnits}</small> -->
      </li>
      <li on:click="{() => sortDescending(3)}">
        <span>{$data.csv.contents[4][3]}</span>
        <!-- <small> {showUnits}</small> -->
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
    <!-- {/if} -->
    <ul class="new-row" on:click="{addRow}" role="button">+</ul>
  </div>
</div>
