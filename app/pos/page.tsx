'use client'
import { useEffect, useState } from 'react'
import CheckOutBtn from '../component/CheckOutBtn'
import Receipt from '../component/Receipt'
import Link from 'next/link'


type Product = { id: string; name: string; price: number; category: string; image?: string }
type CartItem = Product & { qty: number }


export default function POS() {
  const [products, setProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [category, setCategory] = useState('All')

  const [showReceipt, setShowReceipt] = useState(false)
  const [lastSale, setLastSale] = useState<{cart: CartItem[], total: number} | null>(null)

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

  const updateQty = (id: string, delta: number) => {
    setCart(prev => prev.map(c => {
      if (c.id === id) {
        const newQty = c.qty + delta
        return newQty <= 0? null : {...c, qty: newQty }
      }
      return c
    }).filter(Boolean) as CartItem[])
  }

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0)


  // រក function នេះក្នុង file របស់អ្នក
const checkout = async () => {
  if (cart.length === 0) return

  // 👇 ដាក់ត្រង់នេះ! កាត់រូបចេញ
  const saleData = cart.map(i => ({ 
    id: i.id, 
    name: i.name, 
    price: i.price, 
    qty: i.qty 
  }))

  await fetch('/api/sales', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      cart: saleData, // 👈 ត្រូវប្រើ saleData មិនមែន cart
      total 
    })
  })

  setLastSale({ cart: [...cart], total })
  setShowReceipt(true)
  setCart([])
}


  return (
    <div className="min-h-screen bg-gray-800 flex text-gray-100">
      {/* LEFT - Products */}
      <div className="flex-1 p-6">
        <div className='flex justify-between items-center mb-4"'>
            <h1 className="text-3xl font-bold mb-4">☕ COFFEE POS</h1>
            <Link href="/dashboard" className="bg-emerald-700 border px-3 py-1 rounded-full text-sm">Dashboard</Link>
        </div>
        
        <div className="flex gap-2 mb-6 flex-wrap">
          {categories.map(cat => (
            <button key={cat} onClick={() => setCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm ${category === cat? 'bg-black text-white' : ' bg-pink-400 border'}`}>
              {cat}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map(p => (
            <button key={p.id} onClick={() => addToCart(p)}
            className="bg-white p-3 rounded-xl shadow-sm hover:shadow-md text-left border overflow-hidden">
              {p.image && <img src={p.image} className="w-full h-24 object-cover rounded-lg mb-2" />}
              <div className="font-medium text-stone-900">{p.name}</div>
              <div className="text-sm text-gray-500">{p.category}</div>
              <div className="mt-2 font-bold text-gray-500">${p.price.toFixed(2)}</div>
            </button>
          ))}
        </div>
      </div>

      

      {/* RIGHT - Cart with YOUR style */}
      <div className="w- bg-stone-900 border-l p-2 flex flex-col">
        <h2 className="text-xl font-bold mb-4">Cart ({cart.length})</h2>

        <div className="flex-1 space-y-1 overflow-auto">
          {cart.length === 0 && <p className="text-gray-400 text-sm">អត់ទាន់មានអីវ៉ាន់...</p>}

          {cart.map(item => (
            <div key={item.id} className='flex justify-between border-b py-2'>
              <div className='flex'>
                {item.image && <img src={item.image}  className=' w-12'/>}
                <h1 className='font-medium'>{item.name}</h1>

              </div>
              <div className='p-2 space-y-2'>
                <p className='flex justify-end text-sm font-medium'>${(item.price * item.qty).toFixed(2)}</p>
                <div className='flex gap-2 items-center'>
                  <button onClick={() => updateQty(item.id, -1)}
                    className='bg-amber-500 text-white font-light w-6 rounded-sm px-1 hover:bg-amber-600'>-</button>
                  <p className='w-4 text-center text-sm'>{item.qty}</p>
                  <button onClick={() => updateQty(item.id, 1)}
                    className='bg-amber-500 text-white font-medium w-6 rounded-sm px-1 hover:bg-amber-600'>+</button>
                </div>
              </div>
            </div>
          ))}
        </div>


          <CheckOutBtn
            total={total}
            itemCount={cart.length}
            onCheckOut={checkout}

          />
      </div>

        {showReceipt && lastSale && (
            <Receipt
                cart={lastSale.cart}
                total={lastSale.total}
                onClose={() => setShowReceipt(false)}
            />
            )}          
    </div>
  )
}