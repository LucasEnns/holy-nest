<script>
import { data, settings } from '../stores.js'
import { toMM, toInches } from '../methods.js'
import Headers from './Headers.svelte'
import NumInputs from './NumInputs.svelte'
import TextInputs from './TextInputs.svelte'
import CheckInputs from './CheckInputs.svelte'
import { createEventDispatcher } from 'svelte'

const dispatch = createEventDispatcher()
const french = $settings.language === 'fr'
let thickness = $settings.material.thickness

function updateCut() {
  $data.tools.profile.cut_depth -= thickness - $settings.material.thickness
  thickness = $settings.material.thickness
}
function convertCSVUnits() {
  let metric = JSON.parse($data.csv.contents[3][1])
  $data.csv.panels.forEach((index) => {
    index[2] = convertUnit(metric, index[2])
    index[3] = convertUnit(metric, index[3])
  })
  // toggle boolean
  $data.csv.contents[3][1] = $settings.units = !metric
}
function convertDiameterUnits() {
  let tool = $settings.cnc[$settings.tools.tool]
  tool.diameter = convertUnit(tool.mm, tool.diameter)
}
function convertUnit(unit, value) {
  let convert = unit ? toInches : toMM
  return convert(value)
}
</script>

<style>
.settings {
  position: relative;
  z-index: 2;
  padding-bottom: 2px;
  border-bottom: 1px solid var(--second-bg);
}
.subsetting {
  height: 0;
  width: 100%;
  overflow: hidden;
  opacity: 0;
}
.subsetting.active {
  height: auto;
  opacity: 1;
}
.title {
  cursor: pointer;
  font-size: var(--large);
  padding: 0.7rem 0;
  text-transform: uppercase;
  font-weight: 100;
  letter-spacing: 1.2rem;
  border-bottom: 1px solid var(--second-bg);
}
.title:hover,
.title.active:hover {
  border-bottom: 1px solid var(--second);
}
/* .title.active {
  border-bottom: 1px dashed var(--primary);
} */

.transparent {
  font-size: var(--xxlarge);
  /* color: var(--second); */
}
.title:hover .transparent {
  color: var(--second);
}

h5 {
  font-size: var(--small);
  padding-left: 2rem;
  white-space: nowrap;
  display: flex;
}
select {
  padding-left: 2rem;
  padding-right: 1rem;
  font-weight: 100;
  font-family: Quicksand, sans-serif;
  letter-spacing: 0.05rem;
  direction: rtl;
  color: var(--primary);
  background-color: var(--primary-bg);
  outline: none;
  border: none;
}
select:focus,
select:hover {
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 0.1em;
}
option {
  direction: ltr;
}
.spread {
  width: 2%;
  flex: 2 !important;
}
</style>

