'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { HiOutlineArrowLeft, HiOutlineShoppingBag, HiOutlineShieldCheck, HiOutlineTruck } from 'react-icons/hi2'
import Link from 'next/link'

interface Product {
  id: string
  name: string
  price: string
  stock: number
}

export default function ProductDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)
  const [ordering, setOrdering] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then(res => res.json())
      .then(res => {
        if (res.success) {
          setProduct(res.data)
        }
        setLoading(false)
      })
  }, [id])

  const handleOrder = async () => {
    setOrdering(true)
    setMessage(null)
    
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [{ productId: id, quantity }]
        })
      })

      const result = await res.json()

      if (res.ok) {
        setMessage({ type: 'success', text: result.message || 'Order placed successfully!' })
        // Refresh product stock
        const pRes = await fetch(`/api/products/${id}`)
        const pResult = await pRes.json()
        if (pResult.success) {
          setProduct(pResult.data)
        }
      } else {
        if (res.status === 401) {
          router.push('/login')
        } else {
          setMessage({ type: 'error', text: result.message || 'Failed to place order' })
        }
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'An error occurred' })
    } finally {
      setOrdering(false)
    }
  }

  if (loading) return <div className="max-w-7xl mx-auto px-4 py-20 text-center">Loading...</div>
  if (!product) return <div className="max-w-7xl mx-auto px-4 py-20 text-center">Product not found</div>

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <Link href="/products" className="inline-flex items-center gap-2 text-gray-600 hover:text-indigo-600 mb-8 transition-colors">
        <HiOutlineArrowLeft className="w-4 h-4" />
        Back to Catalog
      </Link>

      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Product Image Placeholder */}
          <div className="bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center p-20">
            <div className="text-indigo-600 opacity-50">
              <svg className="w-40 h-40" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
              </svg>
            </div>
          </div>

          <div className="p-8 md:p-12 flex flex-col">
            <div className="flex-1">
              <h1 className="text-4xl font-black text-gray-900 mb-4">{product.name}</h1>
              <p className="text-3xl font-bold text-indigo-600 mb-8">${parseFloat(product.price).toFixed(2)}</p>
              
              <div className="space-y-6 mb-8 text-gray-600">
                <div className="flex items-center gap-3">
                  <HiOutlineShieldCheck className="w-6 h-6 text-green-500" />
                  <span>2 Year Official Warranty</span>
                </div>
                <div className="flex items-center gap-3">
                  <HiOutlineTruck className="w-6 h-6 text-indigo-500" />
                  <span>Free Express Shipping</span>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-8 mb-8">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-semibold text-gray-900">Availability</span>
                  <span className={product.stock > 0 ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
                    {product.stock > 0 ? `${product.stock} Units In Stock` : 'Out of Stock'}
                  </span>
                </div>

                {product.stock > 0 && (
                  <div className="flex items-center gap-4">
                    <label className="font-semibold text-gray-900">Quantity</label>
                    <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                      <button 
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="px-4 py-2 hover:bg-gray-50 transition-colors"
                      >-</button>
                      <span className="px-4 py-2 border-x border-gray-200 font-medium min-w-[3rem] text-center">{quantity}</span>
                      <button 
                        onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                        className="px-4 py-2 hover:bg-gray-50 transition-colors"
                      >+</button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {message && (
              <div className={`mb-6 p-4 rounded-xl text-sm font-medium ${
                message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
              }`}>
                {message.text}
              </div>
            )}

            <button
              onClick={handleOrder}
              disabled={ordering || product.stock === 0}
              className="flex items-center justify-center gap-3 w-full py-4 bg-indigo-600 text-white rounded-2xl text-lg font-bold hover:bg-indigo-700 transition-all shadow-xl hover:shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
            >
              <HiOutlineShoppingBag className="w-6 h-6" />
              {ordering ? 'Processing...' : 'Place Order Now'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
