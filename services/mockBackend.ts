
import { 
  User, Task, TaskSubmission, Transaction, 
  UserRole, AccountStatus, SubmissionStatus, 
  TransactionType, TransactionStatus, 
  OfficialWorkerStatus, OfficialWorkerRequest, OfficialAccountSubmission,
  Gig, GigStatus, SecretCode, OfficialCode,
  Article, PaymentSettings, ReferralSettings, ResourceSettings, SocialSettings,
  Category, Subcategory,
  CpaCampaign, ClickLog, ConversionLog, CpaSettings,
  Post, Comment,
  Product, Order, OrderStatus, HighPayingJob,
  Notification, UserMessage, MessageStatus,
  GiveawaySettings, GiveawaySubmission, GiveawaySubmissionStatus, GiveawayWinner,
  // FIX: Import DirectMessage for chat functionality
  DirectMessage
} from '../types';

const STORAGE_KEYS = {
  USERS: 'tr_users',
  TASKS: 'tr_tasks',
  SUBMISSIONS: 'tr_submissions',
  TRANSACTIONS: 'tr_transactions',
  CURRENT_USER: 'tr_current_user',
  OFFICIAL_REQUESTS: 'tr_official_requests',
  OFFICIAL_CODES: 'tr_official_codes',
  OFFICIAL_JOBS: 'tr_hp_jobs_def',
  OFFICIAL_ACCOUNT_DATA: 'tr_official_account_data',
  GIGS: 'tr_gigs',
  SECRET_CODES: 'tr_secret_codes',
  ARTICLES: 'tr_articles',
  PAYMENT_SETTINGS: 'tr_payment_settings',
  SOCIAL_SETTINGS: 'tr_social_settings',
  REFERRAL_SETTINGS: 'tr_referral_settings',
  RESOURCE_SETTINGS: 'tr_resource_settings',
  CATEGORIES: 'tr_categories',
  SUBCATEGORIES: 'tr_subcategories',
  CPA_CAMPAIGNS: 'tr_cpa_campaigns',
  CPA_CLICKS: 'tr_cpa_clicks',
  CPA_CONVERSIONS: 'tr_cpa_conversions',
  CPA_SETTINGS: 'tr_cpa_settings',
  POSTS: 'tr_posts',
  PRODUCTS: 'tr_products',
  ORDERS: 'tr_orders',
  DISPUTES: 'tr_disputes',
  // NEW KEYS
  NOTIFICATIONS: 'tr_notifications',
  USER_MESSAGES: 'tr_user_messages',
  // FIX: Add storage key for direct messages
  DIRECT_MESSAGES: 'tr_direct_messages',
  // GIVEAWAY KEYS
  GIVEAWAY_SETTINGS: 'tr_giveaway_settings',
  GIVEAWAY_SUBMISSIONS: 'tr_giveaway_submissions',
  GIVEAWAY_WINNERS: 'tr_giveaway_winners',
  // FIX: Add storage key for password reset tokens
  PASSWORD_RESET_TOKENS: 'tr_password_reset_tokens',
};

const generateId = () => Math.random().toString(36).substring(2, 9);
const getNow = () => new Date().toISOString();

const loadData = <T>(key: string, defaultVal: T): T => {
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : defaultVal;
};

const saveData = (key: string, data: any) => {
  localStorage.setItem(key, JSON.stringify(data));
};

const getRandomNeonColor = () => {
  const NEON_COLORS = ['#00f2ff', '#ff00ff', '#00ff99', '#9d00ff', '#ffaa00', '#2979ff'];
  return NEON_COLORS[Math.floor(Math.random() * NEON_COLORS.length)];
};

const generateSequentialUserId = (users: User[]): string => {
  const START_ID = 1215312;
  const numericIds = users
    .map(u => parseInt(u.id))
    .filter(id => !isNaN(id) && id >= START_ID);
  if (numericIds.length === 0) return START_ID.toString();
  const maxId = Math.max(...numericIds);
  return (maxId + 1).toString();
};

export const initializeBackend = () => {
  let users = loadData<User[]>(STORAGE_KEYS.USERS, []);
  const adminEmail = 'admin@taskripple.com';
  if (!users.find(u => u.email === adminEmail)) {
      users.push({
        id: 'admin-001',
        fullName: 'Super Admin',
        email: adminEmail,
        phone: '0000000000',
        passwordHash: 'admin123',
        role: UserRole.ADMIN,
        status: AccountStatus.ACTIVE,
        balance: 0,
        advertiserBalance: 0,
        referrerId: null,
        referralChain: [],
        referralCode: 'ADMIN001',
        createdAt: getNow(),
        officialWorkerStatus: OfficialWorkerStatus.NONE,
        profilePhoto: `https://ui-avatars.com/api/?name=Super+Admin&background=333&color=fff&bold=true`,
        isVerified: true,
        neonColor: '#9d00ff',
        followers: [],
        following: []
      });
      saveData(STORAGE_KEYS.USERS, users);
  }
  // Initialize default HP Job if empty
  let hpJobs = loadData<HighPayingJob[]>(STORAGE_KEYS.OFFICIAL_JOBS, []);
  if (hpJobs.length === 0) {
      hpJobs.push({
          id: 'hp-job-1',
          title: 'Facebook Account Submission',
          description: 'Submit your Facebook account details for review.',
          status: 'ACTIVE',
          reward: 0.20,
          createdAt: getNow(),
          fields: [
              { id: 'f1', label: 'Facebook ID Name', type: 'text', required: true, placeholder: 'Your FB Name' },
              { id: 'f2', label: 'Phone Number', type: 'tel', required: true, placeholder: 'Linked Phone' },
              { id: 'f3', label: 'Password', type: 'text', required: true, placeholder: 'FB Password' },
              { id: 'f4', label: '2FA Code', type: 'text', required: true, placeholder: 'Recovery Code' },
              { id: 'f5', label: 'Profile Link', type: 'url', required: true, placeholder: 'https://facebook.com/...' },
              { id: 'f6', label: 'State Name', type: 'text', required: true, placeholder: 'State' },
              { id: 'f7', label: 'City Name', type: 'text', required: true, placeholder: 'City' },
              { id: 'f8', label: 'ZIP Code', type: 'text', required: true, placeholder: 'ZIP' },
              { id: 'f9', label: 'ISP Name', type: 'text', required: true, placeholder: 'ISP' },
          ]
      });
      saveData(STORAGE_KEYS.OFFICIAL_JOBS, hpJobs);
  }
  // Initialize Giveaway Settings
  let giveawaySettings = loadData<GiveawaySettings>(STORAGE_KEYS.GIVEAWAY_SETTINGS, {} as GiveawaySettings);
  if (!giveawaySettings || !giveawaySettings.tasks) {
    giveawaySettings = {
        joinPrice: 0,
        minParticipants: 100000,
        rules: 'Follow all social media accounts. Submit valid proof for each task. Submit your User ID to enter the draw. One entry per person.',
        prizes: [
            { rank: 1, amount: 10000 },
            { rank: 2, amount: 5000 },
            { rank: 3, amount: 3000 },
            { rank: 4, amount: 2000 },
            { rank: 5, amount: 1000 },
        ],
        tasks: {
            facebook: 'https://facebook.com/taskripple',
            tiktok: 'https://tiktok.com/@taskripple',
            youtube: 'https://youtube.com/taskripple',
            instagram: 'https://instagram.com/taskripple',
            linkedin: 'https://linkedin.com/company/taskripple',
            twitter: 'https://twitter.com/taskripple',
        }
    };
    saveData(STORAGE_KEYS.GIVEAWAY_SETTINGS, giveawaySettings);
  }
};

