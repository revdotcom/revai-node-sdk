FROM node:10-alpine

RUN adduser -D -h /bin/bash dockeruser

RUN apk add --no-cache git

USER dockeruser
WORKDIR /home/dockeruser

CMD bash