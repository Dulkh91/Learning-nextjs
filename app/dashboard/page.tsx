// 'use client'
// import { useEffect, useState } from 'react'
// import Link from 'next/link'

// type Sale = { 
//     id: string; 
//     total: number; 
//     items: string; 
//     createdAt: string 
// }

// export default function Dashboard() {
//   const [sales, setSales] = useState<Sale[]>([])

//   useEffect(() => {
//     fetch('/api/sales').then(r => r.json()).then(setSales)
//   }, [])

//   const today = new Date().toDateString()
//   const todaySales = sales.filter(s => new Date(s.createdAt).toDateString() === today)
  
//   const totalRevenue = sales.reduce((sum, s) => sum + s.total, 0)
//   const todayRevenue = todaySales.reduce((sum, s) => sum + s.total, 0)

//   return (
//     <div className="min-h-screen bg-gray-950 p-6">
//       <div className="flex justify-between items-center mb-6">
//         <h1 className="text-3xl font-bold">📊 Dashboard</h1>
//         <Link href="/pos" className="bg-black text-white px-4 py-2 rounded-xl">← ត្រឡប់ទៅ POS</Link>
//       </div>

//       {/* CARDS */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
//         <div className="bg-sky-400 p-6 rounded-xl border">
//           <p className="text-sm text-gray-500">លក់បានសរុប</p>
//           <p className="text-3xl font-bold">${totalRevenue.toFixed(2)}</p>
//           <p className="text-sm">{sales.length} វិក្កយបត្រ</p>
//         </div>
//         <div className="bg-white p-6 rounded-xl border">
//           <p className="text-sm text-gray-500">ថ្ងៃនេះ</p>
//           <p className="text-3xl font-bold text-green-600">${todayRevenue.toFixed(2)}</p>
//           <p className="text-sm">{todaySales.length} វិក្កយបត្រ</p>
//         </div>
//         <div className="bg-amber-500 text-white p-6 rounded-xl">
//           <p className="text-sm opacity-80">កែវជាមធ្យម</p>
//           <p className="text-3xl font-bold">${sales.length ? (totalRevenue / sales.length).toFixed(2) : '0.00'}</p>
//           <p className="text-sm opacity-80">ក្នុង 1 Bill</p>
//         </div>
//       </div>

//       {/* TABLE */}
//       <div className="bg-stone-800 rounded-xl border overflow-hidden">
//         <div className="p-4 font-bold border-b">ប្រវត្តិលក់ថ្មីៗ</div>
//         <div className="divide-y">
//           {sales.map(sale => {
//             const items = JSON.parse(sale.items) as {name: string, qty: number}[]
//             return (
//               <div key={sale.id} className="flex justify-between p-4 text-sm">

//                 <div>
//                   <div className="font-medium">{new Date(sale.createdAt).toLocaleString('km-KH')}</div>
//                   <div className="text-gray-500">{items.map(i => `${i.name} x${i.qty}`).join(', ')}</div>
//                 </div>
//                 <div className="font-bold">${sale.total.toFixed(2)}</div>
//               </div>
//             )
//           })}
//           {sales.length === 0 && <p className="p-6 text-center text-gray-400">អត់ទាន់មានការលក់...</p>}
//         </div>
//       </div>
//     </div>
//   )
// }



'use client'
import { useEffect, useState } from 'react'
import Analytics from '../component/Analytics'

