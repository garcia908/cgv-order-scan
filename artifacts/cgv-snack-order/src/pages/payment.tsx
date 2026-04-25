import { useState } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { useAppStore } from '@/lib/store';
import { formatRupiah } from '@/lib/format';
import { ArrowLeft, Wallet, Building2, QrCode, Check, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

type PaymentMethod = 'QRIS' | 'VA_BCA' | 'VA_MANDIRI';

export default function Payment() {
  const [, setLocation] = useLocation();
  const cart = useAppStore(state => state.cart);
  const tableNumber = useAppStore(state => state.tableNumber);
  const addOrder = useAppStore(state => state.addOrder);
  const clearCart = useAppStore(state => state.clearCart);
  
  const [method, setMethod] = useState<PaymentMethod | null>(null);
  
  const total = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);

  const handleConfirm = () => {
    if (!method) return;
    
    // Create new order
    const orderId = `CGV-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${Math.floor(Math.random()*10000).toString().padStart(4,'0')}`;
    
    addOrder({
      id: orderId,
      createdAt: Date.now(),
      table: tableNumber,
      items: [...cart],
      subtotal: total,
      total: total,
      paymentMethod: method,
      status: 'baru'
    });

    clearCart();
    // Pass orderId in state to success page
    setLocation(`/success?orderId=${orderId}`);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Disalin ke clipboard');
  };

  if (cart.length === 0) {
    setLocation('/');
    return null;
  }

  return (
    <div className="min-h-[100dvh] w-full max-w-md mx-auto bg-gray-50 flex flex-col relative pb-32">
      <div className="bg-white px-4 py-4 sticky top-0 z-20 border-b border-border flex items-center gap-3">
        <button onClick={() => window.history.back()} className="p-2 -ml-2 rounded-full hover:bg-muted">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-foreground">Pembayaran</h1>
          <p className="text-sm text-muted-foreground">Total: {formatRupiah(total)}</p>
        </div>
      </div>

      <div className="p-4 flex-1 flex flex-col gap-6">
        <div>
          <h3 className="font-semibold mb-3">Pilih Metode Pembayaran</h3>
          <div className="space-y-3">
            <PaymentCard 
              id="QRIS" 
              title="QRIS (Semua E-Wallet)" 
              icon={<QrCode />} 
              selected={method === 'QRIS'} 
              onClick={() => setMethod('QRIS')} 
            />
            <PaymentCard 
              id="VA_BCA" 
              title="Virtual Account BCA" 
              icon={<Building2 />} 
              selected={method === 'VA_BCA'} 
              onClick={() => setMethod('VA_BCA')} 
            />
            <PaymentCard 
              id="VA_MANDIRI" 
              title="Virtual Account Mandiri" 
              icon={<Wallet />} 
              selected={method === 'VA_MANDIRI'} 
              onClick={() => setMethod('VA_MANDIRI')} 
            />
          </div>
        </div>

        {method && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-white p-5 rounded-2xl border border-border shadow-sm"
          >
            <h4 className="font-bold text-center mb-4 border-b pb-4">Instruksi Pembayaran</h4>
            
            {method === 'QRIS' && (
              <div className="flex flex-col items-center text-center">
                <div className="w-48 h-48 bg-muted mb-4 rounded-xl flex items-center justify-center border-4 border-primary/20">
                  {/* Fake QR Code */}
                  <QrCode className="w-24 h-24 text-muted-foreground opacity-50" />
                </div>
                <p className="text-sm text-muted-foreground mb-4">Scan QR code di atas menggunakan aplikasi E-Wallet atau Mobile Banking Anda.</p>
              </div>
            )}

            {(method === 'VA_BCA' || method === 'VA_MANDIRI') && (
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">Nomor Virtual Account {method === 'VA_BCA' ? 'BCA' : 'Mandiri'}:</p>
                <div className="flex items-center justify-center gap-3 bg-muted p-3 rounded-lg mb-4">
                  <span className="font-mono text-xl font-bold tracking-widest text-primary">8808 1234 5678 9012</span>
                  <button onClick={() => copyToClipboard('8808123456789012')} className="text-muted-foreground hover:text-primary">
                    <Copy className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-sm text-muted-foreground mb-4">Silakan transfer sesuai nominal ke nomor Virtual Account di atas.</p>
              </div>
            )}
          </motion.div>
        )}
      </div>

      <div className="fixed bottom-0 inset-x-0 w-full max-w-md mx-auto p-4 bg-white border-t border-border z-50">
        <Button 
          size="lg" 
          className="w-full h-14 text-lg rounded-xl"
          disabled={!method}
          onClick={handleConfirm}
        >
          Saya Sudah Bayar
        </Button>
      </div>
    </div>
  );
}

function PaymentCard({ id, title, icon, selected, onClick }: any) {
  return (
    <div 
      onClick={onClick}
      className={`p-4 rounded-xl border-2 flex items-center gap-4 cursor-pointer transition-all ${
        selected ? 'border-primary bg-primary/5' : 'border-border bg-white hover:bg-muted/50'
      }`}
    >
      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${selected ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>
        {icon}
      </div>
      <span className="font-medium flex-1">{title}</span>
      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selected ? 'border-primary bg-primary' : 'border-muted-foreground'}`}>
        {selected && <Check className="w-4 h-4 text-white" />}
      </div>
    </div>
  );
}