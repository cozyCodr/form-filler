# Local Test Environment

This folder contains a local test environment for developing and testing the form filler automation without affecting the live website.

## Overview

The local test environment allows you to:
- Test form automation in a controlled environment
- Debug form filling logic without live submissions
- Develop new features safely
- Capture and analyze form submissions locally

## Files

| File | Purpose |
|------|---------|
| `index.js` | Automation script adapted for localhost testing |
| `webpage.html` | Local replica of form with highlighted target fields |
| `server.js` | Express server handling form submissions |
| `utils.js` | Utility functions for automation |
| `config.js` | Configuration settings for local testing |
| `package.json` | Dependencies and npm scripts |
| `post.log` | Form submission data logging |
| `automation.log` | Automation execution logs |

## Features

### Form Enhancements
- **Yellow highlighting** on target form fields matching screenshot requirements
- **Visual feedback** with highlighted Save & Quote button
- **Conditional submission** - AJAX for manual users, standard POST for automation

### Automation Features  
- **Simplified field targeting** - Only fills highlighted fields from screenshot
- **Crash prevention** - Improved error handling and element checking
- **Step-by-step logging** - Detailed execution tracking
- **Screenshot capture** - Error debugging with visual evidence

### Server Capabilities
- **Dual content-type support** - JSON and form-encoded submissions
- **Timestamped logging** - All submissions logged to post.log
- **Development feedback** - Real-time form data capture

## Installation

1. Navigate to local_test directory:
```bash
cd local_test
```

2. Install dependencies:
```bash
npm install
```

## Usage

### Manual Testing

1. Start the development server:
```bash
npm start
```

2. Open browser to view form:
```
http://localhost:3000
```

3. Fill form manually and submit to test logging
4. Check `post.log` for submission data

### Automation Testing

1. Ensure server is running (separate terminal):
```bash
npm start
```

2. Run automation in test mode:
```bash
npm test
# or
node index.js --test
```

3. Check logs:
   - `automation.log` - Execution details
   - `post.log` - Form submission data
   - `screenshots/` - Error debugging images

### Automation Options

```bash
# Test single record
npm test

# Process multiple records  
node index.js --max 5

# Start from specific row
node index.js --start 2 --max 3
```

## Configuration

### Target Form Fields
The automation fills only highlighted fields:
- ✅ First Name
- ✅ Last Name
- ✅ Phone Number  
- ✅ Credit Score
- ✅ Address
- ✅ City
- ✅ State
- ✅ Zip Code
- ✅ Property Value
- ✅ Property Tax

### Default Values
Non-highlighted fields use safe defaults:
- Email: Empty (not highlighted)
- Veteran Status: No
- Property Type: Single Family
- Occupancy: Primary
- Revolving Debt: 0
- Installment Debt: 0

## Development Workflow

1. **Test locally** - Develop features in local_test environment
2. **Debug issues** - Use screenshots and logs for troubleshooting  
3. **Validate automation** - Ensure form filling works correctly
4. **Apply to production** - Transfer working logic to main application

## Troubleshooting

### Common Issues

1. **Server not starting**: Check if port 3000 is already in use
2. **Form not submitting**: Verify automation detection logic
3. **Missing data in post.log**: Check server logs for errors
4. **Automation crashes**: Review automation.log and screenshots

### Debug Features

- **Element existence checking** before interaction
- **Detailed step logging** for each form field
- **Error screenshots** with timestamps
- **Process crash handlers** with stack traces

## Differences from Main Application

| Feature | Main App | Local Test |
|---------|----------|------------|
| Target URL | theleadzone.com | localhost:3000 |
| Authentication | AWS Cognito | None required |
| Form submission | Live website | Local server |
| Data persistence | Remote database | post.log file |
| Error recovery | Production-ready | Development-focused |

## Log Analysis

### automation.log Structure
```
[timestamp] [LEVEL]: Step description
[timestamp] [INFO]: Filling First Name (highlighted)
[timestamp] [ERROR]: Error details with stack trace
```

### post.log Structure  
```json
{
  "timestamp": "2025-06-12T...",
  "submissionType": "automation|manual",
  "formData": {
    "FirstName": "John",
    "LastName": "Doe",
    ...
  }
}
```

## Security Notes

- **No sensitive data** - Uses sample data only
- **Local only** - No external network requests
- **Safe testing** - Isolated from production systems
- **Debug information** - Includes detailed logging for development

## Success Indicators

✅ **Server starts** without errors
✅ **Form loads** with proper highlighting  
✅ **Automation completes** without crashes
✅ **Data appears** in post.log with timestamps
✅ **No validation errors** during submission

This local environment provides a safe space to develop, test, and debug form automation before deploying to production.