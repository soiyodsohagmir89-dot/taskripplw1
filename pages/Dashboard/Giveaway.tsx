import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  getGiveawaySettings, getGiveawaySubmissionForUser, createGiveawaySubmission, getGiveawayWinners, getUserName, getGiveawaySubmissions
} from '../../services/mockBackend';
import {
  GiveawaySettings, GiveawaySubmission, GiveawayTaskType, GiveawayTaskSubmissionProof, GiveawayWinner, GiveawaySubmissionStatus
} from '../../types';
import { Button } from '../../components/ui/Button';
import {
  Trophy, BookOpen, Facebook, Youtube, Linkedin, Instagram, Twitter, Upload, CheckCircle, Clock, XCircle, Gift, UserCheck, Lock, BadgeCheck, Users
} from 'lucide-react';
import { FaTiktok } from 'react-icons/fa';

const SocialIcon = ({ type }: { type: string }) => {
  const props = { size: 20, className: "text-white" };
  if (type.includes('FACEBOOK')) return <Facebook {...props} />;
  if (type.includes('TIKTOK')) return <FaTiktok {...props} />;
  if (type.includes('YOUTUBE')) return <Youtube {...props} />;
  if (type.includes('INSTAGRAM')) return <Instagram {...props} />;
  if (type.includes('LINKEDIN')) return <Linkedin {...props} />;
  if (type.includes('TWITTER')) return <Twitter {...props} />;
  return null;
};

