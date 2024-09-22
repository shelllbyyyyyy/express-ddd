FROM node:alpine AS production

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable

WORKDIR /usr/src/app

RUN apk add --no-cache python3 make g++

COPY package*.json pnpm-lock.yaml ./
RUN pnpm install

COPY . .

RUN pnpm build:prod

RUN pnpm prune

CMD ["node", "dist/main"]

