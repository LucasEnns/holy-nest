<script>
import { settings } from '../stores.js'
let userLang = navigator.language || navigator.userLanguage

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
  /* padding: 1.5vh 3.5vw; */
  transition: 0.25s;
  /* opacity: 0; */
  display: none;
  /* pointer-events: none; */
  z-index: 2;
  /* display: grid;
  grid-template-rows: 10vh 1fr;
  grid-template-columns: repeat(2, minmax(200px, 1fr)); */
  /* flex-direction: row; */
  /* justify-content: center; */
}
.settings.active {
  background-color: var(--primary-bg);
  transform: translateX(-100%);
  transition: 0.2s;
  display: block;
  /* opacity: 1; */
  overflow: scroll;
  /* pointer-events: auto; */
  /* transition-delay: 1s; */
}
.general,
.cnc {
  height: auto;
  /* display: grid; */
  /* align-items: initial; */
  /* justify-items: start; */
}

/* .closepane {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
} */
/* .close {
  text-align: end;
} */
/* h1 {
  min-width: 100%;
  padding-top: 2vh;
  padding-right: 100%;
  text-transform: uppercase;
  font-weight: 100;
  letter-spacing: 2rem;
}
h2 {
  padding-top: 1vh;
  text-transform: uppercase;
  font-size: var(--xlarge);
} */
h3 {
  font-weight: 300;
  font-style: italic;
  padding-top: 1rem;
}
h3,
h5 {
  margin-right: 1rem;
}
/* .input-wrapper {
  padding-left: 3vw;
} */
h5 {
  padding-left: 1rem;
}

