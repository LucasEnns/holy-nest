<script>
import { data, settings } from '../stores.js'
import Headers from './Headers.svelte'
import NumInputs from './NumInputs.svelte'
import TextInputs from './TextInputs.svelte'
import CheckInputs from './CheckInputs.svelte'

const french = $settings.language === 'fr'
let thickness = $settings.material.thickness

function updateCut() {
  $data.tools.profile.cut_depth -= thickness - $settings.material.thickness
  thickness = $settings.material.thickness
}
</script>

<style>
.settings {
  position: relative;
  height: 100vh;
  /* top: -90vh; */
  /* right: 100%; */
  transition: 0.25s;
  opacity: 0;
  overflow: scroll;
  z-index: 2;
  /* padding-bottom: 10vh; */
}
.settings.active {
  /* background-color: var(--primary-bg); */
  /* transform: translateY(-100%); */
  transition: 0.2s;
  opacity: 1;
}
.subsetting {
  height: 0;
  width: fit-content;
  overflow: hidden;
  opacity: 0;
}
.subsetting.active {
  height: auto;
  opacity: 1;
}
.close {
  position: relative;
  top: -3rem;
  text-align: end;
  cursor: pointer;
}
h2 {
  font-size: var(--large);
  min-width: 100%;
  padding-top: 2vh;
  padding-right: 100%;
  text-transform: uppercase;
  font-weight: 100;
  letter-spacing: 1.5rem;
}
h5 {
  font-size: var(--small);
  padding-left: 2rem;
  white-space: nowrap;
  display: flex;
}

select {
  padding-left: 2rem;
  width: fit-content;
  font-weight: 100;
  font-family: Quicksand, sans-serif;
  letter-spacing: 0.05rem;
  color: var(--primary);
  background-color: var(--primary-bg);
  outline: none;
  border: 1px solid transparent;
  border-radius: 0.2rem;
}

select:hover {
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 0.2em;
}
select:focus {
  font-weight: 800;
  color: var(--third);
  background-color: var(--primary-bg);
  border: 1px solid var(--primary);
  border-radius: 0.2rem;
}
</style>

<div class="settings" class:active="{$settings.show}">
  <!-- <div class="title">
    <h2 data-lang="{$settings.language}" data-fr="Parametre">
      <span> Settings</span>
    </h2>
    <div
      class="close"
      role="button"
      on:click="{() => ($settings.show = false)}">
      X
    </div>
  </div> -->
  <!-- sheet info -->
  <Headers
    on:toggle="{() => ($settings.subsettings.sheet = !$settings.subsettings.sheet)}"
    open="{$settings.subsettings.sheet}"
    icon="☐"
    english="Sheet stock"
    french="Feuilles" />
  <div class="subsetting" class:active="{$settings.subsettings.sheet}">
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
      on:change="{updateCut}"
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
      <select bind:value="{$settings.nestOrder}">
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
    english="Cutting tool"
    french="Coupe profile" />
  <div class="subsetting" class:active="{$settings.subsettings.profile}">
    <select bind:value="{$settings.tools.profile}">
      {#each Object.keys($settings.cnc) as tool}
        {#if $settings.cnc[tool].type.includes('mill')}
          <option value="{tool}">
            {tool}
            -
            {$settings.cnc[tool].diameter}
            {$settings.cnc[tool].type}
          </option>
        {/if}
      {/each}
    </select>
    <NumInputs
      english="Cut depth"
      french="Profondeur coupe"
      bind:value="{$data.tools.profile.cut_depth}"
      max="{$settings.cnc[$settings.tools.profile].max_depth}"
      step="0.05"
      measurement="{'"'}" />
  </div>
  <!-- engraver -->
  <Headers
    on:toggle="{() => ($settings.subsettings.engraver = !$settings.subsettings.engraver)}"
    open="{$settings.subsettings.engraver}"
    icon="⋁"
    english="Engraving tool"
    french="Graver" />
  <div class="subsetting" class:active="{$settings.subsettings.engraver}">
    <select bind:value="{$settings.tools.engraver}">
      {#each Object.keys($settings.cnc) as tool}
        {#if $settings.cnc[tool].type.includes('nose') || $settings.cnc[tool].type.includes('V-')}
          <option value="{tool}">
            {tool}
            -
            {$settings.cnc[tool].diameter}
            {$settings.cnc[tool].type}
          </option>
        {/if}
      {/each}
    </select>
    <NumInputs
      english="Cut depth"
      french="Profondeur coupe"
      bind:value="{$data.tools.engraver.cut_depth}"
      max="{$settings.cnc[$settings.tools.engraver].max_depth}"
      step="0.005"
      measurement="{'"'}" />
  </div>
  <!-- tool library -->
  <Headers
    on:toggle="{() => ($settings.subsettings.library = !$settings.subsettings.library)}"
    open="{$settings.subsettings.library}"
    icon="⩐"
    english="Tool library"
    french="Bibliotheque d'outils" />
  <div class="subsetting" class:active="{$settings.subsettings.library}">
    <select bind:value="{$settings.tools.tool}">
      {#each Object.keys($settings.cnc) as tool}
        {#if $settings.cnc[tool]}
          <option value="{tool}">
            {tool}
            -
            {$settings.cnc[tool].diameter}
            {$settings.cnc[tool].type}
          </option>
        {/if}
      {/each}
    </select>
    <!-- <TextInputs
      english="Name"
      french="Nom"
      bind:value="{$settings.cnc[$settings.tools.tool].name}" /> -->
    <NumInputs
      english="Diameter"
      french="Diametre"
      bind:value="{$settings.cnc[$settings.tools.tool].diameter}"
      max="5"
      step="0.03125"
      measurement="{'"'}" />
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
