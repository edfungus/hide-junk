// Saves options to chrome.storage
const saveOptions = () => {
    chrome.storage.sync.set(
        {
            "www.google.com": document.getElementById('google-ids').value.split("\n"),
            "www.youtube.com": document.getElementById('youtube-ids').value.split("\n"),
        },
        () => {
            // Update status to let user know options were saved.
            const status = document.getElementById('status');
            status.textContent = 'Options saved';
            setTimeout(() => {
                status.textContent = '';
            }, 1500);
        }
    );
};

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
const restoreOptions = () => {
    chrome.storage.sync.get(
        { "www.google.com": [], "www.youtube.com": [] },
        (items) => {
            document.getElementById('google-ids').value = items["www.google.com"].join("\n")
            document.getElementById('youtube-ids').value = items["www.youtube.com"].join("\n")
        }
    );
};

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click', saveOptions);