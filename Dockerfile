# -----------------
# Stage 1: deps（只安装依赖，Docker cache 更稳定）
FROM node:18-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# -----------------
# Stage 2: build
FROM node:18-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 不要 COPY .env 到镜像中；Next.js 会自动读取环境变量（如 NEXT_PUBLIC_）注入构建产物
RUN npm run build

# -----------------
# Stage 3: runtime
FROM node:18-alpine AS runner
WORKDIR /app

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000
CMD ["npm", "start"]
