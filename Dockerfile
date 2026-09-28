# PyLearn — builds the Vite app, then serves it and the API from one Node process.
# Works on Fly.io, Railway, Koyeb, Render (Docker) or any Node host.

FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# Runtime stage. The server itself has zero dependencies (node:http, node:sqlite,
# node:crypto), so no node_modules are needed here — only package.json, which
# declares "type": "module" for the server's ESM imports.
FROM node:24-alpine
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080
# Keep the SQLite file on a mounted volume so accounts survive redeploys.
ENV PYLEARN_DATA_DIR=/data

COPY package.json ./
COPY server ./server
COPY --from=build /app/dist ./dist

EXPOSE 8080
VOLUME /data
CMD ["node", "server/index.js"]
