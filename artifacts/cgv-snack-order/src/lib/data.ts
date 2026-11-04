import { MenuItem } from './types';

const image = (id: string, version: number) =>
  `https://cdn.cgv.id/uploads_v2/concessions/${id}.png?version=${version}`;

const menuOptions = (labels: string[], surcharge = 0, surchargeLabel?: string) =>
  labels.map(label => ({
    label,
    additionalPrice: surchargeLabel && label.includes(surchargeLabel) ? surcharge : 0,
  }));

export const menuItems: MenuItem[] = [
  // COMBO
  {
    id: 'combo-nestle',
    name: 'COMBO NESTLE',
    description: 'CGV Sampler + 1 pilihan minuman',
    price: 79000,
    category: 'Combo',
    image: image('108248', 1),
    options: menuOptions([
      'CGV SAMPLER + MILO CRUNCHY',
      'CGV SAMPLER + ICE CAPUCCINO',
      'CGV SAMPLER + BLACKCURRANT BOBA',
    ]),
  },
  {
    id: 'combo-duo',
    name: 'COMBO DUO',
    description: 'Popcorn + 2 pilihan minuman (caramel tambah Rp 8.000)',
    price: 95000,
    category: 'Combo',
    image: image('108319', 1),
    options: menuOptions([
      'POPCORN SALTY + JASMINE + JASMINE',
      'POPCORN SALTY + JASMINE + LEMONTEA',
      'POPCORN SALTY + LEMONTEA + LEMONTEA',
      'POPCORN SALTY + FANTA + FANTA',
      'POPCORN SALTY + FANTA + COCA COLA',
      'POPCORN CARAMEL + JASMINE + JASMINE',
      'POPCORN CARAMEL + JASMINE + LEMONTEA',
      'POPCORN CARAMEL + LEMONTEA + LEMONTEA',
      'POPCORN CARAMEL + FANTA + FANTA',
      'POPCORN CARAMEL + FANTA + COCA COLA',
    ], 8000, 'CARAMEL'),
  },
  {
    id: 'combo-double',
    name: 'COMBO DOUBLE',
    description: 'Popcorn salty & caramel + 2 pilihan minuman, free refill satu kali',
    price: 123000,
    category: 'Combo',
    image: image('112685', 1),
    options: menuOptions([
      'POPCORN SALTY & CARAMEL + LEMONTEA + JASMINE',
      'POPCORN SALTY & CARAMEL + LEMONTEA + LEMONTEA',
      'POPCORN SALTY & CARAMEL + JASMINE + JASMINE',
      'POPCORN SALTY & CARAMEL + COCA COLA + FANTA',
      'POPCORN SALTY & CARAMEL + FANTA + FANTA',
      'POPCORN SALTY & CARAMEL + COCA COLA + COCA COLA',
      'POPCORN SALTY & CARAMEL + LEMONTEA + COCA COLA',
      'POPCORN SALTY & CARAMEL + COCA COLA + JASMINE',
      'POPCORN SALTY & CARAMEL + FANTA + JASMINE',
    ]),
  },
  {
    id: 'combo-duo-nestle',
    name: 'COMBO DUO NESTLE',
    description: 'Popcorn + Milo Crunchy + Nescafe Cappuccino (caramel tambah Rp 8.000)',
    price: 105000,
    category: 'Combo',
    image: image('117927', 3),
    options: menuOptions([
      'POPCORN SALTY + MILO CRUNCHY + NESCAFE CAPUCCINO',
      'POPCORN CARAMEL + MILO CRUNCHY + NESCAFE CAPUCCINO',
    ], 8000, 'CARAMEL'),
  },
  {
    id: 'combo-hemat',
    name: 'COMBO HEMAT POPCORN + MINUM',
    description: 'Small popcorn salty + 1 pilihan minuman',
    price: 41000,
    category: 'Combo',
    image: image('108229', 1),
    options: menuOptions([
      'SMALL POPCORN SALTY + SPRITE',
      'SMALL POPCORN SALTY + MINERAL WATER',
      'SMALL POPCORN SALTY + MIZONE',
      'SMALL POPCORN SALTY + PULPY',
      'SMALL POPCORN SALTY + FRESSTEA',
      'POPCORN SALTY + COCA COLA',
    ]),
  },

  // POPCORN
  { id: 'popcorn-medium-salty', name: 'Medium Salty Popcorn', description: '', price: 46000, category: 'Popcorn', image: image('101012', 1) },
  { id: 'popcorn-medium-caramel', name: 'Medium Caramel Popcorn', description: '', price: 58000, category: 'Popcorn', image: image('105047', 1) },
  { id: 'popcorn-large-salty', name: 'Large Salty Popcorn', description: '', price: 70000, category: 'Popcorn', image: image('106666', 1) },
  { id: 'popcorn-large-caramel', name: 'Large Caramel Popcorn', description: '', price: 82000, category: 'Popcorn', image: image('106657', 1) },

  // SNACK
  { id: 'sausage-fries', name: 'Sausage & Fries', description: '', price: 55000, category: 'Snack', image: image('108615', 1) },
  { id: 'cgv-sampler', name: 'CGV Sampler', description: '', price: 60000, category: 'Snack', image: image('108089', 3) },
  { id: 'sausage-bun-beef', name: 'Sausage Bun Beef', description: '', price: 50000, category: 'Snack', image: image('116221', 2) },
  { id: 'french-fries', name: 'French Fries', description: '', price: 50000, category: 'Snack', image: image('101017', 1) },
  { id: 'fried-siomay', name: 'Fried Siomay', description: '', price: 50000, category: 'Snack', image: image('101021', 1) },

  // MINUMAN
  { id: 'cola', name: 'Coca-Cola', description: '', price: 36000, category: 'Minuman', image: image('101037', 1), options: [{ label: 'Medium' }, { label: 'Large', additionalPrice: 4000 }], optionsLabel: 'Pilih ukuran' },
  { id: 'fanta', name: 'Fanta', description: '', price: 36000, category: 'Minuman', image: image('101039', 1), options: [{ label: 'Medium' }, { label: 'Large', additionalPrice: 4000 }], optionsLabel: 'Pilih ukuran' },
  { id: 'sprite', name: 'Sprite', description: '', price: 36000, category: 'Minuman', image: image('101038', 1), options: [{ label: 'Medium' }, { label: 'Large', additionalPrice: 4000 }], optionsLabel: 'Pilih ukuran' },
  { id: 'jasmine-tea', name: 'Jasmine', description: '', price: 36000, category: 'Minuman', image: image('115531', 2), options: [{ label: 'Medium' }, { label: 'Large', additionalPrice: 4000 }], optionsLabel: 'Pilih ukuran' },
  { id: 'lemon-tea', name: 'Frestea Lemon', description: '', price: 36000, category: 'Minuman', image: image('115615', 3), options: [{ label: 'Medium' }, { label: 'Large', additionalPrice: 4000 }], optionsLabel: 'Pilih ukuran' },
  { id: 'milo-crunchy', name: 'MILO Crunchy', description: '', price: 50000, category: 'Minuman', image: image('114560', 1) },
  { id: 'ice-lychee-tea', name: 'Iced Lychee Tea', description: '', price: 52000, category: 'Minuman', image: image('111926', 1) },
  { id: 'mineral-water', name: 'Mineral Water 600ml', description: '', price: 22000, category: 'Minuman', image: image('100032', 1) },
  { id: 'blackcurrant-boba', name: 'Blackcurrant Boba', description: 'Ice Blackcurrant with Boba (16 oz)', price: 40000, category: 'Minuman', image: image('111531', 1) },
  { id: 'yakult-lemonade', name: 'Yakult Lemonade', description: 'Ice Lemonade with Yakult & Jelly Boba (16 oz)', price: 40000, category: 'Minuman', image: image('111530', 1) },
];
