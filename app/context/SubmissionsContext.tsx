"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { DeceasedMemberSubmission } from '../types';

// Generate mock data for demo
const generateMockSubmissions = (): DeceasedMemberSubmission[] => {
  const titles = ['MWGM', 'MWPGM', 'PMWGM'];
  const jurisdictions = [
    'Michigan', 'Ohio', 'Illinois', 'Georgia', 'Texas', 'California',
    'New York', 'Florida', 'Pennsylvania', 'North Carolina', 'Alabama',
    'Louisiana', 'Maryland', 'Virginia', 'Tennessee'
  ];
  const statuses: ('pending' | 'reviewed' | 'published')[] = ['pending', 'reviewed', 'published'];

  const names = [
    'James L. Washington, Sr.', 'Robert E. Johnson, III', 'William H. Thompson',
    'Charles M. Davis', 'Michael A. Brown, Jr.', 'Thomas J. Williams',
    'David R. Jackson', 'Richard L. Harris', 'Joseph P. Martin, Sr.',
    'Kenneth W. Robinson', 'Samuel T. Clark', 'George H. Lewis',
    'Edward C. Walker', 'Frank M. Hall', 'Raymond A. Allen'
  ];

  return names.map((name, index) => {
    const passingDate = new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
    const submittedDate = new Date(passingDate);
    submittedDate.setDate(submittedDate.getDate() + Math.floor(Math.random() * 14) + 1);

    const startYear = 1980 + Math.floor(Math.random() * 30);
    const endYear = startYear + Math.floor(Math.random() * 8) + 2;

    return {
      id: `sub-${1000 + index}`,
      fullName: name,
      passingDate: passingDate.toISOString().split('T')[0],
      title: titles[Math.floor(Math.random() * titles.length)],
      jurisdiction: jurisdictions[index % jurisdictions.length],
      yearsOfService: `${startYear}-${endYear}`,
      causeOfDeath: Math.random() > 0.5 ? 'Natural causes' : undefined,
      obituaryLink: Math.random() > 0.6 ? `https://example.com/obituary/${index}` : undefined,
      memorialServiceDate: Math.random() > 0.4 ? new Date(passingDate.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : undefined,
      memorialServiceLocation: Math.random() > 0.4 ? `${jurisdictions[index % jurisdictions.length]} Masonic Temple` : undefined,
      obituaryFiles: Math.random() > 0.5 ? ['obituary.pdf'] : [],
      programFiles: Math.random() > 0.6 ? ['memorial_program.pdf'] : [],
      submitterName: `Brother ${['John', 'Michael', 'David', 'James', 'Robert'][index % 5]} Smith`,
      submitterEmail: `submitter${index}@example.com`,
      submittedAt: submittedDate.toISOString(),
      status: statuses[Math.floor(Math.random() * statuses.length)]
    };
  });
};

interface SubmissionsContextType {
  submissions: DeceasedMemberSubmission[];
  addSubmission: (submission: Omit<DeceasedMemberSubmission, 'id' | 'submittedAt' | 'status'>) => void;
  updateSubmissionStatus: (id: string, status: DeceasedMemberSubmission['status']) => void;
  getSubmission: (id: string) => DeceasedMemberSubmission | undefined;
}

const SubmissionsContext = createContext<SubmissionsContextType | undefined>(undefined);

export function SubmissionsProvider({ children }: { children: ReactNode }) {
  const [submissions, setSubmissions] = useState<DeceasedMemberSubmission[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('cogm_submissions');
    if (stored) {
      setSubmissions(JSON.parse(stored));
    } else {
      // Initialize with mock data
      const mockData = generateMockSubmissions();
      setSubmissions(mockData);
      localStorage.setItem('cogm_submissions', JSON.stringify(mockData));
    }
    setIsInitialized(true);
  }, []);

  // Save to localStorage when submissions change
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('cogm_submissions', JSON.stringify(submissions));
    }
  }, [submissions, isInitialized]);

  const addSubmission = (submission: Omit<DeceasedMemberSubmission, 'id' | 'submittedAt' | 'status'>) => {
    const newSubmission: DeceasedMemberSubmission = {
      ...submission,
      id: `sub-${Date.now()}`,
      submittedAt: new Date().toISOString(),
      status: 'pending'
    };
    setSubmissions(prev => [newSubmission, ...prev]);
  };

  const updateSubmissionStatus = (id: string, status: DeceasedMemberSubmission['status']) => {
    setSubmissions(prev =>
      prev.map(sub => sub.id === id ? { ...sub, status } : sub)
    );
  };

  const getSubmission = (id: string) => {
    return submissions.find(sub => sub.id === id);
  };

  return (
    <SubmissionsContext.Provider value={{ submissions, addSubmission, updateSubmissionStatus, getSubmission }}>
      {children}
    </SubmissionsContext.Provider>
  );
}

export function useSubmissions() {
  const context = useContext(SubmissionsContext);
  if (context === undefined) {
    throw new Error('useSubmissions must be used within a SubmissionsProvider');
  }
  return context;
}
