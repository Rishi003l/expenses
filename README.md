# Family Expense Tracker

A web-based application designed to help families track and manage their expenses efficiently. This application is specifically created for Lingeshwar, Vani, Ruchika, and Rishi.

## Features

- **Add Expenses**: Easily add new expenses with details like family member, date, category, amount, and description.
- **Edit Expenses**: Modify any expense entry if you made a mistake or need to update information.
- **Delete Expenses**: Remove unwanted or incorrect expense entries.
- **Search Functionality**: Quickly find expenses by searching any field.
- **Statistics Dashboard**: View total expenses and per-member spending breakdown.
- **Copy to Clipboard**: Copy all expense data to clipboard for easy pasting into spreadsheets.
- **Google Sheets Integration**: Direct link to open Google Sheets for more advanced data analysis.
- **Data Persistence**: All expense data is saved in your browser's local storage.
- **Responsive Design**: Works on desktop and mobile devices.

## How to Use

### Adding Expenses

1. Fill in the expense form with the following information:
   - Select the family member who made the expense
   - Enter the date of the expense (defaults to today)
   - Choose an expense category
   - Enter the amount spent
   - Add an optional description
2. Click "Add Expense" to save the expense to the system.

### Editing Expenses

1. In the expense history table, click the edit (pencil) icon next to the expense you want to modify.
2. Update the information in the modal form that appears.
3. Click "Update Expense" to save your changes.

### Deleting Expenses

1. In the expense history table, click the delete (trash) icon next to the expense you want to remove.
2. Confirm the deletion when prompted.

### Searching Expenses

1. Enter your search term in the search box.
2. Click the search button or press Enter to find matching expenses.
3. The table will update to show only the matching results.

### Exporting Data to Google Sheets

#### Method 1: Copy and Paste
1. Click the "Copy to Clipboard" button to copy all expense data in a tab-separated format.
2. Click the "Open Google Sheets" button to open your Google Sheets document.
3. In Google Sheets, paste the data (Ctrl+V or Cmd+V).
4. The data will paste with proper column formatting.

#### Method 2: Direct Upload (Requires Setup)
1. Click the "Upload to Sheets" button to directly upload all expense data to your Google Sheets document.
2. Follow the authentication process if prompted.
3. Your data will be uploaded and formatted automatically.

##### Setting Up Google Sheets API for Direct Upload

To use the automated upload feature, you need to set up Google Sheets API credentials:

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select an existing one)
3. In the sidebar, navigate to "APIs & Services" > "Library"
4. Search for "Google Sheets API" and enable it
5. Go to "APIs & Services" > "Credentials"
6. Click "Create Credentials" and select "API key"
7. Copy the API key
8. Click "Create Credentials" again and select "OAuth client ID"
9. Set the Application type to "Web application"
10. Add your website URL to "Authorized JavaScript origins"
11. Click "Create" and copy the Client ID

Once you have these credentials, open the `google-sheets-api.js` file in your project and update these lines:

```javascript
const CLIENT_ID = 'YOUR_CLIENT_ID_HERE'; 
const API_KEY = 'YOUR_API_KEY_HERE';
```

## Privacy Notice

This application stores all data locally in your browser. No data is sent to any server or third party. Clearing your browser data will remove all expense records.

## Technical Details

- Built with HTML, CSS, and vanilla JavaScript
- Uses localStorage for data persistence
- No external dependencies or frameworks
- Works offline once loaded

## Browser Compatibility

This expense tracker works with all modern browsers including:
- Google Chrome
- Mozilla Firefox
- Microsoft Edge
- Safari
- Opera

## License

This project is created for personal use by Lingeshwar, Vani, Ruchika, and Rishi.