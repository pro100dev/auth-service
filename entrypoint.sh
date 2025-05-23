#!/bin/sh

# Wait for postgres
echo "Waiting for postgres..."
while ! nc -z $DATABASE_HOST $DATABASE_PORT; do
  sleep 0.1
done
echo "PostgreSQL started"

# Run migrations
echo "Running migrations..."
npm run typeorm migration:run

# Start the application
echo "Starting the application..."

if [ "$NODE_ENV" = "prod" ]; then
  node dist/main
else
  npm run start:dev
fi 