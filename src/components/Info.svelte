<script>
import { sheets, fileInfo } from '../stores.js'
</script>

<style>
div {
    font-size: 0.75em;
    line-height: 1em;
}
</style>

<div>
    {#if $fileInfo.name}
        <h2>{$fileInfo.name}</h2>
    {/if}
</div>

{#each $sheets as sheet, index}
    <div>
        <h4>{sheet.id}</h4>
        <p>used area: {parseInt(sheet.area)}</p>
        <p>waste area: {parseInt(sheet.waste_area)}</p>
        <p>waste %: {parseInt(sheet.waste_ratio * 100)}</p>
    </div>
{/each}

<div>
    {#if $fileInfo.errors.length}
        <h5>ERROR:</h5>
        {#each $fileInfo.errors as error}
            <p>{error}</p>
        {/each}
    {/if}
</div>
