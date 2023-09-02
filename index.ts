import aws from 'aws-sdk'

aws.config.update({
    region: 'us-west-2',
    accessKeyId: 'AKIA3SQWPZW4XOFAUREH',
    secretAccessKey: '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'
})

const s3 = new aws.S3();

s3.putObject({Bucket:"sarah-test-medium",Key:"images/meme.jpg"},(err,sucsess)=>{
    if (err){
      console.log(err)
    }else{
      console.log(sucsess)
    }
  })