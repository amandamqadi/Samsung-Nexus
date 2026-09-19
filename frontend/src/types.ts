import type { Timestamp } from 'firebase/firestore';

export type Role = 'visitor' | 'user' | 'admin';

export type Theme = 'dark' | 'light';

export type Track = 'AI & Robotics' | 'IoT' | 'Cloud' | 'Data Science' | 'Cybersecurity';

export type OpportunityType = 'Full-time' | 'Internship' | 'Fellowship';

export interface Opportunity {
  id: string;
  title: string;
  company: string;
  type: OpportunityType;
  location: string;
  salaryRange: string;
  postedDate: string;
  description: string;
  applicantsCount: number;
  postedBy: string;
}

export interface NexusEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  format: 'Virtual' | 'In-Person';
  attendeesCount: number;
  postedBy: string;
}

export interface Message {
  id: string;
  senderId: 'me' | string;
  text: string;
  timestamp: string;
}

export interface Conversation {
  id: string;
  participantName: string;
  participantInitials: string;
  role: string;
  lastMessagePreview: string;
  unread: number;
  messages: Message[];
}

export interface AssistantMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export interface VerificationApplicant {
  id: string;
  name: string;
  cohortYear: number;
  track: Track;
  submittedDate: string;
  status: 'Pending' | 'Verified' | 'Flagged';
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  date: string;
  author: string;
}

export type DocumentType = 'ID Document' | 'CV / Resume' | 'Certificate' | 'Other';

export interface AlumniDocument {
  id: string;
  ownerId: string;
  ownerName: string;
  docType: DocumentType;
  fileName: string;
  sizeLabel: string;
  uploadedDate: string;
  url: string;
  fileType: string;
  storagePath: string;
}

export interface AlumniProject {
  id: string;
  ownerId: string;
  ownerName: string;
  title: string;
  description: string;
  link?: string;
  tags: string[];
  createdDate: string;
}

export interface CurrentUser {
  uid: string;
  name: string;
  email: string;
  role: Role;
  cohortYear: number;
  track: Track;
  idNumber?: string;
  idVerified?: boolean;
  connectionsCount?: number;
  followersCount?: number;
  university?: string;
}

