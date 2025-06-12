# About the Lead Zone Form Automation Script

This script automates the process of filling out forms on the Lead Zone website using data from an Excel file.

## How it Works

1.  **Launch Browser:** When you run the script, it will launch a new Chrome browser window.
2.  **Manual Login:** The browser will navigate to the login page. **You need to manually log in to the Lead Zone website in this browser window.**
3.  **Indicate Login Complete:** After you have successfully logged in in the browser, return to the terminal where the script is running and press the **Enter** key.
4.  **Login Verification:** The script will then open a new tab in the same browser window and attempt to navigate to the form page (`/Lead/Add`). It will check for the presence of a specific element (`#FirstName`) on this page to confirm that you are successfully logged in and have access to the form.
    *   The script will check for this element every 5 seconds for up to 30 seconds.
    *   If the element is found within 30 seconds, the script considers the login verified, closes the verification tab, and proceeds to the next step.
    *   If the element is not found within 30 seconds (because you were not successfully logged in or redirected away from the form page), the script will inform you in the terminal and prompt you to ensure you are logged in and press Enter again to re-verify. This loop will continue until login is verified.
5.  **Automated Form Filling:** Once the login is verified, the script will read the data from your `input.xlsx` file and automatically navigate to the form page and fill out the forms using the data from each row.
6.  **Process Summary:** After processing all the leads, the script will provide a summary of successful and failed submissions and save detailed results to a JSON file.
7.  **Close Browser:** Finally, the script will close the browser window.

## Prerequisites

*   Node.js installed.
*   The required npm packages installed (run `npm install`).
*   An `input.xlsx` file with your lead data in the correct format.
*   Your login credentials configured (if using automatic login, though this version relies on manual login).

## Running the Script

Open your terminal in the project directory and run:

```bash
npm start
```

Or for a test run processing only one record:

```bash
npm test
```

Follow the prompts in the terminal regarding the manual login step.
