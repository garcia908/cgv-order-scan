import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { useAppStore } from '@/lib/store';
import { formatRupiah } from '@/lib/format';
import { CheckCircle2, ChevronRight, UtensilsCrossed } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Success() {
  const [, setLocation] = useLocation();
  const orders = useAppStore(state => state.orders);
  
  // Get order ID from URL
  const params = new URLSearchParams(window.location.search);
  const orderId = params.get('orderId');
  const order = orders.find(o => o.id === orderId) || orders[0]; // fallback to latest order

  useEffect(() => {
    // Confetti could go here if we wanted
  }, []);

  if (!order) return null;

  return (
    <div className="min-h-[100dvh] w-full max-w-md mx-auto bg-primary text-primary-foreground flex flex-col relative overflow-hidden">
      {/* Decorative background element */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-black/10 rounded-full blur-3xl"></div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center z-10">
        <motion.div 
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 15 }}
          className="w-24 h-24 bg-white text-primary rounded-full flex items-center justify-center mb-8 shadow-xl"
        >
          <CheckCircle2 className="w-12 h-12" />
        </motion.div>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className="text-3xl font-bold mb-2">Pembayaran Berhasil!</h1>
          <p className="text-primary-foreground/80 mb-8">
            Pesananmu sedang disiapkan. Silakan tunggu di {order.table}, Karyawan kami akan mengantarkan pesanan ke tempat duduk kamu.
          </p>
        </motion.div>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white text-foreground w-full rounded-2xl p-6 mb-8 text-left shadow-lg relative"
        >
          {/* Receipt jagged edge effect */}
          <div className="absolute -top-2 left-0 w-full h-4 bg-[radial-gradient(circle_at_50%_0,transparent_4px,#fff_5px)] bg-[length:16px_10px] repeat-x"></div>
          
          <div className="border-b border-dashed pb-4 mb-4 mt-2 text-center">
            <div className="text-sm text-muted-foreground uppercase tracking-widest mb-1">Nomor Pesanan</div>
            <div className="font-mono text-2xl font-bold text-primary">{order.id}</div>
          </div>
          
          <div className="space-y-3 mb-4 max-h-[40vh] overflow-y-auto">
            {order.items.map(item => (
              <div key={item.id} className="flex justify-between text-sm">
                <div className="flex gap-2">
                  <span className="font-semibold text-primary">{item.qty}x</span>
                  <span className="text-muted-foreground line-clamp-1">{item.name}</span>
                </div>
                <span className="font-medium shrink-0">{formatRupiah(item.price * item.qty)}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-dashed pt-4 mt-auto">
            <div className="flex justify-between font-bold text-lg">
              <span>Total Bayar</span>
              <span className="text-primary">{formatRupiah(order.total)}</span>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>Metode</span>
              <span>{order.paymentMethod}</span>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="w-full mt-auto"
        >
          <Button 
            variant="outline" 
            size="lg" 
            className="w-full h-14 text-lg rounded-xl bg-white/10 text-white border-white/20 hover:bg-white/20 hover:text-white backdrop-blur-sm"
            onClick={() => setLocation('/menu')}
          >
            <UtensilsCrossed className="w-5 h-5 mr-2" /> Pesan Lagi
          </Button>
        </motion.div>
      </div>
    </div>
  );
}