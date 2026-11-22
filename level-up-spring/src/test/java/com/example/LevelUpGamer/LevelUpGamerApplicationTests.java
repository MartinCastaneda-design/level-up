package com.example.LevelUpGamer;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

@SpringBootTest
@TestPropertySource(properties = {
    "jwt.secret=ClaveSecretaSuperSeguraParaTestsDeIntegracion2026DuocUC!",
    "jwt.expiration=3600000",
    "jwt.refresh-expiration=86400000"
})
class LevelUpGamerApplicationTests {

    @Test
    void contextLoads() {
    }

}
