#!/bin/bash

service php5-fpm restart
service mysql restart
service cron restart
service nginx stop

nginx -g "daemon off;"
