/**
 * Google Sheets API Integration for Family Expense Tracker
 * This file handles authentication and data upload to Google Sheets
 */

// Your Google API credentials (needed for OAuth)
const CLIENT_ID = '671675605527-8eoq5m2nvp3bkiabicejjolo9fl9lau5.apps.googleusercontent.com';
const API_KEY = 'AIzaSyDcSF3IA9ADnE55s6Of7eAxZLibt65PKL0';
const SPREADSHEET_ID = '18gkpS5t7HB6d9d0gaa3FWUXEjABf9Tlx3i0h_EmaVBY'; // The specific spreadsheet ID from the shared URL
const SCOPES = 'https://www.googleapis.com/auth/spreadsheets'; // Permission to read/write spreadsheets

// Global variables for Google API
let tokenClient;
let gapiInited = false;
let gisInited = false;

// Load the Google API client libraries
function loadGoogleAPIs() {
    const scriptGapi = document.createElement('script');
    scriptGapi.src = 'https://apis.google.com/js/api.js';
    scriptGapi.onload = () => gapiLoaded();
    document.head.appendChild(scriptGapi);

    const scriptGis = document.createElement('script');
    scriptGis.src = 'https://accounts.google.com/gsi/client';
    scriptGis.onload = () => gisLoaded();
    document.head.appendChild(scriptGis);
}

// Initialize Google API client
function gapiLoaded() {
    gapi.load('client', initializeGapiClient);
}

// Set up Google API client
async function initializeGapiClient() {
    await gapi.client.init({
        apiKey: API_KEY,
        discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
    });
    gapiInited = true;
    updateUploadButton();
}

// Initialize Google Identity Services
function gisLoaded() {
    tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: '', // Will be set later
    });
    gisInited = true;
    updateUploadButton();
}

// Update upload button status
function updateUploadButton() {
    const uploadButton = document.getElementById('upload-to-sheets');
    if (!uploadButton) return;

    if (gapiInited && gisInited) {
        uploadButton.disabled = false;
    } else {
        uploadButton.disabled = true;
    }
}

// Get Google API access token
function getAccessToken() {
    return new Promise((resolve, reject) => {
        // Check if we need to show the authorization prompt
        if (gapi.client.getToken() === null) {
            // Prompt the user for access
            tokenClient.callback = async (resp) => {
                if (resp.error !== undefined) {
                    reject(resp);
                    return;
                }
                resolve(resp);
            };
            tokenClient.requestAccessToken({ prompt: 'consent' });
        } else {
            // Skip prompt if we already have a token
            tokenClient.callback = async (resp) => {
                if (resp.error !== undefined) {
                    reject(resp);
                    return;
                }
                resolve(resp);
            };
            tokenClient.requestAccessToken({ prompt: '' });
        }
    });
}

// Upload expense data to Google Sheets
async function uploadExpensesToSheets() {
    try {
        // First, check if API libraries are loaded
        if (!gapiInited || !gisInited) {
            showNotification('Google API not initialized yet. Please try again in a few seconds.', 'error');
            return;
        }

        // Check if CLIENT_ID is set
        if (!CLIENT_ID) {
            showSetupInstructions();
            return;
        }

        // Show loading notification
        showNotification('Authenticating with Google...', 'info');

        // Get access token for Google Sheets API
        await getAccessToken();

        // Fetch expense data
        const expenses = JSON.parse(localStorage.getItem('expenses')) || [];
        if (expenses.length === 0) {
            showNotification('No expenses to upload!', 'error');
            return;
        }

        // Format data for Google Sheets
        const values = [
            ['ID', 'Family Member', 'Date', 'Category', 'Amount', 'Description', 'Timestamp']
        ];

        expenses.forEach(expense => {
            values.push([
                expense.id,
                expense.familyMember,
                expense.date,
                expense.category,
                expense.amount,
                expense.description,
                expense.timestamp || new Date().getTime()
            ]);
        });

        // Show uploading notification
        showNotification('Uploading data to Google Sheets...', 'info');

        // Clear the sheet first
        await gapi.client.sheets.spreadsheets.values.clear({
            spreadsheetId: SPREADSHEET_ID,
            range: 'Sheet1!A1:G',
        });

        // Update the sheet with new data
        const result = await gapi.client.sheets.spreadsheets.values.update({
            spreadsheetId: SPREADSHEET_ID,
            range: 'Sheet1!A1',
            valueInputOption: 'USER_ENTERED',
            resource: { values: values },
        });

        // Format the sheet (apply headers, resize columns)
        await formatSpreadsheet();

        showNotification('Data successfully uploaded to Google Sheets!', 'success');

    } catch (error) {
        console.error('Error uploading to Google Sheets:', error);
        showNotification('Error uploading to Google Sheets. See console for details.', 'error');
    }
}

