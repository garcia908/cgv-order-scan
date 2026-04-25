import { MenuItem } from './types';
import comboImg from '../assets/combo-solo.png';
import popcornImg from '../assets/popcorn-caramel.png';
import snackImg from '../assets/sausage-fries.png';
import hotdogImg from '../assets/hot-dog.png';
import colaImg from '../assets/coca-cola.png';

export const menuItems: MenuItem[] = [
  // COMBO
  { id: 'c1', name: 'CGV Combo Solo', description: 'Popcorn Regular Caramel + 1 Minuman Medium', price: 55000, category: 'Combo', image: comboImg },
  { id: 'c2', name: 'CGV Combo Duo', description: 'Popcorn Large Caramel + 2 Minuman Medium', price: 95000, category: 'Combo', image: comboImg },
  { id: 'c3', name: 'CGV Combo Double', description: '2 Popcorn Large + 2 Minuman Large + 1 Hot Dog', price: 145000, category: 'Combo', image: comboImg },
  { id: 'c4', name: 'CGV Combo Sampler', description: 'Popcorn Regular + Sausage & Fries + 2 Minuman Medium', price: 125000, category: 'Combo', image: comboImg },
  
  // POPCORN
  { id: 'p1', name: 'Popcorn Caramel Regular', description: 'Popcorn karamel manis renyah ukuran regular', price: 35000, category: 'Popcorn', image: popcornImg },
  { id: 'p2', name: 'Popcorn Caramel Large', description: 'Popcorn karamel ukuran besar untuk berbagi', price: 50000, category: 'Popcorn', image: popcornImg },
  { id: 'p3', name: 'Popcorn Cheese Regular', description: 'Popcorn rasa keju gurih ukuran regular', price: 38000, category: 'Popcorn', image: popcornImg },
  { id: 'p4', name: 'Popcorn Mushroom Original', description: 'Popcorn asin gurih klasik', price: 32000, category: 'Popcorn', image: popcornImg },

  // SNACK
  { id: 's1', name: 'Sausage & Fries', description: 'Sosis bakar + kentang goreng renyah', price: 45000, category: 'Snack', image: snackImg },
  { id: 's2', name: 'CGV Sampler', description: 'Mix kentang, sosis, chicken pop', price: 65000, category: 'Snack', image: snackImg },
  { id: 's3', name: 'Hot Dog Classic', description: 'Hot dog dengan saus mustard & saus tomat', price: 38000, category: 'Snack', image: hotdogImg },
  { id: 's4', name: 'Nachos Cheese', description: 'Keripik jagung dengan saus keju leleh', price: 35000, category: 'Snack', image: hotdogImg },

  // MINUMAN
  { id: 'm1', name: 'Coca-Cola Medium', description: 'Minuman soda segar ukuran medium', price: 22000, category: 'Minuman', image: colaImg },
  { id: 'm2', name: 'Coca-Cola Large', description: 'Minuman soda segar ukuran besar', price: 28000, category: 'Minuman', image: colaImg },
  { id: 'm3', name: 'Mineral Water', description: 'Air mineral 600ml', price: 15000, category: 'Minuman', image: colaImg },
  { id: 'm4', name: 'Iced Lemon Tea', description: 'Teh lemon dingin yang menyegarkan', price: 25000, category: 'Minuman', image: colaImg },
];
