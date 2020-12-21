{#if displayInfo}
    <div class="infocard" style="left: {left}px; top: {top}px;">
        <h4>{$sheets[id].id}</h4>
        <p>area des panneaux: {trunc( $sheets[id].area / 144, 2)} pi<sup>2</sup></p>
        <p>area de perte: {trunc($sheets[id].waste_area / 144, 2)} pi<sup>2</sup></p>
        <p>% de perte: {trunc($sheets[id].waste_ratio * 100, 2)}%</p>
        <!-- <p>used area: {trunc( $sheets[id].area / 144, 2)} pi<sup>2</sup></p>
        <p>waste area: {trunc($sheets[id].waste_area / 144, 2)} pi<sup>2</sup></p>
        <p>waste: {trunc($sheets[id].waste_ratio * 100, 2)}%</p> -->
    </div>
{/if}

<div class="viewer" bind:this={svgFile}>
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
                    style="stroke-width: {$settings.material.margins * scale * 2}px;"
                    on:mouseover={showInfo}
                    on:mouseleave={hideInfo}
                    class="sheet print"
                    id="{index}"
                    x="{index * sheet.sheet_width * scale}"
                    y="0"
                    width="{sheet.sheet_width * scale}"
                    height="{sheet.sheet_height * scale}" />
            </g>
            <g id="panels">
                {#each sheet.group as panel}
                    <rect
                        style="stroke-width: {$settings.cutter * scale}px;"
                        on:mouseover={panelHoverOn}
                        on:mouseleave={panelHoverOff}
                        class="panel {$activePanel == panel.id ? "active" : ""} print"
                        id="{panel.id}"
                        x="{(panel.x0 + index * sheet.sheet_width) * scale}"
                        y="{panel.y0 * scale}"
                        width="{panel.width * scale}"
                        height="{panel.height * scale}" />

                        <text
                            style="font-size: {Math.min(panel.height * 0.8, 5) * scale}px;"
                            class="id {$activePanel == panel.id ? "active" : ""} print"
                            x="{(panel.x0 + panel.width / 2 + index * sheet.sheet_width) * scale}"
                            y="{(panel.y0 + Math.min(panel.height * 0.8, 5)/3 + panel.height / 2) * scale}">
                        {panel.id}
                        </text>
                {/each}
            </g>
        {/each}

    </svg>
</div>

<script>

import { panels, sheets, settings, svg, activePanel } from '../stores.js'
import { afterUpdate } from 'svelte'
import { trunc } from "../methods.js";

let id,
    displayInfo = false,
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

function panelHoverOn() {
    $activePanel = this.id
}
function panelHoverOff() {
   $activePanel = ''
}
function showInfo() {
    displayInfo = true
    let rect = this.getBoundingClientRect();
    top = (rect.bottom - rect.top) / 2 + rect.top
    left = (rect.right - rect.left) / 2 + rect.left
    id = this.id
}

function hideInfo() {
    displayInfo = false
}

</script>

<style>

.viewer{
    height: 87vh;
}
.infocard{
    position: fixed;
    padding: 1rem;
    background-color: var(--primary);
    border: 1px solid var(--primary-bg);
    border-radius: 4px;
    font-weight: 100;
    line-height: 1.5em;
    color: var(--primary-bg);
    font-size: 1.3rem;
    z-index: 2;
    transform: translate(-50%,-50%);
    pointer-events: none;
}
sup {
    font-size: .5em;
    line-height: 1.5em;
}
svg{
    height: 100%;
    width: 100%;
    margin: auto auto;
}

.panel{
    stroke: var(--secondary);
    fill: var(--primary-bg);
    animation: fadeout 0.2s ;
}

.active{
    fill: var(--secondary);
    stroke: var(--primary);
    animation: fadein 0.2s ;
}
.sheet{
    stroke:var(--primary);
    fill: var(--primary);
    fill-opacity: 0;
    animation: fadeout 0.2s ;
}

.sheet:hover {
    fill: var(--primary);
    fill-opacity: 1;
    animation: fadein 0.4s ;
}

.id {
    text-anchor: middle;
    fill: var(--secondary);
    stroke: none;
    font-weight: 300;
    pointer-events: none;
    cursor: default;
}
.id.active {
    fill: var(--primary-bg);
    /* font-style: italic; */
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

</style>
