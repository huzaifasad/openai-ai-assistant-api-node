const express = require('express');
const bodyParser = require('body-parser');
const OpenAI = require('openai');

const app = express();
const openai = new OpenAI({
  apiKey: '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',
});

app.use(bodyParser.json());

let myAssistant;
let myThread;

// Step 1: Create an Assistant
async function createAssistant() {
  myAssistant = await openai.beta.assistants.create({
    model: 'gpt-4',
    instructions: 'your instruction here',
    name: 'Math Tutor',
    tools: [{ type: 'code_interpreter' }],
  });
}

// Step 2: Create a Thread
async function createThread() {
  myThread = await openai.beta.threads.create();
}

// Step 3: Add a Message to a Thread
async function addUserMessage(userMessage) {
  await openai.beta.threads.messages.create(myThread.id, {
    role: 'user',
    content: userMessage,
  });
}

// Step 4: Run the Assistant
async function runAssistant() {
  const myRun = await openai.beta.threads.runs.create(myThread.id, {
    assistant_id: myAssistant.id,
    instructions: 'Please address the user as Huzaifa Saad.',
  });
  return myRun;
}

// Step 5: Retrieve Run
async function retrieveRun(runId) {
  return openai.beta.threads.runs.retrieve(myThread.id, runId);
}

// Step 6: Retrieve Messages
async function retrieveMessages() {

  const allMessages = await openai.beta.threads.messages.list(myThread.id);
  return allMessages.data;
}

// Express route to handle user messages
app.post('/message', async (req, res) => {
  const userMessage = req.body.message;
 
  try {
    if (!myAssistant) {
      await createAssistant();
    }

    if (!myThread) {
      await createThread();
    }

    await addUserMessage(userMessage);
    const run = await runAssistant();
   
    // Periodically retrieve the Run until completed
    let runStatus = run.status;
    while (runStatus === 'queued' || runStatus === 'in_progress') {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for 2 seconds before checking again
      const retrievedRun = await retrieveRun(run.id);
      runStatus = retrievedRun.status;
    }

    // Retrieve messages and send response
    const messages = await retrieveMessages();
    const assistantResponse = messages.find(msg => msg.role === 'assistant').content;
    res.json({ response: assistantResponse });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
