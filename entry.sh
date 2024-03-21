#!/bin/sh

sed -i -e "s/dbhost/$DB_HOST/g" /etc/pgbouncer/pgbouncer.ini
sed -i -e "s/dbport/$DB_PORT/g" /etc/pgbouncer/pgbouncer.ini
sed -i -e "s/dbdb/$DB_NAME/g" /etc/pgbouncer/pgbouncer.ini

sed -i -e "s/user/$DB_USER/g" /etc/pgbouncer/users.txt
sed -i -e "s/password/$DB_PASSWORD/g" /etc/pgbouncer/users.txt

sed -i -e "s/dbadmin/$DB_USER/g" /etc/pgbouncer/pgbouncer.ini

/usr/bin/pgbouncer /etc/pgbouncer/pgbouncer.ini
