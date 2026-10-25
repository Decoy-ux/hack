import React, { useState } from 'react';
import {
  ShieldAlert,
  Clock,
  Mail,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  FastForward,
  Send,
  FileText,
  User,
  Building,
  ArrowUpRight,
  RefreshCw,
  Search,
} from 'lucide-react';
import { QueueRequest, EscalationEmailLog, Language } from '../types';

interface GovernmentDashboardProps {
  requests: QueueRequest[];
  simulatedMinutesOffset: number;
  escalationLogs: EscalationEmailLog[];
  lang: Language;
  onRefresh: () => void;
  onSimulateTime: (addMinutes: number) => void;
  onResetTime: () => void;
  onHandleRequest: (requestId: string, action: 'PROCESS' | 'COMPLETE') => void;
  onEscalateEmail: (requestId: string) => void;
  onViewEmailLog: (log: EscalationEmailLog) => void;
  onResetQueue: () => void;
}

export const GovernmentDashboard: React.FC<GovernmentDashboardProps> = ({
  requests,
  simulatedMinutesOffset,
  escalationLogs,
  lang,
  onRefresh,
  onSimulateTime,
  onResetTime,
  onHandleRequest,
  onEscalateEmail,
  onViewEmailLog,
  onResetQueue,
}) => {
  const [activeTab, setActiveTab] = useState<'queue' | 'logs'>('queue');
  const [searchQuery, setSearchQuery] = useState('');

  // The request that came first and is waiting to be handled
  const nextToHandle = requests.find((r) => r.isNextToHandle);

  // Filter requests
  const filteredRequests = requests.filter((r) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.tokenNumber.toLowerCase().includes(q) ||
      r.citizenName.toLowerCase().includes(q) ||
      r.taskTitleNepali.toLowerCase().includes(q) ||
      r.taskTitleEnglish.toLowerCase().includes(q)
    );
  });

  const delayedCount = requests.filter((r) => r.isDelayed && r.status !== 'COMPLETED').length;
  const pendingCount = requests.filter((r) => r.status !== 'COMPLETED').length;
  const completedCount = requests.filter((r) => r.status === 'COMPLETED').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Top Banner & Time Simulation Controls */}
      <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-md border border-slate-800 mb-6 flex flex-wrap justify-between items-center gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-red-400">
              {lang === 'ne' ? 'आधिकारिक सरकारी क्यु अनुगमन प्रणाली' : 'Official FIFO Queue & SLA Monitor'}
            </span>
          </div>
          <h2 className="text-xl font-black mt-1">
            {lang === 'ne'
              ? 'सार्वजनिक सेवा अनुगमन: कुन निवेदन पहिले आयो र कुन सम्हाल्ने?'
              : 'Public Governance Monitor: Which came first & Which to handle'}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {lang === 'ne'
              ? 'समय नाघेमा माथिल्लो निकाय (linecompany2024@gmail.com) मा स्वचालित इमेल सम्प्रेषण'
              : 'Exceeding SLA automatically dispatches escalation email to Upper Authority'}
          </p>
        </div>

        {/* Time Simulator Toolbar */}
        <div className="bg-slate-800/90 px-4 py-2.5 rounded-xl border border-slate-700 flex flex-wrap items-center gap-2">
          <div className="flex items-center space-x-1.5 text-xs text-slate-300 mr-1">
            <Clock className="w-4 h-4 text-amber-400" />
            <span className="font-semibold">{lang === 'ne' ? 'समय परीक्षण:' : 'Time Simulator:'}</span>
            <span className="px-1.5 py-0.5 bg-slate-900 rounded font-mono text-amber-300 font-bold">
              +{simulatedMinutesOffset}m
            </span>
          </div>

          <button
            onClick={() => onSimulateTime(15)}
            className="px-2.5 py-1 text-xs font-semibold bg-slate-700 hover:bg-slate-600 text-white rounded transition flex items-center"
            title="Fast forward 15 minutes"
          >
            <FastForward className="w-3.5 h-3.5 mr-1 text-amber-400" />
            +15m
          </button>

          <button
            onClick={() => onSimulateTime(30)}
            className="px-2.5 py-1 text-xs font-semibold bg-slate-700 hover:bg-slate-600 text-white rounded transition flex items-center"
            title="Fast forward 30 minutes"
          >
            <FastForward className="w-3.5 h-3.5 mr-1 text-amber-400" />
            +30m
          </button>

          <button
            onClick={() => onSimulateTime(60)}
            className="px-2.5 py-1 text-xs font-semibold bg-slate-700 hover:bg-slate-600 text-white rounded transition flex items-center"
            title="Fast forward 60 minutes"
          >
            <FastForward className="w-3.5 h-3.5 mr-1 text-amber-400" />
            +1h
          </button>

          <button
            onClick={onResetTime}
            className="px-2 py-1 text-xs text-slate-400 hover:text-white rounded hover:bg-slate-700 transition"
            title="Reset simulated time offset"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onRefresh}
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-700 transition ml-1"
            title="Refresh queue"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold block">
            {lang === 'ne' ? 'कुल दर्ता निवेदनहरू:' : 'Total Registered:'}
          </span>
          <span className="text-2xl font-black text-slate-900 mt-1 block">{requests.length}</span>
          <span className="text-[11px] text-slate-500">FIFO Queue</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold block">
            {lang === 'ne' ? 'प्रतीक्षारत पालो (Pending):' : 'Awaiting Service:'}
          </span>
          <span className="text-2xl font-black text-blue-700 mt-1 block">{pendingCount}</span>
          <span className="text-[11px] text-slate-500">
            {nextToHandle ? `Next: #${nextToHandle.tokenNumber}` : 'All Cleared'}
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-red-200 shadow-xs bg-red-50/40">
          <span className="text-xs text-red-700 font-bold block flex items-center">
            <AlertTriangle className="w-3.5 h-3.5 mr-1 text-red-600" />
            {lang === 'ne' ? 'समयसीमा नाघेको (SLA Delayed):' : 'SLA Delayed Overdue:'}
          </span>
          <span className="text-2xl font-black text-red-700 mt-1 block">{delayedCount}</span>
          <span className="text-[11px] text-red-600 font-medium">
            {lang === 'ne' ? 'माथिल्लो निकायमा इमेल अलर्ट' : 'Escalated to Upper Authority'}
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold block">
            {lang === 'ne' ? 'सम्पन्न सेवा (Completed):' : 'Completed Requests:'}
          </span>
          <span className="text-2xl font-black text-emerald-700 mt-1 block">{completedCount}</span>
          <span className="text-[11px] text-slate-500">Archived</span>
        </div>
      </div>

      {/* HERO CARD: "WHICH ONE TO HANDLE NEXT" (कुन फाइल पहिले सम्हाल्ने) */}
      {nextToHandle && (
        <div className="bg-gradient-to-r from-red-800 to-slate-900 text-white rounded-2xl p-6 shadow-lg mb-8 border-2 border-red-600">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-start space-x-4">
              <div className="w-14 h-14 rounded-2xl bg-white text-red-800 flex flex-col items-center justify-center font-black shadow-md border-2 border-red-200 shrink-0">
                <span className="text-[10px] uppercase font-bold text-slate-500 leading-none">पालो</span>
                <span className="text-xl font-mono leading-tight">#1</span>
              </div>

              <div>
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-red-600 text-white text-[11px] font-bold uppercase tracking-wider">
                    {lang === 'ne' ? 'अहिले सम्हाल्नुपर्ने फाइल (NEXT TO HANDLE)' : 'NEXT TO HANDLE'}
                  </span>
                  <span className="text-xs text-red-200 font-mono">
                    Token: {nextToHandle.tokenNumber}
                  </span>
                </div>

                <h3 className="text-xl font-bold mt-1 text-white">
                  {nextToHandle.citizenName}
                </h3>

                <p className="text-xs text-slate-300 mt-0.5">
                  {lang === 'ne' ? nextToHandle.taskTitleNepali : nextToHandle.taskTitleEnglish} •{' '}
                  <span className="text-red-200 font-semibold">
                    {lang === 'ne' ? nextToHandle.deskNameNepali : nextToHandle.deskNameEnglish}
                  </span>
                </p>

                <div className="flex items-center space-x-4 mt-3 text-xs">
                  <div className="flex items-center space-x-1 text-slate-200">
                    <Clock className="w-3.5 h-3.5 text-amber-300" />
                    <span>
                      {lang === 'ne' ? 'व्यतित समय:' : 'Elapsed:'}{' '}
                      <strong className="text-white font-mono">{nextToHandle.elapsedMinutes}m</strong>{' '}
                      / {nextToHandle.slaMinutes}m SLA
                    </span>
                  </div>

                  {nextToHandle.isDelayed ? (
                    <span className="px-2 py-0.5 rounded bg-red-500 text-white font-bold text-[11px] flex items-center animate-pulse">
                      <AlertTriangle className="w-3 h-3 mr-1 inline" />
                      +{nextToHandle.delayedByMinutes}m {lang === 'ne' ? 'ढिलाइ!' : 'Overdue!'}
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded bg-emerald-700 text-emerald-100 font-medium text-[11px]">
                      {lang === 'ne' ? 'समय भित्र' : 'Within SLA'}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons for Next to Handle */}
            <div className="flex items-center space-x-2">
              {nextToHandle.status === 'PENDING_FIRST' ? (
                <button
                  onClick={() => onHandleRequest(nextToHandle.id, 'PROCESS')}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center space-x-2"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>{lang === 'ne' ? 'काम सुरु गर्नुहोस्' : 'Start Handling'}</span>
                </button>
              ) : (
                <button
                  onClick={() => onHandleRequest(nextToHandle.id, 'COMPLETE')}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center space-x-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{lang === 'ne' ? 'सम्पन्न भयो (Mark Complete)' : 'Mark Completed'}</span>
                </button>
              )}

              {nextToHandle.isDelayed && (
                <button
                  onClick={() => onEscalateEmail(nextToHandle.id)}
                  className="px-4 py-2.5 bg-red-950 hover:bg-black text-white font-bold text-xs rounded-xl border border-red-700 transition flex items-center space-x-1.5"
                  title="Send Escalation Email to Upper Authority"
                >
                  <Mail className="w-4 h-4 text-red-400" />
                  <span>
                    {nextToHandle.escalationNoticeSent
                      ? lang === 'ne'
                        ? 'इमेल गइसकेको'
                        : 'Notice Sent'
                      : lang === 'ne'
                      ? 'माथिल्लो निकायमा इमेल'
                      : 'Email Upper Authority'}
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tabs Switcher: FIFO Queue vs Escalation Audit Logs */}
      <div className="flex justify-between items-center mb-4 border-b border-slate-200 pb-3 flex-wrap gap-2">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab('queue')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition ${
              activeTab === 'queue'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {lang === 'ne'
              ? `दर्ता क्रमबद्ध क्यु (FIFO Queue - ${requests.length})`
              : `FIFO Arrival Queue (${requests.length})`}
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition flex items-center space-x-1.5 ${
              activeTab === 'logs'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Mail className="w-3.5 h-3.5 text-red-600" />
            <span>
              {lang === 'ne'
                ? `माथिल्लो निकायमा सम्प्रेषित इमेल (${escalationLogs.length})`
                : `Upper Authority Dispatched Emails (${escalationLogs.length})`}
            </span>
          </button>
        </div>

        {/* Search bar & Reset Queue */}
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={lang === 'ne' ? 'टोकन वा नाम खोज्नुहोस्...' : 'Search token or citizen...'}
              className="pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:border-red-600 w-44 sm:w-56"
            />
          </div>

          <button
            onClick={onResetQueue}
            className="px-3 py-1.5 border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg transition"
            title="Reset queue to default initial records"
          >
            {lang === 'ne' ? 'क्यु रिसेट' : 'Reset Queue'}
          </button>
        </div>
      </div>

      {/* TAB 1: FIFO QUEUE TABLE */}
      {activeTab === 'queue' && (
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-700 border-b border-slate-200 uppercase text-[11px] font-bold tracking-wider">
                  <th className="py-3 px-4">{lang === 'ne' ? 'दर्ता क्रम (FIFO)' : 'Order / Priority'}</th>
                  <th className="py-3 px-4">{lang === 'ne' ? 'टोकन नं' : 'Token'}</th>
                  <th className="py-3 px-4">{lang === 'ne' ? 'नागरिकको नाम' : 'Citizen'}</th>
                  <th className="py-3 px-4">{lang === 'ne' ? 'सेवा तथा फाँट' : 'Task & Desk'}</th>
                  <th className="py-3 px-4">{lang === 'ne' ? 'कागजात रुजु' : 'Document'}</th>
                  <th className="py-3 px-4">{lang === 'ne' ? 'दर्ता समय' : 'Submitted At'}</th>
                  <th className="py-3 px-4">{lang === 'ne' ? 'SLA / व्यतित' : 'SLA / Elapsed'}</th>
                  <th className="py-3 px-4">{lang === 'ne' ? 'स्थिति' : 'Status'}</th>
                  <th className="py-3 px-4 text-right">{lang === 'ne' ? 'कारबाही' : 'Action'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredRequests.map((req) => {
                  const isCompleted = req.status === 'COMPLETED';
                  const isFirst = req.isNextToHandle;
                  return (
                    <tr
                      key={req.id}
                      className={`hover:bg-slate-50 transition ${
                        isFirst
                          ? 'bg-amber-50/50 font-medium'
                          : req.isDelayed && !isCompleted
                          ? 'bg-red-50/40'
                          : isCompleted
                          ? 'opacity-60 bg-slate-50/30'
                          : ''
                      }`}
                    >
                      {/* Queue Position */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {isCompleted ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-600">
                            ✓ {lang === 'ne' ? 'सम्पन्न' : 'Done'}
                          </span>
                        ) : isFirst ? (
                          <span className="px-2.5 py-1 rounded-full text-xs font-black bg-red-700 text-white animate-pulse">
                            #1 {lang === 'ne' ? 'पहिले' : 'Next'}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                            #{req.queuePosition}
                          </span>
                        )}
                      </td>

                      {/* Token */}
                      <td className="py-3 px-4 whitespace-nowrap font-mono font-bold text-slate-900">
                        {req.tokenNumber}
                      </td>

                      {/* Citizen */}
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900 block">{req.citizenName}</span>
                      </td>

                      {/* Task & Desk */}
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-800 block">
                          {lang === 'ne' ? req.taskTitleNepali : req.taskTitleEnglish}
                        </span>
                        <span className="text-[11px] text-slate-500 block">
                          {lang === 'ne' ? req.deskNameNepali : req.deskNameEnglish}
                        </span>
                      </td>

                      {/* Document */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                            req.documentSummary.isNagarikta
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-amber-100 text-amber-800 border border-amber-300'
                          }`}
                        >
                          {req.documentSummary.isNagarikta ? '🇳🇵 Nagarikta' : req.documentSummary.documentType}
                        </span>
                      </td>

                      {/* Submitted At */}
                      <td className="py-3 px-4 whitespace-nowrap text-slate-600">
                        {new Date(req.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>

                      {/* SLA / Elapsed */}
                      <td className="py-3 px-4 whitespace-nowrap font-mono">
                        <span className="font-bold text-slate-900">{req.elapsedMinutes}m</span>
                        <span className="text-slate-400"> / {req.slaMinutes}m</span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {isCompleted ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            {lang === 'ne' ? 'सम्पन्न' : 'COMPLETED'}
                          </span>
                        ) : req.isDelayed ? (
                          <div className="flex flex-col items-start gap-1">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-600 text-white flex items-center animate-pulse">
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              {lang === 'ne' ? 'समय नाघेको' : 'DELAYED'} (+{req.delayedByMinutes}m)
                            </span>
                            {req.escalationNoticeSent && (
                              <span className="text-[10px] text-red-700 font-semibold flex items-center">
                                <Mail className="w-3 h-3 mr-1" />
                                {lang === 'ne' ? 'माथिल्लो निकायमा इमेल प्रेषित' : 'Email Sent to Upper Auth'}
                              </span>
                            )}
                          </div>
                        ) : req.status === 'IN_PROCESSING' ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-800">
                            {lang === 'ne' ? 'सम्हालिँदै' : 'PROCESSING'}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                            {lang === 'ne' ? 'प्रतीक्षारत' : 'WAITING'}
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          {!isCompleted && (
                            <>
                              {req.status === 'PENDING_FIRST' ? (
                                <button
                                  onClick={() => onHandleRequest(req.id, 'PROCESS')}
                                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-900 text-white rounded font-bold text-[11px] transition"
                                >
                                  {lang === 'ne' ? 'सुरु' : 'Process'}
                                </button>
                              ) : (
                                <button
                                  onClick={() => onHandleRequest(req.id, 'COMPLETE')}
                                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold text-[11px] transition"
                                >
                                  {lang === 'ne' ? 'सम्पन्न' : 'Complete'}
                                </button>
                              )}
                            </>
                          )}

                          {req.isDelayed && (
                            <button
                              onClick={() => onEscalateEmail(req.id)}
                              className="px-2 py-1 bg-red-100 hover:bg-red-200 text-red-800 rounded font-bold text-[11px] border border-red-300 transition flex items-center"
                              title="Dispatch escalation email to linecompany2024@gmail.com"
                            >
                              <Mail className="w-3 h-3 mr-1" />
                              {req.escalationNoticeSent
                                ? lang === 'ne'
                                  ? 'पुनः इमेल'
                                  : 'Resend'
                                : lang === 'ne'
                                ? 'इमेल'
                                : 'Escalate'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: UPPER AUTHORITY DISPATCHED EMAILS LOG */}
      {activeTab === 'logs' && (
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-5">
          <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {lang === 'ne'
                  ? 'माथिल्लो निकायमा सम्प्रेषित आधिकारिक इमेल अभिलेख'
                  : 'Official Escalation Email Logs (Dispatched to Upper Authority)'}
              </h3>
              <p className="text-xs text-slate-500">
                Target Recipient: <strong className="text-slate-900">Chief District Officer & Supervisory Registry</strong>
              </p>
            </div>
            <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-bold">
              {escalationLogs.length} {lang === 'ne' ? 'पत्र सम्प्रेषित' : 'Dispatches Logged'}
            </span>
          </div>

          {escalationLogs.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              {lang === 'ne'
                ? 'हालसम्म कुनै इमेल पठाइएको छैन। समयसीमा नाघेपछि यहाँ अभिलेख देखिनेछ।'
                : 'No escalation emails dispatched yet. Overdue alerts will appear here.'}
            </div>
          ) : (
            <div className="space-y-3">
              {escalationLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-4 rounded-xl border border-slate-200 hover:border-red-300 bg-slate-50/50 hover:bg-white transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-red-100 text-red-700 flex items-center justify-center shrink-0 border border-red-200">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-slate-900 bg-slate-200 px-1.5 py-0.5 rounded text-[11px]">
                          {log.tokenNumber}
                        </span>
                        <span className="font-bold text-slate-900">{log.citizenName}</span>
                        <span className="text-red-700 font-bold">
                          +{log.delayedMinutes}m {lang === 'ne' ? 'ढिलाइ' : 'Overdue'}
                        </span>
                      </div>
                      <p className="font-medium text-slate-700 mt-1">{log.subject}</p>
                      <span className="text-[11px] text-slate-500 mt-0.5 block">
                        To: {log.recipientEmail} • Dispatched:{' '}
                        {new Date(log.sentAt).toLocaleString(lang === 'ne' ? 'ne-NP' : 'en-US')}
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center space-x-2">
                    <button
                      onClick={() => onViewEmailLog(log)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-medium rounded-lg text-xs transition flex items-center space-x-1"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>{lang === 'ne' ? 'आधिकारिक पत्र हेर्नुहोस्' : 'View Official Notice'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
