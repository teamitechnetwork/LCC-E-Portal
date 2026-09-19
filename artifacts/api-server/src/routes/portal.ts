import { Router, type IRouter, type Request, type Response } from "express";
import crypto from "node:crypto";
import { and, eq } from "drizzle-orm";
import {
  db,
  portalAnnouncementsTable,
  portalCoursesTable,
  portalDocumentsTable,
  portalPaymentsTable,
  portalRegistrationsTable,
  portalSessionsTable,
  portalSupportTicketsTable,
  portalUsersTable,
} from "@workspace/db";
import {
  CreateSupportTicketBody,
  CreateSupportTicketResponse,
  GetCurrentUserResponse,
  GetDashboardResponse,
  GetFinanceResponse,
  ListAnnouncementsResponse,
  ListCoursesQueryParams,
  ListCoursesResponse,
  ListDocumentsResponse,
  ListResultsResponse,
  LoginBody,
  LoginResponse,
  RegisterCourseParams,
  RegisterCourseResponse,
  VerifyDocumentParams,
  VerifyDocumentResponse,
} from "@workspace/api-zod";

type Role = "student" | "staff" | "admin" | "super_admin";

type PublicUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  identifier: string;
  avatarInitials: string;
};

const router: IRouter = Router();
const sessionCookie = "lcc_session";
const currentSemester = "Fall 2026";

const demoAccounts = [
  {
    id: "usr-superadmin",
    name: "Dr. Ruth Kollie",
    email: "superadmin@lcc.edu.lr",
    password: "LCC-Super-2026!",
    role: "super_admin" as const,
    identifier: "LCC-SA-0001",
    avatarInitials: "RK",
  },
  {
    id: "usr-admin",
    name: "Samuel Kromah",
    email: "admin@lcc.edu.lr",
    password: "LCC-Admin-2026!",
    role: "admin" as const,
    identifier: "LCC-AD-0007",
    avatarInitials: "SK",
  },
  {
    id: "usr-staff",
    name: "Patience Johnson",
    email: "staff@lcc.edu.lr",
    password: "LCC-Staff-2026!",
    role: "staff" as const,
    identifier: "LCC-ST-0142",
    avatarInitials: "PJ",
  },
  {
    id: "usr-student",
    name: "Morris Doe",
    email: "student@lcc.edu.lr",
    password: "LCC-Student-2026!",
    role: "student" as const,
    identifier: "LCC-2024-0187",
    avatarInitials: "MD",
  },
];

const demoCourses = [
  {
    id: "course-cs301",
    code: "CSC 301",
    title: "Data Structures & Algorithms",
    credits: 3,
    instructor: "Dr. James K. Toe",
    schedule: "Mon & Wed · 10:00 AM",
    room: "Science 204",
    accent: "blue",
  },
  {
    id: "course-bib220",
    code: "BIB 220",
    title: "New Testament Studies",
    credits: 3,
    instructor: "Rev. Nathaniel Cooper",
    schedule: "Tue & Thu · 8:00 AM",
    room: "Faith Hall 102",
    accent: "gold",
  },
  {
    id: "course-bus315",
    code: "BUS 315",
    title: "Entrepreneurship & Innovation",
    credits: 3,
    instructor: "Mrs. Sarah B. Morris",
    schedule: "Tue & Thu · 1:00 PM",
    room: "Business 110",
    accent: "purple",
  },
  {
    id: "course-eng210",
    code: "ENG 210",
    title: "Academic Writing",
    credits: 2,
    instructor: "Mr. Daniel K. Reeves",
    schedule: "Friday · 9:00 AM",
    room: "Humanities 201",
    accent: "green",
  },
];

