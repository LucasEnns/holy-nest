<script>
import { sheets, csvFile, settings, panels, activePanel } from '../stores.js'
import { trunc } from '../methods.js'

const csvHeaderRows = 5
$: lines = $csvFile.contents.slice(csvHeaderRows)

function highlight() {
  this.select()
}

function addRow() {
  let row = [lines.length + 1, , ,]
  $csvFile.contents = [...$csvFile.contents, row]
}

function sortAscending(index) {
  //add support for alpha numberic
  lines = lines.sort((a, b) => a[index] - b[index])
}
function sortDescending(index) {
  lines = lines.sort((a, b) => b[index] - a[index])
}
</script>

<style>
.wrapper {
  display: flex;
  flex-direction: column;
  height: 90vh;
  /* justify-content: space-evenly; */
  overflow-y: scroll;
  /* margin-right: 1vw; */
}

ul {
  font-size: var(--med);
  display: grid;
  grid-template-columns: 3fr 2fr 4fr 4fr;
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
li:hover {
  text-decoration: overline;
}

input {
  width: 100%;
  height: 100%;
  border-radius: 0;
}
.title {
  column-span: 3;
}

div {
  font-size: 0.8em;
  /* vertical-align: bottom; */
}
</style>

<div class="wrapper">
  <div>
    {#if $csvFile.name}
      {#if $csvFile.errors.length}
        <h5>ERROR{$csvFile.errors.length > 1 ? 'S' : ''}:</h5>
        {#each $csvFile.errors as error}
          <p>{error}</p>
        {/each}
      {/if}

      <ul>
        <li>PROJECT:</li>
        <li></li>
        <li>
          <input
            class="title"
            type="text"
            bind:value="{$csvFile.contents[0][1]}" />
        </li>
      </ul>

      <ul>
        <li on:click="{() => sortAscending(0)}">Panel</li>
        <li on:click="{() => sortDescending(1)}">Q</li>
        <li on:click="{() => sortDescending(2)}">W</li>
        <li on:click="{() => sortDescending(3)}">H</li>
      </ul>
      {#each lines as line}
        <ul
          class="{$activePanel == line[0] ? 'active' : ''}"
          on:mouseenter="{() => ($activePanel = line[0])}"
          on:mouseleave="{() => ($activePanel = '')}">
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
              max="{$settings.material.width - $settings.material.margins * 2}"
              bind:value="{line[2]}"
              on:focus="{highlight}"
              step="0.03125" />
          </li>
          <li>
            <input
              type="number"
              min="0"
              max="{$settings.material.height - $settings.material.margins * 2}"
              bind:value="{line[3]}"
              on:focus="{highlight}"
              step="0.03125" />
          </li>
        </ul>
      {/each}
    {/if}
    <ul class="new-row" on:click="{addRow}">+</ul>
  </div>
</div>
