FROM node:10-alpine

RUN adduser -D -h /bin/bash dockeruser

RUN apt-get install -y software-properties-common
RUN apt-add-repository -y ppa:git-core/ppa
RUN apt-get update

RUN apt-get install -y git man

USER dockeruser
WORKDIR /home/dockeruser

CMD bash