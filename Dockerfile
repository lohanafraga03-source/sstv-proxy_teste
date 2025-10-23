FROM node:20-slim

RUN apt-get update && \
    apt-get install -y wget ca-certificates fonts-liberation libx11-xcb1 libxcomposite1 libasound2 libatk1.0-0 libatk-bridge2.0-0 libcups2 libgbm1 libgtk-3-0 libnss3 libxss1 libxrandr2 libexpat1 && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app
COPY package.json package-lock.json* ./
RUN npm install --production
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]
