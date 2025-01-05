// content.js

// Listen for messages from the popup
chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    if (request.type === "GET_TRANSCRIPT_AND_SUMMARIZE") {
      try {
        // 1. Extract video ID
        const videoId = getYouTubeVideoId(window.location.href);
        if (!videoId) {
          sendResponse({ success: false, error: "No valid YouTube video ID found." });
          return;
        }
  
        // 2. Fetch the transcript
        const transcript = await fetchYouTubeTranscript(videoId);
        if (!transcript) {
          sendResponse({ success: false, error: "No transcript found or failed to fetch." });
          return;
        }
  
        // 3. Ask background to summarize
        chrome.runtime.sendMessage(
          { type: "SUMMARIZE_TRANSCRIPT", transcript },
          (response) => {
            // 4. Send summary back to popup
            sendResponse(response);
          }
        );
      } catch (error) {
        console.error(error);
        sendResponse({ success: false, error: error.message });
      }
      return true; // Indicate async
    }
  });
  
  function getYouTubeVideoId(url) {
    try {
      const urlObj = new URL(url);
      if (urlObj.hostname.includes("youtube.com") && urlObj.searchParams.has("v")) {
        return urlObj.searchParams.get("v");
      }
      return null;
    } catch (error) {
      return null;
    }
  }
  
  async function fetchYouTubeTranscript(videoId) {
    // For auto-generated English subtitles
    const url = `https://video.google.com/timedtext?lang=en&v=${videoId}&track=asr`;
  
    const response = await fetch(url);
    if (!response.ok) {
      return null;
    }
  
    const xmlText = await response.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, "text/xml");
    const textNodes = xmlDoc.getElementsByTagName("text");
    if (textNodes.length === 0) {
      return null;
    }
  
    let transcript = "";
    for (let i = 0; i < textNodes.length; i++) {
      const node = textNodes[i];
      let line = node.textContent || "";
      line = decodeHtmlEntities(line);
      transcript += line + " ";
    }
  
    return transcript.trim();
  }
  
  function decodeHtmlEntities(str) {
    const temp = document.createElement("textarea");
    temp.innerHTML = str;
    return temp.value;
  }
  