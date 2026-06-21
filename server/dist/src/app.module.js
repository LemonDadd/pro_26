"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_module_1 = require("./prisma/prisma.module");
const auth_module_1 = require("./modules/auth/auth.module");
const user_module_1 = require("./modules/user/user.module");
const trip_module_1 = require("./modules/trip/trip.module");
const member_module_1 = require("./modules/member/member.module");
const expense_module_1 = require("./modules/expense/expense.module");
const vehicle_module_1 = require("./modules/vehicle/vehicle.module");
const settlement_module_1 = require("./modules/settlement/settlement.module");
const stats_module_1 = require("./modules/stats/stats.module");
const activity_module_1 = require("./modules/activity/activity.module");
const file_module_1 = require("./modules/file/file.module");
const template_module_1 = require("./modules/template/template.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            user_module_1.UserModule,
            trip_module_1.TripModule,
            member_module_1.MemberModule,
            expense_module_1.ExpenseModule,
            vehicle_module_1.VehicleModule,
            settlement_module_1.SettlementModule,
            stats_module_1.StatsModule,
            activity_module_1.ActivityModule,
            file_module_1.FileModule,
            template_module_1.TemplateModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map