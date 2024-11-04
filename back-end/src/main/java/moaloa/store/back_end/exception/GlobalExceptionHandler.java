package moaloa.store.back_end.exception;

import moaloa.store.back_end.exception.custom.ClawlingClickException;
import moaloa.store.back_end.exception.custom.UserNotFoundException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleUserNotFoundException(UserNotFoundException e) {
        Map<String, Object> response = new HashMap<>();
        response.put("status", 200); // OK
        response.put("errorCode", "USER_NOT_FOUND");
        response.put("message", e.getMessage());
        return ResponseEntity.ok(response);
    }
    @ExceptionHandler(ClawlingClickException.class)
    public ResponseEntity<Map<String, Object>> ClawlingClickException(ClawlingClickException e) {
        Map<String, Object> response = new HashMap<>();
        response.put("status", 200); // OK
        response.put("errorCode", "CRAWLING_CLICK_ERROR");
        response.put("message", e.getMessage());
        return ResponseEntity.ok(response);
    }
}
