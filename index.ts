import express from 'express'
import aws from 'aws-sdk'
import multer from 'multer';
import fs from 'fs'
import ObjectRouter from './routes/ObjectLable.js'
import celebrityRouter from './routes/celebrityFaces.js'
import textRouter from './routes/text.js'
import db from './db/dataSource.js'

aws.config.update({
    region: 'us-west-2',
    accessKeyId: 'AKIA3SQWPZW4XOFAUREH',
    secretAccessKey: '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'
})


const PORT = 3000;
const app = express()


app.use(express.json())
app.use('/ObjectLable',ObjectRouter)
app.use('/celebrityFaces',celebrityRouter)
app.use('/textDetection',textRouter)

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, 'uploads/');
    },
    filename: (req, file, callback) => {
        callback(null, file.originalname)
    }
});
const upload = multer({ storage });



app.listen(PORT, () => {
    console.log(`App is running and Listening on port ${PORT}`);
    db.initialize()
});

   
// app.post('/upload', upload.single('file'), async (req, res) => {
//     if (!req.file) {
//         return res.status(500).send("Failed to upload file!");
//     }

//     const params = {
//         Image: {
//             Bytes: req.file.buffer, // Use the buffer from the uploaded file
//         },
//     };

//     try {
//         const data = await rekognition.detectLabels(params).promise();
//         console.log('Detected labels:', data.Labels);
//         const dataLabels = data.Labels.map(label => label.Name); // Extract label names
//         res.status(201).json({ labels: dataLabels });
//     } catch (err) {
//         console.error('Error detecting labels:', err);
//         res.status(500).send("Failed to detect labels");
//     }
// });








//   app.get('/file', (req:any, res) => {
//     const fileName = req.query.name?.toString() || '';
//     try {
//       const data = fs.readFileSync('uploads/' + fileName, 'utf-8');
//       const JSONData = JSON.parse(data) as any[];
//       console.log("-----------------------");
//       console.log(JSONData[0].author);
//       console.log("-----------------------");
//       res.send(JSONData);
//     } catch (error) {
//       console.error(error);
//       res.status(500).send("Something went wrong");
//     }
//   });




// const s3 = new aws.S3();

// const rekognition = new aws.Rekognition();

// const params = {
//     Image: {
//         S3Object: {
//             Bucket: 'sarah-test-medium',
//             Name: 'images/meme.jpg',
//         },
//     },
// };

// rekognition.detectFaces(params, (err, data) => {
//     if (err) console.error(err);
//     else console.log(data);
// });