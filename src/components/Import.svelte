<script>
   import { Nest } from "../nest.js"
   import { panels, sheets } from "../stores.js"
   $: fileName = ""
   let files
   let material = {
      width: 49,
      height: 97,
      margins: 0.25
   }
   // let materialH = 97
   // let margins = 0.25
   let cutter = 0.375
   let gap = 0
   let units = false

   function showFile() {
      let file = files.files[0]
      let textFile = /text.csv/
      let reader = new FileReader()
      fileName = files.value.split( "\\" ).pop()

      if (file.type.match(textFile)) {
         reader.onload = function (event) {
            let nest = Nest(
               event.target.result, // csv file
               5,                   // panel starting row csv
               units,
               cutter,
               gap,
               material
            )

            $panels = nest[0]
            $sheets = nest[1]
         }
      } else {
         fileName = "CSV's please!!!";
      }
      reader.readAsText(file);
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
   <label for="file">{fileName == "" ? "Import" : fileName}</label>
</div>
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
