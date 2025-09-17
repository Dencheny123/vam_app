# 🔧 Руководство по решению проблем CI/CD

## 🧭 Оглавление

1. [Введение в CI/CD](THEORY.md)
2. [Настройка Docker Hub с нуля](DOCKERHUB_SETUP.md)
3. [GitHub Actions для начинающих](GITHUB_ACTIONS_GUIDE.md)
4. [Деплой на Railway шаг за шагом](RAILWAY_DEPLOY.md)
5. [Решение проблем CI/CD](TROUBLESHOOTING.md)
6. [Оптимизация пайплайна](OPTIMIZATION_TIPS.md)
7. [Глоссарий терминов](GLOSSARY.md)
8. [Чеклист настройки](SETUP_CHECKLIST.md)
9. [Первый запуск](FIRST_RUN.md)

## 🚨 Общие проблемы и решения

### 1. Ошибки сборки Docker образов

#### Проблема: `Build failed` при сборке образов

```bash
Error: failed to solve: process "/bin/sh -c npm install" did not complete successfully
```

**Решение:**

1. Проверьте корректность `Dockerfile`:

```dockerfile
# Правильный пример для Node.js
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
```

2. Убедитесь, что все файлы добавлены в репозиторий:

```bash
git add .
git commit -m "Fix missing files"
git push
```

3. Проверьте кэш зависимостей в workflow:

```yaml
- name: Cache node modules
  uses: actions/cache@v3
  with:
    path: node_modules
    key: ${{ runner.os }}-node-${{ hashFiles('package-lock.json') }}
```

#### Проблема: `Out of memory` при сборке

**Решение:** Уменьшите размер образа:

```dockerfile
# Используйте многоступенчатую сборку
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS production
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist
```

### 2. Проблемы аутентификации

#### Проблема: `403 Forbidden` при пуше в Docker Hub

```bash
denied: requested access to the resource is denied
```

**Решение:**

1. Проверьте правильность секретов в GitHub:

   - `DOCKERHUB_USERNAME` - ваш логин Docker Hub
   - `DOCKERHUB_TOKEN` - токен доступа (не пароль!)

2. Убедитесь, что токен имеет права на запись:

   - Зайдите в Docker Hub → Account Settings → Security → Access Tokens
   - Создайте токен с правами `Read, Write, Delete`

3. Проверьте формат тегов:

```yaml
# Правильный формат
tags: ${{ secrets.DOCKERHUB_USERNAME }}/stroyka-client:latest
```

#### Проблема: `401 Unauthorized` при деплое на Railway

**Решение:**

1. Проверьте Railway токен:

```bash
# Проверка токена через curl
curl -H "Authorization: Bearer $RAILWAY_TOKEN" https://api.railway.app/v2/projects
```

2. Обновите токен если истек:
   - Railway → Account → Settings → API Tokens
   - Создайте новый токен и обновите секрет в GitHub

### 3. Ошибки деплоя на Railway

#### Проблема: `Deployment failed` без деталей

**Решение:**

1. Проверьте логи Railway:

```bash
# Через CLI
railway logs

# Или в веб-интерфейсе
# Проект → Deployments → Выберите деплой → View logs
```

2. Проверьте переменные окружения:

```bash
# Проверка всех переменных
railway variables list
```

3. Убедитесь в корректности `railway.toml`:

```toml
[build]
builder = "NIXPACKS"

[deploy]
startCommand = "npm start"

[[services]]
name = "web"
port = 3000
```

#### Проблема: Приложение не запускается после деплоя

**Решение:**

1. Проверьте порты в коде и конфигурации:

```javascript
// server/src/app.ts
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

2. Убедитесь, что Railway правильно определяет сервис:

```toml
[[services]]
name = "web"
port = 3000
```

### 4. Проблемы с кэшированием

#### Проблема: Медленная сборка из-за зависимостей

**Решение:** Оптимизируйте кэширование:

```yaml
- name: Cache node modules
  uses: actions/cache@v3
  with:
    path: |
      client/node_modules
      server/node_modules
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
    restore-keys: |
      ${{ runner.os }}-node-
```

#### Проблема: Устаревший кэш вызывает ошибки

**Решение:** Принудительно очистите кэш:

1. В интерфейсе GitHub: Actions → Cache → Удалите старые кэши
2. Или измените ключ кэширования:

```yaml
key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}-${{ github.sha }}
```

### 5. Проблемы с переменными окружения

#### Проблема: `Undefined variable` в runtime

**Решение:**

1. Проверьте объявление переменных в Railway:

```bash
# Добавление переменной
railway variables set DATABASE_URL=your_connection_string
```

2. Убедитесь в правильности синтаксиса в коде:

```javascript
// Правильно: используйте process.env
const dbUrl = process.env.DATABASE_URL;

