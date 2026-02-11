document.getElementById('activate').addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
    chrome.tabs.sendMessage(tab.id, {action: "activate_picker"});
    window.close(); // Close popup so you can click the page
});