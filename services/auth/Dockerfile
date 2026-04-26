FROM oven/bun:alpine

WORKDIR /app

COPY package.json bun.lockb* ./
RUN bun install --production

COPY src ./src

EXPOSE 3000

CMD ["bun", "run", "start"]
