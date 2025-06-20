#!/usr/bin/env node

require("dotenv").config();
const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const XLSX = require("xlsx");
const fs = require("fs");
const path = require("path");
const readline = require("readline"); // Import readline for user input
const config = require("./config");
const {
  logger,
  randomDelay,
  humanType,
  randomMouseMovement,
  formatPhoneNumber,
  formatCurrency,
  parseExcelDate,
  waitForNavigation,
  elementExists,
  takeScreenshot,
} = require("./utils");

// Add stealth plugin
puppeteer.use(StealthPlugin());

// Add crash handlers for debugging
process.on("uncaughtException", (error) => {
  logger.error(`Uncaught Exception: ${error.message}`);
  logger.error(error.stack);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

class LeadFormAutomation {
  constructor() {
    this.browser = null;
    this.page = null;
    this.successCount = 0;
    this.failureCount = 0;
    this.processedRows = [];

    // Create screenshots directory if it doesn't exist
    const screenshotsDir = path.join(__dirname, "screenshots");
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir);
    }
  }

  async initialize() {
    try {
      // Always launch a new browser instance for this workflow
      logger.info("Launching browser with stealth mode...");
      this.browser = await puppeteer.launch(config.browser);
      this.page = await this.browser.newPage();

      logger.info("Browser initialized successfully");
    } catch (error) {
      logger.error(`Failed to initialize browser: ${error.message}`);
      throw error;
    }
  }

  async readExcelData() {
    try {
      const filePath = path.join(__dirname, config.excelFile);

      if (!fs.existsSync(filePath)) {
        throw new Error(`Excel file not found: ${filePath}`);
      }

      const workbook = XLSX.readFile(filePath);
      const sheetName = config.sheetName || workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet);

      logger.info(`Loaded ${data.length} records from Excel file`);
      return data;
    } catch (error) {
      logger.error(`Failed to read Excel file: ${error.message}`);
      throw error;
    }
  }

  async fillForm(leadData) {
    try {
      logger.info(
        `Filling form for: ${leadData["First Name"]} ${leadData["Last Name"]}`
      );

      // Navigate to form if not already there
      logger.info("Step 1: Checking page URL and navigating if needed");
      if (!this.page.url().includes("/Lead/Add")) {
        logger.info("Navigating to form page");
        await this.page.goto(config.formUrl);
        await new Promise((resolve) =>
          setTimeout(resolve, config.delays.pageLoad)
        );

        logger.info("Navigation completed");
      } else {
        logger.info("Already on form page");
      }

      // Random mouse movement to simulate human behavior
      logger.info("Step 2: Random mouse movement");
      await randomMouseMovement(this.page);

      // Fill ONLY highlighted fields from screenshot
      logger.info("Step 3: Filling First Name (highlighted)");
      await humanType(this.page, "#FirstName", leadData["First Name"] || "");
      await new Promise((resolve) =>
        setTimeout(
          resolve,
          randomDelay(...Object.values(config.delays.betweenFields))
        )
      );

      logger.info("Step 4: Filling Last Name (highlighted)");
      await humanType(this.page, "#LastName", leadData["Last Name"] || "");
      await new Promise((resolve) =>
        setTimeout(
          resolve,
          randomDelay(...Object.values(config.delays.betweenFields))
        )
      );

      logger.info("Step 5: Filling Phone Number (highlighted)");
      await humanType(
        this.page,
        "#PhoneNumber",
        formatPhoneNumber(leadData["Phone Number"] || "")
      );
      await new Promise((resolve) =>
        setTimeout(
          resolve,
          randomDelay(...Object.values(config.delays.betweenFields))
        )
      );

      // Email - leave empty (not highlighted in screenshot)
      logger.info(
        "Step 6: Checking and filling Email (not highlighted - leave empty)"
      );
      const emailExists = await elementExists(this.page, "#Email");
      logger.info(`Email field exists: ${emailExists}`);
      if (emailExists) {
        logger.info("Leaving email field empty");
        await humanType(this.page, "#Email", "");
        await new Promise((resolve) =>
          setTimeout(
            resolve,
            randomDelay(...Object.values(config.delays.betweenFields))
          )
        );
      }
      logger.info("Step 6 completed successfully");

      logger.info("Step 7: Filling Credit Score (highlighted)");
      await humanType(
        this.page,
        "#CreditScore",
        (leadData["Fico"] || "").toString()
      );
      await new Promise((resolve) =>
        setTimeout(
          resolve,
          randomDelay(...Object.values(config.delays.betweenFields))
        )
      );

      logger.info("Step 8: Setting Veteran status to No (default)");
      await this.page.select("#Veteran", "false");
      await new Promise((resolve) =>
        setTimeout(
          resolve,
          randomDelay(...Object.values(config.delays.betweenFields))
        )
      );

      // Address Details (highlighted fields only)
      logger.info("Step 9: Filling Address (highlighted)");
      await humanType(this.page, "#Address", leadData["Address"] || "");
      await new Promise((resolve) =>
        setTimeout(
          resolve,
          randomDelay(...Object.values(config.delays.betweenFields))
        )
      );

      logger.info("Step 10: Filling City (highlighted)");
      await humanType(this.page, "#City", leadData["City"] || "");
      await new Promise((resolve) =>
        setTimeout(
          resolve,
          randomDelay(...Object.values(config.delays.betweenFields))
        )
      );

      logger.info("Step 11: Setting State (from Excel data)");
      const state = leadData["State"] || "AL";
      const stateValue = config.stateMapping[state] || "1";
      await this.page.select("#State", stateValue);
      await new Promise((resolve) =>
        setTimeout(
          resolve,
          randomDelay(...Object.values(config.delays.betweenFields))
        )
      );

      logger.info("Step 12: Filling Zip Code (highlighted)");
      await humanType(
        this.page,
        "#Zip",
        (leadData["Zip Code"] || "").toString()
      );
      await new Promise((resolve) =>
        setTimeout(
          resolve,
          randomDelay(...Object.values(config.delays.betweenFields))
        )
      );

      // Subject Property Details (highlighted fields only)
      logger.info("Step 13: Setting Property State (same as borrower)");
      await this.page.select("#PropertyState", stateValue);
      await new Promise((resolve) =>
        setTimeout(
          resolve,
          randomDelay(...Object.values(config.delays.betweenFields))
        )
      );

      logger.info("Step 14: Filling Property Zip Code (highlighted)");
      await humanType(
        this.page,
        "#PropertyZip",
        (leadData["Zip Code"] || "").toString()
      );
      await new Promise((resolve) =>
        setTimeout(
          resolve,
          randomDelay(...Object.values(config.delays.betweenFields))
        )
      );

      logger.info("Step 15: Filling Property Value (highlighted)");
      const propertyValue = formatCurrency(
        leadData["Initial Loan amount of recent mortgage"] || "0"
      );
      await humanType(this.page, "#CurrentValueFormatted", propertyValue);
      await new Promise((resolve) =>
        setTimeout(
          resolve,
          randomDelay(...Object.values(config.delays.betweenFields))
        )
      );

      logger.info("Step 16: Setting Property Type to Single Family (default)");
      await this.page.select("#PropertyType", "1");
      await new Promise((resolve) =>
        setTimeout(
          resolve,
          randomDelay(...Object.values(config.delays.betweenFields))
        )
      );

      logger.info("Step 17: Setting Occupancy to Primary (default)");
      await this.page.select("#Occupancy", "1");
      await new Promise((resolve) =>
        setTimeout(
          resolve,
          randomDelay(...Object.values(config.delays.betweenFields))
        )
      );

      logger.info("Step 18: Filling Monthly Property Tax (highlighted field)");
      await humanType(this.page, "#MonthlyPropertyTaxFormatted", "0");
      await new Promise((resolve) =>
        setTimeout(
          resolve,
          randomDelay(...Object.values(config.delays.betweenFields))
        )
      );

      // Set default values for non-highlighted fields (based on screenshot)
      logger.info("Step 19: Setting default values for remaining fields");

      // Leave Current Loan Program empty (as shown in screenshot)
      // Set Revolving Debt and Payments to 0 (as shown in screenshot)
      await humanType(this.page, "#RevolvingDebtFormatted", "0");
      await new Promise((resolve) =>
        setTimeout(
          resolve,
          randomDelay(...Object.values(config.delays.betweenFields))
        )
      );

      await humanType(this.page, "#RevolvingPaymentFormatted", "0");
      await new Promise((resolve) =>
        setTimeout(
          resolve,
          randomDelay(...Object.values(config.delays.betweenFields))
        )
      );

      // Installment Debt - default to 0 (as shown in screenshot)
      await humanType(this.page, "#InstallmentDebt", "0");
      await new Promise((resolve) =>
        setTimeout(
          resolve,
          randomDelay(...Object.values(config.delays.betweenFields))
        )
      );

      await humanType(this.page, "#InstallmentPayment", "0");
      await new Promise((resolve) =>
        setTimeout(
          resolve,
          randomDelay(...Object.values(config.delays.betweenFields))
        )
      );

      // Random mouse movement before submission
      await randomMouseMovement(this.page);

      logger.info("Form filled successfully");
      return true;
    } catch (error) {
      logger.error(`Error filling form: ${error.message}`);
      await takeScreenshot(this.page, "form_fill_error");
      return false;
    }
  }

  async submitForm() {
    try {
      // Wait before submission
      await new Promise((resolve) =>
        setTimeout(
          resolve,
          randomDelay(...Object.values(config.delays.afterFormFill))
        )
      );

      // Click the Save & Quote button
      logger.info("Clicking Save & Quote button");
      await this.page.click('button[value="save-and-quote"]');
      logger.info("Save & Quote button clicked");

      // Wait for navigation or response
      await Promise.race([
        waitForNavigation(this.page),
        new Promise((resolve) => setTimeout(resolve, 5000)),
      ]);

      // Check for success (URL change or success message)
      const currentUrl = this.page.url();
      if (!currentUrl.includes("/Lead/Add")) {
        logger.info("Form submitted successfully");
        this.successCount++;
        return true;
      }

      // Check for validation errors
      const errors = await this.page.$$(".field-validation-error");
      if (errors.length > 0) {
        const errorTexts = await Promise.all(
          errors.map((el) => this.page.evaluate((e) => e.textContent, el))
        );
        logger.error(`Validation errors: ${errorTexts.join(", ")}`);
      }

      this.failureCount++;
      return false;
    } catch (error) {
      logger.error(`Error submitting form: ${error.message}`);
      await takeScreenshot(this.page, "submission_error");
      this.failureCount++;
      return false;
    }
  }

  async processLeads(startRow = 0, maxRecords = null) {
    try {
      const leads = await this.readExcelData();
      const leadsToProcess = maxRecords
        ? leads.slice(startRow, startRow + maxRecords)
        : leads.slice(startRow);

      logger.info(
        `Processing ${leadsToProcess.length} leads starting from row ${startRow}`
      );

      for (let i = 0; i < leadsToProcess.length; i++) {
        const lead = leadsToProcess[i];
        const actualRow = startRow + i;

        logger.info(
          `Processing lead ${i + 1}/${leadsToProcess.length} (Row ${
            actualRow + 2
          } in Excel)`
        );

        // Fill the form
        const filled = await this.fillForm(lead);

        if (filled) {
          // Submit the form
          const submitted = await this.submitForm();

          if (submitted) {
            this.processedRows.push({
              row: actualRow + 2, // Excel rows start at 1, plus header
              name: `${lead["First Name"]} ${lead["Last Name"]}`,
              status: "success",
            });
          } else {
            this.processedRows.push({
              row: actualRow + 2,
              name: `${lead["First Name"]} ${lead["Last Name"]}`,
              status: "failed",
            });
          }
        }

        // Wait between submissions
        if (i < leadsToProcess.length - 1) {
          const waitTime = randomDelay(
            ...Object.values(config.delays.betweenSubmissions)
          );
          logger.info(
            `Waiting ${Math.round(
              waitTime / 1000
            )} seconds before next submission...`
          );
          await new Promise((resolve) => setTimeout(resolve, waitTime));

          // Batch pause
          if ((i + 1) % config.batch.size === 0) {
            logger.info(
              `Completed batch of ${config.batch.size}. Pausing for ${
                config.batch.pauseDuration / 1000
              } seconds...`
            );
            await new Promise((resolve) =>
              setTimeout(resolve, config.batch.pauseDuration)
            );
          }
        }
      }

      this.printSummary();
    } catch (error) {
      logger.error(`Process failed: ${error.message}`);
      throw error;
    }
  }

  printSummary() {
    logger.info("=== PROCESSING SUMMARY ===");
    logger.info(`Total Processed: ${this.successCount + this.failureCount}`);
    logger.info(`Successful: ${this.successCount}`);
    logger.info(`Failed: ${this.failureCount}`);

    // Save detailed results
    const resultsFile = `results_${
      new Date().toISOString().split("T")[0]
    }.json`;
    fs.writeFileSync(resultsFile, JSON.stringify(this.processedRows, null, 2));
    logger.info(`Detailed results saved to: ${resultsFile}`);
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      logger.info("Browser closed");
    }
  }
}