// Неправильно: прямое обращение
const dbUrl = DATABASE_URL;
```

3. Проверьте чувствительность к регистру:

```javascript
// Linux/Mac: чувствительно к регистру
process.env.DATABASE_URL !== process.env.database_url;
```

### 6. Ошибки специфичные для Next.js

#### Проблема: `Build optimization failed` в клиенте

**Решение:**

1. Увеличьте память для сборки:

```bash
# В package.json
"build:memory": "NODE_OPTIONS='--max-old-space-size=4096' next build"
```

2. Проверьте статические ресурсы:

```bash
# Убедитесь что public/ папка существует
ls client/public/
```

#### Проблема: `404 Not Found` для статических файлов

**Решение:**

1. Проверьте конфигурацию Next.js:

```javascript
// next.config.js
module.exports = {
  output: 'standalone',
  images: {
    unoptimized: true,
  },
};
```

2. Убедитесь в правильности базового пути:

```javascript
// Для деплоя на поддомене
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
```

### 7. Проблемы с базой данных

#### Проблема: `Database connection failed`

**Решение:**

1. Проверьте строку подключения:

```bash
# Формат для PostgreSQL
postgresql://username:password@host:port/database?schema=public
```

2. Убедитесь, что база данных запущена:

```bash
# Проверка подключения
railway run npx prisma db push
```

3. Обновите миграции:

```bash
railway run npx prisma migrate deploy
```

### 8. Проблемы с доменами и SSL

#### Проблема: `SSL certificate error`

**Решение:**

1. Проверьте настройки домена в Railway:

   - Project → Settings → Domains
   - Убедитесь, что домен привязан правильно

2. Дождитесь выпуска сертификата (может занять до 24 часов)

#### Проблема: `CORS errors` между клиентом и сервером

**Решение:**

1. Настройте CORS на сервере:

```javascript
// server/src/configs/corsConfig.ts
export const corsConfig = {
  origin: ['https://yourdomain.railway.app', 'http://localhost:3000'],
  credentials: true,
};
```

2. Обновите переменные окружения:

```bash
# Для клиента
NEXT_PUBLIC_API_URL=https://your-server.railway.app

# Для сервера
CLIENT_URL=https://your-client.railway.app
```

## 🔍 Диагностика и отладка

### 1. Анализ логов GitHub Actions

```bash
# Поиск ошибок в логах
grep -i "error\|fail\|warning" actions-log.txt

# Просмотр времени выполнения каждого шага
```

**Совет:** Включайте дебаг режим для сложных проблем:

```yaml
- name: Debug info
  run: |
    echo "Current directory: $(pwd)"
    echo "Node version: $(node -v)"
    echo "NPM version: $(npm -v)"
    docker --version
```

### 2. Локальное тестирование workflow

```bash
# Установка act для локального тестирования
npm install -g act

# Запуск workflow локально
act -j build-and-push
```

### 3. Проверка Docker образов локально

```bash
# Сборка образа локально
docker build -f client/Dockerfile -t test-client .

# Запуск контейнера
docker run -p 3000:3000 test-client

# Проверка логов
docker logs <container_id>
```

### 4. Мониторинг ресурсов

```yaml
# Добавьте мониторинг в workflow
- name: Check disk space
  run: df -h

- name: Check memory
  run: free -h
```

## 🚀 Экстренные меры

### 1. Откат деплоя

```bash
# В Railway интерфейсе
# Deployments → Выберите стабильную версию → Redeploy
```

### 2. Временное отключение CI/CD

```yaml
# Добавьте условие для ручного запуска
on:
  workflow_dispatch:
  push:
    branches: [main]
```

### 3. Принудительный пропуск проверок

```bash
# Для экстренных исправлений
git commit --no-verify
git push --no-verify
```

## 📞 Поддержка

### Где искать помощь:

1. **GitHub Actions Docs**: https://docs.github.com/en/actions
2. **Docker Documentation**: https://docs.docker.com/
3. **Railway Documentation**: https://docs.railway.app/
4. **Stack Overflow**: Используйте теги [github-actions], [docker], [railway]

### Ключевые слова для поиска:

- `github actions permission denied`
- `docker build failed`
- `railway deployment failed`
- `environment variables not working`

> 💡 **Важно**: Всегда сначала проверяйте логи полностью перед обращением за помощью. Часто решение находится в последних строках лога.

## 🎯 Чеклист при проблемах

- [ ] Проверить логи GitHub Actions полностью
- [ ] Убедиться в корректности секретов
- [ ] Проверить Dockerfile на ошибки синтаксиса
- [ ] Локально протестировать сборку
- [ ] Проверить квоты и лимиты сервисов
- [ ] Убедиться в наличии всех необходимых файлов

**Время решения большинства проблем**: 15-30 минут при правильной диагностике.

## 📚 Подробные руководства

Каждому аспекту CI/CD посвящен отдельный файл с пошаговыми инструкциями:

### 1. [Теория CI/CD](THEORY.md)

- Основные принципы Continuous Integration
- Разница между CI, CD и CD
- Преимущества автоматизации

### 2. [Настройка Docker Hub](DOCKERHUB_SETUP.md)

- Создание аккаунта
- Генерация токенов доступа
- Создание репозиториев
- Проверка доступа

### 3. [GitHub Actions](GITHUB_ACTIONS_GUIDE.md)

- Структура YAML файлов
- Основные компоненты workflow
- Переменные окружения и секреты
- Просмотр логов и отладка

### 4. [Деплой на Railway](RAILWAY_DEPLOY.md)

- Регистрация и настройка проекта
- Получение API токена
- Конфигурация окружения
- Мониторинг деплоев

### 5. [Решение проблем](TROUBLESHOOTING.md)

- Ошибки сборки образов
- Проблемы аутентификации
- Сбои при деплое
- Оптимизация времени выполнения

### 6. [Оптимизация](OPTIMIZATION_TIPS.md)

- Кэширование зависимостей
- Параллельное выполнение задач
- Многоступенчатые сборки
- Уменьшение размера образов

### 7. [Глоссарий](GLOSSARY.md)

- 50+ терминов CI/CD с пояснениями
- Основные команды Docker
- Ключевые понятия GitHub Actions

### 8. [Чеклист настройки](SETUP_CHECKLIST.md)

- Пошаговая проверка всех компонентов
- Валидация настроек перед запуском
- Быстрая диагностика проблем

### 9. [Первый запуск](FIRST_RUN.md)

- Пошаговое руководство для первого запуска
- Мониторинг выполнения пайплайна
- Проверка результатов и устранение неполадок