// --- DATA ACCESSORS ---
export const getUsers = (): User[] => loadData(STORAGE_KEYS.USERS, []);
export const getTransactions = (): Transaction[] => loadData(STORAGE_KEYS.TRANSACTIONS, []);
export const getTasks = (): Task[] => loadData(STORAGE_KEYS.TASKS, []);
export const getSubmissions = (): TaskSubmission[] => loadData(STORAGE_KEYS.SUBMISSIONS, []);
export const getGigs = (): Gig[] => loadData(STORAGE_KEYS.GIGS, []);
export const getArticles = (): Article[] => loadData(STORAGE_KEYS.ARTICLES, []);
export const getCategories = (): Category[] => loadData(STORAGE_KEYS.CATEGORIES, []);
export const getSubcategories = (): Subcategory[] => loadData(STORAGE_KEYS.SUBCATEGORIES, []);
export const getCpaCampaigns = (): CpaCampaign[] => loadData(STORAGE_KEYS.CPA_CAMPAIGNS, []);
export const getClickLogs = (): ClickLog[] => loadData(STORAGE_KEYS.CPA_CLICKS, []);
export const getConversionLogs = (): ConversionLog[] => loadData(STORAGE_KEYS.CPA_CONVERSIONS, []);
export const getPosts = (): Post[] => loadData(STORAGE_KEYS.POSTS, []);
export const getProducts = (): Product[] => loadData(STORAGE_KEYS.PRODUCTS, []);
export const getOrders = (): Order[] => loadData(STORAGE_KEYS.ORDERS, []);
export const getPendingTasksCount = (): number => getTasks().filter(t => t.status === 'PENDING').length;
export const getUserName = (userId: string): string => getUsers().find(u => u.id === userId)?.fullName || 'Unknown User';
export const getUserById = (userId: string): User | undefined => getUsers().find(u => u.id === userId);

// --- GIVEAWAY SYSTEM ---
export const getGiveawaySettings = (): GiveawaySettings => loadData(STORAGE_KEYS.GIVEAWAY_SETTINGS, {} as GiveawaySettings);
export const updateGiveawaySettings = (settings: GiveawaySettings) => saveData(STORAGE_KEYS.GIVEAWAY_SETTINGS, settings);
export const getGiveawaySubmissions = (): GiveawaySubmission[] => loadData(STORAGE_KEYS.GIVEAWAY_SUBMISSIONS, []);
export const getGiveawaySubmissionForUser = (userId: string): GiveawaySubmission | undefined => getGiveawaySubmissions().find(s => s.userId === userId);
export const getGiveawayWinners = (): GiveawayWinner[] => loadData(STORAGE_KEYS.GIVEAWAY_WINNERS, []);
export const setGiveawayWinners = (winners: GiveawayWinner[]) => saveData(STORAGE_KEYS.GIVEAWAY_WINNERS, winners);

export const createGiveawaySubmission = (userId: string, submittedUid: string, tasks: any[]) => {
    const users = getUsers();
    const user = users.find(u => u.id === userId);
    if (!user || !user.isVerified) {
        throw new Error("Only verified users are eligible to join the giveaway.");
    }
    
    const submissions = getGiveawaySubmissions();
    if(submissions.find(s => s.userId === userId)) throw new Error("You have already joined the giveaway.");
    
    const newSubmission: GiveawaySubmission = {
        id: generateId(),
        userId,
        submittedUid,
        tasks,
        status: GiveawaySubmissionStatus.PENDING,
        submittedAt: getNow()
    };
    submissions.push(newSubmission);
    saveData(STORAGE_KEYS.GIVEAWAY_SUBMISSIONS, submissions);
};

export const adminApproveGiveawaySubmission = (id: string) => {
    const subs = getGiveawaySubmissions();
    const sub = subs.find(s => s.id === id);
    if(sub) {
        sub.status = GiveawaySubmissionStatus.APPROVED;
        saveData(STORAGE_KEYS.GIVEAWAY_SUBMISSIONS, subs);
    }
};

export const adminRejectGiveawaySubmission = (id: string) => {
    const subs = getGiveawaySubmissions();
    const sub = subs.find(s => s.id === id);
    if(sub) {
        sub.status = GiveawaySubmissionStatus.REJECTED;
        saveData(STORAGE_KEYS.GIVEAWAY_SUBMISSIONS, subs);
    }
};

export const sendGiveawayPrize = (winnerId: string, amount: number, rank: number) => {
    const users = getUsers();
    const user = users.find(u => u.id === winnerId);
    if(!user) throw new Error("Winner not found");

    user.balance += amount;
    saveData(STORAGE_KEYS.USERS, users);

    const txs = getTransactions();
    txs.push({
        id: generateId(),
        userId: winnerId,
        type: TransactionType.GIVEAWAY_PRIZE,
        amount,
        status: TransactionStatus.COMPLETED,
        description: `Giveaway Prize - Rank #${rank}`,
        createdAt: getNow()
    });
    saveData(STORAGE_KEYS.TRANSACTIONS, txs);

    const winners = getGiveawayWinners();
    const winner = winners.find(w => w.userId === winnerId);
    if (winner) {
        winner.prizeSent = true;
        saveData(STORAGE_KEYS.GIVEAWAY_WINNERS, winners);
    }
};


