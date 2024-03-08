const express = require('express');
const bodyParser = require('body-parser');
const OpenAI = require('openai');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// ... other code (same as previous example)

// Step 6: Add User Message and Run Assistant
async function addUserMessageAndRunAssistant(threadId, userMessage) {
  try {
    // 1. Add user message to the thread
    await OpenAI.threads.messages.create(threadId, {
      role: 'user',
      content: userMessage,
    });

    // 2. Run the assistant on the thread
    const response = await OpenAI.assistants.runAssistant(threadId, assistantId);

    // 3. Handle queueing and retrieve response (replace with your retry logic)
    let runStatus = response.status;
    while (runStatus === 'queued' || runStatus === 'in_progress') {
      console.log('Waiting for Assistant response...');
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for 2 seconds
      const retrievedRun = await OpenAI.threads.runs.retrieve(threadId, response.id);
      runStatus = retrievedRun.status;
    }

    // 4. Extract and return assistant's response
    const assistantResponse = retrievedRun.data.messages.find(msg => msg.role === 'assistant').content;
    return assistantResponse;
  } catch (error) {
    throw error; // Re-throw errors for proper handling in the main function
  }
}

// Step 5: Handle User Messages (using previous functions)
app.post('/message', async (req, res) => {
  const email = req.body.email; // Assuming email is sent in the request body
  const userMessage = req.body.message;

  try {
    // ... code for user login/thread creation (same as previous example)

    // 5. Add user message and run the assistant
    const assistantResponse = await addUserMessageAndRunAssistant(threadId, userMessage);

    // Respond with assistant's response
    res.json({ response: assistantResponse });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
