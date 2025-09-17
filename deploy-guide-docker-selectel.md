# Деплой на Selectel, HTTPS, Vite (frontend) и Express (backend)

1. Перейти на https://hub.docker.com/ (создать учётную запись, если нет или зайти под учётной записью github)
2. https://hub.docker.com/settings/security создать `Access Token`
3. В терминале выполнить `docker login --username=[имя пользователя]`
4. Вместо пароля ввести `Access Token`
5. Создать репозиторий на Docker Hub

## Контейниризация клиенсткой части приложения

### 2.1 Создание Dockerfile для клиента

Создайте файл `Dockerfile` в папке `client/`:

```dockerfile
# Этап сборки
FROM node:22.0.0-alpine AS builder

WORKDIR /app

# Копируем файлы зависимостей
COPY package*.json ./

# Устанавливаем зависимости
RUN npm ci

# Копируем исходный код
COPY . .

# Принимаем переменные окружения для сборки
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Собираем приложение
RUN npm run build

# Этап production
FROM nginx:alpine

# Копируем собранное приложение
COPY --from=builder /app/dist /usr/share/nginx/html

# Копируем конфигурацию nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Открываем порт
EXPOSE 80

# Запускаем nginx
CMD ["nginx", "-g", "daemon off;"]
```

### 2.2 Создание nginx.conf для клиента

Создайте файл `nginx.conf` в папке `client/`:

```
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # API запросы - проксируем на сервер
    location /api {
        proxy_pass http://app-server:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket соединения - проксируем на сервер (тот же порт 3000)
    location /socket.io {
        proxy_pass http://app-server:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Обработка React Router
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Кэширование статических файлов
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 2.3 Создание .dockerignore для клиента

Создайте файл `.dockerignore` в папке `client/`:

```plaintext
node_modules
dist
.git
.gitignore
README.md
.env
.env.local
.env.development
.env.production
.env.example
```

### 2.4 Сборка и пуш клиентского образа

```bash
# Переходим в папку клиента
cd client

# Собираем образ
docker build . -t myproject:1.0
   - если билд происходит на MacOs M1, то нужно добавить флаг `--platform linux/amd64`,
    например `docker build . -t myproject:1.0 --platform linux/amd64`

