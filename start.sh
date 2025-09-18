#!/bin/sh

# Ждем немного перед запуском процессов
sleep 2

# Запускаем сервер на порту 3001 в фоновом режиме
echo "🚀 Starting server on port 3001..."
cd /app/server
node dist/app.js &
SERVER_PID=$!
sleep 3

# Запускаем клиент на порту 4000 в фоновом режиме
echo "🚀 Starting client on port 4000..."
cd /app
npm start &
CLIENT_PID=$!
sleep 5

# Проверяем, что процессы запустились
if ! kill -0 $SERVER_PID 2>/dev/null; then
    echo "❌ Server failed to start"
    exit 1
fi

if ! kill -0 $CLIENT_PID 2>/dev/null; then
    echo "❌ Client failed to start"
    exit 1
fi

# Запускаем Nginx на порту 80
echo "🚀 Starting Nginx on port 80..."
nginx -g "daemon off;" &
NGINX_PID=$!
sleep 2

# Функция для завершения процессов при выходе
cleanup() {
    echo "🛑 Stopping processes..."
    kill $SERVER_PID $CLIENT_PID $NGINX_PID 2>/dev/null
    wait $SERVER_PID $CLIENT_PID $NGINX_PID 2>/dev/null
    exit 0
}

# Устанавливаем обработчик сигналов
trap cleanup SIGINT SIGTERM

# Бесконечный цикл для проверки состояния процессов
echo "📊 Monitoring processes..."
while true; do
    if ! kill -0 $SERVER_PID 2>/dev/null; then
        echo "❌ Server process died"
        cleanup
    fi
    
    if ! kill -0 $CLIENT_PID 2>/dev/null; then
        echo "❌ Client process died"
        cleanup
    fi
    
    if ! kill -0 $NGINX_PID 2>/dev/null; then
        echo "❌ Nginx process died"
        cleanup
    fi
    
    sleep 5
done