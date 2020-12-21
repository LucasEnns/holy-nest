<script>
import { panels, sheets, settings, svg, activePanel } from '../stores.js'
import { afterUpdate } from 'svelte'

let id,
    width,
    height,
    checkSize = false,
    mx = 0,
    my = 0,
    top = 0,
    left = 0,
    scale = 90, // inches to pixels
    svgFile
$:  viewBoxW = $sheets.length * $settings.material.width
$:  viewBoxH = $settings.material.height


afterUpdate(() => {
    if ( $sheets.length ) {
        $svg = svgFile.innerHTML.toString()
    }
})

function showSizes() {

    $activePanel = this.id
    checkSize = true
    let rect = this.getBoundingClientRect();
    top = rect.bottom + 12
    left = rect.left + 12
    id = this.id
    width = this.width.baseVal.valueAsString
    height = this.height.baseVal.valueAsString
}

function hideSizes( event ) {
    checkSize = false
    $activePanel = ''
}

</script>

<style>
.viewer{
    /* margin: 1rem; */

    height: 76vh;
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
        fill: #80ccf0;
        fill-opacity: 0;
        animation: fadeout 0.1s ;
    }

    /* .panel:hover, */
    .active{
        fill: #80ccf0;
        fill-opacity: 1;
        stroke: #333;
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
        stroke:#fde3b0;
        stroke-width: 15;
        /* fill: url(#pattern1); */
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

<!-- {#if checkSize}
<div class="infocard" style="left: {left}px; top: {top}px;">
    <h4 class="sizes">Panel: {id}</h4>
    <h4 class="sizes">Width: {width / scale - $settings.cutter}</h4>
    <h4 class="sizes">Height: {height / scale - $settings.cutter}</h4>
</div>
{/if}
 -->

<div class="viewer"    bind:this={svgFile}>
<svg class="print"
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
    xmlns:xlink="http://www.w3.org/1999/xlink"
    width="{viewBoxW * scale}"
    height="{viewBoxH * scale}"
    viewBox="0 0 {viewBoxW * scale} {viewBoxH * scale}"
    preserveAspectRatio="xMidYMid meet" >

    {#each $sheets as sheet, index}
        <g id="sheets">
            <rect
                class="sheet print"
                id="{sheet.id}"
                x="{index * sheet.sheet_width * scale}"
                y="0"
                width="{sheet.sheet_width * scale}"
                height="{sheet.sheet_height * scale}" />
        </g>
        <g id="panels">
            {#each sheet.group as panel}
                <rect
                    on:mouseover={showSizes}
                    on:mouseleave={hideSizes}
                    class="panel {$activePanel == panel.id ? "active" : ""} print"
                    id="{panel.id}"
                    x="{(panel.x0 + index * sheet.sheet_width) * scale}"
                    y="{panel.y0 * scale}"
                    width="{panel.width * scale}"
                    height="{panel.height * scale}" />

                    <text
                        class="idh {$activePanel == panel.id ? "active" : ""} print"
                        x="{(panel.x0 + panel.width / 2 + index * sheet.sheet_width) * scale}"
                        y="{(panel.y0 + 1 + panel.height / 2) * scale}">
                    {panel.id}
                    </text>
            {/each}
        </g>
    {/each}

</svg>
</div>
