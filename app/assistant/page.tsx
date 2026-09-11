'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Search, User, Database, BookOpen, Monitor, Cpu, School } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import HeroBanner from '@/components/HeroBanner';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// ── Education-sector suggested queries ───────────────────────
const SUGGESTED_GROUPS = [
  {
    label: 'ICT & Digital',
    icon: Monitor,
    color: 'text-blue-400',
    queries: [
      'Which districts have the lowest ICT adoption in schools?',
      'What is the national ICT adoption rate in Rwanda schools?',
      'Where should smart classroom rollout be prioritised?',
      'How has ICT adoption in schools changed from 2017 to 2021/22?',
    ],
  },
  {
    label: 'Textbooks & Resources',
    icon: BookOpen,
    color: 'text-amber-400',
    queries: [
      'Which subjects have the worst textbook shortage at primary level?',
      'What is the current textbook ratio for primary schools?',
      'Which districts need most textbook procurement support?',
      'What is the secondary school textbook ratio per student?',
    ],
  },
  {
    label: 'Infrastructure & Access',
    icon: School,
    color: 'text-purple-400',
    queries: [
      'Which districts have the lowest school density?',
      'How many schools are there in Rwanda by education level?',
      'Which provinces have the largest education infrastructure gaps?',
      'What are NST2 targets for education in Rwanda?',
    ],
  },
  {
    label: 'Priority & Gaps',
    icon: Cpu,
    color: 'text-red-400',
    queries: [
      'Which districts are critical priority for education intervention?',
      'What are the top education gap drivers in Southern Province?',
      'Compare education gaps between Eastern and Western provinces',
      'Which districts need immediate education investment?',
    ],
  },
];

const WELCOME = `## Rwanda Education Data Query Tool

This tool searches across NISR Education statistical databases to support evidence-based planning.

**Available datasets (NISR PxWeb API):**
- **ICT_use.px** — ICT use in teaching and learning (2017–2021/22)
- **smart.px** — Smart classrooms in schools (2020/21–2021/22)
- **Primary.px** — Primary school textbook ratios by subject (2018–2021/22)
- **lower_secondary.px** — Secondary textbook ratios (2018–2021/22)
- **Edu_numb_scho.px** — School counts by education level (2017–2021)
- **EICV5 / LFS 2024 / RPHC4** — District poverty, NEET, population proxies

Select a suggested query or type your question below.`;

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: WELCOME, timestamp: new Date() },
  ]);
  const [input, setInput]         = useState('');
  const [loading, setLoading]     = useState(false);
  const [activeGroup, setActiveGroup] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { role: 'user', content: text, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const history = messages
        .filter(m => m.content !== WELCOME)
        .map(m => ({ role: m.role, content: m.content }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history }),
      });
      const data = await res.json();
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: data.response, timestamp: new Date() },
      ]);
    } catch {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'Unable to retrieve data. Please try again.', timestamp: new Date() },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (d: Date) =>
    d.toLocaleTimeString('en-RW', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 flex flex-col gap-5" style={{ minHeight: 'calc(100vh - 4rem)' }}>

      {/* Hero */}
      <HeroBanner
        badge="Education Sector · NISR Databases · ICT · Textbooks · Infrastructure"
        title={<>Education <span className="text-blue-400">Data Query</span></>}
        subtitle="Query NISR Education statistical data — ICT adoption, smart classrooms, textbook ratios, school infrastructure, and district-level education gap analysis."
      >
        <div className="flex items-center gap-1.5 text-xs text-gray-600 font-mono">
          <Database size={11} />
          ICT_use.px · smart.px · Primary.px · Edu_numb_scho.px · EICV5 · LFS 2024
        </div>
      </HeroBanner>

      {/* Suggested query groups */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden flex-shrink-0">
        {/* Group tabs */}
        <div className="flex border-b border-gray-800 overflow-x-auto">
          {SUGGESTED_GROUPS.map((g, i) => {
            const Icon = g.icon;
            return (
              <button
                key={g.label}
                onClick={() => setActiveGroup(i)}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium whitespace-nowrap transition-colors border-b-2 ${
                  activeGroup === i
                    ? `border-blue-600 ${g.color}`
                    : 'border-transparent text-gray-500 hover:text-gray-300'
                }`}
              >
                <Icon size={12} />
                {g.label}
              </button>
            );
          })}
        </div>
        {/* Queries */}
        <div className="p-3 grid sm:grid-cols-2 gap-2">
          {SUGGESTED_GROUPS[activeGroup].queries.map(q => (
            <button
              key={q}
              onClick={() => sendMessage(q)}
              disabled={loading}
              className="text-left text-xs text-gray-400 bg-gray-800/50 hover:bg-gray-800 border border-gray-800/60 hover:border-gray-700 hover:text-white rounded-lg px-3 py-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed leading-relaxed"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1" style={{ minHeight: 200 }}>
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            {/* Avatar */}
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
              msg.role === 'assistant'
                ? 'bg-gray-800 border border-gray-700 text-blue-400'
                : 'bg-blue-600 text-white'
            }`}>
              {msg.role === 'assistant' ? 'R' : <User size={14} />}
            </div>

            {/* Bubble */}
            <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
              msg.role === 'assistant'
                ? 'bg-gray-900 border border-gray-800 text-gray-200'
                : 'bg-blue-600 text-white'
            }`}>
              {msg.role === 'assistant' ? (
                <div className="prose prose-invert prose-sm max-w-none">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              ) : (
                <p>{msg.content}</p>
              )}
              <p className={`text-xs mt-2 ${
                msg.role === 'assistant' ? 'text-gray-700' : 'text-blue-300'
              }`}>
                {formatTime(msg.timestamp)}
                {msg.role === 'assistant' && (
                  <span className="ml-2 text-gray-800 font-mono">· NISR Education data</span>
                )}
              </p>
            </div>
          </div>
        ))}

        {/* Loading */}
        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center text-xs font-bold text-blue-400 flex-shrink-0">
              R
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-2xl px-4 py-3 flex items-center gap-2">
              <span className="text-gray-500 text-xs font-mono">Querying NISR education data</span>
              {[0, 1, 2].map(i => (
                <div
                  key={i}
                  className="w-1.5 h-1.5 bg-gray-600 rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex gap-3 flex-shrink-0">
        <div className="flex-1 relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage(input)}
            placeholder="Ask about ICT adoption, smart classrooms, textbook ratios, school gaps…"
            disabled={loading}
            className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl pl-9 pr-4 py-3 text-sm focus:outline-none focus:border-blue-600 placeholder-gray-700 disabled:opacity-60 transition-colors"
          />
        </div>
        <button
          onClick={() => sendMessage(input)}
          disabled={!input.trim() || loading}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-800 disabled:text-gray-700 disabled:cursor-not-allowed text-white rounded-xl px-4 py-3 transition-colors flex items-center gap-2 text-sm font-medium"
        >
          <Send size={14} />
          <span className="hidden sm:inline">Query</span>
        </button>
      </div>

      {/* Footer */}
      <p className="text-center text-gray-800 text-xs font-mono flex-shrink-0">
        NISR ICT_use.px · smart.px · Primary.px · lower_secondary.px · Edu_numb_scho.px · EICV5 · LFS 2024
      </p>
    </div>
  );
}
