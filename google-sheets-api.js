const CLIENT_ID = '671675605527-8eoq5m2nvp3bkiabicejjolo9fl9lau5.apps.googleusercontent.com';
const API_KEY = 'AIzaSyDcSF3IA9ADnE55s6Of7eAxZLibt65PKL0';
const SPREADSHEET_ID = '18gkpS5t7HB6d9d0gaa3FWUXEjABf9Tlx3i0h_EmaVBY';
const SCOPES = 'https://www.googleapis.com/auth/spreadsheets';

let tokenClient;
let gapiInited = false;
let gisInited = false;

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

function gapiLoaded() {
    gapi.load('client', initializeGapiClient);
}

async function initializeGapiClient() {
    await gapi.client.init({
        apiKey: API_KEY,
        discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
    });
    gapiInited = true;
    updateUploadButton();
}

function gisLoaded() {
    tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: '', // Will be assigned dynamically
    });
    gisInited = true;
    updateUploadButton();
}

function updateUploadButton() {
    const uploadButton = document.getElementById('upload-to-sheets');
    if (uploadButton) {
        uploadButton.disabled = !(gapiInited && gisInited);
    }
}

function getAccessToken() {
    return new Promise((resolve, reject) => {
        tokenClient.callback = (resp) => {
            if (resp.error) reject(resp);
            else resolve(resp);
        };
        tokenClient.requestAccessToken({ prompt: '' });
    });
}

function formatDateForSheets(dateString) {
    const date = new Date(dateString);
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
}

async function uploadExpensesToSheets() {
    try {
        console.log("Upload to Sheets button clicked.");

        if (!gapiInited || !gisInited) {
            showNotification('Google API not initialized. Try again in a few seconds.', 'error');
            return;
        }

        if (!CLIENT_ID || !SPREADSHEET_ID) {
            showSetupInstructions();
            return;
        }

        showNotification('Authenticating with Google...', 'info');
        await getAccessToken();

        const localExpenses = JSON.parse(localStorage.getItem('expenses')) || [];
        if (localExpenses.length === 0) {
            showNotification('No expenses to upload!', 'error');
            return;
        }

        // Read existing IDs from the sheet
        const existingResponse = await gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: 'Sheet1!A2:A',
        });

        const existingIds = new Set();
        if (existingResponse.result.values) {
            existingResponse.result.values.forEach(row => {
                if (row[0]) existingIds.add(row[0].toString());
            });
        }

        // Filter out already uploaded
        const newExpenses = localExpenses.filter(exp => !existingIds.has(exp.id.toString()));
        if (newExpenses.length === 0) {
            showNotification('No new expenses to upload.', 'info');
            return;
        }

        // Format new expenses with readable date
        const values = newExpenses.map(exp => [
            exp.id,
            exp.familyMember,
            formatDateForSheets(exp.date),
            exp.category,
            exp.amount,
            exp.description
        ]);

        showNotification(`Uploading ${values.length} new expenses...`, 'info');

        await gapi.client.sheets.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
            range: 'Sheet1!A1',
            valueInputOption: 'USER_ENTERED',
            insertDataOption: 'INSERT_ROWS',
            resource: {
                values: values
            }
        });

        showNotification(`Successfully uploaded ${values.length} expense(s) to Google Sheets!`, 'success');
    } catch (error) {
        console.error('Error uploading to Google Sheets:', error);
        showNotification('Error uploading to Google Sheets. Check console for details.', 'error');
    }
}

function showSetupInstructions() {
    alert('Google Sheets API not configured correctly. Check CLIENT_ID and SPREADSHEET_ID.');
}

window.uploadExpensesToSheets = uploadExpensesToSheets;
window.addEventListener('DOMContentLoaded', loadGoogleAPIs);
