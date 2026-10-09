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
import SkeletonLoading from "@/app/component/SkeletonLoading"


export default function Salse(){
    const [sales, setSales] = useState<any[]>([])
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(()=>{
        fetch('/api/sales')
        .then((res)=>{
            if(!res.ok) throw new Error("Failed fetch sales data!")
            return res.json()
        })
        .then(setSales)
        .catch((e)=>setError(e.message))
        .finally(()=>setLoading(false))
    },[])

    if(loading) return <SkeletonLoading/>
    if(error) return (<div>{error}</div>)

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
                                        return(<div key={i.name} className=" flex flex-wrap"><CardSale  name={i.name} qty={i.qty}/></div> )
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