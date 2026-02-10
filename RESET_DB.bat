@echo off
echo Stopping containers...
docker-compose down -v

echo Starting PostgreSQL...
docker-compose up -d postgres

echo Waiting for database to initialize (10s)...
timeout /t 10

echo Pushing schema...
npx dotenv-cli -e apps/api/.env -- prisma db push --schema apps/api/prisma/schema.prisma

echo Applying indexes...
npx dotenv-cli -e apps/api/.env -- prisma db execute --file apps/api/prisma/migrations/add_indexes.sql --schema apps/api/prisma/schema.prisma

echo Done!
pause
