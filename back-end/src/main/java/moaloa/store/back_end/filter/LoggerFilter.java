package moaloa.store.back_end.filter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.util.ContentCachingRequestWrapper;
import org.springframework.web.util.ContentCachingResponseWrapper;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

@Slf4j
@Component
public class LoggerFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        // 진입전
        log.info(">>>> 진입 - {}", request.getRequestURI());

        var req = new ContentCachingRequestWrapper(request);
        var res = new ContentCachingResponseWrapper(response);

        filterChain.doFilter(req, res);

        // UTF-8 인코딩으로 변환하여 로깅
        String reqBody = new String(req.getContentAsByteArray(), StandardCharsets.UTF_8);
        log.info("Request: {}", reqBody);

        String resBody = new String(res.getContentAsByteArray(), StandardCharsets.UTF_8);
        log.info("Response: {}", resBody);

        log.info("<<<< 리턴값 - {}", response.getStatus());

        // 진입후
        res.copyBodyToResponse();
    }
}