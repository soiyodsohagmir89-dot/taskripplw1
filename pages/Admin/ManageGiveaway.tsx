import React, { useState, useEffect } from 'react';
import {
  getGiveawaySettings, updateGiveawaySettings, getGiveawaySubmissions, adminApproveGiveawaySubmission, adminRejectGiveawaySubmission, getGiveawayWinners, setGiveawayWinners, sendGiveawayPrize, getUsers, getUserName
} from '../../services/mockBackend';
import { GiveawaySettings, GiveawaySubmission, GiveawaySubmissionStatus, GiveawayWinner, GiveawayPrize } from '../../types';
import { Button } from '../../components/ui/Button';
import { Settings, UserCheck, Trophy, Check, X, Eye, Gift, Send, Users, CheckCircle } from 'lucide-react';

export const ManageGiveaway: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'SETTINGS' | 'SUBMISSIONS' | 'WINNERS'>('SUBMISSIONS');
  const [settings, setSettings] = useState<GiveawaySettings | null>(null);
  const [submissions, setSubmissions] = useState<GiveawaySubmission[]>([]);
  const [winners, setWinners] = useState<GiveawayWinner[]>([]);
  const [viewingSub, setViewingSub] = useState<GiveawaySubmission | null>(null);
  
  // Winner Selection State
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinResult, setSpinResult] = useState<string | null>(null);

  const loadData = () => {
    setSettings(getGiveawaySettings());
    setSubmissions(getGiveawaySubmissions());
    setWinners(getGiveawayWinners());
  };

  useEffect(() => { loadData(); }, []);

  const handleSaveSettings = () => {
    if (settings) {
      updateGiveawaySettings(settings);
      alert('Settings Saved!');
    }
  };

  const handlePrizeChange = (index: number, key: keyof GiveawayPrize, value: any) => {
    if (!settings) return;
    const newPrizes = [...settings.prizes];
    newPrizes[index] = { ...newPrizes[index], [key]: Number(value) };
    setSettings({ ...settings, prizes: newPrizes });
  };
  const addPrize = () => {
    if (!settings) return;
    const nextRank = settings.prizes.length > 0 ? Math.max(...settings.prizes.map(p => p.rank)) + 1 : 1;
    setSettings({ ...settings, prizes: [...settings.prizes, { rank: nextRank, amount: 100 }] });
  };
  const removePrize = (index: number) => {
    if (!settings) return;
    const newPrizes = [...settings.prizes];
    newPrizes.splice(index, 1);
    setSettings({ ...settings, prizes: newPrizes });
  };

  const handleApprove = (id: string) => { adminApproveGiveawaySubmission(id); loadData(); };
  const handleReject = (id: string) => { adminRejectGiveawaySubmission(id); loadData(); };
  
  const handleSpin = () => {
      if (!settings) return;
      const approvedSubs = submissions.filter(s => s.status === GiveawaySubmissionStatus.APPROVED);
      const winnerIds = winners.map(w => w.userId);
      const eligible = approvedSubs.filter(s => !winnerIds.includes(s.userId));

      if (eligible.length === 0) {
        alert("No eligible participants to draw from.");
        return;
      }

      const nextPrizeRank = settings.prizes.length - winners.length;
      if (nextPrizeRank <= 0) {
          alert("All prizes have been awarded!");
          return;
      }
      const prize = settings.prizes.find(p => p.rank === nextPrizeRank);
      if(!prize) return;

      setIsSpinning(true);
      setSpinResult(null);
      const winnerSub = eligible[Math.floor(Math.random() * eligible.length)];
      
      setTimeout(() => {
          const newWinner: GiveawayWinner = {
            rank: prize.rank,
            userId: winnerSub.userId,
            prizeAmount: prize.amount,
            prizeSent: false,
            wonAt: new Date().toISOString()
          };
          const updatedWinners = [...winners, newWinner];
          setGiveawayWinners(updatedWinners);
          setWinners(updatedWinners);
          setSpinResult(`${getUserName(winnerSub.userId)} won Rank #${prize.rank}!`);
          setIsSpinning(false);
      }, 3000);
  };
  
  const handleSendPrize = (winner: GiveawayWinner) => {
      if(window.confirm(`Send $${winner.prizeAmount} to ${getUserName(winner.userId)}?`)) {
          sendGiveawayPrize(winner.userId, winner.prizeAmount, winner.rank);
          loadData();
      }
  };

  if (!settings) return null;
  const pendingSubmissions = submissions.filter(s => s.status === GiveawaySubmissionStatus.PENDING);
  const approvedCount = submissions.filter(s => s.status === GiveawaySubmissionStatus.APPROVED).length;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Giveaway Management</h2>
      <div className="flex gap-2 p-1 bg-gray-200 rounded-lg w-fit">
        {['SUBMISSIONS', 'WINNERS', 'SETTINGS'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 ${activeTab === tab ? 'bg-white shadow text-indigo-600' : 'text-gray-600'}`}
          >
            {tab === 'SETTINGS' ? <Settings size={16}/> : tab === 'SUBMISSIONS' ? <UserCheck size={16}/> : <Trophy size={16}/>}
            {tab}
            {tab === 'SUBMISSIONS' && pendingSubmissions.length > 0 && <span className="bg-red-500 text-white text-xs px-2 rounded-full">{pendingSubmissions.length}</span>}
          </button>
        ))}
      </div>
      
      {activeTab === 'SETTINGS' && (
        <div className="bg-white p-6 rounded-xl border shadow-sm space-y-6">
            <div>
              <h3 className="font-bold text-lg mb-2">General Settings</h3>
              <div className="grid grid-cols-2 gap-4">
                  <div><label>Join Price ($)</label><input type="number" value={settings.joinPrice} onChange={e => setSettings({...settings, joinPrice: Number(e.target.value)})} className="w-full border p-2 rounded"/></div>
                  <div><label>Min. Participants</label><input type="number" value={settings.minParticipants} onChange={e => setSettings({...settings, minParticipants: Number(e.target.value)})} className="w-full border p-2 rounded"/></div>
              </div>
              <div className="mt-4"><label>Rules</label><textarea value={settings.rules} onChange={e => setSettings({...settings, rules: e.target.value})} className="w-full border p-2 rounded" rows={4}/></div>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-2">Social Task Links</h3>
              <div className="grid grid-cols-2 gap-4">
                  {Object.keys(settings.tasks).map(key => (
                      <div key={key}><label className="capitalize">{key} URL</label><input value={settings.tasks[key as keyof typeof settings.tasks]} onChange={e => setSettings({...settings, tasks: {...settings.tasks, [key]: e.target.value}})} className="w-full border p-2 rounded"/></div>
                  ))}
              </div>
            </div>
             <div>
               <h3 className="font-bold text-lg mb-2">Prize Structure</h3>
               <div className="space-y-2">
                 {settings.prizes.sort((a,b)=>b.rank-a.rank).map((p, i) => (
                   <div key={i} className="flex gap-2 items-center">
                     <input type="number" placeholder="Rank" value={p.rank} onChange={e => handlePrizeChange(i, 'rank', e.target.value)} className="w-20 border p-2 rounded"/>
                     <input type="number" placeholder="Amount" value={p.amount} onChange={e => handlePrizeChange(i, 'amount', e.target.value)} className="flex-1 border p-2 rounded"/>
                     <Button variant="danger" size="sm" onClick={() => removePrize(i)}><X/></Button>
                   </div>
                 ))}
               </div>
               <Button onClick={addPrize} size="sm" variant="secondary" className="mt-2">Add Prize</Button>
            </div>
            <Button onClick={handleSaveSettings}>Save Settings</Button>
        </div>
      )}

      {activeTab === 'SUBMISSIONS' && (
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50"><tr><th className="p-3">User</th><th className="p-3">Submitted UID</th><th className="p-3">Date</th><th className="p-3 text-right">Actions</th></tr></thead>
            <tbody>
              {pendingSubmissions.map(s => (
                <tr key={s.id} className="border-b">
                  <td className="p-3 font-bold">{getUserName(s.userId)}</td>
                  <td className="p-3 font-mono">{s.submittedUid}</td>
                  <td className="p-3 text-xs text-gray-500">{new Date(s.submittedAt).toLocaleDateString()}</td>
                  <td className="p-3 text-right flex gap-2 justify-end">
                    <Button size="sm" variant="secondary" onClick={() => setViewingSub(s)}><Eye/></Button>
                    <Button size="sm" className="bg-green-600" onClick={() => handleApprove(s.id)}><Check/></Button>
                    <Button size="sm" variant="danger" onClick={() => handleReject(s.id)}><X/></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {pendingSubmissions.length === 0 && <p className="p-8 text-center text-gray-500">No pending submissions.</p>}
        </div>
      )}

      {activeTab === 'WINNERS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <h3 className="font-bold text-lg mb-4">Winner Selection</h3>
            <div className="text-center p-4 bg-gray-100 rounded-lg mb-4">
              <p className="text-sm uppercase text-gray-500">Participants</p>
              <p className="text-3xl font-bold">{approvedCount} / {settings.minParticipants}</p>
            </div>
            <Button onClick={handleSpin} disabled={isSpinning || approvedCount < settings.minParticipants} className="w-full py-3">
                {isSpinning ? 'Spinning...' : 'Spin for Next Winner'}
            </Button>
            {isSpinning && <div className="text-center mt-4 animate-pulse">Picking a lucky winner...</div>}
            {spinResult && <div className="text-center mt-4 font-bold text-green-600 bg-green-50 p-3 rounded-lg">{spinResult}</div>}
          </div>
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <h3 className="font-bold text-lg mb-4">Winner List</h3>
            <div className="space-y-2">
              {winners.sort((a,b)=>a.rank-b.rank).map(w => (
                <div key={w.rank} className="flex justify-between items-center p-2 border rounded-lg">
                   <div>
                      <p className="text-xs">Rank #{w.rank}</p>
                      <p className="font-bold">{getUserName(w.userId)}</p>
                   </div>
                   {w.prizeSent ? <span className="text-xs font-bold text-green-600 flex items-center gap-1"><CheckCircle size={14}/>SENT</span> : <Button size="sm" onClick={() => handleSendPrize(w)}><Send size={14}/> Send ${w.prizeAmount}</Button>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {viewingSub && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setViewingSub(null)}>
            <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b">
                    <h3 className="font-bold">Reviewing: {getUserName(viewingSub.userId)}</h3>
                </div>
                <div className="p-4 space-y-4">
                    {viewingSub.tasks.map(t => (
                        <div key={t.type}>
                            <h4 className="font-bold text-sm capitalize">{t.type.toLowerCase().replace(/_/g, ' ')}</h4>
                            <p className="text-xs">Link: <a href={t.proofLink} target="_blank" className="text-blue-600">{t.proofLink}</a></p>
                            <img src={t.proofScreenshot} className="mt-2 border rounded-md max-w-full h-auto"/>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      )}
    </div>
  );
};
