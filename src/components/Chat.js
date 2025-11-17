import React, { useState, useEffect, useRef } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Fuse from 'fuse.js';
import { useAuth } from '../Context/AuthContext';
import Navbar from './Navbar';
import { 
  Send, Plus, Trash2, Code2, Sparkles, Menu, X, FileText, Book, 
  Download, Search, Edit2, RotateCcw, Copy, Check, ChevronDown
} from 'lucide-react';

function Chat() {
  const { user } = useAuth();
  const [input, setInput] = useState('');
  const [conversations, setConversations] = useState([]);
  const [currentChat, setCurrentChat] = useState(0);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [docsLoaded, setDocsLoaded] = useState(false);
  const [apiDocs, setApiDocs] = useState([]);
  const [loadingStatus, setLoadingStatus] = useState('Initializing...');
  const [foundDocs, setFoundDocs] = useState([]);
  const [showDocsDropdown, setShowDocsDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [editingTitle, setEditingTitle] = useState(null);
  const [compactView, setCompactView] = useState(false);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const fuseRef = useRef(null);

  const SDK_APIS = [
    'ac_car_scriptable_display',
    'ac_car_phys',
    'ac_apps',
    'ac_background',
    'ac_background_pw',
  ];

  useEffect(() => {
    const loadAllDocs = async () => {
      try {
        setLoadingStatus('Loading SDK documentation...');
        const allDocs = [];
        let loadedCount = 0;

        for (const apiName of SDK_APIS) {
          try {
            setLoadingStatus(`Loading ${apiName}... (${loadedCount + 1}/${SDK_APIS.length})`);
            
            const response = await fetch(`/lua_sdk/${apiName}/README.md`);
            if (!response.ok) {
              console.warn(`⚠️ Could not load ${apiName}/README.md`);
              continue;
            }
            
            const text = await response.text();
            const sections = [];
            const lines = text.split('\n');
            let currentSection = { title: 'Introduction', content: '', api: apiName };
            
            for (let i = 0; i < lines.length; i++) {
              const line = lines[i];
              
              if (line.match(/^#{1,3}\s/)) {
                if (currentSection.content.trim()) {
                  sections.push(currentSection);
                }
                currentSection = {
                  title: line.replace(/^#+\s*/, ''),
                  content: line + '\n',
                  api: apiName,
                  fullApi: apiName
                };
              } else {
                currentSection.content += line + '\n';
              }
            }
            
            if (currentSection.content.trim()) {
              sections.push(currentSection);
            }
            
            allDocs.push(...sections);
            loadedCount++;
            
          } catch (err) {
            console.warn(`Failed to load ${apiName}:`, err);
          }
        }
        
        setApiDocs(allDocs);
        
        fuseRef.current = new Fuse(allDocs, {
          keys: [
            { name: 'title', weight: 0.4 },
            { name: 'content', weight: 0.3 },
            { name: 'api', weight: 0.3 }
          ],
          threshold: 0.3,
          includeScore: true,
          minMatchCharLength: 3,
          distance: 1000,
          ignoreLocation: true
        });
        
        setDocsLoaded(true);
        setLoadingStatus(`✅ Loaded ${allDocs.length} sections from ${loadedCount} APIs`);
      } catch (error) {
        console.error('❌ Failed to load docs:', error);
        setDocsLoaded(false);
        setLoadingStatus('❌ Failed to load documentation');
      }
    };
    
    loadAllDocs();
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('sayrxai-ac-chats');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setConversations(parsed);
      } catch (err) {
        console.error('Failed to parse saved chats:', err);
        setConversations([{ 
          id: Date.now(), 
          title: 'New Conversation', 
          messages: [],
          timestamp: Date.now()
        }]);
      }
    } else {
      setConversations([{ 
        id: Date.now(), 
        title: 'New Conversation', 
        messages: [],
        timestamp: Date.now()
      }]);
    }
  }, []);

  useEffect(() => {
    if (conversations.length > 0) {
      localStorage.setItem('sayrxai-ac-chats', JSON.stringify(conversations));
    }
  }, [conversations]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversations, loading]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault();
        newChat();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        e.preventDefault();
        setSidebarOpen(!sidebarOpen);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [conversations, sidebarOpen]);

  const searchDocs = (query) => {
    if (!fuseRef.current || !docsLoaded) return [];
    
    const queryLower = query.toLowerCase();
    let apiBoost = '';
    
    if (queryLower.includes('display') || queryLower.includes('show') || queryLower.includes('cluster') || queryLower.includes('gauge')) {
      apiBoost = 'ac_car_scriptable_display';
    } else if (queryLower.includes('physics') || queryLower.includes('suspension') || queryLower.includes('engine')) {
      apiBoost = 'ac_car_phys';
    } else if (queryLower.includes('app') || queryLower.includes('ui') || queryLower.includes('window')) {
      apiBoost = 'ac_apps';
    } else if (queryLower.includes('background')) {
      apiBoost = 'ac_background';
    }
    
    const results = fuseRef.current.search(query);
    
    const sorted = results.sort((a, b) => {
      if (apiBoost) {
        if (a.item.api === apiBoost && b.item.api !== apiBoost) return -1;
        if (b.item.api === apiBoost && a.item.api !== apiBoost) return 1;
      }
      return a.score - b.score;
    });
    
    return sorted.slice(0, 5).map(result => result.item);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');

    const newConversations = [...conversations];
    if (newConversations[currentChat].messages.length === 0) {
      newConversations[currentChat].title = userMessage.slice(0, 40);
      newConversations[currentChat].timestamp = Date.now();
    }
    newConversations[currentChat].messages.push({ 
      role: 'user', 
      content: userMessage,
      timestamp: Date.now()
    });
    setConversations(newConversations);

    const relevantDocs = searchDocs(userMessage);
    setFoundDocs(relevantDocs);
    setShowDocsDropdown(true);
    
    setLoading(true);

    try {
      let contextInfo = '';
      let detectedAPIs = new Set();
      
      if (relevantDocs.length > 0) {
        contextInfo = '\n\n=== RELEVANT DOCUMENTATION ===\n\n';
        relevantDocs.forEach(doc => {
          detectedAPIs.add(doc.api);
          contextInfo += `[API: ${doc.api}]\n## ${doc.title}\n\n${doc.content}\n\n---\n\n`;
        });
        contextInfo += '=== END DOCUMENTATION ===\n\n';
      }

      const codeStyleGuide = `
=== ASSETTO CORSA LUA FILE STRUCTURE ===

**1. MANDATORY CODE STRUCTURE:**
ALL CODE MUST BE INSIDE function script.update(dt)

**2. CORRECT STRUCTURE:**
local car = ac.getCar(0)

function script.update(dt)
    if not car then return end
    -- Your code here
end

**3. GEAR DISPLAY:**
if gear == -1 then
    gearText = "R"
elseif gear == 0 then
    gearText = "N"
else
    gearText = tostring(gear)
end

if car.autoShift then
    gearText = gear == 0 and "N" or "D"
end

**CRITICAL RULES:**
- alignment = 'center' (STRING with quotes!)
- Colors: rgbm(r, g, b, a) with 0-1 values
- Positions: vec2(x, y)
`;

      const systemPrompt = `You are SayrxAI V1, an Assetto Corsa Lua scripting specialist created by Sayrx.

CRITICAL RULES:
1. ALWAYS wrap code in function script.update(dt)
2. ALWAYS initialize local car = ac.getCar(0) OUTSIDE function
3. ALWAYS check if not car then return end
4. ALWAYS use STRING for alignment: alignment = 'center'
5. NEVER put code outside update function!

${codeStyleGuide}
${contextInfo}

Detected APIs: ${Array.from(detectedAPIs).join(', ')}

Answer using ONLY the documentation above. Generate complete, working Lua code.`;

      const res = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'deepseek-coder-v2',
          prompt: `${systemPrompt}\n\nUser: ${userMessage}\n\nSayrxAI V1:`,
          stream: false
        })
      });

      const data = await res.json();
      const updatedConversations = [...newConversations];
      updatedConversations[currentChat].messages.push({ 
        role: 'assistant', 
        content: data.response,
        timestamp: Date.now(),
        docsUsed: relevantDocs.map(d => ({ title: d.title, api: d.api }))
      });
      setConversations(updatedConversations);
    } catch (error) {
      const updatedConversations = [...newConversations];
      updatedConversations[currentChat].messages.push({ 
        role: 'error', 
        content: 'Unable to connect to Ollama. Ensure it\'s running on localhost:11434',
        timestamp: Date.now()
      });
      setConversations(updatedConversations);
    }

    setLoading(false);
    setShowDocsDropdown(false);
    inputRef.current?.focus();
  };

  const newChat = () => {
    const newId = Date.now();
    setConversations([...conversations, { 
      id: newId, 
      title: 'New Conversation', 
      messages: [],
      timestamp: newId
    }]);
    setCurrentChat(conversations.length);
  };

  const deleteChat = (idx) => {
    if (conversations.length === 1) {
      setConversations([{ 
        id: Date.now(), 
        title: 'New Conversation', 
        messages: [],
        timestamp: Date.now()
      }]);
      setCurrentChat(0);
    } else {
      const filtered = conversations.filter((_, i) => i !== idx);
      setConversations(filtered);
      if (currentChat >= filtered.length) {
        setCurrentChat(filtered.length - 1);
      }
    }
  };

  const renameChat = (idx, newTitle) => {
    const updated = [...conversations];
    updated[idx].title = newTitle;
    setConversations(updated);
    setEditingTitle(null);
  };

  const exportChat = () => {
    const chat = conversations[currentChat];
    const content = chat.messages.map(m => 
      `${m.role.toUpperCase()}:\n${m.content}\n\n`
    ).join('');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${chat.title.replace(/[^a-z0-9]/gi, '_')}.lua`;
    a.click();
  };

  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const deleteMessage = (msgIndex) => {
    const updated = [...conversations];
    updated[currentChat].messages.splice(msgIndex, 1);
    setConversations(updated);
  };

  const regenerateResponse = () => {
    if (currentMessages.length < 2) return;
    
    const updated = [...conversations];
    const lastUserMsg = [...updated[currentChat].messages].reverse().find(m => m.role === 'user');
    
    const lastAssistantIdx = updated[currentChat].messages.findLastIndex(m => m.role === 'assistant');
    if (lastAssistantIdx !== -1) {
      updated[currentChat].messages.splice(lastAssistantIdx, 1);
      setConversations(updated);
    }
    
    if (lastUserMsg) {
      setInput(lastUserMsg.content);
      setTimeout(() => {
        handleSubmit({ preventDefault: () => {} });
      }, 100);
    }
  };

  const currentMessages = conversations[currentChat]?.messages || [];
  
  const filteredConversations = conversations.filter(chat => 
    chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const apiStats = apiDocs.reduce((acc, doc) => {
    acc[doc.api] = (acc[doc.api] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Sidebar */}
        <div className={`${sidebarOpen ? 'w-80' : 'w-0'} transition-all duration-300 border-r border-white/[0.08] flex flex-col bg-gradient-to-b from-[#0f0f0f] to-[#0a0a0a] relative overflow-hidden`}>
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/[0.03] via-transparent to-orange-500/[0.03]"></div>
          
          <div className="relative z-10 p-4 border-b border-white/[0.08] backdrop-blur-xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center">
                <Code2 className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <h1 className="font-semibold text-sm">Chat Assistant</h1>
                <p className="text-xs text-white/40">AC Lua Specialist</p>
              </div>
            </div>
            
            <div className={`mb-3 px-3 py-2 rounded-lg text-xs ${
              docsLoaded 
                ? 'bg-green-500/10 border border-green-500/20 text-green-400' 
                : 'bg-yellow-500/10 border border-yellow-500/20 text-yellow-400'
            }`}>
              <div className="flex items-center gap-2 justify-between">
                <div className="flex items-center gap-2">
                  <Book className="w-3 h-3" />
                  <span className="font-semibold">{loadingStatus.slice(0, 30)}</span>
                </div>
              </div>
              {docsLoaded && !compactView && (
                <div className="text-[10px] text-white/30 mt-2 space-y-0.5 max-h-24 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10">
                  {Object.entries(apiStats).map(([api, count]) => (
                    <div key={api} className="flex justify-between">
                      <span>{api}</span>
                      <span>{count} sections</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mb-3 relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-white/30" />
              <input
                type="text"
                placeholder="Search chats..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white/[0.05] border border-white/[0.08] rounded-lg text-sm outline-none focus:border-white/20 transition-colors"
              />
            </div>
            
            <button
              onClick={newChat}
              className="w-full py-2.5 px-4 bg-white/[0.08] hover:bg-white/[0.12] border border-white/[0.08] text-white rounded-xl text-sm font-medium transition-all active:scale-[0.98] flex items-center justify-center gap-2 group"
            >
              <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
              New Chat
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-1 relative z-10 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            {filteredConversations.map((chat, idx) => {
              const actualIdx = conversations.indexOf(chat);
              return (
                <div
                  key={chat.id}
                  className={`group relative p-3 rounded-xl cursor-pointer transition-all ${
                    currentChat === actualIdx
                      ? 'bg-white/[0.12] shadow-lg shadow-red-500/10 border border-white/[0.08]'
                      : 'hover:bg-white/[0.06] border border-transparent'
                  }`}
                  onClick={() => setCurrentChat(actualIdx)}
                >
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 transition-colors ${currentChat === actualIdx ? 'text-red-400' : 'text-white/40'}`}>
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      {editingTitle === actualIdx ? (
                        <input
                          type="text"
                          defaultValue={chat.title}
                          onBlur={(e) => renameChat(actualIdx, e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') renameChat(actualIdx, e.target.value);
                            if (e.key === 'Escape') setEditingTitle(null);
                          }}
                          autoFocus
                          className="w-full bg-white/[0.05] border border-white/[0.08] rounded px-2 py-1 text-sm outline-none"
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <div className="text-sm font-medium text-white/90 truncate">
                          {chat.title}
                        </div>
                      )}
                      <div className="text-xs text-white/30 mt-0.5">
                        {chat.messages.length} messages
                      </div>
                    </div>
                  </div>
                  <div className="absolute right-2 top-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingTitle(actualIdx);
                      }}
                      className="p-1.5 rounded-lg text-white/40 hover:text-blue-400 hover:bg-blue-500/10 transition-all"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteChat(actualIdx);
                      }}
                      className="p-1.5 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Chat */}
        <div className="flex-1 flex flex-col relative">
          <div className="h-16 border-b border-white/[0.08] flex items-center justify-between px-6 backdrop-blur-xl bg-[#0a0a0a]/80 relative z-10">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-white/[0.08] rounded-lg transition-colors"
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              <div>
                <h2 className="font-semibold text-sm text-white/90">
                  {conversations[currentChat]?.title || 'New Conversation'}
                </h2>
                <p className="text-xs text-white/40">Assetto Corsa • All Lua APIs</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {currentMessages.length > 0 && (
                <>
                  <button
                    onClick={regenerateResponse}
                    className="px-3 py-1.5 text-xs bg-white/[0.08] hover:bg-white/[0.12] rounded-lg transition-all border border-white/[0.08] flex items-center gap-2"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Regenerate
                  </button>
                  <button
                    onClick={exportChat}
                    className="px-3 py-1.5 text-xs bg-white/[0.08] hover:bg-white/[0.12] rounded-lg transition-all border border-white/[0.08] flex items-center gap-2"
                  >
                    <Download className="w-3 h-3" />
                    Export
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            {currentMessages.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center max-w-lg px-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-red-500/20 to-orange-600/20 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-white/[0.08]">
                    <Code2 className="w-10 h-10 text-red-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white/90 mb-3 bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
                    SayrxAI V1
                  </h2>
                  <p className="text-sm text-white/50 leading-relaxed mb-2">
                    Assetto Corsa Lua specialist by Sayrx
                  </p>
                  <p className="text-xs text-white/30 leading-relaxed mb-4">
                    Expert in all AC Lua APIs: displays, physics, apps, and more
                  </p>
                  <div className="mt-8 grid grid-cols-2 gap-2">
                    {[
                      'Display speed in MPH',
                      'Show RPM gauge',
                      'Turbo boost pressure',
                      'Tire temperature display',
                      'Custom gear indicator',
                      'G-force meter'
                    ].map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => setInput(suggestion)}
                        className="px-3 py-2 bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.08] rounded-lg text-xs transition-all text-left"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="max-w-4xl mx-auto py-8 px-6 space-y-8">
                {currentMessages.map((msg, idx) => (
                  <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} group`}>
                    <div className={`w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center ${
                      msg.role === 'user' 
                        ? 'bg-gradient-to-br from-red-500 to-red-600' 
                        : msg.role === 'error'
                        ? 'bg-gradient-to-br from-yellow-500 to-yellow-600'
                        : 'bg-gradient-to-br from-orange-500 to-orange-600'
                    }`}>
                      {msg.role === 'user' ? (
                        <span className="text-xs font-bold">You</span>
                      ) : msg.role === 'error' ? (
                        <span className="text-xs font-bold">!</span>
                      ) : (
                        <Code2 className="w-4 h-4" />
                      )}
                    </div>
                    
                    <div className={`flex-1 ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
                      {msg.docsUsed && msg.docsUsed.length > 0 && (
                        <div className="mb-2 flex gap-1 flex-wrap max-w-[85%]">
                          {msg.docsUsed.map((doc, i) => (
                            <span key={i} className="text-[10px] bg-white/[0.05] border border-white/[0.08] px-2 py-1 rounded-lg text-white/50">
                              <span className="text-orange-400">{doc.api}</span> • {doc.title}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className={`max-w-[85%] rounded-2xl relative ${
                        msg.role === 'user'
                          ? 'bg-gradient-to-br from-red-600 to-red-700 text-white border border-red-500/50'
                          : msg.role === 'error'
                          ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30'
                          : 'bg-white/[0.05] text-white/90 border border-white/[0.08]'
                      } overflow-hidden backdrop-blur-xl`}>
                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                          <button
                            onClick={() => copyToClipboard(msg.content, idx)}
                            className="p-1.5 bg-black/40 hover:bg-black/60 rounded text-xs transition-all"
                          >
                            {copiedIndex === idx ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          </button>
                          <button
                            onClick={() => deleteMessage(idx)}
                            className="p-1.5 bg-black/40 hover:bg-red-500/60 rounded text-xs transition-all"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>

                        <div className="px-4 py-3 prose prose-invert prose-sm max-w-none">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              code({node, inline, className, children, ...props}) {
                                const match = /language-(\w+)/.exec(className || '');
                                return !inline && match ? (
                                  <div className="relative group/code -mx-4 my-2">
                                    <button
                                      onClick={() => copyToClipboard(String(children).replace(/\n$/, ''), `code-${idx}`)}
                                      className="absolute top-2 right-2 z-10 px-2 py-1 bg-black/40 hover:bg-black/60 rounded text-xs transition-all opacity-0 group-hover/code:opacity-100 flex items-center gap-1"
                                    >
                                      {copiedIndex === `code-${idx}` ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                      Copy
                                    </button>
                                    <SyntaxHighlighter
                                      style={vscDarkPlus}
                                      language={match[1]}
                                      PreTag="div"
                                      customStyle={{
                                        margin: 0,
                                        borderRadius: 0,
                                        background: 'rgba(0,0,0,0.3)',
                                        fontSize: '13px',
                                        padding: '16px',
                                      }}
                                      {...props}
                                    >
                                      {String(children).replace(/\n$/, '')}
                                    </SyntaxHighlighter>
                                  </div>
                                ) : (
                                  <code className="bg-black/30 px-1.5 py-0.5 rounded text-sm" {...props}>
                                    {children}
                                  </code>
                                );
                              },
                              h1: ({node, ...props}) => <h1 className="text-xl font-bold mb-2 mt-4" {...props} />,
                              h2: ({node, ...props}) => <h2 className="text-lg font-bold mb-2 mt-3" {...props} />,
                              h3: ({node, ...props}) => <h3 className="text-base font-bold mb-2 mt-2" {...props} />,
                              p: ({node, ...props}) => <p className="mb-2 leading-relaxed" {...props} />,
                              ul: ({node, ...props}) => <ul className="list-disc list-inside mb-2 space-y-1" {...props} />,
                              ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-2 space-y-1" {...props} />,
                              li: ({node, ...props}) => <li className="leading-relaxed" {...props} />,
                              strong: ({node, ...props}) => <strong className="font-bold text-white" {...props} />,
                              em: ({node, ...props}) => <em className="italic" {...props} />,
                              a: ({node, ...props}) => <a className="text-red-400 hover:underline" {...props} />,
                              blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-white/20 pl-4 italic my-2" {...props} />,
                            }}
                          >
                            {msg.content}
                          </ReactMarkdown>
                        </div>

                        {msg.timestamp && (
                          <div className="px-4 pb-2 text-[10px] text-white/20">
                            {new Date(msg.timestamp).toLocaleTimeString()}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {loading && (
                  <div className="flex gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-orange-500 to-orange-600">
                      <Code2 className="w-4 h-4 animate-pulse" />
                    </div>
                    <div className="flex-1">
                      <div className="bg-white/[0.05] border border-white/[0.08] rounded-2xl px-4 py-3 backdrop-blur-xl">
                        <div className="flex gap-2 mb-2">
                          <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                        
                        {foundDocs.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-white/[0.08]">
                            <button
                              onClick={() => setShowDocsDropdown(!showDocsDropdown)}
                              className="flex items-center gap-2 text-xs text-white/50 hover:text-white/70 transition-colors w-full"
                            >
                              <FileText className="w-3 h-3" />
                              <span>Searching {foundDocs.length} documentation sections</span>
                              <span className={`ml-auto transform transition-transform ${showDocsDropdown ? 'rotate-180' : ''}`}>
                                <ChevronDown className="w-3 h-3" />
                              </span>
                            </button>
                            
                            {showDocsDropdown && (
                              <div className="mt-2 space-y-1 max-h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                                {foundDocs.map((doc, i) => (
                                  <div key={i} className="text-xs bg-white/[0.03] border border-white/[0.05] rounded px-2 py-1.5 flex items-start gap-2">
                                    <Book className="w-3 h-3 mt-0.5 text-orange-400 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                      <div className="text-orange-400 font-semibold">{doc.api}</div>
                                      <div className="text-white/60 truncate">{doc.title}</div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          <div className="border-t border-white/[0.08] p-6 backdrop-blur-xl bg-[#0a0a0a]/80">
            <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500 to-orange-600 rounded-2xl opacity-0 group-focus-within:opacity-20 blur transition-opacity"></div>
                <div className="relative flex gap-3 items-end bg-white/[0.05] rounded-2xl p-2 border border-white/[0.08] focus-within:border-white/20 focus-within:bg-white/[0.08] transition-all backdrop-blur-xl">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit(e);
                      }
                    }}
                    placeholder="Ask about any AC Lua API..."
                    disabled={loading || !docsLoaded}
                    rows={1}
                    className="flex-1 bg-transparent px-4 py-3 text-[15px] text-white placeholder-white/30 outline-none disabled:opacity-50 resize-none max-h-32 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
                    style={{ lineHeight: '1.5' }}
                  />
                  <button
                    type="submit"
                    disabled={loading || !input.trim() || !docsLoaded}
                    className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-600 text-white rounded-xl flex items-center justify-center hover:shadow-lg hover:shadow-red-500/50 disabled:from-white/10 disabled:to-white/10 disabled:shadow-none transition-all active:scale-95 flex-shrink-0 disabled:cursor-not-allowed group"
                  >
                    <Send className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </button>
                </div>
              </div>
              <div className="mt-3 text-xs text-white/30 text-center flex items-center justify-center gap-4">
                <span>
                  <kbd className="px-1.5 py-0.5 bg-white/[0.08] rounded">Enter</kbd> to send
                </span>
                <span>
                  <kbd className="px-1.5 py-0.5 bg-white/[0.08] rounded">Shift + Enter</kbd> for new line
                </span>
                <span className="text-white/20">•</span>
                <span>{input.length} characters</span>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Chat;