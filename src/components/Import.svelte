<script>
// TO DO
//key bindings


   import { Nest } from "../nest.js"
   import { Gcode } from "../gCode.js"
   import { settings, panels, sheets, csvFile, blancCSV, svg } from "../stores.js"
   import { saveAs } from 'file-saver'
   import { formatDate } from "../methods.js";
   import { CSVToArray } from "../csv.js";
   import { beforeUpdate } from 'svelte'
   let badFile = false
   let file
   let csv = $csvFile.contents.join('\n')
   $: cnc = () => Gcode($sheets, $settings.material, $csvFile.name )
   const csvHeaderRows = 5
   // gCode = "g00 \ng20"

   beforeUpdate(() => {
      if ( $csvFile.contents > csvHeaderRows ) {
         calculateNest()
      }
})



const today = formatDate(new Date(), '_yymmdd');

   function calculateNest() {
      let nest = Nest(
            $csvFile.contents,
            csvHeaderRows,                   // panel starting row csv
            $settings.units,
            $settings.cutter,
            $settings.gap,
            $settings.material
         )
      $panels = nest[0]
      $sheets = nest[1]
      $csvFile.errors = nest[2]
   }

   function newFile() {
      $csvFile = blancCSV
   }

   function loadFile() {

      if ( file.files[0].name.includes('.csv') ) {
         $csvFile.name = file.files[0].name.replace('.csv', '')
         let reader = new FileReader()
         reader.readAsText(file.files[0])
         reader.onload = function (event) {
            $csvFile.contents = CSVToArray(event.target.result, csvHeaderRows) // csv file
            calculateNest()
            badFile = false
         }
      } else {
         badFile = true
      }
   }

function highlight() {
    this.select()
}

</script>

<style>

   *{
      font-weight: 300;
      font-family: 'Overpass', sans-serif;
      color: #fde3b0;
      text-align: center;
      /* vertical-align: middle; */
   }

/* img {

   vertical-align: -.5em;
   height: 3.5em;
} */
.file-icon{
   position: relative;
   height: 2.5em;
   width: 2.3em;
   background-repeat: no-repeat;
   background-position: center;
   background-size: contain;
   cursor: pointer;
}
.blocked {
   cursor: default;
}
.badfile {
   background-image: url('../upload-bad.png');
}
.upload {
   background-image: url('../upload.png');
}
.upload:hover {
   background-image: url('../upload-hover.png');
}
.new {
   background-image: url('../new.png');
}
.new:hover {
   background-image: url('../new-hover.png');
}
.dl-svg {
   background-image: url('../dl-svg.png');
}
.dl-svg-block {
   background-image: url('../dl-svg-block.png');
}
.dl-svg:hover {
   background-image: url('../dl-svg-hover.png');
}
.dl-csv {
   background-image: url('../dl-csv.png');
}
.dl-csv-block {
   background-image: url('../dl-csv-block.png');
}
.dl-csv:hover {
   background-image: url('../dl-csv-hover.png');
}
.dl-cnc {
   background-image: url('../dl-cnc.png');
}
.dl-cnc-block {
   background-image: url('../dl-cnc-block.png');
}
.dl-cnc:hover {
   background-image: url('../dl-cnc-hover.png');
}


.file-mgmt, .settings {
   display: flex;
   align-items: center;
   justify-content: space-evenly;
}

.switch input,
.inputfile {
   top:.5em;
	width: 0.1px;
	height: 0.1px;
	opacity: 0;
	overflow: hidden;
	position: absolute;
	z-index: -1;
}
/* .inputfile + label {
    font-size: 1.25em;
    font-weight: 300;
    color: white;
    display: inherit;
} */

.inputfile:focus + label,
/* .inputfile + label:hover, */
.input:hover {
    color: #75cafc;
    border-bottom: #e7fc75 solid 1px;
}

.inputfile + label {
	cursor: pointer; /* "hand" cursor */
}

/* .inputfile:focus + label {
	border-bottom: #e7fc75 solid 1px;
} */

input[type="checkbox"] {
   opacity: 0.5;
   /* font-size: 2em; */
}
input[type="checkbox"]:checked {
   opacity: 1;
}

input[type="number"]::-webkit-outer-spin-button, input[type="number"]::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
}

input[type="number"] {
    -moz-appearance: textfield;
}


