FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev for build)
RUN npm ci

# Copy source code
COPY . .

# Build the frontend
RUN npm run build

# Expose the port
EXPOSE 3001

# Start the server
CMD ["node", "server.js"]
