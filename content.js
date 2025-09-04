(function runScan() {
  // Helper: defang URLs
  function defang(url) {
    return url.replace(/^https?/i, match => match.replace(/http/i, 'hxxp'))
              .replace(/\./g, '[.]');
  }

  // Results object
  let results = {
    clickjacking: "✅ Safe — Frame protection present",
    links: "✅ None Detected",
    scripts: "✅ None Found",
    uploads: "✅ None Found"
  };

  // ===== Clickjacking detection =====
  const metaHeaders = [...document.querySelectorAll("meta[http-equiv]")]
    .map(m => m.content);
  if (!metaHeaders.join("").includes("X-Frame-Options") &&
      !metaHeaders.join("").includes("frame-ancestors")) {
    results.clickjacking = "⚠️ Vulnerable — No frame protection";
  }

  // ===== Links detection & defang =====
  const links = [...document.querySelectorAll("a[href]")];
  if (links.length) {
    results.links = links.map((a, i) => {
      const urlDefanged = defang(a.href);
      // Highlight suspicious links
      const isSuspicious = a.href.match(/(bit\.ly|tinyurl|\.ru|\.tk|http:\/\/\d+\.\d+\.\d+\.\d+)/i);
      return isSuspicious ? `⚠️ Link #${i+1}: ${urlDefanged}` : `Link #${i+1}: ${urlDefanged}`;
    }).join('\n');
  }

  // ===== Script detection =====
  const scripts = [...document.scripts];
  const badScripts = scripts.filter(s => !s.src || s.src.includes("unknown.com"));
  if (badScripts.length) {
    results.scripts = badScripts
      .map((s, i) => {
        const snippet = s.src ? `External: ${s.src}` : `Inline #${i+1}: ${s.innerText.slice(0, 80)}...`;
        return `⚠️ ${snippet}`;
      })
      .join('\n');
  }

  // ===== File upload detection =====
  const uploads = [...document.querySelectorAll('input[type="file"]')];
  if (uploads.length) {
    results.uploads = uploads
      .map((el, i) => `⚠️ Upload #${i+1}: ${el.outerHTML}`)
      .join('\n');
  }

  // Send results to popup.js
  chrome.runtime.sendMessage({ type: "scanResults", results });
})();
