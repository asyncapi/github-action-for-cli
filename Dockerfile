FROM node:16-alpine

RUN apk add --no-cache bash>5.1.16 git>2.42.0

COPY entrypoint.sh /entrypoint.sh

RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]