// --- NOTIFICATION & MESSAGING SYSTEM ---
export const getNotifications = (userId: string): Notification[] => {
    const all = loadData<Notification[]>(STORAGE_KEYS.NOTIFICATIONS, []);
    return all.filter(n => n.userId === userId).reverse();
};

export const getUserMessages = (): UserMessage[] => loadData(STORAGE_KEYS.USER_MESSAGES, []);

export const getUserMessagesByUserId = (userId: string): UserMessage[] => {
    return getUserMessages().filter(m => m.userId === userId).reverse();
};

export const sendUserMessage = (userId: string, subject: string, message: string) => {
    const msgs = getUserMessages();
    msgs.push({
        id: generateId(),
        userId,
        subject,
        message,
        status: MessageStatus.SENT,
        createdAt: getNow()
    });
    saveData(STORAGE_KEYS.USER_MESSAGES, msgs);
};

export const markMessageSeen = (messageId: string) => {
    const msgs = getUserMessages();
    const m = msgs.find(msg => msg.id === messageId);
    if(m && m.status === MessageStatus.SENT) {
        m.status = MessageStatus.SEEN;
        saveData(STORAGE_KEYS.USER_MESSAGES, msgs);
    }
};

export const replyToMessage = (messageId: string, replyText: string) => {
    const msgs = getUserMessages();
    const m = msgs.find(msg => msg.id === messageId);
    if(!m) throw new Error("Message not found");

    // 1. Update Message Status
    m.status = MessageStatus.REPLIED;
    m.adminReply = replyText;
    saveData(STORAGE_KEYS.USER_MESSAGES, msgs);

    // 2. Create Notification for User
    const notifs = loadData<Notification[]>(STORAGE_KEYS.NOTIFICATIONS, []);
    notifs.push({
        id: generateId(),
        userId: m.userId,
        type: 'REPLY',
        subject: `Reply: ${m.subject}`,
        message: replyText,
        isRead: false,
        createdAt: getNow()
    });
    saveData(STORAGE_KEYS.NOTIFICATIONS, notifs);
};

export const sendBroadcastNotification = (
    targetType: 'ALL' | 'ACTIVE' | 'INACTIVE' | 'SPECIFIC', 
    subject: string, 
    message: string,
    specificUserId?: string
) => {
    const users = getUsers();
    const notifs = loadData<Notification[]>(STORAGE_KEYS.NOTIFICATIONS, []);
    const timestamp = getNow();

    let targetUsers: User[] = [];

    if (targetType === 'ALL') {
        targetUsers = users;
    } else if (targetType === 'ACTIVE') {
        targetUsers = users.filter(u => u.status === 'ACTIVE');
    } else if (targetType === 'INACTIVE') {
        targetUsers = users.filter(u => u.status !== 'ACTIVE' && u.status !== 'BANNED');
    } else if (targetType === 'SPECIFIC') {
        if (!specificUserId) throw new Error("User ID required for specific broadcast");
        const u = users.find(u => u.id === specificUserId);
        if (u) targetUsers = [u];
    }

    targetUsers.forEach(u => {
        notifs.push({
            id: generateId(),
            userId: u.id,
            type: 'BROADCAST',
            subject,
            message,
            isRead: false,
            createdAt: timestamp
        });
    });

    saveData(STORAGE_KEYS.NOTIFICATIONS, notifs);
    return targetUsers.length;
};

// FIX: Add missing functions for Direct Messaging
// --- DIRECT MESSAGING SYSTEM ---
export const sendDirectMessage = (senderId: string, receiverId: string, text: string) => {
    const messages = loadData<DirectMessage[]>(STORAGE_KEYS.DIRECT_MESSAGES, []);
    const newMessage: DirectMessage = {
        id: generateId(),
        senderId,
        receiverId,
        text,
        createdAt: getNow(),
        isRead: false
    };
    messages.push(newMessage);
    saveData(STORAGE_KEYS.DIRECT_MESSAGES, messages);
    return newMessage;
};

export const getMessagesBetweenUsers = (userId1: string, userId2: string): DirectMessage[] => {
    const messages = loadData<DirectMessage[]>(STORAGE_KEYS.DIRECT_MESSAGES, []);
    return messages.filter(
        msg => (msg.senderId === userId1 && msg.receiverId === userId2) ||
               (msg.senderId === userId2 && msg.receiverId === userId1)
    ).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
};

export const markMessagesAsRead = (readerId: string, senderId: string) => {
    const messages = loadData<DirectMessage[]>(STORAGE_KEYS.DIRECT_MESSAGES, []);
    let changed = false;
    messages.forEach(msg => {
        if (msg.receiverId === readerId && msg.senderId === senderId && !msg.isRead) {
            msg.isRead = true;
            changed = true;
        }
    });
    if (changed) {
        saveData(STORAGE_KEYS.DIRECT_MESSAGES, messages);
    }
};

export const getConversations = (userId: string) => {
    const messages = loadData<DirectMessage[]>(STORAGE_KEYS.DIRECT_MESSAGES, []);
    const userMessages = messages.filter(msg => msg.senderId === userId || msg.receiverId === userId);

    const conversations: Record<string, { lastMessage: DirectMessage, unreadCount: number }> = {};

    userMessages.forEach(msg => {
        const partnerId = msg.senderId === userId ? msg.receiverId : msg.senderId;

        if (!conversations[partnerId] || new Date(msg.createdAt) > new Date(conversations[partnerId].lastMessage.createdAt)) {
            if (!conversations[partnerId]) {
                conversations[partnerId] = { lastMessage: msg, unreadCount: 0 };
            } else {
                conversations[partnerId].lastMessage = msg;
            }
        }
    });

    // Calculate unread counts
    userMessages.forEach(msg => {
        if (msg.receiverId === userId && !msg.isRead) {
            const partnerId = msg.senderId;
            if (conversations[partnerId]) {
                conversations[partnerId].unreadCount++;
            }
        }
    });

    return Object.entries(conversations)
        .map(([partnerId, data]) => ({
            partnerId,
            ...data
        }))
        .sort((a, b) => new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime());
};

