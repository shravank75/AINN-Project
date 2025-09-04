chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === "scanPage") {
    // Just forward back to popup
    sendResponse({ status: "ok" });
  }
  return true; // keep port open
});
