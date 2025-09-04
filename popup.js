document.addEventListener("DOMContentLoaded", () => {
  runScan();
  document.getElementById("rescan").addEventListener("click", () => runScan());
});

function runScan() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs[0]) return;

    chrome.scripting.executeScript(
      { target: { tabId: tabs[0].id }, files: ["content.js"] },
      () => {
        if (chrome.runtime.lastError) {
          console.error("Injection failed:", chrome.runtime.lastError.message);
          showError("❌ Could not scan this page. Injection failed.");
        }
      }
    );
  });
}

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "scanResults") {
    displayResults(message.results);
  }
});

function displayResults(results) {
  const mapping = {
    clickjacking: document.querySelector(".card.clickjacking"),
    links: document.querySelector(".card.links"),
    scripts: document.querySelector(".card.scripts"),
    uploads: document.querySelector(".card.uploads")
  };

  for (let key in mapping) {
    const card = mapping[key];
    card.innerHTML = `<h4>${capitalize(key)}</h4><pre>${results[key]}</pre>`;

    // Coloring
    if (/⚠️|Vulnerable|Suspicious|Untrusted/i.test(results[key])) {
      card.classList.remove("safe", "neutral");
      card.classList.add("warning");
    } else if (/✅|Safe/i.test(results[key])) {
      card.classList.remove("warning", "neutral");
      card.classList.add("safe");
    } else {
      card.classList.remove("safe", "warning");
      card.classList.add("neutral");
    }
  }

  // Timestamp
  let ts = document.getElementById("timestamp");
  if (!ts) {
    ts = document.createElement("div");
    ts.id = "timestamp";
    ts.style.marginTop = "8px";
    ts.style.textAlign = "center";
    ts.style.fontSize = "11px";
    document.body.appendChild(ts);
  }
  ts.textContent = `Scanned At: ${new Date().toLocaleTimeString()}`;
}

function showError(msg) {
  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = `<div style="color:#ff5555; text-align:center">${msg}</div>`;
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
