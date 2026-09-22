package com.sgcs.automation.tests;

import com.sgcs.automation.utils.WebDriverFactory;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.BeforeMethod;

public class BaseTest {
    @BeforeMethod
    public void setUp() {
        WebDriverFactory.setupDriver();
    }

    @AfterMethod
    public void tearDown() {
        WebDriverFactory.quitDriver();
    }
}
