# Lead Form Automation for TheLeadZone.com

This Node.js application automates the process of entering lead data from an Excel spreadsheet into the web forms on theleadzone.com. It uses Puppeteer with stealth plugins to simulate human-like behavior and avoid bot detection.

## Table of Contents
- [Features](#features)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Project Structure](#project-structure)
- [Configuration](#configuration)
- [Usage](#usage)
- [Development Guide](#development-guide)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)
- [Security](#security)

## Features

- **Stealth Mode**: Uses puppeteer-extra-plugin-stealth to avoid bot detection
- **Human-like Behavior**: 
  - Random delays between keystrokes (50-150ms)
  - Random delays between form fields (100-300ms)
  - Random mouse movements
  - 10-12 second delays between form submissions
- **Batch Processing**: Processes leads in configurable batches with pauses
- **Error Handling**: Comprehensive logging and screenshot capture on errors
- **Resume Capability**: Can start from any row in the Excel file
- **Configurable**: All settings can be adjusted in `config.js`

## Architecture

### Technology Stack
- **Runtime**: Node.js (v14+)
- **Browser Automation**: Puppeteer with puppeteer-extra plugins
- **Excel Processing**: xlsx library
- **Logging**: Winston
- **Stealth**: puppeteer-extra-plugin-stealth

### Design Patterns
- **Class-based architecture** for maintainability
- **Configuration-driven** behavior
- **Separation of concerns** (utils, config, main logic)
- **Promise-based async/await** for clean async code

## Prerequisites

- Node.js (v14 or higher) - [Download](https://nodejs.org/)
- npm (comes with Node.js)
- Chrome browser installed on your system
- Git (for cloning the repository)
- Excel file with lead data in the correct format

## Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd Jeff_V_Data_Entry
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and add your credentials:
   ```
   USERNAME=your_username_here
   PASSWORD=your_password_here
   ```

4. **Verify installation**:
   ```bash
   node --version  # Should be v14 or higher
   npm test        # Run a test to ensure everything works
   ```

## Project Structure

```
Jeff_V_Data_Entry/
├── index.js              # Main application entry point
├── config.js             # All configuration settings
├── utils.js              # Helper functions and utilities
├── package.json          # Project dependencies and scripts
├── package-lock.json     # Locked dependency versions
├── .env.example          # Environment variables template
├── .env                  # Your actual credentials (not in git)
├── .gitignore           # Files to exclude from git
├── README.md            # This file
├── automation.log       # Generated log file
├── screenshots/         # Error screenshots (created on first run)
└── results_*.json       # Processing results (generated)
```

### Key Files Explained

- **index.js**: Contains the `LeadFormAutomation` class with all form automation logic
- **config.js**: Centralized configuration including delays, selectors, and mappings
- **utils.js**: Reusable functions for logging, formatting, and browser interactions

## Configuration

### Excel File Format

The Excel file must have these exact column headers (case-sensitive):

| Column Name | Type | Required | Example | Notes |
|-------------|------|----------|---------|-------|
| First Name | Text | Yes | "John" | |
| Last Name | Text | Yes | "Doe" | |
| Phone Number | Number/Text | Yes | 3368479587 | Can include formatting |
| Address | Text | Yes | "211 Glenwood Way" | |
| City | Text | Yes | "Smiths Station" | |
| State | Text | Yes | "AL" | 2-letter abbreviation |
| Zip Code | Number/Text | Yes | 36877 | 5 digits |
| SSN | Number | No | 7821 | Not used in form |
| Fico | Number | Yes | 726 | Credit score (350-850) |
| Revolving trades balance | Number | Yes | 77571 | No commas/$ |
| Current mortgage balance | Text/Number | Yes | "451,051" | Commas OK |
| Initial Loan amount of recent mortgage | Text/Number | Yes | "500,696" | Commas OK |
| Mortgage monthly payment | Number | Yes | 3207 | |
| Mortgage Opened date | Text | No | "September-19" | Not used in form |

### Configuration Options

Edit `config.js` to customize behavior:

```javascript
// Key settings to adjust:
{
  formUrl: 'https://the-leadzone.com/Lead/Add',  // Target form URL
  excelFile: 'your-file.xlsx',                   // Your Excel filename
  
  browser: {
    headless: false,  // true = background, false = visible browser
  },
  
  delays: {
    betweenSubmissions: { min: 10000, max: 12000 }, // 10-12 seconds
  },
  
  batch: {
    size: 10,         // Records before pause
    pauseDuration: 30000  // 30 second pause
  }
}
```

## Usage

### Test Mode (Process 1 record)
```bash
npm test
```
or
```bash
node index.js --test
```

### Process All Records
```bash
npm start
```

### Process Specific Range
```bash
# Start from row 10 (0-indexed)
node index.js --start 10

# Process 50 records starting from row 10
node index.js --start 10 --max 50
```

### Command Line Options
- `--test`: Process only 1 record for testing
- `--start <number>`: Start from specific row (0-indexed)
- `--max <number>`: Maximum number of records to process

## Output

The script generates several output files:

- **automation.log**: Detailed execution logs with timestamps
- **screenshots/**: Error screenshots with timestamps
- **results_YYYY-MM-DD.json**: Processing results showing success/failure for each row

Example results file:
```json
[
  {
    "row": 2,
    "name": "John Doe",
    "status": "success"
  },
  {
    "row": 3,
    "name": "Jane Smith",
    "status": "failed"
  }
]
```

## Development Guide

### Setting Up Development Environment

1. **Install VS Code** (recommended) with extensions:
   - ESLint
   - Prettier
   - GitLens
   - JavaScript (ES6) code snippets

2. **Enable debug mode**:
   ```javascript
   // In config.js, set:
   logging: { level: 'debug' }
   ```

3. **Run in visible browser** for debugging:
   ```javascript
   // In config.js, set:
   browser: { headless: false }
   ```

### Code Structure

#### Main Class: LeadFormAutomation

```javascript
class LeadFormAutomation {
  constructor()           // Initialize browser and counters
  async initialize()      // Set up Puppeteer with stealth
  async login()          // Handle site login (implement as needed)
  async readExcelData()  // Load and parse Excel file
  async fillForm()       // Fill form with single lead data
  async submitForm()     // Submit and handle response
  async processLeads()   // Main processing loop
  async close()          // Cleanup
}
```

#### Key Functions in utils.js

- `humanType()`: Types with random delays between keystrokes
- `randomDelay()`: Generates random delay within range
- `formatPhoneNumber()`: Strips formatting from phone numbers
- `formatCurrency()`: Removes $ and commas from currency values
- `randomMouseMovement()`: Simulates human mouse movement

### Adding New Features

1. **New Form Field**:
   ```javascript
   // In fillForm() method:
   await humanType(this.page, '#NewFieldId', leadData['New Column Name']);
   ```

2. **New Excel Column**:
   - Add column to Excel file
   - Access in code: `leadData['Column Name']`

3. **Custom Validation**:
   ```javascript
   // Before form submission:
   if (parseInt(leadData['Fico']) < 600) {
     logger.warn('Low credit score - may need manual review');
   }
   ```

### Implementing Login

The login functionality is not implemented by default. To add it:

```javascript
// In index.js, update the login method:
async login(username, password) {
  try {
    logger.info('Navigating to login page...');
    await this.page.goto('https://the-leadzone.com/Account/Login');
    
    await humanType(this.page, '#Username', username);
    await humanType(this.page, '#Password', password);
    
    await this.page.click('#login-submit');
    await waitForNavigation(this.page);
    
    logger.info('Login successful');
  } catch (error) {
    logger.error(`Login failed: ${error.message}`);
    throw error;
  }
}

// In main(), uncomment:
const username = process.env.USERNAME;
const password = process.env.PASSWORD;
await automation.login(username, password);
```

## Testing

### Unit Testing (Future Enhancement)

Create `test/` directory with test files:

```javascript
// test/utils.test.js
const { formatPhoneNumber, formatCurrency } = require('../utils');

describe('Utils', () => {
  test('formatPhoneNumber removes formatting', () => {
    expect(formatPhoneNumber('(336) 847-9587')).toBe('3368479587');
  });
});
```

### Manual Testing Checklist

- [ ] Test with 1 record using `--test` flag
- [ ] Verify form fills correctly in visible browser
- [ ] Check that validation errors are logged
- [ ] Confirm screenshots are captured on errors
- [ ] Test resume from specific row with `--start`
- [ ] Verify batch pauses work correctly

## Troubleshooting

### Common Issues

1. **Chrome/Chromium not found**
   ```bash
   # Mac:
   brew install --cask google-chrome
   
   # Windows:
   # Download from https://www.google.com/chrome/
   
   # Linux:
   sudo apt-get install chromium-browser
   ```

2. **"Element not found" errors**
   - Form structure may have changed
   - Check selectors in browser DevTools (F12)
   - Update selectors in `index.js`

3. **Rate limiting / Bot detection**
   - Increase delays in `config.js`
   - Reduce batch size
   - Add more random mouse movements

4. **Excel reading errors**
   - Verify column names match exactly (case-sensitive)
   - Check for hidden characters or spaces
   - Ensure file isn't open in Excel

5. **Login failures**
   - Implement login method based on actual site
   - Check for 2FA requirements
   - Verify credentials in `.env`

### Debug Mode

For detailed debugging:

```javascript
// Add to any function:
logger.debug(`Current URL: ${this.page.url()}`);
logger.debug(`Form data: ${JSON.stringify(leadData)}`);

// Take screenshot at any point:
await takeScreenshot(this.page, 'debug_point');

// Pause execution:
await this.page.waitForTimeout(999999); // Pause indefinitely
```

## Security

### Best Practices

1. **Credentials**:
   - Never hardcode credentials
   - Use `.env` file (excluded from git)
   - Consider using a password manager API

2. **Data Protection**:
   - Don't log sensitive data (SSN, full names)
   - Secure screenshots folder
   - Clean up old log files regularly

3. **Network Security**:
   - Run only on trusted networks
   - Consider VPN for additional security
   - Monitor for unusual activity

### Compliance Considerations

- Ensure you have permission to automate data entry
- Comply with website terms of service
- Protect customer PII according to regulations

## Contributing

### Code Style

- Use async/await instead of promises
- Add meaningful comments for complex logic
- Follow existing naming conventions
- Test changes with small batches first

### Pull Request Process

1. Create feature branch: `git checkout -b feature/new-feature`
2. Make changes and test thoroughly
3. Update README if needed
4. Submit PR with description of changes

## License

This software is provided as-is for Jeff Van Deusen's use. All rights reserved.# form-filler
# form-filler
# form-filler
# form-filler
