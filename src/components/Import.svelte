<script>
// TO DO
// open save print?
// impliment a list from the csv
// to choose which panels to nest
// or change the quantities
// highlight all similar panels on hover


   import { Nest } from "../nest.js"
   import { panels, sheets, fileInfo, svg } from "../stores.js"
   import { saveAs } from 'file-saver'
   $: badFile = false
   let files
   // gCode = "g00 \ng20"
   $: material = {
      width: 49,
      height: 97,
      margins: 0.25
   }
   $: cutter = 0.375
   $: gap = 0
   $: units = false


   function showFile() {
      let file = files.files[0]
      let reader = new FileReader()
      $fileInfo.name = file.name.replace('.csv', '')
      reader.readAsText(file);

      if ( file.name.includes('.csv') ) {
      // if ( file.type === 'text/csv' ) {
         reader.onload = function (event) {
            let nest = Nest(
               event.target.result, // csv file
               4,                   // panel starting row csv
               units,
               cutter,
               gap,
               material
            )

            badFile = false
            $panels = nest[0]
            $sheets = nest[1]
            $fileInfo.errors = nest[2]
         }
      } else {
         badFile = true
      }
   }

</script>

<style>

   *{
      font-weight: 300;
      font-family: 'Overpass', sans-serif;
      color: #e7fc75;
      text-align: center;
      /* vertical-align: middle; */
   }

img {

   vertical-align: -.5em;
   height: 1.8em;
}

.inputfile{
	width: 0.1px;
	height: 0.1px;
	opacity: 0;
	overflow: hidden;
	position: absolute;
	z-index: -1;
}
.inputfile + label {
    font-size: 1.25em;
    font-weight: 300;
    color: white;
    display: inherit;
}

.inputfile:focus + label,
.inputfile + label:hover,
.input:hover {
    color: #75cafc;
    border-bottom: #e7fc75 solid 1px;
}

.inputfile + label {
	cursor: pointer; /* "hand" cursor */
}

.inputfile:focus + label {
	border-bottom: #e7fc75 solid 1px;
}

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
   width: 3em;
   font-size: 1.1em;
   border: none;
   background: none;
   color: #e7fc75;
   /* border-bottom: #e7fc75 solid 1px; */
   outline: none;
}

</style>

<div class="upload-wrapper">
   <input class="inputfile" name="file" id="file" type="file" on:change={showFile} bind:this={files} />
   <label for="file">
      {#if !badFile}
         <img src="./favicon.png" alt="open csv file">
      {:else}
         <h1 on:mouseover={() => badFile = false}>💩</h1>
      {/if}
   </label>
</div>
<div>
   <h4 on:click={showFile}>recalculate</h4>
</div>
<div class="save">
   <a href="data:text/plain;charset=utf-8,{encodeURIComponent($svg)}" download="{$fileInfo.name}.svg">save</a>
</div>
<!-- <div class="save">
   <a href="data:text/plain;charset=utf-8,{encodeURIComponent(gCode)}" download="{$sheets[0].id}.cnc">save</a>
</div> -->
<div class="input-wrapper">
   <h5>Material W x H</h5>
   <input class="input" type="number" bind:value={material.width} />
    <span>x</span>
   <input class="input" type="number" bind:value={material.height} />
</div>
<div class="input-wrapper">
   <h5>Margins</h5>
   <input class="input" type="number" bind:value={material.margins} step="0.005" />
</div>
<div class="input-wrapper">
   <h5>Kerf</h5>
   <input class="input" type="number" bind:value={cutter} step="0.005" />
</div>
<div class="input-wrapper">
   <h5>Gap</h5>
   <input class="input" type="number" bind:value={gap} step="0.005" />
</div>
<div class="input-wrapper">
   <h5>Metric</h5>
   <input class="input" type="checkbox" bind:checked={units} />
   <!-- <input class="input" type="radio" bind:group={units} value="mm" /> -->
</div>
