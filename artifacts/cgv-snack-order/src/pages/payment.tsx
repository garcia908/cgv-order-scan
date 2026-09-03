import { useState } from 'react';
import type { ReactNode } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { useAppStore } from '@/lib/store';
import { formatRupiah } from '@/lib/format';
import { ArrowLeft, Banknote, CreditCard, QrCode, Check, Loader2, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useCreateOrder, getListOrdersQueryKey, getGetOrdersSummaryQueryKey } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

type PaymentMethod = 'CASH' | 'QRIS' | 'DEBIT';
const deliverySchema = z.object({
  seatNumber: z.string().trim().min(1, 'Nomor kursi wajib diisi.'),
  auditorium: z.string().trim().min(1, 'Nomor auditorium wajib diisi.'),
  customerName: z.string().trim().min(1, 'Nama wajib diisi.'),
});
type DeliveryFormValues = z.infer<typeof deliverySchema>;

export default function Payment() {
  const [, setLocation] = useLocation();
  const cart = useAppStore(state => state.cart);
  const delivery = useAppStore(state => state.delivery);
  const setDelivery = useAppStore(state => state.setDelivery);
  const clearDelivery = useAppStore(state => state.clearDelivery);
  const clearCart = useAppStore(state => state.clearCart);
  const queryClient = useQueryClient();
  const createOrder = useCreateOrder();

  const [method, setMethod] = useState<PaymentMethod | null>(null);
  const [cashReceived, setCashReceived] = useState('');
  const form = useForm<DeliveryFormValues>({
    resolver: zodResolver(deliverySchema),
    defaultValues: delivery,
    mode: 'onTouched',
  });

  const total = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);

  const handleConfirm = (values: DeliveryFormValues) => {
    if (!method) return;

    const parsedCash = cashReceived === '' ? null : Number(cashReceived);
    if (method === 'CASH' && (parsedCash === null || !Number.isInteger(parsedCash) || parsedCash < total)) {
      toast.error('Masukkan nominal uang yang sama atau lebih besar dari total pesanan.');
      return;
    }

    setDelivery(values);
    createOrder.mutate(
      {
        data: {
          seatNumber: values.seatNumber,
          auditorium: values.auditorium,
          customerName: values.customerName,
          items: cart.map(c => ({ id: c.id, name: c.name, qty: c.qty, price: c.price })),
          subtotal: total,
          total,
          paymentMethod: method,
          cashReceived: method === 'CASH' ? parsedCash : null,
        },
      },
      {
        onSuccess: (order) => {
          clearCart();
          clearDelivery();
          queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetOrdersSummaryQueryKey() });
          setLocation(`/success?orderId=${order.id}`);
        },
        onError: (err) => {
          toast.error('Gagal membuat pesanan. Coba lagi.');
          console.error(err);
        },
      },
    );
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

      <Form {...form}>
      <form onSubmit={form.handleSubmit(handleConfirm)} className="p-4 flex-1 flex flex-col gap-6">
        <section className="rounded-2xl border border-border bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold">Detail pengantaran</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                Supaya staff menemukan bangkumu, isi tiga informasi berikut.
              </p>
            </div>
          </div>
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="seatNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kamu duduk di kursi berapa?</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Contoh: B12" autoComplete="off" data-testid="input-seat-number" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="auditorium"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Auditorium berapa?</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Contoh: Auditorium 5" autoComplete="off" data-testid="input-auditorium" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="customerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Atas nama siapa?</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Contoh: Budi" autoComplete="name" data-testid="input-customer-name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </section>

        <div>
          <h3 className="font-semibold mb-1">Pilih metode pembayaran</h3>
          <p className="mb-3 text-sm text-muted-foreground">Pembayaran dilakukan saat staff datang ke bangkumu.</p>
          <div className="space-y-3">
            <PaymentCard
              title="Cash"
              description="Siapkan uang tunai saat pesanan diantar"
              icon={<Banknote />}
              selected={method === 'CASH'}
              onClick={() => setMethod('CASH')}
            />
            <PaymentCard
              title="QRIS"
              description="Ditunggu, staff akan datang ke bangkumu"
              icon={<QrCode />}
              selected={method === 'QRIS'}
              onClick={() => setMethod('QRIS')}
            />
            <PaymentCard
              title="Debit"
              description="Ditunggu, staff akan datang ke bangkumu"
              icon={<CreditCard />}
              selected={method === 'DEBIT'}
              onClick={() => setMethod('DEBIT')}
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

            {method === 'CASH' && (
              <div>
                  <label htmlFor="cash-received" className="block text-sm font-semibold mb-2">
                   Uang kamu berapa?
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-semibold text-muted-foreground">Rp</span>
                  <input
                    id="cash-received"
                    type="number"
                    inputMode="numeric"
                    min={total}
                    step={1000}
                    value={cashReceived}
                    onChange={(event) => setCashReceived(event.target.value)}
                     placeholder="Contoh: 100000"
                     data-testid="input-cash-received"
                    className="h-12 w-full rounded-xl border border-input bg-background pl-12 pr-4 text-lg font-semibold outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                 <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                   Masukkan nominal uang yang kamu siapkan. Staff akan membawa kembalian.
                </p>
                {Number(cashReceived) >= total && (
                  <div className="mt-4 rounded-xl bg-green-50 p-3 text-sm text-green-700">
                    Perkiraan kembalian: <strong>{formatRupiah(Number(cashReceived) - total)}</strong>
                  </div>
                )}
              </div>
            )}

            {(method === 'QRIS' || method === 'DEBIT') && (
              <div className="rounded-xl bg-primary/5 p-4 text-center">
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                  {method === 'QRIS' ? <QrCode className="h-7 w-7" /> : <CreditCard className="h-7 w-7" />}
                </div>
                 <p className="font-semibold text-foreground">Ditunggu ya, staff akan datang ke bangkumu.</p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                   Tidak perlu mengisi nominal. Siapkan diri di kursimu, staff akan membantu pembayaran.
                </p>
              </div>
            )}
          </motion.div>
        )}
        <div className="h-4" />
      </form>
      </Form>

      <div className="fixed bottom-0 inset-x-0 w-full max-w-md mx-auto p-4 bg-white border-t border-border z-50">
        <Button
          size="lg"
          className="w-full h-14 text-lg rounded-xl"
          disabled={!method || createOrder.isPending}
          onClick={() => void form.handleSubmit(handleConfirm)()}
        >
          {createOrder.isPending ? (
            <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Memproses...</>
          ) : (
            'Lanjutkan Pembayaran'
          )}
        </Button>
      </div>
    </div>
  );
}

function PaymentCard({ title, description, icon, selected, onClick }: { title: string; description: string; icon: ReactNode; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full p-4 rounded-xl border-2 flex items-center gap-4 text-left transition-all ${
        selected ? 'border-primary bg-primary/5' : 'border-border bg-white hover:bg-muted/50'
      }`}
    >
      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${selected ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>
        {icon}
      </div>
       <span className="flex-1">
         <span className="block font-semibold">{title}</span>
         <span className="mt-1 block text-xs font-normal text-muted-foreground">{description}</span>
       </span>
      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selected ? 'border-primary bg-primary' : 'border-muted-foreground'}`}>
        {selected && <Check className="w-4 h-4 text-white" />}
      </div>
    </button>
  );
}
