#!/usr/bin/env node

const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');
const config = require('./config');
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
  takeScreenshot
} = require('./utils');

// Add stealth plugin
puppeteer.use(StealthPlugin());

class LeadFormAutomation {
  constructor() {
    this.browser = null;
    this.page = null;
    this.successCount = 0;
    this.failureCount = 0;
    this.processedRows = [];
    
    // Create screenshots directory if it doesn't exist
    const screenshotsDir = path.join(__dirname, 'screenshots');
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir);
    }
  }

  async initialize() {
    try {
      logger.info('Launching browser with stealth mode...');
      this.browser = await puppeteer.launch(config.browser);
      this.page = await this.browser.newPage();
      
      // Set user agent
      await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
      
      // Set viewport
      await this.page.setViewport({ width: 1366, height: 768 });
      
      logger.info('Browser initialized successfully');
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
      logger.info(`Filling form for: ${leadData['First Name']} ${leadData['Last Name']}`);
      
      // Navigate to form if not already there
      if (!this.page.url().includes('/Lead/Add')) {
        await this.page.goto(config.formUrl);
        await this.page.waitForTimeout(config.delays.pageLoad);
      }
      
      // Random mouse movement to simulate human behavior
      await randomMouseMovement(this.page);
      
      // Fill Borrower Details
      await humanType(this.page, '#FirstName', leadData['First Name'] || '');
      await this.page.waitForTimeout(randomDelay(...Object.values(config.delays.betweenFields)));
      
      await humanType(this.page, '#LastName', leadData['Last Name'] || '');
      await this.page.waitForTimeout(randomDelay(...Object.values(config.delays.betweenFields)));
      
      await humanType(this.page, '#PhoneNumber', formatPhoneNumber(leadData['Phone Number'] || ''));
      await this.page.waitForTimeout(randomDelay(...Object.values(config.delays.betweenFields)));
      
      // Email - not in Excel data, leave empty or set default
      if (await elementExists(this.page, '#Email')) {
        await humanType(this.page, '#Email', '');
        await this.page.waitForTimeout(randomDelay(...Object.values(config.delays.betweenFields)));
      }
      
      await humanType(this.page, '#CreditScore', (leadData['Fico'] || '').toString());
      await this.page.waitForTimeout(randomDelay(...Object.values(config.delays.betweenFields)));
      
      // Veteran status - default to 'No'
      await this.page.select('#Veteran', 'false');
      await this.page.waitForTimeout(randomDelay(...Object.values(config.delays.betweenFields)));
      
      // Address Details
      await humanType(this.page, '#Address', leadData['Address'] || '');
      await this.page.waitForTimeout(randomDelay(...Object.values(config.delays.betweenFields)));
      
      await humanType(this.page, '#City', leadData['City'] || '');
      await this.page.waitForTimeout(randomDelay(...Object.values(config.delays.betweenFields)));
      
      const state = leadData['State'] || 'AL';
      const stateValue = config.stateMapping[state] || '1';
      await this.page.select('#State', stateValue);
      await this.page.waitForTimeout(randomDelay(...Object.values(config.delays.betweenFields)));
      
      await humanType(this.page, '#Zip', (leadData['Zip Code'] || '').toString());
      await this.page.waitForTimeout(randomDelay(...Object.values(config.delays.betweenFields)));
      
      // Subject Property Details (using same as borrower)
      await this.page.select('#PropertyState', stateValue);
      await this.page.waitForTimeout(randomDelay(...Object.values(config.delays.betweenFields)));
      
      await humanType(this.page, '#PropertyZip', (leadData['Zip Code'] || '').toString());
      await this.page.waitForTimeout(randomDelay(...Object.values(config.delays.betweenFields)));
      
      // Property Value - using initial loan amount as estimate
      const propertyValue = formatCurrency(leadData['Initial Loan amount of recent mortgage'] || '0');
      await humanType(this.page, '#CurrentValueFormatted', propertyValue);
      await this.page.waitForTimeout(randomDelay(...Object.values(config.delays.betweenFields)));
      
      // Property Type - default to Single Family
      await this.page.select('#PropertyType', '1');
      await this.page.waitForTimeout(randomDelay(...Object.values(config.delays.betweenFields)));
      
      // Occupancy - default to Primary
      await this.page.select('#Occupancy', '1');
      await this.page.waitForTimeout(randomDelay(...Object.values(config.delays.betweenFields)));
      
      // Current Loan Details (if mortgage exists)
      const currentBalance = formatCurrency(leadData['Current mortgage balance'] || '0');
      if (parseInt(currentBalance) > 0) {
        // Set loan program
        await humanType(this.page, '#CurrentLoanProgramName', 'Conventional 80');
        await this.page.waitForTimeout(randomDelay(...Object.values(config.delays.betweenFields)));
        
        // Wait for form to update and show additional fields
        await this.page.waitForTimeout(1000);
        
        // Fill additional loan details if fields are visible
        if (await elementExists(this.page, '#CurrentLender')) {
          await humanType(this.page, '#CurrentLender', 'Unknown');
          await this.page.waitForTimeout(randomDelay(...Object.values(config.delays.betweenFields)));
        }
        
        if (await elementExists(this.page, '#CurrentFinanceTerm')) {
          await this.page.select('#CurrentFinanceTerm', '8'); // 30yr Fixed
          await this.page.waitForTimeout(randomDelay(...Object.values(config.delays.betweenFields)));
        }
        
        if (await elementExists(this.page, '#CurrentRate')) {
          await humanType(this.page, '#CurrentRate', '4.5');
          await this.page.waitForTimeout(randomDelay(...Object.values(config.delays.betweenFields)));
        }
        
        if (await elementExists(this.page, '#CurrentBalanceFormatted')) {
          await humanType(this.page, '#CurrentBalanceFormatted', currentBalance);
          await this.page.waitForTimeout(randomDelay(...Object.values(config.delays.betweenFields)));
        }
        
        const mortgagePayment = (leadData['Mortgage monthly payment'] || '0').toString().replace('.0', '');
        if (await elementExists(this.page, '#MortgagePaymentFormatted')) {
          await humanType(this.page, '#MortgagePaymentFormatted', mortgagePayment);
          await this.page.waitForTimeout(randomDelay(...Object.values(config.delays.betweenFields)));
        }
      }
      
      // Revolving Debt
      const revolvingDebt = formatCurrency(leadData['Revolving trades balance'] || '0');
      const revolvingPayment = Math.round(parseInt(revolvingDebt) * 0.03).toString(); // 3% estimate
      
      await humanType(this.page, '#RevolvingDebtFormatted', revolvingDebt);
      await this.page.waitForTimeout(randomDelay(...Object.values(config.delays.betweenFields)));
      
      await humanType(this.page, '#RevolvingPaymentFormatted', revolvingPayment);
      await this.page.waitForTimeout(randomDelay(...Object.values(config.delays.betweenSubmissions)));
      
      // Installment Debt - default to 0
      await humanType(this.page, '#InstallmentDebt', '0');
      await this.page.waitForTimeout(randomDelay(...Object.values(config.delays.betweenFields)));
      
      await humanType(this.page, '#InstallmentPayment', '0');
      await this.page.waitForTimeout(randomDelay(...Object.values(config.delays.betweenFields)));
      
      // Random mouse movement before submission
      await randomMouseMovement(this.page);
      
      logger.info('Form filled successfully');
      return true;
    } catch (error) {
      logger.error(`Error filling form: ${error.message}`);
      await takeScreenshot(this.page, 'form_fill_error');
      return false;
    }
  }

  async submitForm() {
    try {
      // Wait before submission
      await this.page.waitForTimeout(randomDelay(...Object.values(config.delays.afterFormFill)));
      
      // Click the Save button
      await this.page.click('button[value="save"]');
      
      // Wait for navigation or response
      await Promise.race([
        waitForNavigation(this.page),
        this.page.waitForTimeout(5000)
      ]);
      
      // Check for success (URL change or success message)
      const currentUrl = this.page.url();
      if (!currentUrl.includes('/Lead/Add')) {
        logger.info('Form submitted successfully');
        this.successCount++;
        return true;
      }
      
      // Check for validation errors
      const errors = await this.page.$$('.field-validation-error');
      if (errors.length > 0) {
        const errorTexts = await Promise.all(
          errors.map(el => this.page.evaluate(e => e.textContent, el))
        );
        logger.error(`Validation errors: ${errorTexts.join(', ')}`);
      }
      
      this.failureCount++;
      return false;
    } catch (error) {
      logger.error(`Error submitting form: ${error.message}`);
      await takeScreenshot(this.page, 'submission_error');
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
      
      logger.info(`Processing ${leadsToProcess.length} leads starting from row ${startRow}`);
      
      for (let i = 0; i < leadsToProcess.length; i++) {
        const lead = leadsToProcess[i];
        const actualRow = startRow + i;
        
        logger.info(`Processing lead ${i + 1}/${leadsToProcess.length} (Row ${actualRow + 2} in Excel)`);
        
        // Fill the form
        const filled = await this.fillForm(lead);
        
        if (filled) {
          // Submit the form
          const submitted = await this.submitForm();
          
          if (submitted) {
            this.processedRows.push({
              row: actualRow + 2, // Excel rows start at 1, plus header
              name: `${lead['First Name']} ${lead['Last Name']}`,
              status: 'success'
            });
          } else {
            this.processedRows.push({
              row: actualRow + 2,
              name: `${lead['First Name']} ${lead['Last Name']}`,
              status: 'failed'
            });
          }
        }
        
        // Wait between submissions
        if (i < leadsToProcess.length - 1) {
          const waitTime = randomDelay(...Object.values(config.delays.betweenSubmissions));
          logger.info(`Waiting ${Math.round(waitTime / 1000)} seconds before next submission...`);
          await this.page.waitForTimeout(waitTime);
          
          // Batch pause
          if ((i + 1) % config.batch.size === 0) {
            logger.info(`Completed batch of ${config.batch.size}. Pausing for ${config.batch.pauseDuration / 1000} seconds...`);
            await this.page.waitForTimeout(config.batch.pauseDuration);
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
    logger.info('=== PROCESSING SUMMARY ===');
    logger.info(`Total Processed: ${this.successCount + this.failureCount}`);
    logger.info(`Successful: ${this.successCount}`);
    logger.info(`Failed: ${this.failureCount}`);
    
    // Save detailed results
    const resultsFile = `results_${new Date().toISOString().split('T')[0]}.json`;
    fs.writeFileSync(resultsFile, JSON.stringify(this.processedRows, null, 2));
    logger.info(`Detailed results saved to: ${resultsFile}`);
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      logger.info('Browser closed');
    }
  }
}

// Main execution
async function main() {
  const automation = new LeadFormAutomation();
  
  try {
    // Parse command line arguments
    const args = process.argv.slice(2);
    const testMode = args.includes('--test');
    const startRow = args.includes('--start') 
      ? parseInt(args[args.indexOf('--start') + 1]) 
      : 0;
    const maxRecords = args.includes('--max') 
      ? parseInt(args[args.indexOf('--max') + 1]) 
      : (testMode ? 1 : null);
    
    // Initialize browser
    await automation.initialize();
    
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