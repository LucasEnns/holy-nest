<script>
// TO DO
//key bindings

import { Nest } from '../nest.js'
import { Gcode } from '../gCode.js'
import { settings, panels, sheets, csvFile, blancCSV, svg } from '../stores.js'
import { saveAs } from 'file-saver'
import { formatDate } from '../methods.js'
import { CSVToArray } from '../csv.js'
import { beforeUpdate } from 'svelte'

let userLang = navigator.language || navigator.userLanguage
let badFile = false,
  file,
  csv = $csvFile.contents.join('\n')
$: cnc = () => Gcode($sheets, $settings.material, $csvFile.name)
const csvHeaderRows = 5

const today = formatDate(new Date(), '_yymmdd')

function newFile() {
  $csvFile = { ...blancCSV }
}

function loadFile() {
  if (!file.files) return
  if (file.files[0].name.includes('.csv')) {
    $csvFile.name = file.files[0].name.replace('.csv', '')
    let reader = new FileReader()
    reader.readAsText(file.files[0])
    reader.onload = function (event) {
      $csvFile.contents = CSVToArray(event.target.result, csvHeaderRows) // csv file
      badFile = false
    }
  } else {
    badFile = true
  }
}

let dlCSV,
  dlSVG,
  dlCNC,
  keys = {}

function handleKeyDown(e) {
  keys[e.code] = true
  const key = (code) => (keys['AltLeft'] || keys['AltRight']) && keys[code]
  if (key('KeyO')) setTimeout(() => file.click(), 140)
  if (key('KeyN')) newFile()
  if (key('KeyV')) dlCSV.click()
  if (key('KeyG')) dlSVG.click()
  if (key('KeyC')) dlCNC.click()
  if (key('KeyS')) $settings.show = !$settings.show
}

function handleKeyUp(e) {
  delete keys[e.code]
}
</script>

<style>
.file-mgmt {
  padding-top: 1rem;
  display: flex;
  vertical-align: center;
  align-items: center;
  text-align: center;
  justify-content: space-evenly;
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
  /* position: relative; */
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
  /* transform: rotate(45deg); */
  transform: skewX(30deg);
  /* left: 4.4rem; */
  /* bottom: 0rem; */
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
</style>

<svelte:head>
  <title>{'Project: ' + $csvFile.name || 'Nest'}</title>
</svelte:head>
<svelte:window on:keydown="{handleKeyDown}" on:keyup="{handleKeyUp}" />

<div class="file-mgmt">
  <input
    class="inputfile"
    name="file"
    id="file"
    type="file"
    on:change="{loadFile}"
    bind:this="{file}" />
  <label
    for="file"
    data-lang="{userLang}"
    data-fr="téléversez un fichier .csv"
    class="file-icon {badFile ? 'badfile' : 'upload'}"
    on:mouseover="{() => (badFile = false)}">
    <span>upload a .csv file</span>
  </label>
  <div
    tabindex="0"
    role="button"
    data-lang="{userLang}"
    data-fr="nouveau fichier"
    class="file-icon new"
    on:click="{newFile}">
    <span>new file</span>
  </div>
  {#if $sheets.length}
    <a
      href="data:text/plain;charset=utf-8,{encodeURIComponent(csv)}"
      download="{$csvFile.name + today}.csv"
      role="button"
      data-lang="{userLang}"
      data-fr="téléchargez le fichier .csv"
      class="file-icon dl-csv"
      bind:this="{dlCSV}">
      <span>download .csv file</span>
    </a>
    <a
      href="data:text/plain;charset=utf-8,{encodeURIComponent($svg)}"
      download="{$csvFile.name + today}.svg"
      alt="download svg file"
      role="button"
      data-lang="{userLang}"
      data-fr="telechargez le fichier .svg"
      class="file-icon dl-svg"
      bind:this="{dlSVG}">
      <span>download .svg file</span>
    </a>
    <a
      href="data:text/plain;charset=utf-8,{encodeURIComponent(cnc())}"
      download="{$csvFile.name + today}.cnc"
      role="button"
      data-lang="{userLang}"
      data-fr="telechargez le fichier .cnc"
      class="file-icon dl-cnc"
      bind:this="{dlCNC}">
      <span>download .cnc file</span>
    </a>
  {:else}
    <div class="file-icon dl-csv-block blocked"></div>
    <div class="file-icon dl-svg-block blocked"></div>
    <div class="file-icon dl-cnc-block blocked"></div>
  {/if}
  <div
    tabindex="0"
    role="button"
    data-lang="{userLang}"
    data-fr="cnc + projet parametre"
    class="file-icon setting-icon"
    class:active="{$settings.show}"
    on:click="{() => ($settings.show = !$settings.show)}">
    <span>cnc + project settings</span>
  </div>
</div>
