'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { HiOutlineArrowRight, HiOutlineCube } from 'react-icons/hi2'

interface Product {
  id: string
  name: string
  price: string
  stock: number
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(res => {
        if (res.success) {
          setProducts(res.data)
        }
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="animate-pulse bg-white rounded-2xl h-64 border border-gray-100"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-12">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Our Catalog</h1>
          <p className="mt-2 text-lg text-gray-600">Discover our collection of premium electronics.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.map((product) => (
          <div 
            key={product.id} 
            className="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col"
          >
            <div className="mb-4 w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
              <HiOutlineCube className="w-6 h-6" />
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
              {product.name}
            </h3>
            
            <div className="mt-auto">
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl font-black text-indigo-600">${parseFloat(product.price).toFixed(2)}</span>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                  product.stock > 10 ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-700'
                }`}>
                  {product.stock} in stock
                </span>
              </div>
              
              <Link 
                href={`/products/${product.id}`}
                className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-slate-900 text-white rounded-xl font-medium hover:bg-indigo-600 transition-all duration-300"
              >
                View Details
                <HiOutlineArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