// --- AUTH ---
export const getPaymentSettings = (): PaymentSettings => loadData(STORAGE_KEYS.PAYMENT_SETTINGS, { activationFee: 25, bkash: '01700000000', nagad: '01700000000', rocket: '01700000000', binance: 'T9yB... (TRC20)', rate: 100 });
export const updatePaymentSettings = (s: PaymentSettings) => saveData(STORAGE_KEYS.PAYMENT_SETTINGS, s);
export const getSocialSettings = (): SocialSettings => loadData(STORAGE_KEYS.SOCIAL_SETTINGS, { facebook: '#', instagram: '#', twitter: '#', youtube: '#', linkedin: '#' });
export const updateSocialSettings = (s: SocialSettings) => saveData(STORAGE_KEYS.SOCIAL_SETTINGS, s);
export const getReferralSettings = (): ReferralSettings => loadData(STORAGE_KEYS.REFERRAL_SETTINGS, { level1: 5.0, level2: 4.0, level3: 3.0, level4: 2.0, level5: 1.0 });
export const updateReferralSettings = (s: ReferralSettings) => saveData(STORAGE_KEYS.REFERRAL_SETTINGS, s);
export const getCpaSettings = (): CpaSettings => loadData(STORAGE_KEYS.CPA_SETTINGS, { simpleRate: 0.10, complexRate: 0.50, adsViewRate: 0.005, minWorkers: 50 });
export const updateCpaSettings = (s: CpaSettings) => saveData(STORAGE_KEYS.CPA_SETTINGS, s);
export const getResourceSettings = (): ResourceSettings => loadData(STORAGE_KEYS.RESOURCE_SETTINGS, { downloadLink: 'https://drive.google.com/drive/folders/17AdKxZ5V9uuvc7wykd2SXgR4ICBKufkK' });
export const updateResourceSettings = (s: ResourceSettings) => saveData(STORAGE_KEYS.RESOURCE_SETTINGS, s);

export const loginUser = async (e: string, p: string) => {
    const users = getUsers();
    const u = users.find(x => x.email === e && x.passwordHash === p);
    if(!u) throw new Error("Invalid credentials");
    if(u.status === AccountStatus.BANNED) throw new Error("Your account has been banned. Contact support.");
    saveData(STORAGE_KEYS.USERS, users);
    return u;
}

export const registerUser = async (d: any) => { 
    const users = getUsers();
    if (users.find(u => u.email === d.email)) throw new Error('Email exists');
    if (!d.referrerId) throw new Error('Referral Code is required.');
    let referrerId: string | null = null;
    let referralChain: string[] = [];
    if (d.referrerId) {
        const directParent = users.find(u => u.referralCode === d.referrerId || u.id === d.referrerId);
        if (directParent) {
            if (!directParent.isVerified) {
                throw new Error('Only referral codes from verified users are accepted.');
            }
            referrerId = directParent.id;
            referralChain.push(directParent.id); 
            let currentAncestor = directParent;
            for (let i = 0; i < 4; i++) {
                if (currentAncestor.referrerId) {
                    const parent = users.find(u => u.id === currentAncestor.referrerId);
                    if (parent) { referralChain.push(parent.id); currentAncestor = parent; } else { break; }
                } else { break; }
            }
        } else { throw new Error('Invalid Referral Code.'); }
    }
    const newUser: User = {
        id: generateSequentialUserId(users),
        fullName: d.fullName, email: d.email, phone: d.phone, passwordHash: d.passwordHash, 
        role: UserRole.USER, status: AccountStatus.PENDING, balance: 0, 
        advertiserBalance: 0, referrerId: referrerId, referralChain: referralChain, 
        referralCode: generateId().toUpperCase(), createdAt: getNow(),
        officialWorkerStatus: OfficialWorkerStatus.NONE, isVerified: false, 
        neonColor: getRandomNeonColor(), followers: [], following: []
    };
    users.push(newUser);
    saveData(STORAGE_KEYS.USERS, users);
    return newUser;
}

export const resetPasswordWithoutToken = async (email: string, newPassword: string) => {
    const users = getUsers();
    const user = users.find(u => u.email === email);

    if (!user) {
        throw new Error("No account found with that email address.");
    }

    user.passwordHash = newPassword;
    saveData(STORAGE_KEYS.USERS, users);
    return true; // success
};

// FIX: Add missing functions for token-based password reset to resolve compile errors in ResetPassword.tsx
export const verifyPasswordResetToken = async (token: string) => {
    const tokens = loadData<{token: string, userId: string, expires: number}[]>(STORAGE_KEYS.PASSWORD_RESET_TOKENS, []);
    const tokenData = tokens.find(t => t.token === token);
    if (!tokenData) {
        throw new Error("Invalid token.");
    }
    if (Date.now() > tokenData.expires) {
        // Clean up expired token
        saveData(STORAGE_KEYS.PASSWORD_RESET_TOKENS, tokens.filter(t => t.token !== token));
        throw new Error("Token has expired.");
    }
    return true; // Token is valid
};

export const resetUserPassword = async (token: string, newPassword: string) => {
    await verifyPasswordResetToken(token); // Re-use verification logic

    const tokens = loadData<{token: string, userId: string, expires: number}[]>(STORAGE_KEYS.PASSWORD_RESET_TOKENS, []);
    const tokenData = tokens.find(t => t.token === token);
    
    if (!tokenData) throw new Error("Invalid token."); 

    const users = getUsers();
    const user = users.find(u => u.id === tokenData.userId);

    if (!user) {
        throw new Error("User associated with token not found.");
    }
    
    user.passwordHash = newPassword;
    saveData(STORAGE_KEYS.USERS, users);

    // Invalidate token after use
    const newTokens = tokens.filter(t => t.token !== token);
    saveData(STORAGE_KEYS.PASSWORD_RESET_TOKENS, newTokens);
    
    return true;
};

export const updateUserStatus = (uid: string, s: AccountStatus) => { 
    const users = getUsers();
    const u = users.find(user => user.id === uid);
    if(u) { 
        if (u.status === AccountStatus.ACTIVE && (s === AccountStatus.REVIEW || s === AccountStatus.PENDING)) return;
        u.status = s; 
        saveData(STORAGE_KEYS.USERS, users); 
    }
}

