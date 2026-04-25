import { useState } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/lib/store';
import { menuItems } from '@/lib/data';
import { Category } from '@/lib/types';
import { formatRupiah } from '@/lib/format';
import { Plus, ShoppingCart, Minus, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

const categories: Category[] = ['Combo', 'Popcorn', 'Snack', 'Minuman'];

export default function Menu() {
  const [, setLocation] = useLocation();
  const [activeCategory, setActiveCategory] = useState<Category>('Combo');
  const cart = useAppStore(state => state.cart);
  const addToCart = useAppStore(state => state.addToCart);
  const removeFromCart = useAppStore(state => state.removeFromCart);
  const updateQty = useAppStore(state => state.updateQty);

  const filteredItems = menuItems.filter(item => item.category === activeCategory);
  const cartTotalItems = cart.reduce((acc, item) => acc + item.qty, 0);
  const cartTotalPrice = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);

  return (
    <div className="min-h-[100dvh] w-full max-w-md mx-auto bg-gray-50 flex flex-col relative pb-24">
      {/* Header */}
      <div className="bg-white px-4 py-4 sticky top-0 z-20 border-b border-border">
        <h1 className="text-xl font-bold text-foreground">Menu</h1>
        <p className="text-sm text-muted-foreground">Pilih cemilan untuk menemanimu menonton</p>
      </div>

      {/* Categories */}
      <div className="bg-white sticky top-[69px] z-20 border-b border-border">
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex w-max p-4 gap-2">
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={activeCategory === cat ? 'default' : 'outline'}
                className="rounded-full px-6"
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </Button>
            ))}
          </div>
          <ScrollBar orientation="horizontal" className="hidden" />
        </ScrollArea>
      </div>

      {/* Menu List */}
      <div className="p-4 flex flex-col gap-4">
        {filteredItems.map(item => {
          const cartItem = cart.find(c => c.id === item.id);
          
          return (
            <motion.div 
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-3 flex gap-4 shadow-sm border border-border"
            >
              <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0 bg-muted">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 flex flex-col">
                <h3 className="font-semibold text-foreground leading-tight mb-1">{item.name}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{item.description}</p>
                <div className="mt-auto flex items-center justify-between">
                  <span className="font-bold text-foreground">{formatRupiah(item.price)}</span>
                  
                  {cartItem ? (
                    <div className="flex items-center gap-3 bg-muted rounded-full px-2 py-1">
                      <button 
                        className="w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-sm text-foreground"
                        onClick={() => cartItem.qty > 1 ? updateQty(item.id, -1) : removeFromCart(item.id)}
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="font-semibold text-sm w-4 text-center">{cartItem.qty}</span>
                      <button 
                        className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shadow-sm text-white"
                        onClick={() => updateQty(item.id, 1)}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <Button 
                      size="sm" 
                      className="rounded-full h-8 px-4 font-semibold"
                      onClick={() => addToCart({ id: item.id, name: item.name, price: item.price, image: item.image })}
                    >
                      Tambah
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Floating Cart Bar */}
      <AnimatePresence>
        {cartTotalItems > 0 && (
          <motion.div 
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-0 inset-x-0 w-full max-w-md mx-auto p-4 z-50"
          >
            <div 
              className="bg-primary text-primary-foreground rounded-2xl p-4 flex items-center justify-between shadow-xl cursor-pointer"
              onClick={() => setLocation('/cart')}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center relative">
                  <ShoppingCart className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 bg-white text-primary text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {cartTotalItems}
                  </span>
                </div>
                <div>
                  <div className="text-sm font-medium text-white/80">Total Pesanan</div>
                  <div className="font-bold">{formatRupiah(cartTotalPrice)}</div>
                </div>
              </div>
              <div className="font-semibold flex items-center">
                Lihat Keranjang <ArrowRight className="w-4 h-4 ml-2" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
