# Lead Form Automation

Automated lead data entry for theleadzone.com using Puppeteer with stealth mode. This application reads lead data from an Excel file and automatically fills forms on the website after the user manually logs in.

## Features

- **Manual Login**: Requires the user to log in manually in the opened browser window.
- **Interactive Login Verification**: Checks for successful login after manual authentication and prompts the user to re-login if needed.
- **Excel Integration**: Reads lead data from Excel files (XLSX format)
- **Stealth Mode**: Uses Puppeteer with stealth plugin to avoid detection
- **Smart Form Filling**: Only fills highlighted fields based on requirements
- **Error Handling**: Comprehensive logging and crash prevention
- **Batch Processing**: Processes multiple leads with configurable delays
- **Screenshot Capture**: Takes screenshots on errors for debugging

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager
- Access to theleadzone.com login page.
- An `input.xlsx` file with your lead data in the correct format.

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

While this version of the script relies on manual login, the `.env` file can still be used for other potential configurations in the future. The `LOGIN_EMAIL` and `LOGIN_PASSWORD` variables are not used in the current manual login flow.

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

Follow the prompts in the terminal regarding the manual login step.

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

1. **Launch Browser:** The script opens a new browser window and navigates to the form URL, which serves as the initial page for manual login.
2. **Manual Login:** You are prompted to manually log in to the Lead Zone website in the opened browser window.
3. **Indicate Login Complete:** After successfully logging in, you press Enter in the terminal.
4. **Login Verification Loop:** The script enters a loop:
    - It opens a new tab and navigates to the form page (`/Lead/Add`).
    - It checks for the presence of the `#FirstName` element on this new tab to verify successful login. This check is performed every 5 seconds for up to 30 seconds.
    - If `#FirstName` is found, login is verified, the new tab is closed, and the script proceeds.
    - If `#FirstName` is not found within 30 seconds, the script logs a warning, prompts you to ensure you are logged in, and waits for you to press Enter again to re-verify. The verification loop continues until successful.
5. **Automated Form Filling:** Once login is verified, the script proceeds to read data from `input.xlsx` and fill forms in the original tab.

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

1. **Login Verification Failed**: Ensure you have successfully logged in manually in the browser window and reached the form page. The script will re-prompt you to press Enter after you've had a chance to log in again.
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
