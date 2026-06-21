"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const mockUsers = [
    { id: 'user_001', openid: 'mock_openid_001', nickname: '小明', avatar: 'https://i.pravatar.cc/150?img=12', isLeader: true },
    { id: 'user_002', openid: 'mock_openid_002', nickname: '小红', avatar: 'https://i.pravatar.cc/150?img=5' },
    { id: 'user_003', openid: 'mock_openid_003', nickname: '小刚', avatar: 'https://i.pravatar.cc/150?img=33' },
    { id: 'user_004', openid: 'mock_openid_004', nickname: '小美', avatar: 'https://i.pravatar.cc/150?img=45' },
];
const templates = [
    {
        id: 'template_chuanxi',
        name: '川西自驾',
        description: '经典川西环线，雪山草原藏寨',
        cover: 'https://picsum.photos/id/1018/750/500',
        estimatedDays: 7,
        estimatedBudget: 3500,
        categories: ['hotel', 'food', 'fuel', 'toll', 'ticket', 'parking', 'other'],
        tags: ['自驾', '自然风光', '摄影'],
        sampleDays: [
            { day: 1, destination: '成都', description: '集合出发' },
            { day: 2, destination: '康定', description: '翻越折多山' },
            { day: 3, destination: '新都桥', description: '摄影天堂' },
            { day: 4, destination: '稻城', description: '稻城亚丁' },
            { day: 5, destination: '香格里拉', description: '普达措' },
            { day: 6, destination: '丽江', description: '古城漫步' },
            { day: 7, destination: '返程', description: '结束行程' },
        ],
    },
    {
        id: 'template_xinjiang',
        name: '新疆环线',
        description: '大美新疆，北疆深度游',
        cover: 'https://picsum.photos/id/1036/750/500',
        estimatedDays: 15,
        estimatedBudget: 8000,
        categories: ['hotel', 'food', 'fuel', 'toll', 'ticket', 'parking', 'transport', 'other'],
        tags: ['自驾', '长途', '自然风光', '人文'],
        sampleDays: [
            { day: 1, destination: '乌鲁木齐', description: '集合出发' },
            { day: 2, destination: '可可托海', description: '地质公园' },
            { day: 3, destination: '布尔津', description: '五彩滩' },
            { day: 4, destination: '喀纳斯', description: '湖怪传说' },
            { day: 5, destination: '禾木', description: '图瓦村落' },
        ],
    },
    {
        id: 'template_island',
        name: '海岛度假',
        description: '阳光沙滩，轻松度假',
        cover: 'https://picsum.photos/id/1044/750/500',
        estimatedDays: 5,
        estimatedBudget: 4000,
        categories: ['hotel', 'food', 'transport', 'ticket', 'other'],
        tags: ['度假', '海滩', '休闲'],
        sampleDays: [
            { day: 1, destination: '抵达', description: '入住酒店' },
            { day: 2, destination: '海边', description: '沙滩日光浴' },
            { day: 3, destination: '浮潜', description: '出海浮潜' },
        ],
    },
    {
        id: 'template_city_food',
        name: '城市美食之旅',
        description: '逛吃逛吃，美食打卡',
        cover: 'https://picsum.photos/id/292/750/500',
        estimatedDays: 3,
        estimatedBudget: 1500,
        categories: ['hotel', 'food', 'transport', 'ticket', 'other'],
        tags: ['美食', '城市', '短途'],
        sampleDays: [
            { day: 1, destination: '抵达', description: '小吃街' },
            { day: 2, destination: '市区', description: '网红店打卡' },
            { day: 3, destination: '返程', description: '伴手礼' },
        ],
    },
];
const mockExpenses = [
    { id: 'exp_001', amount: 680, category: 'hotel', description: '康定酒店两晚', payerId: 'user_001', participants: ['user_001', 'user_002', 'user_003', 'user_004'] },
    { id: 'exp_002', amount: 450, category: 'fuel', description: '成都到康定加油', payerId: 'user_002', participants: ['user_001', 'user_002', 'user_003', 'user_004'] },
    { id: 'exp_003', amount: 320, category: 'food', description: '中午藏式火锅', payerId: 'user_003', participants: ['user_001', 'user_002', 'user_003', 'user_004'] },
    { id: 'exp_004', amount: 560, category: 'ticket', description: '稻城亚丁门票', payerId: 'user_001', participants: ['user_001', 'user_002', 'user_003', 'user_004'] },
    { id: 'exp_005', amount: 150, category: 'toll', description: '高速过路费', payerId: 'user_004', participants: ['user_001', 'user_002', 'user_003', 'user_004'] },
    { id: 'exp_006', amount: 280, category: 'food', description: '晚餐烤全羊', payerId: 'user_002', participants: ['user_001', 'user_002', 'user_003'] },
    { id: 'exp_007', amount: 80, category: 'parking', description: '景区停车费', payerId: 'user_001', participants: ['user_001', 'user_002', 'user_003', 'user_004'] },
];
const round2 = (n) => Number(n.toFixed(2));
async function main() {
    console.log('🌱 开始种子数据初始化...');
    for (const u of mockUsers) {
        await prisma.user.upsert({
            where: { id: u.id },
            update: {},
            create: {
                id: u.id,
                openid: u.openid,
                nickname: u.nickname,
                avatar: u.avatar,
            },
        });
    }
    console.log(`✅ 创建 ${mockUsers.length} 个用户`);
    for (const t of templates) {
        await prisma.tripTemplate.upsert({
            where: { id: t.id },
            update: {},
            create: {
                id: t.id,
                name: t.name,
                description: t.description,
                cover: t.cover,
                estimatedDays: t.estimatedDays,
                estimatedBudget: t.estimatedBudget,
                categories: JSON.stringify(t.categories),
                tags: JSON.stringify(t.tags),
                sampleDays: JSON.stringify(t.sampleDays),
                isPublic: true,
            },
        });
    }
    console.log(`✅ 创建 ${templates.length} 个行程模板`);
    const tripId = 'trip_001';
    await prisma.trip.upsert({
        where: { id: tripId },
        update: {},
        create: {
            id: tripId,
            title: '川西自驾之旅',
            destination: '川西环线',
            startDate: new Date('2024-07-15'),
            endDate: new Date('2024-07-19'),
            leaderId: 'user_001',
            status: 'active',
            templateId: 'template_chuanxi',
            inviteCode: 'CHUAXI',
        },
    });
    for (const u of mockUsers) {
        await prisma.tripMember.upsert({
            where: { tripId_userId: { tripId, userId: u.id } },
            update: {},
            create: {
                tripId,
                userId: u.id,
                role: u.isLeader ? 'leader' : 'member',
                status: 'active',
            },
        });
    }
    console.log(`✅ 创建行程成员`);
    const days = [
        { day: 1, destination: '成都', description: '集合出发' },
        { day: 2, destination: '康定', description: '翻越折多山' },
        { day: 3, destination: '新都桥', description: '摄影天堂' },
        { day: 4, destination: '稻城', description: '稻城亚丁' },
        { day: 5, destination: '香格里拉', description: '返程' },
    ];
    for (const d of days) {
        await prisma.tripDayPlan.create({
            data: { tripId, day: d.day, destination: d.destination, description: d.description },
        }).catch(() => { });
    }
    await prisma.vehicle.upsert({
        where: { id: 'veh_001' },
        update: {},
        create: {
            id: 'veh_001',
            tripId,
            plateNumber: '川A·12345',
            model: '丰田普拉多',
            capacity: 5,
            fuelConsumption: 12,
            ownerId: 'user_001',
        },
    });
    console.log(`✅ 创建车辆`);
    for (const e of mockExpenses) {
        const per = round2(e.amount / e.participants.length);
        await prisma.expense.upsert({
            where: { id: e.id },
            update: {},
            create: {
                id: e.id,
                tripId,
                amount: e.amount,
                category: e.category,
                description: e.description,
                payerId: e.payerId,
                splitType: 'equal',
                currency: 'CNY',
                exchangeRate: 1,
                createdBy: e.payerId,
                splits: {
                    create: e.participants.map((uid) => ({
                        userId: uid,
                        amount: per,
                        percentage: null,
                    })),
                },
            },
        });
    }
    console.log(`✅ 创建 ${mockExpenses.length} 笔费用`);
    await prisma.activity.create({
        data: { tripId, userId: 'user_001', type: 'member_join', content: '创建了行程' },
    }).catch(() => { });
    console.log('🎉 种子数据初始化完成！');
    console.log('   测试登录 code: 任意字符串即可（mock 模式）');
}
main()
    .catch((e) => {
    console.error('❌ 种子数据初始化失败:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map