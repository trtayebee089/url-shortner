FROM composer:2 AS vendor
WORKDIR /app
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-interaction --prefer-dist --no-scripts --no-progress

FROM php:8.3-fpm-alpine
RUN apk add --no-cache icu-dev libxml2-dev linux-headers $PHPIZE_DEPS \
    && docker-php-ext-install intl pdo_mysql pcntl bcmath opcache \
    && pecl install redis \
    && docker-php-ext-enable redis \
    && apk del $PHPIZE_DEPS
WORKDIR /var/www/backend
COPY --from=vendor /app/vendor ./vendor
COPY . .
RUN php artisan package:discover --ansi && chown -R www-data:www-data storage bootstrap/cache
USER www-data
HEALTHCHECK --interval=30s --timeout=5s --retries=3 CMD php-fpm -t || exit 1
CMD ["php-fpm", "-F"]
