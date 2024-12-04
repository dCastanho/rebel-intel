<script>
    import { onMount } from "svelte";


    import { cameraState } from "./state.svelte";

	onMount( () => setTimeout(() => cameraState.error = false, 2000))

</script>
<div class="pointer-events-none z-50 absolute inset-x-0 top-8 sm:flex sm:justify-center sm:px-6 sm:pb-5 lg:px-8">
	<div class="pointer-events-auto flex items-center justify-between gap-x-6 bg-red-600 shadow-md px-6 py-2.5 sm:rounded-xl sm:py-3 sm:pl-4 sm:pr-3.5">
	  <p class="text-sm/6 text-white">
		<strong>Failed</strong> - <span>Please try again</span>
	  </p>
	</div>
  </div>
  