#!/bin/bash
set -e

echo "деплой проекта..."

if [ ! -f /swapfile ]; then
    echo "Настройка SWAP файла на 2 ГБ..."
    sudo fallocate -l 2G /swapfile
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
    echo "SWAP успешно подключен."
fi

if [ ! -f .env ]; then
    echo "Создание .env..."
    cat <<EOT > .env
POSTGRES_USER=db_user
POSTGRES_PASSWORD=$(openssl rand -hex 12)
POSTGRES_DB=main_db
EOT
    echo "✅ .env сгенерирован."
fi

echo "Сборка и запуск докер контейнеров..."
sudo docker compose -f docker-compose.prod.yml up -d --build

echo "Выполнено."