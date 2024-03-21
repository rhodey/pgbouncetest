# pgbouncetest
Scripts for testing [pgbouncer](https://hub.docker.com/r/edoburu/pgbouncer) w/ [Timescale DB](https://hub.docker.com/r/timescale/timescaledb) and Node.js [pg](https://www.npmjs.com/package/pg) package
  + postgres 15.6
  + timescaledb 2.14.2
  + pgbouncer 1.21.0
  + pg 8.10.0

## Background
Trying to reproduce [this issue](https://github.com/brianc/node-postgres/issues/3174) it makes sense that running test 1 with the default pgbouncer image could reproduce the issue and running test 2 with pgbouncer-prepared may not reproduce the issue

## Test 1
```
cp example.env .env
docker-compose up -d timescaledb
docker-compose up -d pgbouncer
npm install
export $(cat .env | xargs)
node bounce-many.js --rows 100 --children 25
```

## Test 2
```
docker rm -f pgbouncer
docker-compose up -d pgbouncer-prepared
node bounce-many.js --rows 100 --children 25
```

## Notes
+ Can try editing `default_pool_size` and `max_db_connections` in either of the .ini files
+ Run `docker-compose build` after editing either of the .ini files and then `docker rm` and `docker-compose up` again

## License
Copyright 2024 - MIT - Rhodey
