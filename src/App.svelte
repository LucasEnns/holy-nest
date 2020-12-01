<script>
  import Import from "./components/Import.svelte"
  import Viewer from "./components/Viewer.svelte"
</script>

<style lang="sass">
  .container
      position: absolute
      top: 0
      left: 0
      right: 0
      bottom: 0
      display: grid
      grid-template-rows: 12vh 1fr
      overflow: hidden
      // padding: 1rem

      .import
          // height: 150px
          display: flex
          // width: 80%
          // flex-direction: column
          // vertical-align: middle
          align-items: center
          justify-content: space-around
          // padding: 10px


      .viewer

          position: relative
          top: 0
          left: 0
          bottom: 0
          right: 0
          margin: 0 10% 10% 10%


</style>

<div class="container">
  <div class="import">
    <Import />
  </div>
  <div class="viewer">

    <Viewer />
  </div>
</div>
