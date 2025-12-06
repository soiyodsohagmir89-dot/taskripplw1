import React, { useState, useEffect } from 'react';
import { generateOfficialWorkerCode, getOfficialCodes, getUserName } from '../../services/mockBackend';
import { OfficialCode } from '../../types';
import { Button } from '../../components/ui/Button';
import { Plus, Copy, RefreshCw, Check } from 'lucide-react';

export const SecretCodeGenerator: React.FC = () => {
  const [codes, setCodes] = useState<OfficialCode[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    loadCodes();
  }, []);

  const loadCodes = () => {
    const data = getOfficialCodes().reverse();
    setCodes(data);
  };

  const handleGenerate = () => {
    generateOfficialWorkerCode();
    loadCodes();
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
            <h2 className="text-2xl font-bold text-gray-900">HPJ Secret Codes</h2>
            <p className="text-gray-500 text-sm">Generate codes to grant access to High Paying Jobs.</p>
        </div>
        <Button onClick={handleGenerate} className="shadow-lg">
          <Plus className="w-4 h-4 mr-2" /> Generate Secret Code
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 border-b">
              <tr>
                <th className="px-6 py-3">Secret Code</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">User UID</th>
                <th className="px-6 py-3">User Name</th>
                <th className="px-6 py-3">Generated At</th>
                <th className="px-6 py-3">Used At</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {codes.length === 0 ? (
                <tr><td colSpan={7} className="p-8 text-center text-gray-500">No codes generated yet.</td></tr>
              ) : (
                codes.map(code => (
                  <tr key={code.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-mono font-bold text-lg text-indigo-700">
                      {code.code}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        code.status === 'GENERATED' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'
                      }`}>
                        {code.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs font-bold text-gray-600">
                        {code.usedBy ? code.usedBy : <span className="text-gray-300">-</span>}
                    </td>
                    <td className="px-6 py-4 text-gray-900 font-medium">
                      {code.usedBy ? getUserName(code.usedBy) : <span className="text-gray-300">-</span>}
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-xs">
                      {new Date(code.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-xs">
                      {code.usedAt ? new Date(code.usedAt).toLocaleString() : '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {code.status === 'GENERATED' && (
                        <button 
                          onClick={() => copyToClipboard(code.code, code.id)}
                          className="text-gray-500 hover:text-indigo-600 transition-colors"
                          title="Copy Code"
                        >
                          {copiedId === code.id ? <Check size={18} className="text-green-600"/> : <Copy size={18} />}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};