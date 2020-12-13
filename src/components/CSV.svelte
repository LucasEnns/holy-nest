<script>
    import { sheets, csvFile, settings, panels, activePanel } from '../stores.js'
    import { trunc } from "../methods.js";
    import { Nest } from "../nest.js";
    // import Import from "./Import.svelte";
    import { beforeUpdate } from 'svelte'

    const csvHeaderRows = 5
    $: lines = $csvFile.contents.slice(csvHeaderRows)

//    beforeUpdate(() => {
//       if ( $csvFile.contents ) {
//          calculateNest()
//       }
//     })

function highlight() {
    this.select()
}

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

    // function reset() {
    //     console.log(Object.isFrozen($csvFile.original));
    //     $csvFile.contents = [...$csvFile.original]
    //     lines = $csvFile.contents.slice(4)
    //     console.log(Object.isFrozen($csvFile.original));
    // }

    function addRow() {
        let row = [lines.length + 1, , , ]
        $csvFile.contents = [...$csvFile.contents, row]
    }

    function sortAscending(index) {
        //add support for alpha numberic
        lines = lines.sort( (a, b) => a[index] - b[index])
    }
    function sortDescending(index) {
        lines = lines.sort( (a, b) => b[index] - a[index])
    }


// autoselect on focus?
</script>


<style>
.container {
    /* position: relative; */
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;
    overflow-y: scroll;
    /* vertical-align: middle; */
}
h1{
    /* position: relative; */
    /* top: -3em; */
    padding: 1.5em 0;
}
/* span{
    font-size: 1.5em;
    vertical-align: middle;
}
span:hover{
    color: lightcoral;
    cursor: pointer;
} */

ul{
    font-size: 1.1em;
    display: grid;
    grid-template-columns: 3fr 2fr 4fr 4fr 1fr;
}
.new-row{
    font-size: 2.5em;
    cursor: pointer;
    text-align: center;
}
.new-row{
    color: #4bbdff;
}
.active{
    background-color: rgba(240, 128, 128, 0.371);
}
li {
    line-height: 2.5em;
    text-align: center;
    cursor: pointer;
}
li:hover {
    text-decoration: overline;
}
 input[type="number"]::-webkit-outer-spin-button,
 input[type="number"]::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
}
input:hover, input:focus {
    color: #75cafc;
    border-bottom: #e7fc75 solid 1px;
}
input{
    text-align: center;
    width: 80%;
    /* font-size: 1.15em; */
    border: none;
    background: none;
    font-family: Overpass;
    font-weight: 200;
    color: #fde3b0;
    border-bottom: transparent solid 1px;
    outline: none;
}
input[type="number"] {
    -moz-appearance: textfield;
}
div {
    font-size: 0.8em;
    /* vertical-align: bottom; */
}
</style>

<div class="container">
    <div>
        {#if $csvFile.name}

            {#if $csvFile.errors.length}
                <h5>ERROR{$csvFile.errors.length > 1 ? "S" : ""}:</h5>
                {#each $csvFile.errors as error}
                    <p>{error}</p>
                {/each}
            {/if}

            <h1>{$csvFile.contents[0][1]}</h1>


            <ul>
                <li on:click={() => sortAscending(0)}>Panel</li>
                <li on:click={() => sortDescending(1)}>Q</li>
                <li on:click={() => sortDescending(2)}>W</li>
                <li on:click={() => sortDescending(3)}>H</li>
            </ul>
            {#each lines as line}
                <ul
                    class="{$activePanel == line[0] ? "active" : ""}"
                    on:mouseenter={() => $activePanel = line[0]}
                    on:mouseleave={() => $activePanel = ''}
                >
                    <li>
                        <input
                            type="text"
                            bind:value={line[0]}
                            on:focus="{highlight}"
                            on:keyup={calculateNest} />
                    </li>
                    <li>
                        <input
                            type="number"
                            bind:value={line[1]}
                            on:focus="{highlight}"
                            on:keyup={calculateNest}  />
                    </li>
                    <li>
                        <input
                            type="number"
                            bind:value={line[2]}
                            on:focus="{highlight}"
                            on:keyup={calculateNest}
                            step="0.03125" />
                    </li>
                    <li>
                        <input
                            type="number"
                            bind:value={line[3]}
                            on:focus="{highlight}"
                            on:keyup={calculateNest}
                            step="0.03125" />
                    </li>
                </ul>
            {/each}
        {/if}
        <ul class="new-row" on:click={addRow}>+</ul>
    </div>
</div>
