document.getElementById("summarizeBtn").addEventListener("click", async () => {
    const summaryDiv = document.getElementById("summary");
    summaryDiv.textContent = "Retrieving transcript and summarizing...";
  
    try {
      // Get the active tab so we know which to message
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
      // Send message to content script
      chrome.tabs.sendMessage(
        tab.id,
        { type: "GET_TRANSCRIPT_AND_SUMMARIZE" },
        (response) => {
          if (!response) {
            summaryDiv.textContent = "No response from content script.";
            return;
          }
  
          if (response.success) {
            summaryDiv.textContent = response.summary;
          } else {
            summaryDiv.textContent = `Error: ${response.error}`;
          }
        }
      );
    } catch (err) {
      summaryDiv.textContent = `Error: ${err.message}`;
    }
  });
  