<script>
    import CameraIcon from "./icons/CameraIcon.svelte";
	import { cameraState } from "./state.svelte";

	let { activateCamera } = $props();

</script>

<div class="text-center justify-self-center" >
	<CameraIcon />
	<h3 class="mt-2 text-sm font-semibold text-gray-900">Start Scanning</h3>
	<p class="mt-1 text-sm text-gray-500">Click the button bellow to boot up the camera</p>
	<div class="mt-6">
	  <button onclick={activateCamera} type="button" class="inline-flex items-center rounded-md bg-indigo-600 px-8 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
		Start
	  </button>
	</div>
  </div>