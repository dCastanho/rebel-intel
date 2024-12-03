<script>
  import Camera from "./lib/Camera.svelte";
  import EmptyState from "./lib/EmptyState.svelte";
    import Filter from "./lib/Filter.svelte";
  import Modal from "./lib/Modal.svelte";
  import Navbar from "./lib/Navbar.svelte";
  import Results from "./lib/Results.svelte";
  import { cameraState } from "./lib/state.svelte";

  let camera = $state();

  function activate() {
    camera.startCamera();
  }
</script>

<main class="h-full relative">
  <Modal />
  <div class="min-h-full flex-col flex justify-start">
    <Navbar />
    <div
      class={`h-full items-center grow flex flex-col ${ Object.entries(cameraState.exported).length == 0 || cameraState.isActive ? "justify-center" : "justify-start p-2"}`}
    >
      <Camera bind:this={camera} />
      {#if !cameraState.isActive}
        {#if Object.entries(cameraState.exported).length == 0}
          <EmptyState activateCamera={activate} />
          <div class="w-44">
            <Filter />
          </div>
        {:else}
        <div class="px-2 w-full">
          <Filter />
        </div>
          <Results activateCamera={activate} />
        {/if}
      {/if}
    </div>
  </div>
</main>
