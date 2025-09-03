import { config } from '@dotenvx/dotenvx'
import { resolve } from 'path'

// Load environment variables from .env file
config({ path: resolve(process.cwd(), '.env') })

// Environment configuration
// const isProduction = process.env.ENVIRONMENT === 'production'
// const isStaging = process.env.ENVIRONMENT === 'staging'
// const isDevelopment = process.env.ENVIRONMENT === 'development'


// Cloudflare Worker entry point
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    return new Response('Hello from Cloudflare Worker!')
  },
}
