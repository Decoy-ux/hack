import React from 'react';
import { Mail, CheckCircle2, X, AlertTriangle, Send, FileText } from 'lucide-react';
import { Language, EscalationEmailLog } from '../types';

interface EmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  log: EscalationEmailLog | null;
  lang: Language;
}

export const EmailModal: React.FC<EmailModalProps> = ({ isOpen, onClose, log, lang }) => {
  if (!isOpen || !log) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden">
        {/* Header */}
        <div className="bg-red-800 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-red-900 flex items-center justify-center border border-red-700">
              <Mail className="w-5 h-5 text-red-200" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {lang === 'ne'
                  ? 'माथिल्लो निकायमा पठाइएको आधिकारिक इमेल पत्र'
                  : 'Official Escalation Notice Dispatched to Upper Authority'}
              </h3>
              <p className="text-xs text-red-200">
                {lang === 'ne'
                  ? 'समयसीमा (SLA) नाघेको कारण स्वचालित रूपमा सम्प्रेषित'
                  : 'Automatically transmitted due to statutory service delay'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-red-200 hover:text-white p-1 rounded-md hover:bg-red-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Details Metadata */}
        <div className="bg-slate-50 px-6 py-3.5 border-b border-slate-200 grid grid-cols-2 gap-4 text-xs text-slate-700">
          <div>
            <span className="text-slate-500 block font-medium">
              {lang === 'ne' ? 'प्रापक (To / Upper Authority):' : 'Recipient (To):'}
            </span>
            <span className="font-semibold text-slate-900 text-sm">{log.recipientEmail}</span>
            <span className="text-[11px] text-slate-500 block">Chief District Officer & Ministry Vigilance</span>
          </div>

          <div>
            <span className="text-slate-500 block font-medium">
              {lang === 'ne' ? 'प्रेषण समय (Dispatched At):' : 'Dispatched At:'}
            </span>
            <span className="font-semibold text-slate-900">
              {new Date(log.sentAt).toLocaleString(lang === 'ne' ? 'ne-NP' : 'en-US')}
            </span>
            <span className="text-[11px] text-emerald-700 font-semibold block flex items-center mt-0.5">
              <CheckCircle2 className="w-3 h-3 mr-1 inline" />
              {lang === 'ne' ? 'सफलतापूर्वक प्रेषित' : 'Delivered to Upper Authority'}
            </span>
          </div>

          <div>
            <span className="text-slate-500 block font-medium">
              {lang === 'ne' ? 'टोकन तथा सेवाग्राही:' : 'Token & Citizen:'}
            </span>
            <span className="font-semibold text-slate-900">
              {log.tokenNumber} • {log.citizenName}
            </span>
          </div>

          <div>
            <span className="text-slate-500 block font-medium">
              {lang === 'ne' ? 'ढिलाइ स्थिति (Delay Duration):' : 'Delay Duration:'}
            </span>
            <span className="font-bold text-red-700">
              +{log.delayedMinutes} {lang === 'ne' ? 'मिनेट ढिलाइ (SLA सीमा:' : 'mins overdue (SLA:'}{' '}
              {log.slaMinutes}m)
            </span>
          </div>
        </div>

        {/* Email Content Body */}
        <div className="p-6 max-h-[380px] overflow-y-auto">
          <div className="mb-3">
            <span className="text-xs font-semibold text-slate-500 block mb-1">
              {lang === 'ne' ? 'विषय (Subject):' : 'Subject:'}
            </span>
            <p className="font-bold text-slate-900 text-sm bg-slate-100 p-2 rounded border border-slate-200">
              {log.subject}
            </p>
          </div>

          <div>
            <span className="text-xs font-semibold text-slate-500 block mb-1">
              {lang === 'ne' ? 'पत्रको आधिकारिक पाठ (Official Memo Body):' : 'Official Memo Body:'}
            </span>
            <pre className="font-mono text-xs text-slate-800 bg-slate-50 p-4 rounded-lg border border-slate-200 whitespace-pre-wrap leading-relaxed select-text">
              {log.emailBody}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-100 px-6 py-3 border-t border-slate-200 flex justify-between items-center text-xs">
          <span className="text-slate-600 flex items-center">
            <FileText className="w-4 h-4 text-slate-500 mr-1.5" />
            {lang === 'ne'
              ? 'सुशासन ऐन २०६४ बमोजिम अभिलेख सुरक्षित गरिएको छ।'
              : 'Logged pursuant to Good Governance Act 2064.'}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-medium rounded-md transition text-xs"
          >
            {lang === 'ne' ? 'बन्द गर्नुहोस्' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