.input{
   width: 2.5em;
   font-size: 1.1em;
   border: none;
   background: none;
   color: #fde3b0;
   border-bottom: transparent solid 1px;
   outline: none;
}

input:focus + .slider:before {
  background-color: #333;
}

input:focus + .slider,input:focus + .slider:after {
   background-color: #fde3b0;
   color: #333;
}

.switch {
  position: relative;
  display: inline-block;
  width: 4.2em;
  height: 1.5em;
}


.slider{
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  /* background-color: #8ffffd; */
  -webkit-transition: .3s;
  transition: .3s;
  border: 1px solid #fde3b0;
   border-radius: .4em;
}

.slider:before {
  position: absolute;
  content: "";
  height: 1em;
  width: 1px;
  right: .3em;
  top: 0;
  background-color: #fde3b0;
  -webkit-transition: .3s;
  transition: .3s;
  /* border-radius: 50%; */
}

input:checked + .slider:before {
  -webkit-transform: translateX(-3.5em);
  -ms-transform: translateX(-3em);
  transform: translateX(-3.4em);
}

.slider:after
{
 content:'inch';
 color: #fde3b0;
 display: block;
 position: absolute;
 left: 50%;
 font-size: 1.2em;
 transform: translate(-50%,0%);
}

input:checked + .slider:after
{
  content:'mm';
}


</style>

<svelte:head>
   <title>{$csvFile.name || "Nest"}</title>
</svelte:head>

<!-- change imgs for bg to use hover and more easily change img -->

<div class="file-mgmt">
   <div
      class="file-icon new"
      alt="new csv file"
      on:click={newFile}>
   </div>
   <input
      class="inputfile"
      name="file"
      id="file"
      type="file"
      on:change={loadFile}
      bind:this={file} />
   <label for="file" alt="upload a csv file">
      <div
         class="file-icon {badFile ? "badfile" : "upload"}"
         on:mouseover={() => badFile = false}>
      </div>
   </label>
   {#if  $sheets.length }
      <a href="data:text/plain;charset=utf-8,{encodeURIComponent(csv)}" download="{$csvFile.name + today}.csv" alt="download csv file">
         <div class="file-icon dl-csv"></div>
      </a>
      <a href="data:text/plain;charset=utf-8,{encodeURIComponent($svg)}" download="{$csvFile.name + today}.svg" alt="download svg file">
         <div class="file-icon dl-svg"></div>
      </a>
      <a href="data:text/plain;charset=utf-8,{encodeURIComponent(cnc())}" download="{$csvFile.name + today}.cnc" alt="download g-code file">
         <div class="file-icon dl-cnc"></div>
      </a>
   {:else}
      <div class="file-icon dl-csv-block blocked"></div>
      <div class="file-icon dl-svg-block blocked"></div>
      <div class="file-icon dl-cnc-block blocked"></div>
   {/if}
</div>

<div class="settings">
<div class="input-wrapper">
   <h5>Material W x H x T</h5>
   <input
      class="input"
      type="number"
      on:change={calculateNest}
      bind:value={$settings.material.width}
      step="0.0625" />
    <span>x</span>
    <input
      class="input"
      type="number"
      on:change={calculateNest}
      bind:value={$settings.material.height}
      step="0.0625"  />
    <span>x</span>
    <input
      class="input"
      type="number"
      on:change={calculateNest}
      bind:value={$settings.material.thickness}
      step="0.005" />
</div>
<div class="input-wrapper">
   <h5>Margins</h5>
   <input
      class="input"
      type="number"
      on:change={calculateNest}
      bind:value={$settings.material.margins}
      step="0.03125" />
</div>
<div class="input-wrapper">
   <h5>Tool Kerf</h5>
   <input
      class="input"
      type="number"
      on:change={calculateNest}
      bind:value={$settings.cutter}
      step="0.03125" />
</div>
<!-- <div class="input-wrapper">
   <h5>Gap</h5>
   <input class="input" type="number" bind:value={$settings.gap} step="0.005" />
</div> -->
<div class="input-wrapper">
   <h5>Units</h5>
   <label class="switch"><input type="checkbox" bind:checked={$settings.units} ><div class="slider"></div></label>

   <!-- <input class="input" type="checkbox" bind:checked={$settings.units} /> -->
   <!-- <input class="input" type="radio" bind:group={units} value="mm" /> -->
</div>
</div>
