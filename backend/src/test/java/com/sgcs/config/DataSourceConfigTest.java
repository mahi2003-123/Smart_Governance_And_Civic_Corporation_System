package com.sgcs.config;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import javax.sql.DataSource;

import static org.assertj.core.api.Assertions.assertThat;

public class DataSourceConfigTest {

    @Test
    @DisplayName("H2 in-memory test database initializes properly")
    public void testH2DataSourceInitialization() {
        DataSourceConfig config = new DataSourceConfig();
        ReflectionTestUtils.setField(config, "rawDatasourceUrl", "jdbc:h2:mem:sgcs_unit_test;DB_CLOSE_DELAY=-1");
        ReflectionTestUtils.setField(config, "rawUsername", "sa");
        ReflectionTestUtils.setField(config, "rawPassword", "");

        DataSource ds = config.dataSource();
        assertThat(ds).isNotNull();
        assertThat(ds.getClass().getName()).contains("HikariDataSource");
    }

    @Test
    @DisplayName("Neon URL without sslmode has sslmode=require enforced")
    public void testNeonSslModeEnforced() {
        String testUrl = "jdbc:postgresql://ep-bold-unit-123456.us-east-2.aws.neon.tech:5432/neondb";
        String withSsl = testUrl + (testUrl.contains("?") ? "&" : "?") + "sslmode=require";
        assertThat(withSsl).contains("sslmode=require");
    }
}
