const { ipcMain, BrowserWindow, app } = require('electron');
const path = require('path');
const fs = require('fs');
const axios = require('axios');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    });

    mainWindow.loadFile('index.html');

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

app.whenReady().then(() => {
    createWindow();
});

ipcMain.on("files", async(event, {}) => {
    try {
        const directoryPath = 'C:\\Users\\ariel\\Downloads\\ariel';
    const { documents, photos, videos } = mapDirectory(directoryPath);
    console.log(documents, photos, videos);
    event.reply("files-success", {documents, photos, videos});
    } catch(err) {
        console.log("error: ", err);
    }
})

// Handle download requests
ipcMain.on('download', async (event, { url, name }) => {
    const fileType = url.split('.').pop();

    try {
        const filePath = await downloadFile(url, fileType, name);
        event.reply('download-success', { success: true, filePath });
    } catch (error) {
        event.reply('download-error', { success: false, error: error.message });
    }
});

// Handle delete requests
ipcMain.on('delete', async (event, name) => {
    try {
        const success = await deleteFile(name);
        event.reply('delete-success', { success: true, message: `File '${name}' deleted successfully.` });
    } catch (error) {
        event.reply('delete-error', { success: false, error: 'An error occurred while deleting the file.' });
    }
});

// Handle rename requests
ipcMain.on('rename', async (event, { oldName, newName }) => {
    try {
        const success = await renameFile(oldName, newName);
        event.reply('rename-success', { success: true, message: `File '${oldName}' renamed to '${newName}' successfully.` });
    } catch (error) {
        event.reply('rename-error', { success: false, error: 'An error occurred while renaming the file.' });
    }
});

// Function to download a file
async function downloadFile(url, type, name) {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    
    const fileName = `${name}.${type}`;
    const downloadsPath = app.getPath('downloads');
    const userDownloadsPath = path.join(downloadsPath, 'ariel');
    const filePath = path.join(userDownloadsPath, fileName);

    if (!fs.existsSync(userDownloadsPath)) {
        fs.mkdirSync(userDownloadsPath, { recursive: true });
    }

    fs.writeFileSync(filePath, response.data);

    return filePath;
}

// Function to delete a file
async function deleteFile(name) {
    const filePath = path.join('C:\\Users\\ariel\\Downloads\\ariel', name);

    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`File '${name}' deleted successfully.`);
        return true;
    } else {
        console.log(`File '${name}' not found.`);
        throw new Error(`File '${name}' not found.`);
    }
}

// Function to rename a file
async function renameFile(oldName, newName) {
    const oldFilePath = path.join('C:\\Users\\ariel\\Downloads\\ariel', oldName);
    const newFilePath = path.join('C:\\Users\\ariel\\Downloads\\ariel', newName);

    if (fs.existsSync(oldFilePath)) {
        fs.renameSync(oldFilePath, newFilePath);
        console.log(`File '${oldName}' renamed to '${newName}' successfully.`);
        return true;
    } else {
        console.log(`File '${oldName}' not found.`);
        throw new Error(`File '${oldName}' not found.`);
    }
}


function mapDirectory(directoryPath) {
    const files = fs.readdirSync(directoryPath);

    const documents = [];
    const photos = [];
    const videos = [];

    files.forEach(file => {
        const filePath = path.join(directoryPath, file);
        const fileExtension = path.extname(filePath).toLowerCase();

        if (fileExtension === '.txt' || fileExtension === '.pdf' || fileExtension === '.doc' || fileExtension === '.docx') {
            documents.push(file);
        } else if (fileExtension === '.jpg' || fileExtension === '.jpeg' || fileExtension === '.png' || fileExtension === '.gif') {
            photos.push(file);
        } else if (fileExtension === '.mp4' || fileExtension === '.avi' || fileExtension === '.mov' || fileExtension === '.wmv') {
            videos.push(file);
        }
    });

    return { documents, photos, videos };
}
