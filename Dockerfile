FROM debian
MAINTAINER Lukas Boersma <mail@lukas-boersma.com>

COPY . /class-central

RUN cd /class-central && ./setup.sh
ENTRYPOINT cd /class-central && ./run.sh
