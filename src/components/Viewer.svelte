<script>
import { panels, sheets } from '../stores.js'

let id, width, height, checkSize = false, mx = 0, my = 0,
top = 0
, left = 0
$: viewBoxW = $sheets.length * $sheets[0].sheet_width || 61
$: viewBoxH = $sheets.sheet_height || 121

function showSizes() {
    checkSize = true
    // console.log(card);
    var rect = this.getBoundingClientRect();
    // console.log(rect.top, rect.right, rect.bottom, rect.left);
    // card.style.left = mouse
    top = rect.bottom + 12
    left = rect.left + 12
    id = this.id
    width = this.width.baseVal.valueAsString
    height = this.height.baseVal.valueAsString
}

function hideSizes( event ) {
    checkSize = false
}

</script>

<style>
.viewer{
    height: 100%;
    width: 100%;
}
.infocard{
    position: fixed;
    padding: 1rem;
    background-color: lightcoral;
    border-radius: 4px;
    font-weight: 100;
    color: white;
    /* font-size: 4in; */
    z-index: 2;
    animation: fadein 0.4s ;
   /* visibility: hidden; */
}
    svg{
        height: 100%;
        width: 100%;
        margin: auto auto;
        }

    .panel{
        stroke: #0cf;
        stroke-width: 5;
        fill: lightcoral;
        fill-opacity: 0;
        animation: fadeout 0.2s ;
    }

    .panel:hover{
        fill: lightcoral;
        fill-opacity: 1;
        animation: fadein 0.2s ;
        }

@keyframes fadein {
    0% {
        opacity: 0;
    }
    100% {
        opacity: 1;
    }
}

@keyframes fadeout {
    0% {
        fill-opacity: 1;
    }
    100% {
        fill-opacity: 0;
    }
}

    .sheet{
        stroke:#ff0;
        stroke-width: 15;
        /* fill: #ff0000; */
        fill-opacity: 0;
        }

    .idv, .idh {
        text-anchor: middle;
        fill: #0cf;
        stroke: none;
        font-size: 3in;
        pointer-events: none;
        cursor: default;
    }

    .idv{
        writing-mode: vertical-rl;
        glyph-orientation-vertical: 0;
    }

@media print{
    .viewer,
.print > * {
    display: block !important;
    fill: none;
    stroke-width: 3px;
    stroke: black;
}
}

</style>

<div class="viewer">
    {#if checkSize}
<div class="infocard" style="left: {left}px; top: {top}px;">
            <h4 class="sizes">Panel: {id}</h4>
            <h4 class="sizes">Width: {width}</h4>
            <h4 class="sizes">Height: {height}</h4>
        </div>
    {/if}

<svg class="print" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 {viewBoxW*96} {viewBoxH* 96}" preserveAspectRatio="xMidYMid meet">
    {#each $sheets as sheet, index}
        <rect
            class="sheet print"
            id="{sheet.id}"
            x="{index * sheet.sheet_width}in"
            y="0"
            width="{sheet.sheet_width}in"
            height="{sheet.sheet_height}in"
        />
    {/each}
    {#each $panels as panel}
        <rect
            on:mouseover={showSizes}
            on:mouseleave={hideSizes}
            class="panel print"
            id="{panel.id}"
            x="{panel.x0}in"
            y="{panel.y0}in"
            width="{panel.width}in"
            height="{panel.height}in"
        />

        {#if panel.width > panel.height}
            <text
                class="idh print"
                x="{panel.x0 + panel.width / 2}in"
                y="{panel.y0 + 1 + panel.height / 2}in"
                >
            {panel.id}
            </text>
        {:else}
            <text
                class="idv print"
                x="{panel.x0 - 0.25 + panel.width / 2}in"
                y="{panel.y0 + 1 + panel.height / 2}in"
                >
            {panel.id}
            </text>
        {/if}
    {/each}
</svg>
</div>
