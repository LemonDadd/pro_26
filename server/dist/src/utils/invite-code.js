"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateUniqueInviteCode = generateUniqueInviteCode;
const aa_calculator_1 = require("./aa-calculator");
const business_exception_1 = require("../common/exceptions/business.exception");
const MAX_RETRIES = 10;
async function generateUniqueInviteCode(prisma) {
    for (let i = 0; i < MAX_RETRIES; i++) {
        const code = (0, aa_calculator_1.generateInviteCode)();
        const existing = await prisma.trip.findUnique({
            where: { inviteCode: code },
            select: { id: true },
        });
        if (!existing)
            return code;
    }
    (0, business_exception_1.throwBiz)(business_exception_1.ErrorCodes.INTERNAL_ERROR, '生成唯一邀请码失败，请重试');
}
//# sourceMappingURL=invite-code.js.map