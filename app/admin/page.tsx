"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useSubmissions } from "../context/SubmissionsContext";
import { DeceasedMemberSubmission } from "../types";

// Status badge component
function StatusBadge({ status }: { status: DeceasedMemberSubmission['status'] }) {
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
  submission: DeceasedMemberSubmission;
  onClose: () => void;
  onStatusChange: (id: string, status: DeceasedMemberSubmission['status']) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-charcoal/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-dove-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
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

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="grid gap-6">
            {/* Status & Actions */}
            <div className="flex items-center justify-between pb-4 border-b border-cream-dark">
              <div className="flex items-center gap-3">
                <span className="font-body text-sm text-charcoal/60">Status:</span>
                <StatusBadge status={submission.status} />
              </div>
              <div className="flex gap-2">
                {submission.status === 'pending' && (
                  <button
                    onClick={() => onStatusChange(submission.id, 'reviewed')}
                    className="px-3 py-1.5 text-sm font-body bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                  >
                    Mark Reviewed
                  </button>
                )}
                {submission.status !== 'published' && (
                  <button
                    onClick={() => onStatusChange(submission.id, 'published')}
                    className="px-3 py-1.5 text-sm font-body bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors"
                  >
                    Publish
                  </button>
                )}
              </div>
            </div>

            {/* Member Information */}
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

            {/* Documents */}
            {(submission.obituaryLink || submission.obituaryFiles.length > 0 || submission.programFiles.length > 0) && (
              <div>
                <h3 className="font-display text-lg text-maroon mb-3">Documents</h3>
                <div className="space-y-2">
                  {submission.obituaryLink && (
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
                  )}
                  {submission.obituaryFiles.length > 0 && (
                    <div className="flex items-center gap-2 text-charcoal/70 font-body text-sm">
                      <svg className="w-4 h-4 text-gold" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                      </svg>
                      Obituary: {submission.obituaryFiles.join(', ')}
                    </div>
                  )}
                  {submission.programFiles.length > 0 && (
                    <div className="flex items-center gap-2 text-charcoal/70 font-body text-sm">
                      <svg className="w-4 h-4 text-gold" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                      </svg>
                      Program: {submission.programFiles.join(', ')}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Memorial Service */}
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
                {submission.memorialServiceNotes && (
                  <div className="mt-3">
                    <p className="font-body text-xs text-charcoal/50 uppercase tracking-wide">Notes</p>
                    <p className="font-body text-charcoal text-sm">{submission.memorialServiceNotes}</p>
                  </div>
                )}
              </div>
            )}

            {/* Family Contact */}
            {(submission.familyContactName || submission.familyContactEmail || submission.familyContactPhone) && (
              <div>
                <h3 className="font-display text-lg text-maroon mb-3">Family Contact</h3>
                <div className="grid grid-cols-2 gap-4">
                  {submission.familyContactName && (
                    <div>
                      <p className="font-body text-xs text-charcoal/50 uppercase tracking-wide">Name</p>
                      <p className="font-body text-charcoal">{submission.familyContactName}</p>
                    </div>
                  )}
                  {submission.familyContactEmail && (
                    <div>
                      <p className="font-body text-xs text-charcoal/50 uppercase tracking-wide">Email</p>
                      <a href={`mailto:${submission.familyContactEmail}`} className="font-body text-gold hover:underline">
                        {submission.familyContactEmail}
                      </a>
                    </div>
                  )}
                  {submission.familyContactPhone && (
                    <div>
                      <p className="font-body text-xs text-charcoal/50 uppercase tracking-wide">Phone</p>
                      <a href={`tel:${submission.familyContactPhone}`} className="font-body text-gold hover:underline">
                        {submission.familyContactPhone}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Submitter Info */}
            <div className="pt-4 border-t border-cream-dark">
              <h3 className="font-display text-lg text-maroon mb-3">Submission Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-body text-xs text-charcoal/50 uppercase tracking-wide">Submitted By</p>
                  <p className="font-body text-charcoal">{submission.submitterName || 'Not provided'}</p>
                </div>
                <div>
                  <p className="font-body text-xs text-charcoal/50 uppercase tracking-wide">Email</p>
                  {submission.submitterEmail ? (
                    <a href={`mailto:${submission.submitterEmail}`} className="font-body text-gold hover:underline">
                      {submission.submitterEmail}
                    </a>
                  ) : (
                    <p className="font-body text-charcoal/50">Not provided</p>
                  )}
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
                  <p className="font-body text-charcoal font-mono text-sm">{submission.id}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-cream-dark/30 border-t border-cream-dark flex justify-end">
          <button
            onClick={onClose}
            className="btn-secondary text-sm py-2 px-4"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { submissions, updateSubmissionStatus } = useSubmissions();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | DeceasedMemberSubmission['status']>('all');
  const [selectedSubmission, setSelectedSubmission] = useState<DeceasedMemberSubmission | null>(null);
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'jurisdiction'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Calculate stats
  const stats = useMemo(() => {
    const now = new Date();
    const thisMonth = submissions.filter(s => {
      const submitted = new Date(s.submittedAt);
      return submitted.getMonth() === now.getMonth() && submitted.getFullYear() === now.getFullYear();
    }).length;

    const lastMonth = submissions.filter(s => {
      const submitted = new Date(s.submittedAt);
      const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1);
      return submitted.getMonth() === lastMonthDate.getMonth() && submitted.getFullYear() === lastMonthDate.getFullYear();
    }).length;

    return {
      total: submissions.length,
      pending: submissions.filter(s => s.status === 'pending').length,
      reviewed: submissions.filter(s => s.status === 'reviewed').length,
      published: submissions.filter(s => s.status === 'published').length,
      thisMonth,
      monthTrend: thisMonth - lastMonth
    };
  }, [submissions]);

  // Filter and sort submissions
  const filteredSubmissions = useMemo(() => {
    let result = [...submissions];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(s =>
        s.fullName.toLowerCase().includes(query) ||
        s.jurisdiction.toLowerCase().includes(query) ||
        s.title.toLowerCase().includes(query) ||
        s.id.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter(s => s.status === statusFilter);
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime();
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
  }, [submissions, searchQuery, statusFilter, sortBy, sortOrder]);

  const handleSort = (field: 'date' | 'name' | 'jurisdiction') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <nav className="bg-maroon-dark text-dove-white">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="w-10 h-10 rounded-full bg-gold flex items-center justify-center">
                <span className="text-maroon-dark font-display font-bold text-lg">C</span>
              </div>
              <span className="font-display text-lg hidden sm:block">COGM Memorial</span>
            </Link>
            <div className="h-6 w-px bg-white/20 hidden sm:block" />
            <h1 className="font-display text-xl hidden sm:block">Admin Dashboard</h1>
          </div>
          <Link
            href="/"
            className="font-body text-sm text-dove-white/80 hover:text-white transition-colors flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Form
          </Link>
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
            trend={{ value: stats.monthTrend, label: 'from last month' }}
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
          {/* Table Header */}
          <div className="px-6 py-4 border-b border-cream-dark">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <h2 className="font-display text-xl text-maroon">Memorial Submissions</h2>
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                {/* Search */}
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
                {/* Status Filter */}
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

          {/* Table */}
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
                      key={submission.id}
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

          {/* Table Footer */}
          <div className="px-6 py-4 border-t border-cream-dark bg-cream-dark/20">
            <p className="font-body text-sm text-charcoal/60">
              Showing {filteredSubmissions.length} of {submissions.length} submissions
            </p>
          </div>
        </div>
      </main>

      {/* Detail Modal */}
      {selectedSubmission && (
        <DetailModal
          submission={selectedSubmission}
          onClose={() => setSelectedSubmission(null)}
          onStatusChange={(id, status) => {
            updateSubmissionStatus(id, status);
            setSelectedSubmission(prev => prev ? { ...prev, status } : null);
          }}
        />
      )}
    </div>
  );
}
