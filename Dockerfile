FROM node:lts-alpine AS builder

# Install tooling
RUN apk --no-cache add git python3 make build-base

# Copy the application
RUN mkdir -p /app
COPY . /app
WORKDIR /app

# Install the application dependencies and build the application
RUN npm install
RUN npm run build

# Create the actual image
FROM nginx:stable-alpine

# Copy the build
COPY --from=builder /app/entrypoint.sh /opt/entrypoint.sh
COPY --from=builder /app/dist /usr/share/nginx/html
WORKDIR /usr/share/nginx/html

# Run web server
ENTRYPOINT ["/opt/entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
