const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// In-memory data storage for polls
const polls = {};

// Serve the static HTML frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// GET all polls index[cite: 1]
app.get('/api/polls', (req, res) => {
  const list = Object.values(polls).map(p => ({
    id: p.id,
    question: p.question,
    creator: p.creator,
    createdAt: p.createdAt
  }));
  res.json(list);
});

// GET a specific poll by ID[cite: 1]
app.get('/api/polls/:id', (req, res) => {
  const poll = polls[req.params.id];
  if (!poll) {
    return res.status(404).json({ error: 'Poll not found' });
  }
  res.json(poll);
});

// POST create a new poll[cite: 1]
app.post('/api/polls', (req, res) => {
  const { id, question, creator, options } = req.body;

  if (!question || !creator || !options || options.length < 2) {
    return res.status(400).json({ error: 'Invalid poll data' });
  }

  const newPoll = {
    id: id || Math.random().toString(36).slice(2, 8) + Math.random().toString(36).slice(2, 5),
    question,
    creator,
    options,
    votes: new Array(options.length).fill(0),
    voters: {},
    createdAt: Date.now()
  };

  polls[newPoll.id] = newPoll;
  res.status(201).json(newPoll);
});

// POST submit a vote to a poll[cite: 1]
app.post('/api/polls/:id/vote', (req, res) => {
  const { name, optionIndex } = req.body;
  const poll = polls[req.params.id];

  if (!poll) {
    return res.status(404).json({ error: 'Poll not found' });
  }

  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }

  const existingUser = Object.keys(poll.voters).find(
    voter => voter.toLowerCase() === name.toLowerCase()
  );

  if (existingUser) {
    return res.status(400).json({ error: 'This name has already voted on this poll' });
  }

  if (optionIndex < 0 || optionIndex >= poll.options.length) {
    return res.status(400).json({ error: 'Invalid option selected' });
  }

  poll.votes[optionIndex] = (poll.votes[optionIndex] || 0) + 1;
  poll.voters[name] = optionIndex;

  res.json(poll);
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
