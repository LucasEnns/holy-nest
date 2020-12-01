<script>
import { panels, sheets } from '../stores.js'

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


<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 {viewBoxW*96} {viewBoxH* 96}" preserveAspectRatio="xMidYMid meet">

     {#each $sheets as sheet, index}
        <rect
            class="sheet"
            id="{sheet.id}"
            x="{index * sheet.sheet_width}in"
            y="0"
            width="{sheet.sheet_width}in"
            height="{sheet.sheet_height}in"
        />
    {/each}
    {#each $panels as panel}
        <rect
            class="panel"
            id="panel"
            x="{panel.x0}in"
            y="{panel.y0}in"
            width="{panel.width}in"
            height="{panel.height}in"
        />
    {/each}
</svg>
