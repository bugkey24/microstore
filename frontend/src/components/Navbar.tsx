'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { HiOutlineShoppingCart, HiOutlineUserCircle, HiOutlineArrowRightOnRectangle, HiOutlineShieldCheck } from 'react-icons/hi2'
import { useAuth } from '@/context/AuthContext'

export default function Navbar() {
  const router = useRouter()
  const { isLoggedIn, logout, loading } = useAuth()

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/products" className="flex-shrink-0 flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">M</div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                MicroStore
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/products" className="text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
              Products
            </Link>
            
            {loading ? (
              <div className="w-20 h-8 bg-gray-100 animate-pulse rounded-lg"></div>
            ) : isLoggedIn ? (
              <>
                <Link href="/orders" className="flex items-center gap-1 text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  <HiOutlineShoppingCart className="w-5 h-5" />
                  Orders
                </Link>
                <Link href="/security" className="flex items-center gap-1 text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  <HiOutlineShieldCheck className="w-5 h-5" />
                  Security
                </Link>
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-1 text-red-600 hover:bg-red-50 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  <HiOutlineArrowRightOnRectangle className="w-5 h-5" />
                  Logout
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login" className="text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium">
                  Login
                </Link>
                <Link href="/register" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-all shadow-sm hover:shadow-indigo-200">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
