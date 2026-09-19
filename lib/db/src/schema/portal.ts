import {
  boolean,
  date,
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const portalUsersTable = pgTable("portal_users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull(),
  identifier: text("identifier").notNull(),
  avatarInitials: text("avatar_initials").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const portalSessionsTable = pgTable("portal_sessions", {
  token: text("token").primaryKey(),
  userId: text("user_id").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
});

export const portalCoursesTable = pgTable("portal_courses", {
  id: text("id").primaryKey(),
  code: text("code").notNull(),
  title: text("title").notNull(),
  credits: integer("credits").notNull(),
  instructor: text("instructor").notNull(),
  schedule: text("schedule").notNull(),
  room: text("room").notNull(),
  accent: text("accent").notNull(),
});

export const portalRegistrationsTable = pgTable("portal_registrations", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  courseId: text("course_id").notNull(),
  status: text("status").notNull().default("registered"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const portalSupportTicketsTable = pgTable("portal_support_tickets", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  category: text("category").notNull(),
  status: text("status").notNull().default("open"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const portalPaymentsTable = pgTable("portal_payments", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  date: date("date", { mode: "string" }).notNull(),
  reference: text("reference").notNull(),
  description: text("description").notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  status: text("status").notNull().default("posted"),
});

export const portalDocumentsTable = pgTable("portal_documents", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  type: text("type").notNull(),
  issueDate: date("issue_date", { mode: "string" }).notNull(),
  verificationNumber: text("verification_number").notNull().unique(),
  status: text("status").notNull().default("available"),
});

export const portalAnnouncementsTable = pgTable("portal_announcements", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  date: date("date", { mode: "string" }).notNull(),
  category: text("category").notNull(),
  read: boolean("read").notNull().default(false),
});