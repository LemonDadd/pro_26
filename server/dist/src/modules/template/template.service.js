"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TemplateService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const activity_service_1 = require("../activity/activity.service");
const aa_calculator_1 = require("../../utils/aa-calculator");
const business_exception_1 = require("../../common/exceptions/business.exception");
let TemplateService = class TemplateService {
    constructor(prisma, activityService) {
        this.prisma = prisma;
        this.activityService = activityService;
    }
    async list(query) {
        const { tag, keyword, page, pageSize } = query;
        const where = {
            isPublic: true,
            ...(keyword ? { name: { contains: keyword } } : {}),
        };
        const [rows, total] = await Promise.all([
            this.prisma.tripTemplate.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * pageSize,
                take: pageSize,
            }),
            this.prisma.tripTemplate.count({ where }),
        ]);
        const list = rows.map((t) => this.format(t)).filter((t) => {
            if (!tag)
                return true;
            return t.tags.includes(tag);
        });
        return { list, total, page, pageSize, hasMore: page * pageSize < total };
    }
    async detail(id) {
        const tpl = await this.prisma.tripTemplate.findUnique({ where: { id } });
        if (!tpl)
            (0, business_exception_1.throwBiz)(business_exception_1.ErrorCodes.NOT_FOUND, '模板不存在');
        return this.format(tpl);
    }
    async apply(id, userId, dto) {
        const tpl = await this.prisma.tripTemplate.findUnique({ where: { id } });
        if (!tpl)
            (0, business_exception_1.throwBiz)(business_exception_1.ErrorCodes.NOT_FOUND, '模板不存在');
        const sampleDays = tpl.sampleDays ? JSON.parse(tpl.sampleDays) : [];
        const title = dto.title || `${tpl.name}之旅`;
        const trip = await this.prisma.trip.create({
            data: {
                title,
                destination: dto.destination || tpl.name,
                startDate: new Date(dto.startDate),
                endDate: new Date(dto.endDate),
                leaderId: userId,
                templateId: tpl.id,
                inviteCode: (0, aa_calculator_1.generateInviteCode)(),
                members: { create: { userId, role: 'leader', status: 'active' } },
                dayPlans: sampleDays.length
                    ? {
                        create: sampleDays.map((d) => ({
                            day: d.day,
                            destination: d.destination,
                            description: d.description,
                        })),
                    }
                    : undefined,
            },
        });
        await this.activityService.add(trip.id, userId, 'member_join', '创建了行程');
        return { tripId: trip.id, title: trip.title };
    }
    format(t) {
        return {
            id: t.id,
            name: t.name,
            description: t.description,
            cover: t.cover,
            estimatedDays: t.estimatedDays,
            estimatedBudget: t.estimatedBudget,
            categories: t.categories ? JSON.parse(t.categories) : [],
            tags: t.tags ? JSON.parse(t.tags) : [],
            sampleDays: t.sampleDays ? JSON.parse(t.sampleDays) : [],
            isPublic: t.isPublic,
        };
    }
};
exports.TemplateService = TemplateService;
exports.TemplateService = TemplateService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        activity_service_1.ActivityService])
], TemplateService);
//# sourceMappingURL=template.service.js.map