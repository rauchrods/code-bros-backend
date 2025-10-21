# Simple Dockerfile for CodeBros Backend
FROM node:18-alpine

# Install Python, Java, and C++
RUN apk add --no-cache python3 py3-pip openjdk11 g++

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy app code
COPY . .

# Create temp directory
RUN mkdir -p temp

# Expose port
EXPOSE 5000

# Start app
CMD ["npm", "start"]