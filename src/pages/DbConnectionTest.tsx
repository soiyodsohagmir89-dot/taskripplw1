
import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/Button';
import { Database, CheckCircle, XCircle, Loader2 } from 'lucide-react';

export const DbConnectionTest: React.FC = () => {
  const [status, setStatus] = useState<'IDLE' | 'LOADING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [data, setData] = useState<any>(null);

  const testConnection = async () => {
    setStatus('LOADING');
    try {
      // In production, this path is relative to domain root
      const response = await fetch('/api/test_connection.php');
      const json = await response.json();
      
      if (response.ok && json.status === 'success') {
        setStatus('SUCCESS');
        setData(json);
      } else {
        setStatus('ERROR');
        setData(json);
      }
    } catch (error: any) {
      setStatus('ERROR');
      setData({ message: error.message, details: "Ensure PHP files are in /api folder and server is running." });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Database size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">MySQL Connection</h2>
          <p className="text-gray-500 mt-2">Test connection to cPanel Database</p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200 font-mono text-xs overflow-x-auto">
          {status === 'IDLE' && <span className="text-gray-400">Waiting to test...</span>}
          {status === 'LOADING' && <span className="text-indigo-600 flex items-center gap-2"><Loader2 className="animate-spin" size={14}/> Connecting...</span>}
          {status === 'SUCCESS' && (
            <div className="text-green-700">
              <p className="font-bold flex items-center gap-2 mb-2"><CheckCircle size={14}/> Connected!</p>
              <pre>{JSON.stringify(data, null, 2)}</pre>
            </div>
          )}
          {status === 'ERROR' && (
            <div className="text-red-600">
              <p className="font-bold flex items-center gap-2 mb-2"><XCircle size={14}/> Connection Failed</p>
              <pre>{JSON.stringify(data, null, 2)}</pre>
            </div>
          )}
        </div>

        <Button onClick={testConnection} className="w-full" disabled={status === 'LOADING'}>
          {status === 'LOADING' ? 'Testing...' : 'Test Connection'}
        </Button>
      </div>
    </div>
  );
};
