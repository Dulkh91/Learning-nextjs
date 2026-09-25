'use client'
import React, { useState } from 'react'

type Product = { 
    id: string; 
    name: string;
    price: number; 
    category: string; 
    image?: string 
}

type SelectProduct = {
    intailData: Product;
    onSuccess: (updated:Product)=> void
}

export default function UpdateProductForm({intailData, onSuccess}:SelectProduct) {

  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState(intailData || {
    name: '',
    price: '',
    category: '',
    image: ''
  }) // ការពារ formData ទៅជា undefined

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>)=>{
    const {name, value} = e.target
    // setFormData({...formData, [e.target.name]: e.target.value})
    setFormData((prev)=>({
        ...prev, [name]: value
    }))

  }

  // Handle ការជ្រើសរើសរូបភាព (Base64)
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          image: reader.result as string // បញ្ចូលរូបភាព Base64 ទៅក្នុង formData.image
        }))
      }
      reader.readAsDataURL(file)
    }
  }

// Handle Submit ទៅកាន់ API Route
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // '/api/products'
    
    try {
        
      const res = await fetch(`/api/products/${formData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      const result = await res.json()
      
      if (res.ok) {
        alert('កែប្រែទិន្នន័យជោគជ័យ!')
        onSuccess(result)

      } else {
        alert('មានបញ្ហាក្នុងការកែប្រែ!')
      }

    } catch (error) {
      console.error(error)
      alert('មាន Error កើតឡើង!')
    } finally {
      setLoading(false)
    }
  }

  
  return (
    <form onSubmit={handleSubmit} className="space-y-3 m-5 mt-6 border-t pt-4 bg-slate-900 p-4 rounded-xl text-gray-100">
      <input 
        name="name"  
        value={formData.name || ''}
        onChange={handleChange}
        placeholder="ឈ្មោះ ដូចជា Green Tea" 
        className="w-full border p-2 rounded-lg" required />
      <input 
        name="price" 
        value={formData.price}
        onChange={handleChange}
        type="number" 
        step="0.01" 
        placeholder="តម្លៃ" 
        className="w-full border p-2 rounded-lg" required />
      <input 
        name="category" 
        value={formData.category}
        onChange={handleChange}
        placeholder="ប្រភេទ" 
        className="w-full border p-2 rounded-lg" required />

      <div className="border-2 border-dashed p-3 rounded-lg">
        <input type="file" accept="image/*" onChange={onFileChange} className="w-full" />
        {formData.image && <img src={formData.image} className="w-24 h-24 object-cover mt-2 rounded-lg border" alt="preview" />}
        {!formData.image && <p className="text-xs text-gray-400 mt-2">* រើសរូបពី computer</p>}
      </div>

      <button disabled={loading } className="w-full bg-green-600 text-white py-2 rounded-lg font-bold disabled:opacity-30">
        {loading? 'កំពុងកែប្រែ...' : 'កែប្រែ'}
      </button>
    </form>
  )
}



