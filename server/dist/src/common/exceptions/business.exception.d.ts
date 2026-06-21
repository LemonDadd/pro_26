import { HttpException, HttpStatus } from '@nestjs/common';
export declare class BusinessException extends HttpException {
    constructor(code: number, message: string, status?: HttpStatus);
}
export declare const ErrorCodes: {
    readonly PARAM_ERROR: {
        readonly code: 10001;
        readonly message: "参数错误";
        readonly status: HttpStatus.BAD_REQUEST;
    };
    readonly UNAUTHORIZED: {
        readonly code: 10002;
        readonly message: "未授权";
        readonly status: HttpStatus.UNAUTHORIZED;
    };
    readonly TOKEN_EXPIRED: {
        readonly code: 10003;
        readonly message: "令牌过期";
        readonly status: HttpStatus.UNAUTHORIZED;
    };
    readonly FORBIDDEN: {
        readonly code: 10004;
        readonly message: "权限不足";
        readonly status: HttpStatus.FORBIDDEN;
    };
    readonly NOT_FOUND: {
        readonly code: 10005;
        readonly message: "资源不存在";
        readonly status: HttpStatus.NOT_FOUND;
    };
    readonly USER_NOT_FOUND: {
        readonly code: 20001;
        readonly message: "用户不存在";
        readonly status: HttpStatus.NOT_FOUND;
    };
    readonly TRIP_NOT_FOUND: {
        readonly code: 20002;
        readonly message: "行程不存在";
        readonly status: HttpStatus.NOT_FOUND;
    };
    readonly EXPENSE_NOT_FOUND: {
        readonly code: 20003;
        readonly message: "费用记录不存在";
        readonly status: HttpStatus.NOT_FOUND;
    };
    readonly VEHICLE_NOT_FOUND: {
        readonly code: 20004;
        readonly message: "车辆不存在";
        readonly status: HttpStatus.NOT_FOUND;
    };
    readonly MEMBER_NOT_FOUND: {
        readonly code: 20005;
        readonly message: "成员不存在";
        readonly status: HttpStatus.NOT_FOUND;
    };
    readonly INVITE_CODE_INVALID: {
        readonly code: 30001;
        readonly message: "邀请码无效";
        readonly status: HttpStatus.BAD_REQUEST;
    };
    readonly TRIP_FULL: {
        readonly code: 30002;
        readonly message: "行程已满员";
        readonly status: HttpStatus.BAD_REQUEST;
    };
    readonly ALREADY_MEMBER: {
        readonly code: 30003;
        readonly message: "已是行程成员";
        readonly status: HttpStatus.BAD_REQUEST;
    };
    readonly FILE_UPLOAD_FAILED: {
        readonly code: 40001;
        readonly message: "文件上传失败";
        readonly status: HttpStatus.INTERNAL_SERVER_ERROR;
    };
    readonly FILE_TYPE_UNSUPPORTED: {
        readonly code: 40002;
        readonly message: "文件格式不支持";
        readonly status: HttpStatus.BAD_REQUEST;
    };
    readonly FILE_TOO_LARGE: {
        readonly code: 40003;
        readonly message: "文件大小超限";
        readonly status: HttpStatus.BAD_REQUEST;
    };
    readonly INTERNAL_ERROR: {
        readonly code: 50000;
        readonly message: "服务器内部错误";
        readonly status: HttpStatus.INTERNAL_SERVER_ERROR;
    };
};
export declare function throwBiz(err: {
    code: number;
    message: string;
    status: HttpStatus;
}, message?: string): never;
