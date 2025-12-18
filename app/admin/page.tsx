"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Doc, Id } from "../../convex/_generated/dataModel";
import { useAuth } from "../providers/AuthProvider";

type Submission = Doc<"submissions">;
type SubmissionStatus = "pending" | "reviewed" | "published";

// Status badge component
function StatusBadge({ status }: { status: SubmissionStatus }) {
  const styles = {
    pending: 'bg-amber-100 text-amber-800 border-amber-200',
    reviewed: 'bg-blue-100 text-blue-800 border-blue-200',
    published: 'bg-emerald-100 text-emerald-800 border-emerald-200'
  };

  const labels = {
    pending: 'Pending Review',
    reviewed: 'Reviewed',
    published: 'Published'
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}

// Stats card component
function StatCard({
  title,
  value,
  icon,
  trend,
  color = 'gold'
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  trend?: { value: number; label: string };
  color?: 'gold' | 'maroon' | 'emerald' | 'blue';
}) {
  const colors = {
    gold: 'from-gold to-gold-dark',
    maroon: 'from-maroon to-maroon-dark',
    emerald: 'from-emerald-500 to-emerald-600',
    blue: 'from-blue-500 to-blue-600'
  };

  return (
    <div className="memorial-card p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-body text-sm text-charcoal/60 mb-1">{title}</p>
          <p className="font-display text-3xl text-charcoal font-semibold">{value}</p>
          {trend && (
            <p className="font-body text-xs text-charcoal/50 mt-2">
              <span className={trend.value >= 0 ? 'text-emerald-600' : 'text-red-600'}>
                {trend.value >= 0 ? '+' : ''}{trend.value}
              </span>
              {' '}{trend.label}
            </p>
          )}
        </div>
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors[color]} flex items-center justify-center`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

// Detail Modal Component
function DetailModal({
  submission,
  onClose,
  onStatusChange
}: {
  submission: Submission;
  onClose: () => void;
  onStatusChange: (id: Id<"submissions">, status: SubmissionStatus) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-charcoal/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-dove-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="bg-gradient-to-r from-maroon to-maroon-dark px-6 py-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gold/80 text-sm font-body">Memorial Record</p>
              <h2 className="font-display text-2xl text-white">{submission.title} {submission.fullName}</h2>
            </div>
            <button
              onClick={onClose}
              className="text-white/70 hover:text-white transition-colors p-1"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="grid gap-6">
            <div className="flex items-center justify-between pb-4 border-b border-cream-dark">
              <div className="flex items-center gap-3">
                <span className="font-body text-sm text-charcoal/60">Status:</span>
                <StatusBadge status={submission.status} />
              </div>
              <div className="flex gap-2">
                {submission.status === 'pending' && (
                  <button
                    onClick={() => onStatusChange(submission._id, 'reviewed')}
                    className="px-3 py-1.5 text-sm font-body bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                  >
                    Mark Reviewed
                  </button>
                )}
                {submission.status !== 'published' && (
                  <button
                    onClick={() => onStatusChange(submission._id, 'published')}
                    className="px-3 py-1.5 text-sm font-body bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors"
                  >
                    Publish
                  </button>
                )}
              </div>
            </div>

            <div>
              <h3 className="font-display text-lg text-maroon mb-3">Deceased Member Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-body text-xs text-charcoal/50 uppercase tracking-wide">Full Name</p>
                  <p className="font-body text-charcoal">{submission.fullName}</p>
                </div>
                <div>
                  <p className="font-body text-xs text-charcoal/50 uppercase tracking-wide">Title</p>
                  <p className="font-body text-charcoal">{submission.title}</p>
                </div>
                <div>
                  <p className="font-body text-xs text-charcoal/50 uppercase tracking-wide">Date of Passing</p>
                  <p className="font-body text-charcoal">
                    {new Date(submission.passingDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <div>
                  <p className="font-body text-xs text-charcoal/50 uppercase tracking-wide">Jurisdiction</p>
                  <p className="font-body text-charcoal">{submission.jurisdiction}</p>
                </div>
                <div>
                  <p className="font-body text-xs text-charcoal/50 uppercase tracking-wide">Years of Service</p>
                  <p className="font-body text-charcoal">{submission.yearsOfService}</p>
                </div>
                {submission.causeOfDeath && (
                  <div>
                    <p className="font-body text-xs text-charcoal/50 uppercase tracking-wide">Cause of Death</p>
                    <p className="font-body text-charcoal">{submission.causeOfDeath}</p>
                  </div>
                )}
              </div>
            </div>

            {submission.obituaryLink && (
              <div>
                <h3 className="font-display text-lg text-maroon mb-3">Documents</h3>
                <a
                  href={submission.obituaryLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-gold hover:text-gold-dark transition-colors font-body text-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  View Obituary Link
                </a>
              </div>
            )}

            {(submission.memorialServiceDate || submission.memorialServiceLocation) && (
              <div>
                <h3 className="font-display text-lg text-maroon mb-3">Memorial Service</h3>
                <div className="grid grid-cols-2 gap-4">
                  {submission.memorialServiceDate && (
                    <div>
                      <p className="font-body text-xs text-charcoal/50 uppercase tracking-wide">Service Date</p>
                      <p className="font-body text-charcoal">
                        {new Date(submission.memorialServiceDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  )}
                  {submission.memorialServiceLocation && (
                    <div>
                      <p className="font-body text-xs text-charcoal/50 uppercase tracking-wide">Location</p>
                      <p className="font-body text-charcoal">{submission.memorialServiceLocation}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-cream-dark">
              <h3 className="font-display text-lg text-maroon mb-3">Submission Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-body text-xs text-charcoal/50 uppercase tracking-wide">Submitted By</p>
                  <p className="font-body text-charcoal">{submission.submitterName}</p>
                </div>
                <div>
                  <p className="font-body text-xs text-charcoal/50 uppercase tracking-wide">Email</p>
                  <a href={`mailto:${submission.submitterEmail}`} className="font-body text-gold hover:underline">
                    {submission.submitterEmail}
                  </a>
                </div>
                <div>
                  <p className="font-body text-xs text-charcoal/50 uppercase tracking-wide">Submitted On</p>
                  <p className="font-body text-charcoal">
                    {new Date(submission.submittedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <div>
                  <p className="font-body text-xs text-charcoal/50 uppercase tracking-wide">Record ID</p>
                  <p className="font-body text-charcoal font-mono text-sm">{submission._id}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-cream-dark/30 border-t border-cream-dark flex justify-end">
          <button onClick={onClose} className="btn-secondary text-sm py-2 px-4">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// Loading skeleton
function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-cream">
      <nav className="bg-maroon-dark text-dove-white">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="h-8 w-48 bg-white/20 rounded animate-pulse" />
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="memorial-card p-6">
              <div className="h-20 bg-cream-dark rounded animate-pulse" />
            </div>
          ))}
        </div>
        <div className="memorial-card p-6">
          <div className="h-96 bg-cream-dark rounded animate-pulse" />
        </div>
      </main>
    </div>
  );
}

export default function AdminDashboard() {
  const router = useRouter();
  const { user, isLoading: authLoading, isAuthenticated, logout } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | SubmissionStatus>('all');
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'jurisdiction'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Convex queries
  const submissions = useQuery(api.submissions.list, {
    status: statusFilter === 'all' ? undefined : statusFilter,
  });
  const stats = useQuery(api.submissions.getStats, {});
  const updateStatusMutation = useMutation(api.submissions.updateStatus);

  // Redirect to login if not authenticated
  if (!authLoading && !isAuthenticated) {
    router.push('/admin/login');
    return null;
  }

  if (authLoading || !submissions || !stats) {
    return <LoadingSkeleton />;
  }

  // Filter and sort submissions
  const filteredSubmissions = (() => {
    let result = [...submissions];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(s =>
        s.fullName.toLowerCase().includes(query) ||
        s.jurisdiction.toLowerCase().includes(query) ||
        s.title.toLowerCase().includes(query)
      );
    }

    result.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'date':
          comparison = a.submittedAt - b.submittedAt;
          break;
        case 'name':
          comparison = a.fullName.localeCompare(b.fullName);
          break;
        case 'jurisdiction':
          comparison = a.jurisdiction.localeCompare(b.jurisdiction);
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  })();

  const handleSort = (field: 'date' | 'name' | 'jurisdiction') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const handleStatusChange = async (id: Id<"submissions">, status: SubmissionStatus) => {
    await updateStatusMutation({ id, status });
    setSelectedSubmission(prev => prev && prev._id === id ? { ...prev, status } : prev);
  };

  const handleLogout = async () => {
    await logout();
    router.push('/admin/login');
  };

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <nav className="bg-maroon-dark text-dove-white">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
              <span className="font-display text-lg">COGM Memorial</span>
            </Link>
            <div className="h-6 w-px bg-white/20 hidden sm:block" />
            <h1 className="font-display text-xl hidden sm:block">Admin Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-body text-sm text-dove-white/70 hidden sm:block">
              {user?.name}
            </span>
            <button
              onClick={handleLogout}
              className="font-body text-sm text-dove-white/80 hover:text-white transition-colors flex items-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Total Submissions"
            value={stats.total}
            color="maroon"
            icon={
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            }
            trend={{ value: stats.recentCount, label: 'this week' }}
          />
          <StatCard
            title="Pending Review"
            value={stats.pending}
            color="gold"
            icon={
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <StatCard
            title="Reviewed"
            value={stats.reviewed}
            color="blue"
            icon={
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            }
          />
          <StatCard
            title="Published"
            value={stats.published}
            color="emerald"
            icon={
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            }
          />
        </div>

        {/* Submissions Table */}
        <div className="memorial-card">
          <div className="px-6 py-4 border-b border-cream-dark">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <h2 className="font-display text-xl text-maroon">Memorial Submissions</h2>
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <div className="relative">
                  <svg className="w-5 h-5 text-charcoal/40 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search by name, jurisdiction..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="elegant-input pl-10 py-2 text-sm w-full sm:w-64"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                  className="elegant-input elegant-select py-2 text-sm w-full sm:w-40"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="reviewed">Reviewed</option>
                  <option value="published">Published</option>
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-cream-dark/30">
                  <th className="px-6 py-3 text-left">
                    <button
                      onClick={() => handleSort('name')}
                      className="font-display text-sm text-charcoal/70 hover:text-maroon flex items-center gap-1"
                    >
                      Name
                      {sortBy === 'name' && (
                        <svg className={`w-4 h-4 ${sortOrder === 'desc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left">
                    <span className="font-display text-sm text-charcoal/70">Title</span>
                  </th>
                  <th className="px-6 py-3 text-left hidden md:table-cell">
                    <button
                      onClick={() => handleSort('jurisdiction')}
                      className="font-display text-sm text-charcoal/70 hover:text-maroon flex items-center gap-1"
                    >
                      Jurisdiction
                      {sortBy === 'jurisdiction' && (
                        <svg className={`w-4 h-4 ${sortOrder === 'desc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left hidden lg:table-cell">
                    <button
                      onClick={() => handleSort('date')}
                      className="font-display text-sm text-charcoal/70 hover:text-maroon flex items-center gap-1"
                    >
                      Submitted
                      {sortBy === 'date' && (
                        <svg className={`w-4 h-4 ${sortOrder === 'desc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left">
                    <span className="font-display text-sm text-charcoal/70">Status</span>
                  </th>
                  <th className="px-6 py-3 text-right">
                    <span className="font-display text-sm text-charcoal/70">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-dark">
                {filteredSubmissions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <svg className="w-12 h-12 text-charcoal/20 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="font-body text-charcoal/50">No submissions found</p>
                    </td>
                  </tr>
                ) : (
                  filteredSubmissions.map((submission) => (
                    <tr
                      key={submission._id}
                      className="hover:bg-cream-dark/20 transition-colors cursor-pointer"
                      onClick={() => setSelectedSubmission(submission)}
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-body font-medium text-charcoal">{submission.fullName}</p>
                          <p className="font-body text-xs text-charcoal/50 md:hidden">{submission.jurisdiction}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-body text-sm text-charcoal/70">{submission.title}</span>
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        <span className="font-body text-sm text-charcoal/70">{submission.jurisdiction}</span>
                      </td>
                      <td className="px-6 py-4 hidden lg:table-cell">
                        <span className="font-body text-sm text-charcoal/70">
                          {new Date(submission.submittedAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={submission.status} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedSubmission(submission);
                          }}
                          className="text-gold hover:text-gold-dark transition-colors font-body text-sm"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-4 border-t border-cream-dark bg-cream-dark/20">
            <p className="font-body text-sm text-charcoal/60">
              Showing {filteredSubmissions.length} of {stats.total} submissions
            </p>
          </div>
        </div>
      </main>

      {selectedSubmission && (
        <DetailModal
          submission={selectedSubmission}
          onClose={() => setSelectedSubmission(null)}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
}
