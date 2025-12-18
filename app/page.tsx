"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useRef, FormEvent, DragEvent } from "react";
import { useSubmissions } from "./context/SubmissionsContext";

// Jurisdiction options - organized by region
const jurisdictions = {
  "United States": [
    "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut",
    "Delaware", "District of Columbia", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois",
    "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts",
    "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada",
    "New Hampshire", "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota",
    "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina",
    "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington",
    "West Virginia", "Wisconsin", "Wyoming"
  ],
  "Canada": [
    "Alberta", "British Columbia", "Manitoba", "New Brunswick", "Newfoundland and Labrador",
    "Nova Scotia", "Ontario", "Prince Edward Island", "Quebec", "Saskatchewan"
  ],
  "Caribbean": [
    "Bahamas", "Barbados", "Bermuda", "Jamaica", "Trinidad and Tobago", "U.S. Virgin Islands"
  ],
  "Africa": [
    "Liberia", "Nigeria", "South Africa"
  ]
};

// Title options
const titles = [
  { value: "MWGM", label: "MWGM - Most Worshipful Grand Master" },
  { value: "MWPGM", label: "MWPGM - Most Worshipful Past Grand Master" },
  { value: "PMWGM", label: "PMWGM - Past Most Worshipful Grand Master" }
];

interface FileUpload {
  file: File;
  preview?: string;
}

