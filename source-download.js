/**
 * This file contains the source code download functionality
 * It creates a self-contained ZIP file with all the website code
 */

document.addEventListener('DOMContentLoaded', () => {
    const downloadButton = document.getElementById('download-source-code');
    if (downloadButton) {
        downloadButton.addEventListener('click', downloadSourceCode);
    }
});

// Function to trigger download of source code
function downloadSourceCode() {
    // Show loading notification
    showNotification('Preparing download...', 'info');
    
    // Include JSZip library dynamically
    loadJSZip().then(() => {
        // Create a new ZIP file
        const zip = new JSZip();
        
        // Add each source file to the ZIP
        Promise.all([
            fetchAndAddToZip(zip, 'index.html'),
            fetchAndAddToZip(zip, 'styles.css'),
            fetchAndAddToZip(zip, 'script.js'),
            fetchAndAddToZip(zip, 'chart.js'),
            fetchAndAddToZip(zip, 'google-sheets-api.js'),
            fetchAndAddToZip(zip, 'source-download.js'),
            fetchAndAddToZip(zip, 'README.md')
        ]).then(() => {
            // Generate ZIP file and trigger download
            zip.generateAsync({ type: 'blob' }).then((content) => {
                // Create download link
                const url = URL.createObjectURL(content);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'family_expense_tracker.zip';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                
                // Clean up
                URL.revokeObjectURL(url);
                showNotification('Download complete!', 'success');
            });
        }).catch(error => {
            console.error('Error creating ZIP file:', error);
            showNotification('Error creating download. See console for details.', 'error');
        });
    }).catch(error => {
        console.error('Error loading JSZip:', error);
        showNotification('Error loading ZIP library. See console for details.', 'error');
    });
}

// Load JSZip library dynamically
function loadJSZip() {
    return new Promise((resolve, reject) => {
        if (window.JSZip) {
            resolve();
            return;
        }
        
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
        script.integrity = 'sha512-XMVd28F1oH/O71fzwBnV7HucLxVwtxf26XV8P4wPk26EDxuGZ91N8bsOttmnomcCD3CS5ZMRL50H0GgOHvegtg==';
        script.crossOrigin = 'anonymous';
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

// Fetch a file and add it to the ZIP
function fetchAndAddToZip(zip, filename) {
    return fetch(filename)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to fetch ${filename}: ${response.status} ${response.statusText}`);
            }
            return response.text();
        })
        .then(content => {
            zip.file(filename, content);
        })
        .catch(error => {
            console.error(`Error adding ${filename} to ZIP:`, error);
            throw error;
        });
}