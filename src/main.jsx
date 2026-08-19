import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Activity, Bell, Bot, Check, ChevronRight, CircleUserRound, Github,
  Mail, Menu, MessageCircle, Mic, MicOff, MonitorCog, Send, Settings2,
  ShieldCheck, Sparkles, X,
} from 'lucide-react';
import './styles.css';

const suggestions = [
  { icon: Mail, title: 'Draft an email', text: 'Write a follow-up to the design team' },
  { icon: MessageCircle, title: 'Send a message', text: 'Tell Arjun I will be there in 10 minutes' },
  { icon: Github, title: 'Build a project', text: 'Create a GitHub project for my new idea' },
  { icon: MonitorCog, title: 'System briefing', text: 'Tell me everything about this computer' },
];

const logs = [
  ['08:42', 'Morning briefing prepared', 'Business'],
  ['08:16', 'Inbox scanned · 3 priority messages', 'Email'],
  ['Yesterday', 'Repository backup completed', 'GitHub'],
];

function App() {
  const [listening, setListening] = useState(false);
  const [command, setCommand] = useState('');
  const [response, setResponse] = useState('All systems are standing by. What can I do for you?');
  const [menu, setMenu] = useState(false);
  const recognition = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    recognition.current = new SpeechRecognition();
    recognition.current.continuous = false;
    recognition.current.interimResults = true;
    recognition.current.onresult = (event) => {
      const words = Array.from(event.results).map((result) => result[0].transcript).join('');
      setCommand(words);
      if (event.results[event.results.length - 1].isFinal) runCommand(words);
    };
    recognition.current.onend = () => setListening(false);
  }, []);

  function toggleListening() {
    if (!recognition.current) {
      setResponse('Voice recognition is not available in this browser. You can type below instead.');
      return;
    }
    if (listening) recognition.current.stop();
    else {
      setListening(true);
      setResponse('Listening…');
      recognition.current.start();
    }
  }

  function runCommand(value = command) {
    const prompt = value.trim();
    if (!prompt) return;
    setCommand('');
    const lower = prompt.toLowerCase();
    if (lower.includes('email')) setResponse(`Email workflow ready for approval: “${prompt}”. Connect Gmail in Settings to send it.`);
    else if (lower.includes('whatsapp') || lower.includes('message')) setResponse(`Message prepared: “${prompt}”. I’ll always ask before sending.`);
    else if (lower.includes('github') || lower.includes('project')) setResponse('Project workspace initialized. Connect GitHub to let me create the repository, issues, and first milestone.');
    else if (lower.includes('system') || lower.includes('computer')) setResponse('System scan requested. The desktop companion must be installed before I can securely read local diagnostics.');
    else setResponse(`Understood: “${prompt}”. Connect an AI provider in Settings to turn this demo into a live assistant.`);
  }

  return (
    <main className="app-shell">
      <div className="noise" />
      <header>
        <button className="icon-button mobile-menu" onClick={() => setMenu(!menu)} aria-label="Open menu"><Menu /></button>
        <a className="brand" href="#top" aria-label="JARVIS home">
          <span className="brand-mark"><span /></span>
          <span><strong>JARVIS</strong><small>BY PRATHAM</small></span>
        </a>
        <nav className={menu ? 'open' : ''}>
          <button className="nav-close" onClick={() => setMenu(false)} aria-label="Close menu"><X /></button>
          <a className="active" href="#assistant">Assistant</a>
          <a href="#activity">Activity</a>
          <a href="#capabilities">Capabilities</a>
        </nav>
        <div className="header-actions">
          <div className="status"><i /> SYSTEM ONLINE</div>
          <button className="icon-button" aria-label="Notifications"><Bell /></button>
          <button className="profile" aria-label="Profile"><CircleUserRound /><span>PRATHAM</span></button>
        </div>
      </header>

      <section className="hero" id="assistant">
        <div className="eyebrow"><Sparkles /> PERSONAL INTELLIGENCE SYSTEM</div>
        <h1>Good morning, <em>Pratham.</em></h1>
        <p className="intro">Your digital world is in order. I’m ready when you are.</p>

        <div className={`core-wrap ${listening ? 'listening' : ''}`}>
          <div className="orbit orbit-three"><i /><i /><i /></div>
          <div className="orbit orbit-two" />
          <div className="orbit orbit-one" />
          <button className="core" onClick={toggleListening} aria-label={listening ? 'Stop listening' : 'Start listening'}>
            <span className="core-grid" />
            <span className="core-light" />
            <span className="core-center"><Bot /></span>
          </button>
          <span className="scanline" />
        </div>

        <div className="listen-label"><i /> {listening ? 'LISTENING' : 'AWAITING COMMAND'}</div>
        <p className="response">“{response}”</p>

        <div className="command-box">
          <button className={`mic ${listening ? 'on' : ''}`} onClick={toggleListening} aria-label="Use voice">
            {listening ? <MicOff /> : <Mic />}
          </button>
          <input
            value={command}
            onChange={(event) => setCommand(event.target.value)}
            onKeyDown={(event) => event.key === 'Enter' && runCommand()}
            placeholder="Ask JARVIS anything…"
            aria-label="Command"
          />
          <span className="shortcut">↵</span>
          <button className="send" onClick={() => runCommand()} aria-label="Send command"><Send /></button>
        </div>
      </section>

      <section className="suggestions" id="capabilities">
        <div className="section-heading"><span>QUICK COMMANDS</span><small>VOICE OR TEXT</small></div>
        <div className="suggestion-grid">
          {suggestions.map(({ icon: Icon, title, text }) => (
            <button key={title} onClick={() => { setCommand(text); runCommand(text); }}>
              <span className="suggestion-icon"><Icon /></span>
              <span><strong>{title}</strong><small>{text}</small></span>
              <ChevronRight className="arrow" />
            </button>
          ))}
        </div>
      </section>

      <section className="dashboard" id="activity">
        <div className="panel activity-panel">
          <div className="panel-title"><span><Activity /> RECENT ACTIVITY</span><button>VIEW ALL</button></div>
          <div className="activity-list">
            {logs.map(([time, item, tag]) => <div className="activity-item" key={item}><Check /><time>{time}</time><strong>{item}</strong><span>{tag}</span></div>)}
          </div>
        </div>
        <div className="panel health-panel">
          <div className="panel-title"><span><ShieldCheck /> SYSTEM HEALTH</span><Settings2 /></div>
          <div className="health-row"><span>CORE SERVICES</span><strong><i /> OPERATIONAL</strong></div>
          <div className="metrics"><div><small>CPU</small><strong>18%</strong><i><b style={{width:'18%'}} /></i></div><div><small>MEMORY</small><strong>42%</strong><i><b style={{width:'42%'}} /></i></div><div><small>UPTIME</small><strong>12h 38m</strong></div></div>
        </div>
      </section>

      <footer><span><i /> ENCRYPTED CONNECTION</span><p>JARVIS v1.0 · DESIGNED FOR PRATHAM</p><span>LOCAL TIME · 08:42:16</span></footer>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);
