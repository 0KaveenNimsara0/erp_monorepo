import { SaleItem } from '@/lib/products'

interface ReceiptTemplateProps {
  invoice: string
  date: string
  items: SaleItem[]
  subtotal: number
  tax: number
  total: number
  paymentMethod: string
}

export default function ReceiptTemplate({
  invoice,
  date,
  items,
  subtotal,
  tax,
  total,
  paymentMethod
}: ReceiptTemplateProps) {
  return (
    <div id="printable-receipt" className="hidden print:block font-mono text-black">
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page {
            size: 80mm auto;
            margin: 0;
          }
          body * {
            visibility: hidden;
          }
          #printable-receipt, #printable-receipt * {
            visibility: visible;
          }
          #printable-receipt {
            position: absolute;
            left: 50%;
            top: 0;
            transform: translateX(-50%);
            width: 80mm;
            padding: 5mm;
            margin: 0;
          }
        }
      `}} />
      <div style={{ textAlign: 'center', marginBottom: '15px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 5px 0' }}>NEXUS ERP</h2>
        <p style={{ margin: '2px 0' }}>POS Terminal #01</p>
        <p style={{ margin: '2px 0' }}>{date}</p>
        <p style={{ margin: '2px 0' }}>Invoice: {invoice}</p>
      </div>
      
      <div style={{ borderBottom: '1px dashed black', margin: '10px 0' }}></div>
      
      <table style={{ width: '100%', fontSize: '12px' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', paddingBottom: '5px' }}>Item</th>
            <th style={{ textAlign: 'right', paddingBottom: '5px' }}>Qty</th>
            <th style={{ textAlign: 'right', paddingBottom: '5px' }}>Price</th>
          </tr>
        </thead>
        <tbody>
          {items.map(item => (
            <tr key={item.id}>
              <td style={{ padding: '3px 0' }}>{item.name}</td>
              <td style={{ textAlign: 'right', padding: '3px 0' }}>{item.qty}</td>
              <td style={{ textAlign: 'right', padding: '3px 0' }}>{(item.price * item.qty).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ borderBottom: '1px dashed black', margin: '10px 0' }}></div>

      <div style={{ display: 'flex', justifyContent: 'space-between', margin: '3px 0' }}>
        <span>Subtotal:</span>
        <span>{subtotal.toFixed(2)}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', margin: '3px 0' }}>
        <span>Tax:</span>
        <span>{tax.toFixed(2)}</span>
      </div>
      
      <div style={{ borderBottom: '1px solid black', margin: '5px 0' }}></div>

      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '14px', margin: '5px 0' }}>
        <span>TOTAL (Rs):</span>
        <span>{total.toFixed(2)}</span>
      </div>

      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <p style={{ margin: '2px 0' }}>Payment: {paymentMethod.toUpperCase()}</p>
        <p style={{ margin: '5px 0' }}>*** THANK YOU ***</p>
      </div>
    </div>
  )
}
