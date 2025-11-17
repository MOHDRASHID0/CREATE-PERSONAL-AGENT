import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Settings, MessageSquare, Save, Bot } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

function App() {
  // Agent Configuration State
  const [config, setConfig] = useState({
    name: '',
    role: '',
    instructions: ''
  });

  // Chat State
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' or 'config'

  // Fetch Agent Config on Load
  useEffect(() => {
    axios.get(`${API_URL}/agent`).then(res => setConfig(res.data));
  }, []);

  // Save Configuration
  const saveConfig = async () => {
    await axios.post(`${API_URL}/agent`, config);
    alert('Agent Updated! It will now behave differently.');
    setActiveTab('chat');
  };

  // Send Message
  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMsg = { role: 'user', content: input };
    setMessages([...messages, newMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await axios.post(`${API_URL}/chat`, {
        message: input,
        agentConfig: config
      });

      setMessages(prev => [...prev, { role: 'ai', content: res.data.reply }]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex font-sans">

      {/* Sidebar Navigation */}
      <div className="w-20 bg-gray-800 flex flex-col items-center py-8 space-y-6 border-r border-gray-700">
        <div className="p-3 bg-blue-600 rounded-lg">
          <Bot size={28} />
        </div>
        <button
          onClick={() => setActiveTab('chat')}
          className={`p-3 rounded-lg transition ${activeTab === 'chat' ? 'bg-gray-700 text-blue-400' : 'hover:bg-gray-700 text-gray-400'}`}
        >
          <MessageSquare size={24} />
        </button>
        <button
          onClick={() => setActiveTab('config')}
          className={`p-3 rounded-lg transition ${activeTab === 'config' ? 'bg-gray-700 text-blue-400' : 'hover:bg-gray-700 text-gray-400'}`}
        >
          <Settings size={24} />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen">

        {/* Header */}
        <header className="h-16 border-b border-gray-700 flex items-center px-8 bg-gray-800/50 backdrop-blur">
          <h1 className="text-xl font-semibold tracking-wide">
            {activeTab === 'chat' ? `Work Mode: ${config.role}` : 'Configure Agent'}
          </h1>
        </header>

        {/* VIEW: Configuration */}
        {activeTab === 'config' && (
          <div className="p-8 max-w-2xl mx-auto w-full">
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Agent Name</label>
                <input
                  value={config.name}
                  onChange={e => setConfig({ ...config, name: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Role / Persona</label>
                <input
                  value={config.role}
                  onChange={e => setConfig({ ...config, role: e.target.value })}
                  placeholder="e.g. Senior Python Developer"
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Instructions (System Prompt)</label>
                <textarea
                  value={config.instructions}
                  onChange={e => setConfig({ ...config, instructions: e.target.value })}
                  rows="6"
                  placeholder="Define how the agent should behave, what rules it must follow, and its tone."
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <button
                onClick={saveConfig}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition"
              >
                <Save size={18} /> Save Agent Configuration
              </button>
            </div>
          </div>
        )}

        {/* VIEW: Chat */}
        {activeTab === 'chat' && (
          <div className="flex flex-col flex-1 max-w-4xl w-full mx-auto">

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {messages.length === 0 && (
                <div className="text-center text-gray-500 mt-20">
                  <h2 className="text-2xl font-bold text-white mb-2">Hello, I am {config.name}</h2>
                  <p>I am your {config.role}. How can I help with your work today?</p>
                </div>
              )}
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl p-4 ${msg.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800 border border-gray-700 text-gray-200'
                    }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {loading && <div className="text-gray-500 text-sm animate-pulse ml-2">Agent is thinking...</div>}
            </div>

            {/* Input Area */}
            <div className="p-6">
              <div className="relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder={`Message ${config.name}...`}
                  className="w-full bg-gray-800 text-white border border-gray-700 rounded-xl pl-4 pr-12 py-4 focus:ring-2 focus:ring-blue-500 outline-none shadow-lg"
                />
                <button
                  onClick={sendMessage}
                  disabled={loading}
                  className="absolute right-3 top-3 p-2 bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
                >
                  <MessageSquare size={18} />
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default App;