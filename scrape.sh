#!/bin/bash

php app/console classcentral:scrape --type=add --simulate=N coursera
php app/console classcentral:scrape --type=add --simulate=N edx
php app/console classcentral:scrape --type=add --simulate=N udacity
php app/console classcentral:scrape --type=add --simulate=N futurelearn
php app/console classcentral:scrape --type=add --simulate=N iversity
php app/console classcentral:scrape --type=add --simulate=N open2study
