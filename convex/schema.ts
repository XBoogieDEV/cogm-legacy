import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Admin users table
  adminUsers: defineTable({
    email: v.string(),
    passwordHash: v.string(),
    name: v.string(),
    role: v.union(v.literal("admin"), v.literal("viewer")),
    createdAt: v.number(),
    lastLoginAt: v.optional(v.number()),
  }).index("by_email", ["email"]),

  // Auth sessions table
  sessions: defineTable({
    userId: v.id("adminUsers"),
    token: v.string(),
    expiresAt: v.number(),
    createdAt: v.number(),
  })
    .index("by_token", ["token"])
    .index("by_userId", ["userId"]),

  // Deceased member submissions
  submissions: defineTable({
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
    submittedAt: v.number(),
    status: v.union(
      v.literal("pending"),
      v.literal("reviewed"),
      v.literal("published")
    ),
    reviewedBy: v.optional(v.id("adminUsers")),
    reviewedAt: v.optional(v.number()),
    notes: v.optional(v.string()),
  })
    .index("by_status", ["status"])
    .index("by_jurisdiction", ["jurisdiction"])
    .index("by_submittedAt", ["submittedAt"]),
});
