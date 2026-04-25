import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { useAppStore } from '@/lib/store';
import { formatRupiah } from '@/lib/format';
import { ArrowLeft, Trash2, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Cart() {
  const [, setLocation] = useLocation();
  const cart = useAppStore(state => state.cart);
  const updateQty = useAppStore(state => state.updateQty);
  const removeFromCart = useAppStore(state => state.removeFromCart);
  
  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);

  if (cart.length === 0) {
    return (
      <div className="min-h-[100dvh] w-full max-w-md mx-auto bg-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
          <ShoppingCart className="w-10 h-10 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-bold mb-2">Keranjang Masih Kosong</h2>
        <p className="text-muted-foreground mb-8">Silakan pilih cemilan dan minuman favoritmu.</p>
        <Button onClick={() => setLocation('/menu')} size="lg" className="rounded-xl w-full">
          Lihat Menu
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] w-full max-w-md mx-auto bg-gray-50 flex flex-col relative pb-32">
      {/* Header */}
      <div className="bg-white px-4 py-4 sticky top-0 z-20 border-b border-border flex items-center gap-3">
        <button onClick={() => window.history.back()} className="p-2 -ml-2 rounded-full hover:bg-muted">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-foreground">Keranjang Pesanan</h1>
          <p className="text-sm text-muted-foreground">Pastikan pesanan kamu sudah sesuai</p>
        </div>
      </div>

      <div className="p-4 flex-1">
        <div className="bg-white rounded-2xl shadow-sm border border-border p-4 mb-6">
          <div className="flex flex-col gap-6">
            {cart.map(item => (
              <div key={item.id} className="flex gap-4">
                <div className="w-20 h-20 rounded-lg bg-muted overflow-hidden shrink-0">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-semibold text-foreground leading-tight">{item.name}</h3>
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="text-muted-foreground hover:text-destructive p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="font-bold text-foreground text-sm mb-auto">
                    {formatRupiah(item.price)}
                  </div>
                  
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-3 bg-muted rounded-full px-2 py-1 w-fit">
                      <button 
                        className="w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-sm text-foreground"
                        onClick={() => item.qty > 1 ? updateQty(item.id, -1) : removeFromCart(item.id)}
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="font-semibold text-sm w-4 text-center">{item.qty}</span>
                      <button 
                        className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shadow-sm text-white"
                        onClick={() => updateQty(item.id, 1)}
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="text-sm font-bold text-primary ml-auto">
                      {formatRupiah(item.price * item.qty)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-border p-4">
          <h3 className="font-semibold mb-4">Rincian Pembayaran</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span>{formatRupiah(subtotal)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Pajak (Termasuk)</span>
              <span>Rp 0</span>
            </div>
            <div className="border-t border-dashed my-2 pt-2" />
            <div className="flex justify-between font-bold text-lg">
              <span>Total Keseluruhan</span>
              <span className="text-primary">{formatRupiah(subtotal)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 inset-x-0 w-full max-w-md mx-auto p-4 bg-white border-t border-border z-50">
        <Button 
          size="lg" 
          className="w-full h-14 text-lg rounded-xl"
          onClick={() => setLocation('/payment')}
        >
          Lanjut ke Pembayaran
        </Button>
      </div>
    </div>
  );
}

// Need to import shopping cart for empty state
import { ShoppingCart } from 'lucide-react';