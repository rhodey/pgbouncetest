const { Client } = require('pg')
const { v4: uuidv4 } = require('uuid')
const spawn = require('child_process').spawn
const minimist = require('minimist')

function onError(err) {
  console.error('error', err)
  process.exit(1)
}

function newClient() {
  return new Client({
    host: process.env.pg_host,
    port: parseInt(process.env.pg_port),
    user: process.env.pg_user,
    password: process.env.pg_pass,
    database: process.env.pg_db,
    connectionTimeoutMillis: 1000 * 16,
    idleTimeoutMillis: 1000 * 90,
    query_timeout: 1000 * 16,
  })
}

async function init() {
  const client = newClient()
  await client.connect()
  await client.query(`
    CREATE TABLE IF NOT EXISTS test (
      field1 TEXT NOT NULL,
      field2 TEXT NOT NULL,
      field3 TEXT NOT NULL,
      field4 TEXT NOT NULL,
      field5 TEXT NOT NULL,
      field6 TEXT NOT NULL,
      field7 TEXT NOT NULL
    );`
  )
  await client.query('DELETE FROM test;')
  for (let row = 0; row < rows; row++) {
    const values = []
    for (let i = 0; i < 7; i++) { values.push(uuidv4().substring(0, 3)) }
    await client.query('INSERT INTO test (field1, field2, field3, field4, field5, field6, field7) VALUES ($1, $2, $3, $4, $5, $6, $7);', values)
  }
  await client.end()
}

function newChild() {
  const args = ['bounce.js']
  const child = spawn('node', args, { env: { ...process.env }})
  child.once('error', () => { })
  child.stdout.on('data', (data) => console.log('child said', data.toString()))
  child.stderr.on('data', (data) => console.error('child said', data.toString()))
  child.once('exit', (code) => onError(`child exited ${code}`))
  return child
}

async function test() {
  await init()
  console.log('init done')
  for (let i = 0; i < children; i++) {
    newChild()
    console.log(`child ${i+1} up`)
  }
}

const argv = minimist(process.argv.slice(2))
let rows = parseInt(argv.rows)
let children = parseInt(argv.children)

if (isNaN(rows)) { onError('need --rows') }
if (isNaN(children)) { onError('need --children') }

test().catch(onError)
