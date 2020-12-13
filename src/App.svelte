<script>
  import Import from "./components/Import.svelte"
  import Viewer from "./components/Viewer.svelte"
  import CSV from "./components/CSV.svelte"
  import Info from "./components/Info.svelte"
  import { sheets } from "./stores.js";
</script>

<style lang="sass">
  .container
      position: absolute
      top: 0
      left: 0
      right: 0
      bottom: 0
      display: grid
      grid-template-rows: 12vh 76vh 12vh
      overflow: hidden

      .info
          display: flex
          align-items: center
          justify-content: space-evenly

  .main, .import
    position: relative
    margin: 0 1vw
    display: grid
    grid-template-columns: minmax(200px, 18vw)  1fr
    // height: 76vh



// @media print

//   .import, .info
//     display: none

</style>

<div class="container">
  <div class="import">
    <Import />
  </div>
  <!-- <div class="err">
    {#each $errors as err}
      <p>{err}</p>

    {/each}
  </div> -->
  <!-- {#if $sheets.length} -->

  <div class="main">
    <CSV />
    <Viewer />
  </div>
  <div class="info">

    <Info />
  </div>
  <!-- {/if} -->
</div>
