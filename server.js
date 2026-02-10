const express = require('express');
const { WebSocketServer } = require('ws');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001;
const STATUS_FILE = path.join(__dirname, 'STATUS.json');

app.use(cors());
app.use(express.json());
app.use(express.static('dist'));

// Load status from file
function loadStatus() {
  try {
    return JSON.parse(fs.readFileSync(STATUS_FILE, 'utf8'));
  } catch {
    return { agents: {}, tasks: [], research: [], proposals: [] };
  }
}

// Save status to file
function saveStatus(data) {
  fs.writeFileSync(STATUS_FILE, JSON.stringify(data, null, 2));
}

// Broadcast to all WebSocket clients
function broadcast(wss, message) {
  wss.clients.forEach(client => {
    if (client.readyState === 1) {
      client.send(JSON.stringify(message));
    }
  });
}

// API Routes
app.get('/api/status', (req, res) => {
  res.json(loadStatus());
});

app.get('/api/agents', (req, res) => {
  const status = loadStatus();
  res.json(status.agents);
});

app.get('/api/tasks', (req, res) => {
  const status = loadStatus();
  res.json(status.tasks || []);
});

app.get('/api/research', (req, res) => {
  const status = loadStatus();
  res.json(status.research || []);
});

app.get('/api/proposals', (req, res) => {
  const status = loadStatus();
  res.json(status.proposals || []);
});

// Agent updates their status
app.post('/api/agent/:id/status', (req, res) => {
  const { id } = req.params;
  const { current, blocked, status: agentStatus } = req.body;
  
  const data = loadStatus();
  if (data.agents[id]) {
    data.agents[id].current = current;
    data.agents[id].blocked = blocked;
    data.agents[id].status = agentStatus || 'active';
    data.agents[id].lastUpdated = new Date().toISOString();
    saveStatus(data);
    
    // Broadcast update
    if (global.wss) {
      broadcast(global.wss, { type: 'agent_update', agent: data.agents[id] });
    }
    
    res.json({ ok: true, agent: data.agents[id] });
  } else {
    res.status(404).json({ error: 'Agent not found' });
  }
});

// Add completed task
app.post('/api/tasks', (req, res) => {
  const { agentId, title, outcome, link } = req.body;
  
  const data = loadStatus();
  const task = {
    id: Date.now(),
    agentId,
    title,
    outcome,
    link,
    completedAt: new Date().toISOString()
  };
  
  data.tasks = data.tasks || [];
  data.tasks.unshift(task);
  data.tasks = data.tasks.slice(0, 100); // Keep last 100
  saveStatus(data);
  
  if (global.wss) {
    broadcast(global.wss, { type: 'task_added', task });
  }
  
  res.json({ ok: true, task });
});

// Add research item
app.post('/api/research', (req, res) => {
  const { agentId, topic, findings, sources, status: researchStatus } = req.body;
  
  const data = loadStatus();
  const item = {
    id: Date.now(),
    agentId,
    topic,
    findings,
    sources,
    status: researchStatus || 'ongoing',
    createdAt: new Date().toISOString()
  };
  
  data.research = data.research || [];
  data.research.unshift(item);
  saveStatus(data);
  
  if (global.wss) {
    broadcast(global.wss, { type: 'research_added', item });
  }
  
  res.json({ ok: true, item });
});

// Add proposal
app.post('/api/proposals', (req, res) => {
  const { agentId, title, description, type, priority } = req.body;
  
  const data = loadStatus();
  const proposal = {
    id: Date.now(),
    agentId,
    title,
    description,
    type, // skill, tool, model, upgrade
    priority, // low, medium, high, critical
    status: 'pending',
    votes: [],
    createdAt: new Date().toISOString()
  };
  
  data.proposals = data.proposals || [];
  data.proposals.unshift(proposal);
  saveStatus(data);
  
  if (global.wss) {
    broadcast(global.wss, { type: 'proposal_added', proposal });
  }
  
  res.json({ ok: true, proposal });
});

// Vote on proposal
app.post('/api/proposals/:id/vote', (req, res) => {
  const { id } = req.params;
  const { agentId, vote } = req.body; // vote: 'up' or 'down'
  
  const data = loadStatus();
  const proposal = data.proposals?.find(p => p.id === parseInt(id));
  
  if (proposal) {
    proposal.votes = proposal.votes || [];
    proposal.votes = proposal.votes.filter(v => v.agentId !== agentId);
    proposal.votes.push({ agentId, vote, at: new Date().toISOString() });
    saveStatus(data);
    
    if (global.wss) {
      broadcast(global.wss, { type: 'proposal_voted', proposal });
    }
    
    res.json({ ok: true, proposal });
  } else {
    res.status(404).json({ error: 'Proposal not found' });
  }
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`🌙 Dashboard API running on http://localhost:${PORT}`);
});

// WebSocket server
const wss = new WebSocketServer({ server });
global.wss = wss;

wss.on('connection', (ws) => {
  console.log('Client connected');
  ws.send(JSON.stringify({ type: 'connected', data: loadStatus() }));
  
  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

console.log(`WebSocket server running on ws://localhost:${PORT}`);
