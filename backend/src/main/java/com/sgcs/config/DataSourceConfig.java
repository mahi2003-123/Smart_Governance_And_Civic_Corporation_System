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

/**
 * Intelligent DataSource Configuration with first-class support for
 * Neon Serverless PostgreSQL and standard cloud deployment providers (Render, Railway, etc.).
 *
 * Automatically parses connection URLs (including postgres:// and postgresql:// URIs),
 * enforces SSL mode for Neon, and configures resilient Hikari connection pooling.
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

        String username = rawUsername;
        String password = rawPassword;
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
                        if (username == null || username.trim().isEmpty()) {
                            username = parts[0];
                        }
                        if (password == null || password.trim().isEmpty()) {
                            password = parts[1];
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

        config.setJdbcUrl(jdbcUrl);
        if (username != null && !username.trim().isEmpty()) {
            config.setUsername(username.trim());
        }
        if (password != null) {
            config.setPassword(password);
        }

        // Hikari connection pool tuned for Neon serverless PostgreSQL:
        // Neon computes scale to zero or idle disconnect; these settings ensure robust auto-reconnect
        config.setMaximumPoolSize(10);
        config.setMinimumIdle(2);
        config.setConnectionTimeout(30000);  // 30 seconds for Neon cold compute startup
        config.setIdleTimeout(120000);       // 2 minutes
        config.setMaxLifetime(600000);       // 10 minutes (below Neon TCP drop limits)
        config.setKeepaliveTime(30000);      // Periodic TCP keepalive ping
        config.setConnectionTestQuery("SELECT 1");
        config.setPoolName("SGCS-Neon-HikariPool");

        // Mask credentials in logs for security
        String maskedUrl = jdbcUrl.replaceAll("(?<=//)[^@]+@", "***:***@");
        logger.info("Initializing HikariCP DataSource connected to: {}", maskedUrl);

        return new HikariDataSource(config);
    }
}
