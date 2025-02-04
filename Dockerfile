# Use an official Node.js image as the base image
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package.json and package-lock.json to install dependencies first (better layer caching)
COPY package*.json ./

# Copy the .env file before building, so it's available during the build
COPY .env /app/.env

# Install dependencies
RUN npm install

# Copy the rest of the application files
COPY . .

# Build the TypeScript code
RUN npm run build


# ---- Production Image ----
FROM node:18-alpine

WORKDIR /app

# Copy necessary files from the builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

# Copy the .env file manually
COPY .env /app/dist/.env

# Expose the application port
EXPOSE 5050

# Run the server
CMD ["node", "dist/server.js"]
