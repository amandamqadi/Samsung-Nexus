import { useApp } from '../../../context/AppContext';
import type { AdminView } from '../AdminPortal';

const TITLES: Record<string, string> = {
  'engagement.activity': 'Activity',
  'engagement.connections': 'Connections',
  'engagement.analytics': 'Platform Analytics',
};

export default function EngagementViews({ view }: { view: AdminView }) {
  const { allUsers, opportunities, events, conversations, feedPosts } = useApp();

  const alumni = allUsers.filter((u) => u.role === 'user');
  const totalConnections = alumni.reduce((sum, a) => sum + (a.connectionsCount ?? 0), 0);
  const totalApplications = opportunities.reduce((sum, o) => sum + o.applicantsCount, 0);
  const totalRsvps = events.reduce((sum, e) => sum + e.attendeesCount, 0);
  const totalMessages = conversations.reduce((sum, c) => sum + c.messages.length, 0);
  const verifiedCount = alumni.filter((a) => a.idVerified).length;
  const verifiedPct = alumni.length > 0 ? Math.round((verifiedCount / alumni.length) * 100) : 0;
  const totalLikes = feedPosts.reduce((sum, p) => sum + p.likedBy.length, 0);
  const totalComments = feedPosts.reduce((sum, p) => sum + p.comments.length, 0);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-1">{TITLES[view]}</h1>
      <p className="text-sm text-muted mb-6">Real engagement signals captured automatically across the platform</p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          ['Registered Alumni', alumni.length.toLocaleString()],
          ['Total Connections', totalConnections.toLocaleString()],
          ['Opportunity Applications', totalApplications.toLocaleString()],
          ['Event RSVPs', totalRsvps.toLocaleString()],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-hairline bg-card p-5">
            <div className="font-display text-2xl font-bold text-cyan-glow">{value}</div>
            <div className="text-xs text-muted mt-1">{label}</div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-hairline bg-card p-6">
        <h2 className="font-display font-semibold mb-4">Platform Activity</h2>
        <div className="space-y-3">
          {[
            ['ID-Verified Alumni', `${verifiedPct}% (${verifiedCount} of ${alumni.length})`],
            ['Projects Shared to Feed', feedPosts.length.toString()],
            ['Feed Likes', totalLikes.toString()],
            ['Feed Comments', totalComments.toString()],
            ['Messages Sent', totalMessages.toLocaleString()],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between text-sm">
              <span className="text-muted">{label}</span>
              <span className="font-semibold text-primary">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
