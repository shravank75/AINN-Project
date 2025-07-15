// Check for clickjacking vulnerability
const checkClickjacking = () => {
    const headers = document?.head?.innerHTML;
    if (!headers.includes('X-Frame-Options') && !headers.includes('frame-ancestors')) {
        console.warn('[Clickjacking] Missing protective headers!');
        return true;
    }
    return false;
};

// Check for suspicious links
const getMaliciousLinks = () => {
    const suspicious = [];
    document.querySelectorAll('a').forEach(link => {
        const href = link.href;
        if (href.match(/(bit\.ly|tinyurl|\.xyz|\.tk|@|base64|raw)/i)) {
            suspicious.push(href);
        }
    });
    return suspicious;
};

// Check for anonymous or suspicious scripts
const detectAnonymousScripts = () => {
    const scripts = document.querySelectorAll('script');
    return [...scripts].filter(script =>
        !script.src || script.src.startsWith("http://") || script.src.includes("unknown")
    ).map(s => s.outerHTML.slice(0, 100) + "...");
};

// Detect file upload inputs
const detectFileUploads = () => {
    return [...document.querySelectorAll('input[type="file"]')].map(el => el.outerHTML);
};

// Collect all results
const scanPage = () => {
    const results = {
        clickjacking: checkClickjacking(),
        maliciousLinks: getMaliciousLinks(),
        anonymousScripts: detectAnonymousScripts(),
        fileUploads: detectFileUploads(),
    };

    chrome.runtime.sendMessage({ action: "scanResults", data: results });
};

scanPage();
