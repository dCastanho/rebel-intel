export let cameraState = $state( {
	isActive : false,
	currentListOfOptions : [],
	exported : {},
	filter: 'All',
	profiler: {
		indexed_result: [],
		results: [],
		ocr: 0,
		query: 0,
	}
} );