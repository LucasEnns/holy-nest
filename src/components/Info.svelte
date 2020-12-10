<script>
import { sheets, csvFile } from '../stores.js'
import { trunc } from "../methods.js";
</script>

<style>
div {
    font-size: 0.75em;
    line-height: 1.5em;
    /* vertical-align: 0; */
}
sup {
    font-size: .5em;
    line-height: 1.5em;
    /* vertical-align: .4em */
}
</style>

<div>
    {#if $csvFile.name}
        {#if $sheets.length > 1}
            <p>filled sheets</p>
            <p>waste: {parseInt($sheets
                .slice(0, -1)
                .reduce( ( total, waste, i, array ) =>
                    total + waste.waste_ratio * 100 / array.length , 0 ))}%
            </p>
        {/if}
    {/if}
</div>

{#each $sheets as sheet, index}
    <div>
        <h4>{sheet.id}</h4>
        <p>used area: {trunc( sheet.area / 144, 2)} pi<sup>2</sup></p>
        <p>waste area: {trunc(sheet.waste_area / 144, 2)} pi<sup>2</sup></p>
        <p>waste: {trunc(sheet.waste_ratio * 100, 2)}%</p>
    </div>
{/each}