// Section Header Component
function SectionHeader({ number, title, subtitle }: { number: number; title: string; subtitle?: string }) {
  return (
    <div className="flex items-start gap-4 mb-6">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-maroon to-maroon-dark flex items-center justify-center">
        <span className="text-white font-display text-sm font-semibold">{number}</span>
      </div>
      <div>
        <h3 className="font-display text-xl text-maroon font-medium">{title}</h3>
        {subtitle && <p className="font-body text-sm text-charcoal/60 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

// Collapsible Section Component
function CollapsibleSection({
  title,
  children,
  defaultOpen = false
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-cream-dark rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-5 py-4 flex items-center justify-between bg-cream-dark/30 hover:bg-cream-dark/50 transition-colors"
      >
        <span className="font-display text-lg text-charcoal font-medium">{title}</span>
        <svg
          className={`w-5 h-5 text-gold transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div className={`transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
        <div className="p-5 bg-dove-white">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const { addSubmission } = useSubmissions();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  // Form state - Core required fields
  const [formData, setFormData] = useState({
    fullName: "",
    passingDate: "",
    title: "",
    jurisdiction: "",
    yearsOfService: "",
    // Optional fields
    causeOfDeath: "",
    obituaryLink: "",
    memorialServiceDate: "",
    memorialServiceLocation: "",
    memorialServiceNotes: "",
    familyContactName: "",
    familyContactEmail: "",
    familyContactPhone: "",
    submitterName: "",
    submitterEmail: ""
  });

  const [obituaryFiles, setObituaryFiles] = useState<FileUpload[]>([]);
  const [programFiles, setProgramFiles] = useState<FileUpload[]>([]);
  const [dragOverObituary, setDragOverObituary] = useState(false);
  const [dragOverProgram, setDragOverProgram] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = (files: FileList | null, type: 'obituary' | 'program') => {
    if (!files) return;
    const newFiles: FileUpload[] = Array.from(files).slice(0, 5).map(file => ({
      file,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined
    }));

    if (type === 'obituary') {
      setObituaryFiles(prev => [...prev, ...newFiles].slice(0, 5));
    } else {
      setProgramFiles(prev => [...prev, ...newFiles].slice(0, 5));
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>, type: 'obituary' | 'program') => {
    e.preventDefault();
    if (type === 'obituary') setDragOverObituary(false);
    else setDragOverProgram(false);
    handleFileUpload(e.dataTransfer.files, type);
  };

  const removeFile = (index: number, type: 'obituary' | 'program') => {
    if (type === 'obituary') {
      setObituaryFiles(prev => prev.filter((_, i) => i !== index));
    } else {
      setProgramFiles(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Add to submissions
    addSubmission({
      fullName: formData.fullName,
      passingDate: formData.passingDate,
      title: formData.title,
      jurisdiction: formData.jurisdiction,
      yearsOfService: formData.yearsOfService,
      causeOfDeath: formData.causeOfDeath || undefined,
      obituaryLink: formData.obituaryLink || undefined,
      memorialServiceDate: formData.memorialServiceDate || undefined,
      memorialServiceLocation: formData.memorialServiceLocation || undefined,
      memorialServiceNotes: formData.memorialServiceNotes || undefined,
      familyContactName: formData.familyContactName || undefined,
      familyContactEmail: formData.familyContactEmail || undefined,
      familyContactPhone: formData.familyContactPhone || undefined,
      obituaryFiles: obituaryFiles.map(f => f.file.name),
      programFiles: programFiles.map(f => f.file.name),
      submitterName: formData.submitterName || undefined,
      submitterEmail: formData.submitterEmail || undefined,
    });

    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const resetForm = () => {
    setIsSubmitted(false);
    setFormData({
      fullName: "",
      passingDate: "",
      title: "",
      jurisdiction: "",
      yearsOfService: "",
      causeOfDeath: "",
      obituaryLink: "",
      memorialServiceDate: "",
      memorialServiceLocation: "",
      memorialServiceNotes: "",
      familyContactName: "",
      familyContactEmail: "",
      familyContactPhone: "",
      submitterName: "",
      submitterEmail: ""
    });
    setObituaryFiles([]);
    setProgramFiles([]);
  };

  // Calculate form completion percentage
  const requiredFields = ['fullName', 'passingDate', 'title', 'jurisdiction', 'yearsOfService'];
  const completedRequired = requiredFields.filter(field => formData[field as keyof typeof formData]).length;
  const completionPercent = Math.round((completedRequired / requiredFields.length) * 100);

  return (
    <div className="min-h-screen bg-cream">
      {/* Header Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-cream/80 backdrop-blur-md border-b border-gold/20">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-maroon flex items-center justify-center">
              <span className="text-gold font-display font-bold text-lg">C</span>
            </div>
            <span className="font-display text-maroon font-medium hidden sm:block">COGM Memorial</span>
          </Link>
          <Link
            href="/admin"
            className="font-body text-sm text-charcoal/70 hover:text-maroon transition-colors flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Admin
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex flex-col items-center justify-center px-4 py-16 pt-24 texture-overlay overflow-hidden">
        {/* Background Gradient Orbs */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-gold/20 to-transparent rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-maroon/10 to-transparent rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

        {/* Content */}
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          {/* Logo Banner */}
          <div className="mb-6">
            <Image
              src="/logo-banner.png"
              alt="Conference of Grand Masters - Prince Hall Masons - Deceased Member"
              width={600}
              height={300}
              className="mx-auto w-full max-w-md md:max-w-lg lg:max-w-xl h-auto drop-shadow-lg"
              priority
            />
          </div>

          {/* Headline */}
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-maroon mb-4">
            In Memoriam
          </h1>

          {/* Subheadline */}
          <p className="font-body text-lg md:text-xl text-charcoal/80 max-w-2xl mx-auto mb-3 leading-relaxed">
            Honoring the legacy of our departed brethren who served with distinction
            in the Conference of Grand Masters, Prince Hall Affiliated.
          </p>

          {/* Decorative Divider */}
          <div className="divider-ornate max-w-xs mx-auto">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2Z" />
            </svg>
          </div>

          {/* Description */}
          <p className="font-body text-base text-charcoal/70 max-w-xl mx-auto mb-8">
            This sacred registry serves to memorialize and honor our Most Worshipful Grand Masters
            who have been called from labor to eternal rest.
          </p>

          {/* CTA Button */}
          <button
            onClick={scrollToForm}
            className="btn-primary group"
          >
            <svg className="w-5 h-5 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Submit Memorial Record
          </button>

          {/* Scroll Indicator */}
          <div className="mt-12 animate-float">
            <svg className="w-6 h-6 text-gold mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section
        ref={formRef}
        className="relative py-16 px-4 bg-gradient-to-b from-cream to-cream-dark"
      >
        <div className="max-w-3xl mx-auto">
          {/* Form Header */}
          <div className="text-center mb-10">
            <h2 className="font-display text-3xl md:text-4xl text-maroon mb-3">
              Deceased Member Registry
            </h2>
            <p className="font-body text-charcoal/70">
              Please complete the following information to honor our departed brother.
            </p>
          </div>

          {/* Instructions Alert */}
          <div className="alert-info mb-8">
            <div className="flex gap-3">
              <svg className="w-6 h-6 text-gold flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="font-display text-lg text-maroon font-medium mb-1">Instructions</p>
                <p className="font-body text-sm text-charcoal/80">
                  Complete the required form below to report COGM Deceased Members.
                  Must be a sitting MWGM or a MWPGM. If available, upload additional documents.
                  Form can still be updated via the link provided after submission.
                </p>
              </div>
            </div>
          </div>

          {/* Success Message */}
          {isSubmitted ? (
            <div className="memorial-card p-12 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-gold to-gold-dark rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="font-display text-2xl text-maroon mb-4">Memorial Submitted</h3>
              <p className="font-body text-charcoal/70 mb-6">
                Thank you for honoring our departed brother. The memorial record has been
                submitted successfully and is pending review. You will receive a confirmation email shortly.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={resetForm}
                  className="btn-primary"
                >
                  Submit Another Record
                </button>
                <Link href="/admin" className="btn-secondary">
                  View All Submissions
                </Link>
              </div>
            </div>
          ) : (
            /* Form Card */
            <form onSubmit={handleSubmit} className="memorial-card">
              {/* Progress Indicator */}
              <div className="px-6 md:px-10 pt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-body text-sm text-charcoal/60">Form Progress</span>
                  <span className="font-display text-sm text-maroon font-medium">{completionPercent}%</span>
                </div>
                <div className="h-2 bg-cream-dark rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-gold to-gold-dark transition-all duration-500 ease-out rounded-full"
                    style={{ width: `${completionPercent}%` }}
                  />
                </div>
              </div>

              <div className="p-6 md:p-10 space-y-8">

                {/* Section 1: Deceased Member Information */}
                <div>
                  <SectionHeader
                    number={1}
                    title="Deceased Member Information"
                    subtitle="Required information about the departed brother"
                  />

                  <div className="grid gap-5 pl-12">
                    {/* Title - First for proper respect */}
                    <div>
                      <label htmlFor="title" className="form-label">
                        Title <span className="required">*</span>
                      </label>
                      <select
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        required
                        className="elegant-input elegant-select max-w-md"
                      >
                        <option value="">Select Title</option>
                        {titles.map(t => (
                          <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                      </select>
                    </div>

                    {/* Full Name */}
                    <div>
                      <label htmlFor="fullName" className="form-label">
                        Full Name <span className="required">*</span>
                      </label>
                      <input
                        type="text"
                        id="fullName"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        placeholder="John H. Smith, II"
                        required
                        className="elegant-input"
                      />
                      <p className="text-xs text-charcoal/50 mt-1 font-body">Include suffix if applicable (Sr., Jr., II, III)</p>
                    </div>

                    {/* Passing Date */}
                    <div>
                      <label htmlFor="passingDate" className="form-label">
                        Date of Passing <span className="required">*</span>
                      </label>
                      <input
                        type="date"
                        id="passingDate"
                        name="passingDate"
                        value={formData.passingDate}
                        onChange={handleInputChange}
                        required
                        className="elegant-input max-w-xs"
                      />
                    </div>

                    {/* Jurisdiction & Years of Service - side by side */}
                    <div className="grid md:grid-cols-2 gap-5">
                      <div>
                        <label htmlFor="jurisdiction" className="form-label">
                          Jurisdiction <span className="required">*</span>
                        </label>
                        <select
                          id="jurisdiction"
                          name="jurisdiction"
                          value={formData.jurisdiction}
                          onChange={handleInputChange}
                          required
                          className="elegant-input elegant-select"
                        >
                          <option value="">Select Jurisdiction</option>
                          {Object.entries(jurisdictions).map(([region, states]) => (
                            <optgroup key={region} label={region}>
                              {states.map(state => (
                                <option key={state} value={state}>{state}</option>
                              ))}
                            </optgroup>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label htmlFor="yearsOfService" className="form-label">
                          Years of Service <span className="required">*</span>
                        </label>
                        <input
                          type="text"
                          id="yearsOfService"
                          name="yearsOfService"
                          value={formData.yearsOfService}
                          onChange={handleInputChange}
                          placeholder="1998-2002"
                          required
                          className="elegant-input"
                        />
                        <p className="text-xs text-charcoal/50 mt-1 font-body">Year range as Grand Master</p>
                      </div>
                    </div>

                    {/* Cause of Death - Optional */}
                    <div>
                      <label htmlFor="causeOfDeath" className="form-label">
                        Cause of Death <span className="text-charcoal/40 text-sm font-normal">(Optional)</span>
                      </label>
                      <input
                        type="text"
                        id="causeOfDeath"
                        name="causeOfDeath"
                        value={formData.causeOfDeath}
                        onChange={handleInputChange}
                        placeholder="e.g., Natural causes"
                        className="elegant-input"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 2: Documents */}
                <div>
                  <SectionHeader
                    number={2}
                    title="Supporting Documents"
                    subtitle="Upload obituary and memorial program if available"
                  />

                  <div className="pl-12 space-y-5">
                    {/* Obituary Link */}
                    <div>
                      <label htmlFor="obituaryLink" className="form-label">
                        Obituary Link <span className="text-charcoal/40 text-sm font-normal">(Optional)</span>
                      </label>
                      <input
                        type="url"
                        id="obituaryLink"
                        name="obituaryLink"
                        value={formData.obituaryLink}
                        onChange={handleInputChange}
                        placeholder="https://www.example.com/obituary"
                        className="elegant-input"
                      />
                    </div>

                    {/* File Uploads - side by side */}
                    <div className="grid md:grid-cols-2 gap-5">
                      {/* Obituary Upload */}
                      <div>
                        <label className="form-label">Obituary Document</label>
                        <div
                          className={`upload-zone ${dragOverObituary ? 'dragover' : ''}`}
                          onDragOver={(e) => { e.preventDefault(); setDragOverObituary(true); }}
                          onDragLeave={() => setDragOverObituary(false)}
                          onDrop={(e) => handleDrop(e, 'obituary')}
                          onClick={() => document.getElementById('obituary-input')?.click()}
                        >
                          <input
                            type="file"
                            id="obituary-input"
                            className="hidden"
                            multiple
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                            onChange={(e) => handleFileUpload(e.target.files, 'obituary')}
                          />
                          <svg className="w-10 h-10 text-gold/60 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          <p className="font-body text-sm text-charcoal/60">
                            Drag & drop or <span className="text-gold font-medium cursor-pointer hover:underline">browse</span>
                          </p>
                          <p className="font-body text-xs text-charcoal/40 mt-1">PDF, DOC, or images (max 5)</p>
                        </div>
                        {obituaryFiles.length > 0 && (
                          <ul className="mt-3 space-y-2">
                            {obituaryFiles.map((f, i) => (
                              <li key={i} className="flex items-center gap-2 text-sm bg-cream-dark/50 rounded px-3 py-2">
                                <svg className="w-4 h-4 text-gold flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                                </svg>
                                <span className="flex-1 truncate font-body">{f.file.name}</span>
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); removeFile(i, 'obituary'); }}
                                  className="text-maroon hover:text-maroon-dark p-1"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>

                      {/* Program Upload */}
                      <div>
                        <label className="form-label">Memorial Program</label>
                        <div
                          className={`upload-zone ${dragOverProgram ? 'dragover' : ''}`}
                          onDragOver={(e) => { e.preventDefault(); setDragOverProgram(true); }}
                          onDragLeave={() => setDragOverProgram(false)}
                          onDrop={(e) => handleDrop(e, 'program')}
                          onClick={() => document.getElementById('program-input')?.click()}
                        >
                          <input
                            type="file"
                            id="program-input"
                            className="hidden"
                            multiple
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                            onChange={(e) => handleFileUpload(e.target.files, 'program')}
                          />
                          <svg className="w-10 h-10 text-gold/60 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          <p className="font-body text-sm text-charcoal/60">
                            Drag & drop or <span className="text-gold font-medium cursor-pointer hover:underline">browse</span>
                          </p>
                          <p className="font-body text-xs text-charcoal/40 mt-1">PDF, DOC, or images (max 5)</p>
                        </div>
                        {programFiles.length > 0 && (
                          <ul className="mt-3 space-y-2">
                            {programFiles.map((f, i) => (
                              <li key={i} className="flex items-center gap-2 text-sm bg-cream-dark/50 rounded px-3 py-2">
                                <svg className="w-4 h-4 text-gold flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                                </svg>
                                <span className="flex-1 truncate font-body">{f.file.name}</span>
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); removeFile(i, 'program'); }}
                                  className="text-maroon hover:text-maroon-dark p-1"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 3: Optional Information - Collapsible */}
                <div>
                  <SectionHeader
                    number={3}
                    title="Additional Information"
                    subtitle="Optional details for a complete memorial record"
                  />

                  <div className="pl-12 space-y-4">
                    {/* Memorial Service Info - Collapsible */}
                    <CollapsibleSection title="Memorial Service Information">
                      <div className="grid gap-4">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="memorialServiceDate" className="form-label">Service Date</label>
                            <input
                              type="date"
                              id="memorialServiceDate"
                              name="memorialServiceDate"
                              value={formData.memorialServiceDate}
                              onChange={handleInputChange}
                              className="elegant-input"
                            />
                          </div>
                          <div>
                            <label htmlFor="memorialServiceLocation" className="form-label">Location</label>
                            <input
                              type="text"
                              id="memorialServiceLocation"
                              name="memorialServiceLocation"
                              value={formData.memorialServiceLocation}
                              onChange={handleInputChange}
                              placeholder="Church or venue name"
                              className="elegant-input"
                            />
                          </div>
                        </div>
                        <div>
                          <label htmlFor="memorialServiceNotes" className="form-label">Additional Notes</label>
                          <textarea
                            id="memorialServiceNotes"
                            name="memorialServiceNotes"
                            value={formData.memorialServiceNotes}
                            onChange={handleInputChange}
                            placeholder="Any additional details about the memorial service..."
                            rows={3}
                            className="elegant-input resize-none"
                          />
                        </div>
                      </div>
                    </CollapsibleSection>

                    {/* Family Contact - Collapsible */}
                    <CollapsibleSection title="Family Contact Information">
                      <div className="grid gap-4">
                        <div>
                          <label htmlFor="familyContactName" className="form-label">Contact Name</label>
                          <input
                            type="text"
                            id="familyContactName"
                            name="familyContactName"
                            value={formData.familyContactName}
                            onChange={handleInputChange}
                            placeholder="Family member or representative"
                            className="elegant-input"
                          />
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="familyContactEmail" className="form-label">Email</label>
                            <input
                              type="email"
                              id="familyContactEmail"
                              name="familyContactEmail"
                              value={formData.familyContactEmail}
                              onChange={handleInputChange}
                              placeholder="family@example.com"
                              className="elegant-input"
                            />
                          </div>
                          <div>
                            <label htmlFor="familyContactPhone" className="form-label">Phone</label>
                            <input
                              type="tel"
                              id="familyContactPhone"
                              name="familyContactPhone"
                              value={formData.familyContactPhone}
                              onChange={handleInputChange}
                              placeholder="(555) 123-4567"
                              className="elegant-input"
                            />
                          </div>
                        </div>
                      </div>
                    </CollapsibleSection>
                  </div>
                </div>

                {/* Section 4: Submitter Information */}
                <div>
                  <SectionHeader
                    number={4}
                    title="Your Information"
                    subtitle="So we can contact you if needed"
                  />

                  <div className="grid md:grid-cols-2 gap-5 pl-12">
                    <div>
                      <label htmlFor="submitterName" className="form-label">
                        Your Name
                      </label>
                      <input
                        type="text"
                        id="submitterName"
                        name="submitterName"
                        value={formData.submitterName}
                        onChange={handleInputChange}
                        placeholder="Your full name"
                        className="elegant-input"
                      />
                    </div>
                    <div>
                      <label htmlFor="submitterEmail" className="form-label">
                        Your Email
                      </label>
                      <input
                        type="email"
                        id="submitterEmail"
                        name="submitterEmail"
                        value={formData.submitterEmail}
                        onChange={handleInputChange}
                        placeholder="your@email.com"
                        className="elegant-input"
                      />
                    </div>
                  </div>
                </div>

              </div>

              {/* Form Footer */}
              <div className="px-6 md:px-10 py-5 bg-cream-dark/30 border-t border-gold/20">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <p className="font-body text-sm text-charcoal/60">
                    <span className="text-maroon">*</span> Required fields
                  </p>
                  <button
                    type="submit"
                    disabled={isSubmitting || completionPercent < 100}
                    className="btn-primary w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                        Submit Memorial
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 bg-maroon-dark text-dove-white/80">
        <div className="max-w-4xl mx-auto text-center">
          <p className="font-display text-lg text-gold mb-2">
            Conference of Grand Masters
          </p>
          <p className="font-body text-sm">
            Prince Hall Masons &bull; Organized 1887
          </p>
          <p className="font-body text-xs mt-4 text-dove-white/50">
            &copy; {new Date().getFullYear()} COGM. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
