<script>
import { settings } from '../stores.js'

const french = $settings.language === 'fr'

function highlight() {
  this.select()
}
</script>

<style>
.settings {
  position: relative;
  height: 90vh;
  top: -90vh;
  left: 100%;
  transition: 0.25s;
  display: none;
  z-index: 2;
}
.settings.active {
  background-color: var(--primary-bg);
  transform: translateX(-100%);
  transition: 0.2s;
  display: block;
  overflow: scroll;
}
.general,
.cnc {
  height: auto;
}
.close {
  text-align: end;
  cursor: pointer;
}
h2 {
  font-size: var(--xlarge);
  min-width: 100%;
  padding-top: 2vh;
  padding-right: 100%;
  text-transform: uppercase;
  font-weight: 100;
  letter-spacing: 1.5rem;
}
h3 {
  font-weight: 300;
  font-style: italic;
  padding-top: 1rem;
}
h3,
h5 {
  margin-right: 1rem;
}
h5 {
  font-size: var(--small);
  padding-left: 1rem;
  white-space: nowrap;
  display: flex;
}
h5 > input {
  width: 2%;
  flex: 2 !important;
  text-align: left;
}
input:hover {
  color: var(--primary);
  background-color: var(--primary-bg);
  text-decoration: underline;
}

select {
  padding-left: 1rem;
  width: 10rem;
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
}
select:focus,
.slider:f {
  font-weight: 800;
  color: var(--third);
  background-color: var(--primary-bg);
  border: 1px solid var(--primary);
  border-radius: 0.2rem;
}

.switch input {
  top: 0.5em;
  width: 0.1px;
  height: 0.1px;
  opacity: 0;
  overflow: hidden;
  position: absolute;
  z-index: -1;
}

input[type='checkbox'] {
  opacity: 0;
}

.switch {
  position: relative;
  display: inline-block;
  width: 1.05in;
  height: 1.5rem;
}
.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  vertical-align: middle;
  -webkit-transition: 0.2s;
  transition: 0.2s;
  border: 1px solid var(--primary);
  border-top: transparent;
  border-right: transparent;
  border-bottom-left-radius: 0.2rem;
}
.slider:hover:after,
input:checked + .direction:hover:after {
  text-decoration: overline;
}
.direction:hover:after,
select:hover {
  text-decoration: underline;
}
.slider:before {
  position: absolute;
  content: '';
  height: 1.5rem;
  width: 1px;
  right: 0.05in;
  top: 0;
  background-color: var(--primary);
  -webkit-transition: 0.2s;
  transition: 0.2s;
}
input:checked + .slider:before {
  -webkit-transform: translateX(-24mm);
  -ms-transform: translateX(-24mm);
  transform: translateX(-24mm);
}
.slider:after {
  content: 'inches';
  color: var(--primary);
  display: block;
  position: absolute;
  top: -0.5rem;
  left: 1rem;
  font-weight: 100;
  font-size: var(--medium);
}

.direction,
.type {
  border: none;
}
.direction:before,
.type:before {
  opacity: 0;
}
.direction:after {
  content: 'Top';
  text-decoration: overline;
}
.direction[data-lang*='fr']:after {
  content: 'Haut';
}
input:checked + .direction:after {
  content: 'Bottom';
  text-decoration: underline;
}
input:checked + .direction[data-lang*='fr']:after {
  content: 'Bas';
}
.type:after {
  content: 'Row';
}
.type[data-lang*='fr']:after {
  content: 'Lignes';
}
input:checked + .type:after {
  content: 'Column';
}
input:checked + .type[data-lang*='fr']:after {
  content: 'Colonnes';
}
input[type='checkbox']:focus + .slider:after,
.switch:hover {
  font-weight: 800;
  color: var(--third);
}
select {
  padding-left: 1rem;
  width: 10rem;
  font-weight: 100;
  color: var(--primary);
  background-color: var(--primary-bg);
  outline: none;
  border: 1px solid transparent;
  border-radius: 0.2rem;
}

select:hover {
  cursor: pointer;
}
select:focus,
.slider:focus {
  font-weight: 800;
  color: var(--third);
  background-color: var(--primary-bg);
  border: 1px solid var(--primary);
  border-radius: 0.2rem;
}
</style>

