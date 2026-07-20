import React, { useState, useEffect } from 'react';
import { ClipboardCheck, Plus, Trash2, Edit, X, Eye, CheckCircle2 } from 'lucide-react';
import { Database } from '../services/db';
import { ChecklistTemplate, ChecklistQuestion, AuditType, UserRole } from '../types';

interface AuditChecklistsProps {
  currentRole: UserRole;
  addToast: (msg: string, type: 'success' | 'danger' | 'warning' | 'info') => void;
}

export default function AuditChecklists({ currentRole, addToast }: AuditChecklistsProps) {
  const [templates, setTemplates] = useState<ChecklistTemplate[]>([]);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingTemplate, setViewingTemplate] = useState<ChecklistTemplate | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<ChecklistTemplate | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [auditType, setAuditType] = useState<AuditType>('Financial');
  const [questions, setQuestions] = useState<ChecklistQuestion[]>([]);

  // Item form states
  const [newItemQuestion, setNewItemQuestion] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('');
  const [newItemRequired, setNewItemRequired] = useState(true);

  useEffect(() => {
    setTemplates(Database.getChecklistTemplates());
  }, []);

  const isAuditorOrAdmin = currentRole === 'Administrator' || currentRole === 'Internal Auditor';

  const openAddModal = () => {
    setEditingTemplate(null);
    setTitle('');
    setAuditType('Financial');
    setQuestions([]);
    setNewItemQuestion('');
    setNewItemCategory('Core Standards');
    setNewItemRequired(true);
    setIsModalOpen(true);
  };

  const openEditModal = (tpl: ChecklistTemplate) => {
    setEditingTemplate(tpl);
    setTitle(tpl.title);
    setAuditType(tpl.auditType);
    setQuestions(tpl.questions || []);
    setNewItemQuestion('');
    setNewItemCategory('Core Standards');
    setNewItemRequired(true);
    setIsModalOpen(true);
  };

  const addQuestionItem = () => {
    if (!newItemQuestion.trim()) {
      addToast('Please enter the standard question statement.', 'warning');
      return;
    }
    const newQ: ChecklistQuestion = {
      id: `q-${Date.now()}-${Math.floor(Math.random() * 100)}`,
      question: newItemQuestion.trim(),
      category: newItemCategory.trim() || 'General',
      required: newItemRequired
    };
    setQuestions([...questions, newQ]);
    setNewItemQuestion('');
  };

  const removeQuestionItem = (qId: string) => {
    setQuestions(questions.filter((q) => q.id !== qId));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      addToast('Please enter template title.', 'warning');
      return;
    }
    if (questions.length === 0) {
      addToast('Please add at least one standard checking question.', 'warning');
      return;
    }

    const newTpl: ChecklistTemplate = {
      id: editingTemplate ? editingTemplate.id : `tpl-${Date.now()}`,
      title: title.trim(),
      auditType,
      questions,
      dateCreated: editingTemplate ? editingTemplate.dateCreated : new Date().toISOString().split('T')[0]
    };

    Database.saveChecklistTemplate(newTpl);
    setTemplates(Database.getChecklistTemplates());
    setIsModalOpen(false);
    addToast(
      editingTemplate ? `Updated template ${title}` : `Created checklist template ${title}`,
      'success'
    );
  };

  const handleDeleteTemplate = (id: string) => {
    const success = Database.deleteChecklistTemplate(id);
    if (success) {
      setTemplates(Database.getChecklistTemplates());
      addToast('Template deleted.', 'success');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
        <div>
          <h1 className="text-xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">
            Checklist Standard Templates
          </h1>
          <p className="text-xs text-gray-400">Deploy checklists to align audits with corporate policy guidelines.</p>
        </div>
        {isAuditorOrAdmin && (
          <button
            onClick={openAddModal}
            className="mt-4 sm:mt-0 inline-flex items-center space-x-1.5 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Create Checklist Template</span>
          </button>
        )}
      </div>

      {/* Grid List of Checklist Templates */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {templates.map((tpl) => (
          <div
            key={tpl.id}
            className="rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[9px] font-bold bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded-xs uppercase">
                  {tpl.auditType}
                </span>
                <span className="text-[10px] text-gray-400">{tpl.questions?.length || 0} Standards</span>
              </div>
              <h3 className="font-bold text-sm text-gray-950 dark:text-gray-50 leading-snug line-clamp-2">
                {tpl.title}
              </h3>
              <p className="text-[10px] text-gray-400">Created: {tpl.dateCreated}</p>
            </div>

            <div className="border-t border-gray-50 dark:border-gray-800 mt-4 pt-3 flex items-center justify-end space-x-1">
              <button
                onClick={() => setViewingTemplate(tpl)}
                className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-950 transition-colors"
              >
                <Eye className="h-4.5 w-4.5" />
              </button>
              {isAuditorOrAdmin && (
                <>
                  <button
                    onClick={() => openEditModal(tpl)}
                    className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-blue-500 transition-colors"
                  >
                    <Edit className="h-4.5 w-4.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteTemplate(tpl.id)}
                    className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="h-4.5 w-4.5" />
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Preview Dialog */}
      {viewingTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl max-w-lg w-full p-6 border border-gray-100 dark:border-gray-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <div className="flex items-center space-x-2">
                <span className="font-mono text-[9px] bg-blue-100 dark:bg-blue-900 px-2 py-0.5 rounded-xs font-bold text-blue-700">
                  {viewingTemplate.auditType}
                </span>
                <h3 className="text-sm font-bold text-gray-950 dark:text-gray-50">{viewingTemplate.title}</h3>
              </div>
              <button
                onClick={() => setViewingTemplate(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="max-h-72 overflow-y-auto space-y-2.5">
              {viewingTemplate.questions?.map((q, idx) => (
                <div
                  key={q.id}
                  className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800/50 flex items-start space-x-3 text-xs"
                >
                  <div className="h-5 w-5 shrink-0 rounded-full bg-blue-50 dark:bg-blue-900 text-blue-600 font-bold flex items-center justify-center text-[10px]">
                    {idx + 1}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="font-semibold text-gray-800 dark:text-gray-200">{q.question}</p>
                    <div className="flex items-center space-x-2.5 text-[9px] text-gray-400 font-semibold">
                      <span className="uppercase">Cat: {q.category}</span>
                      <span>•</span>
                      <span>{q.required ? 'REQUIRED' : 'OPTIONAL'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Template Form Slider Drawer */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/35 backdrop-blur-xs">
          <div className="bg-white dark:bg-gray-900 h-full max-w-xl w-full p-6 border-l border-gray-100 dark:border-gray-800 shadow-2xl flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3 mb-4">
                <h2 className="text-sm font-extrabold text-gray-900 dark:text-gray-100 uppercase tracking-wider">
                  {editingTemplate ? 'Modify Checklist Template' : 'Deploy Checklist Template'}
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2 space-y-1">
                    <label htmlFor="chk-title" className="block text-[11px] font-bold text-gray-500 uppercase">Template Title *</label>
                    <input
                      id="chk-title"
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Server Cyber Security Standards Checklist"
                      className="block w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-1.5 text-xs focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="chk-type" className="block text-[11px] font-bold text-gray-500 uppercase">Audit Module</label>
                    <select
                      id="chk-type"
                      value={auditType}
                      onChange={(e) => setAuditType(e.target.value as any)}
                      className="block w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-1.5 text-xs focus:border-blue-500"
                    >
                      {(['Financial', 'Inventory', 'Cash', 'Bank', 'Sales', 'Purchasing', 'Warehouse', 'Operations', 'IT', 'Compliance', 'HR'] as AuditType[]).map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>

                {/* Sub-form to Add Standards Questions */}
                <div className="border border-gray-100 dark:border-gray-800 rounded-xl p-4 bg-gray-50 dark:bg-gray-950 space-y-3">
                  <h3 className="text-xs font-bold text-gray-800 dark:text-gray-300 uppercase tracking-wider">Add standard Question</h3>
                  <div className="space-y-1">
                    <label htmlFor="newItemQuestion" className="block text-[10px] text-gray-400 font-bold uppercase">Question Statement</label>
                    <input
                      id="newItemQuestion"
                      type="text"
                      value={newItemQuestion}
                      onChange={(e) => setNewItemQuestion(e.target.value)}
                      placeholder="e.g. Is the cash register discrepancy below $5 threshold?"
                      className="block w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-1.5 text-xs focus:border-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label htmlFor="newItemCategory" className="block text-[10px] text-gray-400 font-bold uppercase">Standard Category</label>
                      <input
                        id="newItemCategory"
                        type="text"
                        value={newItemCategory}
                        onChange={(e) => setNewItemCategory(e.target.value)}
                        placeholder="e.g. Physical Controls"
                        className="block w-full rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs focus:border-blue-500"
                      />
                    </div>
                    <div className="flex items-center space-x-2.5 pt-4">
                      <input
                        id="newItemRequired"
                        type="checkbox"
                        checked={newItemRequired}
                        onChange={() => setNewItemRequired(!newItemRequired)}
                        className="rounded-sm text-blue-600 h-4 w-4"
                      />
                      <label htmlFor="newItemRequired" className="text-xs text-gray-600 dark:text-gray-400 font-bold uppercase">Is Required check</label>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={addQuestionItem}
                    className="w-full bg-gray-800 hover:bg-gray-900 text-white font-semibold py-1.5 px-3 rounded-lg text-xs transition-colors"
                  >
                    Insert Standard Question
                  </button>
                </div>

                {/* Question List Preview */}
                <div className="space-y-2">
                  <span className="block text-[11px] font-bold text-gray-500 uppercase">Configured Standards ({questions.length})</span>
                  <div className="max-h-56 overflow-y-auto space-y-1.5 border border-gray-100 p-2 rounded-lg bg-white dark:bg-gray-900">
                    {questions.length === 0 ? (
                      <p className="py-8 text-center text-xs text-gray-400">No questions added yet.</p>
                    ) : (
                      questions.map((q, idx) => (
                        <div
                          key={idx}
                          className="flex items-start justify-between p-2.5 rounded-lg border border-gray-100 bg-gray-50/50 text-xs"
                        >
                          <div className="flex-1 space-y-0.5">
                            <p className="font-semibold text-gray-800"><span className="text-blue-500">#{idx+1}</span> {q.question}</p>
                            <span className="text-[9px] text-gray-400 font-semibold uppercase">Cat: {q.category}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeQuestionItem(q.id)}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </form>
            </div>

            <div className="border-t border-gray-100 dark:border-gray-800 pt-4 flex items-center justify-end space-x-2 mt-4">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
              >
                Save Template
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
