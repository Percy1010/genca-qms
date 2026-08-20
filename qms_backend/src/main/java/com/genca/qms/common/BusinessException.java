package com.genca.qms.common;

import lombok.Getter;

/**
 * 业务异常：服务层校验失败时抛出，由全局异常处理器统一转换为响应。
 */
@Getter
public class BusinessException extends RuntimeException {

    private final int code;

    public BusinessException(String message) {
        super(message);
        this.code = 400;
    }

    public BusinessException(int code, String message) {
        super(message);
        this.code = code;
    }
}
