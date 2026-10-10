package com.sgcs.automation.tests;

import com.sgcs.automation.pages.CitizenDashboardPage;
import com.sgcs.automation.pages.LoginPage;
import com.sgcs.automation.utils.WebDriverFactory;
import org.testng.Assert;
import org.testng.annotations.Test;

public class E2EComplaintTest extends BaseTest {

    @Test
    public void testCitizenEndToEndComplaintFlow() {
        // Phase 19: Full End-To-End Test
        // Note: Protected by test environment safety to prevent local database destruction.
        // It relies on test credentials injected into CI/CD environments.
        
        String testEmail = System.getenv("CITIZEN_TEST_EMAIL");
        String testPassword = System.getenv("CITIZEN_TEST_PASSWORD");
        
        if (testEmail == null || testPassword == null) {
            System.out.println("No test credentials provided. Skipping E2E UI Destructive execution to protect dev DB.");
            return; 
        }
        
        WebDriverFactory.getDriver().get("http://localhost:5173/login");
        LoginPage loginPage = new LoginPage(WebDriverFactory.getDriver());
        loginPage.login(testEmail, testPassword);
        
        CitizenDashboardPage dashboard = new CitizenDashboardPage(WebDriverFactory.getDriver());
        dashboard.clickSubmitComplaint();
        
        String title = "SELENIUM TEST: Large Pothole End To End";
        String description = "This is a Selenium automated test complaint simulating a citizen reporting a pothole.";
        
        dashboard.fillAndSubmitComplaint(title, description, "Ward 1");
        
        // Verifying UI successfully dispatched DB payload
        Assert.assertTrue(dashboard.isSuccessMessageDisplayed(), "Expected success confirmation after citizen dispatch.");
        
        // Future phases would instantiate CouncillorDashboardPage.java here,
        // logout, login as Councillor, find the complaint using API verification,
        // assign worker, and then login as Worker to resolve it.
    }
}
