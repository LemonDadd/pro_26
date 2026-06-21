"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ACTIVITY_TYPES = exports.MEMBER_ROLES = exports.TRIP_STATUS = exports.CURRENCIES = exports.SPLIT_TYPES = exports.CATEGORY_COLORS = exports.CATEGORY_EMOJIS = exports.CATEGORY_LABELS = exports.CATEGORIES = void 0;
exports.CATEGORIES = [
    'food',
    'hotel',
    'transport',
    'ticket',
    'fuel',
    'toll',
    'parking',
    'other',
];
exports.CATEGORY_LABELS = {
    food: '餐饮',
    hotel: '住宿',
    transport: '交通',
    ticket: '门票',
    fuel: '油费',
    toll: '过路费',
    parking: '停车费',
    other: '其他',
};
exports.CATEGORY_EMOJIS = {
    food: '🍜',
    hotel: '🏨',
    transport: '🚗',
    ticket: '🎫',
    fuel: '⛽',
    toll: '🛣️',
    parking: '🅿️',
    other: '📦',
};
exports.CATEGORY_COLORS = {
    food: '#ff7d00',
    hotel: '#165dff',
    transport: '#722ed1',
    ticket: '#00b42a',
    fuel: '#f53f3f',
    toll: '#13c2c2',
    parking: '#faad14',
    other: '#86909c',
};
exports.SPLIT_TYPES = ['equal', 'percentage', 'custom'];
exports.CURRENCIES = [
    { code: 'CNY', symbol: '¥', name: '人民币', rate: 1 },
    { code: 'USD', symbol: '$', name: '美元', rate: 7.2 },
    { code: 'EUR', symbol: '€', name: '欧元', rate: 7.8 },
    { code: 'JPY', symbol: '¥', name: '日元', rate: 0.05 },
    { code: 'GBP', symbol: '£', name: '英镑', rate: 9.1 },
    { code: 'HKD', symbol: 'HK$', name: '港币', rate: 0.92 },
];
exports.TRIP_STATUS = ['active', 'completed'];
exports.MEMBER_ROLES = ['leader', 'member'];
exports.ACTIVITY_TYPES = ['expense', 'member_join', 'settle'];
//# sourceMappingURL=index.js.map