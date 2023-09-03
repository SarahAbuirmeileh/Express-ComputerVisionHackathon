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
    callback(null, file.originalname);
  },
});
const upload = multer({ storage });

const router = express.Router();

router.post('/', upload.single('file'), async (req, res) => {
  if (!req.file) {
    res.status(500).send("Failed Upload File!");
    return;
  }

  const imagePath = req.file.path;
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

    const newLogger = new Logger();
    newLogger.result = await JSON.stringify(celebrities);
    newLogger.imgPath = imagePath;
    const bucketName = 'sarah-test-medium';

    const s3 = new aws.S3({ region: 'eu-west-2' });
    const generateFileUrl = async (bucketName: any, fileName: any) => {
      const params = {
        Bucket: bucketName,
        Key: fileName,
      };

      try {
        const url = await s3.getSignedUrlPromise('getObject', params);
        return url;
      } catch (error) {
        console.error(`Error generating file URL: ${error}`);
        return null;
      }
    };

    generateFileUrl(bucketName, imagePath)
    .then(async (fileUrl) => {
        if (fileUrl) {
            newLogger.fileURL = fileUrl;

            const uploadParams = {
                Bucket: bucketName,
                Key: imagePath,
                Body: imageBuffer,
            };

            s3.upload(uploadParams, (err: any, data: any) => {
                if (err) {
                    console.error(`Error uploading file to S3: ${err}`);
                } else {
                    console.log(`File uploaded to S3 at ${data.Location}`);
                    newLogger.fileURL = data.Location;
                    newLogger.save().then(() => {
                        res.status(201).json({ labels: data });
                    }).catch((error) => {
                        console.error(`Error saving Logger entity: ${error}`);
                        res.status(500).send("Failed to save Logger entity");
                    });
                }
            });
        }
    })
  } catch (err) {
    console.error('Error recognizing celebrities:', err);
    res.status(500).send("Failed to recognize celebrities");
  }
});

export default router;
