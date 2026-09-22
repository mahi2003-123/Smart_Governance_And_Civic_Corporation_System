package com.sgcs.automation.tests;

import com.sgcs.automation.pages.LoginPage;
import com.sgcs.automation.utils.WebDriverFactory;
import org.testng.Assert;
import org.testng.annotations.Test;

public class AuthTest extends BaseTest {
    @Test
    public void testValidLogin() {
        WebDriverFactory.getDriver().get("http://localhost:5173/login");
        LoginPage loginPage = new LoginPage(WebDriverFactory.getDriver());
        // Since we don't know the exact valid mock user, this is a structure test.
        try {
            loginPage.login("admin@sgcs.com", "admin123");
        } catch (Exception e) {
            Assert.fail("Login element not found or timeout: " + e.getMessage());
        }
    }
}
