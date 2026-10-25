import React, { useState, useEffect } from 'react';
import {
  FileCheck2,
  Upload,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  ArrowRight,
  ArrowLeft,
  Building,
  CreditCard,
  UserCheck,
  Send,
  Sparkles,
  Info,
  QrCode,
  FileText,
} from 'lucide-react';
import { GovernmentTask, OCRDetectResult, Language } from '../types';

interface CitizenPortalProps {
  tasks: GovernmentTask[];
  lang: Language;
  onSubmittedToQueue: (token: string) => void;
}

export const CitizenPortal: React.FC<CitizenPortalProps> = ({ tasks, lang, onSubmittedToQueue }) => {
  // Stepper: 1: Task Choice, 2: OCR Detector, 3: Interactive Guide, 4: Official Token
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Selected Task
  const [selectedTask, setSelectedTask] = useState<GovernmentTask>(tasks[0] || null);

  // OCR & Image state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [ocrResult, setOcrResult] = useState<OCRDetectResult | null>(null);
  const [uploadedImagePreview, setUploadedImagePreview] = useState<string | null>(null);
  const [ocrError, setOcrError] = useState<string | null>(null);

  // Citizen Input Details (autofilled by OCR)
  const [citizenName, setCitizenName] = useState('');
  const [citizenPhone, setCitizenPhone] = useState('98XXXXXXXX');
  const [documentNumber, setDocumentNumber] = useState('');
  const [district, setDistrict] = useState('');

  // Interactive Checklist Steps
  const [checkedSteps, setCheckedSteps] = useState<Record<number, boolean>>({});

  // Submission Token state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedToken, setGeneratedToken] = useState<string | null>(null);

  useEffect(() => {
    if (tasks.length > 0 && !selectedTask) {
      setSelectedTask(tasks[0]);
    }
  }, [tasks, selectedTask]);

  // Handle OCR scan (via API)
  const handleDetectOCR = async (payload: { sampleId?: string; imageBase64?: string }) => {
    setIsAnalyzing(true);
    setOcrError(null);

    try {
      const response = await fetch('/api/ocr/detect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payload,
          taskId: selectedTask?.id,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'OCR detection failed');
      }

      setOcrResult(data.result);

      // Autofill fields
      if (data.result?.extractedFields) {
        const fields = data.result.extractedFields;
        if (fields.fullNameNepali || fields.fullNameEnglish) {
          setCitizenName(fields.fullNameNepali ? `${fields.fullNameNepali} (${fields.fullNameEnglish || ''})` : fields.fullNameEnglish);
        }
        if (fields.docNumber) {
          setDocumentNumber(fields.docNumber);
        }
        if (fields.district) {
          setDistrict(fields.district);
        }
      }
    } catch (err: any) {
      console.error('OCR Error:', err);
      setOcrError(err.message || 'Error communicating with document scanner.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handle file upload with client-side image compression
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxDim = 1200;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.85);
          setUploadedImagePreview(compressedBase64);
          handleDetectOCR({ imageBase64: compressedBase64 });
        } else {
          const rawBase64 = reader.result as string;
          setUploadedImagePreview(rawBase64);
          handleDetectOCR({ imageBase64: rawBase64 });
        }
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Select pre-verified test samples
  const selectSample = (sampleId: string) => {
    setUploadedImagePreview(null);
    handleDetectOCR({ sampleId });
  };

  // Submit to official government queue
  const handleSubmitQueue = async () => {
    if (!selectedTask) return;
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/queue/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          citizenName: citizenName || 'Applicant Citizen',
          taskId: selectedTask.id,
          documentData: {
            isNagarikta: ocrResult?.isNagarikta ?? (selectedTask.requiredDocumentType === 'NAGARIKTA'),
            detectedDocumentType: ocrResult?.detectedDocumentType || selectedTask.requiredDocumentType,
            docNumber: documentNumber || ocrResult?.extractedFields?.docNumber || '२७-०१-७५-०३८४१',
          },
        }),
      });

      const data = await response.json();
      if (data.success && data.request) {
        setGeneratedToken(data.request.tokenNumber);
        setCurrentStep(4);
      } else {
        throw new Error(data.error || 'Failed to submit request');
      }
    } catch (err: any) {
      alert(`Submission error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Progress Stepper */}
      <div className="mb-8">
        <div className="flex items-center justify-between max-w-2xl mx-auto relative">
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-200 -translate-y-1/2 z-0" />
          <div
            className="absolute top-1/2 left-0 h-1 bg-slate-900 -translate-y-1/2 z-0 transition-all duration-300"
            style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
          />

          {[
            { step: 1, titleNe: 'सेवा छनोट', titleEn: 'Select Task' },
            { step: 2, titleNe: 'कागजात ओसीआर', titleEn: 'Document OCR' },
            { step: 3, titleNe: 'चरणबद्ध मार्गदर्शन', titleEn: 'Interactive Guide' },
            { step: 4, titleNe: 'क्यु टोकन', titleEn: 'Queue Token' },
          ].map((item) => (
            <div key={item.step} className="relative z-10 flex flex-col items-center">
              <button
                onClick={() => {
                  if (item.step < currentStep) setCurrentStep(item.step as any);
                }}
                disabled={item.step > currentStep}
                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition border-2 ${
                  currentStep === item.step
                    ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                    : currentStep > item.step
                    ? 'bg-emerald-700 text-white border-emerald-700'
                    : 'bg-white text-slate-400 border-slate-300'
                }`}
              >
                {currentStep > item.step ? '✓' : item.step}
              </button>
              <span
                className={`text-[11px] font-semibold mt-1.5 ${
                  currentStep === item.step ? 'text-slate-900 font-bold' : 'text-slate-600'
                }`}
              >
                {lang === 'ne' ? item.titleNe : item.titleEn}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* STEP 1: TASK SELECTION */}
      {currentStep === 1 && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sm:p-8 animate-fadeIn">
          <div className="mb-6 border-b border-slate-100 pb-4">
            <span className="px-2.5 py-1 rounded bg-slate-200 text-slate-800 text-xs font-bold uppercase tracking-wider">
              {lang === 'ne' ? 'पहिलो चरण' : 'Step 1'}
            </span>
            <h2 className="text-xl font-bold text-slate-900 mt-2">
              {lang === 'ne' ? 'तपाईंलाई कुन सरकारी काम गर्नुपर्ने हो? छनोट गर्नुहोस्' : 'What task do you need to do? Select an official service'}
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              {lang === 'ne'
                ? 'तपाईंको छनोट अनुसार प्रणालीले चाहिने कागजात पहिचान गर्नेछ र प्रत्येक चरणमा मार्गदर्शन गर्नेछ।'
                : 'Based on your choice, the system verifies your required document and guides you step-by-step.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tasks.map((task) => {
              const isSelected = selectedTask?.id === task.id;
              return (
                <div
                  key={task.id}
                  onClick={() => setSelectedTask(task)}
                  className={`p-5 rounded-xl border-2 cursor-pointer transition text-left relative ${
                    isSelected
                      ? 'border-slate-900 bg-slate-50 shadow-md ring-1 ring-slate-900'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                      {task.code}
                    </span>
                    <span className="text-xs font-semibold text-slate-500 flex items-center">
                      <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" />
                      {task.standardSlaMinutes} {lang === 'ne' ? 'मिनेट SLA' : 'min SLA'}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-base mb-1">
                    {lang === 'ne' ? task.titleNepali : task.titleEnglish}
                  </h3>

                  <p className="text-xs text-slate-500 mb-3 flex items-center">
                    <Building className="w-3.5 h-3.5 mr-1 text-slate-400" />
                    {lang === 'ne' ? task.departmentNepali : task.departmentEnglish}
                  </p>

                  <div className="bg-slate-100/70 p-2.5 rounded-lg border border-slate-200 text-xs">
                    <div className="flex items-center justify-between text-slate-700 mb-1">
                      <span className="font-medium text-slate-600">
                        {lang === 'ne' ? 'आवश्यक मुख्य कागजात:' : 'Required Document:'}
                      </span>
                      <span className="font-bold text-slate-900">
                        {lang === 'ne' ? task.requiredDocumentNameNepali : task.requiredDocumentNameEnglish}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-slate-700">
                      <span className="font-medium text-slate-600">
                        {lang === 'ne' ? 'सरकारी दस्तुर:' : 'Official Fee:'}
                      </span>
                      <span className="font-bold text-emerald-700">
                        {task.officialFeeNpr === 0
                          ? lang === 'ne'
                            ? 'निःशुल्क (रु ०)'
                            : 'Free (NPR 0)'
                          : `रु. ${task.officialFeeNpr.toLocaleString()}`}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-200/60 text-xs">
                    <span className="text-slate-600 font-medium">
                      {lang === 'ne' ? task.deskNameNepali : task.deskNameEnglish}
                    </span>
                    {isSelected && (
                      <span className="font-bold text-slate-900 flex items-center">
                        ✓ {lang === 'ne' ? 'छानियो' : 'Selected'}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 flex justify-end">
            <button
              onClick={() => setCurrentStep(2)}
              disabled={!selectedTask}
              className="flex items-center space-x-2 px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg shadow-md transition disabled:opacity-50"
            >
              <span>{lang === 'ne' ? 'कागजात ओसीआर जाँचमा जानुहोस्' : 'Proceed to Document OCR'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: OCR DETECTOR ("IS THIS NAGARIKTA OR WHAT?") */}
      {currentStep === 2 && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sm:p-8 animate-fadeIn">
          <div className="mb-6 border-b border-slate-100 pb-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="px-2.5 py-1 rounded bg-slate-200 text-slate-800 text-xs font-bold uppercase tracking-wider">
                {lang === 'ne' ? 'दोस्रो चरण: कागजात ओसीआर पहिचान' : 'Step 2: Document OCR Detection'}
              </span>
              <div className="text-xs bg-slate-100 px-3 py-1 rounded-md text-slate-700 border border-slate-200">
                <span className="font-semibold text-slate-500 mr-1">
                  {lang === 'ne' ? 'छानिएको सेवा:' : 'Selected Task:'}
                </span>
                <span className="font-bold text-slate-900">
                  {lang === 'ne' ? selectedTask.titleNepali : selectedTask.titleEnglish}
                </span>
              </div>
            </div>

            <h2 className="text-xl font-bold text-slate-900 mt-2">
              {lang === 'ne'
                ? 'कागजात स्क्यानर: यो नागरिकता प्रमाणपत्र हो वा अन्य कागजात?'
                : 'OCR Detector: Is this a Nagarikta or what document?'}
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              {lang === 'ne'
                ? 'कागजात स्क्यान गरी कौन कागजात हो र मान्य छ छैन जाँच्नुहोस्।'
                : 'Scans uploaded document image to classify document type, extract fields, and verify authenticity.'}
            </p>
          </div>

          {/* Quick Test Samples */}
          <div className="mb-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <span className="text-xs font-bold text-slate-700 block mb-2 flex items-center">
              <Sparkles className="w-4 h-4 text-slate-700 mr-1.5" />
              {lang === 'ne' ? 'तुरुन्त परीक्षणको लागि नमुना कागजातहरू:' : 'Quick Test Sample Documents:'}
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                onClick={() => selectSample('sample-nagarikta-front')}
                className="px-3 py-2 text-xs font-semibold rounded-lg bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 text-left transition shadow-xs"
              >
                <span className="block font-bold text-slate-900">🇳🇵 नागरिकता (Nagarikta)</span>
                <span className="text-[10px] text-slate-500">Citizenship Sample</span>
              </button>

              <button
                onClick={() => selectSample('sample-lalpurja')}
                className="px-3 py-2 text-xs font-semibold rounded-lg bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 text-left transition shadow-xs"
              >
                <span className="block font-bold text-slate-900">📜 जग्गाधनी लालपुर्जा</span>
                <span className="text-[10px] text-slate-500">Lalpurja Title Deed</span>
              </button>

              <button
                onClick={() => selectSample('sample-passport')}
                className="px-3 py-2 text-xs font-semibold rounded-lg bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 text-left transition shadow-xs"
              >
                <span className="block font-bold text-slate-900">🛂 राहदानी (Passport)</span>
                <span className="text-[10px] text-slate-500">Passport Sample</span>
              </button>

              <button
                onClick={() => selectSample('sample-electricity-bill')}
                className="px-3 py-2 text-xs font-semibold rounded-lg bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 text-left transition shadow-xs"
              >
                <span className="block font-bold text-slate-700">🧾 विद्युत महसुल रसिद</span>
                <span className="text-[10px] text-slate-500">Non-Govt Utility Bill</span>
              </button>
            </div>
          </div>

          {/* Upload Box */}
          <div className="mb-6">
            <label className="border-2 border-dashed border-slate-300 hover:border-slate-800 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer bg-slate-50/50 hover:bg-slate-100/50 transition">
              <Upload className="w-8 h-8 text-slate-400 mb-2" />
              <span className="font-bold text-slate-800 text-sm">
                {lang === 'ne' ? 'कागजातको फोटो छान्नुहोस् वा स्क्यान गर्नुहोस्' : 'Upload document photo for OCR vision'}
              </span>
              <span className="text-xs text-slate-500 mt-1">
                {lang === 'ne' ? 'JPG, PNG (स्वचालित रूपमा कम्प्रेसन र ओसीआर)' : 'JPG, PNG format (automatic AI compression & OCR)'}
              </span>
              <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
            </label>
          </div>

          {/* Analysis Loading State */}
          {isAnalyzing && (
            <div className="p-8 bg-slate-50 rounded-xl border border-slate-200 text-center animate-pulse">
              <div className="w-10 h-10 border-4 border-red-700 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <h4 className="font-bold text-slate-900 text-sm">
                {lang === 'ne' ? 'कागजात ओसीआर स्क्यान हुँदैछ...' : 'OCR Detector Analyzing Document...'}
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                {lang === 'ne'
                  ? 'नेपाली नागरिकता हो कि अन्य कागजात, छाप र विवरण विश्लेषण गरिँदैछ'
                  : 'Verifying citizenship status, document classification, seals, and citizen details'}
              </p>
            </div>
          )}

          {ocrError && (
            <div className="p-4 bg-red-50 rounded-xl border border-red-200 text-red-800 text-xs flex items-center mb-6">
              <AlertCircle className="w-5 h-5 mr-2 shrink-0" />
              <span>{ocrError}</span>
            </div>
          )}

          {/* OCR VERDICT RESULT DISPLAY */}
          {ocrResult && !isAnalyzing && (
            <div className="space-y-4 animate-fadeIn">
              {/* Question: "Is this Nagarikta or what?" Big Direct Answer */}
              <div
                className={`p-5 rounded-xl border-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                  ocrResult.isNagarikta
                    ? 'bg-emerald-50 border-emerald-600 text-emerald-950'
                    : 'bg-amber-50 border-amber-600 text-amber-950'
                }`}
              >
                <div className="flex items-start space-x-3">
                  {ocrResult.isNagarikta ? (
                    <CheckCircle className="w-8 h-8 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-8 h-8 text-amber-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                        {lang === 'ne' ? 'कागजात पहिचान प्रश्न:' : 'Verification Verdict:'}
                      </span>
                    </div>
                    <h3 className="text-lg font-black mt-0.5">
                      {ocrResult.isNagarikta
                        ? lang === 'ne'
                          ? 'हो, यो नेपाली नागरिकताको प्रमाणपत्र (Nagarikta) हो।'
                          : 'YES, this document is a Nepali Citizenship Certificate (Nagarikta).'
                        : lang === 'ne'
                        ? `होइन, यो नागरिकता होइन — (${ocrResult.documentTitleNepali}) हो।`
                        : `NO, this is NOT a Nagarikta — it is a ${ocrResult.documentTitleEnglish}.`}
                    </h3>
                    <p className="text-xs mt-1 text-slate-700">
                      {lang === 'ne'
                        ? ocrResult.validationMessageNepali
                        : ocrResult.validationMessageEnglish}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 text-right bg-white/80 px-4 py-2 rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">
                    {lang === 'ne' ? 'ओसीआर यकिन दर' : 'OCR Confidence'}
                  </span>
                  <span className="text-lg font-black text-slate-900">{ocrResult.confidence}%</span>
                </div>
              </div>

              {/* Task Compatibility & Personalized Error Diagnosis Box */}
              <div
                className={`p-4 rounded-xl border text-xs ${
                  ocrResult.isValidForSelectedTask
                    ? 'bg-emerald-50/70 border-emerald-300 text-emerald-900'
                    : 'bg-red-50 border-red-300 text-red-950'
                }`}
              >
                <div className="flex items-start space-x-2.5">
                  {ocrResult.isValidForSelectedTask ? (
                    <CheckCircle className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-700 shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <span className="font-bold block text-sm mb-1">
                      {ocrResult.isValidForSelectedTask
                        ? lang === 'ne'
                          ? 'कागजात स्वीकृत: तोकिएको सेवाको लागि पूर्ण रूपमा मान्य।'
                          : 'Document Approved: Fully valid for selected service.'
                        : lang === 'ne'
                        ? 'त्रुटि फेला पर्यो: कागजात वा विवरण मिल्दोजुल्दो छैन।'
                        : 'Error Detected: Document mismatch or invalid for this service.'}
                    </span>

                    {/* Personalized Error Diagnosis ("What is wrong") */}
                    {!ocrResult.isValidForSelectedTask && (
                      <div className="mt-2 p-3 bg-white rounded-lg border border-red-200 text-red-950">
                        <span className="font-bold block text-red-800 uppercase text-[11px] mb-1">
                          {lang === 'ne' ? '❌ के गडबड छ (Error Diagnosis):' : '❌ What is Wrong:'}
                        </span>
                        <p className="font-medium">
                          {lang === 'ne'
                            ? ocrResult.errorDiagnosisNepali || 'तपाईंले अपलोड गर्नुभएको कागजात यो सरकारी सेवाको लागि मिल्दैन।'
                            : ocrResult.errorDiagnosisEnglish || 'The uploaded document does not match requirements for this government task.'}
                        </p>
                      </div>
                    )}

                    {/* Personalized Corrective Steps ("What to do next") */}
                    {!ocrResult.isValidForSelectedTask && (
                      <>
                        <div className="mt-2.5 p-3 bg-white rounded-lg border border-red-200 text-slate-900">
                          <span className="font-bold block text-emerald-800 uppercase text-[11px] mb-1.5">
                            {lang === 'ne' ? '✅ अब के गर्ने (Corrective Action Steps):' : '✅ What to Do Next (Action Steps):'}
                          </span>
                          <ul className="space-y-1 list-disc list-inside font-semibold">
                            {(lang === 'ne'
                              ? ocrResult.correctiveStepsNepali || [
                                  '१. सही सरकारी कागजात (जस्तै नागरिकता वा लालपुर्जा) तयार पार्नुहोस्।',
                                  '२. कागजातको स्पष्ट तस्बिर (छायारहित) खिच्नुहोस्।',
                                  '३. पुन: कागजात स्क्यान गरी क्युमा दर्ता गर्नुहोस्।'
                                ]
                              : ocrResult.correctiveStepsEnglish || [
                                  '1. Locate the correct government document (e.g. Nagarikta or Lalpurja).',
                                  '2. Capture a clear, well-lit photo without glare.',
                                  '3. Re-scan and submit your application.'
                                ]
                            ).map((step, idx) => (
                              <li key={idx} className="text-slate-800">{step}</li>
                            ))}
                          </ul>
                        </div>

                        {/* Document Acquisition Locations */}
                        {selectedTask?.docAcquisitionLocations && (
                          <div className="mt-2.5 p-3 bg-white rounded-lg border border-slate-200 text-slate-900">
                            <span className="font-bold block text-slate-800 uppercase text-[11px] mb-1.5">
                              {lang === 'ne' ? '📍 कागजात प्राप्त गर्ने स्थानहरू:' : '📍 Where to Get Required Documents:'}
                            </span>
                            <div className="space-y-2">
                              {selectedTask.docAcquisitionLocations.map((loc, idx) => (
                                <div key={idx} className="border-b border-slate-100 pb-1 last:border-b-0">
                                  <span className="font-bold text-slate-800 block text-[11px]">
                                    {lang === 'ne' ? loc.locationNepali : loc.locationEnglish}
                                  </span>
                                  <span className="text-slate-600 block text-[10px]">
                                    {lang === 'ne' ? loc.requiredProcessNepali : loc.requiredProcessEnglish}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    {ocrResult.isValidForSelectedTask && (
                      <span className="text-emerald-800 block mt-1 font-medium">
                        {lang === 'ne'
                          ? ocrResult.nextStepRecommendationNepali
                          : ocrResult.nextStepRecommendationEnglish}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Extracted Fields Metadata */}
              {ocrResult.extractedFields && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                  <span className="font-bold text-slate-800 block mb-2 flex items-center">
                    <FileText className="w-4 h-4 text-slate-600 mr-1.5" />
                    {lang === 'ne' ? 'कागजातबाट प्राप्त विवरणहरू (Extracted Data):' : 'Extracted Document Fields:'}
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    <div className="bg-white p-2.5 rounded border border-slate-200">
                      <span className="text-slate-500 block text-[11px]">
                        {lang === 'ne' ? 'नागरिकको नाम:' : 'Citizen Name:'}
                      </span>
                      <span className="font-bold text-slate-900">
                        {ocrResult.extractedFields.fullNameNepali || ocrResult.extractedFields.fullNameEnglish || 'N/A'}
                      </span>
                    </div>

                    <div className="bg-white p-2.5 rounded border border-slate-200">
                      <span className="text-slate-500 block text-[11px]">
                        {lang === 'ne' ? 'कागजात / नागरिकता नम्बर:' : 'Document / ID Number:'}
                      </span>
                      <span className="font-bold text-slate-900">
                        {ocrResult.extractedFields.docNumber || 'N/A'}
                      </span>
                    </div>

                    <div className="bg-white p-2.5 rounded border border-slate-200">
                      <span className="text-slate-500 block text-[11px]">
                        {lang === 'ne' ? 'जिल्ला / ठेगाना:' : 'District / Address:'}
                      </span>
                      <span className="font-bold text-slate-900">
                        {ocrResult.extractedFields.district || ocrResult.extractedFields.municipalityWard || 'N/A'}
                      </span>
                    </div>

                    {ocrResult.extractedFields.dobBs && (
                      <div className="bg-white p-2.5 rounded border border-slate-200">
                        <span className="text-slate-500 block text-[11px]">
                          {lang === 'ne' ? 'जन्ममिति (वि.सं / ई.सं):' : 'Birth Date (BS / AD):'}
                        </span>
                        <span className="font-bold text-slate-900">
                          {ocrResult.extractedFields.dobBs} ({ocrResult.extractedFields.dobAd})
                        </span>
                      </div>
                    )}

                    {ocrResult.extractedFields.fatherName && (
                      <div className="bg-white p-2.5 rounded border border-slate-200">
                        <span className="text-slate-500 block text-[11px]">
                          {lang === 'ne' ? 'बाबुको नाम:' : 'Father Name:'}
                        </span>
                        <span className="font-bold text-slate-900">
                          {ocrResult.extractedFields.fatherName}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Stepper Navigation */}
          <div className="mt-8 flex justify-between items-center pt-4 border-t border-slate-100">
            <button
              onClick={() => setCurrentStep(1)}
              className="flex items-center space-x-1.5 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 text-xs font-semibold transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{lang === 'ne' ? 'पछाडि (सेवा बदल्नुहोस्)' : 'Back (Change Task)'}</span>
            </button>

            <button
              onClick={() => setCurrentStep(3)}
              disabled={!ocrResult}
              className="flex items-center space-x-2 px-6 py-2.5 bg-red-700 hover:bg-red-800 text-white font-bold rounded-lg shadow-md transition disabled:opacity-50 text-xs"
            >
              <span>{lang === 'ne' ? 'मार्गदर्शन तथा फाराम भर्नुहोस्' : 'Proceed to Step-by-Step Guide'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: INTERACTIVE GUIDED STEP CHECKLIST & CONFIRMATION */}
      {currentStep === 3 && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sm:p-8 animate-fadeIn">
          <div className="mb-6 border-b border-slate-100 pb-4">
            <span className="px-2.5 py-1 rounded bg-red-100 text-red-800 text-xs font-bold uppercase tracking-wider">
              {lang === 'ne' ? 'तेस्रो चरण: अन्तरक्रियात्मक चरणबद्ध मार्गदर्शन' : 'Step 3: Interactive Task Guide'}
            </span>
            <h2 className="text-xl font-bold text-slate-900 mt-2">
              {lang === 'ne' ? selectedTask.titleNepali : selectedTask.titleEnglish} —{' '}
              {lang === 'ne' ? 'प्रक्रिया तथा रुजु' : 'Official Checklist & Verification'}
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              {lang === 'ne'
                ? 'सरकारी काउन्टरमा जानुअघि तलका सबै चरणहरू पूरा गर्नुहोस् ताकि कुनै बिचौलिया वा कर्मचारीले ढिलाइ गर्न नसकोस्।'
                : 'Follow each sequential action below before submitting your official request into the counter queue.'}
            </p>
          </div>

          {/* Interactive Steps Checklist */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
              {lang === 'ne' ? 'तोकिएका अनिवार्य चरणहरू (Interactive Steps):' : 'Required Process Steps:'}
            </h3>
            <div className="space-y-3">
              {(lang === 'ne' ? selectedTask.stepsNepali : selectedTask.stepsEnglish).map((stepText, idx) => {
                const isChecked = Boolean(checkedSteps[idx]);
                return (
                  <div
                    key={idx}
                    onClick={() => setCheckedSteps({ ...checkedSteps, [idx]: !isChecked })}
                    className={`p-3.5 rounded-lg border cursor-pointer transition flex items-start space-x-3 ${
                      isChecked
                        ? 'bg-emerald-50/60 border-emerald-300 text-slate-900'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}}
                      className="mt-0.5 w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                    />
                    <div className="flex-1 text-xs">
                      <span className="font-bold text-slate-700 mr-2">
                        {lang === 'ne' ? `चरण ${idx + 1}:` : `Step ${idx + 1}:`}
                      </span>
                      <span className={isChecked ? 'text-emerald-950 font-medium' : 'text-slate-800'}>
                        {stepText}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Applicant Identification Review Form */}
          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 mb-6">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center">
              <UserCheck className="w-4 h-4 text-slate-600 mr-1.5" />
              {lang === 'ne' ? 'सेवाग्राही नागरिकको विवरण पुष्टि:' : 'Confirm Applicant Details:'}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">
                  {lang === 'ne' ? 'नागरिकको पूरा नाम:' : 'Full Name:'}
                </label>
                <input
                  type="text"
                  value={citizenName}
                  onChange={(e) => setCitizenName(e.target.value)}
                  placeholder="उदा: Bikram Bahadur Thapa"
                  className="w-full px-3 py-2 bg-white rounded-lg border border-slate-300 font-medium text-slate-900 focus:outline-hidden focus:border-red-600"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">
                  {lang === 'ne' ? 'सम्पर्क फोन नम्बर:' : 'Contact Mobile Number:'}
                </label>
                <input
                  type="text"
                  value={citizenPhone}
                  onChange={(e) => setCitizenPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-white rounded-lg border border-slate-300 font-medium text-slate-900 focus:outline-hidden focus:border-red-600"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">
                  {lang === 'ne' ? 'प्रमाणित कागजात / नागरिकता नं:' : 'Verified Document / Nagarikta Number:'}
                </label>
                <input
                  type="text"
                  value={documentNumber}
                  onChange={(e) => setDocumentNumber(e.target.value)}
                  className="w-full px-3 py-2 bg-white rounded-lg border border-slate-300 font-medium text-slate-900 focus:outline-hidden focus:border-red-600"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">
                  {lang === 'ne' ? 'जिल्ला प्रशासन / कार्यालय:' : 'District / Office:'}
                </label>
                <input
                  type="text"
                  value={district || 'Kathmandu (काठमाडौं)'}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full px-3 py-2 bg-white rounded-lg border border-slate-300 font-medium text-slate-900 focus:outline-hidden focus:border-red-600"
                />
              </div>
            </div>
          </div>

          {/* Stepper Navigation */}
          <div className="flex justify-between items-center pt-4 border-t border-slate-100">
            <button
              onClick={() => setCurrentStep(2)}
              className="flex items-center space-x-1.5 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 text-xs font-semibold transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{lang === 'ne' ? 'पछाडि (ओसीआर जाँच)' : 'Back (OCR Check)'}</span>
            </button>

            <button
              onClick={handleSubmitQueue}
              disabled={isSubmitting}
              className="flex items-center space-x-2 px-6 py-2.5 bg-red-700 hover:bg-red-800 text-white font-bold rounded-lg shadow-md transition disabled:opacity-50 text-xs"
            >
              <Send className="w-4 h-4" />
              <span>
                {isSubmitting
                  ? lang === 'ne'
                    ? 'दर्ता हुँदैछ...'
                    : 'Submitting...'
                  : lang === 'ne'
                  ? 'सरकारी क्युमा दर्ता गर्नुहोस् (टोकन लिनुहोस्)'
                  : 'Submit Official Request to Queue'}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: TOKEN RECEIPT & QUEUE REGISTRATION */}
      {currentStep === 4 && (
        <div className="bg-white rounded-xl shadow-md border-2 border-emerald-600 p-6 sm:p-8 text-center animate-fadeIn">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-300">
            <CheckCircle className="w-9 h-9" />
          </div>

          <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold uppercase tracking-wider">
            {lang === 'ne' ? 'सरकारी क्युमा सफलतापूर्वक दर्ता भयो' : 'Officially Registered in Government Queue'}
          </span>

          <h2 className="text-2xl font-black text-slate-900 mt-3">
            {lang === 'ne' ? 'तपाईंको आधिकारिक टोकन नम्बर' : 'Your Official Counter Token'}
          </h2>

          <div className="max-w-md mx-auto my-6 p-6 bg-slate-50 rounded-2xl border-2 border-slate-300 shadow-inner">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest block">
              {lang === 'ne' ? 'पालो टोकन नम्बर' : 'FIFO QUEUE TOKEN'}
            </span>
            <div className="text-4xl font-mono font-black text-red-700 tracking-wider my-2">
              {generatedToken || 'NP-KTM-004'}
            </div>
            <div className="text-xs text-slate-600">
              {lang === 'ne' ? selectedTask.deskNameNepali : selectedTask.deskNameEnglish}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-xl mx-auto text-xs text-left mb-6">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span className="text-slate-500 block text-[11px] font-semibold">
                {lang === 'ne' ? 'तोकिएको समय (SLA):' : 'Statutory SLA Time:'}
              </span>
              <span className="font-bold text-slate-900">
                {selectedTask.standardSlaMinutes} {lang === 'ne' ? 'मिनेट' : 'minutes'}
              </span>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span className="text-slate-500 block text-[11px] font-semibold">
                {lang === 'ne' ? 'सरकारी दस्तुर:' : 'Mandated Fee:'}
              </span>
              <span className="font-bold text-emerald-700">
                {selectedTask.officialFeeNpr === 0
                  ? 'रु. ० (निःशुल्क)'
                  : `रु. ${selectedTask.officialFeeNpr}`}
              </span>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span className="text-slate-500 block text-[11px] font-semibold">
                {lang === 'ne' ? 'कागजात रुजु:' : 'OCR Verified:'}
              </span>
              <span className="font-bold text-slate-900">
                {ocrResult?.isNagarikta
                  ? lang === 'ne'
                    ? 'नागरिकता प्रमाणित'
                    : 'Nagarikta Verified'
                  : 'Deed Verified'}
              </span>
            </div>
          </div>

          <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 max-w-xl mx-auto text-xs text-amber-900 text-left mb-6">
            <div className="flex items-start space-x-2">
              <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">
                  {lang === 'ne'
                    ? 'समयसीमा अनुगमन तथा माथिल्लो निकायमा इमेल सुरक्षा:'
                    : 'Automated Upper Authority Delay Protection Active:'}
                </span>
                <span className="block mt-0.5 text-amber-800">
                  {lang === 'ne'
                    ? `यदि कर्मचारीले तोकिएको ${selectedTask.standardSlaMinutes} मिनेट भित्र काम सम्हालेन भने प्रणालीले स्वतः प्रमुख जिल्ला अधिकारी (CDO) र माथिल्लो निकाय (linecompany2024@gmail.com) मा उजुरी इमेल पठाउनेछ।`
                    : `If processing exceeds the mandated ${selectedTask.standardSlaMinutes} min SLA, an automated escalation email will be dispatched directly to the Upper Authority & CDO.`}
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-center space-x-4">
            <button
              onClick={() => {
                if (generatedToken) onSubmittedToQueue(generatedToken);
              }}
              className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-xs transition shadow-md flex items-center space-x-2"
            >
              <span>{lang === 'ne' ? 'सरकारी ड्यासबोर्डमा पालो हेर्नुहोस्' : 'View in Government Monitor Dashboard'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                setCurrentStep(1);
                setOcrResult(null);
                setGeneratedToken(null);
              }}
              className="px-4 py-2.5 border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold rounded-lg text-xs transition"
            >
              {lang === 'ne' ? 'अर्को नयाँ आवेदन' : 'Start New Task'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
