# Руководство по деплою монолитного приложения на Railway

## Подготовка к деплою

### 1. Настройка переменных окружения в GitHub Secrets

Перед сборкой установите следующие секреты в настройках GitHub репозитория:

| Секрет | Описание | Пример значения |
|--------|----------|-----------------|
| `DATABASE_URL` | MySQL connection string | `mysql://user:password@host:port/database` |
| `ACCESS_TOKEN_SECRET` | Секрет для JWT токенов | `your-secret-key-here` |
| `REFRESH_TOKEN_SECRET` | Секрет для refresh токенов | `your-refresh-secret-key` |
| `SMTP_PASS` | Пароль SMTP | `your-smtp-password` |
| `SMTP_USER` | Email SMTP пользователя | `your-email@example.com` |
| `SMTP_FROM` | Email отправителя | `your-email@example.com` |
| `SMTP_ADMIN` | Email администратора | `admin@example.com` |

### 2. Сборка монолитного образа локально

```bash
docker build -f Dockerfile.monolith -t dencheny123/stroyka-monolith:latest .
```

### 3. Тестирование локально

```bash
docker run -p 80:80 \
  -e DATABASE_URL="your-database-url" \
  -e ACCESS_TOKEN_SECRET="your-secret" \
  -e REFRESH_TOKEN_SECRET="your-refresh-secret" \
  -e SMTP_USER="your-email" \
  -e SMTP_PASS="your-password" \
  -e SMTP_FROM="your-email" \
  -e SMTP_ADMIN="admin-email" \
  dencheny123/stroyka-monolith:latest
```

### 4. Деплой на Railway

#### Вариант A: Через Docker Hub

1. Залогиньтесь в Docker Hub:
```bash
docker login
```

2. Запушите образ в Docker Hub:
```bash
docker tag dencheny123/stroyka-monolith:latest dencheny123/stroyka-monolith:latest
docker push dencheny123/stroyka-monolith:latest
```

3. На Railway создайте новый сервис и укажите Docker образ:
   - `dencheny123/stroyka-monolith:latest`

#### Вариант B: Прямой деплой из GitHub

1. Подключите ваш GitHub репозиторий к Railway
2. Railway автоматически обнаружит CI/CD пайплайн
3. Установите переменные окружения в панели Railway

### 5. Переменные окружения для Railway

Установите те же переменные, что и в GitHub Secrets, в панели Railway:

- `DATABASE_URL`
- `ACCESS_TOKEN_SECRET` 
- `REFRESH_TOKEN_SECRET`
- `SMTP_PASS`
- `SMTP_USER`
- `SMTP_FROM`
- `SMTP_ADMIN`

### 6. Портовая конфигурация

Приложение использует один порт через Nginx:
- **Порт 80** - Nginx reverse proxy
  - API запросы (`/api/*`) → сервер на порту 3001
  - Все остальные запросы → клиент на порту 4000
  - Статические файлы (`/uploads/*`) → серверная директория

Railway автоматически назначит публичный URL для порта 80.

## Архитектура приложения

Монолитный контейнер запускает три процесса через Nginx:
1. **Nginx** - порт 80, reverse proxy и статические файлы
2. **Node.js сервер** - порт 3001, обработка API запросов
3. **Next.js клиент** - порт 4000, фронтенд приложение

Nginx маршрутизирует запросы:
- `/api/*` → Express.js сервер (3001)
- `/uploads/*` → статические файлы сервера
- `/*` → Next.js клиент (4000)

## Мониторинг и логи

- Логи сервера: выводятся в stdout контейнера
- Логи клиента: выводятся в stdout контейнера  
- Railway предоставляет встроенный просмотр логов

## Обновление приложения

1. Соберите новый образ с обновлениями
2. Запушите в Docker Hub
3. Перезапустите сервис на Railway

```bash
# Сборка и пуш обновлений
docker build -f Dockerfile.monolith -t dencheny123/stroyka-monolith:latest .
docker push dencheny123/stroyka-monolith:latest

# На Railway перезапустите сервис или обновите образ
```

## Решение проблем

### Проблема: Ошибки подключения к базе данных
**Решение:** Проверьте корректность `DATABASE_URL` в переменных окружения

### Проблема: JWT ошибки
**Решение:** Убедитесь что `ACCESS_TOKEN_SECRET` и `REFRESH_TOKEN_SECRET` установлены

### Проблема: Ошибки отправки email
**Решение:** Проверьте SMTP настройки в переменных окружения

### Проблема: Порт недоступен
**Решение:** Убедитесь что Railway правильно пробросил порт 80

### Проблема: Nginx не запускается
**Решение:** Проверьте конфигурацию Nginx в файле `nginx.monolith.conf`

### Проблема: Маршрутизация не работает
**Решение:** Убедитесь что сервер и клиент запущены на портах 3001 и 4000 соответственно

## Безопасность

- Никогда не коммитьте секретные ключи в репозиторий
- Используйте GitHub Secrets для хранения чувствительных данных
- Регулярно обновляйте секретные ключи
- Используйте HTTPS для всех соединений