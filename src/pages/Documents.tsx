import React, { useState, useEffect } from 'react';
import { FileText, Search, Plus, Trash2, Download, Upload, FileLock, X } from 'lucide-react';
import { Database } from '../services/db';
import { Document, UserRole } from '../types';

interface DocumentsProps {
  currentRole: UserRole;
  addToast: (msg: string, type: 'success' | 'danger' | 'warning' | 'info') => void;
}

export default function Documents({ currentRole, addToast }: DocumentsProps) {
  const [docs, setDocs] = useState<Document[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [category, setCategory] = useState<'Policy' | 'Report' | 'Evidence' | 'Working Paper' | 'SOP' | 'Other'>('Evidence');
  const [version, setVersion] = useState('1.0');
  const [fileName, setFileName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    setDocs(Database.getDocuments());
  }, []);

  const isAuditorOrAdmin = currentRole === 'Administrator' || currentRole === 'Internal Auditor';

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !fileName.trim()) {
      addToast('Please input title and file name description.', 'warning');
      return;
    }

    const extension = fileName.includes('.') ? fileName.split('.').pop() || 'pdf' : 'pdf';

    const newDoc: Document = {
      id: `doc-${Date.now()}`,
      name: name.trim(),
      category,
      filePath: `/files/${fileName.trim()}`,
      fileType: extension,
      fileSize: '1.2 MB',
      version,
      uploadedDate: new Date().toISOString().split('T')[0],
      uploadedBy: currentRole,
      description: description.trim()
    };

    Database.saveDocument(newDoc);
    setDocs(Database.getDocuments());
    setIsModalOpen(false);
    addToast(`Successfully archived document ${name}`, 'success');
  };

  const handleDelete = (id: string) => {
    const success = Database.deleteDocument(id);
    if (success) {
      setDocs(Database.getDocuments());
      addToast('Document removed from cloud repository.', 'success');
    }
  };

  const filteredDocs = docs.filter((d) => {
    const matchesSearch =
      d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.filePath?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = categoryFilter === 'All' || d.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
        <div>
          <h1 className="text-xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">
            Compliance Document Repository
          </h1>
          <p className="text-xs text-gray-400">Upload compliance plans, evidence spreadsheets, policy manuals, and certification records.</p>
        </div>
        {isAuditorOrAdmin && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-4 sm:mt-0 inline-flex items-center space-x-1.5 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition-colors"
          >
            <Upload className="h-4 w-4" />
            <span>Upload Document</span>
          </button>
        )}
      </div>

      {/* Filter panel */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
        <div className="relative w-full sm:max-w-xs">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            id="doc-search-bar"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search document names, files, descriptions..."
            className="block w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/40 py-2 pl-9 pr-3 text-xs text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:bg-white focus:outline-hidden"
          />
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-gray-400">Category:</span>
          {(['All', 'Policy', 'Evidence', 'Report', 'SOP'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                categoryFilter === cat
                  ? 'bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-semibold'
                  : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Document Grid Cards */}
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {filteredDocs.length === 0 ? (
          <div className="col-span-full py-16 text-center text-xs text-gray-400 flex flex-col items-center justify-center space-y-2">
            <FileLock className="h-10 w-10 text-gray-300" />
            <p className="font-semibold text-gray-500">No matching documents found</p>
          </div>
        ) : (
          filteredDocs.map((doc) => (
            <div
              key={doc.id}
              className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-4 rounded-xl shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[9px] font-bold bg-gray-100 dark:bg-gray-800 text-gray-500 px-1.5 py-0.5 rounded-sm uppercase">
                    {doc.category}
                  </span>
                  <span className="text-[9px] font-mono text-gray-400">V{doc.version}</span>
                </div>

                <div className="flex items-start space-x-2">
                  <FileText className="h-8 w-8 text-blue-500 shrink-0" />
                  <div className="text-xs">
                    <h3 className="font-bold text-gray-850 dark:text-gray-100 leading-snug line-clamp-2" title={doc.name}>
                      {doc.name}
                    </h3>
                    <p className="font-mono text-[10px] text-gray-400 truncate max-w-[150px] mt-0.5">{doc.filePath?.split('/').pop() || 'file.pdf'}</p>
                  </div>
                </div>

                {doc.description && (
                  <p className="text-[10px] text-gray-400 italic bg-gray-50/50 dark:bg-gray-800/30 p-2 rounded border leading-relaxed">
                    "{doc.description}"
                  </p>
                )}
              </div>

              <div className="border-t border-gray-50 dark:border-gray-800 mt-4 pt-3 flex items-center justify-between text-[10px] text-gray-400 font-semibold">
                <span>By: {doc.uploadedBy}</span>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => addToast(`File download simulation for ${doc.filePath} triggered.`, 'info')}
                    className="p-1 rounded-md text-gray-400 hover:bg-gray-100 hover:text-blue-500"
                    title="Download document file"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                  {isAuditorOrAdmin && (
                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="p-1 rounded-md text-gray-400 hover:bg-gray-100 hover:text-red-500"
                      title="Delete document reference"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Upload document Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl max-w-sm w-full p-6 border border-gray-100 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider">Archive New Document</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400"><X className="h-4 w-4" /></button>
            </div>

            <form onSubmit={handleUpload} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label htmlFor="doc-name-input" className="block text-[11px] font-bold text-gray-500 uppercase">Document Label / Title *</label>
                <input
                  id="doc-name-input"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. FY2026 Procurement Audited Sheets"
                  className="block w-full border px-3 py-1.5 rounded-lg text-xs focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label htmlFor="doc-category-selector" className="block text-[11px] font-bold text-gray-500 uppercase">Category</label>
                  <select
                    id="doc-category-selector"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="block w-full border px-3 py-1.5 rounded-lg text-xs"
                  >
                    <option value="Policy">Policy Manual</option>
                    <option value="Evidence">Evidence Sheet</option>
                    <option value="Report">Official Report</option>
                    <option value="Working Paper">Working Paper</option>
                    <option value="SOP">SOP Manual</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label htmlFor="doc-ver-input" className="block text-[11px] font-bold text-gray-500 uppercase">Document Version</label>
                  <input
                    id="doc-ver-input"
                    type="text"
                    required
                    value={version}
                    onChange={(e) => setVersion(e.target.value)}
                    placeholder="1.0"
                    className="block w-full border px-3 py-1.5 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="doc-filename-input" className="block text-[11px] font-bold text-gray-500 uppercase">File Name (including extension) *</label>
                <input
                  id="doc-filename-input"
                  type="text"
                  required
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  placeholder="e.g. audit_procurement_V1_signed.xlsx"
                  className="block w-full border px-3 py-1.5 rounded-lg text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="doc-desc-input" className="block text-[11px] font-bold text-gray-500 uppercase">Description</label>
                <input
                  id="doc-desc-input"
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Optional explanatory detail..."
                  className="block w-full border px-3 py-1.5 rounded-lg text-xs"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold"
                >
                  Archive Document
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