export interface ExperienceEntry {
  id: string;
  title: string;
  company: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

export interface EducationEntry {
  id: string;
  school: string;
  degree: string;
  field: string;
  startYear: string;
  endYear: string;
  highlights: string;
}

export interface CertificationEntry {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  credentialId: string;
}

export interface SkillEntry {
  id: string;
  name: string;
  pinned: boolean;
}

export interface RecommendationEntry {
  id: string;
  authorName: string;
  authorRole: string;
  text: string;
  date: string;
}

export interface PublicationEntry {
  id: string;
  kind: 'Publication' | 'Honor';
  title: string;
  publisher: string;
  date: string;
  url: string;
}

export interface VolunteerEntry {
  id: string;
  role: string;
  organization: string;
  cause: string;
  startDate: string;
  endDate: string;
  description: string;
}

export const LANGUAGE_PROFICIENCIES = [
  'Elementary',
  'Limited Working',
  'Professional Working',
  'Full Professional',
  'Native or Bilingual',
] as const;
export type LanguageProficiency = (typeof LANGUAGE_PROFICIENCIES)[number];

export interface LanguageEntry {
  id: string;
  name: string;
  proficiency: LanguageProficiency;
}

export interface ProfileListMap {
  experience: ExperienceEntry;
  education: EducationEntry;
  certifications: CertificationEntry;
  skills: SkillEntry;
  recommendations: RecommendationEntry;
  publications: PublicationEntry;
  volunteer: VolunteerEntry;
  languages: LanguageEntry;
}

export type ProfileListKey = keyof ProfileListMap;

export interface ExtendedProfile {
  headline: string;
  location: string;
  industry: string;
  websiteUrl: string;
  customUrlSlug: string;
  avatarUrl: string;
  bannerUrl: string;
  about: string;
  experience: ExperienceEntry[];
  education: EducationEntry[];
  certifications: CertificationEntry[];
  skills: SkillEntry[];
  recommendations: RecommendationEntry[];
  publications: PublicationEntry[];
  volunteer: VolunteerEntry[];
  languages: LanguageEntry[];
  savedOpportunityIds: string[];
  rsvpedEventIds: string[];
  followedUids: string[];
  connectedUids: string[];
}

export interface JobApplication {
  id: string;
  applicantId: string;
  opportunityId: string;
  opportunityTitle: string;
  company: string;
  applicantName: string;
  applicantEmail: string;
  headline: string;
  skills: string[];
  cvFileName?: string;
  cvUrl?: string;
  appliedDate: string;
}

export interface AppNotification {
  id: string;
  message: string;
  timestamp: string;
}

export interface FeedComment {
  id: string;
  authorId: string;
  authorName: string;
  text: string;
  createdDate: string;
}

export interface FeedPost {
  id: string;
  authorId: string;
  authorName: string;
  authorTrack: Track;
  title: string;
  description: string;
  link?: string;
  tags: string[];
  createdDate: string;
  likedBy: string[];
  comments: FeedComment[];
}

// ---------------------------------------------------------------------------
// Nexus Battles
// ---------------------------------------------------------------------------

export const DEFAULT_QUIZ_CATEGORIES = [
  'Artificial Intelligence', 'Python', 'Java', 'C#', 'SQL', 'Cloud Computing',
  'Cybersecurity', 'Networking', 'Data Science', 'Prompt Engineering',
  'Interview Preparation', 'Soft Skills', 'Career Development', 'Entrepreneurship',
] as const;

export const DIFFICULTY_LEVELS = ['Beginner', 'Intermediate', 'Advanced'] as const;
export type DifficultyLevel = (typeof DIFFICULTY_LEVELS)[number];

export const BATTLE_MODES = [
  'Practice', 'Random Match', 'Challenge Friend', 'University Battle', 'Samsung Cohort Battle', 'Ranked Match',
] as const;
export type BattleMode = (typeof BATTLE_MODES)[number];

export interface QuizQuestion {
  id: string;
  category: string;
  subtopic: string;
  difficulty: DifficultyLevel;
  question: string;
  options: string[];
  correctIndex: number;
}

export interface BattlePlayer {
  uid: string;
  name: string;
  track: Track;
  skillRatingBefore: number;
  answers: (number | null)[];
  score: number;
  finishedAt: Timestamp | null;
  totalTimeMs: number | null;
}

export type BattleStatus = 'active' | 'completed';

export interface Battle {
  id: string;
  mode: BattleMode;
  category: string;
  difficulty: DifficultyLevel;
  questions: QuizQuestion[];
  questionSeconds: number;
  players: BattlePlayer[];
  playerUids: string[];
  status: BattleStatus;
  winnerUid: string | 'tie' | null;
  statsProcessed: boolean;
  createdAt: Timestamp | null;
  completedAt: Timestamp | null;
}

export interface BattleQueueEntry {
  uid: string;
  name: string;
  track: Track;
  mode: BattleMode;
  category: string;
  difficulty: DifficultyLevel;
  skillRating: number;
  university: string;
  cohortYear: number;
  status: 'waiting' | 'matched' | 'cancelled';
  matchedBattleId: string | null;
  challengeTargetUid: string | null;
  createdAt: Timestamp | null;
}

export interface BattleChallenge {
  id: string;
  fromUid: string;
  fromName: string;
  toUid: string;
  category: string;
  difficulty: DifficultyLevel;
  status: 'pending' | 'accepted' | 'declined';
  battleId: string | null;
  createdAt: Timestamp | null;
}

export interface BattleStats {
  uid: string;
  skillRating: number;
  xp: number;
  wins: number;
  losses: number;
  ties: number;
  battlesPlayed: number;
  badges: string[];
}

export const EMPTY_BATTLE_STATS_BASE = {
  skillRating: 1000,
  xp: 0,
  wins: 0,
  losses: 0,
  ties: 0,
  battlesPlayed: 0,
  badges: [] as string[],
};

export interface WikiArticle {
  id: string;
  authorId: string;
  authorName: string;
  title: string;
  category: string;
  body: string;
  createdDate: string;
}

export interface MentorshipRequest {
  id: string;
  fromUid: string;
  fromName: string;
  toUid: string;
  toName: string;
  message: string;
  status: 'pending' | 'accepted' | 'declined';
  createdDate: string;
}

export const EMPTY_PROFILE: ExtendedProfile = {
  headline: '',
  location: '',
  industry: '',
  websiteUrl: '',
  customUrlSlug: '',
  avatarUrl: '',
  bannerUrl: '',
  about: '',
  experience: [],
  education: [],
  certifications: [],
  skills: [],
  recommendations: [],
  publications: [],
  volunteer: [],
  languages: [],
  savedOpportunityIds: [],
  rsvpedEventIds: [],
  followedUids: [],
  connectedUids: [],
};
