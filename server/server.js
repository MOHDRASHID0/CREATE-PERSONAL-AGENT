// server/server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const OpenAI = require('openai');

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB (Local or Atlas)
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/self-agent');

// 1. Database Schema: The Agent's "Brain"
const AgentSchema = new mongoose.Schema({
    name: String,
    role: String, // e.g., "Senior Copywriter" or "Python Debugger"
    instructions: String, // The core logic/system prompt
});

const Agent = mongoose.model('Agent', AgentSchema);

// OpenAI Setup
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// --- API ROUTES ---

// Get current agent settings
app.get('/api/agent', async (req, res) => {
    // For MVP, we just fetch the first agent found
    let agent = await Agent.findOne();
    if (!agent) {
        agent = await Agent.create({
            name: "My Assistant",
            role: "General Helper",
            instructions: "You are a helpful assistant."
        });
    }
    res.json(agent);
});

// Update agent settings (The "Self" creation part)
app.post('/api/agent', async (req, res) => {
    const { name, role, instructions } = req.body;
    // Updates the existing singleton agent
    const agent = await Agent.findOneAndUpdate({}, { name, role, instructions }, { new: true, upsert: true });
    res.json(agent);
});

// Chat with the Agent
app.post('/api/chat', async (req, res) => {
    const { message, agentConfig } = req.body;

    try {
        // Construct the System Prompt based on user configuration
        const systemPrompt = `
      You are ${agentConfig.name}.
      Your Role is: ${agentConfig.role}.
      Your specific instructions are: ${agentConfig.instructions}.
      Stay strictly within this persona.
    `;

        const completion = await openai.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: message }
            ],
            model: "gpt-3.5-turbo", // or gpt-4o
        });

        res.json({ reply: completion.choices[0].message.content });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "AI processing failed" });
    }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));