FROM node:18

WORKDIR /app

COPY . .

RUN apt-get update && apt-get install -y ffmpeg python3 python3-pip

RUN pip3 install yt-dlp

RUN npm install

EXPOSE 3000

CMD ["node", "server.js"]
