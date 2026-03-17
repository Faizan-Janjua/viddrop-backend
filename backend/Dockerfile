FROM node:18-bullseye

# Install ffmpeg + python
RUN apt-get update && apt-get install -y ffmpeg python3 python3-pip

# Install yt-dlp
RUN pip3 install yt-dlp

# App directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install node dependencies
RUN npm install

# Copy rest of code
COPY . .

# Expose port
EXPOSE 3000

# Start server
CMD ["node", "server.js"]
