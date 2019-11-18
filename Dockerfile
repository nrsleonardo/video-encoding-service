FROM node:10.12.0
VOLUME ["/root"]
ADD setup-ffmpeg.sh /root
WORKDIR /usr/src/app
RUN /root/setup-ffmpeg.sh
COPY package*.json ./
COPY . .
EXPOSE 8899