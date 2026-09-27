# Stage 1: Build Frontend React with Vite
FROM node:20-alpine AS frontend-builder
WORKDIR /app

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
# Pastikan endpoint API dan Storage menggunakan routing relative Nginx
ENV VITE_API_URL=/api
ENV VITE_STORAGE_URL=/storage
RUN npm run build

# Stage 2: Nginx Web Server
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# Hapus file default nginx
RUN rm -rf ./*

# Copy hasil build frontend
COPY --from=frontend-builder /app/dist ./

# Copy konfigurasi Nginx
COPY docker/web/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
