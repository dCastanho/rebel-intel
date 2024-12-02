<script>
	import {
		getCards,
		keepOnlyCapsAndNumbers,
		recognize,
	} from "../utils/backend";
	import Xmark from "./icons/Xmark.svelte";
	import { cameraState } from "./state.svelte";

	let videoContainer = $state();
	let highlight = $state();
	let video = $state();
	let image = $state("");
	let img = $state();

	export async function startCamera() {
		try {
			const stream = await navigator.mediaDevices.getUserMedia({
				video: {
					width: { ideal: 999999 }, // Request a width of 1920 pixels (Full HD)
					height: { ideal: 999999 }, // Request a height of 1080 pixels (Full HD)
					facingMode: { exact: "environment" },
				},
			});
			video.srcObject = stream;
			cameraState.isActive = true;
		} catch (error) {
			console.error("Error accessing the camera: ", error);
			alert("Could not access the camera.");
		}
	}

	export function stopCamera() {
		cameraState.isActive = false;
		const stream = video.srcObject;
		if (stream) {
			const tracks = stream.getTracks();
			// @ts-ignore
			tracks.forEach((track) => track.stop()); // Stops each track in the stream
			video.srcObject = null; // Clears the video source
		}
	}

	export async function capture() {
		const canvas = document.createElement("canvas");
		const context = canvas.getContext("2d");

		const videoWidth = video.videoWidth;
		const videoHeight = video.videoHeight;

		const videoContainerRect = videoContainer.getBoundingClientRect();
		const scaleX = videoWidth / videoContainerRect.width;
		const scaleY = videoHeight / videoContainerRect.height;

		const highlightRect = highlight.getBoundingClientRect();
		const sectionX =
			(highlightRect.left - videoContainerRect.left) * scaleX;
		const sectionY = (highlightRect.top - videoContainerRect.top) * scaleY;
		const sectionWidth = highlightRect.width * scaleX;
		const sectionHeight = highlightRect.height * scaleY;

		canvas.width = sectionWidth;
		canvas.height = sectionHeight;

		// Draw the highlighted section from the video onto the canvas
		context.drawImage(
			video,
			sectionX,
			sectionY,
			sectionWidth,
			sectionHeight,
			0,
			0,
			canvas.width,
			canvas.height,
		);

		const startTime = performance.now()
		image = canvas.toDataURL("image/png");
		const text = await recognize(image);
		const lines = text
			.split("\n")
			.map((s) => keepOnlyCapsAndNumbers(s).trim())
			.filter((s) => s);
		const ocrTime = performance.now()
		cameraState.profiler.results = lines
		cameraState.profiler.ocr = startTime - ocrTime
		const options = (
			await Promise.all(
				lines.map(async (l) => await getCards(l, cameraState.filter)),
			)
		).flat();
		console.log(options);
		const apiTime = performance.now()
		cameraState.profiler.ocr =  ocrTime - apiTime
		cameraState.currentListOfOptions = options;
	}
</script>

<div
	bind:this={videoContainer}
	class={cameraState.isActive
		? "h-full grow flex flex-col relative p-4"
		: "hidden "}
>
	<video
		bind:this={video}
		autoplay
		playsinline
		class="w-auto object-cover grow h-full"
	></video>
	<div
		bind:this={highlight}
		class="absolute -translate-x-1/2 -translate-y-1/2 w-56 h-8 border-2 border-teal-800 left-1/2 top-1/4 rounded-md z-10"
	></div>
	<button
		class="absolute top-8 right-8 bg-red-400 p-1 rounded-md"
		onclick={stopCamera}
	>
		<Xmark />
	</button>
	<button
		onclick={capture}
		type="button"
		class=" absolute bottom-12 justify-center w-4/5 -translate-x-1/2 left-1/2 inline-flex items-center rounded-md bg-indigo-600 px-8 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
	>
		Scan
	</button>
</div>
