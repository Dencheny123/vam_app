# 🚄 Деплой на Railway: Полное руководство

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

## 🎯 Введение

Railway - это modern PaaS (Platform as a Service), который упрощает деплой и управление приложениями. Он идеально подходит для CI/CD благодаря:

- 🚀 Автоматическим деплоям из Git
- ⚡ Быстрой настройке окружений
- 🔧 Простому управлению переменными
- 📊 Встроенному мониторингу

## 📋 Предварительные требования

- [ ] Аккаунт на [Railway](https://railway.app/)
- [ ] GitHub репозиторий с настроенным CI/CD
- [ ] Docker образы в Docker Hub
- [ ] Railway токен (будет создан далее)

## 🔧 Шаг 1: Создание проекта в Railway

### 1.1 Регистрация и вход

1. Перейдите на [railway.app](https://railway.app/)
2. Войдите через GitHub (рекомендуется)
3. Подтвердите права доступа

### 1.2 Создание проекта

```bash
# Через веб-интерфейс:
# - Нажмите "New Project"
# - Выберите "Empty Project"
# - Назовите проект "Stroyka"
```

### 1.3 Привязка GitHub репозитория

1. В проекте: Settings → Git → Connect Repository
2. Выберите ваш репозиторий STROYKA
3. Подтвердите подключение

## 🔑 Шаг 2: Настройка API токена

### 2.1 Генерация токена

1. Перейдите: Account → Settings → API Tokens
2. Нажмите "New Token"
3. Назовите токен: "STROYKA-CICD"
4. Установите права: **Deployments:read, Deployments:write**
5. Скопируйте токен (он покажется только один раз!)

### 2.2 Добавление токена в GitHub Secrets

1. В GitHub: Repository → Settings → Secrets → Actions
2. Добавьте новый секрет: `RAILWAY_TOKEN`
3. Вставьте скопированный токен
4. Сохраните

## 🏗️ Шаг 3: Настройка сервисов

### 3.1 Создание сервиса для клиента (Next.js)

```bash
# В Railway интерфейсе:
# - Нажмите "New Service"
# - Выберите "GitHub Repository"
# - Выберите ветку "main"
# - Укажите корневую папку "client"
```

### 3.2 Создание сервиса для сервера (Node.js)

```bash
# Повторите для сервера:
# - "New Service" → "GitHub Repository"
# - Ветка "main"
# - Корневая папка "server"
```

### 3.3 Настройка переменных окружения

**Для клиента (Next.js):**

```bash
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://your-server.railway.app
PORT=3000
```

**Для сервера (Node.js):**

```bash
NODE_ENV=production
DATABASE_URL=your_database_connection_string
CLIENT_URL=https://your-client.railway.app
PORT=3001
```

## ⚙️ Шаг 4: Конфигурация Railway

### 4.1 Файл `railway.toml` (опционально)

Создайте в корне репозитория:

```toml
[build]
builder = "NIXPACKS"

[deploy]
startCommand = "npm start"

[[services]]
name = "web"
port = 3000

[[services]]
name = "api"
port = 3001
```

### 4.2 Настройка доменов

1. В каждом сервисе: Settings → Domains
2. Добавьте custom domain (если нужно)
3. Railway автоматически настроит SSL

## 🔗 Шаг 5: Интеграция с GitHub Actions

### 5.1 Пример workflow для деплоя

Добавьте в ваш `.github/workflows/docker-ci-cd.yml`:

```yaml
- name: Deploy to Railway
  uses: railwayapp/action@v1
  with:
    service: your-service-name
    environment: production
  env:
    RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
```

### 5.2 Полная интеграция для нашего проекта

```yaml
deploy-client:
  needs: build-and-push
  runs-on: ubuntu-latest
  steps:
    - name: Deploy Client to Railway
      uses: railwayapp/action@v1
      with:
        service: stroyka-client
        environment: production
      env:
        RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}

deploy-server:
  needs: build-and-push
  runs-on: ubuntu-latest
  steps:
    - name: Deploy Server to Railway
      uses: railwayapp/action@v1
      with:
        service: stroyka-server
        environment: production
      env:
        RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
```

## 🚀 Шаг 6: Первый деплой

### 6.1 Запуск вручную

```bash
# Через Railway CLI (если установлен)
railway deploy

# Или через веб-интерфейс
# - Проект → Deployments → Deploy Manually
```

### 6.2 Автоматический деплой через CI/CD

1. Сделайте push в main ветку
2. GitHub Actions соберет образы
3. Автоматически запустится деплой на Railway
4. Следите за статусом в Railway Dashboard

## 📊 Шаг 7: Мониторинг деплоев

### 7.1 Просмотр статуса

1. **Railway Dashboard**: Проект → Deployments
2. **Логи**: Кликните на деплой → View Logs
3. **Метрики**: Проект → Metrics

### 7.2 Ключевые метрики для отслеживания

- ✅ **Status**: Deployed / Failed
- ⏱️ **Deployment Time**: < 5 минут
- 📦 **Image Size**: < 150MB
- 🟢 **Health Checks**: Passing

## 🐛 Шаг 8: Решение 常见 проблем

### 8.1 `Deployment Failed`

**Причины**:

- Неправильные переменные окружения
- Ошибки в коде приложения
- Недостаточно ресурсов

**Решение**:

1. Проверьте логи деплоя
2. Убедитесь в корректности переменных
3. Проверьте локальную сборку

### 8.2 `Environment Variables Missing`

**Решение**:

```bash
# Добавьте все необходимые переменные
railway variables set NODE_ENV=production
railway variables set DATABASE_URL=your_connection_string
```

### 8.3 `Port Already in Use`

**Решение**:

```javascript
// В коде сервера используйте process.env.PORT
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

## 🔧 Шаг 9: Продвинутая настройка

### 9.1 Настройка базы данных

```bash
# Добавьте базу данных в Railway
railway add postgresql

# Автоматически получите DATABASE_URL
railway variables
```

### 9.2 Custom domains

```bash
# Добавьте свой домен
railway domains add yourdomain.com

# Настройте DNS записи
# CNAME: yourdomain.com → railway.app
```

### 9.3 Environment variables по окружениям

```bash
# Разные переменные для development/production
railway variables set NODE_ENV=production --environment production
railway variables set NODE_ENV=development --environment development
```

## 📈 Шаг 10: Оптимизация деплоев

### 10.1 Ускорение деплоев

```yaml
# В railway.toml
[build]
builder = "NIXPACKS"
buildCommand = "npm run build"
```

### 10.2 Кэширование зависимостей

```yaml
# Для Node.js приложений
[build]
cache = true
cachePaths = ["node_modules", ".npm"]
```

### 10.3 Health checks

```yaml
[[services]]
name = "web"
port = 3000
healthcheckPath = "/api/health"
healthcheckTimeout = 100
```

## 🛡️ Шаг 11: Безопасность

### 11.1 Управление доступом

1. **Team Members**: Settings → Team
2. **Permissions**: Read/Write/Admin
3. **Audit Logs**: Settings → Audit Log

### 11.2 Rotation токенов

1. Регулярно обновляйте Railway токен
2. Обновляйте секрет в GitHub
3. Старые токены автоматически деактивируются

### 11.3 Environment isolation

```bash
# Создайте отдельные окружения
railway environment create staging
railway environment create production

# Деплой в конкретное окружение
railway deploy --environment staging
```

## 📊 Шаг 12: Мониторинг и аналитика

### 12.1 Встроенные метрики Railway

- **CPU Usage**: Использование процессора
- **Memory Usage**: Использование памяти
- **Network I/O**: Сетевой трафик
- **Deployment History**: История деплоев

### 12.2 Логирование

```bash
# Просмотр логов в реальном времени
railway logs

# Поиск по логам
railway logs --search "error"

# Логи за определенный период
railway logs --since 1h
```

### 12.3 Интеграция с мониторингом

```yaml
# Добавьте оповещения в Slack/Discord
[notifications]
slack = "https://hooks.slack.com/services/..."
discord = "https://discord.com/api/webhooks/..."
```

## 💡 Шаг 13: Best Practices

### 13.1 Для продакшена

- [ ] Используйте production окружение
- [ ] Настройте custom domain с SSL
- [ ] Включите авто-скалирование
- [ ] Настройте мониторинг и алерты

### 13.2 Для разработки

- [ ] Используйте отдельное development окружение
- [ ] Настройте автоматические деплои из dev ветки
- [ ] Используйте feature flags для новых функциональностей

### 13.3 Рекомендации по стоимости

- **Start**: Бесплатный тариф (до $5 в месяц)
- **Growth**: $20+/месяц (больше ресурсов)
- **Enterprise**: Контакт с sales

## 🚀 Шаг 14: Миграция с других платформ

### 14.1 С Heroku

```bash
# Установите Railway CLI
npm install -g @railway/cli

# Мигрируйте приложение
railway login
railway init
railway deploy
```

### 14.2 С VPS/RDS

1. Экспортируйте данные базы данных
2. Импортируйте в Railway PostgreSQL
3. Обновите connection string
4. Деплойте приложение

## 🆘 Шаг 15: Получение помощи

### 15.1 Официальная документация

- [Railway Docs](https://docs.railway.app/)
- [API Reference](https://docs.railway.app/reference/api)
- [CLI Reference](https://docs.railway.app/reference/cli)

### 15.2 Сообщество

- [Discord](https://discord.gg/railway)
- [GitHub Discussions](https://github.com/railwayapp/railway/discussions)
- [Twitter](https://twitter.com/railway)

### 15.3 Поддержка

- **Email**: support@railway.app
- **Status Page**: https://status.railway.app/
- **Issue Tracker**: https://github.com/railwayapp/railway/issues

## 🎯 Итоги

**Вы успешно настроили:**

- ✅ Автоматические деплои из GitHub
- ✅ Отдельные сервисы для клиента и сервера
- ✅ Переменные окружения и конфигурацию
- ✅ Мониторинг и логирование
- ✅ Production-ready инфраструктуру

**Теперь при каждом пуше в main:**

1. GitHub Actions соберет Docker образы
2. Образы опубликуются в Docker Hub
3. Railway автоматически деплоит новую версию
4. Приложение становится доступным пользователям

> 🚀 **Поздравляем!** Ваше приложение теперь развернуто на modern PaaS платформе с полным CI/CD пайплайном!

---

_Это руководство является частью комплексной документации CI/CD для проекта STROYKA. Обновляйте его при изменении процесса деплоя._

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
