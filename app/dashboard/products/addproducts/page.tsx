'use client'

import AddProductForm from "@/app/component/AddProductForm";
import Products from "@/app/component/Products";

export default function AddProductPage(){
    return(
        <div className=" gap-2">
            <AddProductForm onAdded={()=>location.reload()}/>
            <div className="mx-4">
                <Products/>
            </div>
            
        </div>

    )
}