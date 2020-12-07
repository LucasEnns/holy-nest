<script>
import { sheets, fileInfo } from '../stores.js'
</script>

<style>
div {
    font-size: 0.75em;
    line-height: 1em;
    /* vertical-align: bottom; */
}
</style>

<div>
    {#if $fileInfo.name}
        <h2>{$fileInfo.name}</h2>
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
        <p>used area: {parseInt(sheet.area)}</p>
        <p>waste area: {parseInt(sheet.waste_area)}</p>
        <p>waste: {parseInt(sheet.waste_ratio * 100)}%</p>
    </div>
{/each}

<div>
    {#if $fileInfo.errors.length}
        <h5>ERROR{$fileInfo.errors.length > 1 ? "S" : ""}:</h5>
        {#each $fileInfo.errors as error}
            <p>{error}</p>
        {/each}
    {/if}
</div>
