/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { mockApi } from '../services/mockApi';
import type { Document, DocumentCategory, DocumentStatus, RowValidationError } from '../types';
import { Upload, Download, AlertTriangle } from 'lucide-react';
import { VirtualTable } from './VirtualTable';
import { Modal, ModalHeader } from './ui/Card';
import { Button } from './ui/Button';
import { SegmentedControl } from './ui/Toggle';

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: () => void;
}

export const BulkImportModal: React.FC<BulkImportModalProps> = ({
  isOpen,
  onClose,
  onImportSuccess,
}) => {
  const { currentUser, showToast } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Parsing / Processing states
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [processedCount, setProcessedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  
  // Results states
  const [hasResults, setHasResults] = useState(false);
  const [validRecords, setValidRecords] = useState<Omit<Document, 'id' | 'createdDate'>[]>([]);
  const [invalidRecords, setInvalidRecords] = useState<RowValidationError[]>([]);
  const [activeTab, setActiveTab] = useState<'valid' | 'invalid'>('valid');
  const [isImporting, setIsImporting] = useState(false);

  if (!isOpen) return null;

  // Simple CSV Template Download helper
  const downloadTemplate = () => {
    const csvContent = 
      'code,title,category,status\n' +
      'LOTT-EVD-901,Lotte Supermarket Logistics SLA Contract 2026,Contract,Approved\n' +
      'LOTT-EVD-902,SYS API Gateway Integration Spec CMC,Technical,Pending\n' +
      'LOTT-EVD-903,Lotte Cinema Screen Maintenance Invoice #99,Invoice,Draft\n' +
      'LOTT-EVD-904,Invalid Doc,WrongCategory,Approved\n' +
      'LOTT-EVD-905,,Technical,Draft\n';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'evd_bulk_import_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Generate 5000+ Mock Records for demonstration
  const generateLargeMockCSV = () => {
    let csvContent = 'code,title,category,status\n';
    
    // Generate 5000 rows
    const categories: DocumentCategory[] = ['Contract', 'Report', 'Invoice', 'Technical'];
    const statuses: DocumentStatus[] = ['Draft', 'Pending', 'Approved', 'Rejected'];
    
    for (let i = 1; i <= 5000; i++) {
      // 5% rows have validation errors for demo
      const isInvalid = i % 20 === 0;
      const code = isInvalid ? '' : `MOCK-EVD-${1000 + i}`;
      const title = isInvalid ? 'Short' : `Mock Bulk EVD Generated Document Row Number ${i}`;
      const category = isInvalid ? 'InvalidCategory' : categories[i % 4];
      const status = isInvalid ? 'InvalidStatus' : statuses[i % 4];
      
      csvContent += `${code},${title},${category},${status}\n`;
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'evd_large_mock_5000.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Downloaded large mock CSV (5,000 rows) successfully!', 'info');
  };

  // Helper to parse CSV fields correctly, supporting quoted strings
  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let currentCell = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(currentCell.trim());
        currentCell = '';
      } else {
        currentCell += char;
      }
    }
    result.push(currentCell.trim());
    return result;
  };

  // Non-blocking chunked CSV file processor
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setHasResults(false);
    setProgress(0);
    setProcessedCount(0);
    setValidRecords([]);
    setInvalidRecords([]);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      if (!text) {
        showToast('Empty or invalid CSV file.', 'error');
        setIsProcessing(false);
        return;
      }

      // Split lines
      const rawLines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
      if (rawLines.length <= 1) {
        showToast('CSV is empty or missing data rows.', 'error');
        setIsProcessing(false);
        return;
      }

      // Headers (code, title, category, status)
      const headers = parseCSVLine(rawLines[0].toLowerCase());
      const codeIndex = headers.indexOf('code');
      const titleIndex = headers.indexOf('title');
      const categoryIndex = headers.indexOf('category');
      const statusIndex = headers.indexOf('status');

      if (codeIndex === -1 || titleIndex === -1) {
        showToast('CSV must contain "code" and "title" columns.', 'error');
        setIsProcessing(false);
        return;
      }

      const rows = rawLines.slice(1);
      const totalRows = rows.length;
      setTotalCount(totalRows);

      const parsedValids: Omit<Document, 'id' | 'createdDate'>[] = [];
      const parsedInvalids: RowValidationError[] = [];
      
      // Load current codes from localStorage to check unique constraint
      let existingCodes: Set<string>;
      try {
        const stored = localStorage.getItem('sys_evd_documents');
        const docs = stored ? JSON.parse(stored) as Document[] : [];
        existingCodes = new Set(docs.map(d => d.code.trim().toUpperCase()));
      } catch {
        existingCodes = new Set();
      }

      // Tracks duplicate codes in the uploaded file itself
      const importCodesSet = new Set<string>();

      // Chunk size config
      const CHUNK_SIZE = 500;
      let currentIndex = 0;

      const processNextChunk = async () => {
        const limit = Math.min(currentIndex + CHUNK_SIZE, totalRows);
        
        for (let i = currentIndex; i < limit; i++) {
          const rowNum = i + 2; // 1-based, plus headers row
          const columns = parseCSVLine(rows[i]);
          
          // Row values
          const codeVal = columns[codeIndex] || '';
          const titleVal = columns[titleIndex] || '';
          const categoryVal = categoryIndex !== -1 ? columns[categoryIndex] : '';
          const statusVal = statusIndex !== -1 ? columns[statusIndex] : '';

          const rowErrors: string[] = [];

          // 1. Validate Code
          if (!codeVal.trim()) {
            rowErrors.push('Code is required');
          } else if (!/^[A-Za-z0-9-]+$/.test(codeVal)) {
            rowErrors.push('Code must contain only letters, numbers, and dashes');
          } else {
            const upperCode = codeVal.trim().toUpperCase();
            if (existingCodes.has(upperCode)) {
              rowErrors.push(`Code "${codeVal}" already exists in system database`);
            } else if (importCodesSet.has(upperCode)) {
              rowErrors.push(`Code "${codeVal}" is duplicated in this file`);
            } else {
              importCodesSet.add(upperCode);
            }
          }

          // 2. Validate Title
          if (!titleVal.trim()) {
            rowErrors.push('Title is required');
          } else if (titleVal.length < 5) {
            rowErrors.push('Title must be at least 5 characters');
          }

          // 3. Validate Category
          const validCategories: DocumentCategory[] = ['Contract', 'Report', 'Invoice', 'Technical'];
          const cat = validCategories.find(c => c.toLowerCase() === categoryVal.toLowerCase());
          if (!categoryVal.trim()) {
            rowErrors.push('Category is required');
          } else if (!cat) {
            rowErrors.push(`Invalid category: "${categoryVal}". (Must be Contract, Report, Invoice, Technical)`);
          }

          // 4. Validate Status
          const validStatuses: DocumentStatus[] = ['Draft', 'Pending', 'Approved', 'Rejected'];
          let status: DocumentStatus = 'Draft';
          if (statusVal.trim()) {
            const matchedStatus = validStatuses.find(s => s.toLowerCase() === statusVal.toLowerCase());
            if (matchedStatus) {
              status = matchedStatus;
            } else {
              rowErrors.push(`Invalid status: "${statusVal}". (Must be Draft, Pending, Approved, Rejected)`);
            }
          }

          if (rowErrors.length > 0) {
            parsedInvalids.push({
              rowNumber: rowNum,
              code: codeVal || '[Empty]',
              title: titleVal || '[Empty]',
              errors: rowErrors,
            });
          } else {
            parsedValids.push({
              code: codeVal.trim().toUpperCase(),
              title: titleVal.trim(),
              category: cat!,
              status,
              createdBy: currentUser,
            });
          }
        }

        // Update progress state
        currentIndex = limit;
        setProcessedCount(currentIndex);
        setProgress(Math.round((currentIndex / totalRows) * 100));

        if (currentIndex < totalRows) {
          // Yield to UI thread to allow animation and prevent locking
          await new Promise(resolve => setTimeout(resolve, 0));
          await processNextChunk();
        } else {
          // Finish processing
          setValidRecords(parsedValids);
          setInvalidRecords(parsedInvalids);
          setHasResults(true);
          setIsProcessing(false);
          setActiveTab(parsedValids.length > 0 ? 'valid' : 'invalid');
          showToast(`CSV Processed: Found ${parsedValids.length} valid rows and ${parsedInvalids.length} invalid rows.`, 'info');
        }
      };

      // Start asynchronous chunked loop
      await processNextChunk();
    };

    reader.readAsText(file);
  };

  // Submit valid records
  const handleImportSubmit = async () => {
    if (validRecords.length === 0) return;
    setIsImporting(true);
    try {
      await mockApi.bulkImport(validRecords);
      showToast(`Successfully imported ${validRecords.length} documents!`, 'success');
      onImportSuccess();
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Import failed', 'error');
    } finally {
      setIsImporting(false);
    }
  };

  const resetUploader = () => {
    setHasResults(false);
    setValidRecords([]);
    setInvalidRecords([]);
    setProgress(0);
    setProcessedCount(0);
    setTotalCount(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} wrapperClassName="modal-import-wrapper">
      <ModalHeader
        title="Bulk Import Documents"
        subtitle="Upload CSV files containing large registry records with non-blocking processing."
        onClose={onClose}
        disabled={isProcessing || isImporting}
      />

      <div className="modal-body">
        {/* Default Uploader State */}
        {!isProcessing && !hasResults && (
          <div className="upload-dropzone">
            <Upload size={48} className="upload-icon-pulse" />
            <h3>Select EVD CSV File to upload</h3>
            <p>Drag and drop a <code>.csv</code> file, or click to browse files from your computer.</p>
            
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              style={{ display: 'none' }}
              id="csv-file-picker"
            />
            <Button
              variant="primary"
              onClick={() => fileInputRef.current?.click()}
              style={{ marginTop: 16 }}
            >
              Choose File
            </Button>

            <div className="dropzone-templates">
              <button type="button" className="btn-link" onClick={downloadTemplate}>
                <Download size={14} />
                <span>Download CSV Template</span>
              </button>
              <span className="divider">|</span>
              <button type="button" className="btn-link" onClick={generateLargeMockCSV}>
                <Download size={14} />
                <span>Download Large Mock CSV (5,000 Rows)</span>
              </button>
            </div>
          </div>
        )}

        {/* Processing State with progress bar */}
        {isProcessing && (
          <div className="import-processing-state">
            <div className="spinner-loader"></div>
            <h3>Analyzing & Validating EVD Records...</h3>
            <p>Processing row {processedCount} of {totalCount} records...</p>
            
            <div className="progress-bar-wrapper">
              <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
            </div>
            <span className="progress-percent">{progress}%</span>
          </div>
        )}

        {/* Results Summary and report dashboard */}
        {hasResults && (
          <div className="import-results-dashboard">
            {/* Stat Cards */}
            <div className="results-summary-cards">
              <div className="result-card card-total">
                <div className="val">{totalCount}</div>
                <div className="lbl">Total Rows</div>
              </div>
              <div className="result-card card-valid">
                <div className="val">{validRecords.length}</div>
                <div className="lbl">Valid Records</div>
              </div>
              <div className="result-card card-invalid">
                <div className="val">{invalidRecords.length}</div>
                <div className="lbl">Invalid Rows</div>
              </div>
            </div>

            {/* Tab Navigation */}
            <SegmentedControl
              className="import-tabs"
              buttonClassName="tab-btn"
              selectedValue={activeTab}
              onChange={(val) => setActiveTab(val as 'valid' | 'invalid')}
              options={[
                {
                  value: 'valid',
                  label: `Valid Records Preview (${validRecords.length})`,
                  disabled: validRecords.length === 0,
                },
                {
                  value: 'invalid',
                  label: `Validation Errors (${invalidRecords.length})`,
                  disabled: invalidRecords.length === 0,
                },
              ]}
            />

            {/* Tab 1: Valid Records Preview (Virtualized for scale!) */}
            {activeTab === 'valid' && validRecords.length > 0 && (
              <div className="import-tab-content">
                <div className="preview-headers">
                  <span style={{ width: '20%' }}>Code</span>
                  <span style={{ width: '50%' }}>Title</span>
                  <span style={{ width: '15%' }}>Category</span>
                  <span style={{ width: '15%' }}>Status</span>
                </div>
                
                <VirtualTable
                  data={validRecords}
                  rowHeight={40}
                  visibleHeight={240}
                  className="virtual-import-preview"
                  renderRow={(row, idx, style) => (
                    <div className="preview-row" key={idx} style={style}>
                      <span style={{ width: '20%' }} className="mono">{row.code}</span>
                      <span style={{ width: '50%' }} className="truncate" title={row.title}>{row.title}</span>
                      <span style={{ width: '15%' }}>{row.category}</span>
                      <span style={{ width: '15%' }}>
                        <span className={`badge-status status-${row.status.toLowerCase()}`}>{row.status}</span>
                      </span>
                    </div>
                  )}
                />
              </div>
            )}

            {/* Tab 2: Invalid Records Report (Virtualized error log!) */}
            {activeTab === 'invalid' && invalidRecords.length > 0 && (
              <div className="import-tab-content">
                <div className="error-headers">
                  <span style={{ width: '12%' }}>Row #</span>
                  <span style={{ width: '18%' }}>Code</span>
                  <span style={{ width: '70%' }}>Validation Failures</span>
                </div>

                <VirtualTable
                  data={invalidRecords}
                  rowHeight={48}
                  visibleHeight={240}
                  className="virtual-import-errors"
                  renderRow={(row, idx, style) => (
                    <div className="error-row" key={idx} style={style}>
                      <span style={{ width: '12%' }} className="row-num">#{row.rowNumber}</span>
                      <span style={{ width: '18%' }} className="mono">{row.code}</span>
                      <span style={{ width: '70%' }} className="errors-list">
                        {row.errors.map((err, errIdx) => (
                          <span key={errIdx} className="err-badge">
                            <AlertTriangle size={12} style={{ marginRight: 4 }} />
                            {err}
                          </span>
                        ))}
                      </span>
                    </div>
                  )}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal Footer actions */}
      <div className="modal-footer">
        {hasResults && (
          <Button
            variant="secondary"
            onClick={resetUploader}
            disabled={isImporting}
            style={{ marginRight: 'auto' }}
          >
            Upload another file
          </Button>
        )}

        <Button
          variant="secondary"
          onClick={onClose}
          disabled={isProcessing || isImporting}
        >
          Close
        </Button>
        
        {hasResults && validRecords.length > 0 && (
          <Button
            variant="primary"
            onClick={handleImportSubmit}
            loading={isImporting}
            disabled={isImporting}
          >
            Import {validRecords.length} Valid Rows
          </Button>
        )}
      </div>
    </Modal>
  );
};
