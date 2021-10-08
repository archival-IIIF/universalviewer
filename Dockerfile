FROM node:lts-alpine AS builder

# Install tooling
RUN apk --no-cache add git python3 make build-base

# Install global NPM tooling
RUN npm install grunt-cli -g

# Copy the application
RUN mkdir -p /app
COPY . /app
WORKDIR /app

# Install the application dependencies and build the application
RUN npm install
RUN grunt build --dist

# Add IISH specific files
RUN mv /app/iish/* /app/examples/uv

# Create the actual image
FROM nginx:stable-alpine

# Copy the build
COPY --from=builder /app/examples/uv /usr/share/nginx/html
WORKDIR /usr/share/nginx/html

# Expose the web server port
EXPOSE 80

# Run web server
CMD ["nginx", "-g", "daemon off;"]
