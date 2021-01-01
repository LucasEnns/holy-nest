<script>
import Import from './components/Import.svelte'
import CSV from './components/CSV.svelte'
import Viewer from './components/Viewer.svelte'
import Settings from './components/Settings.svelte'
import { Nest } from './nest.js'
import { settings, panels, sheets, csvFile, blancCSV } from './stores.js'
import { beforeUpdate } from 'svelte'

const csvHeaderRows = 5

beforeUpdate(() => {
  calculateNest()
})

function calculateNest() {
  let nest = Nest(
    $csvFile.contents,
    csvHeaderRows, // panel starting row csv
    $settings.placementType,
    $settings.units,
    $settings.direction,
    $settings.cnc[$settings.tool].diameter,
    $settings.gap,
    $settings.material
  )
  $panels = nest[0]
  $sheets = nest[1]
  $csvFile.errors = nest[2]
}
</script>

<style>
.container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: grid;
  grid-template-columns: minmax(240px, 20vw) 1fr;
  overflow: hidden;
}

.import {
  position: relative;
  margin: 0 1vw;
  display: grid;
  grid-template-rows: 10vh 1fr;
}
</style>

<svelte:body on:change="{calculateNest}" />
<div class="container">
  <div class="import">
    <Import />
    <CSV />
    <Settings />
  </div>
  <div class="main" on:click="{() => ($settings.show = false)}">
    <Viewer />
  </div>
</div>
