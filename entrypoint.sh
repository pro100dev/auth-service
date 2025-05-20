#!/bin/sh

# Wait for postgres to be ready
echo "Waiting for postgres..."
while ! nc -z postgres 5432; do
  sleep 0.1
done
echo "PostgreSQL started"

# Run migrations
echo "Running migrations..."
npm run migration:run

# Start the application
echo "Starting application..."
if [ "$NODE_ENV" = "production" ]; then
  npm run start:prod
else
  npm run start:dev
fi 