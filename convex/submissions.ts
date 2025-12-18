import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Public: Create a new submission (no auth required)
export const create = mutation({
  args: {
    fullName: v.string(),
    passingDate: v.string(),
    title: v.string(),
    jurisdiction: v.string(),
    yearsOfService: v.string(),
    causeOfDeath: v.optional(v.string()),
    obituaryLink: v.optional(v.string()),
    memorialServiceDate: v.optional(v.string()),
    memorialServiceLocation: v.optional(v.string()),
    obituaryFileIds: v.optional(v.array(v.string())),
    programFileIds: v.optional(v.array(v.string())),
    submitterName: v.string(),
    submitterEmail: v.string(),
  },
  handler: async (ctx, args) => {
    const submissionId = await ctx.db.insert("submissions", {
      ...args,
      submittedAt: Date.now(),
      status: "pending",
    });

    return { submissionId };
  },
});

// Admin: Get all submissions with optional filters
export const list = query({
  args: {
    status: v.optional(v.string()),
    jurisdiction: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("submissions").order("desc");

    const submissions = await query.collect();

    // Apply filters in memory (for simplicity)
    let filtered = submissions;

    if (args.status && args.status !== "all") {
      filtered = filtered.filter((s) => s.status === args.status);
    }

    if (args.jurisdiction) {
      filtered = filtered.filter((s) =>
        s.jurisdiction.toLowerCase().includes(args.jurisdiction!.toLowerCase())
      );
    }

    if (args.limit) {
      filtered = filtered.slice(0, args.limit);
    }

    return filtered;
  },
});

// Admin: Get a single submission by ID
export const get = query({
  args: {
    id: v.id("submissions"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Admin: Update submission status
export const updateStatus = mutation({
  args: {
    id: v.id("submissions"),
    status: v.union(
      v.literal("pending"),
      v.literal("reviewed"),
      v.literal("published")
    ),
    reviewerId: v.optional(v.id("adminUsers")),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const submission = await ctx.db.get(args.id);
    if (!submission) {
      throw new Error("Submission not found");
    }

    await ctx.db.patch(args.id, {
      status: args.status,
      reviewedBy: args.reviewerId,
      reviewedAt: Date.now(),
      notes: args.notes,
    });

    return { success: true };
  },
});

// Admin: Delete a submission
export const remove = mutation({
  args: {
    id: v.id("submissions"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return { success: true };
  },
});

// Admin: Get dashboard stats
export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const submissions = await ctx.db.query("submissions").collect();

    const total = submissions.length;
    const pending = submissions.filter((s) => s.status === "pending").length;
    const reviewed = submissions.filter((s) => s.status === "reviewed").length;
    const published = submissions.filter((s) => s.status === "published").length;

    // Get recent submissions (last 7 days)
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const recentCount = submissions.filter(
      (s) => s.submittedAt > sevenDaysAgo
    ).length;

    // Get submissions by jurisdiction
    const byJurisdiction: Record<string, number> = {};
    submissions.forEach((s) => {
      byJurisdiction[s.jurisdiction] = (byJurisdiction[s.jurisdiction] || 0) + 1;
    });

    return {
      total,
      pending,
      reviewed,
      published,
      recentCount,
      byJurisdiction,
    };
  },
});

// Public: Get published memorials only (for public memorial wall)
export const getPublished = query({
  args: {
    jurisdiction: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const submissions = await ctx.db
      .query("submissions")
      .withIndex("by_status", (q) => q.eq("status", "published"))
      .order("desc")
      .collect();

    let filtered = submissions;

    if (args.jurisdiction) {
      filtered = filtered.filter((s) =>
        s.jurisdiction.toLowerCase().includes(args.jurisdiction!.toLowerCase())
      );
    }

    if (args.limit) {
      filtered = filtered.slice(0, args.limit);
    }

    return filtered;
  },
});

// Search submissions
export const search = query({
  args: {
    searchTerm: v.string(),
  },
  handler: async (ctx, args) => {
    if (!args.searchTerm || args.searchTerm.length < 2) {
      return [];
    }

    const submissions = await ctx.db.query("submissions").collect();
    const term = args.searchTerm.toLowerCase();

    return submissions.filter(
      (s) =>
        s.fullName.toLowerCase().includes(term) ||
        s.jurisdiction.toLowerCase().includes(term) ||
        s.submitterName.toLowerCase().includes(term)
    );
  },
});
