import { Trip, User, Expense, TripDayPlan, Vehicle, Participant } from '@/types';

export const mockCurrentUser: User = {
  id: 'user_001',
  nickname: '小明',
  avatar: 'https://picsum.photos/id/64/200/200',
  role: 'leader',
};

const mockMembersBase: Omit<User, 'role'>[] = [
  { id: 'user_001', nickname: '小明', avatar: 'https://picsum.photos/id/64/200/200' },
  { id: 'user_002', nickname: '小红', avatar: 'https://picsum.photos/id/91/200/200' },
  { id: 'user_003', nickname: '小刚', avatar: 'https://picsum.photos/id/177/200/200' },
  { id: 'user_004', nickname: '小美', avatar: 'https://picsum.photos/id/338/200/200' },
];

const mockMembers: User[] = mockMembersBase.map((m, i) => ({
  ...m,
  role: i === 0 ? 'leader' : 'member',
}));

const mockDays: TripDayPlan[] = [
  { day: 1, date: '2024-07-15', destination: '成都', description: '集合出发' },
  { day: 2, date: '2024-07-16', destination: '康定', description: '翻越折多山' },
  { day: 3, date: '2024-07-17', destination: '新都桥', description: '摄影天堂' },
  { day: 4, date: '2024-07-18', destination: '稻城', description: '稻城亚丁' },
  { day: 5, date: '2024-07-19', destination: '香格里拉', description: '返程' },
];

const mockVehicles: Vehicle[] = [
  {
    id: 'veh_001',
    tripId: 'trip_001',
    plateNumber: '川A·12345',
    model: '丰田普拉多',
    capacity: 5,
    fuelConsumption: 12,
    ownerId: 'user_001',
    owner: mockMembersBase[0],
  },
];

function buildParticipants(amount: number, userIds: string[]): Participant[] {
  const perPerson = Number((amount / userIds.length).toFixed(2));
  return userIds.map((id) => {
    const user = mockMembersBase.find((m) => m.id === id);
    return {
      id,
      nickname: user?.nickname || '',
      avatar: user?.avatar || '',
      splitAmount: perPerson,
    };
  });
}

const mockExpenses: Expense[] = [
  {
    id: 'exp_001',
    tripId: 'trip_001',
    amount: 680,
    category: 'hotel',
    description: '康定酒店两晚',
    payerId: 'user_001',
    participants: buildParticipants(680, ['user_001', 'user_002', 'user_003', 'user_004']),
    splitType: 'equal',
    note: '标间双床，含早餐',
    createdAt: Date.now() - 86400000 * 3,
    createdBy: 'user_001',
    payer: mockMembersBase[0],
  },
  {
    id: 'exp_002',
    tripId: 'trip_001',
    amount: 450,
    category: 'fuel',
    description: '成都到康定加油',
    payerId: 'user_002',
    participants: buildParticipants(450, ['user_001', 'user_002', 'user_003', 'user_004']),
    splitType: 'equal',
    note: '95号汽油 50升',
    createdAt: Date.now() - 86400000 * 2.5,
    createdBy: 'user_002',
    payer: mockMembersBase[1],
  },
  {
    id: 'exp_003',
    tripId: 'trip_001',
    amount: 320,
    category: 'food',
    description: '中午藏式火锅',
    payerId: 'user_003',
    participants: buildParticipants(320, ['user_001', 'user_002', 'user_003', 'user_004']),
    splitType: 'equal',
    note: '四人餐',
    createdAt: Date.now() - 86400000 * 2,
    createdBy: 'user_003',
    payer: mockMembersBase[2],
  },
  {
    id: 'exp_004',
    tripId: 'trip_001',
    amount: 560,
    category: 'ticket',
    description: '稻城亚丁门票',
    payerId: 'user_001',
    participants: buildParticipants(560, ['user_001', 'user_002', 'user_003', 'user_004']),
    splitType: 'equal',
    note: '含观光车',
    createdAt: Date.now() - 86400000 * 1.5,
    createdBy: 'user_001',
    payer: mockMembersBase[0],
  },
  {
    id: 'exp_005',
    tripId: 'trip_001',
    amount: 150,
    category: 'toll',
    description: '高速过路费',
    payerId: 'user_004',
    participants: buildParticipants(150, ['user_001', 'user_002', 'user_003', 'user_004']),
    splitType: 'equal',
    createdAt: Date.now() - 86400000,
    createdBy: 'user_004',
    payer: mockMembersBase[3],
  },
  {
    id: 'exp_006',
    tripId: 'trip_001',
    amount: 280,
    category: 'food',
    description: '晚餐烤全羊',
    payerId: 'user_002',
    participants: buildParticipants(280, ['user_001', 'user_002', 'user_003']),
    splitType: 'equal',
    note: '小美不吃羊肉，不参与',
    createdAt: Date.now() - 43200000,
    createdBy: 'user_002',
    payer: mockMembersBase[1],
  },
  {
    id: 'exp_007',
    tripId: 'trip_001',
    amount: 80,
    category: 'parking',
    description: '景区停车费',
    payerId: 'user_001',
    participants: buildParticipants(80, ['user_001', 'user_002', 'user_003', 'user_004']),
    splitType: 'equal',
    createdAt: Date.now() - 21600000,
    createdBy: 'user_001',
    payer: mockMembersBase[0],
  },
];

export const mockTrips: Trip[] = [
  {
    id: 'trip_001',
    title: '川西自驾之旅',
    destination: '川西环线',
    startDate: '2024-07-15',
    endDate: '2024-07-19',
    leaderId: 'user_001',
    leader: mockMembersBase[0],
    members: mockMembers,
    days: mockDays,
    vehicles: mockVehicles,
    expenses: mockExpenses,
    createdAt: Date.now() - 86400000 * 7,
    status: 'active',
    templateId: 'template_chuanxi',
    inviteCode: 'A1B2C3',
  },
  {
    id: 'trip_002',
    title: '三亚海岛度假',
    destination: '海南三亚',
    startDate: '2024-08-10',
    endDate: '2024-08-15',
    leaderId: 'user_001',
    leader: mockMembersBase[0],
    members: [mockMembers[0], mockMembers[1]],
    createdAt: Date.now() - 86400000 * 30,
    status: 'active',
    templateId: 'template_island',
    inviteCode: 'X9Y8Z7',
  },
  {
    id: 'trip_003',
    title: '新疆大环线',
    destination: '新疆',
    startDate: '2024-09-01',
    endDate: '2024-09-15',
    leaderId: 'user_002',
    leader: mockMembersBase[1],
    members: [mockMembers[1], mockMembers[2], mockMembers[0]],
    createdAt: Date.now() - 86400000 * 60,
    status: 'completed',
    templateId: 'template_xinjiang',
    inviteCode: 'M3N5P7',
  },
];
