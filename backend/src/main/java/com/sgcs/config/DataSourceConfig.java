package com.sgcs.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.net.URI;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;

/**
 * Intelligent DataSource Configuration with first-class support for
 * Neon Serverless PostgreSQL and cloud deployment providers (Render, Railway, etc.).
 *
 * Automatically parses connection URLs (including postgres:// and postgresql:// URIs),
 * prioritizes URI credentials over fallback defaults, enforces SSL mode for Neon,
 * and configures an efficient Hikari connection pool tuned to allow serverless auto-suspend.
 */
@Configuration
public class DataSourceConfig {

    private static final Logger logger = LoggerFactory.getLogger(DataSourceConfig.class);

    @Value("${spring.datasource.url:#{null}}")
    private String rawDatasourceUrl;

    @Value("${spring.datasource.username:#{null}}")
    private String rawUsername;

    @Value("${spring.datasource.password:#{null}}")
    private String rawPassword;

    @Value("${spring.datasource.hikari.maximum-pool-size:5}")
    private int maxPoolSize;

    @Value("${spring.datasource.hikari.minimum-idle:0}")
    private int minIdle;

    @Value("${spring.datasource.hikari.connection-timeout:30000}")
    private long connectionTimeout;

    @Value("${spring.datasource.hikari.idle-timeout:120000}")
    private long idleTimeout;

    @Value("${spring.datasource.hikari.max-lifetime:600000}")
    private long maxLifetime;

    @Value("${spring.datasource.hikari.keepalive-time:0}")
    private long keepaliveTime;

