import { Hono } from 'hono'
import { jwt } from 'hono/jwt'
import { logger } from 'hono/logger'
import postgres from 'postgres'
import { z } from 'zod'

const app = new Hono()
app.use('*', logger())

const sql = postgres(process.env.DATABASE_URL!)
const JWT_SECRET = process.env.JWT_SECRET || 'secret'
const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL || 'http://localhost:3000'

// Protected routes
app.use('*', jwt({ secret: JWT_SECRET, alg: 'HS256' }))

const orderSchema = z.object({
  items: z.array(z.object({
    productId: z.string().uuid(),
    quantity: z.number().int().positive()
  }))
})

app.post('/orders', async (c) => {
  const payload = c.get('jwtPayload')
  const userId = payload.userId

  try {
    const body = await c.req.json()
    const { items } = orderSchema.parse(body)

    let total = 0
    const processedItems = []

    // 1. Verify stock and calculate total
    for (const item of items) {
      const res = await fetch(`${PRODUCT_SERVICE_URL}/internal/products/${item.productId}`)
      if (!res.ok) {
        return c.json({ success: false, message: `Product ${item.productId} not found` }, 404)
      }
      const productRes = await res.json()
      const product = productRes.data

      if (product.stock < item.quantity) {
        return c.json({ success: false, message: `Insufficient stock for product ${product.name}` }, 409)
      }
      total += product.price * item.quantity
      processedItems.push({
        ...item,
        name: product.name,
        price: product.price
      })
    }

    // 2. Transact: Deduct stock and create order
    const deductionResults = []
    try {
      for (const item of processedItems) {
        const res = await fetch(`${PRODUCT_SERVICE_URL}/internal/products/${item.productId}/stock`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ quantity: item.quantity })
        })
        if (!res.ok) {
          throw new Error(`Failed to deduct stock for ${item.name}`)
        }
        deductionResults.push(item)
      }

      // Create order in DB
      const [order] = await sql.begin(async (sql) => {
        const [newOrder] = await sql`
          INSERT INTO orders (user_id, total)
          VALUES (${userId}, ${total})
          RETURNING id
        `
        
        for (const item of processedItems) {
          await sql`
            INSERT INTO order_items (order_id, product_id, product_name, price_snapshot, quantity)
            VALUES (${newOrder.id}, ${item.productId}, ${item.name}, ${item.price}, ${item.quantity})
          `
        }
        return [newOrder]
      })

      return c.json({ success: true, message: 'Order placed', data: { id: order.id, total, items: processedItems } }, 201)

    } catch (err) {
      console.error('Order creation failed:', err)
      return c.json({ success: false, message: 'Order placement failed during stock deduction' }, 500)
    }

  } catch (e) {
    if (e instanceof z.ZodError) return c.json({ success: false, message: 'Validation failed', errors: e.errors }, 400)
    console.error(e)
    return c.json({ success: false, message: 'Internal server error' }, 500)
  }
})

app.get('/orders', async (c) => {
  const payload = c.get('jwtPayload')
  const userId = payload.userId

  try {
    const orders = await sql`
      SELECT o.*, 
        (SELECT json_agg(oi) FROM order_items oi WHERE oi.order_id = o.id) as items
      FROM orders o
      WHERE o.user_id = ${userId}
      ORDER BY o.created_at DESC
    `
    return c.json({ success: true, data: orders })
  } catch (e) {
    console.error(e)
    return c.json({ success: false, message: 'Internal server error' }, 500)
  }
})

const port = parseInt(process.env.PORT || '3000')
console.log(`Order service running on port ${port}`)

export default {
  port,
  fetch: app.fetch
}
