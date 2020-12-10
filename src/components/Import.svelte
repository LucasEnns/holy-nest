<script>
// TO DO
// open save print?
// impliment a list from the csv
// to choose which panels to nest
// or change the quantities
// highlight all similar panels on hover

//key bindings


   import { Nest } from "../nest.js"
   import { settings, panels, sheets, csvFile, svg } from "../stores.js"
   import { saveAs } from 'file-saver'
   import { CSVToArray } from "../csv.js";
   import { beforeUpdate } from 'svelte'
   $: badFile = false
   let file
   // gCode = "g00 \ng20"

   beforeUpdate(() => {
      if ( $csvFile.contents ) {
         calculateNest()
      }
})
//    onMount(() => {
//       calculateNest()
// })

   function calculateNest() {
      let nest = Nest(
            $csvFile.contents,
            4,                   // panel starting row csv
            $settings.units,
            $settings.cutter,
            $settings.gap,
            $settings.material
         )
      $panels = nest[0]
      $sheets = nest[1]
      $csvFile.errors = nest[2]
   }

// export let recalculate = () => calculateNest()

   function loadFile() {

      if ( file.files[0].name.includes('.csv') ) {
         $csvFile.name = file.files[0].name.replace('.csv', '')
         let reader = new FileReader()
         reader.readAsText(file.files[0])
         reader.onload = function (event) {
            $csvFile.contents = CSVToArray(event.target.result) // csv file
            calculateNest()
            badFile = false
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
      color: #fde3b0;
      text-align: center;
      /* vertical-align: middle; */
   }

img {

   vertical-align: -.5em;
   height: 3.5em;
}
.upload-wrapper, .settings {
   display: flex;
   align-items: center;
   justify-content: space-evenly;
}

.inputfile{
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

/* .inputfile:focus + label,
.inputfile + label:hover, */
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
   width: 3em;
   font-size: 1.1em;
   border: none;
   background: none;
   color: #fde3b0;
   border-bottom: transparent solid 1px;
   outline: none;
}

</style>

<svelte:head>
   <title>{$csvFile.name}</title>
</svelte:head>

<!-- change imgs for bg to use hover and more easily change img -->

<div class="upload-wrapper">
   <input
      class="inputfile"
      name="file"
      id="file"
      type="file"
      on:change={loadFile}
      bind:this={file} />
   <label for="file">
      <img
         src="./{badFile ? "bf" : "ul-h"}.png"
         alt="not a csv file"
         on:mouseover={() => badFile = false} />
   </label>
   {#if $svg}
      <a href="data:text/plain;charset=utf-8,{encodeURIComponent($svg)}"
         download="{$csvFile.name}.svg">
         <img src="./dl-h.png" alt="save svg file">
      </a>
   {/if}
</div>

<div class="settings">
<div class="input-wrapper">
   <h5>Material W x H</h5>
   <input
      class="input"
      type="number"
      on:change={calculateNest}
      bind:value={$settings.material.width} />
    <span>x</span>
    <input
      class="input"
      type="number"
      on:change={calculateNest}
      bind:value={$settings.material.height} />
</div>
<div class="input-wrapper">
   <h5>Margins</h5>
   <input
      class="input"
      type="number"
      on:change={calculateNest}
      bind:value={$settings.material.margins}
      step="0.005" />
</div>
<div class="input-wrapper">
   <h5>Tool Kerf</h5>
   <input
      class="input"
      type="number"
      on:change={calculateNest}
      bind:value={$settings.cutter}
      step="0.005" />
</div>
<!-- <div class="input-wrapper">
   <h5>Gap</h5>
   <input class="input" type="number" bind:value={$settings.gap} step="0.005" />
</div> -->
<div class="input-wrapper">
   <h5>Metric</h5>
   <input class="input" type="checkbox" bind:checked={$settings.units} />
   <!-- <input class="input" type="radio" bind:group={units} value="mm" /> -->
</div>
</div>