    @Bean
    @Primary
    public DataSource dataSource() {
        // Resolve database URL from environment or configuration
        String envDbUrl = System.getenv("SPRING_DATASOURCE_URL");
        if (envDbUrl == null || envDbUrl.trim().isEmpty()) {
            envDbUrl = System.getenv("DATABASE_URL");
        }
        if (envDbUrl == null || envDbUrl.trim().isEmpty()) {
            envDbUrl = rawDatasourceUrl;
        }

        if (envDbUrl != null && envDbUrl.trim().startsWith("jdbc:h2:")) {
            HikariConfig h2Config = new HikariConfig();
            h2Config.setDriverClassName("org.h2.Driver");
            h2Config.setJdbcUrl(envDbUrl.trim());
            h2Config.setUsername(rawUsername != null && !rawUsername.trim().isEmpty() ? rawUsername.trim() : "sa");
            h2Config.setPassword(rawPassword != null ? rawPassword : "");
            h2Config.setMaximumPoolSize(5);
            h2Config.setMinimumIdle(1);
            h2Config.setPoolName("SGCS-Test-H2-Pool");
            logger.info("Initializing H2 in-memory test DataSource: {}", envDbUrl.trim());
            return new HikariDataSource(h2Config);
        }

        HikariConfig config = new HikariConfig();
        config.setDriverClassName("org.postgresql.Driver");

        // Check if credentials are provided explicitly in environment
        String explicitEnvUser = System.getenv("DB_USERNAME");
        if (explicitEnvUser == null || explicitEnvUser.trim().isEmpty()) {
            explicitEnvUser = System.getenv("SPRING_DATASOURCE_USERNAME");
        }

        String explicitEnvPass = System.getenv("DB_PASSWORD");
        if (explicitEnvPass == null || explicitEnvPass.trim().isEmpty()) {
            explicitEnvPass = System.getenv("SPRING_DATASOURCE_PASSWORD");
        }

        String username = (explicitEnvUser != null && !explicitEnvUser.trim().isEmpty()) ? explicitEnvUser.trim() : null;
        String password = (explicitEnvPass != null && !explicitEnvPass.trim().isEmpty()) ? explicitEnvPass : null;
        String jdbcUrl;

        if (envDbUrl != null && !envDbUrl.trim().isEmpty()) {
            String trimmed = envDbUrl.trim();

            // Detect if URL is in URI format (e.g., postgresql://user:pass@host:port/dbname?sslmode=require)
            if (trimmed.startsWith("postgres://") || trimmed.startsWith("postgresql://")) {
                try {
                    URI uri = URI.create(trimmed);
                    String userInfo = uri.getUserInfo();
                    if (userInfo != null && userInfo.contains(":")) {
                        String[] parts = userInfo.split(":", 2);
                        // Extract credentials from URI if not explicitly overridden by environment
                        if (username == null) {
                            username = URLDecoder.decode(parts[0], StandardCharsets.UTF_8);
                        }
                        if (password == null) {
                            password = URLDecoder.decode(parts[1], StandardCharsets.UTF_8);
                        }
                    }

                    int port = uri.getPort() != -1 ? uri.getPort() : 5432;
                    String path = uri.getPath() != null && !uri.getPath().isEmpty() ? uri.getPath() : "/sgcs_db";
                    String query = uri.getQuery();

                    // Ensure sslmode=require for Neon or cloud databases
                    if (query == null || !query.contains("sslmode")) {
                        query = (query == null || query.isEmpty()) ? "sslmode=require" : query + "&sslmode=require";
                    }

                    jdbcUrl = String.format("jdbc:postgresql://%s:%d%s?%s", uri.getHost(), port, path, query);
                } catch (Exception e) {
                    logger.warn("Could not parse URI database URL, falling back to prefix replacement: {}", e.getMessage());
                    jdbcUrl = trimmed.replaceFirst("^postgres(ql)?://", "jdbc:postgresql://");
                }
            } else {
                jdbcUrl = trimmed;
            }

            // If connecting to Neon (*.neon.tech) and sslmode is not explicitly specified, enforce require
            if (jdbcUrl.contains("neon.tech") && !jdbcUrl.contains("sslmode")) {
                jdbcUrl += (jdbcUrl.contains("?") ? "&" : "?") + "sslmode=require";
            }
        } else {
            // Default local fallback
            jdbcUrl = "jdbc:postgresql://localhost:5432/sgcs_db";
        }

        // Fall back to injected properties if username/password are still unresolved
        if (username == null && rawUsername != null && !rawUsername.trim().isEmpty()) {
            username = rawUsername.trim();
        }
        if (password == null && rawPassword != null) {
            password = rawPassword;
        }

        config.setJdbcUrl(jdbcUrl);
        if (username != null && !username.trim().isEmpty()) {
            config.setUsername(username.trim());
        }
        if (password != null) {
            config.setPassword(password);
        }

        // Apply environment overrides for pool size if specified
        int effectiveMaxPoolSize = maxPoolSize;
        String envMaxPool = System.getenv("DB_MAX_POOL_SIZE");
        if (envMaxPool != null && !envMaxPool.trim().isEmpty()) {
            try {
                effectiveMaxPoolSize = Integer.parseInt(envMaxPool.trim());
            } catch (NumberFormatException ignored) {}
        }

        int effectiveMinIdle = minIdle;
        String envMinIdle = System.getenv("DB_MIN_IDLE");
        if (envMinIdle != null && !envMinIdle.trim().isEmpty()) {
            try {
                effectiveMinIdle = Integer.parseInt(envMinIdle.trim());
            } catch (NumberFormatException ignored) {}
        }

        // HikariCP connection pool tuned for Render and Neon Serverless PostgreSQL:
        // - Small pool size (default: 5) prevents connection explosion on free tiers
        // - minIdle=0 allows idle connections to close after idleTimeout, allowing Neon to scale to zero
        // - connectionTimeout=30000ms gives Neon cold starts ample time to wake up
        // - idleTimeout=120000ms (2 min) closes idle connections before Neon's 5-min auto-suspend window
        // - keepaliveTime=0 avoids sending artificial pings that would prevent Neon from sleeping
        config.setMaximumPoolSize(effectiveMaxPoolSize);
        config.setMinimumIdle(effectiveMinIdle);
        config.setConnectionTimeout(connectionTimeout);
        config.setIdleTimeout(idleTimeout);
        config.setMaxLifetime(maxLifetime);
        if (keepaliveTime > 0) {
            config.setKeepaliveTime(keepaliveTime);
        }
        config.setPoolName("SGCS-HikariPool");

        // Mask credentials in logs for security
        String maskedUrl = jdbcUrl.replaceAll("(?<=//)[^@]+@", "***:***@");
        logger.info("Initializing HikariCP DataSource [url={}, maxPool={}, minIdle={}, connTimeout={}ms, idleTimeout={}ms]",
                maskedUrl, effectiveMaxPoolSize, effectiveMinIdle, connectionTimeout, idleTimeout);

        try {
            return new HikariDataSource(config);
        } catch (Exception ex) {
            String fullError = ex.getMessage() != null ? ex.getMessage() : "";
            Throwable current = ex.getCause();
            while (current != null) {
                if (current.getMessage() != null) {
                    fullError += " | " + current.getMessage();
                }
                current = current.getCause();
            }

            if (fullError.toLowerCase().contains("quota") || fullError.toLowerCase().contains("upgrade your plan")) {
                logger.error("================================================================================");
                logger.error("CRITICAL DEPLOYMENT FAILURE: NEON POSTGRESQL QUOTA EXCEEDED");
                logger.error("================================================================================");
                logger.error("The Neon PostgreSQL database rejected the connection with:");
                logger.error("  \"{}\"", fullError);
                logger.error("ROOT CAUSE:");
                logger.error("  Your Neon project has exceeded its Free Tier quota limits (typically the 100 CU-hours");
                logger.error("  compute limit or 0.5 GB storage limit).");
                logger.error("ACTION REQUIRED IN NEON CONSOLE (https://console.neon.tech):");
                logger.error("  1. Log into your Neon Console and check project usage under Settings / Usage.");
                logger.error("  2. Either upgrade your plan or resolve project usage/branches.");
                logger.error("  3. If a new project is created, update the DATABASE_URL environment variable");
                logger.error("     in your Render Web Service dashboard.");
                logger.error("Application startup aborted cleanly to protect data integrity and avoid corrupted state.");
                logger.error("================================================================================");
            } else {
                logger.error("Failed to initialize HikariCP connection pool for database: {}. Error: {}", maskedUrl, ex.getMessage());
            }
            throw ex;
        }
    }
}
