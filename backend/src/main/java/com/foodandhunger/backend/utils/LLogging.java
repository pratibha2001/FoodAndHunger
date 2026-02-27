package com.foodandhunger.backend.utils;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class LLogging {

    private static final Logger logger = LoggerFactory.getLogger("AppLogger");

    private static String format(String level, String message) {
        StackTraceElement element = Thread.currentThread().getStackTrace()[3]; // caller
        return String.format(
                "[%s] [File: %s] [Class: %s] [Method: %s] [Line: %d] → %s",
                level,
                element.getFileName(),
                element.getClassName(),
                element.getMethodName(),
                element.getLineNumber(),
                message
        );
    }

    public static void info(String msg) {
        logger.info(format("INFO", msg));
    }

    public static void warn(String msg) {
        logger.warn(format("WARN", msg));
    }

    public static void error(String msg) {
        logger.error(format("ERROR", msg));
    }

    public static void debug(String msg) {
        logger.debug(format("DEBUG", msg));
    }
}
