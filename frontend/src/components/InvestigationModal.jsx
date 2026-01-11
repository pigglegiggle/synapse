import React, { useState } from 'react';
import {
    X, Shield, MapPin, Monitor, Globe,
    AlertTriangle, TrendingUp, Brain, FileCode, Search, CheckCircle, Ban
} from 'lucide-react';

const InvestigationModal = ({ transaction, onClose, onVerification }) => {
    const [activeTab, setActiveTab] = useState('forensics'); // forensics, iso20022

    if (!transaction) return null;

    const riskLevel = transaction.risk_score > 80 ? 'HIGH' : (transaction.risk_score > 50 ? 'MEDIUM' : 'LOW');

    // Handle verification with safety check
    const handleVerdict = (verdict) => {
        if (onVerification) {
            onVerification(verdict);
        } else {
            console.warn('onVerification callback not provided');
        }
    };

    // Mock ISO 20022 XML Generation
    const generateISOXML = (txn) => {
        const timestamp = txn.timestamp ? new Date(txn.timestamp) : new Date();
        const dateStr = timestamp.toISOString().split('T')[0];
        const timeStr = timestamp.toISOString().replace(/\.\d{3}Z$/, '+07:00');

        return `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pacs.008.001.08">
  <FIToFICstmrCdtTrf>
    <GrpHdr>
      <MsgId>MSG-${dateStr.replace(/-/g, '')}-${(txn.transaction_id || '0001').substring(0, 8)}</MsgId>
      <CreDtTm>${timeStr}</CreDtTm>
      <NbOfTxs>1</NbOfTxs>
      <SttlmInf>
        <SttlmMtd>CLRG</SttlmMtd>
      </SttlmInf>
    </GrpHdr>

    <CdtTrfTxInf>
      <PmtId>
        <InstrId>INST-${(txn.transaction_id || '0001').substring(0, 8)}</InstrId>
        <EndToEndId>E2E-${(txn.transaction_id || '0001').substring(0, 8)}</EndToEndId>
        <TxId>${txn.transaction_id || 'TX-0001'}</TxId>
      </PmtId>

      <PmtTpInf>
        <LclInstrm>
          <Prtry>INSTPAY</Prtry>
        </LclInstrm>
        <Purp>
          <Cd>${txn.risk_score > 80 ? 'LOTT' : 'SALA'}</Cd>
        </Purp>
      </PmtTpInf>

      <IntrBkSttlmAmt Ccy="THB">${txn.amount ? parseFloat(txn.amount).toFixed(2) : '0.00'}</IntrBkSttlmAmt>
      <IntrBkSttlmDt>${dateStr}</IntrBkSttlmDt>

      <ChrgBr>SLEV</ChrgBr>

      <Dbtr>
        <Nm>REDACTED</Nm>
      </Dbtr>

      <DbtrAcct>
        <Id>
          <Othr>
            <Id>${txn.sender_account}</Id>
          </Othr>
        </Id>
      </DbtrAcct>

      <DbtrAgt>
        <FinInstnId>
          <BICFI>${txn.sender_account.split('-')[0]}THBKXXX</BICFI>
        </FinInstnId>
      </DbtrAgt>

      <CdtrAgt>
        <FinInstnId>
          <BICFI>${txn.receiver_account.split('-')[0]}THBKXXX</BICFI>
        </FinInstnId>
      </CdtrAgt>

      <Cdtr>
        <Nm>REDACTED</Nm>
      </Cdtr>

      <CdtrAcct>
        <Id>
          <Othr>
            <Id>${txn.receiver_account}</Id>
          </Othr>
        </Id>
      </CdtrAcct>

      <RmtInf>
        <Ustrd>${txn.risk_score > 80 ? 'Payment reference' : 'Salary'}</Ustrd>
      </RmtInf>

    </CdtTrfTxInf>
  </FIToFICstmrCdtTrf>
</Document>`;
    };

    const xmlContent = generateISOXML(transaction);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-slate-50">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-white rounded-lg border border-gray-200 shadow-sm">
                            <Shield className={`w-6 h-6 ${transaction.risk_score > 80 ? 'text-red-600' : 'text-orange-500'}`} />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-slate-900">Case #{transaction.transaction_id?.substring(0, 8)}</h3>
                            <div className="flex items-center gap-2">
                                <span className={`text-xs font-bold px-2 py-0.5 rounded ${transaction.risk_score > 80 ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                                    }`}>
                                    {riskLevel} RISK ({transaction.risk_score.toFixed(0)})
                                </span>
                                <span className="text-xs text-slate-400">|</span>
                                <span className="text-xs text-slate-500 font-mono">pacs.008.001.08</span>
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* ANALYST VERIFICATION - NOW AT TOP */}
                <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-indigo-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm font-bold text-indigo-900 flex items-center gap-2">
                                <Brain className="w-4 h-4" />
                                Analyst Verification Required
                            </div>
                            <div className="text-xs text-indigo-600 mt-1">
                                Review the evidence below and make a decision
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => handleVerdict('FALSE_POSITIVE')}
                                className="px-5 py-2.5 text-sm bg-white border-2 border-green-500 text-green-700 hover:bg-green-50 hover:border-green-600 rounded-lg shadow-sm transition-all font-bold flex items-center gap-2 cursor-pointer"
                            >
                                <CheckCircle className="w-5 h-5" />
                                Mark as Safe
                            </button>
                            <button
                                onClick={() => handleVerdict('FRAUD_CONFIRMED')}
                                className="px-5 py-2.5 text-sm bg-red-600 border-2 border-red-600 text-white hover:bg-red-700 rounded-lg shadow-md transition-all font-bold flex items-center gap-2 cursor-pointer"
                            >
                                <Ban className="w-5 h-5" />
                                Confirm Fraud
                            </button>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200 bg-white px-6">
                    <button
                        onClick={() => setActiveTab('forensics')}
                        className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'forensics' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <Search className="w-4 h-4" /> Forensics View
                    </button>
                    <button
                        onClick={() => setActiveTab('iso20022')}
                        className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'iso20022' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <FileCode className="w-4 h-4" /> ISO-20022 Inspector
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-hidden bg-white relative">
                    {activeTab === 'forensics' && (
                        <div className="h-full overflow-y-auto p-6 scrollbar-thin">
                            {/* Transaction Context */}
                            <div className="mb-6">
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Transaction Context</h4>
                                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 grid grid-cols-2 gap-4">
                                    <div className="flex justify-between items-center bg-white p-3 rounded border border-slate-200">
                                        <span className="text-sm text-slate-500">Amount</span>
                                        <span className="text-lg font-bold text-slate-900">{parseInt(transaction.amount).toLocaleString()} THB</span>
                                    </div>
                                    <div className="flex justify-between items-center bg-white p-3 rounded border border-slate-200">
                                        <span className="text-sm text-slate-500">Timestamp</span>
                                        <span className="text-sm font-mono text-slate-900">{new Date(transaction.timestamp).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center bg-white p-3 rounded border border-slate-200">
                                        <span className="text-sm text-slate-500">Channel</span>
                                        <span className="text-sm text-slate-900 font-medium">Mobile Banking / API</span>
                                    </div>
                                    <div className="flex justify-between items-center bg-white p-3 rounded border border-slate-200">
                                        <span className="text-sm text-slate-500">End-to-End ID</span>
                                        <span className="text-xs font-mono text-slate-900">E2E-{(transaction.transaction_id || '0001').substring(0, 8)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Link Analysis */}
                            <div className="border-t border-slate-100 pt-6">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="flex-1 bg-slate-50 p-3 rounded-lg border border-slate-200 text-center">
                                        <div className="text-xs text-slate-500 font-medium uppercase mb-1">Sender</div>
                                        <div className="font-mono text-sm font-bold text-slate-800">{transaction.sender_account}</div>
                                    </div>
                                    <TrendingUp className="w-5 h-5 text-slate-300" />
                                    <div className="flex-1 bg-slate-50 p-3 rounded-lg border border-slate-200 text-center">
                                        <div className="text-xs text-slate-500 font-medium uppercase mb-1">Receiver</div>
                                        <div className="font-mono text-sm font-bold text-slate-800">{transaction.receiver_account}</div>
                                    </div>
                                </div>
                            </div>

                            {transaction.reasons?.length > 0 && (
                                <div className="mt-4 bg-red-50 border border-red-100 p-4 rounded-lg">
                                    <div className="text-sm font-bold text-red-800 mb-2 flex items-center gap-2">
                                        <AlertTriangle className="w-4 h-4" /> Flagged Patterns
                                    </div>
                                    <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                                        {transaction.reasons.map((r, i) => <li key={i}>{r}</li>)}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'iso20022' && (
                        <div className="h-full flex flex-col bg-slate-900 text-white font-mono text-sm">
                            <div className="px-4 py-2 bg-slate-950 border-b border-slate-800 text-xs text-slate-400 flex items-center justify-between">
                                <span>SOURCE: pacs.008.001.08 (Credit Transfer)</span>
                                <span className="text-green-400 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Validated Structure</span>
                            </div>
                            <div className="flex-1 overflow-auto p-4 space-y-1">
                                {xmlContent.split('\n').map((line, i) => {
                                    // Highlighting Logic
                                    const isSuspicious = line.includes('LOTT') || line.includes('WEB88') || line.includes(transaction.receiver_account);

                                    return (
                                        <div key={i} className={`flex ${isSuspicious ? 'bg-red-900/30 -mx-4 px-4' : ''}`}>
                                            <span className="text-slate-600 select-none mr-4 text-xs w-6 text-right">{i + 1}</span>
                                            <pre className={`${isSuspicious ? 'text-orange-300' : 'text-slate-300'}`}>
                                                {line}
                                            </pre>
                                            {isSuspicious && (
                                                <span className="ml-auto text-xs text-red-400 font-bold uppercase tracking-wider flex items-center gap-1">
                                                    <AlertTriangle className="w-3 h-3" /> Flagged
                                                </span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer - simplified */}
                <div className="px-6 py-3 bg-slate-100 border-t border-slate-200 flex justify-between items-center">
                    <div className="text-xs text-slate-500">
                        Transaction ID: <span className="font-mono">{transaction.transaction_id || 'UNKNOWN'}</span>
                    </div>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-200 rounded-lg transition-colors font-medium"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InvestigationModal;