// Apply formatting to the spreadsheet
async function formatSpreadsheet() {
    try {
        // Format header row to be bold
        const requests = [{
            repeatCell: {
                range: {
                    sheetId: 0,
                    startRowIndex: 0,
                    endRowIndex: 1
                },
                cell: {
                    userEnteredFormat: {
                        textFormat: {
                            bold: true
                        },
                        backgroundColor: {
                            red: 0.9,
                            green: 0.9,
                            blue: 0.9
                        }
                    }
                },
                fields: 'userEnteredFormat(textFormat,backgroundColor)'
            }
        }, {
            // Auto-resize columns to fit content
            autoResizeDimensions: {
                dimensions: {
                    sheetId: 0,
                    dimension: 'COLUMNS',
                    startIndex: 0,
                    endIndex: 7
                }
            }
        }];

        await gapi.client.sheets.spreadsheets.batchUpdate({
            spreadsheetId: SPREADSHEET_ID,
            resource: { requests: requests }
        });
    } catch (error) {
        console.error('Error formatting spreadsheet:', error);
    }
}

// Show instructions for setting up Google Sheets API
function showSetupInstructions() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 700px;">
            <span class="close">&times;</span>
            <h2>Google Sheets API Setup Instructions</h2>
            <div style="overflow-y: auto; max-height: 70vh;">
                <p>To use the automatic upload feature, you need to set up Google Sheets API credentials:</p>
                
                <ol style="line-height: 1.6; margin-left: 20px;">
                    <li>Go to the <a href="https://console.cloud.google.com/" target="_blank">Google Cloud Console</a></li>
                    <li>Create a new project (or select an existing one)</li>
                    <li>In the sidebar, navigate to "APIs & Services" > "Library"</li>
                    <li>Search for "Google Sheets API" and enable it</li>
                    <li>Go to "APIs & Services" > "Credentials"</li>
                    <li>Click "Create Credentials" and select "API key"</li>
                    <li>Copy the API key</li>
                    <li>Click "Create Credentials" again and select "OAuth client ID"</li>
                    <li>Set the Application type to "Web application"</li>
                    <li>Add your website URL to "Authorized JavaScript origins" (or use http://localhost for testing)</li>
                    <li>Click "Create" and copy the Client ID</li>
                </ol>
                
                <p>Once you have these credentials, open the <code>google-sheets-api.js</code> file in your project and update these lines:</p>
                
                <pre style="background-color: #f5f5f5; padding: 10px; border-radius: 5px; overflow-x: auto;">
const CLIENT_ID = 'YOUR_CLIENT_ID_HERE'; 
const API_KEY = 'YOUR_API_KEY_HERE';
                </pre>
                
                <p>For security reasons, we can't automatically fill in these values. You need to add them manually to your hosted version of the app.</p>
                
                <p>After setting up the credentials, reload the page and try uploading again.</p>
            </div>
            <div class="form-actions" style="margin-top: 20px;">
                <button type="button" class="btn btn-primary close-modal">I Understand</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close modal event
    modal.querySelector('.close-modal').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    modal.querySelector('.close').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
}

// Load Google APIs when the page loads
document.addEventListener('DOMContentLoaded', () => {
    loadGoogleAPIs();
    
    // Add click event for the upload button
    const uploadButton = document.getElementById('upload-to-sheets');
    if (uploadButton) {
        uploadButton.addEventListener('click', uploadExpensesToSheets);
    }
});