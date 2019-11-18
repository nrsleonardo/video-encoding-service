# Video transcoding server
A NodeJS Express service to transcode video files

## Features
- Accepts any video input with auto specs detection (file type, content-type, codecs, containers, size, compressor, colors, dimensions - only works with no protected/encrypted files)
- Creates a high compatibility .mp4 file output with good/balanced video and audio quality, dimension and file size
- Queue/stack sequential background jobs based in Bull + Redis
- Internal super simple sqlite database to keep the conversions status and history
- Uses very useful libs (Babel, Nodemon, CORS, fluent-ffmpeg, Multer, Dotenv, Sequelize)
- Based on widely used FFmpeg media encoder lib (using fluent-ffmpeg as a NodeJS wrapper)
- Promise based callbacks to ensure reliability

## Prerequisites
- Docker server
- Node & npm
- Some free disk space

## Running
- Clone repo
- `cd video-service` + `npm i`
- `docker-compose up --build`
- Default port is 8899

## API
- `GET localhost:8899/conversions/` - Returns all conversions saved in DB (JSON)
```js
{
    "id": <Int>,
    "filePath": "files/1574097740389_file_example_MOV_1280_1_4MB.mov",
    "convertedFilePath": "1574097740389_file_example_MOV_1280_1_4MB_1574100138423.mp4",
    "outputFormat": "mp4",
    "status": "pending",
    "createdAt": "2019-11-18T17:22:20.477Z",
    "updatedAt": "2019-11-18T18:02:31.874Z"
}
```
<br>

- `POST localhost:8899/conversions/` - Send the video file to the server and creates a new job
```http
POST /conversions/ HTTP/1.1
Host: localhost:8899
Content-Type: multipart/form-data;
Accept: */*
Cache-Control: no-cache
Content-Disposition: form-data; name="video"; filename="<FILE_TO_UPLOAD_PATH>"
Content-Disposition: form-data; name="outputFormat"; VALUE="<OUTPUT_FORMAT>" // Default .mp4
```
<br>

- `GET localhost:8899/conversions/start/:id` - Start the job/video encoding of given id (Returns a processing status object with a HTTP 200 if queue and video encoding process were created successfully)
```js
{
    "id": <given_id>,
    "filePath": "files/1574097740389_file_example_MOV_1280_1_4MB.mov",
    "convertedFilePath": "1574097740389_file_example_MOV_1280_1_4MB_1574100138423.mp4",
    "outputFormat": "mp4",
    "status": "processing",
    "createdAt": "2019-11-18T17:22:20.477Z",
    "updatedAt": "2019-11-18T18:02:31.874Z"
}
```
<br>

- `DELETE localhost:8899/conversions/:id` - Deletes the job with the given ID along with the original and converted file of the job
<br>

- `PUT localhost:8899/conversions/cancel/:id` - Sets job status to cancelled (keeps the original file)
<br>

## TODO
- [service] Change the upload behavior to a URL source reading (from S3)
- [service] Integrate the service with AWS S3 to read the video attachment and replace it with the converted media (lowest service and user impact)
- [mobile] Handle media incompatible callback from video player to show "Video is processing" message to user