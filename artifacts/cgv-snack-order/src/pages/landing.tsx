import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Popcorn, ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Landing() {
  const [, setLocation] = useLocation();

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
           <div className="text-sm font-semibold tracking-widest uppercase text-primary/80 mt-1">Snack Bar 🍿</div>
        </motion.div>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-10"
        >
           <h1 className="text-2xl font-bold text-foreground mb-2">Selamat Datang di CGV! 🎬</h1>
          <p className="text-muted-foreground">
             Yuk, lengkapi pengalaman menontonmu dengan snack favorit.<br />
             Pesan dengan nyaman, kami antar langsung ke bangkumu. ✨
          </p>
        </motion.div>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
           className="bg-primary/5 w-full rounded-2xl p-6 mb-10 border border-primary/10 shadow-sm"
        >
           <div className="flex items-center justify-center gap-2 text-sm text-primary font-semibold mb-3">
             <Sparkles className="h-4 w-4" />
             <span>CGV Treats untuk momen menontonmu</span>
             <span aria-hidden="true">🥤</span>
           </div>
           <p className="text-sm leading-relaxed text-muted-foreground">
             Pilih menu favorit, isi detail tempat duduk saat checkout, dan nikmati film tanpa perlu antre.
           </p>
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
               <div className="font-semibold text-foreground">Pilih Menu Favoritmu 🍿</div>
               <div className="text-sm text-muted-foreground">Temukan cemilan dan minuman untuk menemani film.</div>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">2</div>
            <div>
               <div className="font-semibold text-foreground">Bayar dengan Mudah 💳</div>
              <div className="text-sm text-muted-foreground">Pilih cash, QRIS, atau debit sesuai kebutuhanmu.</div>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">3</div>
            <div>
               <div className="font-semibold text-foreground">Tunggu di Bangkumu 🪑</div>
              <div className="text-sm text-muted-foreground">Staff akan datang ke bangkumu membawa pesanan.</div>
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
