<script>
import { settings, data } from '../stores.js'
import { formatDate } from '../methods.js'
import { CSVToArray } from '../csv.js'
import Tooltips from './Tooltips.svelte'
import { createEventDispatcher } from 'svelte'

const dispatch = createEventDispatcher()

const time = () => formatDate(new Date(), '-HHhMM')

let badFile = false,
  keys = {},
  dlCSV,
  dlSVG,
  dlCNC,
  project = [],
  open

function updatePanels() {
  $settings.units = JSON.parse($data.csv.contents[3][1])
  dispatch('update')
}

function handleKeyDown(e) {
  keys[e.code] = true
  const key = (code) => (keys['AltLeft'] || keys['AltRight']) && keys[code]
  if (key('KeyO')) setTimeout(() => file.click(), 140)
  if (key('KeyN')) newFile()
  if (key('KeyV')) dlCSV.click()
  if (key('KeyG')) dlSVG.click()
  if (key('KeyC')) dlCNC.click()
  if (key('KeyP')) $settings.show = !$settings.show
}

function handleKeyUp(e) {
  delete keys[e.code]
}
function newFile() {
  $data.csv.contents = [...$data.csv.new]
  updatePanels()
  // project[0].focus()
}

function loadFile() {
  console.log(open.files[0])
  if (!open.files[0]) return
  if (open.files[0].name.includes('.csv')) {
    let reader = new FileReader()
    reader.readAsText(open.files[0])
    reader.onload = function (event) {
      $data.csv.contents = CSVToArray(event.target.result, $data.csv.headerRows) // csv file
      badFile = false
      updatePanels()
      return
    }
  }
  badFile = true
}
</script>

<style>
.file-mgmt {
  display: flex;
  flex-direction: column;
  vertical-align: center;
  align-items: center;
  text-align: center;
  justify-content: space-between;
  height: 26rem;
}

.file-icon {
  position: relative;
  height: 2em;
  width: 1.7em;
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;
  cursor: pointer;
  transition: 0.1s;
}
.file-icon:hover,
.file-icon:focus,
.setting-icon.active,
input:focus + .file-icon {
  height: 2.5em;
  width: 2.3em;
  transition: 0.1s;
  outline: none;
}
.inputfile {
  top: 0.5em;
  width: 0.1px;
  height: 0.1px;
  opacity: 0;
  overflow: hidden;
  position: absolute;
  z-index: -1;
}
.blocked {
  cursor: default;
}
.blocked:hover::after,
.blocked:hover::before {
  opacity: 0;
}
.blocked:hover {
  height: 2em;
  width: 1.7em;
}
.badfile {
  background-image: url('../img/upload-bad.png');
}
.upload {
  background-image: url('../img/upload.png');
}
.upload:hover {
  background-image: url('../img/upload-hover.png');
}
.new {
  background-image: url('../img/new.png');
}
.new:hover {
  background-image: url('../img/new-hover.png');
}
.dl-svg {
  background-image: url('../img/dl-svg.png');
}
.dl-svg-block {
  background-image: url('../img/dl-svg-block.png');
}
.dl-svg:hover {
  background-image: url('../img/dl-svg-hover.png');
}
.dl-csv {
  background-image: url('../img/dl-csv.png');
}
.dl-csv-block {
  background-image: url('../img/dl-csv-block.png');
}
.dl-csv:hover {
  background-image: url('../img/dl-csv-hover.png');
}
.dl-cnc {
  background-image: url('../img/dl-cnc.png');
}
.dl-cnc-block {
  background-image: url('../img/dl-cnc-block.png');
}
.dl-cnc:hover {
  background-image: url('../img/dl-cnc-hover.png');
}
.setting-icon {
  background-image: url('../img/settings.png');
}
.setting-icon:hover,
.setting-icon.active {
  background-image: url('../img/settings-hover.png');
}
h6 {
  white-space: nowrap;
  display: flex;
}
h6 > input {
  width: 2%;
  flex: 2 !important;

  font-size: 1.3em;
  text-align: left;
}
</style>

<svelte:head>
  <title>{'Ahhh Nest: ' + $data.csv.contents[0][1] || 'Ahhh! Nest'}</title>
</svelte:head>
<svelte:window on:keydown="{handleKeyDown}" on:keyup="{handleKeyUp}" />

<div class="file-mgmt">
  <div
    tabindex="0"
    role="button"
    class="file-icon setting-icon"
    class:active="{$settings.show}"
    on:click="{() => ($settings.show = !$settings.show)}">
    <Tooltips
      french="ncnc + projet parametre  (alt + p)"
      english="cnc + project settings (alt + p)" />
  </div>
  <input
    class="inputfile"
    name="file"
    id="file"
    type="file"
    on:change="{loadFile}"
    bind:this="{open}" />
  <label
    for="file"
    class="file-icon {badFile ? 'badfile' : 'upload'}"
    on:mouseover="{() => (badFile = false)}">
    <Tooltips
      french="ouvrir fichier .csv (alt + o)"
      english="open .csv file (alt + o)" />
  </label>
  <div tabindex="0" role="button" class="file-icon new" on:click="{newFile}">
    <Tooltips french="nouveau fichier (alt + n)" english="new file (alt + n)" />
  </div>
  {#if $data.sheets.length}
    <a
      href="data:text/plain;charset=utf-8,{encodeURIComponent($data.csv.output)}"
      download="{$data.name + time()}.csv"
      role="button"
      class="file-icon dl-csv"
      bind:this="{dlCSV}">
      <Tooltips
        french="téléchargez le fichier .csv  (alt + v)"
        english="download .csv file (alt + v)" />
    </a>
    <a
      href="data:text/plain;charset=utf-8,{encodeURIComponent($data.svg)}"
      download="{$data.name + time()}.svg"
      alt="download svg file"
      role="button"
      class="file-icon dl-svg"
      bind:this="{dlSVG}">
      <Tooltips
        french="telechargez le fichier .svg (alt + g)"
        english="download .svg file (alt + g)" />
    </a>
    <a
      href="data:text/plain;charset=utf-8,{encodeURIComponent($data.cnc)}"
      download="{$data.name + time()}.cnc"
      role="button"
      class="file-icon dl-cnc"
      bind:this="{dlCNC}">
      <Tooltips
        french="ntelechargez le fichier .cnc (alt + c)"
        english="download .cnc file (alt + c)" />
    </a>
  {:else}
    <div class="file-icon dl-csv-block blocked"></div>
    <div class="file-icon dl-svg-block blocked"></div>
    <div class="file-icon dl-cnc-block blocked"></div>
  {/if}
</div>
<!-- <div class="project">
  {#each [0, 2, 4] as setup, index}
    {#if $data.csv.contents[0][setup]}
      <h6 class="print">
        <span>{$data.csv.contents[0][setup]}: </span>
        <input
          type="text"
          bind:value="{$data.csv.contents[0][setup + 1]}"
          bind:this="{project[index]}" />
      </h6>
    {/if}
  {/each}
</div> -->
