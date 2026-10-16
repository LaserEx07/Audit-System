import React, { useState, useEffect } from 'react';
import { Package, Landmark, Receipt, FileText, Upload, RefreshCw, CheckCircle2, AlertTriangle, ShieldCheck, Coins, Edit, Trash2 } from 'lucide-react';
import { UserRole } from '../types';

interface SpecialistAuditsProps {
  addToast: (msg: string, type: 'success' | 'danger' | 'warning' | 'info') => void;
  currentRole?: UserRole;
}

export default function SpecialistAudits({ addToast, currentRole }: SpecialistAuditsProps) {
  const [activeTab, setActiveTab] = useState<'inventory' | 'cash' | 'reconciliation' | 'collection'>('inventory');

  // Inventory states
  const [skuCode, setSkuCode] = useState('SKU-2026-X8');
  const [bookQty, setBookQty] = useState(150);
  const [physicalQty, setPhysicalQty] = useState(148);
  const [discrepancy, setDiscrepancy] = useState(-2);
  const [inventoryLogs, setInventoryLogs] = useState<any[]>([]);

  // Cash Safe states
  const [safeTarget, setSafeTarget] = useState(5000);
  const [safePhysicalCount, setSafePhysicalCount] = useState(4980);
  const [cashLogs, setCashLogs] = useState<any[]>([]);

  // Warehouse Collection states
  const [drNumber, setDrNumber] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [address, setAddress] = useState('');
  const [contact, setContact] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [terms, setTerms] = useState('COD');
  const [amount, setAmount] = useState<number | ''>('');
  const [status, setStatus] = useState('Delivered');
  const [paymentReference, setPaymentReference] = useState('');
  const [remarks, setRemarks] = useState('');
  const [paidDate, setPaidDate] = useState('');
  const [attachedDrName, setAttachedDrName] = useState('');
  
  const [editingDr, setEditingDr] = useState<string | null>(null);

  const [collectionLogs, setCollectionLogs] = useState<any[]>([]);

  // OCR Bank statement reconciliation states
  const [ocrFileName, setOcrFileName] = useState('');
  const [isOcrProcessing, setIsOcrProcessing] = useState(false);
  const [parsedStatement, setParsedStatement] = useState<any | null>(null);

  // Recalculate inventory variance
  useEffect(() => {
    setDiscrepancy(physicalQty - bookQty);
  }, [bookQty, physicalQty]);

  const handleLogInventory = (e: React.FormEvent) => {
    e.preventDefault();
    const variance = physicalQty - bookQty;
    const status = variance === 0 ? 'Balanced' : variance < 0 ? 'Shrinkage Detected' : 'Surplus Logged';
    const newLog = {
      sku: skuCode,
      book: bookQty,
      physical: physicalQty,
      var: variance,
      status,
      date: new Date().toISOString().split('T')[0]
    };
    setInventoryLogs([newLog, ...inventoryLogs]);
    addToast(`Inventory stocktake reconciled for SKU ${skuCode}`, 'success');
  };

  const handleLogCashCount = (e: React.FormEvent) => {
    e.preventDefault();
    const variance = safePhysicalCount - safeTarget;
    const status = variance === 0 ? 'Passed' : 'Variance Flagged';
    const newLog = {
      location: 'Store Safe #2',
      theoretical: safeTarget,
      actual: safePhysicalCount,
      var: variance,
      date: new Date().toISOString().split('T')[0],
      status
    };
    setCashLogs([newLog, ...cashLogs]);
    addToast('Vault Safe reconciliation logged successfully', 'success');
  };

  const handleLogCollection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!drNumber || !customerName || amount === '') {
      addToast('Please fill in all required fields.', 'danger');
      return;
    }
    const logData = {
      dr: drNumber,
      customer: customerName,
      address: address,
      contact: contact,
      date: date,
      terms: terms,
      amount: Number(amount),
      status: status,
      reference: paymentReference || (status === 'Paid' ? 'Cash' : 'N/A'),
      remarks: remarks,
      paidDate: status === 'Paid' ? (paidDate || new Date().toISOString().split('T')[0]) : '',
      attachedDr: attachedDrName || 'N/A'
    };

    if (editingDr !== null) {
      // Update existing record
      const updatedLogs = collectionLogs.map(log => log.dr === editingDr ? logData : log);
      setCollectionLogs(updatedLogs);
      addToast(`Warehouse Collection log updated for DR ${drNumber}`, 'success');
      setEditingDr(null);
    } else {
      // Prevent duplicate DR when creating new
      if (collectionLogs.some(log => log.dr === drNumber)) {
        addToast(`A collection record with DR Number ${drNumber} already exists.`, 'warning');
        return;
      }
      // Add new record
      setCollectionLogs([logData, ...collectionLogs]);
      addToast(`Warehouse Collection log added for DR ${drNumber}`, 'success');
    }

    // Reset form fields
    setDrNumber('');
    setCustomerName('');
    setAddress('');
    setContact('');
    setDate(new Date().toISOString().split('T')[0]);
    setTerms('COD');
    setAmount('');
    setStatus('Delivered');
    setPaymentReference('');
    setRemarks('');
    setPaidDate('');
    setAttachedDrName('');
  };

  const handleEdit = (log: any) => {
    setEditingDr(log.dr);
    setDrNumber(log.dr);
    setCustomerName(log.customer);
    setAddress(log.address);
    setContact(log.contact);
    setDate(log.date);
    setTerms(log.terms);
    setAmount(log.amount);
    setStatus(log.status);
    setPaymentReference(log.reference || '');
    setRemarks(log.remarks);
    setPaidDate(log.paidDate || '');
    setAttachedDrName(log.attachedDr === 'N/A' ? '' : log.attachedDr);
    addToast(`Editing collection record: DR ${log.dr}`, 'info');
  };

  const handleCancelEdit = () => {
    setEditingDr(null);
    setDrNumber('');
    setCustomerName('');
    setAddress('');
    setContact('');
    setDate(new Date().toISOString().split('T')[0]);
    setTerms('COD');
    setAmount('');
    setStatus('Delivered');
    setPaymentReference('');
    setRemarks('');
    setPaidDate('');
    setAttachedDrName('');
  };

  const handleDelete = (dr: string) => {
    if (window.confirm(`Are you sure you want to delete collection record DR ${dr}?`)) {
      setCollectionLogs(collectionLogs.filter(log => log.dr !== dr));
      addToast(`Deleted collection record DR ${dr}`, 'success');
      if (editingDr === dr) {
        handleCancelEdit();
      }
    }
  };

  const handleAttachedDrChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachedDrName(file.name);
    }
  };

  const handleExportToExcel = () => {
    if (collectionLogs.length === 0) {
      addToast('No collection records to export.', 'warning');
      return;
    }

    let html = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8">
        <!--[if gte mso 9]>
        <xml>
          <x:ExcelWorkbook>
            <x:ExcelWorksheets>
              <x:ExcelWorksheet>
                <x:Name>Warehouse Collections</x:Name>
                <x:WorksheetOptions>
                  <x:DisplayGridlines/>
                </x:WorksheetOptions>
              </x:ExcelWorksheet>
            </x:ExcelWorksheets>
          </x:ExcelWorkbook>
        </xml>
        <![endif]-->
        <style>
          table { border-collapse: collapse; font-family: Arial, sans-serif; font-size: 11px; }
          th { background-color: #1e3a8a; color: #ffffff; font-weight: bold; border: 1px solid #cbd5e1; padding: 8px; text-align: left; }
          td { border: 1px solid #cbd5e1; padding: 6px 8px; }
          .status-delivered { background-color: #dbeafe; color: #1e40af; font-weight: bold; }
          .status-paid { background-color: #dcfce7; color: #15803d; font-weight: bold; }
          .status-pending { background-color: #fef3c7; color: #b45309; font-weight: bold; }
          .amount { font-family: 'Courier New', monospace; text-align: right; }
        </style>
      </head>
      <body>
        <h3>Warehouse Collections Audit Report</h3>
        <p>Exported Date: ${new Date().toLocaleDateString()}</p>
        <table>
          <thead>
            <tr>
              <th>DR Number</th>
              <th>Customer Name</th>
              <th>Address</th>
              <th>Contact</th>
              <th>Date</th>
              <th>Terms</th>
              <th>Amount (PHP)</th>
              <th>Status</th>
              <th>Payment Reference</th>
              <th>Remarks</th>
              <th>Date Paid (Log Record)</th>
              <th>Attached DR</th>
            </tr>
          </thead>
          <tbody>
    `;

    collectionLogs.forEach(log => {
      let statusClass = 'status-delivered';
      if (log.status === 'Paid') statusClass = 'status-paid';
      if (log.status === 'Pending') statusClass = 'status-pending';

      html += `
        <tr>
          <td style="font-weight: bold; mso-number-format:'\\@';">${log.dr}</td>
          <td>${log.customer}</td>
          <td>${log.address || '-'}</td>
          <td style="mso-number-format:'\\@';">${log.contact || '-'}</td>
          <td>${log.date}</td>
          <td>${log.terms}</td>
          <td class="amount">₱${log.amount.toFixed(2)}</td>
          <td class="${statusClass}">${log.status}</td>
          <td>${log.reference || '-'}</td>
          <td>${log.remarks || '-'}</td>
          <td>${log.paidDate || 'Unpaid'}</td>
          <td>${log.attachedDr || 'None'}</td>
        </tr>
      `;
    });

    html += `
          </tbody>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Warehouse_Collections_${new Date().toISOString().split('T')[0]}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('Warehouse Collections exported to Excel successfully!', 'success');
  };

  // Simulated Intelligent OCR parser
  const handleOcrFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setOcrFileName(file.name);
    setIsOcrProcessing(true);

    setTimeout(() => {
      setIsOcrProcessing(false);
      // Simulate highly advanced compliant OCR parsing rules
      setParsedStatement({
        invoiceNum: `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        vendor: 'Canyon Logistics LLC',
        ocrTotalValue: '$1,480.00',
        bankLedgerDisbursement: '$1,480.00',
        variance: '$0.00',
        reconciliationStatus: 'Fully Reconciled (Auto-matched via OCR)',
        parsedLines: [
          { item: 'Bulk Shipping Pallets Container', amount: '$1,200.00' },
          { item: 'Inland Customs Clearances Fee', amount: '$280.00' }
        ]
      });
      addToast('Intelligent OCR statement verification parsed successfully!', 'success');
    }, 2500);
  };

  return (
    <div className="space-y-6">
      <div className="border-b pb-4">
        <h1 className="text-xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">
          Specialist Audit Toolset
        </h1>
        <p className="text-xs text-gray-400 font-medium">Verify structural registries including physical vaults, cash boxes, warehouse collections, and automated OCR invoices.</p>
      </div>

      {/* Specialist Module Tabs */}
      <div className="flex border-b border-gray-150 space-x-1">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg border-b-2 transition-all ${
            activeTab === 'inventory'
              ? 'border-blue-600 text-blue-600 bg-blue-50/20'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <Package className="h-4 w-4" />
          <span>Warehouse Stock Count</span>
        </button>
        <button
          onClick={() => setActiveTab('cash')}
          className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg border-b-2 transition-all ${
            activeTab === 'cash'
              ? 'border-blue-600 text-blue-600 bg-blue-50/20'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <Landmark className="h-4 w-4" />
          <span>Cash Drawer Count</span>
        </button>
        <button
          onClick={() => setActiveTab('reconciliation')}
          className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg border-b-2 transition-all ${
            activeTab === 'reconciliation'
              ? 'border-blue-600 text-blue-600 bg-blue-50/20'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <Receipt className="h-4 w-4" />
          <span>Bank & Purchasing OCR Match</span>
        </button>
        <button
          onClick={() => setActiveTab('collection')}
          className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg border-b-2 transition-all ${
            activeTab === 'collection'
              ? 'border-blue-600 text-blue-600 bg-blue-50/20'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <Coins className="h-4 w-4" />
          <span>Warehouse Collections</span>
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'inventory' && (
        <div className="grid gap-6 md:grid-cols-12">
          {/* Stock count form */}
          <div className="md:col-span-4 bg-white dark:bg-gray-900 p-5 border border-gray-100 rounded-xl space-y-4">
            <h2 className="text-xs font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider">Reconcile Stock SKU</h2>
            <form onSubmit={handleLogInventory} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label htmlFor="skuCode" className="block text-[11px] font-bold text-gray-400 uppercase">SKU Code Ref</label>
                <input id="skuCode" type="text" required value={skuCode} onChange={(e) => setSkuCode(e.target.value)} className="block w-full border px-3 py-1.5 rounded-lg text-xs" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label htmlFor="bookQty" className="block text-[11px] font-bold text-gray-400 uppercase">Book Quantity</label>
                  <input id="bookQty" type="number" required value={bookQty} onChange={(e) => setBookQty(Number(e.target.value))} className="block w-full border px-3 py-1.5 rounded-lg text-xs" />
                </div>
                <div className="space-y-1">
                  <label htmlFor="physicalQty" className="block text-[11px] font-bold text-gray-400 uppercase">Physical Count</label>
                  <input id="physicalQty" type="number" required value={physicalQty} onChange={(e) => setPhysicalQty(Number(e.target.value))} className="block w-full border px-3 py-1.5 rounded-lg text-xs" />
                </div>
              </div>
              <div className="p-3.5 rounded-lg bg-gray-50 border flex justify-between items-center text-xs">
                <span className="font-semibold text-gray-500">Calculated Variance:</span>
                <span className={`font-mono font-bold text-sm ${discrepancy < 0 ? 'text-red-600' : discrepancy > 0 ? 'text-green-600' : 'text-gray-700'}`}>
                  {discrepancy} units
                </span>
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white hover:bg-blue-700 font-bold py-2 rounded-lg text-xs">
                Log Stocktake Count
              </button>
            </form>
          </div>

          {/* Stock historical counts */}
          <div className="md:col-span-8 bg-white dark:bg-gray-900 p-5 border border-gray-100 rounded-xl space-y-4">
            <h2 className="text-xs font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider">Reconciled Stock Logs</h2>
            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b text-gray-400 bg-gray-50/50">
                    <th className="p-2 text-[10px] font-bold uppercase">SKU Code</th>
                    <th className="p-2 text-[10px] font-bold uppercase">Book Qty</th>
                    <th className="p-2 text-[10px] font-bold uppercase">Physical Count</th>
                    <th className="p-2 text-[10px] font-bold uppercase">Variance</th>
                    <th className="p-2 text-[10px] font-bold uppercase">Status</th>
                    <th className="p-2 text-[10px] font-bold uppercase">Reconcile Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-xs">
                  {inventoryLogs.map((log, i) => (
                    <tr key={i}>
                      <td className="p-2 font-mono font-bold text-gray-800">{log.sku}</td>
                      <td className="p-2 text-gray-500">{log.book}</td>
                      <td className="p-2 text-gray-500">{log.physical}</td>
                      <td className="p-2 font-bold font-mono text-gray-800">{log.var}</td>
                      <td className="p-2">
                        <span className={`inline-block px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-sm ${log.status === 'Balanced' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                          {log.status}
                        </span>
                      </td>
                      <td className="p-2 text-gray-400">{log.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'cash' && (
        <div className="grid gap-6 md:grid-cols-12">
          {/* Safe counting Reconciliation form */}
          <div className="md:col-span-4 bg-white dark:bg-gray-900 p-5 border border-gray-100 rounded-xl space-y-4">
            <h2 className="text-xs font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider">Safe Vault Cash Reconciliation</h2>
            <form onSubmit={handleLogCashCount} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label htmlFor="safeTarget" className="block text-[11px] font-bold text-gray-400 uppercase">Theoretical Vault Safe Balance ($)</label>
                <input id="safeTarget" type="number" required value={safeTarget} onChange={(e) => setSafeTarget(Number(e.target.value))} className="block w-full border px-3 py-1.5 rounded-lg text-xs font-mono" />
              </div>
              <div className="space-y-1">
                <label htmlFor="safePhysicalCount" className="block text-[11px] font-bold text-gray-400 uppercase">Physical cash Audit Count ($)</label>
                <input id="safePhysicalCount" type="number" required value={safePhysicalCount} onChange={(e) => setSafePhysicalCount(Number(e.target.value))} className="block w-full border px-3 py-1.5 rounded-lg text-xs font-mono" />
              </div>
              <div className="p-3 rounded-lg bg-gray-50 border flex justify-between items-center text-xs">
                <span className="font-semibold text-gray-500">Variance deviation:</span>
                <span className={`font-mono font-bold text-sm ${safePhysicalCount - safeTarget < 0 ? 'text-red-600' : 'text-gray-700'}`}>
                  ${(safePhysicalCount - safeTarget).toFixed(2)}
                </span>
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white hover:bg-blue-700 font-bold py-2 rounded-lg text-xs">
                Log Vault Count Verification
              </button>
            </form>
          </div>

          {/* Cash counts registry */}
          <div className="md:col-span-8 bg-white dark:bg-gray-900 p-5 border border-gray-100 rounded-xl space-y-4">
            <h2 className="text-xs font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider">Cash Audit Logs</h2>
            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b text-gray-400 bg-gray-50/50">
                    <th className="p-2 text-[10px] font-bold uppercase">Location</th>
                    <th className="p-2 text-[10px] font-bold uppercase">Theoretical Balance</th>
                    <th className="p-2 text-[10px] font-bold uppercase">Actual audited</th>
                    <th className="p-2 text-[10px] font-bold uppercase">Variance</th>
                    <th className="p-2 text-[10px] font-bold uppercase">Audit status</th>
                    <th className="p-2 text-[10px] font-bold uppercase">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-xs">
                  {cashLogs.map((log, i) => (
                    <tr key={i}>
                      <td className="p-2 font-semibold text-gray-800">{log.location}</td>
                      <td className="p-2 font-mono text-gray-500">${log.theoretical.toFixed(2)}</td>
                      <td className="p-2 font-mono text-gray-500">${log.actual.toFixed(2)}</td>
                      <td className={`p-2 font-bold font-mono ${log.var < 0 ? 'text-red-500' : 'text-gray-800'}`}>${log.var.toFixed(2)}</td>
                      <td className="p-2">
                        <span className={`inline-block px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-sm ${log.status === 'Passed' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                          {log.status}
                        </span>
                      </td>
                      <td className="p-2 text-gray-400">{log.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'reconciliation' && (
        <div className="grid gap-6 md:grid-cols-12">
          {/* Simulated OCR processing panel */}
          <div className="md:col-span-5 bg-white dark:bg-gray-900 p-6 border border-gray-150 rounded-xl space-y-5">
            <div className="space-y-1">
              <h2 className="text-xs font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider">Bank invoice & OCR scanning</h2>
              <p className="text-[10px] text-gray-400">Reconcile purchasing disbursement invoices with bank statements using simulated OCR parser.</p>
            </div>

            <div className="border-2 border-dashed border-gray-200/80 rounded-xl p-6 bg-gray-50/50 flex flex-col items-center justify-center text-center space-y-3 relative overflow-hidden">
              <Upload className="h-10 w-10 text-gray-300" />
              <div className="text-xs">
                <p className="font-bold text-gray-700">Upload compliant PDF bank statement</p>
                <p className="text-[10px] text-gray-400 mt-1">Accept PDF, JPEG invoice standard images</p>
              </div>
              <input
                id="ocr-file-upload"
                type="file"
                accept="image/*,.pdf"
                onChange={handleOcrFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>

            {ocrFileName && (
              <div className="p-3 bg-blue-50/30 border border-blue-100 rounded-lg flex items-center justify-between text-xs">
                <span className="font-mono text-gray-600 truncate max-w-xs">{ocrFileName}</span>
                {isOcrProcessing ? (
                  <RefreshCw className="h-4.5 w-4.5 animate-spin text-blue-600" />
                ) : (
                  <CheckCircle2 className="h-4.5 w-4.5 text-green-600" />
                )}
              </div>
            )}
          </div>

          {/* OCR parse results */}
          <div className="md:col-span-7 bg-white dark:bg-gray-900 p-6 border border-gray-150 rounded-xl space-y-4">
            <h2 className="text-xs font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider">Statement OCR Parsing Report</h2>

            {!parsedStatement ? (
              <div className="py-16 text-center text-xs text-gray-400 flex flex-col items-center justify-center space-y-1">
                <FileText className="h-8 w-8 text-gray-300" />
                <p>Awaiting invoice scanning execution.</p>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-4 bg-gray-50/60 p-4 rounded-xl border">
                  <div>
                    <span className="block text-[9px] font-bold text-gray-400 uppercase">Vendor matched</span>
                    <p className="font-bold text-gray-800 text-sm">{parsedStatement.vendor}</p>
                  </div>
                  <div>
                    <span className="block text-[9px] font-bold text-gray-400 uppercase">Matched invoice ref</span>
                    <p className="font-mono font-bold text-blue-600">{parsedStatement.invoiceNum}</p>
                  </div>
                  <div className="pt-2">
                    <span className="block text-[9px] font-bold text-gray-400 uppercase">Statement Total</span>
                    <p className="font-mono font-bold text-gray-800">{parsedStatement.ocrTotalValue}</p>
                  </div>
                  <div className="pt-2">
                    <span className="block text-[9px] font-bold text-gray-400 uppercase">General Ledger Code matching</span>
                    <p className="font-mono font-bold text-gray-800">{parsedStatement.bankLedgerDisbursement}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="block text-[10px] font-bold text-gray-400 uppercase">OCR Itemized Line Extractions</span>
                  <div className="divide-y border border-gray-100 rounded-lg overflow-hidden bg-white">
                    {parsedStatement.parsedLines.map((line: any, i: number) => (
                      <div key={i} className="flex justify-between p-2.5 text-xs">
                        <span className="text-gray-600">{line.item}</span>
                        <span className="font-mono font-semibold">{line.amount}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-3.5 rounded-lg bg-green-50 border border-green-100 flex items-center space-x-2 text-green-700">
                  <ShieldCheck className="h-5 w-5 shrink-0" />
                  <div>
                    <p className="font-bold text-xs">{parsedStatement.reconciliationStatus}</p>
                    <p className="text-[10px] text-green-600">Deviation within legal limits (matched signature validation: verified)</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'collection' && (() => {
        const isAdmin = currentRole === 'Administrator';
        return (
          <div className="grid gap-6 md:grid-cols-12">
            {/* Collection Logging Form (Only visible to Admin) */}
            {isAdmin && (
              <div className="md:col-span-4 bg-white dark:bg-gray-900 p-5 border border-gray-100 dark:border-gray-800 rounded-xl space-y-4">
                <div className="flex justify-between items-center border-b pb-2 dark:border-gray-800">
                  <h2 className="text-xs font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider">
                    {editingDr ? 'Edit Collection' : 'Log Warehouse Collection'}
                  </h2>
                  {editingDr && (
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="text-[10px] text-red-500 hover:underline font-semibold cursor-pointer"
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>
                {editingDr && (
                  <div className="text-[10px] text-amber-600 bg-amber-50 dark:bg-amber-950/20 dark:text-amber-400 p-1.5 rounded font-mono">
                    Editing DR: {editingDr}
                  </div>
                )}
                <form onSubmit={handleLogCollection} className="space-y-3.5 text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label htmlFor="drNumber" className="block text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase">DR Number</label>
                      <input
                        id="drNumber"
                        type="text"
                        required
                        disabled={editingDr !== null}
                        placeholder="e.g. DR-2026-001"
                        value={drNumber}
                        onChange={(e) => setDrNumber(e.target.value)}
                        className="block w-full border dark:border-gray-700 dark:bg-gray-800 px-3 py-1.5 rounded-lg text-xs disabled:opacity-60"
                      />
                    </div>
                    <div className="space-y-1">
                      <label htmlFor="customerName" className="block text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase">Customer Name</label>
                      <input
                        id="customerName"
                        type="text"
                        required
                        placeholder="e.g. Acme Corp"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="block w-full border dark:border-gray-700 dark:bg-gray-800 px-3 py-1.5 rounded-lg text-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="address" className="block text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase">Address</label>
                    <input
                      id="address"
                      type="text"
                      placeholder="e.g. Industrial Zone, Manila"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="block w-full border dark:border-gray-700 dark:bg-gray-800 px-3 py-1.5 rounded-lg text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label htmlFor="contact" className="block text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase">Contact</label>
                      <input
                        id="contact"
                        type="text"
                        placeholder="e.g. +63 917..."
                        value={contact}
                        onChange={(e) => setContact(e.target.value)}
                        className="block w-full border dark:border-gray-700 dark:bg-gray-800 px-3 py-1.5 rounded-lg text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label htmlFor="drDate" className="block text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase">Date</label>
                      <input
                        id="drDate"
                        type="date"
                        required
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="block w-full border dark:border-gray-700 dark:bg-gray-800 px-3 py-1.5 rounded-lg text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label htmlFor="terms" className="block text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase">Terms</label>
                      <select
                        id="terms"
                        value={terms}
                        onChange={(e) => setTerms(e.target.value)}
                        className="block w-full border dark:border-gray-700 dark:bg-gray-800 px-3 py-1.5 rounded-lg text-xs"
                      >
                        <option value="COD">COD</option>
                        <option value="15 days terms">15 days terms</option>
                        <option value="30 days terms">30 days terms</option>
                        <option value="warehouse sales">warehouse sales</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label htmlFor="amount" className="block text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase">Amount (₱)</label>
                      <input
                        id="amount"
                        type="number"
                        required
                        step="0.01"
                        placeholder="e.g. 5000"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                        className="block w-full border dark:border-gray-700 dark:bg-gray-800 px-3 py-1.5 rounded-lg text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label htmlFor="status" className="block text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase">Status</label>
                      <select
                        id="status"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="block w-full border dark:border-gray-700 dark:bg-gray-800 px-3 py-1.5 rounded-lg text-xs"
                      >
                        <option value="Delivered">Delivered</option>
                        <option value="Pending">Pending</option>
                        <option value="Paid">Paid</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label htmlFor="paidDate" className="block text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase">Paid Date (Log)</label>
                      <input
                        id="paidDate"
                        type="date"
                        disabled={status !== 'Paid'}
                        value={paidDate}
                        onChange={(e) => setPaidDate(e.target.value)}
                        className="block w-full border dark:border-gray-700 dark:bg-gray-800 px-3 py-1.5 rounded-lg text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="paymentReference" className="block text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase">Payment Reference</label>
                    <input
                      id="paymentReference"
                      type="text"
                      placeholder="e.g. Cash, GCash Ref: 288102, Bank: BDO-10492"
                      value={paymentReference}
                      onChange={(e) => setPaymentReference(e.target.value)}
                      className="block w-full border dark:border-gray-700 dark:bg-gray-800 px-3 py-1.5 rounded-lg text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase">Attached DR</label>
                    <div className="border border-dashed dark:border-gray-700 rounded-lg p-2 bg-gray-50/50 dark:bg-gray-850 flex items-center justify-between text-[11px] relative overflow-hidden">
                      <span className="text-gray-500 truncate max-w-[150px]">{attachedDrName || 'No DR attached'}</span>
                      <button type="button" className="text-blue-600 font-bold hover:underline">Browse</button>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={handleAttachedDrChange}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="remarks" className="block text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase">Remarks</label>
                    <textarea
                      id="remarks"
                      placeholder="Additional delivery or collection notes..."
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      className="block w-full border dark:border-gray-700 dark:bg-gray-800 px-3 py-1.5 rounded-lg text-xs h-16"
                    />
                  </div>
                  <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg text-xs transition-colors cursor-pointer">
                    {editingDr ? 'Update Record' : 'Log Collection Record'}
                  </button>
                </form>
              </div>
            )}

            {/* Collection Log Table */}
            <div className={isAdmin ? "md:col-span-8 bg-white dark:bg-gray-900 p-5 border border-gray-100 dark:border-gray-800 rounded-xl space-y-4" : "md:col-span-12 bg-white dark:bg-gray-900 p-5 border border-gray-100 dark:border-gray-800 rounded-xl space-y-4"}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <h2 className="text-xs font-bold text-gray-900 dark:text-gray-100 uppercase tracking-wider">Warehouse Collections Registry</h2>
                <button
                  onClick={handleExportToExcel}
                  className="inline-flex items-center space-x-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold transition-colors shadow-sm self-start sm:self-auto cursor-pointer"
                >
                  <FileText className="h-3.5 w-3.5" />
                  <span>Export to Excel</span>
                </button>
              </div>
              <div className="overflow-x-auto text-xs">
                <table className="w-full text-left min-w-[1050px]">
                  <thead>
                    <tr className="border-b dark:border-gray-800 text-gray-400 bg-gray-50/50 dark:bg-gray-800/30">
                      <th className="p-2 text-[10px] font-bold uppercase">DR Number</th>
                      <th className="p-2 text-[10px] font-bold uppercase">Customer Name</th>
                      <th className="p-2 text-[10px] font-bold uppercase">Address</th>
                      <th className="p-2 text-[10px] font-bold uppercase">Contact</th>
                      <th className="p-2 text-[10px] font-bold uppercase">Date</th>
                      <th className="p-2 text-[10px] font-bold uppercase">Terms</th>
                      <th className="p-2 text-[10px] font-bold uppercase">Amount</th>
                      <th className="p-2 text-[10px] font-bold uppercase">Status</th>
                      <th className="p-2 text-[10px] font-bold uppercase">Payment Reference</th>
                      <th className="p-2 text-[10px] font-bold uppercase">Remarks</th>
                      <th className="p-2 text-[10px] font-bold uppercase">Log Record (Paid Date)</th>
                      <th className="p-2 text-[10px] font-bold uppercase">Attached DR</th>
                      {isAdmin && <th className="p-2 text-[10px] font-bold uppercase text-center">Actions</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y dark:divide-gray-850 text-xs">
                    {collectionLogs.map((log, i) => (
                      <tr key={i} className="dark:hover:bg-gray-850/20">
                        <td className="p-2 font-mono font-bold text-gray-800 dark:text-gray-200">{log.dr}</td>
                        <td className="p-2 font-semibold text-gray-700 dark:text-gray-300">{log.customer}</td>
                        <td className="p-2 text-gray-500 dark:text-gray-400 max-w-[120px] truncate" title={log.address}>{log.address || '-'}</td>
                        <td className="p-2 text-gray-500 dark:text-gray-400 font-mono">{log.contact || '-'}</td>
                        <td className="p-2 text-gray-400 dark:text-gray-500 font-mono">{log.date}</td>
                        <td className="p-2 text-gray-500 dark:text-gray-400">
                          <span className="capitalize">{log.terms}</span>
                        </td>
                        <td className="p-2 font-mono font-bold text-gray-800 dark:text-gray-200">₱{log.amount.toFixed(2)}</td>
                        <td className="p-2">
                          <span className={`inline-block px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-sm ${
                            log.status === 'Delivered'
                              ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400'
                              : log.status === 'Paid'
                              ? 'bg-green-50 text-green-600 dark:bg-green-950/30 dark:text-green-400'
                              : 'bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400'
                          }`}>
                            {log.status}
                          </span>
                        </td>
                        <td className="p-2 text-gray-600 dark:text-gray-300 font-mono max-w-[120px] truncate" title={log.reference}>{log.reference || '-'}</td>
                        <td className="p-2 text-gray-500 dark:text-gray-400 max-w-[100px] truncate" title={log.remarks}>{log.remarks || '-'}</td>
                        <td className="p-2 font-mono text-gray-700 dark:text-gray-300">
                          {log.paidDate ? log.paidDate : <span className="text-gray-400 dark:text-gray-600 font-normal">Unpaid</span>}
                        </td>
                        <td className="p-2 font-mono text-blue-600 dark:text-blue-400 max-w-[100px] truncate">
                          {log.attachedDr && log.attachedDr !== 'N/A' ? (
                            <button
                              onClick={() => addToast(`Opening attachment: ${log.attachedDr}`, 'info')}
                              className="hover:underline text-left truncate w-full cursor-pointer"
                            >
                              {log.attachedDr}
                            </button>
                          ) : (
                            <span className="text-gray-400 dark:text-gray-600">None</span>
                          )}
                        </td>
                        {isAdmin && (
                          <td className="p-2 text-center">
                            <div className="flex items-center justify-center space-x-2">
                              <button
                                onClick={() => handleEdit(log)}
                                className="text-blue-600 hover:text-blue-800 p-1 rounded-md hover:bg-blue-50 dark:hover:bg-blue-950/40 cursor-pointer"
                                title="Edit Record"
                              >
                                <Edit className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => handleDelete(log.dr)}
                                className="text-red-600 hover:text-red-800 p-1 rounded-md hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer"
                                title="Delete Record"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
