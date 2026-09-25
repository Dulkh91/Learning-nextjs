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



export default function Products(){
    const [products, setProducts] =  useState<any[]>([])

    useEffect(()=>{
        fetch('/api/products')
        .then(r=>r.json())
        .then(setProducts)
    },[])



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
                        {product.image? <img src={product.image} className=" w- h-20 object-cover flex justify-center items-center rounded-md" /> 
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