
export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

export enum AccountStatus {
  PENDING = 'PENDING',
  REVIEW = 'REVIEW',
  ACTIVE = 'ACTIVE',
  BANNED = 'BANNED'
}

export enum OfficialWorkerStatus {
  NONE = 'NONE',
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  passwordHash: string;
  role: UserRole;
  status: AccountStatus;
  balance: number;
  advertiserBalance: number;
  referrerId: string | null;
  referralChain: string[];
  referralCode: string;
  createdAt: string;
  officialWorkerStatus?: OfficialWorkerStatus;
  profilePhoto?: string;
  isVerified?: boolean;
  neonColor?: string;
  followers: string[];
  following: string[];
}

// --- MESSAGING & NOTIFICATION TYPES ---

export interface Notification {
  id: string;
  userId: string; // Recipient
  type: 'BROADCAST' | 'REPLY' | 'SYSTEM';
  subject: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export enum MessageStatus {
  SENT = 'SENT',
  SEEN = 'SEEN',
  REPLIED = 'REPLIED'
}

export interface UserMessage {
  id: string;
  userId: string; // Sender
  subject: string;
  message: string;
  status: MessageStatus;
  adminReply?: string; // If replied
  createdAt: string;
}

// FIX: Add DirectMessage interface for user-to-user chat
export interface DirectMessage {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  createdAt: string;
  isRead: boolean;
}

// --- GIVEAWAY TYPES ---

export enum GiveawayTaskType {
  FACEBOOK_FOLLOW = 'FACEBOOK_FOLLOW',
  TIKTOK_FOLLOW = 'TIKTOK_FOLLOW',
  YOUTUBE_SUBSCRIBE = 'YOUTUBE_SUBSCRIBE',
  INSTAGRAM_FOLLOW = 'INSTAGRAM_FOLLOW',
  LINKEDIN_FOLLOW = 'LINKEDIN_FOLLOW',
  TWITTER_FOLLOW = 'TWITTER_FOLLOW',
}

export interface GiveawayPrize {
  rank: number;
  amount: number;
}

export interface GiveawaySettings {
  joinPrice: number;
  minParticipants: number;
  rules: string;
  prizes: GiveawayPrize[];
  tasks: {
    facebook: string;
    tiktok: string;
    youtube: string;
    instagram: string;
    linkedin: string;
    twitter: string;
  }
}

export interface GiveawayTaskSubmissionProof {
  type: GiveawayTaskType;
  proofLink: string;
  proofScreenshot: string; // base64 string
}

export enum GiveawaySubmissionStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export interface GiveawaySubmission {
  id: string;
  userId: string;
  submittedUid: string;
  status: GiveawaySubmissionStatus;
  tasks: GiveawayTaskSubmissionProof[];
  submittedAt: string;
}

export interface GiveawayWinner {
  rank: number;
  userId: string;
  prizeAmount: number;
  prizeSent: boolean;
  wonAt: string;
}


// --- OTHER TYPES ---

export interface Category {
  id: string;
  name: string;
  description?: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface Subcategory {
  id: string;
  categoryId: string;
  name: string;
  minBudget: number;
  status: 'ACTIVE' | 'INACTIVE';
}

export enum TaskCategory {
  SOCIAL = 'Social Media',
  SEO = 'SEO / Web Visit',
  SIGNUP = 'Sign Up',
  CONTENT = 'Content Creation',
  OTHER = 'Other'
}

export interface Task {
  id: string;
  creatorId?: string;
  title: string;
  description: string;
  reward: number;
  totalBudget?: number;
  requirements: string[];
  proofType: 'TEXT' | 'IMAGE' | 'VIDEO' | 'MIXED';
  category: string;
  subcategory?: string;
  targetCountry?: string;
  maxWorkers: number;
  duration?: number;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

export enum SubmissionStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export interface TaskSubmission {
  id: string;
  taskId: string;
  userId: string;
  textProof?: string;
  imageProofUrl?: string;
  status: SubmissionStatus;
  submittedAt: string;
}

export enum TransactionType {
  DEPOSIT = 'DEPOSIT',
  WALLET_DEPOSIT = 'WALLET_DEPOSIT',
  ADVERTISER_DEPOSIT = 'ADVERTISER_DEPOSIT',
  WITHDRAWAL = 'WITHDRAWAL',
  TASK_REWARD = 'TASK_REWARD',
  REFERRAL_COMMISSION = 'REFERRAL_COMMISSION',
  OFFICIAL_JOB_PAYMENT = 'OFFICIAL_JOB_PAYMENT',
  TRANSFER_TO_AD = 'TRANSFER_TO_AD',
  AD_SPEND = 'AD_SPEND',
  CPA_REWARD = 'CPA_REWARD',
  PRODUCT_PURCHASE = 'PRODUCT_PURCHASE',
  PRODUCT_SALE = 'PRODUCT_SALE',
  PRODUCT_REFUND = 'PRODUCT_REFUND',
  SECRET_CODE_REDEEM = 'SECRET_CODE_REDEEM',
  GIVEAWAY_PRIZE = 'GIVEAWAY_PRIZE'
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REJECTED = 'REJECTED'
}

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  status: TransactionStatus;
  description: string;
  metadata?: {
    binanceId?: string;
    proofUrl?: string;
    paymentMethod?: string;
    senderNumber?: string;
    accountNumber?: string;
    trxId?: string;
    relatedUserId?: string;
    level?: number;
    taskId?: string;
    jobId?: string;
    campaignId?: string;
    orderId?: string;
    productId?: string;
    code?: string;
  };
  createdAt: string;
}

export interface OfficialCode {
  id: string;
  code: string;
  status: 'GENERATED' | 'USED';
  usedBy?: string;
  usedByName?: string;
  usedAt?: string;
  createdAt: string;
}

export interface OfficialWorkerRequest {
  id: string;
  userId: string;
  fullName: string;
  phone: string;
  secretCode: string;
  status: OfficialWorkerStatus;
  createdAt: string;
}

export interface JobField {
  id: string;
  label: string;
  type: 'text' | 'number' | 'email' | 'password' | 'url' | 'tel' | 'textarea';
  required: boolean;
  placeholder?: string;
}

export interface HighPayingJob {
  id: string;
  title: string;
  description?: string;
  status: 'ACTIVE' | 'INACTIVE';
  reward: number;
  fields: JobField[];
  createdAt: string;
}

export interface OfficialAccountSubmission {
  id: string;
  userId: string;
  jobId: string;
  jobTitle: string;
  data: Record<string, string>;
  fbName?: string;
  phone?: string;
  status: SubmissionStatus;
  reward: number;
  submittedAt: string;
}

export interface SecretCode {
  id: string;
  code: string;
  amount: number;
  status: 'GENERATED' | 'SUBMITTED' | 'CLAIMED' | 'REJECTED';
  usedBy?: string;
  createdAt: string;
  updatedAt?: string;
}

export enum GigStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export const GIG_CATEGORIES = [
  'Digital Marketing', 'Graphics & Design', 'Writing & Translation', 'Video & Animation', 'Programming & Tech', 'Business', 'Lifestyle'
];

export interface Gig {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  tags: string[];
  price: number;
  deliveryTime: number;
  revisions: number;
  imageUrl: string;
  status: GigStatus;
  rejectionReason?: string;
  createdAt: string;
}

export interface Product {
  id: string;
  sellerId: string;
  title: string;
  description: string;
  price: number;
  imageUrl: string;
  createdAt: string;
}

export enum OrderStatus {
  PENDING_CONFIRMATION = 'PENDING_CONFIRMATION',
  COMPLETED = 'COMPLETED',
  CANCELLATION_REQUESTED = 'CANCELLATION_REQUESTED',
  CANCELLED = 'CANCELLED',
  DISPUTE_OPEN = 'DISPUTE_OPEN',
  DISPUTE_RESOLVED = 'DISPUTE_RESOLVED'
}

export interface Order {
  id: string;
  productId: string;
  productTitle: string;
  buyerId: string;
  sellerId: string;
  amount: number;
  status: OrderStatus;
  cancellationReason?: string;
  createdAt: string;
}

export interface Dispute {
  id: string;
  orderId: string;
  raisedBy: string;
  subject: string;
  description: string;
  proofUrl: string;
  status: 'OPEN' | 'RESOLVED';
  createdAt: string;
}

export type PostType = 'SHORT' | 'VIDEO' | 'IMAGE' | 'TEXT';

export interface Comment {
  id: string;
  userId: string;
  text: string;
  createdAt: string;
}

export interface Post {
  id: string;
  userId: string;
  type: PostType;
  title: string;
  description: string;
  mediaUrl?: string;
  thumbnail?: string;
  likes: string[];
  views: number;
  comments: Comment[];
  shares: number;
  createdAt: string;
  status: 'ACTIVE' | 'BANNED';
}

export enum ArticleStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED'
}

export interface ArticleButton {
  id: string;
  text: string;
  color: string;
  link: string;
  target: '_blank' | '_self';
}

export interface Article {
  id: string;
  title: string;
  thumbnail: string;
  category: string;
  content: string;
  status: ArticleStatus;
  buttons: ArticleButton[];
  createdAt: string;
  updatedAt: string;
}

export interface PaymentSettings {
  activationFee: number;
  bkash: string;
  nagad: string;
  rocket: string;
  binance: string;
  rate: number;
}

export interface SocialSettings {
  facebook: string;
  instagram: string;
  twitter: string;
  youtube: string;
  linkedin: string;
}

export interface ReferralSettings {
  level1: number; level2: number; level3: number; level4: number; level5: number;
}

export interface ResourceSettings {
  downloadLink: string;
}

export type CpaType = 'ADS_VIEW' | 'SIGNUP_SIMPLE' | 'SIGNUP_COMPLEX';

export interface CpaSettings {
  simpleRate: number;
  complexRate: number;
  adsViewRate: number;
  minWorkers: number;
}

export interface CpaCampaign {
  id: string;
  creatorId: string;
  title: string;
  description: string;
  targetUrl: string;
  type: CpaType;
  targetCountries: string[];
  payoutPerAction: number;
  budget: number;
  spent: number;
  status: 'PENDING' | 'ACTIVE' | 'PAUSED' | 'REJECTED';
  createdAt: string;
  pixelId: string;
  minSeconds?: number;
}

export interface ClickLog {
  id: string;
  campaignId: string;
  workerId: string;
  ip: string;
  userAgent: string;
  country: string;
  clickedAt: string;
  converted: boolean;
}

export interface ConversionLog {
  id: string;
  clickId: string;
  campaignId: string;
  workerId: string;
  payout: number;
  convertedAt: string;
}