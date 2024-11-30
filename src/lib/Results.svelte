<script>
    import { downloadCSV } from "../utils/backend";
    import { cameraState } from "./state.svelte";

	const {activateCamera } = $props()

	const items = $derived( Object.values(cameraState.exported) )

</script>


<div class="w-full">
	<div class="flex h-12 p-2 my-4 gap-x-4 flex-row w-full justify-between">
		<button onclick={activateCamera} type="button" class="inline-flex items-center rounded-md bg-indigo-600 px-8 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
			Start
		</button>
		<button onclick={() => downloadCSV(items)} type="button" class="inline-flex items-center rounded-md bg-indigo-600 px-8 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
			Export 
		</button>
	</div>
	<table class="min-w-full divide-y divide-gray-300">
		<thead>
			<tr>
				<th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Set</th>
				<th scope="col" class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">Name</th>
				<th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Number</th>
				<th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Count</th>	
			</tr>
		</thead>
		<tbody class="divide-y divide-gray-200">
			{#each items as result}
			<tr>
				<td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{result.set}</td>
				<td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{result.name}</td>
				<td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{result.number}</td>
				<td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{result.count}</td>
			</tr>
			{/each}
			
			
			<!-- More people... -->
		</tbody>
	</table>
</div>