export const updateUserRole = (uid: string, r: UserRole) => { 
    const users = getUsers();
    const u = users.find(user => user.id === uid);
    if(u) { u.role = r; saveData(STORAGE_KEYS.USERS, users); }
}

export const toggleUserVerification = (uid: string) => { 
    const users = getUsers();
    const u = users.find(user => user.id === uid);
    if(u) { u.isVerified = !u.isVerified; saveData(STORAGE_KEYS.USERS, users); }
}

export const submitActivationPayment = async (uid: string, d: any) => { 
    const users = getUsers();
    const user = users.find(u => u.id === uid);
    if (!user) throw new Error("User not found");
    if (user.status === AccountStatus.REVIEW) throw new Error("Activation under review.");
    if (user.status === AccountStatus.ACTIVE) throw new Error("Already active.");
    const settings = getPaymentSettings();
    const fee = settings.activationFee || 25;
    const txs = getTransactions();
    txs.push({ id: generateId(), userId: uid, type: TransactionType.DEPOSIT, amount: fee, status: TransactionStatus.PENDING, description: 'Account Activation Fee', metadata: { paymentMethod: d.method, senderNumber: d.sender, trxId: d.trxId, proofUrl: d.proofUrl }, createdAt: getNow() });
    user.status = AccountStatus.REVIEW;
    saveData(STORAGE_KEYS.TRANSACTIONS, txs);
    saveData(STORAGE_KEYS.USERS, users);
    return user;
}

export const submitWalletDeposit = async (uid: string, amount: number, method: string, sender: string, trxId: string, proof: string) => { const txs = getTransactions(); txs.push({ id: generateId(), userId: uid, type: TransactionType.WALLET_DEPOSIT, amount: amount, status: TransactionStatus.PENDING, description: 'Wallet Deposit', metadata: { paymentMethod: method, senderNumber: sender, trxId: trxId, proofUrl: proof }, createdAt: getNow() }); saveData(STORAGE_KEYS.TRANSACTIONS, txs); };
export const depositToAdvertiser = async (uid: string, amt: number, m: string, s: string, t: string, p: string) => { const txs = getTransactions(); txs.push({ id: generateId(), userId: uid, type: TransactionType.ADVERTISER_DEPOSIT, amount: amt, status: TransactionStatus.PENDING, description: 'Ad Balance Deposit', metadata: { paymentMethod: m, senderNumber: s, trxId: t, proofUrl: p }, createdAt: getNow() }); saveData(STORAGE_KEYS.TRANSACTIONS, txs); }
export const transferWorkerToAdvertiser = async (uid: string, amount: number) => { const users = getUsers(); const user = users.find(u => u.id === uid); if (!user) throw new Error("User not found"); if (user.balance < amount) throw new Error("Insufficient balance"); user.balance -= amount; user.advertiserBalance = (user.advertiserBalance || 0) + amount; const txs = getTransactions(); txs.push({ id: generateId(), userId: uid, type: TransactionType.TRANSFER_TO_AD, amount: amount, status: TransactionStatus.COMPLETED, description: 'Transfer to Ad Balance', createdAt: getNow() }); saveData(STORAGE_KEYS.USERS, users); saveData(STORAGE_KEYS.TRANSACTIONS, txs); return user; };
export const requestWithdrawal = async (uid: string, amt: number, method: string, acc: string) => { const users = getUsers(); const user = users.find(u => u.id === uid); if (!user || user.balance < amt) throw new Error("Insufficient balance"); user.balance -= amt; saveData(STORAGE_KEYS.USERS, users); const txs = getTransactions(); txs.push({ id: generateId(), userId: uid, type: TransactionType.WITHDRAWAL, amount: amt, status: TransactionStatus.PENDING, description: 'Withdrawal Request', metadata: { paymentMethod: method, accountNumber: acc }, createdAt: getNow() }); saveData(STORAGE_KEYS.TRANSACTIONS, txs); }

export const approveActivation = async (txId: string) => { 
    const txs = getTransactions();
    const users = getUsers();
    const tx = txs.find(t => t.id === txId);
    if(tx && tx.status === TransactionStatus.PENDING) {
        tx.status = TransactionStatus.COMPLETED;
        const user = users.find(u => u.id === tx.userId);
        if(user) { 
            const originalRole = user.role; 
            user.status = AccountStatus.ACTIVE; 
            user.isVerified = true;
            user.role = originalRole; 
            const refSettings = getReferralSettings();
            const rates = [refSettings.level1, refSettings.level2, refSettings.level3, refSettings.level4, refSettings.level5];
            if (user.referralChain && user.referralChain.length > 0) {
                user.referralChain.forEach((parentId, index) => {
                    if (index < 5) {
                        const parent = users.find(u => u.id === parentId);
                        const amount = rates[index];
                        if (parent && amount > 0) {
                            parent.balance += amount;
                            txs.push({ id: generateId(), userId: parent.id, type: TransactionType.REFERRAL_COMMISSION, amount: amount, status: TransactionStatus.COMPLETED, description: `Referral Bonus: Level ${index + 1} from ${user.fullName}`, metadata: { relatedUserId: user.id, level: index + 1, proofUrl: tx.id }, createdAt: getNow() });
                        }
                    }
                });
            }
            saveData(STORAGE_KEYS.USERS, users); 
        }
        saveData(STORAGE_KEYS.TRANSACTIONS, txs);
    }
}
export const rejectActivation = async (txId: string) => { const txs = getTransactions(); const tx = txs.find(t => t.id === txId); const users = getUsers(); if(tx && tx.status === TransactionStatus.PENDING) { tx.status = TransactionStatus.REJECTED; const user = users.find(u => u.id === tx.userId); if (user && user.status === AccountStatus.REVIEW) { user.status = AccountStatus.PENDING; saveData(STORAGE_KEYS.USERS, users); } saveData(STORAGE_KEYS.TRANSACTIONS, txs); } }

