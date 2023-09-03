import aws from 'aws-sdk'
import express from 'express'
import multer from 'multer';
import fs from 'fs'
import rekognition from 'aws-sdk/clients/rekognition.js';
import { Any } from 'typeorm';
import { Logger } from '../db/entities/logger.js';
import { AnyArn } from 'aws-sdk/clients/groundstation.js';

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
// router.post('/', upload.single('file'), async (req, res) => {
//     if (!req.file) {
//         res.status(500).send("Failed Upload File!");
//         return;
//     }
//     const imagePath = req.file.path;
//     const imageBuffer = fs.readFileSync(imagePath);
//     const params = {
//         Image: {
//             Bytes: imageBuffer,
//         },
//     };
//     const rekognition = new aws.Rekognition();

//     try {
//         const data = await rekognition.detectLabels(params).promise();
//         console.log('Detected labels:', data.Labels);
//         const dataLabels = data.Labels?.map(label => label.Name); // Extract label names

//         const newLogger = new Logger();
//         newLogger.result = await JSON.stringify(dataLabels);
//         newLogger.imgPath = imagePath;

//         const bucketName = 'sarah-test-medium';
//         const s3 = new aws.S3({ region: 'eu-west-2' });
//         const generateFileUrl = async (bucketName: any, fileName: any) => {
//             const params = {
//                 Bucket: bucketName,
//                 Key: fileName,
//             };

//             try {
//                 const url = await s3.getSignedUrlPromise('getObject', params);
//                 return url;
//             } catch (error) {
//                 console.error(`Error generating file URL: ${error}`);
//                 return null;
//             }
//         };

//         generateFileUrl(bucketName, imagePath)
//             .then(async (fileUrl) => {
//                 if (fileUrl) {
//                     newLogger.fileURL = fileUrl;

//                     const uploadParams = {
//                         Bucket: bucketName,
//                         Key: imagePath,
//                         Body: imageBuffer,
//                     };

//                     s3.upload(uploadParams, (err: any, data: any) => {
//                         if (err) {
//                             console.error(`Error uploading file to S3: ${err}`);
//                         } else {
//                             console.log(`File uploaded to S3 at ${data.Location}`);
//                             // Save the Logger entity with the S3 URL
//                             newLogger.fileURL = data.Location;
//                             newLogger.save().then(() => {
//                                 res.status(201).json({ labels: dataLabels });
//                             }).catch((error) => {
//                                 console.error(`Error saving Logger entity: ${error}`);
//                                 res.status(500).send("Failed to save Logger entity");
//                             });
//                         }
//                     });
//                 }
//             })
//     } catch (err) {
//         console.error('Error detecting labels:', err);
//         res.status(500).send("Failed to detect labels");
//     }

// });

router.post('/', upload.single('file'), async (req, res) => {
    if (!req.file) {
        res.status(500).send("Failed Upload File!");
        return;
    }
    const imagePath = req.file.path;

    const bucketName = 'sarah-test-medium';
    const s3 = new aws.S3({ region: 'eu-west-2' });

    // Define the S3 object params
    const s3Params = {
        Bucket: bucketName,
        Key: imagePath,
    };

    try {
        // Use S3.getObject to fetch the image data from S3
        const s3Data = await s3.getObject(s3Params).promise();
        const imageBuffer = s3Data.Body;

        const params = {
            Image: {
                Bytes: imageBuffer,
            },
        };

        const rekognition = new aws.Rekognition();

        const data = await rekognition.detectLabels(params).promise();
        console.log('Detected labels:', data.Labels);
        const dataLabels = data.Labels?.map(label => label.Name); // Extract label names

        const newLogger = new Logger();
        newLogger.result = await JSON.stringify(dataLabels);
        newLogger.imgPath = imagePath;

        const generateFileUrl = async (bucketName:any, fileName:AnyArn) => {
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

                    s3.upload(uploadParams, (err:any, data:any) => {
                        if (err) {
                            console.error(`Error uploading file to S3: ${err}`);
                        } else {
                            console.log(`File uploaded to S3 at ${data.Location}`);
                            // Save the Logger entity with the S3 URL
                            newLogger.fileURL = data.Location;
                            newLogger.save().then(() => {
                                res.status(201).json({ labels: dataLabels });
                            }).catch((error) => {
                                console.error(`Error saving Logger entity: ${error}`);
                                res.status(500).send("Failed to save Logger entity");
                            });
                        }
                    });
                }
            })
    } catch (err) {
        console.error('Error detecting labels:', err);
        res.status(500).send("Failed to detect labels");
    }
});


export default router
