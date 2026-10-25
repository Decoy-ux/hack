import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { CitizenPortal } from './components/CitizenPortal';
import { GovernmentDashboard } from './components/GovernmentDashboard';
import { EmailModal } from './components/EmailModal';
import { VoiceAssistant } from './components/VoiceAssistant';
import { GovernmentTask, QueueRequest, EscalationEmailLog, Language } from './types';

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'citizen' | 'government'>('citizen');
  const [lang, setLang] = useState<Language>('ne');

  const [tasks, setTasks] = useState<GovernmentTask[]>([]);
  const [requests, setRequests] = useState<QueueRequest[]>([]);
  const [escalationLogs, setEscalationLogs] = useState<EscalationEmailLog[]>([]);
  const [simulatedMinutesOffset, setSimulatedMinutesOffset] = useState<number>(0);

  const [activeEmailModalLog, setActiveEmailModalLog] = useState<EscalationEmailLog | null>(null);

  // Fetch Government Tasks
  const fetchTasks = async () => {
    try {
      const res = await fetch('/api/tasks');
      const data = await res.json();
      if (data.success && data.tasks) {
        setTasks(data.tasks);
      }
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
    }
  };

  // Fetch Government FIFO Queue & Escalations
  const fetchQueue = useCallback(async () => {
    try {
      const res = await fetch('/api/queue/requests');
      const data = await res.json();
      if (data.success) {
        setRequests(data.requests || []);
        setSimulatedMinutesOffset(data.simulatedMinutesOffset || 0);
        setEscalationLogs(data.escalationLogs || []);
      }
    } catch (err) {
      console.error('Failed to fetch queue:', err);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
    fetchQueue();

    // Auto-refresh queue every 15 seconds
    const interval = setInterval(() => {
      fetchQueue();
    }, 15000);

    return () => clearInterval(interval);
  }, [fetchQueue]);

  // When citizen submits, switch to Government view to see the file in queue
  const handleSubmittedToQueue = (token: string) => {
    fetchQueue();
    setCurrentView('government');
  };

  // Simulate time offset (e.g. +15 mins, +30 mins, +60 mins)
  const handleSimulateTime = async (addMinutes: number) => {
    try {
      const res = await fetch('/api/queue/simulate-time', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ addMinutes }),
      });
      const data = await res.json();
      if (data.success) {
        fetchQueue();
      }
    } catch (err) {
      console.error('Failed to simulate time:', err);
    }
  };

  // Reset time offset
  const handleResetTime = async () => {
    try {
      await fetch('/api/queue/simulate-time', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reset: true }),
      });
      fetchQueue();
    } catch (err) {
      console.error('Failed to reset time:', err);
    }
  };

  // Handle request (Process / Complete)
  const handleRequestAction = async (requestId: string, action: 'PROCESS' | 'COMPLETE') => {
    try {
      await fetch('/api/queue/handle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, action }),
      });
      fetchQueue();
    } catch (err) {
      console.error('Failed to handle request:', err);
    }
  };

  // Escalate delayed request to Upper Authority via Email
  const handleEscalateEmail = async (requestId: string) => {
    try {
      const res = await fetch('/api/queue/escalate-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId,
          recipientEmail: 'linecompany2024@gmail.com',
        }),
      });
      const data = await res.json();
      if (data.success && data.log) {
        setActiveEmailModalLog(data.log);
        fetchQueue();
      }
    } catch (err) {
      console.error('Failed to escalate email:', err);
    }
  };

  // Reset Queue
  const handleResetQueue = async () => {
    try {
      await fetch('/api/queue/reset', { method: 'POST' });
      fetchQueue();
    } catch (err) {
      console.error('Failed to reset queue:', err);
    }
  };

  const delayedCount = requests.filter((r) => r.isDelayed && r.status !== 'COMPLETED').length;
  const pendingCount = requests.filter((r) => r.status !== 'COMPLETED').length;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Official Header */}
      <Header
        currentView={currentView}
        setCurrentView={setCurrentView}
        lang={lang}
        setLang={setLang}
        pendingCount={pendingCount}
        delayedCount={delayedCount}
      />

      {/* Main View Area */}
      <main className="flex-1 pb-16">
        {currentView === 'citizen' ? (
          <CitizenPortal
            tasks={tasks}
            lang={lang}
            onSubmittedToQueue={handleSubmittedToQueue}
          />
        ) : (
          <GovernmentDashboard
            requests={requests}
            simulatedMinutesOffset={simulatedMinutesOffset}
            escalationLogs={escalationLogs}
            lang={lang}
            onRefresh={fetchQueue}
            onSimulateTime={handleSimulateTime}
            onResetTime={handleResetTime}
            onHandleRequest={handleRequestAction}
            onEscalateEmail={handleEscalateEmail}
            onViewEmailLog={(log) => setActiveEmailModalLog(log)}
            onResetQueue={handleResetQueue}
          />
        )}
      </main>

      {/* Official Dispatched Escalation Email Modal */}
      <EmailModal
        isOpen={Boolean(activeEmailModalLog)}
        onClose={() => setActiveEmailModalLog(null)}
        log={activeEmailModalLog}
        lang={lang}
      />

      {/* AI Assistant Widget */}
      <VoiceAssistant lang={lang} />

      {/* Official Governmental Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-6 text-xs text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-200">
              {lang === 'ne' ? 'नेपाल सरकार | सुशासन तथा सार्वजनिक सेवा' : 'Government of Nepal | Public Governance'}
            </span>
            <span>•</span>
            <span>Good Governance Act 2064</span>
          </div>
          <div className="text-slate-400">
            Escalation Authority: <strong className="text-slate-200">Chief District Officer & Supervisory Registry</strong>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
