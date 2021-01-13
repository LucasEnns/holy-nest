<script>
// to do :
//units to mm scale setting

import { settings, data } from '../stores.js'
import { afterUpdate } from 'svelte'
import { trunc } from '../methods.js'

let id,
  displayInfo = false,
  top = 0,
  left = 0,
  scale = 90,
  // scale = $settings.units ? 90 * 25.4 : 90,
  svgFile

afterUpdate(() => {
  $data.svg = svgFile.innerHTML.toString()
})

function panelHoverOn() {
  $settings.activePanel = this.id
}
function panelHoverOff() {
  $settings.activePanel = ''
}

function showInfo() {
  displayInfo = true
  let rect = this.getBoundingClientRect()
  top = (rect.bottom - rect.top) / 2 + rect.top
  left = (rect.right - rect.left) / 2 + rect.left
  id = this.id
}
function hideInfo() {
  displayInfo = false
}

function flipY(y, height) {
  // return y
  return $settings.material.height - height - y
}

function shift(index) {
  let maxColumns = 5,
    rows = Math.ceil($data.sheets.length / maxColumns),
    columns = Math.ceil($data.sheets.length / rows),
    row = Math.ceil((index + 1) / columns) - 1,
    column = index % columns,
    x = column * $settings.material.width,
    y = row * $settings.material.height,
    w = columns * $settings.material.width,
    h = rows * $settings.material.height
  return { x, y, w, h }
}
</script>

<style>
.viewer {
  height: 100vh;
  padding: 2vh 2vw;
}
.infocard {
  position: fixed;
  padding: 1rem;
  background-color: var(--primary);
  border: 1px solid var(--primary-bg);
  border-radius: 4px;
  font-weight: 100;
  line-height: 1.5em;
  color: var(--primary-bg);
  font-size: 1.3rem;
  z-index: 2;
  transform: translate(-50%, -50%);
  pointer-events: none;
}
sup {
  font-size: 0.5em;
  line-height: 1.5em;
}
svg {
  height: 100%;
  width: 100%;
  margin: auto auto;
  overflow: hidden;
}

.panel {
  stroke: var(--second);
  fill: var(--primary-bg);
  transition: 0.2s;
}

.active {
  fill: var(--second);
  stroke: var(--primary);
  transition: 0.2s;
}
.sheet {
  stroke: var(--primary);
  fill: var(--primary-bg);
  /* fill-opacity: 0; */
  transition: 0.2s;
}

.sheet:hover {
  fill: var(--primary);
  fill-opacity: 1;
  transition: 0.2s;
}

.id {
  text-anchor: middle;
  fill: var(--second);
  stroke: none;
  font-weight: 300;
  pointer-events: none;
  cursor: default;
}
.id.active {
  fill: var(--primary-bg);
}
</style>

{#if displayInfo}
  <div class="infocard" style="left: {left}px; top: {top}px;">
    <h4>{$data.sheets[id].id}</h4>
    <p>
      area des panneaux:
      {trunc($data.sheets[id].area / 144, 2)}
      pi<sup>2</sup>
    </p>
    <p>
      area de perte:
      {trunc($data.sheets[id].waste_area / 144, 2)}
      pi<sup>2</sup>
    </p>
    <p>% de perte: {trunc($data.sheets[id].waste_ratio * 100, 2)}%</p>
    <!-- <p>used area: {trunc( $data.sheets[id].area / 144, 2)} pi<sup>2</sup></p>
    <p>waste area: {trunc($data.sheets[id].waste_area / 144, 2)} pi<sup>2</sup></p>
    <p>waste: {trunc($data.sheets[id].waste_ratio * 100, 2)}%</p> -->
  </div>
{/if}

<div class="viewer" bind:this="{svgFile}">
  <svg
    class="print"
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
    xmlns:xlink="http://www.w3.org/1999/xlink"
    width="{shift($data.sheets.length - 1).w * scale || 0}"
    height="{shift($data.sheets.length - 1).h * scale || 0}"
    viewBox="0 0 {shift($data.sheets.length - 1).w * scale || 0} {shift($data.sheets.length - 1).h * scale || 0}"
    preserveAspectRatio="xMidYMid meet">
    {#each $data.sheets as sheet, index}
      <g id="sheets">
        <rect
          style="stroke-width: {$settings.material.margins * scale}px;"
          on:mouseover="{showInfo}"
          on:mouseleave="{hideInfo}"
          class="sheet print"
          id="{index}"
          x="{(shift(index).x + $settings.material.margins / 2) * scale}"
          y="{(shift(index).y + $settings.material.margins / 2) * scale}"
          width="{(sheet.sheet_width - $settings.material.margins) * scale}"
          height="{(sheet.sheet_height - $settings.material.margins) * scale}"></rect>
      </g>
      <g id="panels">
        {#each sheet.group as panel}
          <rect
            style="stroke-width: {$settings.cnc[$settings.tool].diameter * scale}px;"
            on:mouseover="{panelHoverOn}"
            on:mouseleave="{panelHoverOff}"
            class="panel {$settings.activePanel == panel.id ? 'active' : ''} print"
            id="{panel.id}"
            x="{(panel.x + shift(index).x) * scale}"
            y="{(flipY(panel.y, panel.height) + shift(index).y) * scale}"
            width="{panel.width * scale}"
            height="{panel.height * scale}"></rect>

          <text
            style="font-size: {scale * (panel.id.length > 6 ? Math.min(panel.height * 0.4, 2.5) : Math.min(panel.height * 0.8, 5))}px;"
            class="id {$settings.activePanel == panel.id ? 'active' : ''} print"
            x="{(panel.x + shift(index).x + panel.width / 2) * scale}"
            y="{(flipY(panel.y, panel.height) + shift(index).y + Math.min(panel.height * 0.8, 5) / 3 + panel.height / 2) * scale}">
            {panel.id}
          </text>
        {/each}
      </g>
    {/each}>
  </svg>
</div>
