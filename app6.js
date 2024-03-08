const OpenAI = require("openai");

// Replace these with your actual API key and assistant ID
const apiKey = "YOUR_API_KEY";
const assistantId = "YOUR_ASSISTANT_ID";

OpenAI.apiKey = apiKey;

async function handleUserMessage(userId, message) {
  // 1. Retrieve or create thread for the user
  let threadId;
  // (Your logic to retrieve thread ID based on userId)
  if (!threadId) {
    threadId = await OpenAI.threads.create(assistantId);
  }

  // 2. Add user message to the thread
  await OpenAI.threads.addUserMessage(threadId, message);

  // 3. Run the assistant on the thread
  const response = await OpenAI.assistants.runAssistant(threadId, assistantId);

  // 4. Process and display the response
  const assistantResponse = response.data.message;
  console.log("Assistant Response:", assistantResponse);
}

// Example usage
handleUserMessage("user1", "What is the capital of France?");
