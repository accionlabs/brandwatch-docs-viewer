# Base image
FROM node:18-alpine
 
# Set working directory
WORKDIR /usr/src
 
# Copy package files first for caching
COPY package.json package-lock.json ./
 
# Prevent Puppeteer from downloading Chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
 
# Install Chromium and required dependencies
RUN apk update && apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    udev \
    bash \
    --repository=http://dl-cdn.alpinelinux.org/alpine/edge/community \
    --repository=http://dl-cdn.alpinelinux.org/alpine/edge/main
 
# Install Node.js dependencies
RUN npm install
 
# Copy application source code
COPY . .
 
# Build your app (if you have a build step)
RUN npm run build
 
# Expose app port
EXPOSE 3001
 
# Start the app
CMD ["npm", "start"]
