FROM node:20-alpine

WORKDIR /app

# Install dependencies first (layer caching)
COPY package*.json ./
RUN npm install --omit=dev

# Copy source
COPY . .

EXPOSE 5000

# TODO: Switch to non-root user for production
# RUN addgroup -S appgroup && adduser -S appuser -G appgroup
# USER appuser

CMD ["node", "src/server.js"]