export default function Dashboard() {
  const [products, setProducts] = useState<any[]>([])
  const [sales, setSales] = useState<any[]>([])

  useEffect(() => {
    fetch('/api/products').then(r => r.json()).then(setProducts)
    fetch('/api/sales').then(r => r.json()).then(setSales)
  }, [])

  // --- គណនា ---
  const todayStr = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Phnom_Penh' })
  
  const todaySales = sales.filter((s:any) => {
    const d = new Date(s.createdAt).toLocaleDateString('en-CA', { timeZone: 'Asia/Phnom_Penh' })
    return d === todayStr
  })

  // ថ្ងៃនេះលក់បានអ្វីខ្លះ
  const soldMap: Record<string, any> = {}
  todaySales.forEach((sale:any) => {
    const items = typeof sale.items === 'string' ? JSON.parse(sale.items) : sale.items
    items.forEach((it:any) => {
      if (!soldMap[it.id]) {
        const p = products.find(prod => prod.id === it.id)
        soldMap[it.id] = { 
          id: it.id, 
          name: it.name, 
          price: it.price, 
          qty: 0, 
          image: p?.image || null 
        }
      }
      soldMap[it.id].qty += it.qty
    })
  })

  const topProducts = Object.values(soldMap).sort((a:any,b:any)=>b.qty - a.qty)
  const todayRevenue = todaySales.reduce((sum, s:any) => sum + s.total, 0)
  const totalProducts = products.length

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
       <div className=' flex justify-between'>
         <div>
            <h1 className="text-3xl font-bold mb-1">Dashboard</h1>
            {/* <p className="text-gray-500 mb-6">សង្ខេបការលក់ថ្ងៃ {todayStr}</p> */}
         </div>
       </div>


        {/* KPI */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded-2xl shadow-sm border">
            <p className="text-sm text-gray-500">ផលិតផលសរុប</p>
            <p className="text-3xl font-bold mt-2">{totalProducts}</p>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border">
            <p className="text-sm text-gray-500">វិក្កយបត្រថ្ងៃនេះ</p>
            <p className="text-3xl font-bold mt-2">{todaySales.length}</p>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border">
            <p className="text-sm text-gray-500">ទំនិញលក់ថ្ងៃនេះ</p>
            <p className="text-3xl font-bold mt-2">{topProducts.reduce((s:any,i:any)=>s+i.qty,0)} </p>
          </div>
          <div className="bg-black text-white p-5 rounded-2xl shadow-sm">
            <p className="text-sm text-gray-300">ចំណូលថ្ងៃនេះ</p>
            <p className="text-3xl font-bold mt-2">${todayRevenue.toFixed(2)}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ថ្ងៃនេះលក់បានអ្វី */}
          <div className="lg:col-span-2 bg-stone-700 text-gray-100 rounded-2xl border shadow-sm">
            <Analytics/>

{/*             
            <div className="p-5 border-b flex justify-between">
              <h2 className="font-bold">ថ្ងៃនេះលក់បានអ្វីខ្លះ</h2>
              <span className="text-xs bg-gray-400 px-3 py-1 rounded-full">{topProducts.length} មុខ</span>
            </div>
            {topProducts.length === 0 ? (
              <div className="p-12 text-center text-gray-400">
                អត់ទាន់មានការលក់នៅថ្ងៃនេះ<br/>
                <span className="text-sm">ទៅ POS ដើម្បីលក់</span>
              </div>
            ) : (
              <div className="divide-y">
                {topProducts.map((item:any) => (
                  <div key={item.id} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl bg-gray-100 overflow-hidden flex items-center justify-center">
                        {item.image ? <img src={item.image} className="w-full h-full object-cover" /> : <span>☕</span>}
                      </div>
                      <div>
                        <p className="font-semibold">{item.name}</p>
                        <p className="text-xs text-gray-500">${item.price} x {item.qty}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{item.qty} កែវ</p>
                      <p className="text-sm text-gray-500">${(item.price * item.qty).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )} */}
          </div>

          {/* ផលិតផលទាំងអស់ + ស្តុក */}
          <div className="bg-stone-800 text-gray-100 rounded-2xl border shadow-sm">
            <div className="p-5 border-b font-bold">ផលិតផលទាំងអស់</div>
            <div className="p-3 space-y-3 max-h- overflow-auto">
              {products.map((p:any) => (
                <div key={p.id} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden">
                    {p.image ? <img src={p.image} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xs">☕</div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{p.name}</p>
                    <p className="text-xs text-gray-500">{p.category}</p>
                  </div>
                  <p className="text-sm font-bold">${p.price}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ប្រវត្តិលក់ */}
        <div className="mt-6 bg-mauve-900 text-gray-100 rounded-2xl border shadow-sm">
          <div className="p-5 border-b font-bold">ប្រវត្តិលក់ចុងក្រោយ</div>
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500">
                <tr><th className="p-3 text-left">ពេលវេលា</th><th className="p-3 text-left">ទំនិញ</th><th className="p-3 text-right">សរុប</th></tr>
              </thead>
              <tbody>
                {sales.slice(0,10).map((s:any)=>{
                  const items = typeof s.items === 'string' ? JSON.parse(s.items) : s.items
                  return (
                    <tr key={s.id} className="border-t">
                      <td className="p-3 text-xs">{new Date(s.createdAt).toLocaleString('km-KH', {timeZone:'Asia/Phnom_Penh'})}</td>
                      <td className="p-3">{items.map((i:any)=>`${i.name} x${i.qty}`).join(', ')}</td>
                      <td className="p-3 text-right font-bold">${s.total.toFixed(2)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  )
}
