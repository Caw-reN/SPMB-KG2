#!/bin/sh
set -e

# Pastikan direktori storage dan cache tersedia
mkdir -p /var/www/html/storage/framework/cache/data
mkdir -p /var/www/html/storage/framework/sessions
mkdir -p /var/www/html/storage/framework/views
mkdir -p /var/www/html/storage/logs
mkdir -p /var/www/html/storage/app/public

# Set ownership dan permission
chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache
chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

# Generate symlink storage jika belum ada
if [ ! -L /var/www/html/public/storage ]; then
    php artisan storage:link --force || true
fi

# Jalankan command (php-fpm)
exec "$@"
