import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Simple hash function for passwords (in production, use bcrypt via an action)
// This is a basic implementation - for demo purposes
function simpleHash(password: string): string {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  // Add salt and convert to string
  return `hashed_${Math.abs(hash).toString(36)}_${password.length}`;
}

function generateToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 64; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

// Login mutation
export const login = mutation({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("adminUsers")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
      .first();

    if (!user) {
      throw new Error("Invalid email or password");
    }

    const passwordHash = simpleHash(args.password);
    if (user.passwordHash !== passwordHash) {
      throw new Error("Invalid email or password");
    }

    // Delete any existing sessions for this user
    const existingSessions = await ctx.db
      .query("sessions")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();

    for (const session of existingSessions) {
      await ctx.db.delete(session._id);
    }

    // Create new session (24 hour expiry)
    const token = generateToken();
    const expiresAt = Date.now() + (24 * 60 * 60 * 1000);

    await ctx.db.insert("sessions", {
      userId: user._id,
      token,
      expiresAt,
      createdAt: Date.now(),
    });

    // Update last login
    await ctx.db.patch(user._id, {
      lastLoginAt: Date.now(),
    });

    return {
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  },
});

// Logout mutation
export const logout = mutation({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (session) {
      await ctx.db.delete(session._id);
    }

    return { success: true };
  },
});

// Validate session query
export const validateSession = query({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    if (!args.token) {
      return null;
    }

    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (!session) {
      return null;
    }

    // Check if session expired (queries can't delete, just return null)
    if (session.expiresAt < Date.now()) {
      return null;
    }

    const user = await ctx.db.get(session.userId);
    if (!user) {
      return null;
    }

    return {
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  },
});

// Create initial admin user (run once to set up)
export const createAdminUser = mutation({
  args: {
    email: v.string(),
    password: v.string(),
    name: v.string(),
    setupKey: v.string(),
  },
  handler: async (ctx, args) => {
    // Simple setup key to prevent unauthorized admin creation
    // Change this or use env variable in production
    if (args.setupKey !== "COGM_SETUP_2024") {
      throw new Error("Invalid setup key");
    }

    const existingUser = await ctx.db
      .query("adminUsers")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
      .first();

    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    const passwordHash = simpleHash(args.password);

    const userId = await ctx.db.insert("adminUsers", {
      email: args.email.toLowerCase(),
      passwordHash,
      name: args.name,
      role: "admin",
      createdAt: Date.now(),
    });

    return { userId, message: "Admin user created successfully" };
  },
});

// Change password mutation
export const changePassword = mutation({
  args: {
    token: v.string(),
    currentPassword: v.string(),
    newPassword: v.string(),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (!session || session.expiresAt < Date.now()) {
      throw new Error("Invalid or expired session");
    }

    const user = await ctx.db.get(session.userId);
    if (!user) {
      throw new Error("User not found");
    }

    const currentHash = simpleHash(args.currentPassword);
    if (user.passwordHash !== currentHash) {
      throw new Error("Current password is incorrect");
    }

    const newHash = simpleHash(args.newPassword);
    await ctx.db.patch(user._id, {
      passwordHash: newHash,
    });

    return { success: true };
  },
});
