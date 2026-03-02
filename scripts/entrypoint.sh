#!/bin/bash

# 1. Start MongoDB in background
echo "Starting MongoDB..."
mongod --fork --logpath /var/log/mongodb.log --dbpath /data/db --bind_ip_all

# 2. Wait for MongoDB to be ready
until mongosh --eval "db.adminCommand('ping')" --quiet; do
  echo "Waiting for MongoDB to start..."
  sleep 2
done
echo "MongoDB is up!"

# 3. Start Backend Engine (Render)
echo "Starting Backend Engine..."
npm run server &

# 4. Start Frontend (Vercel)
echo "Starting Frontend..."
npm start
