/**
 * Google Sheets API Integration for Family Expense Tracker
 * Handles authentication and data appending to Google Sheets
 */

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
        callback: '', // Set later
    });
    gisInited = true;
    updateUploadButton();
}

function updateUploadButton() {
    const uploadButton = document.getElementById('upload-to-sheets');
    if (!uploadButton) return;
    uploadButton.disabled = !(gapiInited && gisInited);
}

function getAccessToken() {
    return new Promise((resolve, reject) => {
        if (gapi.client.getToken() === null) {
            tokenClient.callback = (resp) => {
                if (resp.error) reject(resp);
                else resolve(resp);
            };
            tokenClient.requestAccessToken({ prompt: 'consent' });
        } else {
            tokenClient.callback = (resp) => {
                if (resp.error) reject(resp);
                else resolve(resp);
            };
            tokenClient.requestAccessToken({ prompt: '' });
        }
    });
}

async function uploadExpensesToSheets() {
    try {
        if (!gapiInited || !gisInited) {
            showNotification('Google API not initialized. Try again in a few seconds.', 'error');
            return;
        }

        if (!CLIENT_ID) {
            showSetupInstructions();
            return;
        }

        showNotification('Authenticating with Google...', 'info');
        await getAccessToken();

        const expenses = JSON.parse(localStorage.getItem('expenses')) || [];
        if (expenses.length === 0) {
            showNotification('No expenses to upload!', 'error');
            return;
        }

        const values = expenses.map(expense => [
            expense.id,
            expense.familyMember,
            expense.date,
            expense.category,
            expense.amount,
            expense.description,
            expense.timestamp || new Date().getTime()
        ]);

        showNotification('Uploading data to Google Sheets...', 'info');

        // Append new rows (no clear)
        const result = await gapi.client.sheets.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
            range: 'Sheet1!A1',
            valueInputOption: 'USER_ENTERED',
            insertDataOption: 'INSERT_ROWS',
            resource: {
                values: values
            }
        });

        showNotification('Data successfully uploaded to Google Sheets!', 'success');
    } catch (error) {
        console.error('Error uploading to Google Sheets:', error);
        showNotification('Error uploading to Google Sheets. See console for details.', 'error');
    }
}

// Optional: Instructions modal for new users
function showSetupInstructions() {
    alert('Google Sheets API not configured. Please set up API key and OAuth client in google-sheets-api.js.');
}

// Load scripts on page load
window.addEventListener('DOMContentLoaded', loadGoogleAPIs);
