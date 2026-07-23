package dev.illiasemenov.focusfriends.health.security;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Регрессионный тест на уязвимость: сервис раньше доверял заголовку X-User-Id
 * (или вообще не требовал аутентификации на некоторых путях) без проверки, что
 * запрос пришёл через gateway. Теперь любой запрос без верного X-Internal-Secret
 * должен быть отклонён (403), независимо от пути.
 */
class InternalSecretInterceptorTest {

    private static final String SECRET = "correct-secret";

    private final InternalSecretInterceptor interceptor = new InternalSecretInterceptor(SECRET);

    @Test
    void rejectsRequestWithoutSecretHeader() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/whatever");
        MockHttpServletResponse response = new MockHttpServletResponse();

        boolean proceed = interceptor.preHandle(request, response, new Object());

        assertThat(proceed).isFalse();
        assertThat(response.getStatus()).isEqualTo(403);
    }

    @Test
    void rejectsRequestWithWrongSecret() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/whatever");
        request.addHeader("X-Internal-Secret", "attacker-guess");
        MockHttpServletResponse response = new MockHttpServletResponse();

        boolean proceed = interceptor.preHandle(request, response, new Object());

        assertThat(proceed).isFalse();
        assertThat(response.getStatus()).isEqualTo(403);
    }

    @Test
    void allowsRequestWithCorrectSecret() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/whatever");
        request.addHeader("X-Internal-Secret", SECRET);
        MockHttpServletResponse response = new MockHttpServletResponse();

        boolean proceed = interceptor.preHandle(request, response, new Object());

        assertThat(proceed).isTrue();
    }
}
