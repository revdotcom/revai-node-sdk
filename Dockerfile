FROM node:10-alpine

RUN adduser -u 1001 -ms /bin/bash dockeruser

USER dockeruser
WORKDIR /home/dockeruser

CMD bash