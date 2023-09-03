import express from 'express'
import aws from 'aws-sdk'
import multer from 'multer';
import fs from 'fs'
import ObjectRouter from './routes/ObjectLable.js'
import celebrityRouter from './routes/celebrityFaces.js'
import textRouter from './routes/text.js'
import db from './db/dataSource.js'
import "dotenv/config"

const PORT = 3000;
const app = express()


app.use(express.json())
app.use('/ObjectLable', ObjectRouter)
app.use('/celebrityFaces', celebrityRouter)
app.use('/textDetection', textRouter)

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

aws.config.update({
    region: 'us-west-2',
    accessKeyId: process.env.AccessKey,
    secretAccessKey: process.env.SecretAccessKey
})