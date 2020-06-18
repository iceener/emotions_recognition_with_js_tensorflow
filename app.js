const video = document.querySelector('.js-video');
const canvas = document.querySelector('.js-overlay');
const result = document.querySelector('.js-emotion');
const displaySize = { width: video.width, height: video.height };

const emotions = {
	'neutral': 'Neutralny 😐',
	'surprised': 'Zaskoczony 😮',
	'disgusted': 'Zniesmaczony',
	'fearful': 'Wystraszony 😨',
	'sad': 'Smutny 🙁',
	'angry': 'Zły 😠',
	'happy': 'Wesoły 😃',
}

function startVideo() {
	navigator.getUserMedia({ video: true },
		(stream) => {
			video.srcObject = stream
		},
		(err) => console.error(err)
	);
}

// startVideo();

Promise.all([
	faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
	faceapi.nets.faceExpressionNet.loadFromUri('/models'),
]).then(startVideo)

video.addEventListener('play', detectFace);

function showExpression({ expressions }) {
	const arr = Object.entries(expressions);
	const max = arr.reduce((acc, current) => {
		return acc[1] > current[1] ? acc : current;
	}, [])
	result.textContent = emotions[max[0]];
}

async function detectFace() {
	const options = new faceapi.TinyFaceDetectorOptions();
	faceapi.matchDimensions(canvas, displaySize);

	setInterval(async () => {
		const detections = await faceapi.detectAllFaces(video, options).withFaceExpressions();
		const resizedDetections = faceapi.resizeResults(detections, displaySize);
		canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
		faceapi.draw.drawDetections(canvas, resizedDetections);
		
		if (detections[0]) {
			showExpression(detections[0])
		}
	}, 100);
}
