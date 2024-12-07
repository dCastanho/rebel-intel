export let cameraState = $state( {
	isActive : false,
	running : false,
	currentListOfOptions : [],
	error: "", 
	exported : {},
	filter: 'All',
	profiler: {
		indexed_result: [],
		results: [],
		ocr: 0,
		query: 0,
	}
} );