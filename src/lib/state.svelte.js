export let cameraState = $state( {
	isActive : false,
	currentListOfOptions : [],
	error: false, 
	exported : {},
	filter: 'All',
	profiler: {
		indexed_result: [],
		results: [],
		ocr: 0,
		query: 0,
	}
} );