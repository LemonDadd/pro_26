export const CATEGORIES = [
  'food',
  'hotel',
  'transport',
  'ticket',
  'fuel',
  'toll',
  'parking',
  'other',
] as const;

export const CATEGORY_LABELS: Record<string, string> = {
  food: '餐饮',
  hotel: '住宿',
  transport: '交通',
  ticket: '门票',
  fuel: '油费',
  toll: '过路费',
  parking: '停车费',
  other: '其他',
};

export const CATEGORY_EMOJIS: Record<string, string> = {
  food: '🍜',
  hotel: '🏨',
  transport: '🚗',
  ticket: '🎫',
  fuel: '⛽',
  toll: '🛣️',
  parking: '🅿️',
  other: '📦',
};

export const CATEGORY_COLORS: Record<string, string> = {
  food: '#ff7d00',
  hotel: '#165dff',
  transport: '#722ed1',
  ticket: '#00b42a',
  fuel: '#f53f3f',
  toll: '#13c2c2',
  parking: '#faad14',
  other: '#86909c',
};

export const SPLIT_TYPES = ['equal', 'percentage', 'custom'] as const;

export const CURRENCIES = [
  { code: 'CNY', symbol: '¥', name: '人民币', rate: 1 },
  { code: 'USD', symbol: '$', name: '美元', rate: 7.2 },
  { code: 'EUR', symbol: '€', name: '欧元', rate: 7.8 },
  { code: 'JPY', symbol: '¥', name: '日元', rate: 0.05 },
  { code: 'GBP', symbol: '£', name: '英镑', rate: 9.1 },
  { code: 'HKD', symbol: 'HK$', name: '港币', rate: 0.92 },
];

export const TRIP_STATUS = ['active', 'completed'] as const;
export const MEMBER_ROLES = ['leader', 'member'] as const;
export const ACTIVITY_TYPES = ['expense', 'member_join', 'settle'] as const;
