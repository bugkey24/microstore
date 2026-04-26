'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { HiOutlineReceiptPercent, HiOutlineCalendarDays, HiOutlineCurrencyDollar } from 'react-icons/hi2'
import { useAuth } from '@/context/AuthContext'

interface OrderItem {
  product_name: string
  price_snapshot: string
  quantity: number
}

interface Order {
  id: string
  total: string
  created_at: string
  items: OrderItem[]
}

export default function OrdersPage() {
  const router = useRouter()
  const { isLoggedIn, loading: authLoading } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      router.push('/login')
      return
    }

    if (isLoggedIn) {
      fetch('/api/orders')
        .then(res => {
          if (res.status === 401) {
            router.push('/login')
            return { success: false, data: [] }
          }
          return res.json()
        })
        .then(data => {
          if (data.success) {
            setOrders(data.data)
          }
          setLoading(false)
        })
        .catch(() => setLoading(false))
    }
  }, [isLoggedIn, authLoading, router])

  if (authLoading || (loading && isLoggedIn)) return <div className="max-w-7xl mx-auto px-4 py-20 text-center text-gray-500">Loading your history...</div>

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-12">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
          <HiOutlineReceiptPercent className="text-indigo-600" />
          Order History
        </h1>
        <p className="mt-2 text-gray-600 text-lg">Manage and track your past purchases.</p>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-gray-300">
          <div className="w-16 h-16 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
            <HiOutlineReceiptPercent className="w-8 h-8" />
          </div>
          <p className="text-gray-500 text-lg mb-6">No orders found. Start shopping!</p>
          <button 
            onClick={() => router.push('/products')}
            className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
          >
            Go to Catalog
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex flex-wrap justify-between items-start gap-4 border-b border-gray-50 pb-6 mb-6">
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Order ID</p>
                  <p className="font-mono text-sm text-gray-600">{order.id}</p>
                </div>
                <div className="flex gap-8">
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                      <HiOutlineCalendarDays className="w-3 h-3" /> Date
                    </p>
                    <p className="font-medium text-gray-900">{new Date(order.created_at).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                      <HiOutlineCurrencyDollar className="w-3 h-3" /> Total
                    </p>
                    <p className="text-xl font-black text-indigo-600">${parseFloat(order.total).toFixed(2)}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Items</p>
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-indigo-600 shadow-sm font-bold">
                        {item.quantity}x
                      </div>
                      <span className="font-bold text-gray-900">{item.product_name}</span>
                    </div>
                    <span className="font-medium text-gray-600">${parseFloat(item.price_snapshot).toFixed(2)} / ea</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
