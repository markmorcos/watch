FROM node:alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm install

FROM node:alpine AS build
WORKDIR /app
COPY package*.json ./
COPY . .
COPY --from=deps /app/node_modules ./node_modules
RUN npm run build

FROM node:alpine AS final
WORKDIR /app

RUN apk add --no-cache ffmpeg

COPY package*.json ./
COPY --from=build /app/dist ./dist
COPY --from=deps /app/node_modules ./node_modules

EXPOSE 3000

CMD ["npm", "run", "start:prod"]