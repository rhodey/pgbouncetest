const { Client } = require('pg')
const { v4: uuidv4 } = require('uuid')

function onError(err) {
  console.error('error', err)
  process.exit(1)
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

function shuffle(arr) {
  let j, x, index
  for (index = arr.length - 1; index > 0; index--) {
      j = Math.floor(Math.random() * (index + 1))
      x = arr[index]
      arr[index] = arr[j]
      arr[j] = x
  }
  return arr
}

function sleep(ms) {
  return new Promise((res, rej) => {
    setTimeout(res, ms)
  })
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

// fields with null val will not be included in select
function randomFields() {
  const fields = []
  for (let i = 0; i < 7; i++) {
    const name = `field${i+1}`
    const rand = randomInt(0, 4)
    if (rand === 0) {
      fields.push({name, val: null})
    } else {
      fields.push({name, val: uuidv4().substring(0, 3)})
    }
  }
  return shuffle(fields)
}

// fields with null val will not be included in select
function randomSelect(fields) {
  let select = 'SELECT '

  fields.filter((field) => field.val !== null).forEach((field) => {
    select += `${field.name}, `
  })

  select = select.substring(0, select.length - 2)
  select += ' FROM test WHERE '

  let count = 1
  fields.filter((field) => field.val !== null).forEach((field) => {
    select += `${field.name} = \$${count} AND `
    count++
  })
  select = select.substring(0, select.length - 5)
  select += ";"

  if (count <= 1) { select = 'SELECT field1 FROM test LIMIT 1;' }
  return select
}

async function test() {
  const client = newClient()
  await client.connect()

  while (1) {
    const fields = randomFields()
    const select = randomSelect(fields)

    const values = []
    const count = fields.filter((field) => field.val !== null).length
    for (let i = 0; i < count; i++) { values.push(uuidv4().substring(0, 3)) }

    await client.query(select, values)
    await sleep(randomInt(0, 5))
  }
}

test().catch(onError)
