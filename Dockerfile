FROM node:10-alpine

RUN adduser -D -h /bin/bash dockeruser

USER dockeruser
WORKDIR /home/dockeruser

CMD bash