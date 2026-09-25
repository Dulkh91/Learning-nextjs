'use client'
import { useEffect,useState } from "react"
import { Button } from "@/components/ui/button"
import UpdateProductForm from "@/app/component/UpdateProductForm"

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export default function UpdateProducts(){
    const [products, setProducts] = useState<any[]>([])
    
        useEffect(()=>{
            fetch('/api/products').then(r=> r.json()).then(setProducts)
        },[])  
    
    // Function to update product in local state
    const handleProductUpdate = (updatedProduct:any) => {
        setProducts((prev) =>
        prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p))
        );
    };


    return (
          <div className="bg-stone-800 text-gray-100 rounded-2xl border shadow-sm mx-5">
            <div className="p-5 border-b font-bold">ផលិតផលទាំងអស់</div>
            <div className="p-3 space-y-3 max-h- overflow-auto">
              {products.map((p:any) => (
                <div key={p.id} className="flex items-center gap-3">
                  <div className=" w-26 h-16 rounded-sm bg-gray-100 overflow-hidden">
                    {p.image ? <img src={p.image} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xs">☕</div>}
                  </div>
                  <div className="flex gap-2 items-center font justify-between w-full">
                    <p className="text-sm font-medium truncate">{p.name}</p>
                    <p className="text-sm text-gray-500">{p.category}</p>
                  </div>
                    <p className="text-sm font-bold w-full flex justify-center">${p.price}</p>
                  {/* Action Button */}
                  <div>
                    <Dialog >
                            <DialogTrigger
                               render={
                                <Button size={"lg"} variant={"outline"} className={`bg-cyan-800`}>Edit</Button>
                                }>
                            </DialogTrigger>
                            
                            <DialogContent className={" bg-gray-600"}>
                                <UpdateProductForm 
                                 intailData={p}
                                  onSuccess={handleProductUpdate}
                                />
                            </DialogContent>
                            

                    </Dialog>


                    
                  </div>
                </div>
              ))}
            </div>
          </div>
    )
}