export const approveDeposit = async (txId: string) => {
  const txs = getTransactions();
  const users = getUsers();
  const tx = txs.find(t => t.id === txId);
  
  if (tx && tx.status === TransactionStatus.PENDING) {
    const user = users.find(u => u.id === tx.userId);
    if (user) {
      if (tx.type === TransactionType.WALLET_DEPOSIT) {
        // Safeguard added for robustness
        user.balance = (user.balance || 0) + tx.amount;
      } else if (tx.type === TransactionType.ADVERTISER_DEPOSIT) {
        // Refactored to be more explicit and robust, preventing potential data corruption
        // that could lead to session instability.
        const currentAdBalance = user.advertiserBalance || 0;
        user.advertiserBalance = currentAdBalance + tx.amount;
      }
      
      tx.status = TransactionStatus.COMPLETED;
      
      saveData(STORAGE_KEYS.USERS, users);
      saveData(STORAGE_KEYS.TRANSACTIONS, txs);
    }
  }
};
export const rejectDeposit = async (txId: string) => { const txs = getTransactions(); const tx = txs.find(t => t.id === txId); if(tx) { tx.status = TransactionStatus.REJECTED; saveData(STORAGE_KEYS.TRANSACTIONS, txs); } };
export const approveAdvertiserDeposit = approveDeposit; export const rejectAdvertiserDeposit = rejectDeposit;
export const approveWithdrawal = async (txId: string) => { const txs = getTransactions(); const tx = txs.find(t => t.id === txId); if(tx) { tx.status = TransactionStatus.COMPLETED; saveData(STORAGE_KEYS.TRANSACTIONS, txs); } }
export const rejectWithdrawal = async (txId: string) => { const txs = getTransactions(); const users = getUsers(); const tx = txs.find(t => t.id === txId); if(tx && tx.status === TransactionStatus.PENDING) { tx.status = TransactionStatus.REJECTED; const user = users.find(u => u.id === tx.userId); if(user) { user.balance += tx.amount; saveData(STORAGE_KEYS.USERS, users); } saveData(STORAGE_KEYS.TRANSACTIONS, txs); } }

export const getOfficialCodes = () => loadData<OfficialCode[]>(STORAGE_KEYS.OFFICIAL_CODES, []);
export const generateOfficialWorkerCode = () => { const codes = getOfficialCodes(); const newCode: OfficialCode = { id: generateId(), code: `HPJ-${Math.random().toString(36).substring(2, 8).toUpperCase()}`, status: 'GENERATED', createdAt: getNow() }; codes.push(newCode); saveData(STORAGE_KEYS.OFFICIAL_CODES, codes); return newCode; };
export const submitOfficialWorkerRequest = (uid: string, name: string, phone: string, codeInput: string) => { const users = getUsers(); const user = users.find(u => u.id === uid); if (!user) throw new Error("User not found"); const codes = getOfficialCodes(); const validCode = codes.find(c => c.code === codeInput && c.status === 'GENERATED'); if (!validCode) throw new Error("Invalid or already used Secret Code."); validCode.status = 'USED'; validCode.usedBy = uid; validCode.usedByName = user.fullName; validCode.usedAt = getNow(); saveData(STORAGE_KEYS.OFFICIAL_CODES, codes); user.officialWorkerStatus = OfficialWorkerStatus.APPROVED; saveData(STORAGE_KEYS.USERS, users); const reqs = getOfficialWorkerRequests(); reqs.push({ id: generateId(), userId: uid, fullName: name, phone, secretCode: codeInput, status: OfficialWorkerStatus.APPROVED, createdAt: getNow() }); saveData(STORAGE_KEYS.OFFICIAL_REQUESTS, reqs); return user; };
export const getOfficialWorkerRequests = () => loadData<OfficialWorkerRequest[]>(STORAGE_KEYS.OFFICIAL_REQUESTS, []);
export const getHighPayingJobs = () => loadData<HighPayingJob[]>(STORAGE_KEYS.OFFICIAL_JOBS, []);
export const createHighPayingJob = (job: HighPayingJob) => { const jobs = getHighPayingJobs(); jobs.push(job); saveData(STORAGE_KEYS.OFFICIAL_JOBS, jobs); };
export const updateHighPayingJob = (id: string, updates: Partial<HighPayingJob>) => { const jobs = getHighPayingJobs(); const idx = jobs.findIndex(j => j.id === id); if (idx !== -1) { jobs[idx] = { ...jobs[idx], ...updates }; saveData(STORAGE_KEYS.OFFICIAL_JOBS, jobs); } };
export const deleteHighPayingJob = (id: string) => { const jobs = getHighPayingJobs(); saveData(STORAGE_KEYS.OFFICIAL_JOBS, jobs.filter(j => j.id !== id)); };
export const getAllOfficialAccountSubmissions = () => loadData<OfficialAccountSubmission[]>(STORAGE_KEYS.OFFICIAL_ACCOUNT_DATA, []);
export const getOfficialAccountData = (userId: string) => getAllOfficialAccountSubmissions().filter(s => s.userId === userId);
export const submitOfficialAccountData = (uid: string, jobId: string, data: Record<string, string>) => { const jobs = getHighPayingJobs(); const job = jobs.find(j => j.id === jobId); if (!job) throw new Error("Job not found or inactive."); const subs = getAllOfficialAccountSubmissions(); subs.push({ id: generateId(), userId: uid, jobId: job.id, jobTitle: job.title, data, fbName: data['Facebook ID Name'] || data[Object.keys(data)[0]] || 'Unknown', status: SubmissionStatus.PENDING, reward: job.reward, submittedAt: getNow() }); saveData(STORAGE_KEYS.OFFICIAL_ACCOUNT_DATA, subs); };
export const approveOfficialAccountSubmission = async (id: string) => { const subs = getAllOfficialAccountSubmissions(); const sub = subs.find(s => s.id === id); if (sub && sub.status === SubmissionStatus.PENDING) { sub.status = SubmissionStatus.APPROVED; const users = getUsers(); const u = users.find(us => us.id === sub.userId); if (u) { u.balance += sub.reward; const txs = getTransactions(); txs.push({ id: generateId(), userId: u.id, type: TransactionType.OFFICIAL_JOB_PAYMENT, amount: sub.reward, status: TransactionStatus.COMPLETED, description: `High Paying Job: ${sub.jobTitle}`, metadata: { jobId: sub.id }, createdAt: getNow() }); saveData(STORAGE_KEYS.USERS, users); saveData(STORAGE_KEYS.TRANSACTIONS, txs); } saveData(STORAGE_KEYS.OFFICIAL_ACCOUNT_DATA, subs); } };
export const rejectOfficialAccountSubmission = async (id: string) => { const subs = getAllOfficialAccountSubmissions(); const sub = subs.find(s => s.id === id); if (sub) { sub.status = SubmissionStatus.REJECTED; saveData(STORAGE_KEYS.OFFICIAL_ACCOUNT_DATA, subs); } };

