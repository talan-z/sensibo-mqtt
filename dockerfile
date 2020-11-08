FROM node:alpine3.12

# copy crontabs for root user
#COPY config/cronjobs /etc/crontabs/root



RUN mkdir -p /script/

COPY config.yml /script/config.yml
COPY main.js /script/main.js
COPY package*.json /script/

ENV CONFIG_PATH=/script/config.yml

RUN cd /script && npm install

EXPOSE 9902

#RUN apk --no-cache add curl

CMD cd /script && node main.js
#RUN apk --no-cache add jq


# start crond with log level 8 in foreground, output to stderr
#CMD ["crond", "-f", "-d", "8"]