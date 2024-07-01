import {FaceDetector, FilesetResolver, ImageClassifier} from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0";
    
class emotion_ai {
    vision = FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm");
    faceDetector = FaceDetector.createFromOptions(
        this.vision,
        {
            baseOptions: {
                modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite",
                delegate: "GPU"
            },
            runningMode: "IMAGE"
        }
    );

    imageClassifier = ImageClassifier.createFromOptions(
        this.vision,
        {
            baseOptions: {
                modelAssetPath: "https://idriz-hax.github.io/model.tflite",
                delegate: "GPU"
            },
            maxResults: 1,
            runningMode: "IMAGE"
        }
    );


    async detectFace(image) {
        if (!this.faceDetector || !this.imageClassifier) {
            console.log("Wait for face detector to load!");
            return;
        }
        console.log("Finding Faces...");  

        let faces = this.faceDetector.detect(image);
        console.log(`Found ${faces.detections.length} Faces!`);
        return faces;
    }


    grayScale = (context) => {
        const imageData = context.getImageData(0, 0, 48, 48);
        const pixelData = imageData.data;

        for (let i = 0; i < pixelData.length; i += 4) {
            const avgPx = (pixelData[i] + pixelData[i + 1] + pixelData[i + 2]) / 3;
            pixelData[i] = avgPx;
            pixelData[i + 1] = avgPx;
            pixelData[i + 2] = avgPx;
        }
        context.putImageData(imageData, 0, 0);
    };


    async selectFace(faces, id) {
        if (faces.length >= 0) {
            const img = document.getElementById('uploaded-image');
            const boxDetails = faces.detections[id].boundingBox;
            const canvas = document.createElement('emotion_in_box');
            const context = canvas.getContext('2d');

            canvas.width = 48;
            canvas.height = 48;

            context.drawImage(img, boxDetails.originX, boxDetails.originY, boxDetails.width, boxDetails.height, 0, 0, 48, 48);
            const imageData = ctx.getImageData(0, 0, width, height);
            const data = imageData.data;

            for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];

                const grey = 0.3 * r + 0.59 * g + 0.11 * b;
                data[i] = data[i + 1] = data[i + 2] = grey;
            }

            this.findEmotion(imageData);
        }
    }


    async findEmotion(image) {
        console.log(`Determining emotion...`);
        const imageClassifierResult = this.imageClassifier.classify(image);

        if (imageClassifierResult.classifications.length > 0) {
            const prediction = imageClassifierResult.classifications[0].categories[0];
            const predictionText = `Predicted Emotion: ${prediction.categoryName} (${(prediction.score * 100).toFixed(2)}% certainty)`;

            return predictionText;
        } else {
            console.log(`None`);
        }
        
    }
}