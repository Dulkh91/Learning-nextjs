'use client'
import { useEffect,useState } from "react"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { AlertCircleIcon } from "lucide-react"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"


import Image from "next/image"
import SkeletonLoading from "@/app/component/SkeletonLoading"


export default function Products(){
    const [products, setProducts] =  useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(()=>{
        
        fetch('/api/products')
        .then((r)=>{
            if(!r.ok) throw new Error('Failed to tetch product')
            return r.json()
        })
        .then(setProducts)
        .catch((e)=>setError(e.message))
        .finally(()=> setLoading(false))
        
    },[])

    if(error){
        return (
            <Alert variant="destructive" className="max-w-md mx-14">
                <AlertCircleIcon />
                <AlertTitle>Fetch failed</AlertTitle>
                <AlertDescription>
                    {error}
                </AlertDescription>
            </Alert>
  )
    }
    if(loading) return <div className=" mx-2"><SkeletonLoading/></div>

    return(
        <Table className="w-full">
            <TableCaption>Product List</TableCaption>

            <TableHeader>
                <TableRow>
                    <TableHead>Image</TableHead>
                     <TableHead>Name</TableHead>
                     <TableHead>Gatagory</TableHead>
                     <TableHead>Price</TableHead>

                </TableRow>
            </TableHeader>
            <TableBody>
                {products.map((product)=>(
                <TableRow key={product.id} className=" text-gray-100 font-bold text-lg">
                    <TableCell>
                        {product.imageId? <Image src={`/api/products/image/${product.imageId}`} width={100} height={100} alt={product.name} className="flex justify-center items-center rounded-md"/>
                        : <div className="w- h-20 flex items-center justify-center text-xs">☕</div>}
                    </TableCell>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>{product.price}</TableCell>

                </TableRow>
                ))}
               
            </TableBody>
            

        </Table>
    )
}

{/* <img src={`/api/products/image/${product.imageId}`} className=" w- h-20 object-cover flex justify-center items-center rounded-md" />  */}