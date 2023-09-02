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
    callback(null,file.originalname);
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
    const data = await rekognition.recognizeCelebrities(params).promise();
    console.log('Detected celebrities:', data.CelebrityFaces);
    
    const celebrities = data.CelebrityFaces?.map((celebrity) => ({
      name: celebrity.Name,
      confidence: celebrity.MatchConfidence,
    }));

    const newLogger= new Logger();
    newLogger.result= await JSON.stringify(celebrities);
    newLogger.imgPath=imagePath;
    await newLogger.save()

    res.status(201).json({ celebrities });
  } catch (err) {
    console.error('Error recognizing celebrities:', err);
    res.status(500).send("Failed to recognize celebrities");
  }
});

export default router;
