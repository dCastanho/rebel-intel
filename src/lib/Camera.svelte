<script>
	import {
		getCards,
		gibberish,
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
	let canvas = $state();

	export async function startCamera() {
		try {
			const stream = await navigator.mediaDevices.getUserMedia({
				video: {
					width: { ideal: 999999 }, // Request a width of 1920 pixels (Full HD)
					height: { ideal: 999999 }, // Request a height of 1080 pixels (Full HD)
					facingMode: { ideal: "environment" },
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


	function adaptiveThreshold(grayscale, width, height, blockSize, c) {
    const halfBlockSize = Math.floor(blockSize / 2);
    const result = new Uint8Array(grayscale.length);

    // Integral image for fast local sum computation
    const integral = new Uint32Array((width + 1) * (height + 1));

    // Compute integral image
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const index = y * width + x;
            const gray = grayscale[index];
            const integralIndex = (y + 1) * (width + 1) + (x + 1);
            integral[integralIndex] =
                gray +
                integral[integralIndex - 1] +
                integral[integralIndex - (width + 1)] -
                integral[integralIndex - (width + 2)];
        }
    }

    // Perform thresholding using the integral image
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const x1 = Math.max(0, x - halfBlockSize);
            const x2 = Math.min(width - 1, x + halfBlockSize);
            const y1 = Math.max(0, y - halfBlockSize);
            const y2 = Math.min(height - 1, y + halfBlockSize);

            const sum =
                integral[(y2 + 1) * (width + 1) + (x2 + 1)] -
                integral[(y1) * (width + 1) + (x2 + 1)] -
                integral[(y2 + 1) * (width + 1) + (x1)] +
                integral[(y1) * (width + 1) + (x1)];

            const area = (x2 - x1 + 1) * (y2 - y1 + 1);
            const mean = sum / area;

            const index = y * width + x;
            result[index] = grayscale[index] <= mean - c ? 0 : 255; // Black or white
        }
    }

    return result;
}



	function cropToText(canvas) {
		const width = canvas.width;
		const height = canvas.height;
		const context = canvas.getContext('2d')
		const imageData = context.getImageData(0, 0, width, height);
		const data = imageData.data;

		let minX = width,
			maxX = 0,
			minY = height,
			maxY = 0;

		// Find the bounding box of non-white pixels
		for (let y = 0; y < height; y++) {
			for (let x = 0; x < width; x++) {
				const index = (y * width + x) * 4;
				const r = data[index],
					g = data[index + 1],
					b = data[index + 2];
				if (r < 255 || g < 255 || b < 255) {
					// Non-white pixel
					if (x < minX) minX = x;
					if (x > maxX) maxX = x;
					if (y < minY) minY = y;
					if (y > maxY) maxY = y;
				}
			}
		}

		// Define cropping dimensions
		const cropWidth = maxX - minX + 1;
		const cropHeight = maxY - minY + 1;

		// Create a new canvas for the cropped image
		const croppedCanvas = document.createElement("canvas");
		croppedCanvas.width = cropWidth;
		croppedCanvas.height = cropHeight;
		const croppedContext = croppedCanvas.getContext("2d");

		// Draw the cropped region onto the new canvas
		croppedContext.drawImage(
			canvas,
			minX,
			minY,
			cropWidth,
			cropHeight,
			0,
			0,
			cropWidth,
			cropHeight,
		);

		return croppedCanvas;
	}

	function preprocessImage(canvas) {
		// Load image into canvas
		const width = canvas.width;
		const height = canvas.height;
		const context = canvas.getContext("2d");
		const imageData = context.getImageData(0, 0, width, height);
		const data = imageData.data;

		// Convert to grayscale
		for (let i = 0; i < data.length; i += 4) {
			const gray =
				0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
			data[i] = data[i + 1] = data[i + 2] = gray; // Set R, G, B to gray
		}
		context.putImageData(imageData, 0, 0);
		// Apply Adaptive Thresholding
		const blockSize = 15; // Size of the local region for threshold calculation
		const c = 10; // Constant to subtract from the mean to fine-tune thresholding
		const grayscale = new Uint8Array(width * height);

		// Extract grayscale values into a 1D array
		for (let y = 0; y < height; y++) {
			for (let x = 0; x < width; x++) {
				const index = (y * width + x) * 4;
				grayscale[y * width + x] = data[index];
			}
		}

		// Apply adaptive threshold
		const thresholded = adaptiveThreshold(
			grayscale,
			width,
			height,
			blockSize,
			c,
		);

		// Map back to image data
		for (let y = 0; y < height; y++) {
			for (let x = 0; x < width; x++) {
				const index = (y * width + x) * 4;
				const value = thresholded[y * width + x];
				data[index] = data[index + 1] = data[index + 2] = value; // Black or white
			}
		}
		context.putImageData(imageData, 0, 0);

		return canvas;
	}

	export async function capture() {
		cameraState.error = undefined;
		console.time("Capturing")
		//const canvas = document.createElement("canvas");
		//const canvas = document.getElementById("canvas-teste");
		const context = canvas.getContext("2d");

		const videoWidth = video.videoWidth;
		const videoHeight = video.videoHeight;

		//! Highlight
		const videoContainerRect = videoContainer.getBoundingClientRect();
		const scaleX = videoWidth / videoContainerRect.width;
		const scaleY = videoHeight / videoContainerRect.height;
		const highlightRect = highlight.getBoundingClientRect();
		const sectionX =
			(highlightRect.left - videoContainerRect.left) * scaleX;
		const sectionY = (highlightRect.top - videoContainerRect.top) * scaleY;
		const sectionWidth = highlightRect.width * scaleX;
		const sectionHeight = highlightRect.height * scaleY;

		canvas.width = sectionWidth
		canvas.height = sectionHeight

		// const sourceX = 0;
		// const sourceY = 0; // Start at the top
		// const sourceWidth = videoWidth;
		// const sourceHeight = videoHeight / 3; // Only the top half

		// Adjust the canvas size to match the source dimensions
		// canvas.width = sourceWidth;
		// canvas.height = sourceHeight;

		// Draw the top half of the video frame onto the canvas at native resolution
		// context.drawImage(
		// 	video,
		// 	sourceX,
		// 	sourceY,
		// 	sourceWidth,
		// 	sourceHeight, // Source rectangle
		// 	0,
		// 	0,
		// 	sourceWidth,
		// 	sourceHeight, // Destination rectangle matches source
		// );

		
		//const cropped = cropToText(canvas);             

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
		//context.drawImage(video, 0, 0, canvas.width, canvas.height);
		console.timeEnd("Capturing")
		console.time("Preprocessing")
		preprocessImage(canvas);
		console.timeEnd("Preprocessing")

		
		image = canvas.toDataURL("image/png");
		console.time("OCR")
		const text = await recognize(image);
		console.timeEnd("OCR")
		console.time("Getting")
		const lines = text
			.split("\n")
			.map((s) => gibberish(keepOnlyCapsAndNumbers(s).trim()))
			.filter((s) => s);
		const options = (
			await Promise.all(
				lines.map(async (l) => await getCards(l, cameraState.filter)),
			)
		).flat();
		console.timeEnd("Getting")
		cameraState.currentListOfOptions = options;
		cameraState.results = options;
		if (!options || options.length == 0) {
			cameraState.error = true;
		}
	}
</script>

<div
	bind:this={videoContainer}
	class={cameraState.isActive
		? "h-full grow flex flex-col relative p-4"
		: "hidden "}
>
	<canvas class="absolute top-0 right-0 z-50 w-screen" bind:this={canvas}></canvas>
	<div class="relative">
		<video
			bind:this={video}
			autoplay
			playsinline
			class="w-auto object-cover grow h-full relative"
		>
	</video>
	<div bind:this={highlight} class="absolute -translate-x-1/2 -translate-y-1/2 w-64 h-16 border-2 border-teal-800 left-1/2 top-1/4 rounded-md z-10">		
	</div>
	</div>
	
	<button
		class="absolute z-50 top-8 right-8 bg-red-400 p-1 rounded-md"
		onclick={stopCamera}
	>
		<Xmark />
	</button>
	<button
		onclick={capture}
		type="button"
		class="z-50 absolute bottom-12 justify-center w-4/5 -translate-x-1/2 left-1/2 inline-flex items-center rounded-md bg-indigo-600 px-8 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
	>
		Start
	</button>
</div>
