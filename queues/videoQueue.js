const Queue = require("bull");
const videoQueue = new Queue("video-encoding", {
  redis: { port: 6379, host: "redis" }
});
const models = require("../models");
const ffmpeg = require("fluent-ffmpeg");
const fs = require("fs");

const convertVideo = (path, format) => {
  const fileName = path.replace(/\.[^/.]+$/, "");
  const convertedFilePath = `${fileName}_${+new Date()}.${format}`;
  return new Promise((resolve, reject) => {
    ffmpeg(`${__dirname}/../files/${path}`)
      .setFfmpegPath(process.env.FFMPEG_PATH)
      .setFfprobePath(process.env.FFPROBE_PATH)
      .size('720x?')
      .videoCodec('libx264')
      .videoBitrate('768k')
      .audioCodec('libfaac')
      .audioBitrate('96k')
      .audioChannels(2)
      .toFormat(format)
      .on("start", commandLine => {
        console.log(`Conversion started with COMMANDS: ${commandLine}`);
      })
      .on("error", (err, stdout, stderr) => {
        console.log(err, stdout, stderr);
        reject(err);
      })
      .on("end", (stdout, stderr) => {
        console.log('Conversion finished successfully', stdout, stderr);
        resolve({ convertedFilePath });
      })
      .saveToFile(`${__dirname}/../files/${convertedFilePath}`);
  });
};

videoQueue.process(async job => {
  const { id, path, outputFormat } = job.data;
  try {
    const conversions = await models.VideoConversion.findAll({ where: { id } });
    const conv = conversions[0];
    if (conv.status == "cancelled") {
      return Promise.resolve();
    }
    const pathObj = await convertVideo(path, outputFormat);
    const convertedFilePath = pathObj.convertedFilePath;
    const conversion = await models.VideoConversion.update(
      { convertedFilePath, status: "done" },
      {
        where: { id }
      }
    );
    Promise.resolve(conversion);
  } catch (error) {
    Promise.reject(error);
  }
});

export { videoQueue };