# Пушим в DockerHub
Добавить tag к образу: docker tag [имя образа]:[версия] [имя пользователя]/[имя репозитория]:[имя тэга]
Например: docker tag myproject:1.0 myusername/myrepo:client-1.0
Отправляем образ в DockerHub
docker push [имя пользователя]/[имя репозитория]:[имя тэга]
Например:
docker push ВАШ_DOCKERHUB_ЛОГИН/your-app-name:client-1.0
```

---

### Контейнеризация серверной части приложения

1. Прописать отлов ошибок `try/catch` на каждом эндпоинте сервера, обработать все ошибки.
2. Добавить в `.gitignore` на сервере всего, чего не хватает в списке:

```
node_modules/
dist/
.env
```

3. Прописать скрипты (подготовка БД и запуск проекта) в package.json:

```json
{
  "db:setup": "NODE_ENV=production sequelize db:create && NODE_ENV=production sequelize db:migrate && NODE_ENV=production sequelize db:seed:all",
  "db:setup:prod": "NODE_ENV=production npx sequelize db:migrate",
  "start": "NODE_ENV=production node src/app.js"
}
```

5. В корневой папке сервера создать файл `.dockerignore` и прописать туда:

```
node_modules
.git
.gitignore
README.md
.env
.env.local
.env.development
.env.production
logs
*.log
```

6. В корневой папке сервера создать файл `Dockerfile` и описать образ. Например, так:

```Dockerfile
FROM node:22-alpine3.19
WORKDIR /app
COPY package*.json ./
COPY . .
EXPOSE 3000 3001
RUN npm ci --omit=dev
CMD ["npm", "start"]
```

7. В корне сервера выполнить `docker build . -t [имя образа]:[версия]` и затем проверить
   наличие созданного образа через `docker images`

   1. например, на api сервере `docker build . -t myproject:server-1.0`
   2. если билд происходит на MacOs M1, то нужно добавить флаг `--platform linux/amd64`,
      например `docker build . -t myproject:1.0 --platform linux/amd64`

      # Пушим в DockerHub

   3. Добавить tag к образу: docker tag [имя образа]:[версия] [имя пользователя]/[имя репозитория]:[имя тэга]
      Например: 
      ```bash
      docker tag myproject:server-1.0 myusername/myrepo:server-1.0
      ```

8. Отправляем образ в DockerHub
   docker push [имя пользователя]/[имя репозитория]:[имя тэга]
   Например:  
   docker push ВАШ*DOCKERHUB*ЛОГИН/your-app-name:server-1.0

## Selectel

1. Перейти на сайт https://selectel.ru/ и зарегистрировать новый аккаунт
2. Подтвердить на почте, заполнить необходимые данные (ФИО, телефон)
3. Нажимаем на баланс аккаунт -> Активировать промокод
4. Переходим в "Облачная платформа" -> "Серверы" -> Создать сервер
   1. Если внизу написано пополнить баланс, то выходим из аккаунта и перезаходим заново
5. Настраиваем конфигурацию по желанию. Рекомендуемые настройки:
   1. OS: Ubuntu 20.04 LTS
   2. 1 vCPU, 1 GB RAM
   3. Память: Базовый SSD 8 GB (зависит от вашего приложения)
   4. Сеть: подсеть -> Новый публичный IP-адрес
6. Сохраняем пароль к root пользователю в безопасном месте

## Domain

8. После создания сервера копируем публичный IP, переходим на https://freedns.afraid.org/
   и регистрируемся там для получения доменого имени 3го уровня
   1. Во время регистрации поле userID это никнейм
   2. После регистрации подтверждаем почту
9. Переходим в раздел `Subdomains` и создаём новый субдомен
10. Выбираем `type A`
11. Прописываем желаемый субдомен
12. Вставляем внешний IP из Selectel
13. Можно пропинговать домен. Команды `ping [домен]` и `ping [твой ip]` должны работать
    одинаково

## Настройка виртуального сервера

1. Открываем терминал и подключаемся через SSH `ssh root@[внешний ip адрес]`, вводим yes чтобы добавить IP сервера в разрешённые и вводим пароль root пользователя (возможно, сработает со 2 раза)

ОПЦИОНАЛЬНО: Создать пользователя, отличного от root через `adduser [имя пользователя]`. Например:
`adduser elbrus`, прописываем ему пароль и необходимые другие данные
Добавить созданного пользователя в sudoers:

1.  вводим `visudo`
2.  прописываем права в файле `[имя пользователя] ALL=(ALL:ALL) ALL`
3.  Выходим из файла (ctrl+x yes enter)
    Переключаемся на созданного пользователя `su - [имя пользователя]`, например
    `su - elbrus`

### Настраиваем Docker на виртуальном сервере

1. Устанавливаем Docker

Обновление пакетов на сервере

- Выполнить обновление списка пакетов и установленных пакетов на удаленном сервере.

```bash
apt update
```

Установка Docker

- Выполнить установку Docker на удаленном сервере.

```bash
apt install docker.io
```

### Установка Nginx на виртуальном сервере

- **Что такое Nginx?** Nginx (произносится как "энджинкс") — это высокопроизводительный веб-сервер и обратный прокси-сервер. В данном случае он будет принимать входящие запросы по HTTP/HTTPS и перенаправлять их на ваше приложение, запущенное в Docker контейнере.

- Установите Nginx.

```bash
apt install nginx -y
```

### Настройка Nginx (проксирование всего трафика на бэкенд)

- Создайте конфигурационный файл Nginx для вашего домена. Например, `/etc/nginx/sites-available/[yourdomain.ru]`.
- Отредактируйте файл, используя текстовый редактор типа `nano` или `vim`.

```bash
nano /etc/nginx/sites-available/[yourdomain.ru]
```

- Вставьте следующее содержимое (замените `ВАШ_ДОМЕН` на свои значения; ВНУТРЕННИЙ*ПОРТ*ПРИЛОЖЕНИЯ - это порт на хост-машине, куда проброшен порт контейнера, например, 3000):

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name ВАШ_ДОМЕН;

    # Клиентское приложение
    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # API запросы
    location /api {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket соединения
    location /socket.io {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

- Выход с сохранением из nano:

```bash
ctrl+o
enter
ctrl+x
```

- Активируйте конфигурацию, создав символическую ссылку для ВАШЕГО ДОМЕНА:

```bash
ln -s /etc/nginx/sites-available/[ВАШ ДОМЕН] /etc/nginx/sites-enabled/
```

- Удаляем дефолтную конфигурацию

```bash
rm /etc/nginx/sites-enabled/default
```

- Проверьте синтаксис конфигурации Nginx и перезагрузите его:

```bash
nginx -t
systemctl reload nginx
```

- Команда для удаление символической ссылки в В СЛУЧАЕ НЕОБХОДИМОСТИ:

```bash
sudo rm /etc/nginx/sites-enabled/r-test.twilightparadox.com
```

### Установка Certbot и получение SSL-сертификата

- **Что такое Certbot?** Certbot — это утилита, которая автоматизирует процесс получения и установки бесплатных SSL/TLS сертификатов от Let's Encrypt. Сертификаты нужны для включения HTTPS и шифрования трафика между пользователем и сервером.

- Установите Certbot и плагин Nginx для автоматической настройки.

```bash
apt install certbot python3-certbot-nginx -y
```

- Запустите Certbot для получения сертификата. Следуйте инструкциям в консоли. Укажите ваше доменное имя.

```bash
certbot --nginx -d ВАШ_ДОМЕН
```

- Настройка автоматического обновления

```bash
crontab -e
```

- Certbot автоматически изменит конфигурацию Nginx, добавив HTTPS блок и настройки SSL.

# Стягивание образов с Docker Hub и запуск контейнеров на виртуальном сервере

## Стягивание Docker-образа PostgreSQL

- Стянуть Docker-образ PostgreSQL на удаленном сервере.

```bash
docker pull postgres
```

Запуск docker-контейнера с postgres

- Запустить docker-контейнер с postgres на удаленном сервере. Убедитесь, что порт 5432 доступен для вашего сервера. Замените elbrus на свои переменные окружения из .env файла сервера

```bash
docker run --name some-postgres \
  -e POSTGRES_PASSWORD=elbrus \
  -e POSTGRES_USER=elbrus \
  -e POSTGRES_DB=elbrus \
  -e DB="postgresql://elbrus:elbrus@[IP сервера]:5432/elbrus" \
  -p 5432:5432 \
  -d postgres
