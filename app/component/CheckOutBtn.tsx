"use client"

type CartSumaryProp = {
    total: number,
    itemCount: number,
    onCheckOut: ()=> void

}

export default  function CheckOutBtn({total, itemCount, onCheckOut}:CartSumaryProp) {

    return(
        <div className="border-t pt-4 mt-4">
          <div className="flex justify-between text-xl font-bold mb-4">
            <span>Total:</span><span>${total.toFixed(2)}</span>
          </div>
          <button onClick={onCheckOut}
            disabled={itemCount === 0}
            className="w-full bg-black text-white py-3 rounded-xl font-bold disabled:opacity-30">
            CHECKOUT
          </button>
        </div>
    )
}