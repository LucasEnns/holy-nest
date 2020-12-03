<script>
import { sheets } from '../stores.js'

$: viewBoxW = $sheets.length * $sheets[0].sheet_width || 49
$: viewBoxH = $sheets.sheet_height || 97

</script>

<style>

    svg{
        height: 100%;
        width: 100%;
        margin: auto auto;
        }

    .panel{
        stroke: #0cf;
        stroke-width: 5;
        fill-opacity: 0;
        }

    .sheet{
        stroke:#ff0;
        stroke-width: 15;
        /* fill: #ff0000; */
        fill-opacity: 0;
        }


</style>



{#each $sheets as sheet, index}
    <div>
        <h5>{sheet.id}</h5>
        <p>total area: {sheet.sheet_area}</p>
        <p>used area: {parseInt(sheet.area)}</p>
        <p>waste %: {parseInt(sheet.waste_ratio * 100)}</p>
    </div>
{/each}
