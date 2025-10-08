# Base image
FROM node:18-alpine

# Set working directory
WORKDIR /usr/src

# Copy package files first for caching
COPY package.json package-lock.json ./

# Install Node.js dependencies
RUN npm ci --only=production

# Copy application source code
COPY . .

# Expose app port
EXPOSE 3001

# Start the app
CMD ["npm", "start"]
