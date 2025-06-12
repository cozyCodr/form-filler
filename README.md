# Lead Form Automation

Automated lead data entry for theleadzone.com using Puppeteer with stealth mode. This application reads lead data from Excel files and automatically fills forms on the website with authentication handling.

## Features

- **Automatic Login**: Handles AWS Cognito authentication automatically
- **Excel Integration**: Reads lead data from Excel files (XLSX format)
- **Stealth Mode**: Uses Puppeteer with stealth plugin to avoid detection
- **Smart Form Filling**: Only fills highlighted fields based on requirements
- **Error Handling**: Comprehensive logging and crash prevention
- **Batch Processing**: Processes multiple leads with configurable delays
- **Screenshot Capture**: Takes screenshots on errors for debugging

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager
- Valid login credentials for theleadzone.com

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd form-filler
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your actual login credentials
```

## Configuration

### Environment Variables (.env)
```env
LOGIN_EMAIL=your_email@example.com
LOGIN_PASSWORD=your_password_here
```

### Excel File Format
The application expects an Excel file (`input.xlsx`) with the following columns:
- First Name
- Last Name  
- Phone Number
- Fico (Credit Score)
- Address
- City
- State
- Zip Code
- Initial Loan amount of recent mortgage

## Usage

### Test Mode (Single Record)
```bash
npm test
# or
node index.js --test
```

### Process All Records
```bash
npm start
# or
node index.js
```

### Advanced Options
```bash
# Start from specific row
node index.js --start 5

# Process maximum number of records
node index.js --max 10

# Combine options
node index.js --start 5 --max 3
```

## Form Fields

The automation fills only the highlighted fields as specified:
- ✅ First Name
- ✅ Last Name  
- ✅ Phone Number
- ✅ Credit Score
- ✅ Address
- ✅ City
- ✅ State
- ✅ Zip Code
- ✅ Property State (same as borrower)
- ✅ Property Zip Code
- ✅ Property Value
- ✅ Monthly Property Tax

Default values are set for non-highlighted fields to ensure form submission.

## Authentication Flow

1. **Navigate** to form URL
2. **Detect** if login is required
3. **Authenticate** using credentials from .env
4. **Redirect** to form page after successful login
5. **Fill** and submit form data

## Logging

- Console output with colored formatting
- File logging to `automation.log`
- Screenshot capture on errors in `screenshots/` directory
- Processing results saved to `results_YYYY-MM-DD.json`

## Error Handling

- Automatic recovery from navigation timeouts
- Element existence validation before interaction
- Comprehensive error logging with stack traces
- Screenshot capture for debugging

## File Structure

```
form-filler/
├── index.js           # Main automation script
├── config.js          # Configuration settings
├── utils.js           # Utility functions
├── input.xlsx         # Excel data file
├── .env               # Environment variables
├── package.json       # Node.js dependencies
├── automation.log     # Application logs
├── screenshots/       # Error screenshots
└── local_test/        # Local development version
```

## Troubleshooting

### Common Issues

1. **Login Failed**: Verify credentials in .env file
2. **Excel File Not Found**: Ensure input.xlsx exists in root directory
3. **Form Submission Failed**: Check for validation errors in logs
4. **Browser Crashes**: Review screenshots/ directory for visual debugging

### Debug Mode
Enable detailed logging by checking `automation.log` file for step-by-step execution details.

## Development

The application includes a local test environment in `local_test/` directory for development and testing without affecting the live website.

## Security

- Environment variables for sensitive credentials
- No hardcoded passwords or API keys
- Stealth mode to avoid detection
- Secure form submission handling

## License

ISC License - see package.json for details
