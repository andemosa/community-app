import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const link_schema = v.array(
  v.object({
    tag: v.string(),
    value: v.string(),
    title: v.string(),
  }),
);

const media_schema = v.object({
  type: v.union(v.literal("photo"), v.literal("pdf"), v.literal("video")),
  metadata: v.any(),
});

const project_schema = v.array(
  v.object({
    title: v.string(),
    timeline: v.object({
      start: v.number(),
      end: v.number(),
    }),
    description: v.string(),
    media: v.array(media_schema),
    link: v.optional(v.array(v.string())),
  }),
);

const schema = defineSchema({
  users: authTables.users,
  titles: defineTable({
    name: v.string(),
    description: v.nullable(v.string()),
    color: v.optional(v.string()),
  }),
  profile: defineTable({
    userId: v.optional(v.id("users")),
    firstName: v.string(),
    lastName: v.string(),
    email: v.string(),
    profileImage: v.nullable(v.string()),
    phoneNumbers: v.array(v.string()),
    username: v.string(),
    title: v.nullable(v.id("titles")),
    links: v.optional(link_schema),
    shortBio: v.optional(v.string()), // max 250 characters
    projects: v.optional(project_schema),
  }).index("by_username", ["username"]),
});

export default schema;
