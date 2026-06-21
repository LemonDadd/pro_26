"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorCodes = exports.BusinessException = void 0;
exports.throwBiz = throwBiz;
const common_1 = require("@nestjs/common");
class BusinessException extends common_1.HttpException {
    constructor(code, message, status = common_1.HttpStatus.BAD_REQUEST) {
        super({ code, message }, status);
    }
}
exports.BusinessException = BusinessException;
exports.ErrorCodes = {
    PARAM_ERROR: { code: 10001, message: '参数错误', status: common_1.HttpStatus.BAD_REQUEST },
    UNAUTHORIZED: { code: 10002, message: '未授权', status: common_1.HttpStatus.UNAUTHORIZED },
    TOKEN_EXPIRED: { code: 10003, message: '令牌过期', status: common_1.HttpStatus.UNAUTHORIZED },
    FORBIDDEN: { code: 10004, message: '权限不足', status: common_1.HttpStatus.FORBIDDEN },
    NOT_FOUND: { code: 10005, message: '资源不存在', status: common_1.HttpStatus.NOT_FOUND },
    USER_NOT_FOUND: { code: 20001, message: '用户不存在', status: common_1.HttpStatus.NOT_FOUND },
    TRIP_NOT_FOUND: { code: 20002, message: '行程不存在', status: common_1.HttpStatus.NOT_FOUND },
    EXPENSE_NOT_FOUND: { code: 20003, message: '费用记录不存在', status: common_1.HttpStatus.NOT_FOUND },
    VEHICLE_NOT_FOUND: { code: 20004, message: '车辆不存在', status: common_1.HttpStatus.NOT_FOUND },
    MEMBER_NOT_FOUND: { code: 20005, message: '成员不存在', status: common_1.HttpStatus.NOT_FOUND },
    INVITE_CODE_INVALID: { code: 30001, message: '邀请码无效', status: common_1.HttpStatus.BAD_REQUEST },
    TRIP_FULL: { code: 30002, message: '行程已满员', status: common_1.HttpStatus.BAD_REQUEST },
    ALREADY_MEMBER: { code: 30003, message: '已是行程成员', status: common_1.HttpStatus.BAD_REQUEST },
    FILE_UPLOAD_FAILED: { code: 40001, message: '文件上传失败', status: common_1.HttpStatus.INTERNAL_SERVER_ERROR },
    FILE_TYPE_UNSUPPORTED: { code: 40002, message: '文件格式不支持', status: common_1.HttpStatus.BAD_REQUEST },
    FILE_TOO_LARGE: { code: 40003, message: '文件大小超限', status: common_1.HttpStatus.BAD_REQUEST },
    INTERNAL_ERROR: { code: 50000, message: '服务器内部错误', status: common_1.HttpStatus.INTERNAL_SERVER_ERROR },
};
function throwBiz(err, message) {
    throw new BusinessException(err.code, message ?? err.message, err.status);
}
//# sourceMappingURL=business.exception.js.map