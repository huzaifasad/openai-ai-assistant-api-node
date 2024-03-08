const express = require('express');
const bodyParser = require('body-parser');
const OpenAI = require('openai');
const mongoose = require('mongoose');

const app = express();
const openai = new OpenAI({
  apiKey: 'your api key',
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
  threadId: { type: String, unique: true },
});

// Step 1: Retrieve Thread for User (using email as ID)
async function retrieveThreadByUserId(email) {
  const user = await User.findOne({ email });
  if (!user) {
    return null;
  }
  return user.threadId;
}

// Step 2: Create a new Thread (if user doesn't have one)
async function createThread(userId) {
  const thread = await openai.beta.threads.create();
  await User.findOneAndUpdate({ email: userId }, { threadId: thread.id });
  return thread.id;
}

// Step 3: Handle User Messages (similar to previous example)
app.post('/message', async (req, res) => {
  const email = req.body.email; // Assuming email is sent in the request body
  const userMessage = req.body.message;

  try {
    let threadId = await retrieveThreadByUserId(email);
    if (!threadId) {
      threadId = await createThread(email);
    }

    // 4. Add User Message and Run Assistant (same as before)
    // ... your code from the previous example ...

    // Respond with assistant's response
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