const demoAnnouncements = [
  {
    id: "announcement-registration",
    title: "Course registration closes Friday",
    body: "Review your Fall 2026 schedule and complete registration before 5:00 PM on Friday.",
    date: "2026-09-18",
    category: "urgent",
    read: false,
  },
  {
    id: "announcement-chapel",
    title: "Founders Week chapel service",
    body: "The LCC community is invited to gather in the main chapel on Wednesday at 11:00 AM.",
    date: "2026-09-16",
    category: "event",
    read: true,
  },
  {
    id: "announcement-finance",
    title: "Payment plan reminder",
    body: "Students with an outstanding balance can visit Finance Services to request a payment plan.",
    date: "2026-09-12",
    category: "finance",
    read: true,
  },
];

function hashPassword(password: string, salt = crypto.randomBytes(16).toString("hex")) {
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, storedHash: string) {
  const [salt, key] = storedHash.split(":");
  if (!salt || !key) return false;
  const derived = crypto.scryptSync(password, salt, 64);
  const stored = Buffer.from(key, "hex");
  return stored.length === derived.length && crypto.timingSafeEqual(stored, derived);
}

function publicUser(user: typeof portalUsersTable.$inferSelect): PublicUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role as Role,
    identifier: user.identifier,
    avatarInitials: user.avatarInitials,
  };
}

async function ensureSeed() {
  for (const account of demoAccounts) {
    await db
      .insert(portalUsersTable)
      .values({
        id: account.id,
        name: account.name,
        email: account.email,
        passwordHash: hashPassword(account.password, `lcc-${account.id}`),
        role: account.role,
        identifier: account.identifier,
        avatarInitials: account.avatarInitials,
      })
      .onConflictDoNothing();
  }

  await db
    .insert(portalCoursesTable)
    .values(demoCourses)
    .onConflictDoNothing();

  await db
    .insert(portalAnnouncementsTable)
    .values(demoAnnouncements)
    .onConflictDoNothing();

  await db
    .insert(portalRegistrationsTable)
    .values([
      { id: "registration-cs301", userId: "usr-student", courseId: "course-cs301" },
      { id: "registration-bib220", userId: "usr-student", courseId: "course-bib220" },
      { id: "registration-eng210", userId: "usr-student", courseId: "course-eng210" },
    ])
    .onConflictDoNothing();

  await db
    .insert(portalPaymentsTable)
    .values([
      {
        id: "payment-1",
        userId: "usr-student",
        date: "2026-08-29",
        reference: "LCC-PAY-20481",
        description: "Tuition · First installment",
        amount: "1250.00",
        status: "posted",
      },
      {
        id: "payment-2",
        userId: "usr-student",
        date: "2026-09-05",
        reference: "LCC-PAY-20517",
        description: "Registration fee",
        amount: "180.00",
        status: "posted",
      },
    ])
    .onConflictDoNothing();

  await db
    .insert(portalDocumentsTable)
    .values([
      {
        id: "doc-registration",
        userId: "usr-student",
        title: "Fall 2026 Registration Slip",
        type: "registration_slip",
        issueDate: "2026-08-25",
        verificationNumber: "LCC-REG-2026-001",
        status: "available",
      },
      {
        id: "doc-grade-report",
        userId: "usr-student",
        title: "Spring 2026 Grade Report",
        type: "grade_report",
        issueDate: "2026-06-20",
        verificationNumber: "LCC-GRD-2026-041",
        status: "available",
      },
      {
        id: "doc-enrollment",
        userId: "usr-student",
        title: "Enrollment Confirmation Letter",
        type: "enrollment_letter",
        issueDate: "2026-08-20",
        verificationNumber: "LCC-ENR-2026-009",
        status: "available",
      },
    ])
    .onConflictDoNothing();
}

let seedPromise: Promise<void> | null = null;
function seedOnce() {
  seedPromise ??= ensureSeed();
  return seedPromise;
}

async function getSessionUser(req: Request) {
  await seedOnce();
  const token = req.cookies?.[sessionCookie];
  if (!token) return null;
  const [session] = await db
    .select()
    .from(portalSessionsTable)
    .where(eq(portalSessionsTable.token, token))
    .limit(1);
  if (!session || session.expiresAt.getTime() < Date.now()) return null;
  const [user] = await db
    .select()
    .from(portalUsersTable)
    .where(eq(portalUsersTable.id, session.userId))
    .limit(1);
  return user ?? null;
}

