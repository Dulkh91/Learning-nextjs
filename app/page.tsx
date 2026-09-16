'use client'
import { useEffect, useState } from 'react'

type Product = { id: string; name: string; price: number; category: string }
type CartItem = Product & { qty: number }

export default function POS() {
  const [products, setProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [category, setCategory] = useState('All')

  useEffect(() => {
    fetch('/api/products').then(r => r.json()).then(setProducts)
  }, [])

  const categories = ['All',...new Set(products.map(p => p.category))]
  const filtered = category === 'All'? products : products.filter(p => p.category === category)

  const addToCart = (p: Product) => {
    setCart(prev => {
      const found = prev.find(c => c.id === p.id)
      if (found) return prev.map(c => c.id === p.id? {...c, qty: c.qty + 1 } : c)
      return [...prev, {...p, qty: 1 }]
    })
  }

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0)

  const checkout = () => {
    alert(`លក់បាន $${total.toFixed(2)} - អរគុណ!`)
    setCart([])
  }

  return (
    <div className="min-h-screen bg-gray-800 flex">
      {/* LEFT - Products */}
      <div className="flex-1 p-6">
        <h1 className="text-3xl font-bold mb-4">☕ COFFEE POS</h1>
        <div className="flex gap-2 mb-6 flex-wrap">
          {categories.map(cat => (
            <button key={cat} onClick={() => setCategory(cat)}
              className={`px-4 py-2 rounded-full ${category === cat? 'bg-black text-white' : 'bg-stone-600'}`}>
              {cat}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
          {filtered.map(p => (
            <button key={p.id} onClick={() => addToCart(p)}
              className="bg-white p-4 rounded-xl shadow hover:shadow-lg text-left">
              <div className="text-lg font-bold text-stone-800">{p.name}</div>
              <div className="text-sm text-gray-500">{p.category}</div>
              <div className="mt-2 font-bold text-green-600">${p.price.toFixed(2)}</div>
            </button>
          ))}
        </div>
      </div>

      {/* RIGHT - Cart */}
      <div className="w-80 bg-stone-900 border-l p-10 flex flex-col">
        <h2 className="text-xl font-bold mb-4">Cart ({cart.length})</h2>
        <div className="flex-1 space-y-3 overflow-auto">
          {cart.length === 0 && <p className="text-gray-400">អត់ទាន់មានអីវ៉ាន់...</p>}
          {cart.map(item => (
            <div key={item.id} className="flex justify-between">
              <div>
                <div className="font-medium">{item.name} x{item.qty}</div>
                <div className="text-sm text-gray-500">${item.price}</div>
              </div>
              <div className="font-bold">${(item.price * item.qty).toFixed(2)}</div>
            </div>
          ))}
        </div>
        <div className="border-t pt-4 mt-4">
          <div className="flex justify-between text-xl font-bold mb-4">
            <span>Total:</span><span>${total.toFixed(2)}</span>
          </div>
          <button onClick={checkout} disabled={cart.length === 0}
            className="w-full bg-black text-white py-3 rounded-xl font-bold disabled:opacity-30">
            CHECKOUT
          </button>
        </div>
      </div>
    </div>
  )
}