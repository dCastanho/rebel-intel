<script>
    import Xmark from "./icons/Xmark.svelte";
	import { cameraState } from "./state.svelte";

	function push(option) {
		cameraState.currentListOfOptions = []
		const key = [option.set, option.number, option.hyperspace, option.foil]
		if(cameraState.exported[key]){
			cameraState.exported[key].count = cameraState.exported[key].count + 1
		}else {
			option.count = 1
			cameraState.exported[key] = option
		}
 	}

	function cancel() {
		cameraState.currentListOfOptions = []
	}
</script>

<div class={cameraState.currentListOfOptions.length != 0
	? "absolute top-0 left-0 w-full h-full"
	: "hidden"}>
	<div
		class="relative z-20"
		aria-labelledby="modal-title"
		role="dialog"
		aria-modal="true"
	>
		<!--
			Background backdrop, show/hide based on modal state.
			
			Entering: "ease-out duration-300"
			From: "opacity-0"
			To: "opacity-100"
			Leaving: "ease-in duration-200"
			From: "opacity-100"
			To: "opacity-0"
			-->
		<div
			class="fixed inset-0 bg-gray-500/75 transition-opacity"
			aria-hidden="true"
		></div>

		<!--
				Modal panel, show/hide based on modal state.
				
				Entering: "ease-out duration-300"
				From: "opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
				To: "opacity-100 translate-y-0 sm:scale-100"
				Leaving: "ease-in duration-200"
				From: "opacity-100 translate-y-0 sm:scale-100"
				To: "opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
				-->
				<div
				class="relative rounded-lg bg-white p-4 shadow-xl transition-all left-1/2 -translate-x-1/2 w-4/5 top-12"
		>
		<div class="w-full h-full flex flex-row flex-wrap">
			{#each cameraState.currentListOfOptions as option}
			<button onclick={() => push(option)} class="w-1/2 p-1">
				<img src={option.card}   />
			</button>
			{/each}
			<button
		class="absolute -top-2 -right-2 bg-red-400 p-1 rounded-md"
		onclick={cancel}
	><Xmark />
</button>
		</div>
		</div>
	</div>
</div>
