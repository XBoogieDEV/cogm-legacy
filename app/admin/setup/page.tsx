"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";

export default function AdminSetup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [setupKey, setSetupKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const createAdmin = useMutation(api.auth.createAdminUser);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setIsLoading(true);

    try {
      await createAdmin({
        email,
        password,
        name,
        setupKey,
      });
      setSuccess(true);
      setTimeout(() => {
        router.push("/admin/login");
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Setup failed");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="font-display text-2xl text-charcoal mb-2">Admin Created!</h1>
          <p className="font-body text-charcoal/60">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <span className="font-display text-2xl text-maroon font-medium">
              COGM Memorial
            </span>
          </Link>
          <h1 className="font-display text-3xl text-charcoal mt-4">
            Admin Setup
          </h1>
          <p className="font-body text-charcoal/60 mt-2">
            Create your first admin account
          </p>
        </div>

        <div className="memorial-card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="name" className="form-label">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="elegant-input"
                placeholder="John Smith"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="form-label">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="elegant-input"
                placeholder="admin@example.com"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="elegant-input"
                placeholder="Minimum 8 characters"
                required
                minLength={8}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="form-label">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="elegant-input"
                placeholder="Confirm your password"
                required
              />
            </div>

            <div>
              <label htmlFor="setupKey" className="form-label">
                Setup Key
              </label>
              <input
                id="setupKey"
                type="password"
                value={setupKey}
                onChange={(e) => setSetupKey(e.target.value)}
                className="elegant-input"
                placeholder="Enter setup key"
                required
              />
              <p className="font-body text-xs text-charcoal/50 mt-1">
                Contact your system administrator for the setup key
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Creating Account..." : "Create Admin Account"}
            </button>
          </form>
        </div>

        <div className="text-center mt-6">
          <Link
            href="/admin/login"
            className="font-body text-sm text-charcoal/60 hover:text-maroon transition-colors"
          >
            Already have an account? Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
