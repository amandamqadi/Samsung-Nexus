import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  addDoc, arrayRemove, arrayUnion, collection, deleteDoc, doc, getDoc, getDocs, increment,
  onSnapshot, orderBy, query, runTransaction, serverTimestamp, setDoc, Timestamp, updateDoc, where,
} from 'firebase/firestore';
import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import {
  createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut,
  updateProfile as updateAuthProfile, type User as FirebaseUser,
} from 'firebase/auth';
import type {
  AlumniDocument, AlumniProject, Announcement, AppNotification, Battle, BattleChallenge,
  BattleMode, BattleQueueEntry, BattleStats, Conversation, CurrentUser, DifficultyLevel,
  DocumentType, ExtendedProfile, FeedPost, JobApplication, NexusEvent,
  Opportunity, ProfileListKey, ProfileListMap, Role, Theme, VerificationApplicant,
  WikiArticle,
} from '../types';
import { DEFAULT_QUIZ_CATEGORIES, EMPTY_BATTLE_STATS_BASE, EMPTY_PROFILE } from '../types';
import { ANNOUNCEMENTS, CONVERSATIONS, EVENTS, OPPORTUNITIES, VERIFICATION_QUEUE } from '../data/mockData';
import { getBattleQuestions } from '../data/quizQuestions';
import { auth, authErrorMessage, db, storage } from '../firebase';

const DEFAULT_UNIVERSITY = 'Durban University of Technology (DUT)';
const BATTLE_QUESTION_COUNT = 5;
const BATTLE_QUESTION_SECONDS = 20;

interface AppContextValue {
  role: Role;
  currentUser: CurrentUser | null;
  authChecked: boolean;
  login: (email: string, password: string) => Promise<void>;
  signUp: (details: { name: string; email: string; idNumber: string; password: string }) => Promise<void>;
  logout: () => void;

  theme: Theme;
  toggleTheme: () => void;
  setTheme: (t: Theme) => void;

  loginModalOpen: boolean;
  setLoginModalOpen: (v: boolean) => void;
  legalModalOpen: false | 'privacy' | 'terms' | 'cookies' | 'disclaimer' | 'accessibility';
  openLegalModal: (tab: 'privacy' | 'terms' | 'cookies' | 'disclaimer' | 'accessibility') => void;
  closeLegalModal: () => void;
  settingsModalOpen: boolean;
  setSettingsModalOpen: (v: boolean) => void;

  allUsers: CurrentUser[];
  connectWithAlumnus: (uid: string) => Promise<void>;

  opportunities: Opportunity[];
  toggleSaveOpportunity: (id: string) => Promise<void>;
  applyToOpportunity: (id: string) => Promise<void>;
  addOpportunity: (opp: Omit<Opportunity, 'id' | 'applicantsCount' | 'postedDate' | 'postedBy'>) => Promise<void>;

  applications: JobApplication[];
  myApplications: JobApplication[];

  events: NexusEvent[];
  toggleRsvp: (id: string) => Promise<void>;
  addEvent: (evt: Omit<NexusEvent, 'id' | 'attendeesCount' | 'postedBy'>) => Promise<void>;

  conversations: Conversation[];
  sendMessage: (conversationId: string, text: string) => void;

  verificationQueue: VerificationApplicant[];
  setVerificationStatus: (id: string, status: 'Verified' | 'Flagged') => void;

  announcements: Announcement[];
  addAnnouncement: (a: Omit<Announcement, 'id' | 'date'>) => Promise<void>;

  myDocuments: AlumniDocument[];
  documentsLoading: boolean;
  addDocument: (file: File, docType: DocumentType) => Promise<void>;
  removeDocument: (id: string) => Promise<void>;

  myProjects: AlumniProject[];
  addProject: (project: { title: string; description: string; link?: string; tags: string[] }) => Promise<void>;
  removeProject: (id: string) => Promise<void>;

  profile: ExtendedProfile;
  profileLoading: boolean;
  updateProfileFields: (patch: Partial<Pick<ExtendedProfile, 'headline' | 'location' | 'industry' | 'websiteUrl' | 'customUrlSlug' | 'about'>>) => Promise<void>;
  uploadProfileImage: (file: File, kind: 'avatar' | 'banner') => Promise<void>;
  addProfileEntry: <K extends ProfileListKey>(section: K, entry: Omit<ProfileListMap[K], 'id'>) => Promise<void>;
  removeProfileEntry: (section: ProfileListKey, id: string) => Promise<void>;
  toggleSkillPin: (id: string) => Promise<void>;

  allDocuments: AlumniDocument[];
  allProjects: AlumniProject[];

  feedPosts: FeedPost[];
  toggleLikePost: (postId: string) => Promise<void>;
  addComment: (postId: string, text: string) => Promise<void>;
  canInteractWithPost: (postId: string) => boolean;

  notifications: AppNotification[];
  addNotification: (message: string) => void;

  // Nexus Battles
  categories: string[];
  addCategory: (name: string) => Promise<void>;
  battleStats: BattleStats;
  myBattles: Battle[];
  activeBattle: Battle | null;
  queueEntry: BattleQueueEntry | null;
  incomingChallenges: BattleChallenge[];
  startPractice: (category: string, difficulty: DifficultyLevel) => Promise<void>;
  joinQueue: (mode: BattleMode, category: string, difficulty: DifficultyLevel) => Promise<void>;
  leaveQueue: () => Promise<void>;
  sendChallenge: (targetUid: string, targetName: string, category: string, difficulty: DifficultyLevel) => Promise<void>;
  respondToChallenge: (challengeId: string, accept: boolean) => Promise<void>;
  submitBattleAnswer: (battleId: string, questionIndex: number, optionIndex: number) => Promise<void>;
  exitBattle: () => void;
  followAlumnus: (uid: string) => Promise<void>;
  requestMentorship: (toUid: string, toName: string, message: string) => Promise<void>;
  fetchWikiArticlesByAuthor: (uid: string) => Promise<WikiArticle[]>;