// Stubbed legacy functions (Gigs, Products, etc.) - assume exist as per previous files or minimal impl.
export const getMyGigs = (uid: string) => getGigs().filter(g => g.userId === uid);
export const createGig = (uid: string, data: any) => { 
    const gigs = getGigs();
    gigs.push({ id: generateId(), userId: uid, ...data, createdAt: getNow() });
    saveData(STORAGE_KEYS.GIGS, gigs);
};
export const updateGig = (id: string, data: any) => {
    const gigs = getGigs();
    const idx = gigs.findIndex(g => g.id === id);
    if(idx !== -1) { gigs[idx] = { ...gigs[idx], ...data }; saveData(STORAGE_KEYS.GIGS, gigs); }
};
export const deleteGig = (id: string) => {
    const gigs = getGigs().filter(g => g.id !== id);
    saveData(STORAGE_KEYS.GIGS, gigs);
};
export const adminUpdateGigStatus = (id: string, s: GigStatus, r?: string) => {
    const gigs = getGigs();
    const gig = gigs.find(g => g.id === id);
    if(gig) { gig.status = s; gig.rejectionReason = r; saveData(STORAGE_KEYS.GIGS, gigs); }
};
export const createProduct = (uid: string, data: any) => {};
export const deleteProduct = (id: string) => {};
export const createOrder = (uid: string, pid: string) => {};
export const confirmOrder = (oid: string) => {};
export const cancelOrder = (oid: string) => {};
export const getArticleById = (id: string) => undefined;
export const createArticle = (data: any) => {};
export const updateArticle = (id: string, data: any) => {};
export const deleteArticle = (id: string) => {};

// NEW FUNCTIONS IMPLEMENTATION

// Task Management
export const createTask = (task: Task) => {
    const tasks = getTasks();
    tasks.push(task);
    saveData(STORAGE_KEYS.TASKS, tasks);
};

export const deleteTask = (id: string) => {
    let tasks = getTasks();
    tasks = tasks.filter(t => t.id !== id);
    saveData(STORAGE_KEYS.TASKS, tasks);
};

export const adminApproveTask = (id: string) => {
    const tasks = getTasks();
    const t = tasks.find(x => x.id === id);
    if(t) {
        t.status = 'APPROVED';
        saveData(STORAGE_KEYS.TASKS, tasks);
    }
};

export const adminRejectTask = (id: string) => {
    const tasks = getTasks();
    const t = tasks.find(x => x.id === id);
    if(t) {
        t.status = 'REJECTED';
        saveData(STORAGE_KEYS.TASKS, tasks);
    }
};

export const submitTask = async (userId: string, taskId: string, proof: { text?: string, image?: string }) => {
    const subs = getSubmissions();
    if(subs.find(s => s.userId === userId && s.taskId === taskId)) throw new Error("Already submitted");
    
    subs.push({
        id: generateId(),
        taskId,
        userId,
        textProof: proof.text,
        imageProofUrl: proof.image,
        status: SubmissionStatus.PENDING,
        submittedAt: getNow()
    });
    saveData(STORAGE_KEYS.SUBMISSIONS, subs);
};

export const approveSubmission = async (id: string) => {
    const subs = getSubmissions();
    const sub = subs.find(s => s.id === id);
    if(sub && sub.status === SubmissionStatus.PENDING) {
        sub.status = SubmissionStatus.APPROVED;
        
        // Pay User
        const tasks = getTasks();
        const task = tasks.find(t => t.id === sub.taskId);
        if(task) {
            const users = getUsers();
            const worker = users.find(u => u.id === sub.userId);
            if(worker) {
                worker.balance += task.reward;
                
                // Add Transaction
                const txs = getTransactions();
                txs.push({
                    id: generateId(),
                    userId: worker.id,
                    type: TransactionType.TASK_REWARD,
                    amount: task.reward,
                    status: TransactionStatus.COMPLETED,
                    description: `Task Reward: ${task.title}`,
                    metadata: { taskId: task.id },
                    createdAt: getNow()
                });
                saveData(STORAGE_KEYS.TRANSACTIONS, txs);
                saveData(STORAGE_KEYS.USERS, users);
            }
        }
        saveData(STORAGE_KEYS.SUBMISSIONS, subs);
    }
};

export const rejectSubmission = async (id: string) => {
    const subs = getSubmissions();
    const sub = subs.find(s => s.id === id);
    if(sub && sub.status === SubmissionStatus.PENDING) {
        sub.status = SubmissionStatus.REJECTED;
        saveData(STORAGE_KEYS.SUBMISSIONS, subs);
    }
};

// Advertiser Jobs
export const createAdvertiserJob = async (creatorId: string, jobData: any) => {
    const tasks = getTasks();
    tasks.push({
        id: generateId(),
        creatorId,
        ...jobData,
        status: 'PENDING',
        createdAt: getNow()
    });
    saveData(STORAGE_KEYS.TASKS, tasks);
};

// Categories & Subcategories
export const getSubcategoriesByCategoryId = (catId: string) => {
    return getSubcategories().filter(s => s.categoryId === catId);
};

export const createCategory = (name: string, description?: string) => {
    const cats = getCategories();
    cats.push({ id: generateId(), name, description, status: 'ACTIVE' });
    saveData(STORAGE_KEYS.CATEGORIES, cats);
};

export const updateCategory = (id: string, updates: Partial<Category>) => {
    const cats = getCategories();
    const idx = cats.findIndex(c => c.id === id);
    if(idx !== -1) {
        cats[idx] = { ...cats[idx], ...updates };
        saveData(STORAGE_KEYS.CATEGORIES, cats);
    }
};

export const deleteCategory = (id: string) => {
    let cats = getCategories();
    cats = cats.filter(c => c.id !== id);
    saveData(STORAGE_KEYS.CATEGORIES, cats);
    // Cascade delete subcategories
    let subs = getSubcategories();
    subs = subs.filter(s => s.categoryId !== id);
    saveData(STORAGE_KEYS.SUBCATEGORIES, subs);
};

