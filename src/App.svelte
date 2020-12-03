<script>
  import Import from "./components/Import.svelte"
  import Viewer from "./components/Viewer.svelte"
  import Info from "./components/Info.svelte"
  // import { errors } from "./stores.js";
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
      // padding: 1rem

      .import, .info
          // height: 150px
          display: flex
          // width: 80%
          // flex-direction: column
          // vertical-align: middle
          align-items: center
          justify-content: space-around
          // padding: 10px


      .viewer

          // position: absolute
          // top: 12vh
          // left: 0
          // bottom: 6vh
          // right: 0
          margin: 20px
          // height: 88vh
          // width: 1vw


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
  <div class="viewer">

    <Viewer />
  </div>
  <div class="info">

    <Info />
  </div>
</div>
