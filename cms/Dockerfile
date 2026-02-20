FROM node:20-alpine AS build

RUN apk update && apk add --no-cache \
    build-base gcc autoconf automake \
    zlib-dev libpng-dev vips-dev git

ENV NODE_ENV=production
WORKDIR /opt/

COPY package.json ./
RUN npm install --omit=dev

ENV PATH=/opt/node_modules/.bin:$PATH
WORKDIR /opt/app
COPY . .
RUN npm run build

FROM node:20-alpine
RUN apk add --no-cache vips-dev

ENV NODE_ENV=production
WORKDIR /opt/
COPY --from=build /opt/node_modules ./node_modules

WORKDIR /opt/app
COPY --from=build /opt/app ./

ENV PATH=/opt/node_modules/.bin:$PATH

RUN chown -R node:node /opt/app
USER node

EXPOSE 1337
CMD ["npm", "start"]
