const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Handle form submissions
app.use(express.static(__dirname));

// Serve the HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'webpage.html'));
});

// Handle form submission
app.post('/submit-form', (req, res) => {
    try {
        const formData = req.body;
        const submissionType = req.headers['content-type'];
        
        // Create log entry
        const logEntry = {
            timestamp: new Date().toISOString(),
            submissionType: submissionType,
            formData: formData
        };
        
        // Convert to formatted JSON string
        const logString = JSON.stringify(logEntry, null, 2) + '\n\n';
        
        // Append to post.log file
        fs.appendFileSync(path.join(__dirname, 'post.log'), logString);
        
        console.log('Form data logged:', formData);
        console.log('Submission type:', submissionType);
        
        // Handle different response types
        if (submissionType && submissionType.includes('application/json')) {
            // AJAX submission
            res.json({ 
                success: true, 
                message: 'Form data received and logged successfully',
                timestamp: logEntry.timestamp 
            });
        } else {
            // Regular form submission (automation)
            res.send(`
                <html>
                    <body>
                        <h1>Form Submitted Successfully!</h1>
                        <p>Timestamp: ${logEntry.timestamp}</p>
                        <p>Data logged to post.log</p>
                        <pre>${JSON.stringify(formData, null, 2)}</pre>
                    </body>
                </html>
            `);
        }
        
    } catch (error) {
        console.error('Error processing form submission:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error processing form submission' 
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log('Form submissions will be logged to post.log');
});