input {
  width: 4em;
  text-align: center;
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
  /* top: 0.6rem; */
}
.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  vertical-align: middle;
  /* padding-bottom: 0.2rem; */
  /* background-color: #8ffffd; */
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
  /* border: 1px solid var(--primary);
  border-radius: 0.2rem; */
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
  /* transform: translate(-50%, 0%); */
}
.units[data-lang*='fr']:after {
  content: 'pouces';
}
input:checked + .units:after {
  content: 'mm';
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
  content: 'Row';
}
input:checked + .type:after {
  content: 'Column';
}
input:checked + .type[data-lang*='fr']:after {
  content: 'Column';
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
  /* font-family: Overpass; */
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

<!-- <div class="closepane"></div> -->
<div class="settings" class:active="{$settings.show}">
  <div class="title">
    <h1 data-lang="{userLang}" data-fr="Parametre"><span> Settings</span></h1>
  </div>
  <!-- <div class="close">X</div> -->
  <div class="general">
    <!-- <h2 data-lang="{userLang}" data-fr="Genéral"><span> General</span></h2> -->

    <div class="input-wrapper">
      <h3 data-lang="{userLang}" data-fr="Unités: "><span>Units: </span></h3>
      <label class="switch"><input
          type="checkbox"
          bind:checked="{$settings.units}" />
        <div class="slider units" data-lang="{userLang}"></div></label>
    </div>
    <div class="input-wrapper">
      <h3 data-lang="{userLang}" data-fr="Nest apartir de: ">
        <span>Nest from: </span>
      </h3>
      <label class="switch"><input
          type="checkbox"
          bind:checked="{$settings.nestDirectionBottom}" />
        <div class="slider direction" data-lang="{userLang}"></div></label>
    </div>
    <div class="input-wrapper">
      <h3 data-lang="{userLang}" data-fr="Nest avec: ">
        <span>Nest with: </span>
      </h3>
      <label class="switch"><input
          type="checkbox"
          bind:checked="{$settings.nestTypeColumn}" />
        <div class="slider type" data-lang="{userLang}"></div></label>
    </div>
    <div class="input-wrapper">
      <h3 data-lang="{userLang}" data-fr="Nest par le: ">
        <span>Nest by: </span>
      </h3>
      <select bind:value="{$settings.nestOrder}">
        <option data-lang="{userLang}" data-fr="plus large" value="widest">
          <span>widest</span>
        </option>
        <!-- <option data-lang="{userLang}" data-fr="moins large" value="narrowest">
          <span>narrowest</span>
        </option> -->
        <option data-lang="{userLang}" data-fr="plus haut" value="tallest">
          <span>tallest</span>
        </option>
        <!-- <option data-lang="{userLang}" data-fr="moins haut" value="shortest">
          <span>shortest</span>
        </option> -->
        <option data-lang="{userLang}" data-fr="plus grand" value="biggest">
          <span>biggest</span>
        </option>
        <!-- <option data-lang="{userLang}" data-fr="moins grand" value="smallest">
          <span>smallest</span>
        </option> -->
      </select>
    </div>
    <div class="input-wrapper">
      <h3 data-lang="{userLang}" data-fr="Info sur les feuilles: ">
        <span>Sheet info: </span>
      </h3>
      <h5 data-lang="{userLang}" data-fr="Largeur: ">
        <span>Width: </span>
        <input
          class="input"
          type="number"
          bind:value="{$settings.material.width}"
          step="0.0625" />
      </h5>
      <h5 data-lang="{userLang}" data-fr="Hauteur: ">
        <span>Height: </span>
        <input
          class="input"
          type="number"
          bind:value="{$settings.material.height}"
          step="0.0625" />
      </h5>
      <h5 data-lang="{userLang}" data-fr="Épaisseur: ">
        <span>Thickness: </span>
        <input
          class="input"
          type="number"
          bind:value="{$settings.material.thickness}"
          step="0.005" />
      </h5>
    </div>
    <div class="input-wrapper">
      <h5 data-lang="{userLang}" data-fr="Marge: ">
        <span>Margins: </span>
        <input
          class="input"
          type="number"
          bind:value="{$settings.material.margins}"
          step="0.05" />
      </h5>
    </div>
  </div>

  <div class="cnc">
    <!-- <h2 data-lang="{userLang}" data-fr="CNC"><span> CNC</span></h2> -->
    <div class="input-wrapper">
      <h3 data-lang="{userLang}" data-fr="Outil pour la decoupe: ">
        <span>Profile cutting tool: </span>
      </h3>
      <h5 data-lang="{userLang}" data-fr="Outil #: ">
        <span>Tool #: </span>
        <input
          class="input"
          type="number"
          bind:value="{$settings.tool}"
          step="1" />
      </h5>
    </div>
    <div class="input-wrapper">
      <h5 data-lang="{userLang}" data-fr="Type: ">
        <span>Type: </span>
        <input
          class="input"
          type="text"
          bind:value="{$settings.cnc[$settings.tool].type}" />
      </h5>
    </div>
    <div class="input-wrapper">
      <h5 data-lang="{userLang}" data-fr="Diametre: ">
        <span>Diameter: </span>
        <input
          class="input"
          type="number"
          bind:value="{$settings.cnc[$settings.tool].diameter}"
          step="0.03125" />
      </h5>
    </div>
    <div class="input-wrapper">
      <h5 data-lang="{userLang}" data-fr="Diametre: ">
        <span>Spindle speed: </span>
        <input
          class="input"
          type="number"
          bind:value="{$settings.cnc[$settings.tool].spindle}"
          step="10" />
        <span> RPM</span>
      </h5>
    </div>
    <div class="input-wrapper">
      <h5 data-lang="{userLang}" data-fr="vitesse de coupe: ">
        <span>Feed rate: </span>
        <input
          class="input"
          type="number"
          bind:value="{$settings.cnc[$settings.tool].feed}"
          step="10" />
        <span> in/min</span>
      </h5>
    </div>
    <div class="input-wrapper">
      <h5 data-lang="{userLang}" data-fr="vitesse de plonge: ">
        <span>Plunge rate: </span>
        <input
          class="input"
          type="number"
          bind:value="{$settings.cnc[$settings.tool].plunge}"
          step="10" />
        <span> in/min</span>
      </h5>
    </div>
    <div class="input-wrapper">
      <h5 data-lang="{userLang}" data-fr="Longeur de plonge: ">
        <span>Plunge ramp: </span>
        <input
          class="input"
          type="number"
          bind:value="{$settings.cnc[$settings.tool].ramp}"
          step="10" />
        <span> in</span>
      </h5>
    </div>
    <div class="input-wrapper">
      <h5 data-lang="{userLang}" data-fr="Max profondeur/passe: ">
        <span>Max depth/pass: </span>
        <input
          class="input"
          type="number"
          bind:value="{$settings.cnc[$settings.tool].max_depth}"
          step="10" />
        <span> in</span>
      </h5>
    </div>
  </div>
</div>
