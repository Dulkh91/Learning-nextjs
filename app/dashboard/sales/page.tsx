'use client'
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
import { useEffect, useState } from "react"
import CardSale from "@/app/component/CardSale"


export default function Salse(){
    const [sales, setSales] = useState<any[]>([])

    useEffect(()=>{
        fetch('/api/sales')
        .then((res)=> res.json())
        .then(setSales)
    },[])


    return(
        <Table>
            <TableCaption>Sales</TableCaption>
            <TableHeader>
                <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Sales</TableHead>
                    <TableHead>Price</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                    {sales.map((s:any)=>{
                        const date = new Date(s.createdAt)
                        const items = typeof s.items ==='string'
                            ? JSON.parse(s.items)
                            : s.items
                        return(
                            <TableRow key={s.id} className=" text-gray-300 font-medium">
                                <TableCell >
                                    {`${date.toDateString()} ${date.toLocaleTimeString()}` }
                                </TableCell>

                                <TableCell className="flex gap-2">
                                    {items.map((i:any)=> {
                                        return(<CardSale key={i.name} name={i.name} qty={i.qty} />)
                                    })}
                                 </TableCell>

                                <TableCell>
                                    {s.total.toFixed(2)}
                                </TableCell>

                            </TableRow>
                        )
                    })}
                   
                
            </TableBody>
        </Table>
    )
}