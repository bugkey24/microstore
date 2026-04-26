import { Hono } from 'hono'
import { sign, jwt } from 'hono/jwt'
import { logger } from 'hono/logger'
import postgres from 'postgres'
import { z } from 'zod'

const app = new Hono()
app.use('*', logger())

const sql = postgres(process.env.DATABASE_URL!)
const JWT_SECRET = process.env.JWT_SECRET || 'secret'

// Registration schema
const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6)
})

app.post('/register', async (c) => {
  try {
    const body = await c.req.json()
    const { name, email, password } = registerSchema.parse(body)

    // Check if user exists
    const existing = await sql`SELECT id FROM users WHERE email = ${email}`
    if (existing.length > 0) {
      return c.json({ success: false, message: 'User already exists' }, 409)
    }

    // Hash password (using Bun's built-in)
    const passwordHash = await Bun.password.hash(password)

    await sql`
      INSERT INTO users (name, email, password_hash)
      VALUES (${name}, ${email}, ${passwordHash})
    `

    return c.json({ success: true, message: 'User registered successfully' }, 201)
  } catch (e) {
    if (e instanceof z.ZodError) {
      return c.json({ success: false, message: 'Validation failed', errors: e.errors }, 400)
    }
    console.error(e)
    return c.json({ success: false, message: 'Internal server error' }, 500)
  }
})

app.post('/login', async (c) => {
  try {
    const { email, password } = await c.req.json()

    const [user] = await sql`SELECT * FROM users WHERE email = ${email}`
    if (!user) {
      return c.json({ success: false, message: 'Invalid credentials' }, 401)
    }

    const isMatch = await Bun.password.verify(password, user.password_hash)
    if (!isMatch) {
      return c.json({ success: false, message: 'Invalid credentials' }, 401)
    }

    const payload = {
      userId: user.id,
      email: user.email,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 // 24 hours
    }

    const token = await sign(payload, JWT_SECRET, 'HS256')

    return c.json({ success: true, message: 'Login successful', data: { token } })
  } catch (e) {
    console.error(e)
    return c.json({ success: false, message: 'Internal server error' }, 500)
  }
})

app.post('/change-password', jwt({ secret: JWT_SECRET, alg: 'HS256' }), async (c) => {
  try {
    const payload = c.get('jwtPayload')
    const { oldPassword, newPassword } = await c.req.json()

    const [user] = await sql`SELECT * FROM users WHERE id = ${payload.userId}`
    if (!user) {
      return c.json({ success: false, message: 'User not found' }, 404)
    }

    const isMatch = await Bun.password.verify(oldPassword, user.password_hash)
    if (!isMatch) {
      return c.json({ success: false, message: 'Invalid current password' }, 401)
    }

    const newHash = await Bun.password.hash(newPassword)
    await sql`UPDATE users SET password_hash = ${newHash} WHERE id = ${payload.userId}`

    return c.json({ success: true, message: 'Password updated successfully' })
  } catch (e) {
    console.error(e)
    return c.json({ success: false, message: 'Internal server error' }, 500)
  }
})

const port = parseInt(process.env.PORT || '3000')
console.log(`Auth service running on port ${port}`)

export default {
  port,
  fetch: app.fetch
}
