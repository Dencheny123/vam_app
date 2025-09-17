# Этап зависимостей
FROM node:24-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production --frozen-lockfile

# Этап сборки
FROM node:24-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Создаём .env.production
RUN echo "NODE_ENV=production" > .env.production \
    && echo "DATABASE_URL=mysql://u1770310_admin:Chernichkin_123@31.31.198.5:3310/u1770310_Denis_Condicioner" >> .env.production \
    && echo "PORT=3001" >> .env.production \
    && echo "ACCESS_TOKEN_SECRET=asdgagdgagadggewqghqhfhfhqahq" >> .env.production \
    && echo "REFRESH_TOKEN_SECRET=asdgagrweqhqchqfhfhqerfqfhqdh" >> .env.production \
    && echo "CLIENT_URL=http://localhost:4000" >> .env.production \
    && echo "SMTP_PASS=AYajNgOYFQ9f5gP4JriV" >> .env.production \
    && echo "SMTP_USER=madewlove@mail.ru" >> .env.production \
    && echo "SMTP_FROM=madewlove@mail.ru" >> .env.production \
    && echo "SMTP_ADMIN=juniorletto03092001@gmail.com" >> .env.production
# Генерируем Prisma клиент
RUN npm install -g prisma
RUN npx prisma generate
# Убедимся, что TypeScript установлен и скомпилируем
RUN npm install typescript --no-save && npx tsc
RUN cp -r src/generated dist/generated

# Финальный этап
FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/public ./public
COPY --from=builder /app/.env.production ./.env.production
EXPOSE 3001
CMD ["node", "./dist/app.js"]
