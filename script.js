// Function to handle download button click

document.addEventListener('DOMContentLoaded', function () {
   
    window.ipcRenderer.send('ready');

    const ipcRenderer = window.ipcRenderer;

    mapFiles();

function handleDownloadButtonClick() {
    const url = document.getElementById('urlInput').value;
    const name = document.getElementById('nameInput').value;
    
    // Send IPC event for downloading the file
    ipcRenderer.send('download', { url, name });
}

// Event listener for download button click
document.getElementById('downloadButton').addEventListener('click', handleDownloadButtonClick);

// Listen for download-success event from main process
ipcRenderer.on('download-success', (event, data) => {
    if (data.success) {
        alert('Download successful. File saved at: ' + data.filePath);
      
    } else {
        alert('Download failed: ' + data.error);
    }
});

// Listen for download-error event from main process
ipcRenderer.on('download-error', (event, data) => {
    console.error('Error:', data.error);
    alert('Download failed. Please check your connection.');
});

function mapFiles() {
    
    ipcRenderer.send('files', {}) 
    ipcRenderer.on('files-success', async(event, {documents, photos, videos}) => {
        function createListItem(item, listId) {
            console.log('mapping files');
            const listItem = document.createElement("li");
            const span = document.createElement("span");
            listItem.textContent = item; // Assuming each item has a 'name' property
            
            span.textContent = item;

            // Add event listener for item click
            span.addEventListener('click', () => {
                const newName = prompt("Enter new name or leave blank to delete:");
                if (newName !== null) {
                    if (newName === "") {
                        // Delete item
                        listItem.remove();
                        ipcRenderer.send('delete', item);
                    } else {
                        // Rename item
                        listItem.textContent = newName;
                        ipcRenderer.send('rename', { oldName: item, newName: newName });
                    }
                }
            });

            document.getElementById(listId).appendChild(listItem);
        }

        const uniqueVideos = new Set(videos);
        const uniquePhotos = new Set(photos);
        const uniqueDocuments = new Set(documents);

        // Mapping videos
        if (uniqueVideos.size > 0) {
            uniqueVideos.forEach(video => {
                createListItem(video, "videosList");
            });
        } else {
            document.getElementById("videosList").innerText = "no Videos";
        }

        // Mapping photos
        if (uniquePhotos.size > 0) {
            uniquePhotos.forEach(photo => {
                createListItem(photo, "photosList");
            });
        } else {
            document.getElementById("photosList").innerText = "no Photos";
        }

        // Mapping documents
        if (uniqueDocuments.size > 0) {
            uniqueDocuments.forEach(document => {
                createListItem(document, "documentsList");
            });
        } else {
            document.getElementById("documentsList").innerText = "no Documents";
        }

        // Send IPC event for resizing
        ipcRenderer.send('resize');
    })   

        
}





})