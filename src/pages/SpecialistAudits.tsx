import React, { useState, useEffect } from 'react';
import { Package, Landmark, Receipt, FileText, Upload, RefreshCw, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

interface SpecialistAuditsProps {
  addToast: (msg: string, type: 'success' | 'danger' | 'warning' | 'info') => void;
}

export default function SpecialistAudits({ addToast }: SpecialistAuditsProps) {
  const [activeTab, setActiveTab] = useState<'inventory' | 'cash' | 'reconciliation'>('inventory');

  // Inventory states
  const [skuCode, setSkuCode] = useState('SKU-2026-X8');
  const [bookQty, setBookQty] = useState(150);
  const [physicalQty, setPhysicalQty] = useState(148);
  const [discrepancy, setDiscrepancy] = useState(-2);
  const [inventoryLogs, setInventoryLogs] = useState<any[]>([
    { sku: 'SKU-2026-A1', book: 50, physical: 50, var: 0, status: 'Balanced', date: '2026-07-15' },
    { sku: 'SKU-2026-B4', book: 200, physical: 195, var: -5, status: 'Shrinkage Detected', date: '2026-07-16' },
  ]);

  // Cash Safe states
  const [safeTarget, setSafeTarget] = useState(5000);
  const [safePhysicalCount, setSafePhysicalCount] = useState(4980);
  const [cashLogs, setCashLogs] = useState<any[]>([
    { location: 'Main Terminal Drawer', theoretical: 500.0, actual: 500.0, var: 0.0, date: '2026-07-18', status: 'Passed' },
    { location: 'HQ Treasury Safe', theoretical: 10000.0, actual: 9950.0, var: -50.0, date: '2026-07-18', status: 'Variance Flagged' },
  ]);

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
        <p className="text-xs text-gray-400 font-medium">Verify structural registries including physical vaults, cash boxes, and automated OCR invoices.</p>
      </div>

      {/* Specialist Module Tabs */}
      <div className="flex border-b border-gray-100 space-x-1">
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
    </div>
  );
}
