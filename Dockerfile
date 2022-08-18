FROM node:16 as builder

COPY ./ /app
WORKDIR /app

RUN npm install --omit=dev && npm run package

FROM node:16-alpine

# We need to copy entire node modules as some dependencies (@npmcli/run-script) cannot be packaged
# and need to be used by dist as external dependency
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

ENTRYPOINT [ "node", "/dist/index.js" ]
