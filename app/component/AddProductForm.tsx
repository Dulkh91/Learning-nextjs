// 'use client'
// import { useState } from 'react'

// export default function AddProductForm({ onAdded }: { onAdded: () => void }) {
//   const [uploading, setUploading] = useState(false)
//   const [imageUrl, setImageUrl] = useState('')

//   const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0]
//     if (!file) return
//     setUploading(true)
//     const formData = new FormData()
//     formData.append('file', file)
//     const res = await fetch('/api/upload', { method: 'POST', body: formData })
//     const data = await res.json()
//     setImageUrl(data.url)
//     setUploading(false)
//   }

//   const handleSubmit = async (e: any) => {
//     e.preventDefault()
//     await fetch('/api/products', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({
//         name: e.target.name.value,
//         price: parseFloat(e.target.price.value),
//         category: e.target.category.value,
//         image: imageUrl
//       })
//     })
//     onAdded() // reload
//   }

//   return (
//     <form onSubmit={handleSubmit} className="space-y-2 mt-6 border-t pt-4">
//       <h3 className="font-bold">+ បន្ថែមទំនិញថ្មី</h3>
      
//       <input name="name" placeholder="ឈ្មោះ ដូចជា Green Tea" className="w-full border p-2 rounded" required />
//       <input name="price" type="number" step="0.01" placeholder="តម្លៃ" className="w-full border p-2 rounded" required />
//       <input name="category" placeholder="ប្រភេទ" className="w-full border p-2 rounded" required />

//       {/* UPLOAD */}
//       <div className="border border-dashed p-3 rounded">
//         <input type="file" accept="image/*" onChange={handleUpload} />
//         {uploading && <p className="text-sm text-amber-600">កំពុង Upload...</p>}
//         {imageUrl && <img src={imageUrl} className="w-20 h-20 object-cover mt-2 rounded" />}
//       </div>

//       <button disabled={uploading} className="w-full bg-green-600 text-white py-2 rounded disabled:opacity-50">
//         បន្ថែមទំនិញ
//       </button>
//     </form>
//   )
// }






'use client'
import { useState } from 'react'

export default function AddProductForm({ onAdded }: { onAdded: () => void }) {
  const [image, setImage] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // ពិនិត្យទំហំ - មិនអោយលើស 5MB
    if (file.size > 5 * 1024 * 1024) {
      alert('រូបធំពេក! សូមរើសរូបក្រោម 5MB')
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      setImage(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const form = e.currentTarget
    const formData = new FormData(form)

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.get('name'),
          price: formData.get('price'),
          category: formData.get('category'),
          image: image
        })
      })

      if (res.ok) {
        form.reset()
        setImage('')
        onAdded()
        alert('បន្ថែមបានជោគជ័យ!')
      }
    } catch (err) {
      alert('មានបញ្ហា!')
    }
    setLoading(false)
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3 m-5 mt-6 border-t pt-4 bg-slate-900 p-4 rounded-xl text-gray-100">
      <h3 className="font-bold">+ បន្ថែមទំនិញថ្មី</h3>
      <input name="name" placeholder="ឈ្មោះ ដូចជា Green Tea" className="w-full border p-2 rounded-lg" required />
      <input name="price" type="number" step="0.01" placeholder="តម្លៃ" className="w-full border p-2 rounded-lg" required />
      <input name="category" placeholder="ប្រភេទ" className="w-full border p-2 rounded-lg" required />

      <div className="border-2 border-dashed p-3 rounded-lg">
        <input type="file" accept="image/*" onChange={onFileChange} className="w-full" />
        {image && <img src={image} className="w-24 h-24 object-cover mt-2 rounded-lg border" alt="preview" />}
        {!image && <p className="text-xs text-gray-400 mt-2">* រើសរូបពី computer</p>}
      </div>

      <button disabled={loading ||!image} className="w-full bg-green-600 text-white py-2 rounded-lg font-bold disabled:opacity-30">
        {loading? 'កំពុងបន្ថែម...' : 'បន្ថែមទំនិញ'}
      </button>
    </form>
  )
}