// Main execution
async function main() {
  const automation = new LeadFormAutomation();

  try {
    // Parse command line arguments
    const args = process.argv.slice(2);
    const testMode = args.includes("--test");
    const startRow = args.includes("--start")
      ? parseInt(args[args.indexOf("--start") + 1])
      : 0;
    const maxRecords = args.includes("--max")
      ? parseInt(args[args.indexOf("--max") + 1])
      : testMode
      ? 1
      : null;

    // Initialize browser
    await automation.initialize();

    // Navigate to the login page initially to allow manual login
    logger.info(
      `Navigating to initial page for manual login: ${config.formUrl}`
    );
    await automation.page.goto(config.formUrl);

    // Pause and wait for user to login
    console.log("\nPlease log in to the browser window that just opened.");
    console.log(
      "After you have successfully logged in, press Enter in this terminal to continue..."
    );

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    await new Promise((resolve) => rl.question("", resolve));
    rl.close();

    logger.info("User indicated login is complete. Verifying login state...");

    let loggedIn = false;
    const totalTimeout = 30000; // 30 seconds total for verification
    const checkInterval = 5000; // Check every 5 seconds

    while (!loggedIn) {
      let verificationPage = null;
      try {
        // Open a new tab and navigate to the form page for verification
        logger.info("Opening new tab for login verification...");
        verificationPage = await automation.browser.newPage();
        logger.info(
          `Navigating new tab to form page for verification: ${config.formUrl}`
        );
        await verificationPage.goto(config.formUrl, {
          waitUntil: "networkidle0",
        });

        logger.info(
          "Checking for form element (#FirstName) on verification page..."
        );

        const startTime = Date.now();
        let elementFound = false;

        while (Date.now() - startTime < totalTimeout) {
          const element = await verificationPage.$("#FirstName");
          if (element) {
            elementFound = true;
            break; // Element found, exit inner loop
          }
          logger.info(
            `Element not found yet. Waiting ${
              checkInterval / 1000
            } seconds before re-checking...`
          );
          await new Promise((resolve) => setTimeout(resolve, checkInterval));
        }

        if (elementFound) {
          logger.info("Login verified.");
          loggedIn = true; // Exit the outer loop
        } else {
          // If element not found after totalTimeout, throw an error to enter the catch block
          throw new Error(
            `Timeout exceeded (${totalTimeout}ms) while waiting for #FirstName`
          );
        }
      } catch (verificationError) {
        logger.warn(`Login verification failed: ${verificationError.message}`);
        logger.warn(
          "Could not find the form element on the verification page. Please ensure you logged in correctly."
        );
        console.log(
          "Login verification failed. Please try logging in again in the browser window."
        );
        console.log(
          "After logging in, press Enter in this terminal to re-verify..."
        );

        // Wait for user to press Enter again
        const reLoginRl = readline.createInterface({
          input: process.stdin,
          output: process.stdout,
        });
        await new Promise((resolve) => reLoginRl.question("", resolve));
        reLoginRl.close();

        logger.info(
          "User indicated re-login attempt is complete. Re-verifying..."
        );
      } finally {
        // Close the verification page after each attempt
        if (verificationPage) {
          await verificationPage.close();
          logger.info("Verification tab closed.");
        }
      }
    }

    // If we are here, login was successful
    logger.info("Login verified. Proceeding with automation.");
    // Process leads
    await automation.processLeads(startRow, maxRecords);
  } catch (error) {
    logger.error(`Automation failed: ${error.message}`);
    process.exit(1);
  } finally {
    await automation.close();
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = LeadFormAutomation;