<div class="settings">
  <div
    class="title"
    class:active="{$settings.subsettings.show}"
    on:click="{() => ($settings.subsettings.show = !$settings.subsettings.show)}">
    <span class="transparent">{$settings.subsettings.show ? '⩚' : '⩛'}</span>
    <span> {french ? 'Parametre' : ' Settings'} </span>
  </div>
  <div class="subsetting" class:active="{$settings.subsettings.show}">
    <!-- project -->
    <Headers
      on:toggle="{() => ($settings.subsettings.project = !$settings.subsettings.project)}"
      open="{$settings.subsettings.project}"
      icon="⟐"
      french="Projet"
      english="Project" />
    <div class="subsetting" class:active="{$settings.subsettings.project}">
      <TextInputs
        english="Billing ID"
        french="Facture ID"
        bind:value="{$data.csv.contents[0][1]}" />
      <TextInputs
        english="{$data.csv.contents[0][4] ? $data.csv.contents[0][4] : 'Product'}"
        french="{$data.csv.contents[0][4] ? $data.csv.contents[0][4] : 'Produit'}"
        bind:value="{$data.csv.contents[0][5]}" />
      <CheckInputs
        on="☑︎"
        off="☐"
        french="Graver les noms des panneaux"
        english="Engrave the panel names"
        bind:checked="{$data.tools.engraver.engrave}" />
      <CheckInputs
        on="mm"
        off="{$settings.language.includes('fr') ? 'po' : 'in'}"
        french="Unites"
        english="Units"
        on:toggle="{convertCSVUnits}"
        bind:checked="{$settings.units}" />
    </div>
    <!-- sheet info -->
    <Headers
      on:toggle="{() => ($settings.subsettings.sheet = !$settings.subsettings.sheet)}"
      open="{$settings.subsettings.sheet}"
      icon="☐"
      english="Material"
      french="Matériau" />
    <div class="subsetting" class:active="{$settings.subsettings.sheet}">
      <TextInputs
        english="{$data.csv.contents[0][2] ? $data.csv.contents[0][2] : 'Type of panel'}"
        french="{$data.csv.contents[0][2] ? $data.csv.contents[0][2] : 'Sorte de panneau'}"
        bind:value="{$data.csv.contents[0][3]}" />
      <NumInputs
        english="Width"
        french="Largeur"
        max="61"
        bind:value="{$settings.material.width}"
        step="0.0625"
        measurement="{'"'}" />
      <NumInputs
        english="Height"
        french="Hauteur"
        bind:value="{$settings.material.height}"
        max="121"
        step="0.0625"
        measurement="{'"'}" />
      <NumInputs
        english="Thickness"
        french="Épaisseur"
        on:changed="{updateCut}"
        bind:value="{$settings.material.thickness}"
        max="5"
        step="0.005"
        measurement="{'"'}" />
      <NumInputs
        english="Margins"
        french="Marges"
        bind:value="{$settings.material.margins}"
        max="5"
        step="0.05"
        measurement="{'"'}" />
    </div>
    <!-- nesting options -->
    <Headers
      on:toggle="{() => ($settings.subsettings.nest = !$settings.subsettings.nest)}"
      open="{$settings.subsettings.nest}"
      icon="⊞"
      english="Nesting"
      french="Nesting" />
    <div class="subsetting" class:active="{$settings.subsettings.nest}">
      <CheckInputs
        english="Aligned to the"
        french="Aligné avec le"
        bind:checked="{$settings.nestDirectionBottom}"
        on="{french ? 'bas' : 'Bottom'} ⤓"
        off="{french ? 'haut' : 'Top'} ⤒" />
      <CheckInputs
        english="Placement direction"
        french="Direction de placement"
        bind:checked="{$settings.nestTypeColumn}"
        on="{french ? 'Colonnes' : 'Columns'} ⇈"
        off="{french ? 'Lignes' : 'Rows'} ⇉" />
      <h5>
        {french ? 'Classé par le:' : 'Sorted by:'}
        <span class="spread">{''}</span>
        <div class="filler">{''}</div>
        <select class="right" bind:value="{$settings.nestOrder}">
          <option value="widest">
            <span>{french ? 'Plus large' : 'Widest'} ↔︎</span>
          </option>
          <option value="tallest">
            <span>{french ? 'Plus haut' : 'Tallest'} ↕︎</span>
          </option>
          <option value="biggest">
            <span>{french ? 'Plus grand' : 'Biggest'} ⤢</span>
          </option>
        </select>
      </h5>
    </div>
    <!-- cutter -->
    <Headers
      on:toggle="{() => ($settings.subsettings.profile = !$settings.subsettings.profile)}"
      open="{$settings.subsettings.profile}"
      icon="⨆"
      english="Profile cut"
      french="Coupe profile" />
    <div class="subsetting" class:active="{$settings.subsettings.profile}">
      <h5>
        {french ? 'Outil:' : 'Tool:'}
        <span class="spread">{''}</span>
        <select bind:value="{$settings.tools.profile}">
          {#each Object.keys($settings.cnc) as tool}
            {#if $settings.cnc[tool].type.includes('mill')}
              <option value="{tool}">
                ({tool}) -
                {$settings.cnc[tool].diameter}
                {$settings.cnc[tool].type}
              </option>
            {/if}
          {/each}
        </select>
      </h5>
      <NumInputs
        english="Cut depth"
        french="Profondeur coupe"
        bind:value="{$data.tools.profile.cut_depth}"
        max="{$settings.cnc[$settings.tools.profile].max_depth}"
        step="0.05"
        measurement="{'"'}" />
      <NumInputs
        english="Smallest for one pass"
        french="Plus petit pour un passe"
        bind:value="{$data.tools.profile.min_size}"
        max="{$settings.material.width}"
        step="0.5"
        measurement="{'"'}" />
      <NumInputs
        english="Last pass link"
        french="Lien pour dernier passe"
        bind:value="{$data.tools.profile.link}"
        max="{$settings.material.thickness}"
        step="0.005"
        measurement="{'"'}" />
    </div>
    <!-- engraver -->
    <Headers
      on:toggle="{() => ($settings.subsettings.engraver = !$settings.subsettings.engraver)}"
      open="{$settings.subsettings.engraver}"
      icon="⋁"
      english="Engraving"
      french="Graver" />
    <div class="subsetting" class:active="{$settings.subsettings.engraver}">
      <h5>
        {french ? 'Outil:' : 'Tool:'}
        <span class="spread">{''}</span>
        <select bind:value="{$settings.tools.engraver}">
          {#each Object.keys($settings.cnc) as tool}
            {#if $settings.cnc[tool].type.includes('nose') || $settings.cnc[tool].type.includes('V-')}
              <option value="{tool}">
                ({tool}) -
                {$settings.cnc[tool].diameter}
                {$settings.cnc[tool].type}
              </option>
            {/if}
          {/each}
        </select>
      </h5>
      <NumInputs
        english="Cut depth"
        french="Profondeur coupe"
        bind:value="{$data.tools.engraver.cut_depth}"
        max="{$settings.cnc[$settings.tools.engraver].max_depth}"
        step="0.005"
        measurement="{'"'}" />
      <NumInputs
        english="Placement from left"
        french="Placement de gauche"
        bind:value="{$data.tools.engraver.xStart}"
        max="10"
        step="0.125"
        measurement="{'"'}" />
      <NumInputs
        english="Placement from"
        french="Placement de bas"
        bind:value="{$data.tools.engraver.yStart}"
        max="10"
        step="0.125"
        measurement="{'"'}" />
      <NumInputs
        english="Letter height"
        french="Hauteur de la lettre"
        bind:value="{$data.tools.engraver.size}"
        max="3"
        step="0.05"
        measurement="{'"'}" />
      <NumInputs
        english="Space between letters"
        french="Espace entre les lettres"
        bind:value="{$data.tools.engraver.spacing}"
        max="2"
        step="0.05"
        measurement="{'"'}" />
    </div>
    <!-- tool library -->
    <Headers
      on:toggle="{() => ($settings.subsettings.library = !$settings.subsettings.library)}"
      open="{$settings.subsettings.library}"
      icon="⩐"
      english="CNC Library"
      french="Bibliotheque CNC" />
    <div class="subsetting" class:active="{$settings.subsettings.library}">
      <h5>
        {french ? 'Outil #' : 'Tool #'}
        <span class="spread">{''}</span>
        <select bind:value="{$settings.tools.tool}">
          {#each Object.keys($settings.cnc) as tool}
            {#if $settings.cnc[tool]}
              <option value="{tool}">
                ({tool}) -
                {$settings.cnc[tool].diameter}{$settings.cnc[tool].mm ? 'mm' : '"'}
                {$settings.cnc[tool].type}
              </option>
            {/if}
          {/each}
        </select>
      </h5>
      <NumInputs
        english="Diameter"
        french="Diametre"
        bind:value="{$settings.cnc[$settings.tools.tool].diameter}"
        max="{$settings.cnc[$settings.tools.tool].mm ? 150 : 5}"
        step="{$settings.cnc[$settings.tools.tool].mm ? 0.5 : 0.03125}"
        on:convert="{convertDiameterUnits}"
        bind:unit="{$settings.cnc[$settings.tools.tool].mm}"
        measurement="{$settings.cnc[$settings.tools.tool].mm ? 'mm' : '"'}" />
      <TextInputs
        english="Type"
        french="Type"
        bind:value="{$settings.cnc[$settings.tools.tool].type}" />
      <NumInputs
        english="Spindle speed"
        french="Vitesse spindle"
        bind:value="{$settings.cnc[$settings.tools.tool].spindle}"
        max="30000"
        step="100"
        measurement="RPM" />
      <NumInputs
        english="Plunge rate"
        french="Vitesse de plonge"
        bind:value="{$settings.cnc[$settings.tools.tool].plunge}"
        max="1000"
        step="5"
        measurement="{'"/min'}" />
      <NumInputs
        english="Plunge ramp"
        french="Longeur de plonge"
        bind:value="{$settings.cnc[$settings.tools.tool].ramp}"
        max="5"
        step="0.125"
        measurement="{'"'}" />
      <NumInputs
        english="Feed rate"
        french="itesse de coupe"
        bind:value="{$settings.cnc[$settings.tools.tool].feed}"
        max="1000"
        step="10"
        measurement="{'"/min'}" />
      <NumInputs
        english="Max cut depth"
        french="Max profondeur coupe"
        bind:value="{$settings.cnc[$settings.tools.tool].max_depth}"
        max="5"
        step="0.03125"
        measurement="{'"'}" />
      <NumInputs
        english="Max depth/pass"
        french="Max profondeur/passe"
        bind:value="{$settings.cnc[$settings.tools.tool].pass_depth}"
        max="5"
        step="0.03125"
        measurement="{'"'}" />
    </div>
  </div>
</div>
