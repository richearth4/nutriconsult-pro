FROM node:lts-alpine

WORKDIR /app

# Copy package files first to leverage cache
COPY package*.json ./

# Install production dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Expose the port
EXPOSE 5001

# Start the application
CMD ["node", "server.js"]
