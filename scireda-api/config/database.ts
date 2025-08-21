import env from '#start/env'
import { defineConfig } from '@adonisjs/lucid'
import fs from 'fs'

const dbConfig = defineConfig({
  connection: 'postgres',
  connections: {
    postgres: {
      client: 'pg',
      connection: {
        connectionString: env.get('DATABASE_URL'),
        ssl: {
          ca: fs.readFileSync('/app/certs/supabase-ca.crt').toString(),
        },
      },
      migrations: {
        naturalSort: true,
        paths: ['database/migrations'],
      },
    },
  },
})

export default dbConfig