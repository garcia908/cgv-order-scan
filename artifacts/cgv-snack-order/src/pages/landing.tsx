import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/lib/store';
import { Popcorn, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Landing() {
  const [, setLocation] = useLocation();
  const setTableNumber = useAppStore(state => state.setTableNumber);
  const tableNumber = useAppStore(state => state.tableNumber);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const meja = params.get('meja') ?? params.get('table');
    if (meja) {
      setTableNumber(`Meja ${meja}`);
      setLocation('/menu');
    }
  }, [setLocation, setTableNumber]);

  return (
    <div className="min-h-[100dvh] w-full max-w-md mx-auto flex flex-col bg-white relative overflow-hidden">
      {/* Decorative red gradient at top */}
      <div className="absolute top-0 inset-x-0 h-[40vh] bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />
      
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center z-10">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mb-8"
        >
          <div className="text-primary font-bold text-5xl tracking-tighter flex items-center justify-center gap-2">
            CGV <Popcorn className="w-10 h-10" />
          </div>
          <div className="text-sm font-semibold tracking-widest uppercase text-primary/80 mt-1">Snack Bar</div>
        </motion.div>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-10"
        >
          <h1 className="text-2xl font-bold text-foreground mb-2">Selamat Datang!</h1>
          <p className="text-muted-foreground">
            Pesan cemilan tanpa perlu antre.<br />
            Pesanan akan diantar ke tempat duduk kamu.
          </p>
        </motion.div>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-muted w-full rounded-2xl p-6 mb-12 border border-border/50 shadow-sm"
        >
          <div className="text-sm text-muted-foreground font-medium mb-1">Lokasi Kamu</div>
          <div className="text-2xl font-bold text-foreground">{tableNumber}</div>
        </motion.div>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="w-full space-y-4 mb-12 text-left"
        >
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">1</div>
            <div>
              <div className="font-semibold text-foreground">Pilih Menu Favoritmu</div>
              <div className="text-sm text-muted-foreground">Pilih cemilan dan minuman dari menu kami.</div>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">2</div>
            <div>
              <div className="font-semibold text-foreground">Bayar dengan Mudah</div>
              <div className="text-sm text-muted-foreground">Pilih cash, QRIS, atau debit dan staff akan membantu pembayarannya.</div>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">3</div>
            <div>
              <div className="font-semibold text-foreground">Tunggu di Tempat Duduk</div>
              <div className="text-sm text-muted-foreground">Karyawan kami akan mengantarkan pesananmu.</div>
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
            size="lg" 
            className="w-full h-14 text-lg rounded-xl shadow-lg shadow-primary/20"
            onClick={() => setLocation('/menu')}
          >
            Mulai Pesan <ArrowRight className="ml-2" />
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
