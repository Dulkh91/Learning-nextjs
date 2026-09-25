
type Prop ={
    name: string;
    qty: number
}

export default function CardSale({name, qty}:Prop){
    return(
            <div className=" border rounded-md flex gap-2">
                <div className=" self-center p-1.5">{name}</div>
                <div className=" bg-gray-400 p-1.5 px-2 rounded-r-md">{qty}</div>
            </div>
        
    )
}