#!/bin/sh
set -eu
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname postgres --set=test_password="$POSTGRES_PASSWORD" <<'SQL'
CREATE ROLE coupon_test LOGIN PASSWORD :'test_password' NOSUPERUSER NOCREATEDB NOCREATEROLE;
CREATE DATABASE coupon_integration OWNER coupon_test;
SQL
