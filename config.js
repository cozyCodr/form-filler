module.exports = {
  // Form URL
  formUrl: "https://the-leadzone.com/Lead/Add",

  // Excel file configuration
  excelFile: "input.xlsx",
  sheetName: "Sheet1", // Change if your sheet has a different name

  // Browser configuration
  browser: {
    headless: false, // Set to true to run in background
    defaultViewport: null,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-web-security",
      "--disable-features=IsolateOrigins,site-per-process",
    ],
  },

  // Timing configuration (in milliseconds)
  delays: {
    betweenFields: { min: 100, max: 300 }, // Delay between filling fields
    afterFormFill: { min: 1000, max: 2000 }, // Delay after filling entire form
    betweenSubmissions: { min: 10000, max: 12000 }, // Delay between form submissions (10-12 seconds)
    pageLoad: 5000, // Wait for page to load
    afterLogin: 3000, // Wait after login
  },

  // Field typing configuration
  typing: {
    delay: { min: 50, max: 150 }, // Delay between keystrokes (ms)
  },

  // Batch processing
  batch: {
    size: 10, // Process this many records at a time before pausing
    pauseDuration: 30000, // Pause for 30 seconds between batches
  },

  // Retry configuration
  retry: {
    maxAttempts: 3,
    delay: 5000, // Wait 5 seconds between retry attempts
  },

  // State mapping (for dropdown values)
  stateMapping: {
    AL: "1",
    AK: "2",
    AZ: "3",
    AR: "4",
    CA: "5",
    CO: "6",
    CT: "7",
    DE: "8",
    FL: "9",
    GA: "10",
    HI: "11",
    ID: "12",
    IL: "13",
    IN: "14",
    IA: "15",
    KS: "16",
    KY: "17",
    LA: "18",
    ME: "19",
    MD: "20",
    MA: "21",
    MI: "22",
    MN: "23",
    MS: "24",
    MO: "25",
    MT: "26",
    NE: "27",
    NV: "28",
    NH: "29",
    NJ: "30",
    NM: "31",
    NY: "32",
    NC: "33",
    ND: "34",
    OH: "35",
    OK: "36",
    OR: "37",
    PA: "38",
    RI: "39",
    SC: "40",
    SD: "41",
    TN: "42",
    TX: "43",
    UT: "44",
    VT: "45",
    VA: "46",
    WA: "47",
    WV: "48",
    WI: "49",
    WY: "50",
  },

  // Logging configuration
  logging: {
    level: "info", // Options: 'error', 'warn', 'info', 'debug'
    filename: "automation.log",
  },
};
