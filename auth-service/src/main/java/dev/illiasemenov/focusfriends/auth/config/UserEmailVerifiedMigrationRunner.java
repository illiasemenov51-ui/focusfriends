package dev.illiasemenov.focusfriends.auth.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * Ensures existing auth databases can start after adding the email_verified flag.
 *
 * Older DBs do not have the column yet, and Hibernate's `ddl-auto=update` can fail
 * on a NOT NULL add-column path. We normalize the column on startup so the app
 * works with both fresh and already-populated databases.
 */
@Component
public class UserEmailVerifiedMigrationRunner implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(UserEmailVerifiedMigrationRunner.class);

    private final JdbcTemplate jdbcTemplate;

    public UserEmailVerifiedMigrationRunner(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(ApplicationArguments args) {
        jdbcTemplate.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified boolean");
        jdbcTemplate.execute("UPDATE users SET email_verified = false WHERE email_verified IS NULL");
        jdbcTemplate.execute("ALTER TABLE users ALTER COLUMN email_verified SET DEFAULT false");
        jdbcTemplate.execute("ALTER TABLE users ALTER COLUMN email_verified SET NOT NULL");
        log.info("Normalized users.email_verified column");
    }
}
