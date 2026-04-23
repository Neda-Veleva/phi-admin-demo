/**
 * Услуги за онлайн записване — съгласувани с публичната страница phi.bg
 * @see https://www.phi.bg/book-online
 */
export type BookOnlineServiceCategory = 'brows' | 'lips';

export interface BookOnlineService {
  id: string;
  title: string;
  description: string;
  duration: string;
  price: string;
  category: BookOnlineServiceCategory;
  /** VIP PASS услуги на сайта */
  isVipPass?: boolean;
}

export const BOOK_ONLINE_PAGE_URL = 'https://www.phi.bg/book-online';

export const bookOnlineServices: BookOnlineService[] = [
  {
    id: 'phi-brows',
    title: 'PhiBrows',
    description: 'микроблейдинг + ретуш',
    duration: '2 ч',
    price: '400 €',
    category: 'brows',
  },
  {
    id: 'hairstrokes',
    title: 'HAIRSTROKES',
    description:
      'Машинен метод от ново поколение, за прецизно оформяне на вежди с 3D косъмчета!',
    duration: '2 ч',
    price: '400 €',
    category: 'brows',
  },
  {
    id: 'vip-pass-brows',
    title: 'VIP PASS Вежди',
    description: 'извънреден час за вежди микроблейдинг + ретуш',
    duration: '2 ч',
    price: '500 €',
    category: 'brows',
    isVipPass: true,
  },
  {
    id: 'brows-maintenance',
    title: 'Поддръжка на вежди',
    description: 'за клиенти на MY FACE Beauty Studio',
    duration: '1 ч',
    price: '250 €',
    category: 'brows',
  },
  {
    id: 'powder-brows',
    title: 'PowderBrows',
    description: 'пудра вежди + ретуш',
    duration: '2 ч',
    price: '400 €',
    category: 'brows',
  },
  {
    id: 'phi-lips',
    title: 'PhiLips',
    description: 'микропигментация на устни + ретуш',
    duration: '2 ч 30 мин',
    price: '400 €',
    category: 'lips',
  },
  {
    id: 'vip-pass-lips',
    title: 'VIP PASS Устни',
    description: 'извънреден час за устни микропигментация на устни + ретуш',
    duration: '2 ч 30 мин',
    price: '500 €',
    category: 'lips',
    isVipPass: true,
  },
  {
    id: 'lips-maintenance',
    title: 'Поддръжка на устни',
    description: 'за клиенти на MY FACE Beauty Studio',
    duration: '1 ч 30 мин',
    price: '250 €',
    category: 'lips',
  },
];
