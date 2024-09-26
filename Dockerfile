###################
# LOCAL
###################

FROM node:alpine3.20 AS development

RUN mkdir /app && chown node:node /app
WORKDIR /app

USER node
COPY --chown=node:node package*.json .
COPY --chown=node:node prisma ./prisma/

RUN npm ci

COPY --chown=node:node . .

EXPOSE 3000

###################
# BUILD PARA PRODUCTION
###################

FROM node:alpine3.20 AS build

WORKDIR /app

COPY --chown=node:node package*.json ./

COPY --chown=node:node prisma ./prisma/

COPY --chown=node:node --from=development /app/node_modules ./node_modules

COPY --chown=node:node . .

RUN npm run build

ENV NODE_ENV production

RUN npm ci --only=production && npm cache clean --force

RUN npx prisma generate

USER node

###################
# PRODUCTION
###################

FROM node:alpine3.20 AS production

COPY --chown=node:node --from=build /app/node_modules ./node_modules
COPY --chown=node:node --from=build /app/dist ./dist
COPY --chown=node:node --from=build /app/package*.json ./
COPY --chown=node:node --from=build /app/prisma ./prisma

CMD [ "npm", "run", "start:prod" ]
