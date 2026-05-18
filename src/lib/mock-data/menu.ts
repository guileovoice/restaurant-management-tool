import { MenuItem } from '../types'

export const menuItems: MenuItem[] = [
  // Pães & Salgados
  {
    id: 'm1',
    tenantId: 'nypdq',
    name: 'Pão de Queijo (3 pack)',
    description: 'Traditional Brazilian cheese bread balls, crispy on the outside and chewy on the inside.',
    price: 8.50,
    category: 'Pães & Salgados',
    available: true,
    popular: true,
    allergens: ['Dairy', 'Eggs'],
    preparationTime: 8
  },
  {
    id: 'm2',
    tenantId: 'nypdq',
    name: 'Coxinha',
    description: 'Crispy dough filled with shredded seasoned chicken.',
    price: 4.50,
    category: 'Pães & Salgados',
    available: true,
    popular: true,
    allergens: ['Gluten', 'Dairy'],
    preparationTime: 5
  },
  {
    id: 'm3',
    tenantId: 'nypdq',
    name: 'Kibe',
    description: 'Deep-fried seasoned ground beef and bulgur wheat.',
    price: 4.50,
    category: 'Pães & Salgados',
    available: true,
    popular: false,
    allergens: ['Gluten'],
    preparationTime: 5
  },
  {
    id: 'm4',
    tenantId: 'nypdq',
    name: 'Empada de Palmito',
    description: 'Brazilian savory pastry filled with hearts of palm cream.',
    price: 5.00,
    category: 'Pães & Salgados',
    available: true,
    popular: false,
    allergens: ['Gluten', 'Dairy', 'Eggs'],
    preparationTime: 6
  },
  {
    id: 'm5',
    tenantId: 'nypdq',
    name: 'Pastéis (2 pack)',
    description: 'Crispy fried thin crust pastry with your choice of cheese or beef.',
    price: 7.50,
    category: 'Pães & Salgados',
    available: true,
    popular: true,
    allergens: ['Gluten', 'Dairy'],
    preparationTime: 7
  },

  // Doces
  {
    id: 'm6',
    tenantId: 'nypdq',
    name: 'Brigadeiro',
    description: 'Traditional Brazilian chocolate truffle.',
    price: 3.00,
    category: 'Doces',
    available: true,
    popular: true,
    allergens: ['Dairy'],
    preparationTime: 2
  },
  {
    id: 'm7',
    tenantId: 'nypdq',
    name: 'Beijinho',
    description: 'Coconut truffle, the sibling of Brigadeiro.',
    price: 3.00,
    category: 'Doces',
    available: true,
    popular: false,
    allergens: ['Dairy', 'Nuts'],
    preparationTime: 2
  },
  {
    id: 'm8',
    tenantId: 'nypdq',
    name: 'Quindim',
    description: 'Bright yellow baked custard made with sugar, egg yolks, and coconut.',
    price: 4.50,
    category: 'Doces',
    available: true,
    popular: false,
    allergens: ['Eggs', 'Nuts'],
    preparationTime: 3
  },
  {
    id: 'm9',
    tenantId: 'nypdq',
    name: 'Bolo de Rolo',
    description: 'Thin sponge cake rolled with guava paste.',
    price: 6.00,
    category: 'Doces',
    available: true,
    popular: true,
    allergens: ['Gluten', 'Eggs'],
    preparationTime: 3
  },

  // Bebidas
  {
    id: 'm10',
    tenantId: 'nypdq',
    name: 'Brazilian Coffee',
    description: 'Strong and smooth dark roast coffee.',
    price: 4.00,
    category: 'Bebidas',
    available: true,
    popular: true,
    allergens: [],
    preparationTime: 4
  },
  {
    id: 'm11',
    tenantId: 'nypdq',
    name: 'Guaraná Antarctica',
    description: 'Popular Brazilian soda with a unique berry flavor.',
    price: 3.50,
    category: 'Bebidas',
    available: true,
    popular: true,
    allergens: [],
    preparationTime: 1
  },
  {
    id: 'm12',
    tenantId: 'nypdq',
    name: 'Suco de Maracujá',
    description: 'Fresh passion fruit juice.',
    price: 5.50,
    category: 'Bebidas',
    available: true,
    popular: false,
    allergens: [],
    preparationTime: 5
  },
  {
    id: 'm13',
    tenantId: 'nypdq',
    name: 'Cafezinho',
    description: 'Small, strong Brazilian style espresso.',
    price: 2.50,
    category: 'Bebidas',
    available: true,
    popular: false,
    allergens: [],
    preparationTime: 3
  },

  // Combos
  {
    id: 'm14',
    tenantId: 'nypdq',
    name: 'Cheese Bread Combo',
    description: '6 pieces of Pão de Queijo + any drink.',
    price: 14.00,
    category: 'Combos',
    available: true,
    popular: true,
    allergens: ['Dairy', 'Eggs'],
    preparationTime: 10
  },
  {
    id: 'm15',
    tenantId: 'nypdq',
    name: 'Salgado Combo',
    description: '2 Salgados + 1 Brigadeiro + 1 drink.',
    price: 16.50,
    category: 'Combos',
    available: true,
    popular: false,
    allergens: ['Gluten', 'Dairy', 'Eggs'],
    preparationTime: 12
  },

  // Acai & Bowls
  {
    id: 'm16',
    tenantId: 'nypdq',
    name: 'Acai Bowl',
    description: 'Pure acai topped with granola, banana, and honey.',
    price: 12.00,
    category: 'Acai & Bowls',
    available: true,
    popular: true,
    allergens: ['Nuts'],
    preparationTime: 10
  },
  {
    id: 'm17',
    tenantId: 'nypdq',
    name: 'Acai Smoothies',
    description: 'Acai blended with banana and guarana syrup.',
    price: 9.00,
    category: 'Acai & Bowls',
    available: true,
    popular: false,
    allergens: [],
    preparationTime: 8
  },

  // Especiais do Dia
  {
    id: 'm18',
    tenantId: 'nypdq',
    name: 'Feijoada Bowl (Saturday)',
    description: 'Black bean stew with pork and beef, served over rice.',
    price: 18.00,
    category: 'Especiais do Dia',
    available: true,
    popular: true,
    allergens: [],
    preparationTime: 15
  }
]
