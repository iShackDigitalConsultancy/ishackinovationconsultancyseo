FROM node:20-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy the rest of the backend code
COPY . .

# Expose the Railway port
EXPOSE 3000
EXPOSE 3001
EXPOSE 8080

# Start the Node server
CMD ["node", "server.js"]
