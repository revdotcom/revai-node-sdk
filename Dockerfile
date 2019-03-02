FROM node:10-alpine

RUN useradd -ms /bin/bash dockeruser

USER dockeruser
WORKDIR /home/dockeruser

CMD bash