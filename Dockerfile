FROM debian
MAINTAINER Lukas Boersma <mail@lukas-boersma.com>

COPY . /class-central

RUN apt-get update
RUN apt-get upgrade -y
RUN DEBIAN_FRONTEND=noninteractive apt-get install -y \
      ca-certificates \
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
      php5-mcrypt

RUN rm -f /etc/nginx/sites-enabled/default && \
    cp /class-central/nginx-config /etc/nginx/sites-enabled/class-central && \
    service nginx restart && service php5-fpm restart
RUN echo "CREATE DATABASE symfony" | mysql
RUN mysql symfony < /class-central/extras/cc_db.sql
RUN cd /root && php -r "readfile('https://getcomposer.org/installer');" | php
RUN cp /class-central/app/config/parameters.yml.dist /class-central/app/config/parameters.yml
RUN cd /class-central && php /root/composer.phar install --prefer-source
RUN cd /class-central && php app/console doctrine:migrations:migrate --no-interaction