  toast: string | null;
  showToast: (msg: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

/** Known demo accounts — lazily created in Firebase Auth the first time someone signs in with them. */
const DEMO_ACCOUNTS: Record<string, { password: string; name: string; role: Role; cohortYear: number; track: CurrentUser['track'] }> = {
  'john.doe@alumni.samsung.com': { password: 'SamsungNexus2026!', name: 'John Doe', role: 'user', cohortYear: 2024, track: 'AI & Robotics' },
  'admin@nexus.samsung.com': { password: 'SamsungNexus2026!', name: 'Nexus Admin', role: 'admin', cohortYear: 2020, track: 'Cloud' },
};

/** Sorts newest-first using a Firestore `createdAt` timestamp, without requiring a composite index on (where + orderBy). */
function byCreatedAtDesc<T extends { createdAt?: Timestamp }>(a: T, b: T): number {
  return (b.createdAt?.toMillis() ?? 0) - (a.createdAt?.toMillis() ?? 0);
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>('visitor');
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [theme, setThemeState] = useState<Theme>('light');

  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [legalModalOpen, setLegalModalOpen] = useState<AppContextValue['legalModalOpen']>(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);

  const [allUsers, setAllUsers] = useState<CurrentUser[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>(OPPORTUNITIES);
  const [events, setEvents] = useState<NexusEvent[]>(EVENTS);
  const [conversations, setConversations] = useState<Conversation[]>(CONVERSATIONS);
  const [verificationQueue, setVerificationQueue] = useState<VerificationApplicant[]>(VERIFICATION_QUEUE);
  const [announcements, setAnnouncements] = useState<Announcement[]>(ANNOUNCEMENTS);
  const [myDocuments, setMyDocuments] = useState<AlumniDocument[]>([]);
  const [myProjects, setMyProjects] = useState<AlumniProject[]>([]);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [profile, setProfile] = useState<ExtendedProfile>(EMPTY_PROFILE);
  const [profileLoading, setProfileLoading] = useState(false);
  const [myApplications, setMyApplications] = useState<JobApplication[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [allDocuments, setAllDocuments] = useState<AlumniDocument[]>([]);
  const [allProjects, setAllProjects] = useState<AlumniProject[]>([]);
  const [feedPosts, setFeedPosts] = useState<FeedPost[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [categories, setCategories] = useState<string[]>([...DEFAULT_QUIZ_CATEGORIES]);
  const [battleStats, setBattleStats] = useState<BattleStats>({ uid: '', ...EMPTY_BATTLE_STATS_BASE });
  const [myBattles, setMyBattles] = useState<Battle[]>([]);
  const [queueEntry, setQueueEntry] = useState<BattleQueueEntry | null>(null);
  const [incomingChallenges, setIncomingChallenges] = useState<BattleChallenge[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
  }, [theme]);

  // Restore session across refreshes and build CurrentUser from the account's Firestore record.
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setRole('visitor');
        setCurrentUser(null);
        setAuthChecked(true);
        return;
      }
      try {
        await loadUserRecord(user);
      } catch (err) {
        console.error('failed to load user record', err);
      }
      setAuthChecked(true);
    });
    return unsub;
  }, []);

  async function loadUserRecord(user: FirebaseUser) {
    const snap = await getDoc(doc(db, 'users', user.uid));
    const data = snap.exists() ? (snap.data() as Partial<CurrentUser>) : {};
    const resolvedRole: Role = data.role ?? 'user';
    setRole(resolvedRole);
    setCurrentUser({
      uid: user.uid,
      name: data.name ?? user.displayName ?? user.email ?? 'Alumni Member',
      email: user.email ?? data.email ?? '',
      role: resolvedRole,
      cohortYear: data.cohortYear ?? new Date().getFullYear(),
      track: data.track ?? 'AI & Robotics',
      idNumber: data.idNumber,
      idVerified: data.idVerified ?? false,
      connectionsCount: data.connectionsCount ?? 0,
      followersCount: data.followersCount ?? 0,
      university: data.university ?? DEFAULT_UNIVERSITY,
    });
  }

  // Shared, live app data — visible to any signed-in account (alumni or admin) so that
  // what one person posts is immediately visible to everyone else's session.
  useEffect(() => {
    if (!currentUser?.uid) {
      setMyDocuments([]);
      setMyProjects([]);
      setProfile(EMPTY_PROFILE);
      setMyApplications([]);
      setAllUsers([]);
      setFeedPosts([]);
      setDocumentsLoading(false);
      setProfileLoading(false);
      setCategories([...DEFAULT_QUIZ_CATEGORIES]);
      setBattleStats({ uid: '', ...EMPTY_BATTLE_STATS_BASE });
      setMyBattles([]);
      setQueueEntry(null);
      setIncomingChallenges([]);
      return;
    }
    const uid = currentUser.uid;
    setDocumentsLoading(true);
    setProfileLoading(true);

    const docsQuery = query(collection(db, 'documents'), where('ownerId', '==', uid));
    const unsubDocs = onSnapshot(
      docsQuery,
      (snap) => {
        const docs = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<AlumniDocument, 'id'> & { createdAt?: Timestamp }) }));
        setMyDocuments(docs.sort(byCreatedAtDesc));
        setDocumentsLoading(false);
      },
      (err) => {
        console.error('documents subscription failed', err);
        setDocumentsLoading(false);
      },
    );

    const projectsQuery = query(collection(db, 'projects'), where('ownerId', '==', uid));
    const unsubProjects = onSnapshot(
      projectsQuery,
      (snap) => {
        const projects = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<AlumniProject, 'id'> & { createdAt?: Timestamp }) }));
        setMyProjects(projects.sort(byCreatedAtDesc));
      },
      (err) => console.error('projects subscription failed', err),
    );

    const unsubProfile = onSnapshot(
      doc(db, 'profiles', uid),
      (snap) => {
        setProfile(snap.exists() ? { ...EMPTY_PROFILE, ...(snap.data() as Partial<ExtendedProfile>) } : EMPTY_PROFILE);
        setProfileLoading(false);
      },
      (err) => {
        console.error('profile subscription failed', err);
        setProfileLoading(false);
      },
    );

    const myApplicationsQuery = query(collection(db, 'applications'), where('applicantId', '==', uid));
    const unsubMyApplications = onSnapshot(
      myApplicationsQuery,
      (snap) => setMyApplications(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<JobApplication, 'id'>) }))),
      (err) => console.error('my applications subscription failed', err),
    );

    const unsubUsers = onSnapshot(
      collection(db, 'users'),
      (snap) => setAllUsers(snap.docs.map((d) => ({ uid: d.id, ...(d.data() as Omit<CurrentUser, 'uid'>) }))),
      (err) => console.error('users subscription failed', err),
    );

    const unsubOpportunities = onSnapshot(
      query(collection(db, 'opportunities'), orderBy('createdAt', 'desc')),
      (snap) => setOpportunities(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Opportunity, 'id'>) }))),
      (err) => console.error('opportunities subscription failed', err),
    );

    const unsubEvents = onSnapshot(
      query(collection(db, 'events'), orderBy('createdAt', 'desc')),
      (snap) => setEvents(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<NexusEvent, 'id'>) }))),
      (err) => console.error('events subscription failed', err),
    );

    const unsubAnnouncements = onSnapshot(
      query(collection(db, 'announcements'), orderBy('createdAt', 'desc')),
      (snap) => setAnnouncements(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Announcement, 'id'>) }))),
      (err) => console.error('announcements subscription failed', err),
    );

    const unsubFeed = onSnapshot(
      query(collection(db, 'feedPosts'), orderBy('createdAt', 'desc')),
      (snap) => setFeedPosts(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<FeedPost, 'id'>) }))),
      (err) => console.error('feed subscription failed', err),
    );

    // --- Nexus Battles ---
    const unsubCategories = onSnapshot(
      collection(db, 'categories'),
      (snap) => {
        const extra = snap.docs.map((d) => (d.data() as { name?: string }).name).filter((n): n is string => !!n);
        setCategories([...DEFAULT_QUIZ_CATEGORIES, ...extra.filter((n) => !(DEFAULT_QUIZ_CATEGORIES as readonly string[]).includes(n))]);
      },
      (err) => console.error('categories subscription failed', err),
    );

    const unsubBattleStats = onSnapshot(
      doc(db, 'battleStats', uid),
      (snap) => setBattleStats(snap.exists() ? (snap.data() as BattleStats) : { uid, ...EMPTY_BATTLE_STATS_BASE }),
      (err) => console.error('battle stats subscription failed', err),
    );

    // Single listener covers "am I in an active battle right now" (survives refresh) and battle history.
    const unsubMyBattles = onSnapshot(
      query(collection(db, 'battles'), where('playerUids', 'array-contains', uid)),
      (snap) => {
        const battles = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Battle, 'id'> & { createdAt?: Timestamp }) }));
        setMyBattles(battles.sort(byCreatedAtDesc));
      },
      (err) => console.error('my battles subscription failed', err),
    );

    const unsubQueue = onSnapshot(
      doc(db, 'battleQueue', uid),
      (snap) => setQueueEntry(snap.exists() ? (snap.data() as BattleQueueEntry) : null),
      (err) => console.error('battle queue subscription failed', err),
    );

    const unsubChallenges = onSnapshot(
      query(collection(db, 'battleChallenges'), where('toUid', '==', uid)),
      (snap) => {
        const all = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<BattleChallenge, 'id'>) }));
        setIncomingChallenges(all.filter((c) => c.status === 'pending'));
      },
      (err) => console.error('battle challenges subscription failed', err),
    );

    return () => {
      unsubDocs();
      unsubProjects();
      unsubProfile();
      unsubMyApplications();
      unsubUsers();
      unsubOpportunities();
      unsubEvents();
      unsubAnnouncements();
      unsubFeed();
      unsubCategories();
      unsubBattleStats();
      unsubMyBattles();
      unsubQueue();
      unsubChallenges();
    };
  }, [currentUser?.uid]);

  // Admin-only: full, unscoped views across every alumnus's submissions and applications.
  useEffect(() => {
    if (role !== 'admin') {
      setAllDocuments([]);
      setAllProjects([]);
      setApplications([]);
      return;
    }

    const unsubAllDocs = onSnapshot(
      query(collection(db, 'documents'), orderBy('createdAt', 'desc')),
      (snap) => setAllDocuments(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<AlumniDocument, 'id'>) }))),
      (err) => console.error('admin documents subscription failed', err),
    );
    const unsubAllProjects = onSnapshot(
      query(collection(db, 'projects'), orderBy('createdAt', 'desc')),
      (snap) => setAllProjects(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<AlumniProject, 'id'>) }))),
      (err) => console.error('admin projects subscription failed', err),
    );
    const unsubAllApplications = onSnapshot(
      query(collection(db, 'applications'), orderBy('createdAt', 'desc')),
      (snap) => setApplications(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<JobApplication, 'id'>) }))),
      (err) => console.error('admin applications subscription failed', err),
    );

    return () => {
      unsubAllDocs();
      unsubAllProjects();
      unsubAllApplications();
    };
  }, [role]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  function showToast(msg: string) {
    setToast(msg);
  }

  async function login(email: string, password: string) {
    const normalizedEmail = email.trim().toLowerCase();
    try {
      let user: FirebaseUser;
      try {
        user = (await signInWithEmailAndPassword(auth, normalizedEmail, password)).user;
      } catch (err) {
        const code = (err as { code?: string })?.code;
        const demo = DEMO_ACCOUNTS[normalizedEmail];
        // Modern Identity Toolkit no longer distinguishes "no such user" from "wrong
        // password" — both come back as auth/invalid-credential — so a known demo
        // account gets a lazy-create attempt either way; if the account genuinely
        // already exists, createUser fails with email-already-in-use and we know
        // the original error really was a bad password.
        const looksUnseeded = ['auth/user-not-found', 'auth/invalid-credential', 'auth/invalid-login-credentials'].includes(code ?? '');
        if (looksUnseeded && demo) {
          try {
            const cred = await createUserWithEmailAndPassword(auth, normalizedEmail, password || demo.password);
            await updateAuthProfile(cred.user, { displayName: demo.name });
            await setDoc(doc(db, 'users', cred.user.uid), {
              name: demo.name, email: normalizedEmail, role: demo.role,
              cohortYear: demo.cohortYear, track: demo.track, idVerified: demo.role === 'admin',
              connectionsCount: 0, followersCount: 0, university: DEFAULT_UNIVERSITY,
            });
            user = cred.user;
          } catch (createErr) {
            const createCode = (createErr as { code?: string })?.code;
            throw createCode === 'auth/email-already-in-use' ? err : createErr;
          }
        } else {
          throw err;
        }
      }
      await loadUserRecord(user);
      setLoginModalOpen(false);
      showToast(`Signed in as ${user.email}`);
    } catch (err) {
      showToast(authErrorMessage(err));
      throw err;
    }
  }

  async function signUp(details: { name: string; email: string; idNumber: string; password: string }) {
    const normalizedEmail = details.email.trim().toLowerCase();
    try {
      const cred = await createUserWithEmailAndPassword(auth, normalizedEmail, details.password);
      await updateAuthProfile(cred.user, { displayName: details.name });
      const record = {
        name: details.name,
        email: normalizedEmail,
        role: 'user' as const,
        cohortYear: new Date().getFullYear(),
        track: 'AI & Robotics' as const,
        idNumber: details.idNumber,
        idVerified: true,
        connectionsCount: 0,
        followersCount: 0,
        university: DEFAULT_UNIVERSITY,
      };
      await setDoc(doc(db, 'users', cred.user.uid), record);
      setRole('user');
      setCurrentUser({ uid: cred.user.uid, ...record });
      setLoginModalOpen(false);
      showToast('Profile created — welcome to Samsung Nexus!');
    } catch (err) {
      showToast(authErrorMessage(err));
      throw err;
    }
  }

  function logout() {
    signOut(auth).catch((err) => console.error('sign out failed', err));
    setRole('visitor');
    setCurrentUser(null);
    showToast('Signed out');
  }

  function toggleTheme() {
    setThemeState((t) => (t === 'dark' ? 'light' : 'dark'));
  }

  function openLegalModal(tab: 'privacy' | 'terms' | 'cookies' | 'disclaimer' | 'accessibility') {
    setLegalModalOpen(tab);
  }
  function closeLegalModal() {
    setLegalModalOpen(false);
  }

  async function connectWithAlumnus(targetUid: string) {
    if (!currentUser?.uid || profile.connectedUids.includes(targetUid)) return;
    const uid = currentUser.uid;
    setProfile((prev) => ({ ...prev, connectedUids: [...prev.connectedUids, targetUid] }));
    setAllUsers((prev) => prev.map((u) => {
      if (u.uid === targetUid) return { ...u, connectionsCount: (u.connectionsCount ?? 0) + 1 };
      if (u.uid === uid) return { ...u, connectionsCount: (u.connectionsCount ?? 0) + 1 };
      return u;
    }));
    showToast('You are now connected');
    try {
      // Connecting is mutual: both alumni gain each other in connectedUids and both connection counts rise.
      await setDoc(doc(db, 'profiles', uid), { connectedUids: arrayUnion(targetUid) }, { merge: true });
      await setDoc(doc(db, 'profiles', targetUid), { connectedUids: arrayUnion(uid) }, { merge: true });
      await updateDoc(doc(db, 'users', targetUid), { connectionsCount: increment(1) });
      await updateDoc(doc(db, 'users', uid), { connectionsCount: increment(1) });
    } catch (err) {
      console.error('connection failed to sync to database', err);
    }
  }

  async function toggleSaveOpportunity(id: string) {
    const saved = profile.savedOpportunityIds.includes(id);
    const nextIds = saved ? profile.savedOpportunityIds.filter((x) => x !== id) : [...profile.savedOpportunityIds, id];
    setProfile((prev) => ({ ...prev, savedOpportunityIds: nextIds }));
    if (!currentUser?.uid) return;
    try {
      await setDoc(doc(db, 'profiles', currentUser.uid), { savedOpportunityIds: nextIds }, { merge: true });
    } catch (err) {
      console.error('saved opportunity failed to sync to database', err);
    }
  }

  async function applyToOpportunity(id: string) {
    const opportunity = opportunities.find((o) => o.id === id);
    const alreadyApplied = myApplications.some((a) => a.opportunityId === id);
    if (!opportunity || alreadyApplied || !currentUser?.uid) return;

    const cv = myDocuments.find((d) => d.docType === 'CV / Resume');

    // Applying is a user-facing action that should always succeed immediately —
    // persistence to Firestore happens in the background and never blocks the UI.
    setOpportunities((prev) => prev.map((o) => (o.id === id ? { ...o, applicantsCount: o.applicantsCount + 1 } : o)));
    setMyApplications((prev) => [...prev, {
      id: `local-${Date.now()}`, applicantId: currentUser.uid, opportunityId: id, opportunityTitle: opportunity.title,
      company: opportunity.company, applicantName: currentUser.name, applicantEmail: currentUser.email,
      headline: profile.headline, skills: profile.skills.map((s) => s.name),
      cvFileName: cv?.fileName, cvUrl: cv?.url, appliedDate: new Date().toISOString().slice(0, 10),
    }]);
    addNotification(`Application confirmed: ${opportunity.title} at ${opportunity.company}${cv ? '' : ' — add a CV to your profile to strengthen future applications'}`);
    showToast(`Applied to ${opportunity.title} using your profile`);

    try {
      await addDoc(collection(db, 'applications'), {
        applicantId: currentUser.uid,
        opportunityId: id,
        opportunityTitle: opportunity.title,
        company: opportunity.company,
        applicantName: currentUser.name,
        applicantEmail: currentUser.email,
        headline: profile.headline,
        skills: profile.skills.map((s) => s.name),
        cvFileName: cv?.fileName ?? null,
        cvUrl: cv?.url ?? null,
        appliedDate: new Date().toISOString().slice(0, 10),
        createdAt: serverTimestamp(),
      });
      await updateDoc(doc(db, 'opportunities', id), { applicantsCount: increment(1) });
    } catch (err) {
      console.error('application failed to sync to database', err);
    }
  }

  function addNotification(message: string) {
    setNotifications((prev) => [{ id: `notif-${Date.now()}`, message, timestamp: 'Just now' }, ...prev]);
  }

  async function addOpportunity(opp: Omit<Opportunity, 'id' | 'applicantsCount' | 'postedDate' | 'postedBy'>) {
    const postedDate = new Date().toISOString().slice(0, 10);
    const postedBy = currentUser?.name ?? 'Samsung Nexus Admin';
    const localOpp: Opportunity = { ...opp, id: `local-${Date.now()}`, applicantsCount: 0, postedDate, postedBy };
    setOpportunities((prev) => [localOpp, ...prev]);
    showToast('Opportunity published to alumni feed');
    try {
      await addDoc(collection(db, 'opportunities'), { ...opp, applicantsCount: 0, postedDate, postedBy, createdAt: serverTimestamp() });
    } catch (err) {
      console.error('opportunity failed to sync to database', err);
    }
  }

  async function toggleRsvp(id: string) {
    const rsvped = profile.rsvpedEventIds.includes(id);
    const nextIds = rsvped ? profile.rsvpedEventIds.filter((x) => x !== id) : [...profile.rsvpedEventIds, id];
    setProfile((prev) => ({ ...prev, rsvpedEventIds: nextIds }));
    setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, attendeesCount: e.attendeesCount + (rsvped ? -1 : 1) } : e)));
    if (!currentUser?.uid) return;
    try {
      await setDoc(doc(db, 'profiles', currentUser.uid), { rsvpedEventIds: nextIds }, { merge: true });
      await updateDoc(doc(db, 'events', id), { attendeesCount: increment(rsvped ? -1 : 1) });
    } catch (err) {
      console.error('RSVP failed to sync to database', err);
    }
  }

  async function addEvent(evt: Omit<NexusEvent, 'id' | 'attendeesCount' | 'postedBy'>) {
    const postedBy = currentUser?.name ?? 'Samsung Nexus Admin';
    const localEvt: NexusEvent = { ...evt, id: `local-${Date.now()}`, attendeesCount: 0, postedBy };
    setEvents((prev) => [localEvt, ...prev]);
    showToast('Event published');
    try {
      await addDoc(collection(db, 'events'), { ...evt, attendeesCount: 0, postedBy, createdAt: serverTimestamp() });
    } catch (err) {
      console.error('event failed to sync to database', err);
    }
  }

  function sendMessage(conversationId: string, text: string) {
    if (!text.trim()) return;
    setConversations((prev) => prev.map((c) => (c.id === conversationId ? {
      ...c,
      lastMessagePreview: text,
      messages: [...c.messages, { id: `m-${Date.now()}`, senderId: 'me', text, timestamp: 'Now' }],
    } : c)));
  }

  function setVerificationStatus(id: string, status: 'Verified' | 'Flagged') {
    setVerificationQueue((prev) => prev.map((v) => (v.id === id ? { ...v, status } : v)));
    showToast(status === 'Verified' ? 'Applicant verified' : 'Applicant flagged for review');
  }

  async function addAnnouncement(a: Omit<Announcement, 'id' | 'date'>) {
    const date = new Date().toISOString().slice(0, 10);
    const localA: Announcement = { ...a, id: `local-${Date.now()}`, date };
    setAnnouncements((prev) => [localA, ...prev]);
    showToast('Announcement broadcast to all alumni');
    try {
      await addDoc(collection(db, 'announcements'), { ...a, date, createdAt: serverTimestamp() });
    } catch (err) {
      console.error('announcement failed to sync to database', err);
    }
  }

  async function addDocument(file: File, docType: DocumentType) {
    if (!currentUser?.uid) return;
    // Show the upload immediately using a local preview URL; swap in the real
    // Storage/Firestore record in the background so the UI is never blocked
    // on the database connection.
    const localDoc: AlumniDocument = {
      id: `local-${Date.now()}`,
      ownerId: currentUser.uid,
      ownerName: currentUser.name,
      docType,
      fileName: file.name,
      sizeLabel: formatBytes(file.size),
      uploadedDate: new Date().toISOString().slice(0, 10),
      url: URL.createObjectURL(file),
      fileType: file.type,
      storagePath: '',
    };
    setMyDocuments((prev) => [localDoc, ...prev]);
    showToast(`${docType} uploaded`);

    // Storage and Firestore are independent failure points — if the file upload
    // fails (e.g. Storage not yet configured), still save the metadata record so
    // admins can see the submission exists rather than losing it entirely.
    let url = '';
    let storagePath = '';
    try {
      storagePath = `documents/${currentUser.uid}/${Date.now()}-${file.name}`;
      const storageRef = ref(storage, storagePath);
      await uploadBytes(storageRef, file);
      url = await getDownloadURL(storageRef);
    } catch (err) {
      console.error('storage upload failed — saving metadata only', err);
      storagePath = '';
    }

    try {
      await addDoc(collection(db, 'documents'), {
        ownerId: currentUser.uid,
        ownerName: currentUser.name,
        docType,
        fileName: file.name,
        sizeLabel: formatBytes(file.size),
        uploadedDate: new Date().toISOString().slice(0, 10),
        url,
        fileType: file.type,
        storagePath,
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      console.error('document metadata failed to sync to database', err);
    }
  }

  async function removeDocument(id: string) {
    const target = myDocuments.find((d) => d.id === id);
    setMyDocuments((prev) => prev.filter((d) => d.id !== id));
    if (id.startsWith('local-')) return;

    try {
      if (target?.storagePath) {
        await deleteObject(ref(storage, target.storagePath));
      }
      await deleteDoc(doc(db, 'documents', id));
    } catch (err) {
      console.error('failed to delete document from database', err);
    }
  }

  async function addProject(project: { title: string; description: string; link?: string; tags: string[] }) {
    if (!currentUser?.uid) return;
    const createdDate = new Date().toISOString().slice(0, 10);
    const localProject: AlumniProject = {
      ...project,
      id: `local-${Date.now()}`,
      ownerId: currentUser.uid,
      ownerName: currentUser.name,
      createdDate,
    };
    setMyProjects((prev) => [localProject, ...prev]);
    showToast('Project added to your profile');

    // Every new project also becomes a feed post so connections can see, like, and comment on it.
    const localPost: FeedPost = {
      id: `local-feed-${Date.now()}`,
      authorId: currentUser.uid,
      authorName: currentUser.name,
      authorTrack: currentUser.track,
      title: project.title,
      description: project.description,
      link: project.link,
      tags: project.tags,
      createdDate,
      likedBy: [],
      comments: [],
    };
    setFeedPosts((prev) => [localPost, ...prev]);

    try {
      await addDoc(collection(db, 'projects'), {
        title: project.title,
        description: project.description,
        link: project.link ?? null, // Firestore rejects `undefined` field values outright
        tags: project.tags,
        ownerId: currentUser.uid,
        ownerName: currentUser.name,
        createdDate,
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      console.error('project failed to sync to database', err);
    }

    try {
      const feedRef = await addDoc(collection(db, 'feedPosts'), {
        authorId: currentUser.uid,
        authorName: currentUser.name,
        authorTrack: currentUser.track,
        title: project.title,
        description: project.description,
        link: project.link ?? null,
        tags: project.tags,
        createdDate,
        likedBy: [],
        comments: [],
        createdAt: serverTimestamp(),
      });
      // Patch in the real id immediately so a like/comment right after posting
      // (before the next snapshot arrives) has a real document to target instead
      // of silently no-op'ing against the temporary local placeholder.
      setFeedPosts((prev) => prev.map((p) => (p.id === localPost.id ? { ...p, id: feedRef.id } : p)));
    } catch (err) {
      console.error('feed post failed to sync to database', err);
    }
  }

  async function removeProject(id: string) {
    setMyProjects((prev) => prev.filter((p) => p.id !== id));
    if (id.startsWith('local-')) return;
    try {
      await deleteDoc(doc(db, 'projects', id));
    } catch (err) {
      console.error('failed to delete project from database', err);
    }
  }

  function canInteractWithPost(postId: string): boolean {
    if (!currentUser?.uid) return false;
    const post = feedPosts.find((p) => p.id === postId);
    if (!post) return false;
    return post.authorId === currentUser.uid || profile.connectedUids.includes(post.authorId);
  }

  async function toggleLikePost(postId: string) {
    if (!currentUser?.uid) return;
    if (!canInteractWithPost(postId)) {
      showToast('Connect with them first to like their posts');
      return;
    }
    const uid = currentUser.uid;
    const liked = feedPosts.find((p) => p.id === postId)?.likedBy.includes(uid);
    setFeedPosts((prev) => prev.map((p) => (p.id === postId
      ? { ...p, likedBy: liked ? p.likedBy.filter((x) => x !== uid) : [...p.likedBy, uid] }
      : p)));
    if (postId.startsWith('local-')) return;
    try {
      await updateDoc(doc(db, 'feedPosts', postId), { likedBy: liked ? arrayRemove(uid) : arrayUnion(uid) });
    } catch (err) {
      console.error('like failed to sync to database', err);
    }
  }

  async function addComment(postId: string, text: string) {
    if (!currentUser?.uid || !text.trim()) return;
    if (!canInteractWithPost(postId)) {
      showToast('Connect with them first to comment on their posts');
      return;
    }
    const comment = {
      id: `comment-${Date.now()}`,
      authorId: currentUser.uid,
      authorName: currentUser.name,
      text: text.trim(),
      createdDate: new Date().toISOString().slice(0, 10),
    };
    setFeedPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, comments: [...p.comments, comment] } : p)));
    if (postId.startsWith('local-')) return;
    try {
      await updateDoc(doc(db, 'feedPosts', postId), { comments: arrayUnion(comment) });
    } catch (err) {
      console.error('comment failed to sync to database', err);
    }
  }

  async function updateProfileFields(patch: Partial<Pick<ExtendedProfile, 'headline' | 'location' | 'industry' | 'websiteUrl' | 'customUrlSlug' | 'about'>>) {
    setProfile((prev) => ({ ...prev, ...patch }));
    showToast('Profile updated');
    if (!currentUser?.uid) return;
    try {
      await setDoc(doc(db, 'profiles', currentUser.uid), patch, { merge: true });
    } catch (err) {
      console.error('profile failed to sync to database', err);
    }
  }

  async function uploadProfileImage(file: File, kind: 'avatar' | 'banner') {
    if (!currentUser?.uid) return;
    const localUrl = URL.createObjectURL(file);
    setProfile((prev) => ({ ...prev, [kind === 'avatar' ? 'avatarUrl' : 'bannerUrl']: localUrl }));
    showToast(kind === 'avatar' ? 'Profile photo updated' : 'Banner image updated');

    try {
      const storagePath = `profile/${currentUser.uid}/${kind}-${Date.now()}-${file.name}`;
      const storageRef = ref(storage, storagePath);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      await setDoc(doc(db, 'profiles', currentUser.uid), { [kind === 'avatar' ? 'avatarUrl' : 'bannerUrl']: url }, { merge: true });
    } catch (err) {
      console.error('profile image failed to sync to database', err);
    }
  }

  async function addProfileEntry<K extends ProfileListKey>(section: K, entry: Omit<ProfileListMap[K], 'id'>) {
    const newEntry = { ...entry, id: `${section}-${Date.now()}` } as ProfileListMap[K];
    const nextList = [...profile[section], newEntry];
    setProfile((prev) => ({ ...prev, [section]: nextList }));
    showToast('Added to your profile');

    if (!currentUser?.uid) return;
    try {
      await setDoc(doc(db, 'profiles', currentUser.uid), { [section]: nextList }, { merge: true });
    } catch (err) {
      console.error(`${section} failed to sync to database`, err);
    }
  }

  async function removeProfileEntry(section: ProfileListKey, id: string) {
    const nextList = profile[section].filter((item) => item.id !== id);
    setProfile((prev) => ({ ...prev, [section]: nextList }));
    if (!currentUser?.uid) return;
    try {
      await setDoc(doc(db, 'profiles', currentUser.uid), { [section]: nextList }, { merge: true });
    } catch (err) {
      console.error(`${section} removal failed to sync to database`, err);
    }
  }

  async function toggleSkillPin(id: string) {
    const nextSkills = profile.skills.map((s) => (s.id === id ? { ...s, pinned: !s.pinned } : s));
    setProfile((prev) => ({ ...prev, skills: nextSkills }));
    if (!currentUser?.uid) return;
    try {
      await setDoc(doc(db, 'profiles', currentUser.uid), { skills: nextSkills }, { merge: true });
    } catch (err) {
      console.error('skill pin failed to sync to database', err);
    }
  }

  // ---------------------------------------------------------------------
  // Nexus Battles
  // ---------------------------------------------------------------------

  const activeBattle = useMemo(() => myBattles.find((b) => b.status === 'active') ?? null, [myBattles]);

  async function addCategory(name: string) {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (categories.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
      showToast('That category already exists');
      return;
    }
    setCategories((prev) => [...prev, trimmed]);
    showToast(`"${trimmed}" category added`);
    try {
      await addDoc(collection(db, 'categories'), { name: trimmed, createdAt: serverTimestamp() });
    } catch (err) {
      console.error('category failed to sync to database', err);
    }
  }

  function computeElo(myRating: number, opponentRating: number, outcome: 1 | 0.5 | 0): number {
    const expected = 1 / (1 + 10 ** ((opponentRating - myRating) / 400));
    return Math.round(myRating + 32 * (outcome - expected));
  }

  function computeXp(score: number, total: number, won: boolean): number {
    const accuracyBonus = Math.round((score / total) * 20);
    return 20 + accuracyBonus + (won ? 30 : 0);
  }

  function computeBadges(prevStats: BattleStats, next: { wins: number; battlesPlayed: number }, score: number, total: number): string[] {
    const badges = new Set(prevStats.badges);
    if (next.battlesPlayed >= 1) badges.add('first_battle');
    if (next.wins >= 1) badges.add('first_victory');
    if (score === total) badges.add('perfect_score');
    if (next.battlesPlayed >= 5) badges.add('five_battles');
    return Array.from(badges);
  }

  async function startPractice(category: string, difficulty: DifficultyLevel) {
    if (!currentUser?.uid || activeBattle) return;
    const questions = getBattleQuestions(category, difficulty, BATTLE_QUESTION_COUNT);
    if (questions.length === 0) {
      showToast('No questions available for that category yet');
      return;
    }
    const battleRef = doc(collection(db, 'battles'));
    const player = {
      uid: currentUser.uid, name: currentUser.name, track: currentUser.track,
      skillRatingBefore: battleStats.skillRating,
      answers: new Array(questions.length).fill(null),
      score: 0, finishedAt: null, totalTimeMs: null,
    };
    try {
      await setDoc(battleRef, {
        mode: 'Practice', category, difficulty, questions, questionSeconds: BATTLE_QUESTION_SECONDS,
        players: [player], playerUids: [currentUser.uid],
        status: 'active', winnerUid: null, statsProcessed: false,
        createdAt: serverTimestamp(), completedAt: null,
      });
    } catch (err) {
      console.error('failed to start practice battle', err);
      showToast('Could not start practice — please try again');
    }
  }

  /** Finds a compatible waiting opponent and atomically claims them, or enqueues the current player to wait. */
  async function joinQueue(mode: BattleMode, category: string, difficulty: DifficultyLevel) {
    if (!currentUser?.uid || activeBattle) return;
    const uid = currentUser.uid;
    const university = currentUser.university ?? DEFAULT_UNIVERSITY;
    const cohortYear = currentUser.cohortYear;
    const skillRating = battleStats.skillRating;

    await deleteDoc(doc(db, 'battleQueue', uid)).catch(() => {});

    try {
      const queueKey = `${mode}::${category}::${difficulty}`;
      const snap = await getDocs(query(collection(db, 'battleQueue'), where('queueKey', '==', queueKey)));
      const candidates = snap.docs
        .map((d) => ({ ref: d.ref, data: d.data() as BattleQueueEntry }))
        .filter(({ data }) => data.status === 'waiting' && data.uid !== uid)
        .filter(({ data }) => mode !== 'University Battle' || data.university === university)
        .filter(({ data }) => mode !== 'Samsung Cohort Battle' || data.cohortYear === cohortYear)
        .filter(({ data }) => mode !== 'Ranked Match' || Math.abs(data.skillRating - skillRating) <= 200);

      for (const candidate of candidates) {
        const battleRef = doc(collection(db, 'battles'));
        try {
          // eslint-disable-next-line no-await-in-loop
          await runTransaction(db, async (tx) => {
            const candSnap = await tx.get(candidate.ref);
            if (!candSnap.exists() || (candSnap.data() as BattleQueueEntry).status !== 'waiting') {
              throw new Error('candidate no longer available');
            }
            const cand = candSnap.data() as BattleQueueEntry;
            const questions = getBattleQuestions(category, difficulty, BATTLE_QUESTION_COUNT);
            const opponentPlayer = {
              uid: cand.uid, name: cand.name, track: cand.track, skillRatingBefore: cand.skillRating,
              answers: new Array(questions.length).fill(null), score: 0, finishedAt: null, totalTimeMs: null,
            };
            const myPlayer = {
              uid, name: currentUser.name, track: currentUser.track, skillRatingBefore: skillRating,
              answers: new Array(questions.length).fill(null), score: 0, finishedAt: null, totalTimeMs: null,
            };
            tx.set(battleRef, {
              mode, category, difficulty, questions, questionSeconds: BATTLE_QUESTION_SECONDS,
              players: [opponentPlayer, myPlayer], playerUids: [cand.uid, uid],
              status: 'active', winnerUid: null, statsProcessed: false,
              createdAt: serverTimestamp(), completedAt: null,
            });
            tx.update(candidate.ref, { status: 'matched', matchedBattleId: battleRef.id });
          });
          showToast(`Matched with ${candidate.data.name}!`);
          return;
        } catch {
          // Someone else claimed this candidate first — try the next one.
        }
      }

      // No opponent available: join the queue and wait for someone else's joinQueue call to find us.
      await setDoc(doc(db, 'battleQueue', uid), {
        uid, name: currentUser.name, track: currentUser.track, mode, category, difficulty, queueKey,
        skillRating, university, cohortYear, status: 'waiting', matchedBattleId: null, challengeTargetUid: null,
        createdAt: serverTimestamp(),
      });
      showToast('Searching for an opponent...');
    } catch (err) {
      console.error('matchmaking failed', err);
      showToast('Matchmaking failed — please try again');
    }
  }

  async function leaveQueue() {
    if (!currentUser?.uid) return;
    try {
      await deleteDoc(doc(db, 'battleQueue', currentUser.uid));
    } catch (err) {
      console.error('failed to leave queue', err);
    }
  }

  async function sendChallenge(targetUid: string, targetName: string, category: string, difficulty: DifficultyLevel) {
    if (!currentUser?.uid) return;
    try {
      await addDoc(collection(db, 'battleChallenges'), {
        fromUid: currentUser.uid, fromName: currentUser.name, toUid: targetUid,
        category, difficulty, status: 'pending', battleId: null, createdAt: serverTimestamp(),
      });
      showToast(`Challenge sent to ${targetName}`);
    } catch (err) {
      console.error('failed to send challenge', err);
      showToast('Could not send challenge — please try again');
    }
  }

  async function respondToChallenge(challengeId: string, accept: boolean) {
    if (!currentUser?.uid) return;
    const challengeRef = doc(db, 'battleChallenges', challengeId);
    if (!accept) {
      await updateDoc(challengeRef, { status: 'declined' }).catch((err) => console.error('failed to decline challenge', err));
      return;
    }
    try {
      await runTransaction(db, async (tx) => {
        const snap = await tx.get(challengeRef);
        if (!snap.exists()) throw new Error('challenge missing');
        const challenge = snap.data() as BattleChallenge;
        if (challenge.status !== 'pending') throw new Error('challenge already resolved');
        const fromUserSnap = await tx.get(doc(db, 'users', challenge.fromUid));
        const fromStatsSnap = await tx.get(doc(db, 'battleStats', challenge.fromUid));
        const fromUser = fromUserSnap.data() as CurrentUser | undefined;
        const fromRating = (fromStatsSnap.data() as BattleStats | undefined)?.skillRating ?? EMPTY_BATTLE_STATS_BASE.skillRating;
        const questions = getBattleQuestions(challenge.category, challenge.difficulty, BATTLE_QUESTION_COUNT);
        const battleRef = doc(collection(db, 'battles'));
        const challengerPlayer = {
          uid: challenge.fromUid, name: challenge.fromName, track: fromUser?.track ?? 'AI & Robotics',
          skillRatingBefore: fromRating, answers: new Array(questions.length).fill(null), score: 0, finishedAt: null, totalTimeMs: null,
        };
        const myPlayer = {
          uid: currentUser.uid, name: currentUser.name, track: currentUser.track,
          skillRatingBefore: battleStats.skillRating, answers: new Array(questions.length).fill(null), score: 0, finishedAt: null, totalTimeMs: null,
        };
        tx.set(battleRef, {
          mode: 'Challenge Friend', category: challenge.category, difficulty: challenge.difficulty,
          questions, questionSeconds: BATTLE_QUESTION_SECONDS,
          players: [challengerPlayer, myPlayer], playerUids: [challenge.fromUid, currentUser.uid],
          status: 'active', winnerUid: null, statsProcessed: false, createdAt: serverTimestamp(), completedAt: null,
        });
        tx.update(challengeRef, { status: 'accepted', battleId: battleRef.id });
      });
      showToast('Challenge accepted — battle starting!');
    } catch (err) {
      console.error('failed to accept challenge', err);
      showToast('Could not accept challenge — please try again');
    }
  }

  async function submitBattleAnswer(battleId: string, questionIndex: number, optionIndex: number) {
    if (!currentUser?.uid) return;
    const uid = currentUser.uid;
    try {
      await runTransaction(db, async (tx) => {
        const battleRef = doc(db, 'battles', battleId);
        const snap = await tx.get(battleRef);
        if (!snap.exists()) return;
        const battle = snap.data() as Battle;
        if (battle.status !== 'active') return;
        const myIndex = battle.players.findIndex((p) => p.uid === uid);
        if (myIndex === -1) return;
        const player = battle.players[myIndex];
        if (player.answers[questionIndex] != null) return; // already answered — idempotent no-op

        const isCorrect = battle.questions[questionIndex]?.correctIndex === optionIndex;
        const nextAnswers = [...player.answers];
        nextAnswers[questionIndex] = optionIndex;
        const allAnswered = nextAnswers.every((a) => a !== null);
        const nowMs = Date.now();
        const startedMs = battle.createdAt?.toMillis() ?? nowMs;

        // Firestore rejects serverTimestamp() sentinels nested inside arrays, so `players[].finishedAt`
        // must use a concrete client Timestamp. Fairness is unaffected — totalTimeMs (the actual
        // competitive metric) is anchored to the server-resolved battle.createdAt, not this field.
        const updatedPlayer = {
          ...player,
          answers: nextAnswers,
          score: player.score + (isCorrect ? 1 : 0),
          finishedAt: allAnswered ? (player.finishedAt ?? Timestamp.now()) : player.finishedAt,
          totalTimeMs: allAnswered && player.totalTimeMs == null ? nowMs - startedMs : player.totalTimeMs,
        };
        const nextPlayers: Battle['players'] = [...battle.players];
        nextPlayers[myIndex] = updatedPlayer;

        const bothFinished = nextPlayers.every((p) => p.finishedAt != null || (p.answers.every((a) => a !== null)));
        const update: Record<string, unknown> = { players: nextPlayers };

        if (bothFinished) {
          update.status = 'completed';
          update.completedAt = serverTimestamp();
          if (nextPlayers.length === 2) {
            const [p1, p2] = nextPlayers;
            if (p1.score !== p2.score) update.winnerUid = p1.score > p2.score ? p1.uid : p2.uid;
            else if ((p1.totalTimeMs ?? Infinity) !== (p2.totalTimeMs ?? Infinity)) {
              update.winnerUid = (p1.totalTimeMs ?? Infinity) < (p2.totalTimeMs ?? Infinity) ? p1.uid : p2.uid;
            } else update.winnerUid = 'tie';
          } else {
            update.winnerUid = null; // practice: no opponent, no winner
          }

          // Process ranking/XP/badges exactly once, inside the same transaction that completes the battle.
          // Firestore transactions require ALL reads before ANY write, so the statsRef reads for both
          // players must complete first, then both writes are queued afterward.
          if (!battle.statsProcessed) {
            update.statsProcessed = true;
            const total = battle.questions.length;
            const statsRefs = nextPlayers.map((p) => doc(db, 'battleStats', p.uid));
            const statsSnaps = await Promise.all(statsRefs.map((ref) => tx.get(ref)));

            nextPlayers.forEach((p, i) => {
              const statsSnap = statsSnaps[i];
              const prevStats: BattleStats = statsSnap.exists()
                ? (statsSnap.data() as BattleStats)
                : { uid: p.uid, ...EMPTY_BATTLE_STATS_BASE };

              let outcome: 1 | 0.5 | 0 = 0.5;
              let opponentRating = p.skillRatingBefore;
              if (nextPlayers.length === 2) {
                const opponent = nextPlayers.find((o) => o.uid !== p.uid)!;
                opponentRating = opponent.skillRatingBefore;
                outcome = update.winnerUid === p.uid ? 1 : update.winnerUid === 'tie' ? 0.5 : 0;
              }
              const won = outcome === 1;
              const newRating = nextPlayers.length === 2 ? computeElo(p.skillRatingBefore, opponentRating, outcome) : prevStats.skillRating;
              const nextStatsBase = {
                wins: prevStats.wins + (won ? 1 : 0),
                losses: prevStats.losses + (outcome === 0 ? 1 : 0),
                ties: prevStats.ties + (outcome === 0.5 && nextPlayers.length === 2 ? 1 : 0),
                battlesPlayed: prevStats.battlesPlayed + 1,
              };
              const nextStats: BattleStats = {
                uid: p.uid,
                skillRating: newRating,
                xp: prevStats.xp + computeXp(p.score, total, won),
                ...nextStatsBase,
                badges: computeBadges(prevStats, nextStatsBase, p.score, total),
              };
              tx.set(statsRefs[i], nextStats);
            });
          }
        }

        tx.update(battleRef, update);
      });
    } catch (err) {
      console.error('failed to submit battle answer', err);
      showToast('Could not submit your answer — please try again');
    }
  }

  async function exitBattle() {
    if (!activeBattle || !currentUser?.uid) return;
    const me = activeBattle.players.find((p) => p.uid === currentUser.uid);
    if (!me) return;
    for (let i = 0; i < activeBattle.questions.length; i++) {
      if (me.answers[i] == null) {
        // eslint-disable-next-line no-await-in-loop
        await submitBattleAnswer(activeBattle.id, i, -1); // -1 never matches a real option — counts as wrong
      }
    }
  }

  async function followAlumnus(targetUid: string) {
    if (!currentUser?.uid) return;
    const following = profile.followedUids.includes(targetUid);
    const nextIds = following ? profile.followedUids.filter((x) => x !== targetUid) : [...profile.followedUids, targetUid];
    setProfile((prev) => ({ ...prev, followedUids: nextIds }));
    showToast(following ? 'Unfollowed' : 'Now following');
    try {
      await setDoc(doc(db, 'profiles', currentUser.uid), { followedUids: nextIds }, { merge: true });
      await updateDoc(doc(db, 'users', targetUid), { followersCount: increment(following ? -1 : 1) });
    } catch (err) {
      console.error('follow failed to sync to database', err);
    }
  }

  async function requestMentorship(toUid: string, toName: string, message: string) {
    if (!currentUser?.uid) return;
    showToast(`Mentorship request sent to ${toName}`);
    try {
      await addDoc(collection(db, 'mentorshipRequests'), {
        fromUid: currentUser.uid, fromName: currentUser.name, toUid, toName,
        message, status: 'pending', createdDate: new Date().toISOString().slice(0, 10), createdAt: serverTimestamp(),
      });
    } catch (err) {
      console.error('mentorship request failed to sync to database', err);
    }
  }

  async function fetchWikiArticlesByAuthor(uid: string): Promise<WikiArticle[]> {
    try {
      const snap = await getDocs(query(collection(db, 'wikiArticles'), where('authorId', '==', uid)));
      return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<WikiArticle, 'id'>) }));
    } catch (err) {
      console.error('failed to fetch wiki articles', err);
      return [];
    }
  }

  const value = useMemo<AppContextValue>(() => ({
    role, currentUser, authChecked, login, signUp, logout,
    theme, toggleTheme, setTheme: setThemeState,
    loginModalOpen, setLoginModalOpen,
    legalModalOpen, openLegalModal, closeLegalModal,
    settingsModalOpen, setSettingsModalOpen,
    allUsers, connectWithAlumnus,
    opportunities, toggleSaveOpportunity, applyToOpportunity, addOpportunity,
    applications, myApplications,
    events, toggleRsvp, addEvent,
    conversations, sendMessage,
    verificationQueue, setVerificationStatus,
    announcements, addAnnouncement,
    myDocuments, documentsLoading, addDocument, removeDocument,
    myProjects, addProject, removeProject,
    profile, profileLoading, updateProfileFields, uploadProfileImage, addProfileEntry, removeProfileEntry, toggleSkillPin,
    allDocuments, allProjects,
    feedPosts, toggleLikePost, addComment, canInteractWithPost,
    notifications, addNotification,
    categories, addCategory, battleStats, myBattles, activeBattle, queueEntry, incomingChallenges,
    startPractice, joinQueue, leaveQueue, sendChallenge, respondToChallenge, submitBattleAnswer, exitBattle,
    followAlumnus, requestMentorship, fetchWikiArticlesByAuthor,
    toast, showToast,
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [role, currentUser, authChecked, theme, loginModalOpen, legalModalOpen, settingsModalOpen, allUsers, opportunities, applications, myApplications, events, conversations, verificationQueue, announcements, myDocuments, documentsLoading, myProjects, profile, profileLoading, allDocuments, allProjects, feedPosts, notifications, categories, battleStats, myBattles, activeBattle, queueEntry, incomingChallenges, toast]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
