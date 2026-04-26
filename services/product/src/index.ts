import { Hono } from 'hono'
import { logger } from 'hono/logger'
import postgres from 'postgres'

const app = new Hono()
app.use('*', logger())

const sql = postgres(process.env.DATABASE_URL!)

// Public endpoints
app.get('/products', async (c) => {
  try {
    const products = await sql`SELECT id, name, price, stock FROM products`
    return c.json({ success: true, data: products })
  } catch (e) {
    console.error(e)
    return c.json({ success: false, message: 'Internal server error' }, 500)
  }
})

app.get('/products/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const [product] = await sql`SELECT * FROM products WHERE id = ${id}`
    if (!product) {
      return c.json({ success: false, message: 'Product not found' }, 404)
    }
    return c.json({ success: true, data: product })
  } catch (e) {
    console.error(e)
    return c.json({ success: false, message: 'Internal server error' }, 500)
  }
})

// Internal endpoints (protected by Docker network in production)
app.get('/internal/products/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const [product] = await sql`SELECT id, name, price, stock FROM products WHERE id = ${id}`
    if (!product) {
      return c.json({ success: false, message: 'Product not found' }, 404)
    }
    return c.json({ success: true, data: product })
  } catch (e) {
    console.error(e)
    return c.json({ success: false, message: 'Internal server error' }, 500)
  }
})

app.put('/internal/products/:id/stock', async (c) => {
  try {
    const id = c.req.param('id')
    const { quantity } = await c.req.json()

    // Atomic stock reduction
    const [updated] = await sql`
      UPDATE products 
      SET stock = stock - ${quantity} 
      WHERE id = ${id} AND stock >= ${quantity}
      RETURNING *
    `

    if (!updated) {
      return c.json({ success: false, message: 'Insufficient stock or product not found' }, 409)
    }

    return c.json({ success: true, message: 'Stock updated', data: updated })
  } catch (e) {
    console.error(e)
    return c.json({ success: false, message: 'Internal server error' }, 500)
  }
})

const port = parseInt(process.env.PORT || '3000')
console.log(`Product service running on port ${port}`)

export default {
  port,
  fetch: app.fetch
}
