import aws from 'aws-sdk'
import express from 'express'
import multer from 'multer';
import fs from 'fs'
import rekognition from 'aws-sdk/clients/rekognition.js';
import { Any } from 'typeorm';
import { Logger } from '../db/entities/logger.js';

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, 'uploads/');
    },
    filename: (req, file, callback) => {
        callback(null, Date.now() + '-' + file.originalname)
    }
});
const upload = multer({ storage });

const router = express.Router()
router.post('/', upload.single('file'), async (req, res) => {
    if (!req.file) {
        res.status(500).send("Failed Upload File!");
        return;
    }
    const imagePath = 'uploads/dad.jpeg';
    const imageBuffer = fs.readFileSync(imagePath);
    const params = {
        Image: {
            Bytes: imageBuffer,
        },
    };
    let dataLable;
    const rekognition = new aws.Rekognition();

    try {
        const data = await rekognition.detectLabels(params).promise();
        console.log('Detected labels:', data.Labels);
        const dataLabels = data.Labels?.map(label => label.Name); // Extract label names

        const newLogger = new Logger();
        newLogger.result = await JSON.stringify(dataLabels);
        newLogger.imgPath = imagePath;
        await newLogger.save()

        res.status(201).json({ labels: dataLabels });
    } catch (err) {
        console.error('Error detecting labels:', err);
        res.status(500).send("Failed to detect labels");
    }

});


export default router
