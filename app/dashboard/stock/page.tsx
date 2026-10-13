"use client"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import React, { useState, useEffect } from "react"
import SkeletonLoading from "@/app/component/SkeletonLoading"


type Product = { id: string; name: string; price: number; stock:number }
type StockMovement = { id: string; quantity: number; note: string | null; createdAt: string; product: { id: string; name: string } }

export default function Stock(){
const [products, setProducts] = useState<Product[]>([])
const [history, setHistory] = useState<StockMovement[]>([])
const [loading, setLoading] = useState(true)
const [error, setError] = useState<string | null>(null)
const [openProductId, setOpenProductId] = useState<string | null>(null)
const [errorForm, setErrorForm] = useState<string | null>(null)


useEffect(()=>{
    Promise.all([
        fetch('/api/products').then((r) => { if (!r.ok) throw new Error(); return r.json() }),
        fetch('/api/products/stock').then((r) => { if (!r.ok) throw new Error(); return r.json() }),
    ])
    .then(([productData, historyData]) => { setProducts(productData); setHistory(historyData) })
    .catch((e)=>setError(e.message))
    .finally(()=>setLoading(false))

},[])

const handleSubmit = async(e:React.FormEvent<HTMLFormElement>, productId: string)=>{
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)
    const dataInput = formData.get('stock')

    if(dataInput === '' || dataInput === null) {
        setErrorForm('សូមបញ្ចូលចំនួន stock នៅក្នុងប្រអប់')
        return 
    }
    setErrorForm(null)

    try {
       const res = await fetch('/api/products/stock',{
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                productId,
                quantity: Number(formData.get('stock')),
                note: formData.get('note')

            })
       });

       const data = await res.json()

       if(!res.ok) throw new Error(data.error || "Failed to add stock")

        // Update stock in the current products list 
        setProducts((prev) => prev.map((p) => 
            p.id === productId ? { ...p, 
            stock: data.product.stock } : p ) ); 

            setHistory((prev) => [
                { ...data.movement, product: { id: productId, name: products.find((p) => p.id === productId)?.name ?? "" } },
                ...prev,
            ].slice(0, 100));


            setOpenProductId(null)
            form.reset(); 
            setError(null);

    } catch (error) {
        setError(
            error instanceof Error
            ? error.message
            : "មានបញ្ហាក្នុងការបន្ថែម stock"
            );
    }
    
}

if(loading) return <SkeletonLoading/>
if(error) return <div>{error}</div>

    return (
        <>
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead >Product</TableHead>
                    <TableHead>Current Stock</TableHead>
                    <TableHead>Add Stock</TableHead>
                </TableRow>
            </TableHeader>

        <TableBody>
            {products.map((p)=>(
                <TableRow key={p.id}>
                    <TableCell>{p.name}</TableCell>
                    <TableCell>{p.stock}</TableCell>
                    <TableCell>
                        <AlertDialog 
                            open={openProductId === p.id}
                            onOpenChange={(open)=>{setOpenProductId(open? p.id: null)}}
                        >
                            <AlertDialogTrigger render={<Button/>}>
                                បន្ថែម
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <form onSubmit={(e)=>handleSubmit(e, p.id)}>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>បន្ថែម stock នៃ {p.name}</AlertDialogTitle>
                                        
                                        <Input name="stock"  
                                            placeholder="ចំនួនបន្ថែម" 
                                            type="number"
                                            min="1"
                                            onChange={()=>setErrorForm(null)}
                                        
                                        />
                                        <Input name="note" placeholder="កំណត់សម្គាល់ (ស្រេចចិត្ត)" />
                                        {errorForm && <div className="text-red-600">{errorForm}</div>}

                                    </AlertDialogHeader>
                                    <AlertDialogFooter className="mt-2">
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <Button type="submit">Save Stock</Button>
                                    </AlertDialogFooter>
                                </form>
                            </AlertDialogContent>
                        </AlertDialog>
                    </TableCell>
                </TableRow>
            ))}
    </TableBody>

        </Table>

        <section className="mt-8 space-y-3">
            <h2 className="text-lg font-semibold">ប្រវត្តិបន្ថែម Stock</h2>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>កាលបរិច្ឆេទ</TableHead>
                        <TableHead>ផលិតផល</TableHead>
                        <TableHead>ចំនួនបន្ថែម</TableHead>
                        <TableHead>កំណត់សម្គាល់</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {history.length === 0 ? (
                        <TableRow><TableCell colSpan={4} className="text-center">មិនទាន់មានប្រវត្តិបន្ថែម Stock ទេ</TableCell></TableRow>
                    ) : history.map((movement) => (
                        <TableRow key={movement.id}>
                            <TableCell>{new Date(movement.createdAt).toLocaleString()}</TableCell>
                            <TableCell>{movement.product.name}</TableCell>
                            <TableCell>+{movement.quantity}</TableCell>
                            <TableCell>{movement.note || "—"}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </section>
        </>
    )
}
