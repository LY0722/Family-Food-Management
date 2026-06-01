package com.jdzu.familyfood.utils;

import java.util.HashMap;
import java.util.Map;

public class ResponseBuilder {

    public static Map<String, Object> success(String message, Object data) {
        Map<String, Object> response = new HashMap<>();
        response.put("code", 200);
        response.put("message", message);
        response.put("data", data);
        return response;
    }

    public static Map<String, Object> success(String message) {
        return success(message, null);
    }

    public static Map<String, Object> error(int code, String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("code", code);
        response.put("message", message);
        response.put("data", null);
        return response;
    }

    public static Map<String, Object> error(String message) {
        return error(400, message);
    }
}