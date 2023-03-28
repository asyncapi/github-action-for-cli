FROM node:16 as builder

COPY ./ /app
WORKDIR /app

RUN npm install

FROM node:16-alpine

COPY --from=builder /app ./

ENTRYPOINT [ "node", "/lib/index.js" ]
