const { contextBridge, ipcRenderer } = require('electron');

// Expose ipcRenderer to the window object
contextBridge.exposeInMainWorld(
    'ipcRenderer',
    {
        send: (channel, data) => {
            // Whitelist channels
            let validChannels = ['download', 'delete', 'rename', 'files'];
            if (validChannels.includes(channel)) {
                ipcRenderer.send(channel, data);
            }
        },
        
        on: (channel, callback) => {
            // Whitelist channels
            let validChannels = ['download-success', 'files', 'files-success', 'download-error'];
            if (validChannels.includes(channel)) {
                ipcRenderer.on(channel, callback);
            }
        }
    }
);
