const winston = require('winston');
const config = require('./config');

// Create logger
const logger = winston.createLogger({
  level: config.logging.level,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} [${level.toUpperCase()}]: ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    new winston.transports.File({ filename: config.logging.filename })
  ]
});

// Random delay function
function randomDelay(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Human-like typing function
async function humanType(page, selector, text) {
  await page.focus(selector);
  
  // Clear existing content
  await page.evaluate(selector => {
    document.querySelector(selector).value = '';
  }, selector);
  
  // Type character by character with random delays
  for (const char of text.toString()) {
    await page.type(selector, char);
    await new Promise(resolve => setTimeout(resolve, randomDelay(config.typing.delay.min, config.typing.delay.max)));
  }
}

// Random mouse movements
async function randomMouseMovement(page) {
  const viewport = page.viewport();
  const x = Math.floor(Math.random() * viewport.width);
  const y = Math.floor(Math.random() * viewport.height);
  
  await page.mouse.move(x, y, {
    steps: randomDelay(10, 20)
  });
}

// Format phone number
function formatPhoneNumber(phone) {
  // Remove all non-numeric characters
  return phone.toString().replace(/\D/g, '');
}

// Format currency (remove commas and dollar signs)
function formatCurrency(value) {
  if (!value) return '0';
  return value.toString().replace(/[$,]/g, '');
}

// Parse date from Excel format
function parseExcelDate(dateStr) {
  if (!dateStr) return null;
  
  // Handle "Month-YY" format (e.g., "September-19")
  const monthYearMatch = dateStr.match(/^(\w+)-(\d{2})$/);
  if (monthYearMatch) {
    const monthMap = {
      'January': '01', 'February': '02', 'March': '03', 'April': '04',
      'May': '05', 'June': '06', 'July': '07', 'August': '08',
      'September': '09', 'October': '10', 'November': '11', 'December': '12'
    };
    const month = monthMap[monthYearMatch[1]];
    const year = `20${monthYearMatch[2]}`;
    return `${month}/01/${year}`;
  }
  
  return dateStr;
}

// Wait for navigation with timeout
async function waitForNavigation(page, timeout = 30000) {
  try {
    await page.waitForNavigation({ 
      waitUntil: 'networkidle2',
      timeout: timeout 
    });
  } catch (error) {
    logger.warn('Navigation timeout - continuing anyway');
  }
}

// Check if element exists
async function elementExists(page, selector) {
  try {
    const element = await page.$(selector);
    return element !== null;
  } catch (error) {
    logger.error(`Error checking element existence for ${selector}: ${error.message}`);
    return false;
  }
}

// Screenshot helper
async function takeScreenshot(page, name) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `screenshots/${name}_${timestamp}.png`;
  
  try {
    await page.screenshot({ path: filename, fullPage: true });
    logger.info(`Screenshot saved: ${filename}`);
  } catch (error) {
    logger.error(`Failed to save screenshot: ${error.message}`);
  }
}

module.exports = {
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
};