function requireUser(handler: (req: Request, res: Response, user: typeof portalUsersTable.$inferSelect) => Promise<void>) {
  return async (req: Request, res: Response) => {
    try {
      const user = await getSessionUser(req);
      if (!user) {
        res.status(401).json({ error: "Please sign in to continue." });
        return;
      }
      await handler(req, res, user);
    } catch (error) {
      req.log.error({ err: error }, "Portal request failed");
      res.status(500).json({ error: "Something went wrong. Please try again." });
    }
  };
}

function requireRole(
  allowedRoles: Role[],
  handler: (req: Request, res: Response, user: typeof portalUsersTable.$inferSelect) => Promise<void>,
) {
  return requireUser(async (req, res, user) => {
    if (!allowedRoles.includes(user.role as Role)) {
      res.status(403).json({ error: "You do not have permission to access this area." });
      return;
    }
    await handler(req, res, user);
  });
}

router.post("/auth/login", async (req, res) => {
  try {
    await seedOnce();
    const input = LoginBody.parse(req.body);
    const [user] = await db
      .select()
      .from(portalUsersTable)
      .where(eq(portalUsersTable.email, input.email.toLowerCase()))
      .limit(1);
    if (!user || !verifyPassword(input.password, user.passwordHash)) {
      res.status(401).json({ error: "The email or password is incorrect." });
      return;
    }
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + (input.rememberMe ? 30 : 1) * 24 * 60 * 60 * 1000);
    await db.insert(portalSessionsTable).values({ token, userId: user.id, expiresAt });
    res.setHeader(
      "Set-Cookie",
      `${sessionCookie}=${token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${input.rememberMe ? 2592000 : 86400}`,
    );
    res.json(LoginResponse.parse({ user: publicUser(user), expiresAt: expiresAt.toISOString() }));
  } catch (error) {
    req.log.error({ err: error }, "Login failed");
    res.status(400).json({ error: "Unable to sign in with those details." });
  }
});

router.post("/auth/logout", async (req, res) => {
  try {
    const token = req.cookies?.[sessionCookie];
    if (token) {
      await db.delete(portalSessionsTable).where(eq(portalSessionsTable.token, token));
    }
    res.setHeader("Set-Cookie", `${sessionCookie}=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0`);
    res.status(204).send();
  } catch (error) {
    req.log.error({ err: error }, "Logout failed");
    res.status(204).send();
  }
});

router.get("/auth/me", requireUser(async (_req, res, user) => {
  res.json(GetCurrentUserResponse.parse(publicUser(user)));
}));

