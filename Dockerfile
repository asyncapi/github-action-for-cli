FROM node:18-alpine

# Create a non-root user
RUN addgroup -S myuser && adduser -S myuser -G myuser

RUN apk add --no-cache bash>5.1.16 git>2.42.0

# Installing latest released npm package
RUN npm install --ignore-scripts -g @asyncapi/cli

COPY entrypoint.sh /entrypoint.sh

# Make the bash file executable
RUN chmod +x /entrypoint.sh

# Commented for now because of non-root user can't write to the /github/workspace
# # Switch to the non-root user
# USER myuser

ENTRYPOINT ["/entrypoint.sh"]