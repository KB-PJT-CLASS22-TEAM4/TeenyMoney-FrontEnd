package org.scoula.security.util;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

class JwtProcessorTest {
    private final JwtProcessor jwtProcessor =
            new JwtProcessor("test-jwt-secret-key-at-least-32-bytes");

    @Test
    void generateToken() {
        String token = jwtProcessor.generateToken("user0");

        assertNotNull(token);
    }

    @Test
    void getUsername() {
        String username = "user0";
        String token = jwtProcessor.generateToken(username);

        assertEquals(username, jwtProcessor.getUsername(token));
    }

    @Test
    void validateToken() {
        String token = jwtProcessor.generateToken("user0");

        assertTrue(jwtProcessor.validateToken(token));
    }
}
