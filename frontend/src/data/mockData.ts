import type {
  Announcement,
  Conversation,
  NexusEvent,
  Opportunity,
  Track,
  VerificationApplicant,
} from '../types';

export const TRACKS: Track[] = ['AI & Robotics', 'IoT', 'Cloud', 'Data Science', 'Cybersecurity'];

// Opportunities, events, and announcements are posted by admins and alumni through
// the app and live in Firestore — there is no seed data, so the app starts empty
// and every action is something a real admin or alumnus actually did.
export const OPPORTUNITIES: Opportunity[] = [];
export const EVENTS: NexusEvent[] = [];
export const ANNOUNCEMENTS: Announcement[] = [];
export const VERIFICATION_QUEUE: VerificationApplicant[] = [];

export const CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-1', participantName: 'Sicelo Mthanti', participantInitials: 'SM', role: 'Mentor · Lead AI Architect',
    lastMessagePreview: 'Great progress on the recommendation pipeline!', unread: 2,
    messages: [
      { id: 'm1', senderId: 'conv-1', text: 'Hey! How is the Gemini prompt tuning going?', timestamp: '09:12' },
      { id: 'm2', senderId: 'me', text: 'Good — accuracy is up on the sample profiles.', timestamp: '09:15' },
      { id: 'm3', senderId: 'conv-1', text: 'Great progress on the recommendation pipeline!', timestamp: '09:20' },
    ],
  },
  {
    id: 'conv-2', participantName: 'Amina Nzuza', participantInitials: 'AN', role: 'Cohort Peer · 2024',
    lastMessagePreview: 'Are you attending the hackathon next month?', unread: 0,
    messages: [
      { id: 'm1', senderId: 'conv-2', text: 'Are you attending the hackathon next month?', timestamp: 'Yesterday' },
    ],
  },
  {
    id: 'conv-3', participantName: 'Siphesihle Mkhize', participantInitials: 'SM', role: 'Co-Captain · Full-Stack Lead',
    lastMessagePreview: 'Sent you the Firestore schema draft.', unread: 1,
    messages: [
      { id: 'm1', senderId: 'conv-3', text: 'Sent you the Firestore schema draft.', timestamp: 'Mon' },
    ],
  },
];

// Landing-page marketing stats only (shown to signed-out visitors) — unrelated to
// the real, live data tracked once someone signs in.
export const PLATFORM_METRICS = {
  totalAlumni: 24812,
  globalCohorts: 62,
  mentorshipMatch: 98.4,
  careerPlacement: 94.2,
};
