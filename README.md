Видео Чат
=============================

Установка
------------

Команды для запуска проекткта:
-----------
    Скопировать .env.example и переименовать в .env
    
    docker-compose build --build-arg uid=$(id -u)               - Собрать окружение           
    docker-compose up -d                                        - Запустить контейнеры
    docker-compose run --rm nodejs npm i                        - Установить js зависимости
    docker-compose run --rm nodejs npm run start                - Запустить сервер
    docker-compose run --rm nodejs npm run watch                - Собрать js и стили
   
Хосты
-----------
    Указать в /etc/hosts
    
    127.0.0.1 chat.dv

SSL
-----------
    Генерим сертификаты один раз в три года и кладем в проект.
    http://r-notes.ru/administrirovanie/poleznosti/164-openssl-sozdanie-multidomennogo-sertifikata.html   
    openssl genrsa -out rootCA.key 2048
    openssl req -x509 -new -nodes -key rootCA.key -sha256 -days 1024 -out rootCA.pem
    cd docker/nginx/ssl && ./generate_ssl.sh orion.dv
    
    Тому кто скачал себе проект необходимо добавить в браузер сертификат
    Добавляем в браузер docker/nginx/ssl/rootCA.pem 
    chrome://flags/#allow-insecure-localhost
