'use client'
import { useEffect, useState } from "react";

export default function Products(){
    const [products, setProducts] = useState<any[]>([])


    useEffect(()=>{
        fetch('/api/products').then(r=> r.json()).then(setProducts)

        //fetch('/api/products').then(r => r.json()).then(setProducts)

    },[])   

    return(
        <>
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
        </>
    )
  
}