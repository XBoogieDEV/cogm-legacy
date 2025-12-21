"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Doc, Id } from "../../convex/_generated/dataModel";
import { useAuth } from "../providers/AuthProvider";
import { ExportButtons } from "./ExportButtons";

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
          <p className="font-body text-sm text-charcoal/75 mb-1">{title}</p>
          <p className="font-display text-3xl text-charcoal font-semibold">{value}</p>
          {trend && (
            <p className="font-body text-xs text-charcoal/75 mt-2">
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

// Large file type thumbnail component for square cards
function FileThumbnail({
  contentType,
  url,
  className = ""
}: {
  contentType?: string | null;
  url?: string | null;
  className?: string;
}) {
  const isPDF = contentType === 'application/pdf';
  const isWord = contentType?.includes('word') || contentType?.includes('document');
  const isImage = contentType?.startsWith('image/');

  // For images, show actual thumbnail
  if (isImage && url) {
    return (
      <div className={`relative w-full h-full overflow-hidden ${className}`}>
        <img
          src={url}
          alt="Document preview"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
    );
  }

  // PDF thumbnail
  if (isPDF) {
    return (
      <div className={`flex flex-col items-center justify-center bg-gradient-to-br from-red-50 to-red-100 ${className}`}>
        <div className="relative">
          <svg className="w-16 h-16 text-red-500 drop-shadow-sm" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 2l5 5h-5V4z"/>
          </svg>
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 bg-red-500 text-white text-[9px] font-bold px-2 py-0.5 rounded shadow-sm">
            PDF
          </div>
        </div>
      </div>
    );
  }

  // Word document thumbnail
  if (isWord) {
    return (
      <div className={`flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 ${className}`}>
        <div className="relative">
          <svg className="w-16 h-16 text-blue-600 drop-shadow-sm" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 2l5 5h-5V4z"/>
          </svg>
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[9px] font-bold px-2 py-0.5 rounded shadow-sm">
            DOC
          </div>
        </div>
      </div>
    );
  }

  // Generic file thumbnail
  return (
    <div className={`flex flex-col items-center justify-center bg-gradient-to-br from-amber-50 to-amber-100 ${className}`}>
      <div className="relative">
        <svg className="w-16 h-16 text-amber-600 drop-shadow-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 bg-amber-600 text-white text-[9px] font-bold px-2 py-0.5 rounded shadow-sm">
          FILE
        </div>
      </div>
    </div>
  );
}

// Single Document File Card - displays one document as a square card
function DocumentFileCard({
  storageIds,
  title,
  onPreview
}: {
  storageIds: Id<"_storage">[];
  title: string;
  onPreview?: (url: string, fileName: string, contentType?: string | null) => void;
}) {
  const fileUrls = useQuery(
    api.files.getFileUrls,
    storageIds.length > 0 ? { storageIds } : "skip"
  );

  // Empty state
  if (storageIds.length === 0) {
    return (
      <div className="relative bg-cream-dark/20 rounded-xl border-2 border-dashed border-cream-dark overflow-hidden">
        <div className="aspect-square flex flex-col items-center justify-center p-4">
          <svg className="w-12 h-12 text-charcoal/20 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="font-display text-sm text-charcoal/75 text-center">{title}</p>
          <p className="font-body text-xs text-charcoal/60 mt-1">No file uploaded</p>
        </div>
      </div>
    );
  }

  // Loading state
  if (fileUrls === undefined) {
    return (
      <div className="relative bg-white rounded-xl border border-cream-dark overflow-hidden shadow-sm">
        <div className="aspect-square flex flex-col items-center justify-center">
          <svg className="w-8 h-8 animate-spin text-gold" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
      </div>
    );
  }

  // Get the first file (primary document)
  const file = fileUrls[0];
  if (!file) {
    return (
      <div className="relative bg-cream-dark/20 rounded-xl border-2 border-dashed border-cream-dark overflow-hidden">
        <div className="aspect-square flex flex-col items-center justify-center p-4">
          <svg className="w-12 h-12 text-charcoal/20 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="font-display text-sm text-charcoal/75 text-center">{title}</p>
          <p className="font-body text-xs text-charcoal/60 mt-1">No file uploaded</p>
        </div>
      </div>
    );
  }

  return (
    <div className="group relative bg-white rounded-xl border border-cream-dark overflow-hidden shadow-sm transition-all duration-300 hover:border-gold hover:shadow-lg hover:shadow-gold/15 hover:-translate-y-1">
      {/* Thumbnail area - square */}
      <div className="aspect-square relative overflow-hidden">
        <FileThumbnail
          contentType={file.contentType}
          url={file.url}
          className="w-full h-full"
        />

        {/* Title overlay at bottom */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-charcoal/70 to-transparent p-3 pt-8">
          <p className="font-display text-sm text-white truncate">{title}</p>
        </div>

        {/* Hover overlay with quick view */}
        <div className="absolute inset-0 bg-charcoal/50 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
          {onPreview && file.url && (
            <button
              onClick={() => onPreview(file.url!, title, file.contentType)}
              className="px-4 py-2 bg-white text-charcoal text-sm font-body font-medium rounded-lg shadow-lg transition-all duration-200 hover:bg-cream hover:scale-105 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              View
            </button>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="p-2 bg-cream-dark/30 border-t border-cream-dark/50">
        <div className="flex gap-2">
          {onPreview && file.url && (
            <button
              onClick={() => onPreview(file.url!, title, file.contentType)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-maroon text-white text-xs font-body font-medium rounded-lg transition-all duration-200 hover:bg-maroon-dark active:scale-[0.98]"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Preview
            </button>
          )}
          <a
            href={file.url || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-gold/20 text-gold-dark text-xs font-body font-medium rounded-lg border border-gold/40 transition-all duration-200 hover:bg-gold hover:text-white hover:border-gold active:scale-[0.98]"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download
          </a>
        </div>
      </div>
    </div>
  );
}

// File Viewer Component - displays stored files with download links and preview
function FileViewer({
  storageIds,
  title,
  icon,
  onPreview
}: {
  storageIds: Id<"_storage">[];
  title: string;
  icon: React.ReactNode;
  onPreview?: (url: string, fileName: string, contentType?: string | null) => void;
}) {
  const fileUrls = useQuery(
    api.files.getFileUrls,
    storageIds.length > 0 ? { storageIds } : "skip"
  );

  if (storageIds.length === 0) {
    return (
      <div className="relative overflow-hidden rounded-xl border-2 border-dashed border-cream-dark bg-cream/30 p-5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-cream-dark/50 flex items-center justify-center text-charcoal/50">
            {icon}
          </div>
          <div className="flex-1">
            <p className="font-display text-sm text-charcoal/75">{title}</p>
            <p className="font-body text-xs text-charcoal/60 mt-0.5">No files uploaded</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-xl border-2 border-gold/30 bg-gradient-to-br from-cream to-cream-dark/30 p-5">
      {/* Decorative corner accents */}
      <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-gold/10 to-transparent" />

      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-maroon to-maroon-dark flex items-center justify-center text-white shadow-sm">
          {icon}
        </div>
        <div>
          <p className="font-display text-sm text-charcoal">{title}</p>
          <p className="font-body text-[11px] text-charcoal/75">{storageIds.length} file{storageIds.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* File Cards Grid - Square cards side by side */}
      {fileUrls === undefined ? (
        <div className="flex items-center justify-center py-6">
          <div className="flex flex-col items-center gap-2">
            <svg className="w-6 h-6 animate-spin text-gold" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span className="font-body text-xs text-charcoal/75">Loading...</span>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {fileUrls.map((file, index) => (
            <div
              key={file.storageId}
              className="group relative bg-white rounded-lg border border-cream-dark overflow-hidden shadow-sm transition-all duration-300 hover:border-gold hover:shadow-lg hover:shadow-gold/15 hover:-translate-y-1"
            >
              {/* File number badge */}
              <div className="absolute top-2 right-2 z-10 w-6 h-6 rounded-full bg-maroon/90 backdrop-blur-sm flex items-center justify-center shadow-md">
                <span className="font-display text-[10px] text-white font-bold">{index + 1}</span>
              </div>

              {/* Thumbnail area - square aspect ratio */}
              <div className="aspect-square relative overflow-hidden">
                <FileThumbnail
                  contentType={file.contentType}
                  url={file.url}
                  className="w-full h-full"
                />
                {/* Hover overlay with quick actions */}
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end justify-center pb-3">
                  {onPreview && file.url && (
                    <button
                      onClick={() => onPreview(file.url!, `File ${index + 1}`, file.contentType)}
                      className="px-3 py-1.5 bg-white/95 text-charcoal text-xs font-body font-medium rounded-full shadow-lg transition-all duration-200 hover:bg-white hover:scale-105 flex items-center gap-1.5"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      View
                    </button>
                  )}
                </div>
              </div>

              {/* Action buttons row */}
              <div className="p-2 bg-cream-dark/30 border-t border-cream-dark/50">
                <div className="flex gap-1.5">
                  {onPreview && file.url && (
                    <button
                      onClick={() => onPreview(file.url!, `File ${index + 1}`, file.contentType)}
                      className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 bg-maroon text-white text-[11px] font-body font-medium rounded transition-all duration-200 hover:bg-maroon-dark active:scale-[0.98]"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Preview
                    </button>
                  )}
                  <a
                    href={file.url || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 bg-gold/20 text-gold-dark text-[11px] font-body font-medium rounded border border-gold/40 transition-all duration-200 hover:bg-gold hover:text-white hover:border-gold active:scale-[0.98]"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Document Card Component - for external links (like obituary URL)
function DocumentCard({
  title,
  link,
  icon
}: {
  title: string;
  link?: string;
  icon: React.ReactNode;
}) {
  if (!link) {
    return (
      <div className="relative overflow-hidden rounded-xl border-2 border-dashed border-cream-dark bg-cream/30 p-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-lg bg-cream-dark/50 flex items-center justify-center text-charcoal/50">
            {icon}
          </div>
          <div className="flex-1">
            <p className="font-display text-sm text-charcoal/75">{title}</p>
            <p className="font-body text-xs text-charcoal/60 mt-0.5">Not provided</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative overflow-hidden rounded-xl border-2 border-gold/30 bg-gradient-to-br from-cream to-cream-dark/30 p-5 transition-all duration-300 hover:border-gold hover:shadow-lg hover:shadow-gold/10 hover:-translate-y-0.5"
    >
      {/* Decorative corner accent */}
      <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-gold/20 to-transparent" />

      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-maroon to-maroon-dark flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-display text-base text-charcoal group-hover:text-maroon transition-colors">{title}</p>
          <p className="font-body text-xs text-charcoal/75 mt-0.5 truncate">Click to view document</p>
        </div>
        <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center text-gold group-hover:bg-gold group-hover:text-white transition-all">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </div>
      </div>
    </a>
  );
}

// Detail Modal Component
function DetailModal({
  submission,
  onClose,
  onStatusChange,
  onDelete
}: {
  submission: Submission;
  onClose: () => void;
  onStatusChange: (id: Id<"submissions">, status: SubmissionStatus) => void;
  onDelete: (submission: Submission) => void;
}) {
  const [previewDocument, setPreviewDocument] = useState<{
    url: string;
    fileName: string;
    contentType?: string | null;
  } | null>(null);

  const hasDocuments = submission.obituaryLink ||
    (submission.obituaryFileIds && submission.obituaryFileIds.length > 0) ||
    (submission.programFileIds && submission.programFileIds.length > 0);

  const handlePreview = (url: string, fileName: string, contentType?: string | null) => {
    setPreviewDocument({ url, fileName, contentType });
  };

  return (
    <>
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-charcoal/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-dove-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="bg-gradient-to-r from-maroon to-maroon-dark px-6 py-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gold text-sm font-body">Memorial Record</p>
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

        <div className="px-6 py-5 overflow-y-auto max-h-[65vh]">
          <div className="grid gap-7">
            <div className="flex items-center justify-between pb-4 border-b border-cream-dark">
              <div className="flex items-center gap-3">
                <span className="font-body text-sm text-charcoal/75">Status:</span>
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
                  <p className="font-body text-xs text-charcoal/75 uppercase tracking-wide">Full Name</p>
                  <p className="font-body text-charcoal">{submission.fullName}</p>
                </div>
                <div>
                  <p className="font-body text-xs text-charcoal/75 uppercase tracking-wide">Title</p>
                  <p className="font-body text-charcoal">{submission.title}</p>
                </div>
                <div>
                  <p className="font-body text-xs text-charcoal/75 uppercase tracking-wide">Date of Passing</p>
                  <p className="font-body text-charcoal">
                    {new Date(submission.passingDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <div>
                  <p className="font-body text-xs text-charcoal/75 uppercase tracking-wide">Jurisdiction</p>
                  <p className="font-body text-charcoal">{submission.jurisdiction}</p>
                </div>
                <div>
                  <p className="font-body text-xs text-charcoal/75 uppercase tracking-wide">Years of Service</p>
                  <p className="font-body text-charcoal">{submission.yearsOfService}</p>
                </div>
                {submission.causeOfDeath && (
                  <div>
                    <p className="font-body text-xs text-charcoal/75 uppercase tracking-wide">Cause of Death</p>
                    <p className="font-body text-charcoal">{submission.causeOfDeath}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Enhanced Documents Section */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <h3 className="font-display text-lg text-maroon">Supporting Documents</h3>
              </div>

              {/* Obituary Link - kept as hyperlink */}
              {submission.obituaryLink && (
                <div className="mb-4">
                  <a
                    href={submission.obituaryLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-gold hover:text-gold-dark transition-colors font-body text-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    View Obituary Link
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              )}

              {/* Two document cards side by side */}
              <div className="grid grid-cols-2 gap-4">
                {/* Obituary Document Card */}
                <DocumentFileCard
                  storageIds={submission.obituaryFileIds || []}
                  title="Obituary"
                  onPreview={handlePreview}
                />

                {/* Memorial Program Card */}
                <DocumentFileCard
                  storageIds={submission.programFileIds || []}
                  title="Memorial Program"
                  onPreview={handlePreview}
                />
              </div>
            </div>

            {(submission.memorialServiceDate || submission.memorialServiceLocation) && (
              <div>
                <h3 className="font-display text-lg text-maroon mb-3">Memorial Service</h3>
                <div className="grid grid-cols-2 gap-4">
                  {submission.memorialServiceDate && (
                    <div>
                      <p className="font-body text-xs text-charcoal/75 uppercase tracking-wide">Service Date</p>
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
                      <p className="font-body text-xs text-charcoal/75 uppercase tracking-wide">Location</p>
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
                  <p className="font-body text-xs text-charcoal/75 uppercase tracking-wide">Submitted By</p>
                  <p className="font-body text-charcoal">{submission.submitterName}</p>
                </div>
                <div>
                  <p className="font-body text-xs text-charcoal/75 uppercase tracking-wide">Email</p>
                  <a href={`mailto:${submission.submitterEmail}`} className="font-body text-gold hover:underline">
                    {submission.submitterEmail}
                  </a>
                </div>
                <div>
                  <p className="font-body text-xs text-charcoal/75 uppercase tracking-wide">Submitted On</p>
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
                  <p className="font-body text-xs text-charcoal/75 uppercase tracking-wide">Record ID</p>
                  <p className="font-body text-charcoal font-mono text-sm">{submission._id}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-cream-dark/30 border-t border-cream-dark flex justify-between">
          <button
            onClick={() => onDelete(submission)}
            className="px-4 py-2 text-sm font-body text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
          >
            Delete Record
          </button>
          <button onClick={onClose} className="btn-secondary text-sm py-2 px-4">
            Close
          </button>
        </div>
      </div>
    </div>

    {/* Document Preview Modal */}
    {previewDocument && (
      <DocumentPreviewModal
        url={previewDocument.url}
        fileName={previewDocument.fileName}
        contentType={previewDocument.contentType}
        onClose={() => setPreviewDocument(null)}
      />
    )}
    </>
  );
}

// Delete Confirmation Dialog
function DeleteConfirmationDialog({
  submission,
  onConfirm,
  onCancel,
  isDeleting
}: {
  submission: Submission;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-charcoal/70 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-dove-white rounded-xl shadow-2xl max-w-md w-full p-6">
        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
          <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>

        <h3 className="font-display text-xl text-charcoal text-center mb-2">
          Delete Memorial Record?
        </h3>
        <p className="font-body text-charcoal/70 text-center mb-4">
          Are you sure you want to delete the record for <strong>{submission.fullName}</strong>?
          This will permanently remove the submission and all associated files.
        </p>
        <p className="font-body text-sm text-red-600 text-center mb-6">
          This action cannot be undone.
        </p>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="flex-1 btn-secondary py-2 text-sm"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-body disabled:opacity-50"
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Document Preview Modal
function DocumentPreviewModal({
  url,
  fileName,
  contentType,
  onClose
}: {
  url: string;
  fileName?: string;
  contentType?: string | null;
  onClose: () => void;
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Detect file type from content type or fallback to URL/filename
  const getViewerType = (): 'image' | 'pdf' | 'word' | 'unknown' => {
    // First try content type (most reliable)
    if (contentType) {
      if (contentType.startsWith('image/')) return 'image';
      if (contentType === 'application/pdf') return 'pdf';
      if (contentType.includes('word') ||
          contentType === 'application/msword' ||
          contentType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        return 'word';
      }
    }

    // Fallback to filename/URL extension
    const checkString = (fileName || url).toLowerCase();
    if (/\.(jpg|jpeg|png|gif|webp|bmp)(\?|$)/i.test(checkString)) return 'image';
    if (/\.pdf(\?|$)/i.test(checkString)) return 'pdf';
    if (/\.(doc|docx)(\?|$)/i.test(checkString)) return 'word';

    return 'unknown';
  };

  const viewerType = getViewerType();
  const googleDocsViewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-charcoal/80 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-dove-white rounded-xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-cream-dark bg-cream-dark/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-maroon to-maroon-dark flex items-center justify-center text-white">
              {viewerType === 'image' && (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              )}
              {viewerType === 'pdf' && (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              )}
              {(viewerType === 'word' || viewerType === 'unknown') && (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              )}
            </div>
            <div>
              <h3 className="font-display text-lg text-charcoal">
                {fileName || 'Document Preview'}
              </h3>
              <p className="font-body text-xs text-charcoal/75">
                {viewerType === 'image' && 'Image'}
                {viewerType === 'pdf' && 'PDF Document'}
                {viewerType === 'word' && 'Word Document'}
                {viewerType === 'unknown' && 'Document'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 text-sm font-body text-gold hover:text-gold-dark transition-colors flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Open in New Tab
            </a>
            <button
              onClick={onClose}
              className="p-2 text-charcoal/75 hover:text-charcoal transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto bg-charcoal/5 flex items-center justify-center p-4 relative">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-cream/80 z-10">
              <div className="flex flex-col items-center gap-3">
                <svg className="w-8 h-8 animate-spin text-gold" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span className="font-body text-sm text-charcoal/75">Loading document...</span>
              </div>
            </div>
          )}

          {error && (
            <div className="text-center p-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <p className="font-body text-charcoal/70 mb-4">{error}</p>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary text-sm py-2 px-4"
              >
                Download Instead
              </a>
            </div>
          )}

          {viewerType === 'image' && !error && (
            <img
              src={url}
              alt={fileName || 'Document'}
              className="max-w-full max-h-full object-contain"
              onLoad={() => setIsLoading(false)}
              onError={() => {
                setIsLoading(false);
                setError('Failed to load image');
              }}
            />
          )}

          {viewerType === 'pdf' && !error && (
            <iframe
              src={url}
              className="w-full h-full border-0"
              title={fileName || 'PDF Document'}
              onLoad={() => setIsLoading(false)}
              onError={() => {
                setIsLoading(false);
                setError('Failed to load PDF. The document may be inaccessible.');
              }}
            />
          )}

          {viewerType === 'word' && !error && (
            <div className="w-full h-full flex flex-col">
              <div className="bg-amber-50 border-b border-amber-200 px-4 py-2">
                <p className="font-body text-xs text-amber-800">
                  Word documents are previewed using Google Docs Viewer. If preview fails, use the download link above.
                </p>
              </div>
              <iframe
                src={googleDocsViewerUrl}
                className="flex-1 w-full border-0"
                title={fileName || 'Word Document'}
                onLoad={() => setIsLoading(false)}
                onError={() => {
                  setIsLoading(false);
                  setError('Failed to load document preview. The document may require download to view.');
                }}
              />
            </div>
          )}

          {viewerType === 'unknown' && !error && (
            <div className="text-center p-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-cream-dark flex items-center justify-center">
                <svg className="w-8 h-8 text-charcoal/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="font-body text-charcoal/70 mb-4">
                Preview not available for this file type.
              </p>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary text-sm py-2 px-4"
              >
                Download File
              </a>
            </div>
          )}
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
  const [jurisdictionFilter, setJurisdictionFilter] = useState<string>('all');
  const [dateRangeStart, setDateRangeStart] = useState<string>('');
  const [dateRangeEnd, setDateRangeEnd] = useState<string>('');
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'jurisdiction'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    submission: Submission | null;
    isDeleting: boolean;
  }>({ isOpen: false, submission: null, isDeleting: false });

  // Convex queries
  const submissions = useQuery(api.submissions.list, {
    status: statusFilter === 'all' ? undefined : statusFilter,
  });
  const stats = useQuery(api.submissions.getStats, {});
  const updateStatusMutation = useMutation(api.submissions.updateStatus);
  const removeMutation = useMutation(api.submissions.remove);

  // Extract unique jurisdictions for filter dropdown (must be before conditional returns)
  const uniqueJurisdictions = useMemo(() => {
    if (!submissions) return [];
    const jurisdictions = new Set(submissions.map(s => s.jurisdiction));
    return Array.from(jurisdictions).sort();
  }, [submissions]);

  // Filter and sort submissions (must be before conditional returns)
  const filteredSubmissions = useMemo(() => {
    if (!submissions) return [];
    let result = [...submissions];

    // Text search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(s =>
        s.fullName.toLowerCase().includes(query) ||
        s.jurisdiction.toLowerCase().includes(query) ||
        s.title.toLowerCase().includes(query)
      );
    }

    // Jurisdiction filter
    if (jurisdictionFilter !== 'all') {
      result = result.filter(s => s.jurisdiction === jurisdictionFilter);
    }

    // Date range filter (based on passing date)
    if (dateRangeStart) {
      const startDate = new Date(dateRangeStart).getTime();
      result = result.filter(s => new Date(s.passingDate).getTime() >= startDate);
    }
    if (dateRangeEnd) {
      const endDate = new Date(dateRangeEnd).getTime() + 86400000; // Include the end date
      result = result.filter(s => new Date(s.passingDate).getTime() < endDate);
    }

    // Sort
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
  }, [submissions, searchQuery, jurisdictionFilter, dateRangeStart, dateRangeEnd, sortBy, sortOrder]);

  // Check if any filters are active
  const hasActiveFilters = searchQuery || statusFilter !== 'all' || jurisdictionFilter !== 'all' || dateRangeStart || dateRangeEnd;

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setJurisdictionFilter('all');
    setDateRangeStart('');
    setDateRangeEnd('');
  };

  // Redirect to login if not authenticated
  if (!authLoading && !isAuthenticated) {
    router.push('/admin/login');
    return null;
  }

  if (authLoading || !submissions || !stats) {
    return <LoadingSkeleton />;
  }

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

  const handleDeleteRequest = (submission: Submission) => {
    setSelectedSubmission(null);
    setDeleteConfirmation({ isOpen: true, submission, isDeleting: false });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmation.submission) return;

    setDeleteConfirmation(prev => ({ ...prev, isDeleting: true }));

    try {
      await removeMutation({ id: deleteConfirmation.submission._id });
      setDeleteConfirmation({ isOpen: false, submission: null, isDeleting: false });
    } catch (error) {
      console.error('Failed to delete submission:', error);
      alert('Failed to delete submission. Please try again.');
      setDeleteConfirmation(prev => ({ ...prev, isDeleting: false }));
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmation({ isOpen: false, submission: null, isDeleting: false });
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
            {/* Header row with title and export */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-4">
              <h2 className="font-display text-xl text-maroon">Memorial Submissions</h2>
              <ExportButtons
                submissions={filteredSubmissions}
                statusFilter={statusFilter}
                isLoading={!submissions}
              />
            </div>

            {/* Filters row */}
            <div className="flex flex-col lg:flex-row gap-3">
              {/* Search input */}
              <div className="relative flex-1 lg:max-w-xs">
                <svg className="w-5 h-5 text-charcoal/40 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search by name, title..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="elegant-input py-2 text-sm w-full"
                  style={{ paddingLeft: '2.75rem' }}
                  aria-label="Search submissions"
                />
              </div>

              {/* Filter dropdowns */}
              <div className="flex flex-wrap gap-3">
                {/* Status filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                  className="elegant-input elegant-select py-2 text-sm w-full sm:w-32"
                  aria-label="Filter by status"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="reviewed">Reviewed</option>
                  <option value="published">Published</option>
                </select>

                {/* Jurisdiction filter */}
                <select
                  value={jurisdictionFilter}
                  onChange={(e) => setJurisdictionFilter(e.target.value)}
                  className="elegant-input elegant-select py-2 text-sm w-full sm:w-40"
                  aria-label="Filter by jurisdiction"
                >
                  <option value="all">All Jurisdictions</option>
                  {uniqueJurisdictions.map((jurisdiction) => (
                    <option key={jurisdiction} value={jurisdiction}>
                      {jurisdiction}
                    </option>
                  ))}
                </select>

                {/* Date range filters */}
                <div className="flex items-center gap-2">
                  <label htmlFor="dateStart" className="font-body text-xs text-charcoal/75 whitespace-nowrap">
                    Passing Date:
                  </label>
                  <input
                    id="dateStart"
                    type="date"
                    value={dateRangeStart}
                    onChange={(e) => setDateRangeStart(e.target.value)}
                    className="elegant-input py-2 text-sm w-36"
                    aria-label="Start date"
                  />
                  <span className="text-charcoal/75 text-sm">to</span>
                  <input
                    id="dateEnd"
                    type="date"
                    value={dateRangeEnd}
                    onChange={(e) => setDateRangeEnd(e.target.value)}
                    className="elegant-input py-2 text-sm w-36"
                    aria-label="End date"
                  />
                </div>

                {/* Clear filters button */}
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-1.5 px-3 py-2 text-sm font-body text-maroon hover:text-maroon-dark hover:bg-maroon/10 rounded-lg transition-colors"
                    aria-label="Clear all filters"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Clear Filters
                  </button>
                )}
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
                      <p className="font-body text-charcoal/75">No submissions found</p>
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
                          <p className="font-body text-xs text-charcoal/75 md:hidden">{submission.jurisdiction}</p>
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
            <p className="font-body text-sm text-charcoal/75">
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
          onDelete={handleDeleteRequest}
        />
      )}

      {deleteConfirmation.isOpen && deleteConfirmation.submission && (
        <DeleteConfirmationDialog
          submission={deleteConfirmation.submission}
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
          isDeleting={deleteConfirmation.isDeleting}
        />
      )}
    </div>
  );
}
