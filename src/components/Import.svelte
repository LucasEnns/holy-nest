<script>
import { settings, data } from '../stores.js'
import { formatDate } from '../methods.js'
import { CSVToArray } from '../csv.js'
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
  $settings.units = $data.csv.contents[3][1]
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
  project[0].focus()
}

function loadFile() {
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
  vertical-align: center;
  align-items: center;
  text-align: center;
  justify-content: space-between;
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
.file-icon > span,
.file-icon::after,
.file-icon:before {
  position: absolute;
  left: 4.6rem;
  top: 4.1rem;
  white-space: nowrap;
  transition: 0.1s;
  outline: none;
  background-color: var(--primary);
  color: var(--primary-bg);
  font-size: var(--small);
  font-weight: 600;
  padding: var(--xsmall);
  border-radius: var(--xsmall);
  opacity: 0;
  z-index: 3;
  pointer-events: none;
}
.file-icon:before {
  transform: skewX(30deg);
  border-radius: 0;
  width: 0.5rem;
  height: 0.5rem;
  content: '';
}
.file-icon:hover > span,
.file-icon:hover::after,
.file-icon:hover:before {
  opacity: 1;
  transition: 0.1s;
  transition-delay: 0.7s;
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
  <input
    class="inputfile"
    name="file"
    id="file"
    type="file"
    on:change="{loadFile}"
    bind:this="{open}" />
  <label
    for="file"
    data-lang="{$settings.language}"
    data-fr="ouvrir fichier .csv (alt + o)"
    class="file-icon {badFile ? 'badfile' : 'upload'}"
    on:mouseover="{() => (badFile = false)}">
    <span>open .csv file (alt + o)</span>
  </label>
  <div
    tabindex="0"
    role="button"
    data-lang="{$settings.language}"
    data-fr="nouveau fichier (alt + n)"
    class="file-icon new"
    on:click="{newFile}">
    <span>new file (alt + n)</span>
  </div>
  {#if $data.sheets.length}
    <a
      href="data:text/plain;charset=utf-8,{encodeURIComponent($data.csv.output)}"
      download="{$data.name + time()}.csv"
      role="button"
      data-lang="{$settings.language}"
      data-fr="téléchargez le fichier .csv  (alt + v)"
      class="file-icon dl-csv"
      bind:this="{dlCSV}">
      <span>download .csv file (alt + v)</span>
    </a>
    <a
      href="data:text/plain;charset=utf-8,{encodeURIComponent($data.svg)}"
      download="{$data.name + time()}.svg"
      alt="download svg file"
      role="button"
      data-lang="{$settings.language}"
      data-fr="telechargez le fichier .svg (alt + g)"
      class="file-icon dl-svg"
      bind:this="{dlSVG}">
      <span>download .svg file (alt + g)</span>
    </a>
    <a
      href="data:text/plain;charset=utf-8,{encodeURIComponent($data.cnc)}"
      download="{$data.name + time()}.cnc"
      role="button"
      data-lang="{$settings.language}"
      data-fr="telechargez le fichier .cnc (alt + c)"
      class="file-icon dl-cnc"
      bind:this="{dlCNC}">
      <span>download .cnc file (alt + c)</span>
    </a>
  {:else}
    <div class="file-icon dl-csv-block blocked"></div>
    <div class="file-icon dl-svg-block blocked"></div>
    <div class="file-icon dl-cnc-block blocked"></div>
  {/if}
  <div
    tabindex="0"
    role="button"
    data-lang="{$settings.language}"
    data-fr="cnc + projet parametre  (alt + p)"
    class="file-icon setting-icon"
    class:active="{$settings.show}"
    on:click="{() => ($settings.show = !$settings.show)}">
    <span>cnc + project settings (alt + p)</span>
  </div>
</div>
<div class="project">
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
</div>
