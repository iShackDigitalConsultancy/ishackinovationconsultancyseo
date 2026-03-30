FROM node:20-alpine

WORKDIR /app

# Install Chromium for Puppeteer, Python for ML Agent, and curl for uv
RUN apk add --no-cache \
      chromium \
      nss \
      freetype \
      harfbuzz \
      ca-certificates \
      ttf-freefont \
      python3 \
      py3-pip \
      curl

# Install Astral 'uv' globally for hyper-fast Python dependency management
RUN curl -LsSf https://astral.sh/uv/install.sh | sh
ENV PATH="/root/.local/bin:$PATH"

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

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
