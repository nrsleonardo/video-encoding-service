"use strict";
module.exports = (sequelize, DataTypes) => {
  const VideoConversion = sequelize.define(
    "VideoConversion",
    {
      filePath: DataTypes.STRING,
      convertedFilePath: DataTypes.STRING,
      outputFormat: {
        type: DataTypes.STRING,
        defaultValue: "mp4"
      },
      status: {
        type: DataTypes.ENUM("pending", "done", "cancelled"),
        defaultValue: "pending"
      }
    },
    {}
  );
  VideoConversion.associate = function(models) {
    // associations can be defined here
  };
  return VideoConversion;
};