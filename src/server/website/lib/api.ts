import { hc } from 'hono/client'
import type { app } from '../../api/app.ts'

export const api = hc<typeof app>(import.meta.env['VITE_PUBLIC_API_BASE_URL'])
