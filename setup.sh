#!/bin/bash
apt-get update
apt-get upgrade -y
DEBIAN_FRONTEND=noninteractive apt-get install -y \
  ca-certificates \
  cron \
  git \
  memcached \
  mysql-client \
  mysql-server \
  nginx \
  php5 \
  php5-fpm \
  php5-intl \
  php5-memcached \
  php5-mysql \
  php5-curl \
  php5-mcrypt \
  php-apc

rm -f /etc/nginx/sites-enabled/default
cp nginx-config /etc/nginx/sites-enabled/class-central

service nginx restart
service php5-fpm restart
service mysql restart

cp cron-scrape /etc/cron.daily/class-central-scrape
chmod +x /etc/cron.daily/class-central-scrape
echo "CREATE DATABASE symfony" | mysql --protocol=TCP --host=127.0.0.1
mysql --protocol=TCP --host=127.0.0.1 symfony < extras/cc_db.sql
cp app/config/parameters.yml.dist app/config/parameters.yml
php -r "readfile('https://getcomposer.org/installer');" | php
php composer.phar install --prefer-source
php app/console doctrine:migrations:migrate --no-interaction
chmod -R a+rw app/cache app/logs
