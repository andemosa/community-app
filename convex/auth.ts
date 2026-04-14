import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const createUser = mutation({
  args: {
    email: v.string(),
    firstName: v.string(),
    username: v.string(),
    lastName: v.string(),
    phone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // if user exists
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), args.email))
      .unique();

    if (user) {
      return user._id;
    }

    const user_id = await ctx.db.insert("users", {
      email: args.email,
      emailVerificationTime: Date.now(),
      phone: args.phone,
      isAnonymous: false,
      name: `${args.firstName} ${args.lastName}`,
    });

    const profile = await ctx.db
      .query("profile")
      .filter((q) => q.eq(q.field("email"), args.email))
      .first();

    if (profile) {
      await ctx.db.patch(profile._id, {
        userId: user_id,
      });
    } else {
      await ctx.db.insert("profile", {
        userId: user_id,
        email: args.email,
        firstName: args.firstName,
        lastName: args.lastName,
        phoneNumbers: args.phone ? [args.phone] : [],
        title: null,
        profileImage: null,
        username: args.username,
        links: [],
        shortBio: "",
        projects: [],
      });
    }

    return user_id;
  },
});
