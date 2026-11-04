import { useState } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { formatRupiah } from '@/lib/format';
import { CheckCircle2, UtensilsCrossed } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GetOrderResponse } from '@workspace/api-zod';
import { useAppStore } from '@/lib/store';

export default function Success() {
  const [, setLocation] = useLocation();
  const lastOrder = useAppStore(state => state.lastOrder);
  const clearLastOrder = useAppStore(state => state.clearLastOrder);

  const params = new URLSearchParams(window.location.search);
  const orderIdParam = params.get('orderId');
  const orderId = orderIdParam ? Number(orderIdParam) : NaN;
  const validId = Number.isFinite(orderId) && orderId > 0;
  const [order] = useState(() => {
    if (!validId) return null;

    const currentOrder = GetOrderResponse.safeParse(lastOrder);
    if (currentOrder.success && currentOrder.data.id === orderId) {
      return currentOrder.data;
    }

    const cacheKey = `cgv-order-${orderId}`;
    let serializedOrder: string | null;
    try {
      serializedOrder = sessionStorage.getItem(cacheKey);
    } catch (error) {
      console.error('Could not read the order confirmation from this browser session.', error);
      return null;
    }
    if (!serializedOrder) return null;

    let cachedOrder: unknown;
    try {
      cachedOrder = JSON.parse(serializedOrder);
    } catch (error) {
      if (!(error instanceof SyntaxError)) throw error;
      sessionStorage.removeItem(cacheKey);
      return null;
    }

    const cached = GetOrderResponse.safeParse(cachedOrder);
    if (!cached.success || cached.data.id !== orderId) {
      sessionStorage.removeItem(cacheKey);
      return null;
    }
    return cached.data;
  });

  if (!validId) {
    return (
      <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center p-6 text-center">
        <p className="text-muted-foreground mb-4">Pesanan tidak ditemukan.</p>
        <Button onClick={() => setLocation('/menu')}>Kembali ke Menu</Button>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center p-6 text-center">
        <p className="text-muted-foreground mb-4">
          Bukti pesanan tidak tersedia di sesi ini. Cek notifikasi Telegram atau kembali ke menu.
        </p>
        <Button onClick={() => setLocation('/menu')}>Kembali ke Menu</Button>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] w-full max-w-md mx-auto bg-primary text-primary-foreground flex flex-col relative overflow-hidden">
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
          <h1 className="text-3xl font-bold mb-2">Pesanan Diterima!</h1>
          <p className="text-primary-foreground/80 mb-8">
            Pesananmu sedang disiapkan. Ditunggu ya, staff akan datang ke bangkumu di {order.auditorium}, kursi {order.seatNumber}.
          </p>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white text-foreground w-full rounded-2xl p-6 mb-8 text-left shadow-lg relative"
        >
          <div className="absolute -top-2 left-0 w-full h-4 bg-[radial-gradient(circle_at_50%_0,transparent_4px,#fff_5px)] bg-[length:16px_10px] repeat-x"></div>

          <div className="border-b border-dashed pb-4 mb-4 mt-2 text-center">
            <div className="text-sm text-muted-foreground uppercase tracking-widest mb-1">Nomor Pesanan</div>
            <div className="font-mono text-2xl font-bold text-primary">{order.orderCode}</div>
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
            <div className="mb-3 rounded-xl bg-primary/5 p-3 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Auditorium</span><strong>{order.auditorium}</strong></div>
              <div className="mt-1 flex justify-between"><span className="text-muted-foreground">Kursi</span><strong>{order.seatNumber}</strong></div>
              <div className="mt-1 flex justify-between"><span className="text-muted-foreground">Atas nama</span><strong>{order.customerName}</strong></div>
            </div>
            <div className="flex justify-between font-bold text-lg">
              <span>Total Bayar</span>
              <span className="text-primary">{formatRupiah(order.total)}</span>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>Metode</span>
              <span>{paymentLabel(order.paymentMethod)}</span>
            </div>
            {order.paymentMethod === 'CASH' && order.cashReceived !== null && order.cashReceived !== undefined && (
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Perkiraan kembalian</span>
                <span>{formatRupiah(order.cashReceived - order.total)}</span>
              </div>
            )}
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
            onClick={() => {
              try {
                sessionStorage.removeItem(`cgv-order-${orderId}`);
              } catch (error) {
                console.error('Could not clear the order confirmation from this browser session.', error);
              }
              clearLastOrder();
              setLocation('/menu');
            }}
          >
            <UtensilsCrossed className="w-5 h-5 mr-2" /> Pesan Lagi
          </Button>
        </motion.div>
      </div>
    </div>
  );
}

function paymentLabel(method: string) {
  if (method === 'CASH') return 'Cash — dibayar saat diantar';
  if (method === 'QRIS') return 'QRIS — menunggu staff';
  if (method === 'DEBIT') return 'Debit — menunggu staff';
  return method;
}