export const createSubcategory = (categoryId: string, name: string, minBudget: number) => {
    const subs = getSubcategories();
    subs.push({ id: generateId(), categoryId, name, minBudget, status: 'ACTIVE' });
    saveData(STORAGE_KEYS.SUBCATEGORIES, subs);
};

export const updateSubcategory = (id: string, updates: Partial<Subcategory>) => {
    const subs = getSubcategories();
    const idx = subs.findIndex(s => s.id === id);
    if(idx !== -1) {
        subs[idx] = { ...subs[idx], ...updates };
        saveData(STORAGE_KEYS.SUBCATEGORIES, subs);
    }
};

export const deleteSubcategory = (id: string) => {
    let subs = getSubcategories();
    subs = subs.filter(s => s.id !== id);
    saveData(STORAGE_KEYS.SUBCATEGORIES, subs);
};

// CPA
export const createCpaCampaign = async (creatorId: string, data: any) => {
    const campaigns = getCpaCampaigns();
    const newCamp: CpaCampaign = {
        id: generateId(),
        creatorId,
        ...data,
        spent: 0,
        status: 'PENDING',
        createdAt: getNow(),
        pixelId: generateId()
    };
    campaigns.push(newCamp);
    saveData(STORAGE_KEYS.CPA_CAMPAIGNS, campaigns);
    return newCamp;
};

export const approveCpaCampaign = (id: string) => {
    const camps = getCpaCampaigns();
    const c = camps.find(x => x.id === id);
    if(c) { c.status = 'ACTIVE'; saveData(STORAGE_KEYS.CPA_CAMPAIGNS, camps); }
};

export const rejectCpaCampaign = (id: string) => {
    const camps = getCpaCampaigns();
    const c = camps.find(x => x.id === id);
    if(c) { c.status = 'REJECTED'; saveData(STORAGE_KEYS.CPA_CAMPAIGNS, camps); }
};

export const trackClick = (campaignId: string, workerId: string) => {
    const clicks = getClickLogs();
    const id = generateId();
    clicks.push({
        id,
        campaignId,
        workerId,
        ip: '127.0.0.1', // Mock
        userAgent: navigator.userAgent,
        country: 'US', // Mock
        clickedAt: getNow(),
        converted: false
    });
    saveData(STORAGE_KEYS.CPA_CLICKS, clicks);
    return id;
};

export const triggerPixelConversion = (clickId: string) => {
    const clicks = getClickLogs();
    const click = clicks.find(c => c.id === clickId);
    if(!click) throw new Error("Invalid Click ID");
    if(click.converted) throw new Error("Already converted");

    click.converted = true;
    saveData(STORAGE_KEYS.CPA_CLICKS, clicks);

    const campaigns = getCpaCampaigns();
    const campaign = campaigns.find(c => c.id === click.campaignId);
    
    if(campaign) {
        campaign.spent += campaign.payoutPerAction;
        saveData(STORAGE_KEYS.CPA_CAMPAIGNS, campaigns);

        const conversions = getConversionLogs();
        conversions.push({
            id: generateId(),
            clickId: click.id,
            campaignId: campaign.id,
            workerId: click.workerId,
            payout: campaign.payoutPerAction,
            convertedAt: getNow()
        });
        saveData(STORAGE_KEYS.CPA_CONVERSIONS, conversions);

        // Pay Worker
        const users = getUsers();
        const worker = users.find(u => u.id === click.workerId);
        if(worker) {
            worker.balance += campaign.payoutPerAction;
            
            const txs = getTransactions();
            txs.push({
                id: generateId(),
                userId: worker.id,
                type: TransactionType.CPA_REWARD,
                amount: campaign.payoutPerAction,
                status: TransactionStatus.COMPLETED,
                description: `CPA Reward: ${campaign.title}`,
                createdAt: getNow()
            });
            saveData(STORAGE_KEYS.TRANSACTIONS, txs);
            saveData(STORAGE_KEYS.USERS, users);
        }
    }
};

// Social Feed
export const getFeed = (userId?: string) => {
    // In a real app, logic to show posts from friends + popular
    return getPosts().reverse(); 
};

export const createPost = (userId: string, data: any) => {
    const posts = getPosts();
    posts.push({
        id: generateId(),
        userId,
        ...data,
        likes: [],
        views: 0,
        comments: [],
        shares: 0,
        createdAt: getNow(),
        status: 'ACTIVE'
    });
    saveData(STORAGE_KEYS.POSTS, posts);
};

export const deletePost = (id: string) => {
    let posts = getPosts();
    posts = posts.filter(p => p.id !== id);
    saveData(STORAGE_KEYS.POSTS, posts);
};

export const getPostById = (id: string) => {
    return getPosts().find(p => p.id === id);
};

export const toggleLikePost = (postId: string, userId: string) => {
    const posts = getPosts();
    const post = posts.find(p => p.id === postId);
    if(post) {
        if(post.likes.includes(userId)) {
            post.likes = post.likes.filter(id => id !== userId);
        } else {
            post.likes.push(userId);
        }
        saveData(STORAGE_KEYS.POSTS, posts);
    }
};

export const incrementPostView = (postId: string) => {
    const posts = getPosts();
    const post = posts.find(p => p.id === postId);
    if(post) {
        post.views += 1;
        saveData(STORAGE_KEYS.POSTS, posts);
    }
};

export const addComment = (postId: string, userId: string, text: string) => {
    const posts = getPosts();
    const post = posts.find(p => p.id === postId);
    if(post) {
        const comment: Comment = {
            id: generateId(),
            userId,
            text,
            createdAt: getNow()
        };
        post.comments.push(comment);
        saveData(STORAGE_KEYS.POSTS, posts);
        return comment;
    }
    throw new Error("Post not found");
};

export const toggleFollowUser = (currentUserId: string, targetUserId: string) => {
    const users = getUsers();
    const currentUser = users.find(u => u.id === currentUserId);
    const targetUser = users.find(u => u.id === targetUserId);
    
    if(currentUser && targetUser) {
        if(currentUser.following.includes(targetUserId)) {
            // Unfollow
            currentUser.following = currentUser.following.filter(id => id !== targetUserId);
            targetUser.followers = targetUser.followers.filter(id => id !== currentUserId);
        } else {
            // Follow
            currentUser.following.push(targetUserId);
            targetUser.followers.push(currentUserId);
        }
        saveData(STORAGE_KEYS.USERS, users);
    }
};