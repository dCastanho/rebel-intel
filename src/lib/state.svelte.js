export let cameraState = $state( {
	isActive : false,
	currentListOfOptions : [],
	exported : {},
	filter: 'All',
	profiler: {
		results: [],
		ocr: 0,
		query: 0,
	}
} );