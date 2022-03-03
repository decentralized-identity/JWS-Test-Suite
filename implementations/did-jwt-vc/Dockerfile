
FROM node:14.15.3 as build

USER node
WORKDIR /home/node

COPY package*.json ./
COPY --chown=node:node . .

RUN npm install --production

FROM node:14.15.3-alpine3.10 as cli

WORKDIR /home/node

COPY --from=build /home/node/node_modules ./node_modules
COPY --from=build /home/node/package.json ./package.json
COPY --from=build /home/node/cli.js ./cli.js
COPY --from=build /home/node/did-jwt-vc-runner.js ./did-jwt-vc-runner.js
COPY --from=build /home/node/bin.js ./bin.js

# disable warning related to mattr libraries.
ENV NODE_NO_WARNINGS=1

ENTRYPOINT [ "node", "bin.js" ]
