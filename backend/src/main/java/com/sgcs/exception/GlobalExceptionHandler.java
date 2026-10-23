package com.sgcs.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.FieldError;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.NoHandlerFoundException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> fieldErrors = new HashMap<>();
        for (FieldError error : ex.getBindingResult().getFieldErrors()) {
            fieldErrors.put(error.getField(), error.getDefaultMessage());
        }

        Map<String, Object> body = new HashMap<>();
        body.put("status", 400);
        body.put("error", "Validation Failed");
        body.put("fieldErrors", fieldErrors);

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }

    /** 404 from resource not found, NoHandlerFoundException, or Spring Boot 3 NoResourceFoundException */
    @ExceptionHandler({ResourceNotFoundException.class, NoHandlerFoundException.class, NoResourceFoundException.class})
    public ResponseEntity<Map<String, Object>> handleNotFound(Exception ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                "status", 404,
                "error", ex.getMessage() != null ? ex.getMessage() : "Requested resource not found"
        ));
    }

    /** 405 Method Not Allowed. */
    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<Map<String, Object>> handleMethodNotSupported(HttpRequestMethodNotSupportedException ex) {
        return ResponseEntity.status(HttpStatus.METHOD_NOT_ALLOWED).body(Map.of(
                "status", 405,
                "error", "HTTP method '" + ex.getMethod() + "' is not supported for this endpoint"
        ));
    }

    /** 400 Bad Request for client/framework validation and conversion errors */
    @ExceptionHandler({
        BadRequestException.class,
        IllegalArgumentException.class,
        HttpMessageNotReadableException.class,
        MissingServletRequestParameterException.class,
        MethodArgumentTypeMismatchException.class
    })
    public ResponseEntity<Map<String, Object>> handleBadRequest(Exception ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                "status", 400,
                "error", ex.getMessage() != null ? ex.getMessage() : "Invalid request parameters"
        ));
    }

    @ExceptionHandler(TooManyRequestsException.class)
    public ResponseEntity<Map<String, Object>> handleTooManyRequests(TooManyRequestsException ex) {
        return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).body(Map.of(
                "status", 429,
                "error", ex.getMessage() != null ? ex.getMessage() : "Too many requests"
        ));
    }

    @ExceptionHandler(org.springframework.dao.DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, Object>> handleDataIntegrityViolation(org.springframework.dao.DataIntegrityViolationException ex) {
        String message = "Database constraint violation occurred";
        String rootMsg = ex.getRootCause() != null ? ex.getRootCause().getMessage() : ex.getMessage();
        if (rootMsg != null) {
            if (rootMsg.contains("uq_complaint_citizen_feedback")) {
                message = "Feedback has already been submitted for this complaint";
            } else if (rootMsg.contains("duplicate key") || rootMsg.contains("unique constraint")) {
                message = "A record with this identifier or unique attribute already exists";
            } else if (rootMsg.contains("violates check constraint")) {
                message = "Provided value violates database validation rules";
            } else if (rootMsg.contains("violates not-null constraint")) {
                message = "A required field was missing or null";
            }
        }

        Map<String, Object> body = new HashMap<>();
        body.put("status", 400);
        body.put("error", message);
        body.put("details", rootMsg);

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Map<String, Object>> handleAccessDenied(AccessDeniedException ex) {
        String msg = (ex.getMessage() != null && !ex.getMessage().trim().isEmpty())
                ? ex.getMessage()
                : "Access Denied: You do not have permission to perform this action";
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                "status", 403,
                "error", msg
        ));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGenericException(Exception ex) {
        System.err.println("Unhandled internal server error: " + ex.getMessage());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "status", 500,
                "error", "An internal server error occurred. Please try again later."
        ));
    }
}
