chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.action === "scanResults") {
        const data = msg.data;
        const resultsDiv = document.getElementById("results");

        resultsDiv.innerHTML = `
            <p><strong>Clickjacking:</strong> ${data.clickjacking ? "⚠️ Vulnerable" : "✅ Safe"}</p>
            <p><strong>Malicious Links:</strong><br>${data.maliciousLinks.join('<br>') || '✅ None'}</p>
            <p><strong>Anonymous Scripts:</strong><br>${data.anonymousScripts.join('<br>') || '✅ None'}</p>
            <p><strong>File Uploads:</strong><br>${data.fileUploads.join('<br>') || '✅ None'}</p>
        `;
    }
});
