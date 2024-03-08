const express = require('express');
const bodyParser = require('body-parser');
const OpenAI = require('openai');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const app = express();
const openai = new OpenAI({
  apiKey: 'your_api_key',
});

app.use(bodyParser.json());

// Connect to MongoDB (replace with your connection string)
mongoose.connect('mongodb://localhost:27017/your_database_name', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// User model for interacting with the database
const User = mongoose.model('User', {
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // For password authentication
  threadId: { type: String, unique: true },
});

// Step 1 to 4: (refer to previous explanation)

// Step 5: Handle User Messages with Assistant Interaction
app.post('/message', async (req, res) => {
  const email = req.body.email; // Assuming email is sent in the request body
  const userMessage = req.body.message;

  try {
    // Optional login step (replace with your authentication logic and error handling)
    // const user = await handleLogin(email, password); // Replace password if used
    // if (!user) {
    //   return res.status(401).json({ error: 'Invalid login credentials' });
    // }

    let threadId = await retrieveThreadByUserId(email);
    if (!threadId) {
      threadId = await createThread(email);
    }

    // Add User Message
    await openai.beta.threads.messages.create(threadId, {
      role: 'user',
      content: userMessage,
    });

    // Run Assistant
    const run = await openai.beta.threads.runs.create(threadId, {
      assistant_id: yourAssistantId, // Replace with your assistant ID
      instructions: 'Please address the user as [Name] and answer their question in a helpful and informative way.' // Replace instructions as needed
    });

    // Periodically retrieve the Run until completed
    let runStatus = run.status;
    while (runStatus === 'queued' || runStatus === 'in_progress') {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for 2 seconds before checking again
      const retrievedRun = await openai.beta.threads.runs.retrieve(threadId, run.id);
      runStatus = retrievedRun.status;
    }

    // Retrieve Messages and send Assistant Response
    const messages = await openai.beta.threads.messages.list(threadId);
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
