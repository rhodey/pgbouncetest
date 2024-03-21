FROM edoburu/pgbouncer:1.21.0-p2

COPY pgbouncer.ini /etc/pgbouncer/pgbouncer.ini
COPY users.txt /etc/pgbouncer/
COPY entry.sh /entry.sh

ENTRYPOINT ["/entry.sh"]
