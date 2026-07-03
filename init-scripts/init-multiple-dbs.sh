#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname postgres <<-EOSQL
    CREATE DATABASE core_db;
    CREATE DATABASE social_db;
    CREATE DATABASE notification_db;
EOSQL