```

Например:

```bash
docker run --name some-postgres \
  -e POSTGRES_PASSWORD=elbrus \
  -e POSTGRES_USER=elbrus \
  -e POSTGRES_DB=elbrus \
  -e DB="postgresql://elbrus:elbrus@87.228.114.49:5432/elbrus" \
  -p 5432:5432 \
  -d postgres
```

### Проверяем, запустился ли контейнер с PostgreSQL.
```bash
docker ps
```
### Накатить новую базу и миграции

## Накатить новую базу с локальной машины на удаленный сервер и миграции в неё.

```bash
# В папке сервер проверь переменные окружения для БД в .env файле
```

```bash
# В локальном терминале сервера выполнить:
npm run db:setup:prod
```

## Стягивание образов вашего приложения с Docker Hub: docker pull ВАШ *DOCKERHUB* ЛОГИН/имя_репозитория

Например:

```bash
docker pull myusername/myrepo:1.0
```

- Создание сети для контейнеров

```bash
docker network create app-network
```

- Запуск серверного контейнера с переменными окружения

```bash
docker run -d \
--name app-server \
--restart unless-stopped \
--network app-network \
-p 3000:3000 \
-e NODE*ENV=production \
-e PORT=3000 \
-e CLIENT_URL=https://ВАШ*ДОМЕН \
-e DB=[dialect]://[user]:[password]@[localhost]:[port]/[database] \
-e SECRET*ACCESS_TOKEN=SECRET_ACCESS_TOKEN \
-e SECRET_REFRESH_TOKEN=SECRET_REFRESH_TOKEN \
-e AI_AUTH_URL=https://ngw.devices.sberbank.ru:9443/api/v2/oauth \
-e AI_URL=https://gigachat.devices.sberbank.ru/api/v1/chat/completions \
-e AI_AUTH_KEY=key \
ВАШ_DOCKERHUB*ЛОГИН/your-app-name:server
```

Например:

```bash
 docker run -d \
 --name app-server \
 --restart unless-stopped \
 --network app-network \
 -p 3000:3000 \
 -e NODE_ENV=production \
 -e PORT=3000 \
 -e CLIENT_URL=https://r-test.twilightparadox.com \
 -e DB="postgresql://elbrus:elbrus@87.228.114.153:5432/elbrus" \
 -e ACCESS_TOKEN_SECRET=fgjkefrgfeerfgt \
 -e REFRESH_TOKEN_SECRET=irhdjkerjgfd \
 0e1484790502
```

где 0e1484790502 - ID образа сервера

- Запуск клиентского контейнера с переменными окружения

```bash
docker run -d \
--name app-client \
--restart unless-stopped \
--network app-network \
-p 8080:80 \
-e VITE*API_URL=https://ВАШ*ДОМЕН \
ВАШ*DOCKERHUB*ЛОГИН/your-app-name:client
```

# Проверка статуса
```bash
docker ps
docker logs app-client
docker logs app-server
```

### Финальная проверка

- Откройте в браузере ваше доменное имя (например, `https://ВАШ_ДОМЕН`). Вы должны увидеть ваше React-приложение, работающее по защищенному протоколу HTTPS, а API запросы должны направляться через Nginx на ваш Docker контейнер.

## Приобретение домена на Timeweb
```bash
Зайдите на Timeweb
Выберите и купите доменное имя
В настройках DNS создайте A-запись:
Имя: @ (или оставьте пустым)
Значение: IP-адрес вашего сервера
TTL: 600 секунд
```

## Docker команды

```bash
# Просмотр контейнеров
docker ps
docker ps -a

# Просмотр логов
docker logs app-client
docker logs app-server

# Остановка/запуск контейнеров
docker stop app-client app-server
docker start app-client app-server
docker restart app-client app-server

# Обновление приложения
docker pull ВАШ_DOCKERHUB_ЛОГИН/your-app-name:client
docker pull ВАШ_DOCKERHUB_ЛОГИН/your-app-name:server
docker stop app-client app-server
docker rm app-client app-server
# Затем запустите контейнеры заново командами из раздела 5.10
```

## Nginx команды

```bash
# Проверка конфигурации
nginx -t

# Перезагрузка
systemctl reload nginx

# Статус
systemctl status nginx
```

## SSL команды

```bash
# Проверка сертификата
certbot certificates

# Тест обновления
certbot renew --dry-run

# Принудительное обновление
certbot renew
```