<div class="settings" class:active="{$settings.show}">
  <div class="close" role="button" on:click="{() => ($settings.show = false)}">X</div>
  <div class="title">
    <h2 data-lang="{$settings.language}" data-fr="Parametre"><span> Settings</span></h2>
  </div>
  <div class="general">
    <div class="input-wrapper">
      <h3 data-lang="{$settings.language}" data-fr="Nest apartir de">
        <span>Nest from</span>
      </h3>
      <label class="switch"><input
          type="checkbox"
          bind:checked="{$settings.nestDirectionBottom}" />
        <div class="slider direction" data-lang="{$settings.language}"></div></label>
    </div>
    <div class="input-wrapper">
      <h3 data-lang="{$settings.language}" data-fr="Nest avec les">
        <span>Nest with</span>
      </h3>
      <label class="switch"><input
          type="checkbox"
          bind:checked="{$settings.nestTypeColumn}" />
        <div class="slider type" data-lang="{$settings.language}"></div></label>
    </div>
    <div class="input-wrapper">
      <h3 data-lang="{$settings.language}" data-fr="Nest par le"><span>Nest by</span></h3>
      <select bind:value="{$settings.nestOrder}">
        <option value="widest"><span>{french ? 'plus large' : 'widest'}</span></option>
        <option value="tallest"><span>{french ? 'plus haut' : 'tallest'}</span></option>

        <option value="biggest"><span>{french ? 'plus grand' : 'biggest'}</span></option>
        \
      </select>
    </div>
    <div class="input-wrapper">
      <h3 data-lang="{$settings.language}" data-fr="Info sur les feuilles">
        <span>Sheet info</span>
      </h3>
      <h5 data-lang="{$settings.language}" data-fr="po :Largeur">
        <input
          class="input"
          type="number"
          on:click="{highlight}"
          bind:value="{$settings.material.width}"
          min="0"
          max="61"
          step="0.0625" />
        <span>in :Width</span>
      </h5>
      <h5 data-lang="{$settings.language}" data-fr="po :Hauteur">
        <input
          class="input"
          type="number"
          on:click="{highlight}"
          bind:value="{$settings.material.height}"
          min="0"
          max="121"
          step="0.0625" />
        <span>in :Height</span>
      </h5>
      <h5 data-lang="{$settings.language}" data-fr="po :Épaisseur">
        <input
          class="input"
          type="number"
          on:click="{highlight}"
          bind:value="{$settings.material.thickness}"
          min="0"
          max="5"
          step="0.005" />
        <span>in :Thickness</span>
      </h5>
    </div>
    <div class="input-wrapper">
      <h5 data-lang="{$settings.language}" data-fr="po :Profondeur coupe">
        <input
          class="input"
          type="number"
          on:click="{highlight}"
          bind:value="{$settings.material.cut_depth}"
          min="0"
          max="{$settings.cnc[$settings.tool].max_depth}"
          step="0.05" />
        <span>in :Cut depth</span>
      </h5>
    </div>
    <div class="input-wrapper">
      <h5 data-lang="{$settings.language}" data-fr="po :Marge">
        <input
          class="input"
          type="number"
          on:click="{highlight}"
          bind:value="{$settings.material.margins}"
          min="0"
          max="5"
          step="0.05" />
        <span>in :Margins</span>
      </h5>
    </div>
  </div>

  <div class="cnc">
    <!-- <h2 data-lang="{$settings.language}" data-fr="CNC"><span> CNC</span></h2> -->
    <div class="input-wrapper">
      <h3 data-lang="{$settings.language}" data-fr="Outil pour la decoupe">
        <span>Profile cutting tool</span>
      </h3>
      <h5 data-lang="{$settings.language}" data-fr="Outil #: ">
        <input
          class="input"
          type="number"
          on:click="{highlight}"
          bind:value="{$settings.tool}"
          step="1"
          min="1"
          max="{Object.keys($settings.cnc).length}" />
        <span> :Tool #</span>
      </h5>
    </div>
    <div class="input-wrapper">
      <h5 data-lang="{$settings.language}" data-fr=" :Nom">
        <input
          class="input"
          type="text"
          on:click="{highlight}"
          bind:value="{$settings.cnc[$settings.tool].name}" />
        <span>:Name</span>
      </h5>
    </div>
    <div class="input-wrapper">
      <h5 data-lang="{$settings.language}" data-fr="po :Diametre">
        <input
          class="input"
          type="number"
          on:click="{highlight}"
          bind:value="{$settings.cnc[$settings.tool].diameter}"
          min="0"
          step="0.03125" />
        <span>in :Diameter</span>
      </h5>
    </div>
    <div class="input-wrapper">
      <h5 data-lang="{$settings.language}" data-fr="po :Max profondeur coupe">
        <input
          class="input"
          type="number"
          on:click="{highlight}"
          bind:value="{$settings.cnc[$settings.tool].max_depth}"
          min="0"
          step="0.03125" />
        <span>in :Max cut depth</span>
      </h5>
    </div>
    <div class="input-wrapper">
      <h5 data-lang="{$settings.language}" data-fr="po :Max profondeur/passe">
        <input
          class="input"
          type="number"
          on:click="{highlight}"
          bind:value="{$settings.cnc[$settings.tool].pass_depth}"
          min="0"
          step="0.03125" />
        <span>in :Max depth/pass</span>
      </h5>
    </div>
    <div class="input-wrapper">
      <h5 data-lang="{$settings.language}" data-fr="RPM :Vitesse spindle">
        <input
          class="input"
          type="number"
          on:click="{highlight}"
          bind:value="{$settings.cnc[$settings.tool].spindle}"
          min="0"
          step="100" />
        <span>RPM :Spindle speed</span>
      </h5>
    </div>
    <div class="input-wrapper">
      <h5 data-lang="{$settings.language}" data-fr="po/min :Vitesse de coupe">
        <input
          class="input"
          type="number"
          on:click="{highlight}"
          bind:value="{$settings.cnc[$settings.tool].feed}"
          min="0"
          step="10" />
        <span>in/min :Feed rate</span>
      </h5>
    </div>
    <div class="input-wrapper">
      <h5 data-lang="{$settings.language}" data-fr="po/min :Vitesse de plonge">
        <input
          class="input"
          type="number"
          on:click="{highlight}"
          bind:value="{$settings.cnc[$settings.tool].plunge}"
          min="0"
          step="5" />
        <span>in/min :Plunge rate </span>
      </h5>
    </div>
    <div class="input-wrapper">
      <h5 data-lang="{$settings.language}" data-fr="po :Longeur de plonge">
        <input
          class="input"
          type="number"
          on:click="{highlight}"
          bind:value="{$settings.cnc[$settings.tool].ramp}"
          min="0"
          step="0.125" />
        <span>in :Plunge ramp </span>
      </h5>
    </div>
  </div>
</div>
