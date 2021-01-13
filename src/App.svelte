<script>
import Import from './components/Import.svelte'
import Editor from './components/Editor.svelte'
import Viewer from './components/Viewer.svelte'
import Settings from './components/Settings.svelte'
import { Nest } from './nest.js'
import { Gcode } from './gCode.js'
import { settings, data } from './stores.js'
import { toInches } from './methods.js'

function update() {
  $data.name = $data.csv.contents[0][1]
  $data.csv.panels = $data.csv.contents.slice($data.csv.headerRows)
  $data.csv.output = $data.csv.contents.join('\n')
  $data.cnc = Gcode($data, $settings)
  calculateNest()
}

function calculateNest() {
  let nest = Nest(panelsDimensionsInches(), $settings)
  $data.sheets = nest.sheets
  $data.errors = nest.errors

  function panelsDimensionsInches() {
    if ($settings.units)
      return $data.csv.panels.map((i) => [
        i[0],
        i[1],
        toInches(i[2]),
        toInches(i[3]),
      ])
    return $data.csv.panels
  }
}
update()
</script>

<style>
.container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: grid;
  grid-template-columns: minmax(24rem, 20vw) 1fr;
  overflow: hidden;
}

.import {
  position: relative;
  margin: 0 1.5vw;
  display: grid;
  grid-template-rows: minmax(6rem, 10vh) 1fr;
}

.splash {
  position: absolute;
  top: 10vh;
  left: 45vw;
  width: 40vw;
  height: 40vh;
  z-index: -1;
}
.splash-img {
  position: relative;
  left: 20%;
  width: 40%;
  height: 100%;
  background-image: url('../favicon.ico');
  background-size: contain;
  background-position: left bottom;
  background-repeat: no-repeat;
  z-index: -1;
}
h1,
h5 {
  color: var(--second);
  position: relative;
  left: 20%;
}
</style>

<svelte:body on:change="{update}" />
<div class="container">
  <div class="import">
    <Import on:update="{update}" />
    <Editor on:update="{update}" />
    <Settings />
  </div>
  <div class="main" on:click="{() => ($settings.show = false)}">
    <Viewer />
    {#if !$data.sheets.length}
      <div class="splash">
        <div class="splash-img"></div>
        <h1><span>Holy! Nest:</span></h1>
        <h5><span>save a sheet or two</span></h5>
      </div>
    {/if}
  </div>
</div>
