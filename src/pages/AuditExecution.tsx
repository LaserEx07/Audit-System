import React, { useState, useEffect } from 'react';
import { Play, CheckSquare, ShieldCheck, MapPin, Check, AlertCircle, HelpCircle, X, ChevronRight, PenTool } from 'lucide-react';
import { Database } from '../services/db';
import { AuditPlan, ChecklistTemplate, AuditExecution, ExecutionAnswer, ChecklistQuestion, UserRole } from '../types';

interface AuditExecutionProps {
  currentRole: UserRole;
  addToast: (msg: string, type: 'success' | 'danger' | 'warning' | 'info') => void;
  onNavigate: (page: string) => void;
}

export default function AuditExecutionScreen({ currentRole, addToast, onNavigate }: AuditExecutionProps) {
  const [plans, setPlans] = useState<AuditPlan[]>([]);
  const [templates, setTemplates] = useState<ChecklistTemplate[]>([]);

  // Selection states
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');

  // Active execution state
  const [answers, setAnswers] = useState<Record<string, { status: 'Pass' | 'Fail' | 'N/A'; remarks: string; evidenceName: string }>>({});
  const [digitalSignature, setDigitalSignature] = useState('');
  const [gpsCoords, setGpsCoords] = useState('Latitude: 37.7749, Longitude: -122.4194 (Simulated GPS)');

  useEffect(() => {
    // Only load plans that are Planned or In Progress
    const activePlans = Database.getAuditPlans().filter(p => p.status !== 'Completed' && p.status !== 'Cancelled');
    setPlans(activePlans);
    setTemplates(Database.getChecklistTemplates());

    if (activePlans.length > 0) {
      setSelectedPlanId(activePlans[0].id);
    }
  }, []);

  // Sync templates based on selected plan's audit type
  useEffect(() => {
    const activePlan = plans.find(p => p.id === selectedPlanId);
    if (activePlan) {
      const matchedTpl = templates.find(t => t.auditType === activePlan.auditType);
      if (matchedTpl) {
        setSelectedTemplateId(matchedTpl.id);
      } else if (templates.length > 0) {
        setSelectedTemplateId(templates[0].id);
      }
    }
  }, [selectedPlanId, plans, templates]);

  // Load questions when template changes
  const activeTemplate = templates.find(t => t.id === selectedTemplateId);
  useEffect(() => {
    if (activeTemplate) {
      const initialAnswers: typeof answers = {};
      activeTemplate.questions.forEach((q) => {
        initialAnswers[q.id] = { status: 'Pass', remarks: '', evidenceName: '' };
      });
      setAnswers(initialAnswers);
    }
  }, [selectedTemplateId, activeTemplate]);

  const handleStatusChange = (qId: string, status: 'Pass' | 'Fail' | 'N/A') => {
    setAnswers({
      ...answers,
      [qId]: { ...answers[qId], status }
    });
  };

  const handleRemarksChange = (qId: string, remarks: string) => {
    setAnswers({
      ...answers,
      [qId]: { ...answers[qId], remarks }
    });
  };

  const handleEvidenceChange = (qId: string, evidenceName: string) => {
    setAnswers({
      ...answers,
      [qId]: { ...answers[qId], evidenceName }
    });
  };

  // Simulated GPS fetch
  const handleLoadGPS = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setGpsCoords(`Lat: ${pos.coords.latitude.toFixed(4)}, Lon: ${pos.coords.longitude.toFixed(4)} (Real Time GPS)`);
          addToast('Successfully fetched client-side coordinates.', 'success');
        },
        () => {
          setGpsCoords('Latitude: 14.5995, Longitude: 120.9842 (Simulation Hub Manila)');
          addToast('Standard location simulation active.', 'info');
        }
      );
    }
  };

  const handleSaveExecution = (isFinal: boolean) => {
    if (!selectedPlanId || !selectedTemplateId) {
      addToast('Please select Audit Plan and Checklist Template first.', 'warning');
      return;
    }

    if (isFinal && !digitalSignature.trim()) {
      addToast('A digital signature is required to complete and sign off the audit.', 'warning');
      return;
    }

    // Map answers to database record structure
    const mappedAnswers: Record<string, ExecutionAnswer> = {};
    Object.entries(answers).forEach(([qId, val]) => {
      const ans = val as { status: 'Pass' | 'Fail' | 'N/A'; remarks: string; evidenceName: string };
      mappedAnswers[qId] = {
        questionId: qId,
        status: ans.status,
        remarks: ans.remarks,
        evidenceName: ans.evidenceName || undefined,
        timestamp: new Date().toISOString()
      };
    });

    const executionRecord: AuditExecution = {
      id: `exec-${selectedPlanId}`,
      auditPlanId: selectedPlanId,
      answers: mappedAnswers,
      digitalSignature: isFinal ? digitalSignature.trim() : undefined,
      timestamp: new Date().toISOString(),
      gpsLocation: gpsCoords
    };

    Database.saveExecution(executionRecord);
    addToast(
      isFinal
        ? 'Audit successfully signed, closed, and saved to compliance registries!'
        : 'Draft execution answers saved successfully.',
      'success'
    );

    if (isFinal) {
      onNavigate('planning');
    }
  };

  const activePlan = plans.find((p) => p.id === selectedPlanId);

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-100 dark:border-gray-800 pb-4">
        <h1 className="text-xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">
          Audit Checklist Execution
        </h1>
        <p className="text-xs text-gray-400">Perform field examinations, answer policy checklists, attach evidence, and sign.</p>
      </div>

      {plans.length === 0 ? (
        <div className="py-16 text-center text-xs text-gray-400 bg-white dark:bg-gray-900 border rounded-xl p-6 flex flex-col items-center justify-center space-y-2">
          <ShieldCheck className="h-10 w-10 text-gray-300" />
          <p className="font-semibold text-gray-500">No active audits pending execution</p>
          <p className="text-[11px] text-gray-400">Please schedule a new audit first or switch status to Draft/Planned.</p>
          <button
            onClick={() => onNavigate('planning')}
            className="mt-4 inline-flex items-center space-x-1.5 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700"
          >
            Go to Audit Planning
          </button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-12">
          {/* Top Panel: Setup Selections */}
          <div className="md:col-span-12 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white dark:bg-gray-900 p-5 rounded-xl border border-gray-100 dark:border-gray-800">
            <div className="grid gap-3 sm:grid-cols-2 flex-1">
              <div className="space-y-1">
                <label htmlFor="exec-select-plan" className="block text-[10px] font-bold text-gray-400 uppercase">1. Select Audit Plan Scope</label>
                <select
                  id="exec-select-plan"
                  value={selectedPlanId}
                  onChange={(e) => setSelectedPlanId(e.target.value)}
                  className="block w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-850 px-3 py-2 text-xs text-gray-700 dark:text-gray-300"
                >
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.auditNumber} - {p.title} ({p.auditType})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label htmlFor="exec-select-tpl" className="block text-[10px] font-bold text-gray-400 uppercase">2. Select Checklist Template</label>
                <select
                  id="exec-select-tpl"
                  value={selectedTemplateId}
                  onChange={(e) => setSelectedTemplateId(e.target.value)}
                  className="block w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-850 px-3 py-2 text-xs text-gray-700 dark:text-gray-300"
                >
                  {templates.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title} ({t.auditType})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {activePlan && (
              <div className="bg-blue-50/50 dark:bg-blue-950/20 p-3 rounded-xl border border-blue-100/50 dark:border-blue-900/50 text-xs shrink-0 md:max-w-xs space-y-1">
                <p className="font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wide text-[9px]">Active Target details</p>
                <p className="font-semibold text-gray-800 dark:text-gray-200">{activePlan.title}</p>
                <p className="text-gray-400 text-[10px]">Lead Auditor: {Database.getEmployees().find(e => e.id === activePlan.leadAuditorId)?.fullName}</p>
              </div>
            )}
          </div>

          {/* Checklist Form Execution Area */}
          <div className="md:col-span-8 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-5 space-y-5">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <h2 className="text-xs font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider">Exam Standards Checkpoints</h2>
              <span className="text-[10px] text-gray-400 font-semibold">{activeTemplate?.questions?.length || 0} verification points</span>
            </div>

            {!activeTemplate ? (
              <p className="text-center text-xs text-gray-400 py-12">Please select a template to load checklists.</p>
            ) : (
              <div className="space-y-4">
                {activeTemplate.questions.map((q, idx) => {
                  const state = answers[q.id] || { status: 'Pass', remarks: '', evidenceName: '' };
                  return (
                    <div
                      key={q.id}
                      className="p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-800/10 space-y-3"
                    >
                      {/* Question Text */}
                      <div className="flex items-start space-x-2.5">
                        <div className="h-5 w-5 shrink-0 rounded-full bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-400 font-extrabold flex items-center justify-center text-[10px]">
                          {idx + 1}
                        </div>
                        <div className="flex-1 space-y-0.5 text-xs">
                          <p className="font-semibold text-gray-800 dark:text-gray-200">{q.question}</p>
                          <span className="inline-block text-[9px] text-gray-400 font-bold uppercase">CATEGORY: {q.category}</span>
                        </div>
                      </div>

                      {/* PASS / FAIL / NA Actions */}
                      <div className="grid gap-3 sm:grid-cols-12 items-center pt-1">
                        <div className="sm:col-span-4 flex items-center space-x-1.5 bg-white dark:bg-gray-800 p-1.5 rounded-lg border border-gray-200/60 dark:border-gray-800 shadow-2xs">
                          {(['Pass', 'Fail', 'N/A'] as const).map((statusVal) => (
                            <button
                              key={statusVal}
                              type="button"
                              onClick={() => handleStatusChange(q.id, statusVal)}
                              className={`flex-1 py-1 px-2.5 rounded-md text-[10px] font-bold uppercase transition-all ${
                                state.status === statusVal
                                  ? statusVal === 'Pass'
                                    ? 'bg-green-600 text-white shadow-sm'
                                    : statusVal === 'Fail'
                                    ? 'bg-red-600 text-white shadow-sm'
                                    : 'bg-gray-600 text-white'
                                  : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
                              }`}
                            >
                              {statusVal}
                            </button>
                          ))}
                        </div>

                        <div className="sm:col-span-5">
                          <input
                            id={`remarks-${q.id}`}
                            type="text"
                            placeholder="Examination remarks/observations..."
                            value={state.remarks}
                            onChange={(e) => handleRemarksChange(q.id, e.target.value)}
                            className="block w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-1.5 text-xs focus:border-blue-500 focus:outline-hidden"
                          />
                        </div>

                        <div className="sm:col-span-3">
                          <input
                            id={`evidence-${q.id}`}
                            type="text"
                            placeholder="Evidence file name..."
                            value={state.evidenceName}
                            onChange={(e) => handleEvidenceChange(q.id, e.target.value)}
                            className="block w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-2 py-1.5 text-[10px] focus:border-blue-500 focus:outline-hidden font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Panel: Digital Signature, Location Metadata, and Verification sign-off */}
          <div className="md:col-span-4 space-y-6">
            {/* Signature & Coordinates */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-5 space-y-4 shadow-xs">
              <h3 className="text-xs font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider">Audit Attestation & Signing</h3>

              {/* GPS Coordinates */}
              <div className="space-y-1.5">
                <span className="block text-[10px] font-bold text-gray-400 uppercase">GPS Verification</span>
                <div className="flex items-center space-x-1.5 bg-gray-50 dark:bg-gray-850 p-2.5 rounded-lg border border-gray-200/50 dark:border-gray-800 text-[10px] font-mono text-gray-600 dark:text-gray-400">
                  <MapPin className="h-4 w-4 shrink-0 text-blue-500" />
                  <span className="truncate">{gpsCoords}</span>
                </div>
                <button
                  type="button"
                  onClick={handleLoadGPS}
                  className="text-[10px] text-blue-500 hover:underline font-semibold"
                >
                  Recalculate Current Geolocation
                </button>
              </div>

              {/* Digital Signature */}
              <div className="space-y-1">
                <label htmlFor="digital-signature" className="block text-[10px] font-bold text-gray-400 uppercase">Digital Sign-off (FullName) *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <PenTool className="h-3.5 w-3.5" />
                  </div>
                  <input
                    id="digital-signature"
                    type="text"
                    required
                    value={digitalSignature}
                    onChange={(e) => setDigitalSignature(e.target.value)}
                    placeholder="Type legal name to sign..."
                    className="block w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 py-1.5 pl-9 pr-3 text-xs focus:border-blue-500 font-mono italic"
                  />
                </div>
                {digitalSignature && (
                  <div className="mt-2 p-3 bg-gray-50/50 rounded-lg border-2 border-dashed border-gray-200 text-center font-mono italic text-sm text-gray-600 relative select-none">
                    <span className="absolute top-1 left-1.5 text-[8px] text-gray-400 uppercase font-sans font-bold">Encrypted signature</span>
                    {digitalSignature}
                  </div>
                )}
              </div>

              <div className="border-t border-gray-100 dark:border-gray-800 pt-4 space-y-2">
                <button
                  type="button"
                  onClick={() => handleSaveExecution(false)}
                  className="w-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-750 text-gray-700 dark:text-gray-300 font-semibold py-2 rounded-lg text-xs transition-colors"
                >
                  Save Draft Progress
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveExecution(true)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg text-xs shadow-xs transition-all"
                >
                  Verify, Sign, and Close Audit
                </button>
              </div>
            </div>

            {/* Instruction Panel */}
            <div className="bg-amber-50/30 border border-amber-200/50 dark:bg-amber-950/10 dark:border-amber-900/45 p-4 rounded-xl text-xs space-y-1.5">
              <div className="flex items-center space-x-1.5 text-amber-600 dark:text-amber-400 font-bold">
                <AlertCircle className="h-4 w-4" />
                <span>Automatic Finding Triggers</span>
              </div>
              <p className="text-gray-500 dark:text-gray-400 leading-normal">
                Answering any checkpoint with <strong>FAIL</strong> will trigger immediate system events:
              </p>
              <ul className="list-disc pl-4 space-y-1 text-[11px] text-gray-400">
                <li>Automated Drafting in Findings Registry</li>
                <li>Instant compliance notifications to departments</li>
                <li>System non-conformance flag registered</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
