// background.js

// Replace with your real OpenAI key:
const OPENAI_API_KEY = "YOUR_OPENAI_API_KEY_HERE";

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  if (request.type === "SUMMARIZE_TRANSCRIPT") {
    const { transcript } = request;
    try {
      const summary = await getSummaryFromOpenAI(transcript);
      sendResponse({ success: true, summary });
    } catch (error) {
      console.error("Error summarizing transcript:", error);
      sendResponse({ success: false, error: error.message });
    }
  }

  // Return true for async response
  return true;
});

/**
 * Call OpenAI’s Chat Completion endpoint to summarize a transcript.
 */
async function getSummaryFromOpenAI(transcript) {
  const apiUrl = "https://api.openai.com/v1/chat/completions";

  const headers = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${OPENAI_API_KEY}`
  };

  const messages = [
    {
      role: "system",
      content: "You are a helpful assistant that summarizes YouTube transcripts."
    },
    {
      role: "user",
      content: `Summarize the following YouTube transcript in a concise paragraph:\n\n${transcript}`
    }
  ];

  const body = {
    model: "gpt-3.5-turbo",
    messages: messages,
    max_tokens: 200,
    temperature: 0.7
  };

  const response = await fetch(apiUrl, {
    method: "POST",
    headers,
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "Error from OpenAI API");
  }

  const data = await response.json();
  return data.choices[0].message.content.trim();
}
