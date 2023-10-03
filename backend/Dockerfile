# Pin Alpine version from list: https://dl-cdn.alpinelinux.org/alpine/
ARG ALPINE_VERSION=3.17
ARG ALPINE_APPEND=v3.17/main

# Specify number of retries for each mirror
ARG MAX_RETRIES=3

# Define base Alpine mirror URLs in attempt order from list: https://dl-cdn.alpinelinux.org/alpine/MIRRORS.txt
ARG BASE_ALPINE_MIRRORS="https://dl-cdn.alpinelinux.org/alpine https://ftp.halifax.rwth-aachen.de/alpine https://uk.alpinelinux.org/alpine"

# Build stage
FROM node:16-alpine$ALPINE_VERSION AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci --only-production

COPY . .
RUN npm run build

# Production stage
FROM node:16-alpine$ALPINE_VERSION

WORKDIR /app

ENV npm_config_cache /home/node/.npm

COPY package*.json ./
RUN npm ci --only-production && npm cache clean --force

COPY --from=build /app .

RUN retries_left=$MAX_RETRIES; \
    for mirror in $ALPINE_MIRRORS; do \
        full_mirror="$mirror/$ALPINE_APPEND"; \
        echo "Trying mirror: $full_mirror"; \
        echo >>/etc/apk/repositories "$full_mirror"; \
        for i in $(seq $retries_left); do \
            echo "Retrying... Attempt $i (Retries Left: $((retries_left - i)))"; \
            if apk add --no-cache bash curl git && \
               curl -1sLf 'https://dl.cloudsmith.io/public/infisical/infisical-cli/setup.alpine.sh' | bash && \
               apk add --no-cache infisical=0.8.1; then \
                break; \
            fi; \
            sleep 10; \
        done; \
        if [ $? -eq 0 ]; then \
            break; \
        fi; \
    done

HEALTHCHECK --interval=10s --timeout=3s --start-period=10s \  
  CMD node healthcheck.js

EXPOSE 4000

CMD ["node", "build/index.js"]