router.get("/dashboard", requireUser(async (_req, res, user) => {
  const role = user.role as Role;
  const roleMetrics: Record<Role, Array<{ label: string; value: string; detail: string; tone: "navy" | "blue" | "gold" | "green" | "orange" | "purple" }>> = {
    student: [
      { label: "Current GPA", value: "3.68", detail: "+0.14 this term", tone: "blue" },
      { label: "Registered courses", value: "4", detail: "11 credits", tone: "gold" },
      { label: "Outstanding balance", value: "$1,420", detail: "Due Oct 15, 2026", tone: "orange" },
      { label: "Attendance", value: "94%", detail: "Excellent standing", tone: "green" },
    ],
    staff: [
      { label: "Assigned courses", value: "4", detail: "138 students total", tone: "blue" },
      { label: "Attendance to review", value: "3", detail: "Needs attention", tone: "orange" },
      { label: "Open assignments", value: "12", detail: "Across your courses", tone: "gold" },
      { label: "Avg. class grade", value: "82%", detail: "+4% this term", tone: "green" },
    ],
    admin: [
      { label: "Total students", value: "1,248", detail: "+6.4% this year", tone: "blue" },
      { label: "Active staff", value: "86", detail: "Across 6 departments", tone: "gold" },
      { label: "Applications", value: "342", detail: "28 awaiting review", tone: "purple" },
      { label: "Fee collection", value: "78%", detail: "$284k this semester", tone: "green" },
    ],
    super_admin: [
      { label: "System users", value: "1,338", detail: "4 roles active", tone: "blue" },
      { label: "System activity", value: "99.9%", detail: "Healthy this month", tone: "green" },
      { label: "Audit events", value: "482", detail: "Last 30 days", tone: "gold" },
      { label: "Security alerts", value: "0", detail: "No action needed", tone: "purple" },
    ],
  };

  const dashboard = {
    greeting: `Good morning, ${user.name.split(" ")[0]}`,
    currentSemester,
    metrics: roleMetrics[role],
    upcoming:
      role === "student"
        ? [
            { title: "Data Structures & Algorithms", subtitle: "CSC 301 · Science 204", time: "10:00 AM", type: "class" as const },
            { title: "Research proposal", subtitle: "BUS 315 · Due tomorrow", time: "11:59 PM", type: "deadline" as const },
            { title: "Founders Week chapel", subtitle: "Main chapel · All students", time: "Wed, 11:00 AM", type: "event" as const },
          ]
        : [
            { title: "Attendance review", subtitle: "3 classes need review", time: "Today", type: "deadline" as const },
            { title: "Faculty senate meeting", subtitle: "Administration building", time: "Wed, 2:00 PM", type: "event" as const },
            { title: "Grade submission window", subtitle: "Fall 2026 · Opens next week", time: "Oct 1", type: "deadline" as const },
          ],
    activity: [
      { title: "Registration slip issued", detail: "Your Fall 2026 registration is confirmed.", timestamp: "2 hours ago", kind: "registration" as const },
      { title: "Payment received", detail: "LCC-PAY-20517 · Registration fee", timestamp: "Sep 5, 2026", kind: "payment" as const },
      { title: "New announcement", detail: "Course registration closes Friday.", timestamp: "Sep 18, 2026", kind: "announcement" as const },
    ],
    progress: role === "student" ? 72 : 86,
    role,
  };
  res.json(GetDashboardResponse.parse(dashboard));
}));

router.get("/courses", requireUser(async (req, res, user) => {
  const params = ListCoursesQueryParams.parse(req.query);
  const [courses, registrations] = await Promise.all([
    db.select().from(portalCoursesTable),
    db.select().from(portalRegistrationsTable).where(eq(portalRegistrationsTable.userId, user.id)),
  ]);
  const registered = new Set(registrations.map((registration) => registration.courseId));
  const data = courses.map((course) => ({
    ...course,
    credits: Number(course.credits),
    status: user.role === "student" && registered.has(course.id) ? "registered" : "available",
    semester: params.semester,
  }));
  res.json(ListCoursesResponse.parse(data));
}));

router.post("/courses/:courseId/register", requireRole(["student"], async (req, res, user) => {
  const params = RegisterCourseParams.parse(req.params);
  const [course] = await db.select().from(portalCoursesTable).where(eq(portalCoursesTable.id, params.courseId)).limit(1);
  if (!course) {
    res.status(404).json({ error: "Course not found." });
    return;
  }
  const [existing] = await db
    .select()
    .from(portalRegistrationsTable)
    .where(and(eq(portalRegistrationsTable.userId, user.id), eq(portalRegistrationsTable.courseId, course.id)))
    .limit(1);
  if (!existing) {
    await db.insert(portalRegistrationsTable).values({
      id: `registration-${user.id}-${course.id}`,
      userId: user.id,
      courseId: course.id,
      status: "registered",
    });
  }
  res.json(RegisterCourseResponse.parse({ ...course, credits: Number(course.credits), status: "registered" }));
}));