export const Giveaway: React.FC = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<GiveawaySettings | null>(null);
  const [submission, setSubmission] = useState<GiveawaySubmission | null | undefined>(undefined);
  const [winners, setWinners] = useState<GiveawayWinner[]>([]);
  const [participantCount, setParticipantCount] = useState(0);
  const [proofs, setProofs] = useState<Record<GiveawayTaskType, GiveawayTaskSubmissionProof>>({} as any);
  const [submittedUid, setSubmittedUid] = useState('');
  const [error, setError] = useState('');

  const taskOrder: GiveawayTaskType[] = [
    GiveawayTaskType.FACEBOOK_FOLLOW,
    GiveawayTaskType.TIKTOK_FOLLOW,
    GiveawayTaskType.YOUTUBE_SUBSCRIBE,
    GiveawayTaskType.INSTAGRAM_FOLLOW,
    GiveawayTaskType.LINKEDIN_FOLLOW,
    GiveawayTaskType.TWITTER_FOLLOW,
  ];

  useEffect(() => {
    if (user) {
      const s = getGiveawaySettings();
      setSettings(s);
      setSubmission(getGiveawaySubmissionForUser(user.id));
      setWinners(getGiveawayWinners());
      const allSubmissions = getGiveawaySubmissions();
      const approvedCount = allSubmissions.filter(sub => sub.status === GiveawaySubmissionStatus.APPROVED).length;
      setParticipantCount(approvedCount);
    }
  }, [user]);

  const handleProofChange = (type: GiveawayTaskType, key: 'proofLink' | 'proofScreenshot', value: string) => {
    setProofs(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        type,
        [key]: value
      }
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: GiveawayTaskType) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) return alert("Max file size is 2MB.");
      const reader = new FileReader();
      reader.onloadend = () => handleProofChange(type, 'proofScreenshot', reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!user || !settings) return;
    setError('');

    const taskProofs = taskOrder.map(t => proofs[t]).filter(Boolean);
    if (taskProofs.length !== taskOrder.length || !submittedUid) {
      return setError('Please complete all tasks and provide your UID.');
    }
    
    try {
      await createGiveawaySubmission(user.id, submittedUid, taskProofs);
      setSubmission(getGiveawaySubmissionForUser(user.id));
    } catch(err: any) {
      setError(err.message);
    }
  };

  if (!user || !settings) return null;

  if (!user.isVerified) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center max-w-2xl mx-auto p-6">
        <div className="bg-gray-100 p-6 rounded-full mb-6 relative">
          <Lock className="w-12 h-12 text-gray-400" />
          <div className="absolute -bottom-2 -right-2 bg-blue-500 text-white p-1.5 rounded-full border-2 border-white">
             <BadgeCheck size={16} />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Giveaway Locked</h2>
        <p className="text-gray-500 max-w-md mb-8">
          The Grand Giveaway is an exclusive event for <strong>Verified Users</strong>. 
          Please activate your account to participate and win big prizes.
        </p>
        <Link 
          to="/activation" 
          className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 transition-transform hover:scale-105"
        >
          Verify My Account
        </Link>
      </div>
    );
  }

  const isAllTasksCompleted = taskOrder.every(t => proofs[t]?.proofLink && proofs[t]?.proofScreenshot);
  const totalPrizePool = settings.prizes.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-8">
      <div className="text-center bg-gradient-to-br from-indigo-700 to-purple-800 text-white p-8 rounded-2xl shadow-lg">
        <Trophy className="mx-auto w-16 h-16 mb-4 animate-pulse" />
        <h1 className="text-4xl font-bold">Grand Giveaway</h1>
        <p className="mt-2 text-indigo-200">Complete tasks to enter and win huge prizes!</p>
      </div>
      
      {error && <div className="bg-red-100 text-red-700 p-3 rounded-md">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-sm font-bold text-gray-500 uppercase">Total Prize Pool</p>
          <p className="text-4xl font-extrabold text-green-600 mt-2">${totalPrizePool.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-center">
            <p className="text-sm font-bold text-gray-500 uppercase">Participants</p>
            <span className="text-xs font-bold text-gray-400">Min. {settings.minParticipants.toLocaleString()} required</span>
          </div>
          <p className="text-4xl font-extrabold text-indigo-600 mt-2">{participantCount.toLocaleString()}</p>
          <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
            <div 
              className="bg-indigo-600 h-2.5 rounded-full" 
              style={{ width: `${Math.min((participantCount / settings.minParticipants) * 100, 100)}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {submission ? (
            <div className="bg-white p-8 rounded-xl border-2 shadow-sm text-center">
              {submission.status === GiveawaySubmissionStatus.APPROVED && <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4"/>}
              {submission.status === GiveawaySubmissionStatus.PENDING && <Clock className="w-16 h-16 text-yellow-500 mx-auto mb-4"/>}
              {submission.status === GiveawaySubmissionStatus.REJECTED && <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4"/>}
              <h2 className="text-2xl font-bold">Your Submission Status: {submission.status}</h2>
              <p className="text-gray-600 mt-2">You have already entered the giveaway. Please wait for admin approval.</p>
            </div>
          ) : (
            <div className="bg-white p-6 rounded-xl border shadow-sm">
              <h2 className="text-xl font-bold flex items-center gap-2 mb-4"><UserCheck /> Step 1: Complete All Tasks</h2>
              <div className="space-y-4">
                {taskOrder.map((type, i) => {
                  const taskName = type.replace(/_/g, ' ');
                  const socialLink = settings.tasks[type.split('_')[0].toLowerCase() as keyof typeof settings.tasks];
                  const proof = proofs[type];

                  return (
                    <div key={type} className="bg-gray-50 p-4 rounded-lg border">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-gray-700`}>
                            <SocialIcon type={type}/>
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-800">Task {i+1}: {taskName}</h3>
                          </div>
                        </div>
                        {proof?.proofLink && proof?.proofScreenshot && <CheckCircle className="text-green-500"/>}
                      </div>
                      <div className="mt-4 pl-12 space-y-3">
                        <a href={socialLink} target="_blank" rel="noopener noreferrer"><Button size="sm">Go to Page</Button></a>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <input className="w-full text-sm border rounded p-2" placeholder="Your Profile Link/Account" onChange={e => handleProofChange(type, 'proofLink', e.target.value)}/>
                          <div className="relative">
                            <input type="file" accept="image/*" className="absolute inset-0 opacity-0 w-full h-full cursor-pointer" onChange={e => handleFileChange(e, type)}/>
                            <div className="w-full text-sm border rounded p-2 bg-white flex items-center gap-2 justify-center">
                              <Upload size={14}/> {proof?.proofScreenshot ? 'Screenshot Uploaded' : 'Upload Screenshot'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
               <div className="mt-6">
                 <h2 className="text-xl font-bold flex items-center gap-2 mb-4"><UserCheck /> Step 2: Submit Your UID</h2>
                 <input className="w-full border rounded p-3 text-lg font-mono" placeholder="Enter Your User ID" value={submittedUid} onChange={e => setSubmittedUid(e.target.value)} />
               </div>
              <Button onClick={handleSubmit} disabled={!isAllTasksCompleted || !submittedUid} className="w-full mt-6 py-3">Submit My Entry</Button>
            </div>
          )}

          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <h2 className="text-xl font-bold flex items-center gap-2 mb-4"><Gift /> Prize List</h2>
            <div className="space-y-2">
              {settings.prizes.sort((a,b) => a.rank - b.rank).map(p => (
                <div key={p.rank} className="flex justify-between items-center bg-yellow-50 p-3 rounded-lg">
                  <span className="font-bold text-yellow-800">Rank #{p.rank}</span>
                  <span className="font-bold text-lg text-green-600">${p.amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <h2 className="text-xl font-bold flex items-center gap-2 mb-4"><BookOpen /> Giveaway Rules</h2>
            <p className="text-gray-600 whitespace-pre-line">{settings.rules}</p>
          </div>
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <h2 className="text-xl font-bold flex items-center gap-2 mb-4"><Trophy /> Winners</h2>
            {winners.length > 0 ? (
              <div className="space-y-2">
                {winners.sort((a,b) => a.rank - b.rank).map(w => (
                  <div key={w.rank} className="p-3 rounded-lg border flex justify-between items-center">
                    <div>
                      <p className="text-xs text-gray-500">Rank #{w.rank}</p>
                      <p className="font-bold">{getUserName(w.userId)}</p>
                      <p className="text-xs font-mono">{w.userId}</p>
                    </div>
                    <p className="font-bold text-lg text-green-600">${w.prizeAmount.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            ) : <p className="text-gray-500 text-center py-4">Winners will be announced soon!</p>}
          </div>
        </div>
      </div>
    </div>
  );
};