package com.sgcs.automation.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;

public class CitizenDashboardPage {
    private WebDriver driver;
    private WebDriverWait wait;

    private By submitComplaintBtn = By.xpath("//button[contains(text(), 'Submit Complaint') or contains(text(), 'New')]");
    private By titleField = By.cssSelector("input[name='title']");
    private By descriptionField = By.cssSelector("textarea[name='description']");
    private By wardSelect = By.cssSelector("select[name='ward']");
    private By submitBtn = By.cssSelector("button[type='submit']");
    private By successMessage = By.xpath("//div[contains(text(), 'success') or contains(text(), 'submitted')]");

    public CitizenDashboardPage(WebDriver driver) {
        this.driver = driver;
        this.wait = new WebDriverWait(driver, Duration.ofSeconds(10));
    }

    public void clickSubmitComplaint() {
        wait.until(ExpectedConditions.elementToBeClickable(submitComplaintBtn)).click();
    }

    public void fillAndSubmitComplaint(String title, String description, String ward) {
        wait.until(ExpectedConditions.visibilityOfElementLocated(titleField)).sendKeys(title);
        driver.findElement(descriptionField).sendKeys(description);
        driver.findElement(wardSelect).sendKeys(ward);
        driver.findElement(submitBtn).click();
    }

    public boolean isSuccessMessageDisplayed() {
        try {
            return wait.until(ExpectedConditions.visibilityOfElementLocated(successMessage)).isDisplayed();
        } catch (Exception e) {
            return false;
        }
    }
}