router.get("/results", requireUser(async (_req, res, user) => {
  const results = user.role === "student"
    ? [
        { id: "result-1", courseCode: "CSC 201", courseTitle: "Introduction to Programming", credits: 3, score: 87, grade: "A", points: 4, semester: "Spring 2026" },
        { id: "result-2", courseCode: "MAT 205", courseTitle: "Discrete Mathematics", credits: 3, score: 79, grade: "B+", points: 3.5, semester: "Spring 2026" },
        { id: "result-3", courseCode: "COM 210", courseTitle: "Communication Skills", credits: 2, score: 91, grade: "A", points: 4, semester: "Spring 2026" },
        { id: "result-4", courseCode: "BIB 110", courseTitle: "Foundations of Faith", credits: 2, score: 84, grade: "A-", points: 3.7, semester: "Fall 2025" },
      ]
    : [
        { id: "result-staff-1", courseCode: "CSC 301", courseTitle: "Data Structures & Algorithms", credits: 3, score: 82, grade: "B+", points: 3.5, semester: currentSemester },
        { id: "result-staff-2", courseCode: "BUS 315", courseTitle: "Entrepreneurship & Innovation", credits: 3, score: 86, grade: "A-", points: 3.7, semester: currentSemester },
      ];
  res.json(ListResultsResponse.parse(results));
}));

router.get("/finance", requireRole(["student", "admin", "super_admin"], async (_req, res, user) => {
  const payments = await db.select().from(portalPaymentsTable).where(eq(portalPaymentsTable.userId, user.id));
  const totalFees = user.role === "student" ? 3900 : 0;
  const amountPaid = payments.reduce((sum, payment) => sum + Number(payment.amount), 0);
  res.json(
    GetFinanceResponse.parse({
      totalFees,
      amountPaid,
      outstanding: Math.max(totalFees - amountPaid, 0),
      dueDate: "2026-10-15",
      payments: payments.map((payment) => ({ ...payment, amount: Number(payment.amount) })),
    }),
  );
}));

router.get("/documents", requireRole(["student", "admin", "super_admin"], async (_req, res, user) => {
  const documents = await db.select().from(portalDocumentsTable).where(eq(portalDocumentsTable.userId, user.id));
  res.json(ListDocumentsResponse.parse(documents));
}));

router.get("/announcements", requireUser(async (_req, res) => {
  const announcements = await db.select().from(portalAnnouncementsTable);
  res.json(ListAnnouncementsResponse.parse(announcements));
}));

router.post("/support-tickets", requireUser(async (req, res, user) => {
  const input = CreateSupportTicketBody.parse(req.body);
  const ticket = {
    id: crypto.randomUUID(),
    userId: user.id,
    subject: input.subject,
    message: input.message,
    category: input.category,
    status: "open",
    createdAt: new Date(),
  };
  await db.insert(portalSupportTicketsTable).values(ticket);
  res.status(201).json(
    CreateSupportTicketResponse.parse({
      id: ticket.id,
      subject: ticket.subject,
      category: ticket.category,
      status: ticket.status,
      createdAt: ticket.createdAt.toISOString(),
    }),
  );
}));

router.get("/verify/:verificationNumber", async (req, res) => {
  try {
    await seedOnce();
    const { verificationNumber } = VerifyDocumentParams.parse(req.params);
    const [document] = await db
      .select()
      .from(portalDocumentsTable)
      .where(eq(portalDocumentsTable.verificationNumber, verificationNumber))
      .limit(1);
    if (!document) {
      res.status(404).json({ error: "No official document matches that verification number." });
      return;
    }
    res.json(
      VerifyDocumentResponse.parse({
        valid: true,
        documentType: document.title,
        issuedDate: document.issueDate,
        institution: "Liberia Christian College",
        verificationNumber: document.verificationNumber,
        holderName: null,
      }),
    );
  } catch (error) {
    req.log.error({ err: error }, "Document verification failed");
    res.status(400).json({ error: "Enter a valid verification number." });
  }
});

export default router;