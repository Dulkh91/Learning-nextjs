type CartItem = { 
name: string; 
price: number; 
qty: number 
}

type Props = {
  cart: CartItem[]
  total: number
  onClose: () => void
}

export default function Receipt({ cart, total, onClose }: Props) {
  const date = new Date().toLocaleString('km-KH')

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      {/* នេះជាផ្នែក Print */}
      <div id="receipt" className="bg-mauve-900 w- p-6 rounded-xl">
        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold">☕ COFFEE POS</h1>
          <p className="text-sm text-gray-500">{date}</p>
        </div>

        <div className="border-t border-dashed my-3"></div>

        {cart.map((item, i) => (
          <div key={i} className="flex justify-between text-sm mb-2">
            <span>{item.name} x{item.qty}</span>
            <span>${(item.price * item.qty).toFixed(2)}</span>
          </div>
        ))}

        <div className="border-t border-dashed my-3"></div>

        <div className="flex justify-between font-bold text-lg">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>

        <p className="text-center text-xs mt-6 text-gray-500">អរគុណ! សូមអញ្ជើញមកម្តងទៀត</p>

        {/* ប៊ូតុង មិន print */}
        <div className="flex gap-2 mt-6 print:hidden">
          <button onClick={onClose} className="flex-1 border py-2 rounded-lg">បិទ</button>
          <button onClick={() => window.print()} className="flex-1 bg-black text-white py-2 rounded-lg">បោះពុម្ព</button>
        </div>
      </div>

      <style>{`
        @media print {
          body * { visibility: hidden; }
          #receipt, #receipt * { visibility: visible; }
          #receipt { position: absolute; left: 0; top: 0; width: 100%; }
        }
      `}</style>
    </div>
  )
}