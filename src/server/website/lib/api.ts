import { hc } from 'hono/client'
import type { app } from '../../api/app.ts'

export const api = hc<typeof app>('http://localhost:3000')
