import aws from 'aws-sdk';
import express from 'express';
import multer from 'multer';
import fs from 'fs';
import { Logger } from '../db/entities/logger.js';

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, 'uploads/');
    },
    filename: (req, file, callback) => {
        callback(null, Date.now() + '-' + file.originalname);
    },
});
const upload = multer({ storage });

const router = express.Router();

router.post('/', upload.single('file'), async (req, res) => {
    if (!req.file) {
        res.status(500).send("Failed Upload File!");
        return;
    }

    const imagePath = req.file.path; // Use the uploaded image path
    const imageBuffer = fs.readFileSync(imagePath);

    const rekognition = new aws.Rekognition();

    const params = {
        Image: {
            Bytes: imageBuffer,
        },
    };

    try {
        const data = await rekognition.detectText(params).promise();
        console.log('Detected text:', data.TextDetections);

        const detectedText = data.TextDetections?.map((textDetection) => ({
            detectedText: textDetection.DetectedText,
            confidence: textDetection.Confidence,
            boundingBox: textDetection.Geometry?.BoundingBox,
        }));

        const newLogger = new Logger();
        newLogger.result = await JSON.stringify(detectedText);
        newLogger.imgPath = imagePath;
        await newLogger.save()

        res.status(201).json({ detectedText });
    } catch (err) {
        console.error('Error detecting text:', err);
        res.status(500).send("Failed to detect text");
    }
});

export default router;