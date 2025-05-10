# Stage 1: Build the React application
FROM node:18-alpine AS builder
LABEL stage="react-builder"
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock)
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application code
COPY . .

# Set the API URL during build time (can be overridden by docker-compose environment)
ARG REACT_APP_API_BASE_URL
ENV REACT_APP_API_BASE_URL=${REACT_APP_API_BASE_URL}

# Build the application
RUN npm run build

# Stage 2: Serve the built application using Nginx
FROM nginx:1.25-alpine
WORKDIR /usr/share/nginx/html
LABEL stage="nginx-server"

# Remove default Nginx static assets
RUN rm -rf ./*

# Copy static assets from builder stage
COPY --from=builder /app/build .

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 for Nginx
EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s \
  CMD curl --fail http://localhost/ || exit 1

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
