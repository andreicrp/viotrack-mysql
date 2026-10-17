import "dotenv/config";
import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import express, { type ErrorRequestHandler } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { Prisma } from "@prisma/client";
import { resolve } from "node:path";
import {
  authenticate,
  clearSessionCookie,
  csrfProtection,
  getSessionCookieName,
  hashPassword,
  isAllowedFrontendOrigin,
  requireAdmin,
  requireAuth,
  safeUser,
  setCsrfCookie,
  setSessionCookie,
  verifyPassword,
} from "./auth.js";
import { prisma } from "./db.js";

const app = express();
const port = Number(process.env.PORT || 3000);
const maxImageBytes = 4 * 1024 * 1024;
app.disable("x-powered-by");
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || isAllowedFrontendOrigin(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error("Request origin is not allowed."));
    },
    credentials: true,
  }),
);
app.use("/api/database/restore", express.json({ limit: "100mb" }));
app.use(express.json({ limit: "6mb" }));
app.use(cookieParser());
app.use("/api", csrfProtection);

const jsonValue = (value: unknown): unknown =>
  JSON.parse(JSON.stringify(value, (_key, item) =>
    typeof item === "bigint" ? Number(item) : item,
  ), (key, item) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) return item;
    return Object.fromEntries(
      Object.entries(item).map(([field, fieldValue]) => [
        field === "categoryLabel"
          ? field
          : field.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`),
        fieldValue,
      ]),
    );
  });

const asyncRoute =
  (handler: express.RequestHandler): express.RequestHandler =>
  (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };

const bodyObject = (body: unknown): Record<string, unknown> => {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw Object.assign(new Error("Request body must be a JSON object."), {
      status: 400,
    });
  }
  return body as Record<string, unknown>;
};

const fieldAliases: Record<string, string> = {
  student_id: "studentId",
  academic_year: "academicYear",
  academicyear: "academicYear",
  parent_name: "parentName",
  parent_contact: "parentContact",
  default_sanction: "defaultSanction",
  teacher_id: "teacherId",
  grade_level: "gradeLevel",
  class_section: "classSection",
  violation_id: "violationId",
  reported_by_id: "reportedById",
  reported_by_type: "reportedByType",
  reported_by_name: "reportedByName",
  date_reported: "dateReported",
  approval_status: "approvalStatus",
  approved_by: "approvedBy",
  approved_at: "approvedAt",
  rejected_by: "rejectedBy",
  rejected_at: "rejectedAt",
  rejection_reason: "rejectionReason",
  resolution_notes: "resolutionNotes",
  resolution_date: "resolutionDate",
  sms_notified: "smsNotified",
  accuracy_meters: "accuracyMeters",
  tracking_status: "trackingStatus",
  recorded_at: "recordedAt",
  category_label: "categoryLabel",
  meeting_date: "meetingDate",
  meeting_time: "meetingTime",
  record_id: "recordId",
  phone_number: "phoneNumber",
  recipient_name: "recipientName",
  user_name: "userName",
  user_role: "userRole",
  audit_id: "auditId",
  ip_address: "ipAddress",
  device_info: "deviceInfo",
  created_at: "createdAt",
  updated_at: "updatedAt",
  sent_at: "sentAt",
};

const cleanFields = (
  body: Record<string, unknown>,
  allowed: readonly string[],
) =>
  Object.fromEntries(
    Object.entries(body)
      .map(([key, value]) => [fieldAliases[key] ?? key, value] as const)
      .filter(([key, value]) => allowed.includes(key) && value !== undefined),
  );

const assertEmailAvailableAcrossRoles = async (
  email: string,
  role: "admin" | "teacher",
) => {
  const normalizedEmail = email.trim().toLowerCase();
  const conflictingAccount =
    role === "admin"
      ? await prisma.teacher.findUnique({ where: { email: normalizedEmail } })
      : await prisma.admin.findUnique({ where: { email: normalizedEmail } });
  if (conflictingAccount) {
    throw Object.assign(new Error("That email address is already assigned to another account."), {
      status: 409,
    });
  }
  return normalizedEmail;
};

const toId = (value: string) => {
  if (!/^\d+$/.test(value)) {
    throw Object.assign(new Error("A valid numeric ID is required."), {
      status: 400,
    });
  }
  return BigInt(value);
};

const serializeUser = async (user: NonNullable<express.Request["user"]>) => {
  const account =
    user.role === "admin"
      ? await prisma.admin.findUnique({
          where: { id: user.id },
          select: { id: true, email: true, fname: true, lname: true, position: true, image: true },
        })
      : await prisma.teacher.findUnique({
          where: { id: user.id },
          select: { id: true, email: true, fname: true, lname: true, position: true, department: true, contact: true, image: true },
        });
  if (!account) return null;
  return {
    id: Number(account.id),
    email: account.email,
    name: `${account.fname} ${account.lname}`.trim(),
    role: user.role,
    position: account.position,
    ...(user.role === "teacher"
      ? { department: user.department ?? "", phone: user.phone ?? "" }
      : {}),
    avatar: account.image,
    adviserSection: user.adviserSection ?? null,
  };
};

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

app.get("/api/auth/csrf", (_req, res) => {
  const token = randomBytes(32).toString("base64url");
  setCsrfCookie(res, token);
  res.json({ csrfToken: token });
});

app.post(
  "/api/auth/login",
  asyncRoute(async (req, res) => {
    const body = bodyObject(req.body);
    const email = typeof body.email === "string" ? body.email : "";
    const password = typeof body.password === "string" ? body.password : "";
    if (!email || !password || Buffer.byteLength(password) > 72) {
      res.status(400).json({ error: "Email and password are required." });
      return;
    }
    await prisma.session.deleteMany({ where: { expiresAt: { lt: new Date() } } });
    const result = await authenticate(email, password);
    if (!result) {
      res.status(401).json({ error: "Invalid email or password." });
      return;
    }
    setSessionCookie(res, result.token, body.rememberMe === true);
    res.json({ user: safeUser(result.user) });
  }),
);

app.get(
  "/api/auth/session",
  asyncRoute(async (req, res) => {
    const token = req.cookies?.[getSessionCookieName()];
    if (!token) {
      res.json({ user: null });
      return;
    }
    const tokenHash = createHash("sha256").update(token).digest("hex");
    const session = await prisma.session.findUnique({ where: { tokenHash } });
    if (!session || session.expiresAt <= new Date()) {
      if (session) await prisma.session.delete({ where: { id: session.id } });
      clearSessionCookie(res);
      res.json({ user: null });
      return;
    }
    let user = null;
    if (session.role === "admin") {
      const account = await prisma.admin.findUnique({
        where: { id: session.userId },
      });
      if (account) {
        user = {
          id: Number(account.id),
          email: account.email,
          name: `${account.fname} ${account.lname}`.trim(),
          role: "admin",
          position: account.position,
          avatar: account.image,
          adviserSection: null,
        };
      }
    } else {
      const account = await prisma.teacher.findUnique({
        where: { id: session.userId },
        include: { advisers: true },
      });
      if (account) {
        const adviser = account.advisers[0];
        user = {
          id: Number(account.id),
          email: account.email,
          name: `${account.fname} ${account.lname}`.trim(),
          role: "teacher",
          position: account.position,
          department: account.department,
          phone: account.contact,
          avatar: account.image,
          adviserSection: adviser
            ? { grade: adviser.gradeLevel, section: adviser.classSection }
            : null,
        };
      }
    }
    if (!user) {
      clearSessionCookie(res);
      res.json({ user: null });
      return;
    }
    res.json({ user });
  }),
);

app.post(
  "/api/auth/logout",
  asyncRoute(async (req, res) => {
    const token = req.cookies?.[getSessionCookieName()];
    if (token) {
      await prisma.session.deleteMany({
        where: { tokenHash: createHash("sha256").update(token).digest("hex") },
      });
    }
    clearSessionCookie(res);
    res.json({ ok: true });
  }),
);

app.post(
  "/api/auth/change-password",
  requireAuth,
  asyncRoute(async (req, res) => {
    const body = bodyObject(req.body);
    const currentPassword =
      typeof body.currentPassword === "string" ? body.currentPassword : "";
    const newPassword =
      typeof body.newPassword === "string" ? body.newPassword : "";
    if (newPassword.length < 10 || Buffer.byteLength(newPassword) > 72) {
      res.status(400).json({ error: "New password must be at least 10 characters and no more than 72 bytes." });
      return;
    }
    if (req.user!.role === "admin") {
      const account = await prisma.admin.findUnique({ where: { id: req.user!.id } });
      if (!account || !(await verifyPassword(currentPassword, account.password))) {
        res.status(401).json({ error: "Current password is incorrect." });
        return;
      }
      await prisma.admin.update({
        where: { id: req.user!.id },
        data: { password: await hashPassword(newPassword) },
      });
    } else {
      const account = await prisma.teacher.findUnique({ where: { id: req.user!.id } });
      if (!account || !(await verifyPassword(currentPassword, account.password))) {
        res.status(401).json({ error: "Current password is incorrect." });
        return;
      }
      await prisma.teacher.update({
        where: { id: req.user!.id },
        data: { password: await hashPassword(newPassword) },
      });
    }
    res.json({ ok: true });
  }),
);

app.patch(
  "/api/auth/profile",
  requireAuth,
  asyncRoute(async (req, res) => {
    const body = bodyObject(req.body);
    const allowed = req.user!.role === "admin"
      ? ["fname", "lname", "image"]
      : ["fname", "lname", "image", "contact", "department"];
    const fields = cleanFields(body, allowed);
    const data = Object.fromEntries(
      Object.entries(fields).map(([key, value]) => [
        key,
        typeof value === "string" ? value.trim() : value,
      ]),
    );
    if (req.user!.role === "admin") {
      await prisma.admin.update({ where: { id: req.user!.id }, data });
    } else {
      await prisma.teacher.update({ where: { id: req.user!.id }, data });
    }
    const user = await serializeUser(req.user!);
    res.json({ user });
  }),
);

app.post(
  "/api/uploads",
  requireAuth,
  asyncRoute(async (req, res) => {
    const body = bodyObject(req.body);
    const dataUrl = typeof body.dataUrl === "string" ? body.dataUrl : "";
    const match = /^data:image\/(png|jpeg|webp|gif);base64,([A-Za-z0-9+/]+=*)$/.exec(dataUrl);
    if (!match) {
      res.status(400).json({ error: "Only PNG, JPEG, WebP, and GIF images are accepted." });
      return;
    }
    const bytes = Buffer.from(match[2], "base64");
    if (!bytes.length || bytes.length > maxImageBytes) {
      res.status(413).json({ error: "Image must be smaller than 4 MB." });
      return;
    }
    res.json({ url: `data:image/${match[1]};base64,${bytes.toString("base64")}` });
  }),
);

const backupJsonValue = (value: unknown) =>
  JSON.parse(
    JSON.stringify(value, (_key, item) =>
      typeof item === "bigint" ? item.toString() : item,
    ),
    (_key, item) => {
      if (!item || typeof item !== "object" || Array.isArray(item)) return item;
      return Object.fromEntries(
        Object.entries(item).map(([field, fieldValue]) => [
          field === "categoryLabel"
            ? field
            : field.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`),
          fieldValue,
        ]),
      );
    },
  );

const restoreFields = (
  rows: unknown,
  collection: string,
  allowed: readonly string[],
  optional = false,
) => {
  if (rows === undefined && optional) return null;
  if (!Array.isArray(rows) || rows.length > 100_000) {
    throw Object.assign(
      new Error(`Backup collection "${collection}" must be an array of at most 100,000 rows.`),
      { status: 400 },
    );
  }
  return rows.map((entry) => {
    const fields = cleanFields(bodyObject(entry), allowed);
    if (fields.id === undefined || fields.id === null || !/^\d+$/.test(String(fields.id))) {
      throw Object.assign(
        new Error(`Every row in backup collection "${collection}" must have a numeric ID.`),
        { status: 400 },
      );
    }
    fields.id = toId(String(fields.id));
    for (const field of ["studentId", "violationId", "teacherId", "recordId"]) {
      if (fields[field] !== undefined && fields[field] !== null) {
        if (!/^\d+$/.test(String(fields[field]))) {
          throw Object.assign(new Error(`Invalid ${field} in backup collection "${collection}".`), { status: 400 });
        }
        fields[field] = toId(String(fields[field]));
      }
    }
    return fields;
  });
};

app.get(
  "/api/database/backup",
  requireAuth,
  requireAdmin,
  asyncRoute(async (req, res) => {
    const [
      students, violations, records, teachers, advisers, admins, activityLogs,
      schoolEvents, locations, meetings, smsLogs,
    ] = await Promise.all([
      prisma.student.findMany({ orderBy: { id: "asc" } }),
      prisma.violation.findMany({ orderBy: { id: "asc" } }),
      prisma.record.findMany({ orderBy: { id: "asc" } }),
      prisma.teacher.findMany({
        select: {
          id: true, fname: true, mname: true, lname: true, email: true,
          position: true, department: true, specialization: true, contact: true,
          gender: true, image: true, createdAt: true,
        },
        orderBy: { id: "asc" },
      }),
      prisma.adviser.findMany({ orderBy: { id: "asc" } }),
      prisma.admin.findMany({
        select: {
          id: true, fname: true, mname: true, lname: true, email: true,
          role: true, position: true, contact: true, image: true, createdAt: true,
        },
        orderBy: { id: "asc" },
      }),
      prisma.activityLog.findMany({ orderBy: { id: "asc" } }),
      prisma.schoolEvent.findMany({ orderBy: { id: "asc" } }),
      prisma.studentLocation.findMany({ orderBy: { id: "asc" } }),
      prisma.meeting.findMany({ orderBy: { id: "asc" } }),
      prisma.smsLog.findMany({ orderBy: { id: "asc" } }),
    ]);
    const data = {
      students, violations, records, teachers, advisers, admins,
      activity_logs: activityLogs, school_events: schoolEvents,
      locations, meetings, sms_logs: smsLogs,
    };
    const timestamp = new Date().toISOString();
    res.json(backupJsonValue({
      system: "VioTrack Disciplinary System",
      version: "3.0.0",
      format_version: 2,
      backup_id: `BKP-${Date.now()}`,
      type: "manual",
      created_at: timestamp,
      created_by: req.user!.name || "System Admin",
      counts: {
        students: students.length,
        violations: violations.length,
        records: records.length,
        teachers: teachers.length,
        advisers: advisers.length,
        admins: admins.length,
        activity_logs: activityLogs.length,
        school_events: schoolEvents.length,
        locations: locations.length,
        meetings: meetings.length,
        sms_logs: smsLogs.length,
      },
      data,
    }));
  }),
);

app.post(
  "/api/database/restore",
  requireAuth,
  requireAdmin,
  asyncRoute(async (req, res) => {
    const snapshot = bodyObject(req.body);
    const data = bodyObject(snapshot.data);
    const students = restoreFields(data.students, "students", [
      "id", ...studentFields, "createdAt",
    ])!;
    const violations = restoreFields(data.violations, "violations", [
      "id", "title", "description", "type", "severity", "defaultSanction", "createdAt",
    ])!;
    const records = restoreFields(data.records, "records", [
      "id", "studentId", "violationId", "reportedById", "reportedByType",
      "reportedByName", "dateReported", "status", "approvalStatus", "approvedBy",
      "approvedAt", "rejectedBy", "rejectedAt", "rejectionReason", "sanction",
      "remarks", "resolutionNotes", "resolutionDate", "smsNotified", "createdAt",
    ])!;
    const teachers = restoreFields(data.teachers, "teachers", [
      "id", "fname", "mname", "lname", "email", "position", "department",
      "specialization", "contact", "gender", "image", "createdAt",
    ])!;
    const advisers = restoreFields(data.advisers, "advisers", [
      "id", "teacherId", "gradeLevel", "classSection", "createdAt",
    ])!;
    const admins = restoreFields(data.admins, "admins", [
      "id", "fname", "mname", "lname", "email", "role", "position", "contact",
      "image", "createdAt",
    ])!;
    const activityLogs = restoreFields(data.activity_logs, "activity_logs", [
      "id", "userName", "userRole", "action", "details", "auditId", "ipAddress",
      "deviceInfo", "createdAt",
    ])!;
    const schoolEvents = restoreFields(data.school_events, "school_events", [
      "id", "title", "description", "date", "time", "location", "category",
      "categoryLabel", "color", "attendees", "createdAt",
    ])!;
    const locations = restoreFields(data.locations, "locations", [
      "id", "studentId", "latitude", "longitude", "accuracyMeters",
      "trackingStatus", "reportedBy", "recordedAt", "createdAt",
    ], true);
    const meetings = restoreFields(data.meetings, "meetings", [
      "id", "recordId", "studentId", "parentName", "meetingDate", "meetingTime",
      "venue", "status", "notes", "createdAt",
    ], true);
    const smsLogs = restoreFields(data.sms_logs, "sms_logs", [
      "id", "studentId", "recordId", "recipientName", "phoneNumber", "message",
      "status", "sentAt",
    ], true);
    const complete = locations !== null && meetings !== null && smsLogs !== null;

    await prisma.$transaction(async (tx) => {
      const teacherIdMap = new Map<string, bigint>();
      const adminIdMap = new Map<string, bigint>();
      for (const row of teachers) {
        const email = String(row.email ?? "").trim().toLowerCase();
        if (!email) {
          throw Object.assign(new Error("Every teacher in the backup must have an email address."), { status: 400 });
        }
        const existing = await tx.teacher.findUnique({ where: { email } });
        if (!existing) {
          throw Object.assign(
            new Error(`Teacher account "${email}" is not present in this database. Account passwords are not included in backups, so this account cannot be recreated.`),
            { status: 409 },
          );
        }
        const { id, email: _email, createdAt, ...profile } = row;
        await tx.teacher.update({
          where: { id: existing.id },
          data: { ...profile, ...(createdAt ? { createdAt: createdAt as Date } : {}) } as Prisma.TeacherUpdateInput,
        });
        teacherIdMap.set(String(id), existing.id);
      }

      for (const row of admins) {
        const email = String(row.email ?? "").trim().toLowerCase();
        if (!email) {
          throw Object.assign(new Error("Every administrator in the backup must have an email address."), { status: 400 });
        }
        const existing = await tx.admin.findUnique({ where: { email } });
        if (!existing) {
          throw Object.assign(
            new Error(`Administrator account "${email}" is not present in this database. Account passwords are not included in backups, so this account cannot be recreated.`),
            { status: 409 },
          );
        }
        const { id: _id, email: _email, createdAt, ...profile } = row;
        await tx.admin.update({
          where: { id: existing.id },
          data: { ...profile, ...(createdAt ? { createdAt: createdAt as Date } : {}) } as Prisma.AdminUpdateInput,
        });
        adminIdMap.set(String(row.id), existing.id);
      }

      const recordsToRestore = records.map((row) => {
        if (row.reportedById === undefined || row.reportedById === null) return row;
        const reporterType = String(row.reportedByType ?? "").toLowerCase();
        const idMap = reporterType === "teacher"
          ? teacherIdMap
          : reporterType === "admin"
            ? adminIdMap
            : null;
        if (!idMap) return row;
        const mappedReporterId = idMap.get(String(row.reportedById));
        if (!mappedReporterId) {
          throw Object.assign(
            new Error(`A violation record references a ${reporterType} account that could not be matched by email.`),
            { status: 409 },
          );
        }
        return { ...row, reportedById: mappedReporterId };
      });

      if (complete) {
        await tx.smsLog.deleteMany();
        await tx.meeting.deleteMany();
        await tx.studentLocation.deleteMany();
        await tx.record.deleteMany();
        await tx.adviser.deleteMany();
        await tx.violation.deleteMany();
        await tx.student.deleteMany();
        await tx.schoolEvent.deleteMany();
        await tx.activityLog.deleteMany();
      }

      if (complete) {
        await tx.student.createMany({ data: students as Prisma.StudentCreateManyInput[] });
        await tx.violation.createMany({ data: violations as Prisma.ViolationCreateManyInput[] });
        await tx.schoolEvent.createMany({ data: schoolEvents as Prisma.SchoolEventCreateManyInput[] });
        await tx.activityLog.createMany({ data: activityLogs as Prisma.ActivityLogCreateManyInput[] });
      } else {
        for (const row of students) {
          const { id, ...fields } = row;
          await tx.student.upsert({
            where: { id: id as bigint },
            create: row as Prisma.StudentCreateInput,
            update: fields as Prisma.StudentUpdateInput,
          });
        }
        for (const row of violations) {
          const { id, ...fields } = row;
          await tx.violation.upsert({
            where: { id: id as bigint },
            create: row as Prisma.ViolationCreateInput,
            update: fields as Prisma.ViolationUpdateInput,
          });
        }
        for (const row of schoolEvents) {
          const { id, ...fields } = row;
          await tx.schoolEvent.upsert({
            where: { id: id as bigint },
            create: row as Prisma.SchoolEventCreateInput,
            update: fields as Prisma.SchoolEventUpdateInput,
          });
        }
        for (const row of activityLogs) {
          const { id, ...fields } = row;
          await tx.activityLog.upsert({
            where: { id: id as bigint },
            create: row as Prisma.ActivityLogCreateInput,
            update: fields as Prisma.ActivityLogUpdateInput,
          });
        }
      }

      const adviserRows = advisers.map((row) => {
        const teacherId = teacherIdMap.get(String(row.teacherId));
        if (!teacherId) {
          throw Object.assign(new Error("An adviser in the backup references a teacher account that could not be matched."), { status: 409 });
        }
        return {
          id: row.id as bigint,
          teacherId,
          gradeLevel: String(row.gradeLevel ?? ""),
          classSection: String(row.classSection ?? ""),
          createdAt: row.createdAt as Date | undefined,
        };
      });
      if (complete) {
        await tx.adviser.createMany({ data: adviserRows as Prisma.AdviserCreateManyInput[] });
        await tx.record.createMany({ data: recordsToRestore as Prisma.RecordCreateManyInput[] });
        await tx.studentLocation.createMany({ data: locations as Prisma.StudentLocationCreateManyInput[] });
        await tx.meeting.createMany({ data: meetings as Prisma.MeetingCreateManyInput[] });
        await tx.smsLog.createMany({ data: smsLogs as Prisma.SmsLogCreateManyInput[] });
      } else {
        for (const row of adviserRows) {
          const { id, ...fields } = row;
          await tx.adviser.upsert({
            where: { id: id as bigint },
            create: row as Prisma.AdviserUncheckedCreateInput,
            update: fields as Prisma.AdviserUpdateInput,
          });
        }
        for (const row of recordsToRestore) {
          const { id, ...fields } = row;
          await tx.record.upsert({
            where: { id: id as bigint },
            create: row as Prisma.RecordUncheckedCreateInput,
            update: fields as Prisma.RecordUpdateInput,
          });
        }
      }
    });

    res.json({
      ok: true,
      complete,
      message: complete
        ? "All backed-up database collections were restored."
        : "Legacy backup data was merged. Rows missing from this older snapshot and collections it did not include were preserved; use a format 2 backup for a full replacement.",
    });
  }),
);

app.get(
  "/api/students",
  requireAuth,
  asyncRoute(async (req, res) => {
    const q = String(req.query.q ?? "").trim();
    const where: Prisma.StudentWhereInput = q
      ? {
          OR: [
            { fname: { contains: q } },
            { lname: { contains: q } },
            { studentId: { contains: q } },
            { email: { contains: q } },
            { section: { contains: q } },
          ],
        }
      : {};
    if (req.user!.role === "teacher" && req.user!.adviserSection) {
      where.grade = req.user!.adviserSection.grade;
      where.section = req.user!.adviserSection.section;
    }
    const rows = await prisma.student.findMany({
      where,
      orderBy: [{ lname: "asc" }, { fname: "asc" }],
    });
    res.json(jsonValue(rows));
  }),
);

const studentFields = [
  "studentId", "fname", "mname", "lname", "email", "grade", "section",
  "academicYear", "gender", "contact", "parentName", "parentContact",
  "address", "image", "track", "strand",
] as const;

app.post(
  "/api/students/bulk",
  requireAuth,
  requireAdmin,
  asyncRoute(async (req, res) => {
    const body = bodyObject(req.body);
    if (!Array.isArray(body.students) || body.students.length > 1000) {
      res.status(400).json({ error: "A list of up to 1,000 students is required." });
      return;
    }
    const students = body.students.map((entry) => {
      const item = bodyObject(entry);
      const fields = cleanFields(item, studentFields);
      if (typeof fields.studentId !== "string" || !fields.studentId.trim()) {
        throw Object.assign(new Error("Every student must have a student ID."), { status: 400 });
      }
      return fields as Prisma.StudentCreateManyInput;
    });
    const savedStudents = await prisma.$transaction(
      students.map((student) =>
        prisma.student.upsert({
          where: { studentId: String(student.studentId) },
          create: student,
          update: student,
        }),
      ),
    );
    res.status(201).json({ upsertedCount: savedStudents.length });
  }),
);

app.post(
  "/api/students",
  requireAuth,
  requireAdmin,
  asyncRoute(async (req, res) => {
    const fields = cleanFields(bodyObject(req.body), studentFields);
    if (typeof fields.studentId !== "string" || !fields.studentId.trim()) {
      res.status(400).json({ error: "Student ID is required." });
      return;
    }
    const student = await prisma.student.create({
      data: fields as Prisma.StudentCreateInput,
    });
    res.status(201).json(jsonValue(student));
  }),
);

app.patch(
  "/api/students/:id",
  requireAuth,
  requireAdmin,
  asyncRoute(async (req, res) => {
    const fields = cleanFields(bodyObject(req.body), studentFields);
    const student = await prisma.student.update({
      where: { id: toId(String(req.params.id)) },
      data: fields as Prisma.StudentUpdateInput,
    });
    res.json(jsonValue(student));
  }),
);

app.delete(
  "/api/students/:id",
  requireAuth,
  requireAdmin,
  asyncRoute(async (req, res) => {
    await prisma.student.delete({ where: { id: toId(String(req.params.id)) } });
    res.json({ ok: true });
  }),
);

app.get(
  "/api/violations",
  requireAuth,
  asyncRoute(async (_req, res) => {
    const rows = await prisma.violation.findMany({ orderBy: { type: "asc" } });
    res.json(jsonValue(rows));
  }),
);

app.post(
  "/api/violations",
  requireAuth,
  requireAdmin,
  asyncRoute(async (req, res) => {
    const body = bodyObject(req.body);
    const row = await prisma.violation.create({
      data: cleanFields(body, ["title", "description", "type", "severity", "defaultSanction"]) as Prisma.ViolationCreateInput,
    });
    res.status(201).json(jsonValue(row));
  }),
);

app.patch(
  "/api/violations/:id",
  requireAuth,
  requireAdmin,
  asyncRoute(async (req, res) => {
    const row = await prisma.violation.update({
      where: { id: toId(String(req.params.id)) },
      data: cleanFields(bodyObject(req.body), ["title", "description", "type", "severity", "defaultSanction"]) as Prisma.ViolationUpdateInput,
    });
    res.json(jsonValue(row));
  }),
);

app.delete(
  "/api/violations/:id",
  requireAuth,
  requireAdmin,
  asyncRoute(async (req, res) => {
    await prisma.violation.delete({ where: { id: toId(String(req.params.id)) } });
    res.json({ ok: true });
  }),
);

const qrSigningSecret = () => {
  const secret = process.env.QR_HMAC_SECRET;
  if (!secret || Buffer.byteLength(secret) < 32) return null;
  return secret;
};

const canAccessStudent = (
  user: NonNullable<express.Request["user"]>,
  student: { grade: string; section: string },
) =>
  user.role !== "teacher" ||
  !user.adviserSection ||
  (student.grade.toLowerCase() === user.adviserSection.grade.toLowerCase() &&
    student.section.toLowerCase() === user.adviserSection.section.toLowerCase());

app.post(
  "/api/qr/issue",
  requireAuth,
  asyncRoute(async (req, res) => {
    const secret = qrSigningSecret();
    if (!secret) {
      res.status(503).json({ error: "QR signing is not configured on the server." });
      return;
    }
    const body = bodyObject(req.body);
    const studentId = String(body.studentId ?? body.student_id ?? "").trim();
    if (!studentId || studentId.includes(":")) {
      res.status(400).json({ error: "A valid student ID is required." });
      return;
    }
    const student = await prisma.student.findUnique({
      where: { studentId },
      select: { studentId: true, grade: true, section: true },
    });
    if (!student) {
      res.status(404).json({ error: "Student not found." });
      return;
    }
    if (!canAccessStudent(req.user!, student)) {
      res.status(403).json({ error: "You cannot issue a QR pass for this student." });
      return;
    }
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = createHmac("sha256", secret)
      .update(`${student.studentId}:${timestamp}`)
      .digest("hex");
    res.json({ payload: `VT3:${student.studentId}:${timestamp}:${signature}` });
  }),
);

app.post(
  "/api/qr/verify",
  requireAuth,
  asyncRoute(async (req, res) => {
    const secret = qrSigningSecret();
    if (!secret) {
      res.status(503).json({ error: "QR verification is not configured on the server." });
      return;
    }
    const payload = String(bodyObject(req.body).payload ?? "").trim();
    if (payload.length > 200) {
      res.status(400).json({ isValid: false, error: "The QR pass format is invalid." });
      return;
    }
    const [version, studentId, timestamp, providedSignature, ...extra] = payload.split(":");
    if (
      version !== "VT3" ||
      !studentId ||
      !/^\d{10,}$/.test(timestamp ?? "") ||
      !/^[a-f\d]{64}$/i.test(providedSignature ?? "") ||
      extra.length > 0
      || Number(timestamp) > Math.floor(Date.now() / 1000) + 300
    ) {
      res.status(400).json({ isValid: false, error: "The QR pass format is invalid." });
      return;
    }
    const expected = createHmac("sha256", secret)
      .update(`${studentId}:${timestamp}`)
      .digest();
    const provided = Buffer.from(providedSignature, "hex");
    if (provided.length !== expected.length || !timingSafeEqual(expected, provided)) {
      res.status(400).json({ isValid: false, error: "The QR pass signature is invalid." });
      return;
    }
    const student = await prisma.student.findUnique({
      where: { studentId },
      select: { studentId: true, grade: true, section: true },
    });
    if (!student || !canAccessStudent(req.user!, student)) {
      res.status(403).json({ isValid: false, error: "This QR pass is not accessible." });
      return;
    }
    res.json({ isValid: true, studentId: student.studentId });
  }),
);

app.get(
  "/api/records",
  requireAuth,
  asyncRoute(async (req, res) => {
    const rows = await prisma.record.findMany({
      include: { student: true, violation: true },
      orderBy: { id: "desc" },
    });
    const scoped =
      req.user!.role === "teacher" && req.user!.adviserSection
        ? rows.filter(
            (row) =>
              row.student.grade.toLowerCase() === req.user!.adviserSection!.grade.toLowerCase() &&
              row.student.section.toLowerCase() === req.user!.adviserSection!.section.toLowerCase(),
          )
        : rows;
    res.json(
      jsonValue(
        scoped.map(({ student, violation, ...row }) => ({
          ...row,
          student,
          violation,
          students: student,
          violations: violation,
        })),
      ),
    );
  }),
);

app.post(
  "/api/records",
  requireAuth,
  asyncRoute(async (req, res) => {
    const body = bodyObject(req.body);
    const studentId = toId(String(body.studentId ?? body.student_id ?? ""));
    const violationIdValue = body.violationId ?? body.violation_id;
    const violationId = violationIdValue ? toId(String(violationIdValue)) : null;
    const student = await prisma.student.findUnique({ where: { id: studentId } });
    if (!student) {
      res.status(400).json({ error: "Selected student does not exist." });
      return;
    }
    if (
      req.user!.role === "teacher" &&
      req.user!.adviserSection &&
      (student.grade.toLowerCase() !== req.user!.adviserSection.grade.toLowerCase() ||
        student.section.toLowerCase() !== req.user!.adviserSection.section.toLowerCase())
    ) {
      res.status(403).json({ error: "You can only report incidents for your assigned section." });
      return;
    }
    const isTeacher = req.user!.role === "teacher";
    const requestedStatus = String(
      body.status ?? (isTeacher ? "Under Approval" : "Pending"),
    );
    const requestedApproval = String(
      body.approvalStatus ??
        body.approval_status ??
        (isTeacher ? "Under Approval" : "Approved"),
    );
    if (!["Pending", "Under Approval", "Resolved"].includes(requestedStatus)) {
      res.status(400).json({ error: "The requested record status is invalid." });
      return;
    }
    if (!["Under Approval", "Approved", "Rejected"].includes(requestedApproval)) {
      res.status(400).json({ error: "The requested approval status is invalid." });
      return;
    }
    const dateReported = body.dateReported ?? body.date_reported;
    const parsedDateReported = dateReported ? new Date(String(dateReported)) : new Date();
    if (Number.isNaN(parsedDateReported.getTime())) {
      res.status(400).json({ error: "The report date is invalid." });
      return;
    }
    const record = await prisma.$transaction(async (tx) => {
      const created = await tx.record.create({
        data: {
          studentId,
          violationId,
          reportedById: req.user!.id,
          reportedByType: req.user!.role,
          reportedByName: req.user!.name,
          dateReported: parsedDateReported,
          status: isTeacher ? "Under Approval" : requestedStatus,
          approvalStatus: isTeacher ? "Under Approval" : requestedApproval,
          approvedBy:
            !isTeacher && requestedApproval === "Approved"
              ? req.user!.name
              : null,
          approvedAt:
            !isTeacher && requestedApproval === "Approved"
              ? new Date()
              : null,
          rejectedBy:
            !isTeacher && requestedApproval === "Rejected"
              ? req.user!.name
              : null,
          rejectedAt:
            !isTeacher && requestedApproval === "Rejected"
              ? new Date()
              : null,
          sanction: String(body.sanction ?? ""),
          remarks: String(body.remarks ?? ""),
          smsNotified: Boolean(body.smsNotified ?? body.sms_notified),
        },
        include: { student: true, violation: true },
      });
      await tx.activityLog.create({
        data: {
          userName: req.user!.name,
          userRole: req.user!.role,
          action: "Add Violation",
          details: `Logged incident "${created.violation?.title ?? "Unknown violation"}" for ${created.student.fname} ${created.student.lname}.`,
          ipAddress: req.ip,
        },
      });
      return created;
    });
    res.status(201).json(
      jsonValue({ ...record, students: record.student, violations: record.violation }),
    );
  }),
);

app.patch(
  "/api/records/:id",
  requireAuth,
  requireAdmin,
  asyncRoute(async (req, res) => {
    const body = bodyObject(req.body);
    const fields = cleanFields(body, [
      "status", "approvalStatus", "approvedBy", "approvedAt", "rejectedBy",
      "rejectedAt", "rejectionReason", "sanction", "remarks", "resolutionNotes",
      "resolutionDate", "smsNotified",
    ]);
    const record = await prisma.record.update({
      where: { id: toId(String(req.params.id)) },
      data: fields as Prisma.RecordUpdateInput,
      include: { student: true, violation: true },
    });
    res.json(
      jsonValue({ ...record, students: record.student, violations: record.violation }),
    );
  }),
);

app.delete(
  "/api/records/:id",
  requireAuth,
  requireAdmin,
  asyncRoute(async (req, res) => {
    await prisma.record.delete({ where: { id: toId(String(req.params.id)) } });
    res.json({ ok: true });
  }),
);

app.get(
  "/api/teachers",
  requireAuth,
  asyncRoute(async (_req, res) => {
    const rows = await prisma.teacher.findMany({
      select: { id: true, fname: true, mname: true, lname: true, email: true, position: true, department: true, specialization: true, contact: true, gender: true, image: true },
      orderBy: { lname: "asc" },
    });
    res.json(jsonValue(rows));
  }),
);

app.post(
  "/api/teachers",
  requireAuth,
  requireAdmin,
  asyncRoute(async (req, res) => {
    const body = bodyObject(req.body);
    const password = typeof body.password === "string" ? body.password : "";
    if (password.length < 8 || Buffer.byteLength(password) > 72) {
      res.status(400).json({ error: "Teacher passwords must be 8 to 72 bytes long." });
      return;
    }
    const teacherFields = cleanFields(body, ["fname", "mname", "lname", "email", "position", "department", "specialization", "contact", "gender", "image"]);
    if (typeof teacherFields.email !== "string" || !teacherFields.email.trim()) {
      res.status(400).json({ error: "Teacher email is required." });
      return;
    }
    teacherFields.email = await assertEmailAvailableAcrossRoles(teacherFields.email, "teacher");
    const row = await prisma.$transaction(async (tx) => {
      const teacher = await tx.teacher.create({
        data: {
          ...teacherFields,
          password: await hashPassword(password),
        } as Prisma.TeacherCreateInput,
      });
      await tx.activityLog.create({
        data: {
          userName: req.user!.name,
          userRole: req.user!.role,
          action: "Add Teacher",
          details: `Registered faculty member ${teacher.fname} ${teacher.lname}.`,
          ipAddress: req.ip,
        },
      });
      return teacher;
    });
    res.status(201).json(jsonValue({ ...row, password: undefined }));
  }),
);

app.patch(
  "/api/teachers/:id",
  requireAuth,
  requireAdmin,
  asyncRoute(async (req, res) => {
    const body = bodyObject(req.body);
    const password = typeof body.password === "string" ? body.password : "";
    const data = cleanFields(body, ["fname", "mname", "lname", "email", "position", "department", "specialization", "contact", "gender", "image"]);
    if (typeof data.email === "string") {
      data.email = await assertEmailAvailableAcrossRoles(data.email, "teacher");
    }
    if (password) {
      if (password.length < 8 || Buffer.byteLength(password) > 72) {
        res.status(400).json({ error: "Teacher passwords must be 8 to 72 bytes long." });
        return;
      }
      data.password = await hashPassword(password);
    }
    const row = await prisma.teacher.update({
      where: { id: toId(String(req.params.id)) },
      data: data as Prisma.TeacherUpdateInput,
    });
    res.json(jsonValue({ ...row, password: undefined }));
  }),
);

app.delete(
  "/api/teachers/:id",
  requireAuth,
  requireAdmin,
  asyncRoute(async (req, res) => {
    await prisma.session.deleteMany({ where: { userId: toId(String(req.params.id)), role: "teacher" } });
    await prisma.teacher.delete({ where: { id: toId(String(req.params.id)) } });
    res.json({ ok: true });
  }),
);

app.get(
  "/api/admins",
  requireAuth,
  requireAdmin,
  asyncRoute(async (_req, res) => {
    const rows = await prisma.admin.findMany({
      select: { id: true, fname: true, mname: true, lname: true, email: true, role: true, position: true, contact: true, image: true },
    });
    res.json(jsonValue(rows));
  }),
);

app.post(
  "/api/admins",
  requireAuth,
  requireAdmin,
  asyncRoute(async (req, res) => {
    const body = bodyObject(req.body);
    const password = typeof body.password === "string" ? body.password : "";
    if (password.length < 8 || Buffer.byteLength(password) > 72) {
      res.status(400).json({ error: "Administrator passwords must be 8 to 72 bytes long." });
      return;
    }
    const adminFields = cleanFields(body, ["fname", "mname", "lname", "email", "role", "position", "contact", "image"]);
    if (typeof adminFields.email !== "string" || !adminFields.email.trim()) {
      res.status(400).json({ error: "Administrator email is required." });
      return;
    }
    adminFields.email = await assertEmailAvailableAcrossRoles(adminFields.email, "admin");
    const row = await prisma.$transaction(async (tx) => {
      const admin = await tx.admin.create({
        data: {
          ...adminFields,
          password: await hashPassword(password),
        } as Prisma.AdminCreateInput,
      });
      await tx.activityLog.create({
        data: {
          userName: req.user!.name,
          userRole: req.user!.role,
          action: "Add Admin",
          details: `Created administrator account for ${admin.fname} ${admin.lname} (${admin.role}).`,
          ipAddress: req.ip,
        },
      });
      return admin;
    });
    res.status(201).json(jsonValue({ ...row, password: undefined }));
  }),
);

app.patch(
  "/api/admins/:id",
  requireAuth,
  requireAdmin,
  asyncRoute(async (req, res) => {
    const body = bodyObject(req.body);
    const targetId = String(req.params.id);
    const data = cleanFields(body, ["fname", "mname", "lname", "email", "role", "position", "contact", "image"]);
    if (typeof data.email === "string") {
      data.email = await assertEmailAvailableAcrossRoles(data.email, "admin");
    }
    if (typeof body.password === "string" && body.password.length > 0) {
      if (body.password.length < 8 || Buffer.byteLength(body.password) > 72) {
        res.status(400).json({ error: "Administrator passwords must be 8 to 72 bytes long." });
        return;
      }
      data.password = await hashPassword(body.password);
    }
    const row = /^\d+$/.test(targetId)
      ? await prisma.admin.update({ where: { id: toId(targetId) }, data: data as Prisma.AdminUpdateInput })
      : await prisma.admin.update({ where: { email: targetId }, data: data as Prisma.AdminUpdateInput });
    res.json(jsonValue({ ...row, password: undefined }));
  }),
);

app.delete(
  "/api/admins/:id",
  requireAuth,
  requireAdmin,
  asyncRoute(async (req, res) => {
    const targetId = String(req.params.id);
    if (/^\d+$/.test(targetId)) {
      const adminId = toId(targetId);
      await prisma.session.deleteMany({ where: { userId: adminId, role: "admin" } });
      await prisma.admin.delete({ where: { id: adminId } });
    } else {
      const admin = await prisma.admin.findUnique({ where: { email: targetId } });
      if (!admin) {
        res.status(404).json({ error: "The administrator was not found." });
        return;
      }
      await prisma.session.deleteMany({ where: { userId: admin.id, role: "admin" } });
      await prisma.admin.delete({ where: { email: targetId } });
    }
    res.json({ ok: true });
  }),
);

app.get(
  "/api/advisers",
  requireAuth,
  asyncRoute(async (_req, res) => {
    const rows = await prisma.adviser.findMany({
      include: {
        teacher: {
          select: {
            id: true,
            fname: true,
            lname: true,
            email: true,
            image: true,
            department: true,
            position: true,
          },
        },
      },
      orderBy: [{ gradeLevel: "asc" }, { classSection: "asc" }],
    });
    res.json(jsonValue(rows));
  }),
);

app.post(
  "/api/advisers",
  requireAuth,
  requireAdmin,
  asyncRoute(async (req, res) => {
    const body = bodyObject(req.body);
    const row = await prisma.adviser.create({
      data: {
        teacherId: toId(String(body.teacherId ?? body.teacher_id ?? "")),
        gradeLevel: String(body.gradeLevel ?? body.grade_level ?? ""),
        classSection: String(body.classSection ?? body.class_section ?? ""),
      },
      include: { teacher: true },
    });
    res.status(201).json(jsonValue(row));
  }),
);

app.post(
  "/api/advisers/assign",
  requireAuth,
  requireAdmin,
  asyncRoute(async (req, res) => {
    const body = bodyObject(req.body);
    const teacherId = toId(String(body.teacherId ?? body.teacher_id ?? ""));
    const gradeLevel = String(body.gradeLevel ?? body.grade_level ?? "").trim();
    const classSection = String(body.classSection ?? body.class_section ?? "").trim();
    if (!gradeLevel || !classSection) {
      res.status(400).json({ error: "Grade level and section are required." });
      return;
    }
    const [row] = await prisma.$transaction(async (tx) => {
      await tx.adviser.deleteMany({
        where: {
          OR: [
            { teacherId },
            { gradeLevel, classSection },
          ],
        },
      });
      return [
        await tx.adviser.create({
          data: { teacherId, gradeLevel, classSection },
          include: { teacher: true },
        }),
      ];
    });
    res.status(201).json(jsonValue(row));
  }),
);

app.delete(
  "/api/advisers/:id",
  requireAuth,
  requireAdmin,
  asyncRoute(async (req, res) => {
    await prisma.adviser.delete({ where: { id: toId(String(req.params.id)) } });
    res.json({ ok: true });
  }),
);

app.get(
  "/api/student-locations",
  requireAuth,
  asyncRoute(async (req, res) => {
    const studentId = String(req.query.studentId ?? "");
    const take = Math.min(100, Math.max(1, Number(req.query.limit ?? 15)));
    if (!studentId) {
      res.status(400).json({ error: "A student ID is required." });
      return;
    }
    const rows = await prisma.studentLocation.findMany({
      where: studentId ? { studentId: toId(studentId) } : undefined,
      orderBy: { recordedAt: "desc" },
      take,
    });
    if (req.user!.role === "teacher" && req.user!.adviserSection) {
      const student = await prisma.student.findUnique({
        where: { id: toId(studentId) },
        select: { grade: true, section: true },
      });
      if (
        !student ||
        student.grade.toLowerCase() !== req.user!.adviserSection.grade.toLowerCase() ||
        student.section.toLowerCase() !== req.user!.adviserSection.section.toLowerCase()
      ) {
        res.status(403).json({ error: "You cannot view this student's location." });
        return;
      }
    }
    res.json(jsonValue(rows));
  }),
);

app.post(
  "/api/student-locations",
  requireAuth,
  asyncRoute(async (req, res) => {
    const body = bodyObject(req.body);
    const latitude = Number(body.latitude);
    const longitude = Number(body.longitude);
    const studentId = toId(String(body.studentId ?? body.student_id ?? ""));
    if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90 ||
        !Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
      res.status(400).json({ error: "Location coordinates are invalid." });
      return;
    }
    if (req.user!.role === "teacher" && req.user!.adviserSection) {
      const student = await prisma.student.findUnique({
        where: { id: studentId },
        select: { grade: true, section: true },
      });
      if (
        !student ||
        student.grade.toLowerCase() !== req.user!.adviserSection.grade.toLowerCase() ||
        student.section.toLowerCase() !== req.user!.adviserSection.section.toLowerCase()
      ) {
        res.status(403).json({ error: "You cannot record this student's location." });
        return;
      }
    }
    const row = await prisma.studentLocation.create({
      data: {
        studentId,
        latitude,
        longitude,
        accuracyMeters: Math.max(0, Number(body.accuracyMeters ?? body.accuracy_meters ?? 10)),
        trackingStatus: String(body.trackingStatus ?? body.tracking_status ?? "Active"),
        reportedBy: req.user!.name,
      },
    });
    res.status(201).json(jsonValue(row));
  }),
);

app.get(
  "/api/activity-logs",
  requireAuth,
  requireAdmin,
  asyncRoute(async (req, res) => {
    const requestedLimit = Number.parseInt(String(req.query.limit ?? "100"), 10);
    const requestedOffset = Number.parseInt(String(req.query.offset ?? "0"), 10);
    const take = Number.isFinite(requestedLimit) ? Math.min(Math.max(requestedLimit, 1), 500) : 100;
    const skip = Number.isFinite(requestedOffset) ? Math.max(requestedOffset, 0) : 0;
    const rows = await prisma.activityLog.findMany({
      orderBy: { id: "desc" },
      take,
      skip,
    });
    res.json(jsonValue(rows));
  }),
);

app.post(
  "/api/activity-logs",
  requireAuth,
  asyncRoute(async (req, res) => {
    const body = bodyObject(req.body);
    const row = await prisma.activityLog.create({
      data: {
        userName: req.user!.name,
        userRole: req.user!.role,
        action: String(body.action ?? ""),
        details: typeof body.details === "string" ? body.details : null,
        ipAddress: req.ip,
      },
    });
    res.status(201).json(jsonValue(row));
  }),
);

app.get(
  "/api/school-events",
  requireAuth,
  asyncRoute(async (_req, res) => {
    const rows = await prisma.schoolEvent.findMany({ orderBy: { date: "asc" } });
    res.json(jsonValue(rows));
  }),
);

app.post(
  "/api/school-events",
  requireAuth,
  requireAdmin,
  asyncRoute(async (req, res) => {
    const body = bodyObject(req.body);
    const row = await prisma.schoolEvent.create({
      data: cleanFields(body, ["title", "description", "date", "time", "location", "category", "categoryLabel", "color", "attendees"]) as Prisma.SchoolEventCreateInput,
    });
    res.status(201).json(jsonValue(row));
  }),
);

app.post(
  "/api/sms",
  requireAuth,
  requireAdmin,
  asyncRoute(async (req, res) => {
    const token = process.env.IPROGSMS_API_TOKEN;
    if (!token) {
      res.status(503).json({ error: "SMS gateway is not configured on the server." });
      return;
    }
    const body = bodyObject(req.body);
    const recipientNumber = String(body.recipientNumber ?? "").replace(/[^\d+]/g, "");
    if (!/^\+?\d{7,15}$/.test(recipientNumber)) {
      res.status(400).json({ error: "A valid recipient phone number is required." });
      return;
    }
    const recipientName = String(body.recipientName ?? "Guardian").slice(0, 120);
    const studentName = String(body.studentName ?? "").slice(0, 160);
    const violationTitle = String(body.violationTitle ?? "").slice(0, 300);
    const message = String(
      body.customMessage ||
        `PHCM VioTrack: Hi ${recipientName}, this is to inform you that ${studentName} has received a record for: ${violationTitle}. Please contact the school guidance office for details.`,
    ).slice(0, 1000);
    const endpoint = process.env.IPROGSMS_ENDPOINT || "https://sms.iprogtech.com/api/v1/sms_messages";
    const endpointUrl = new URL(endpoint);
    if (endpointUrl.protocol !== "https:") {
      res.status(500).json({ error: "The SMS gateway endpoint must use HTTPS." });
      return;
    }
    const payload = new URLSearchParams({
      api_token: token,
      phone_number: recipientNumber,
      message,
      sender_id: process.env.IPROGSMS_SENDER_NAME || "PHCM VioTrack",
    });
    const response = await fetch(endpointUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: payload,
      signal: AbortSignal.timeout(10000),
    });
    const gatewayResponse = await response.json().catch(() => null);
    if (
      !response.ok ||
      gatewayResponse?.status === "error" ||
      gatewayResponse?.success === false
    ) {
      res.status(502).json({
        error: gatewayResponse?.message || `SMS gateway returned HTTP ${response.status}.`,
      });
      return;
    }
    res.json({
      success: true,
      isLive: true,
      provider: "iProgTech SMS Gateway",
      recipient: recipientNumber,
      message,
      response: gatewayResponse,
    });
  }),
);

app.delete(
  "/api/school-events/:id",
  requireAuth,
  requireAdmin,
  asyncRoute(async (req, res) => {
    await prisma.schoolEvent.delete({ where: { id: toId(String(req.params.id)) } });
    res.json({ ok: true });
  }),
);

app.get("/api/public/students/:studentId", asyncRoute(async (req, res) => {
  const student = await prisma.student.findUnique({
    where: { studentId: String(req.params.studentId) },
    select: { studentId: true, fname: true, lname: true, grade: true, section: true, image: true },
  });
  if (!student) {
    res.status(404).json({ error: "Student record was not found." });
    return;
  }
  res.json(student);
}));

app.use("/api", (_req, res) => res.status(404).json({ error: "API route not found." }));
app.use(express.static(resolve(process.cwd(), "dist")));
app.get(/.*/, (req, res, next) => {
  if (req.path.startsWith("/api/")) {
    res.status(404).json({ error: "API route not found." });
    return;
  }
  res.sendFile(resolve(process.cwd(), "dist", "index.html"), (error) => {
    if (error) next(error);
  });
});

const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (res.headersSent) return;
  const knownStatus =
    typeof error?.status === "number" ? error.status : undefined;
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      res.status(409).json({ error: "A record with that unique value already exists." });
      return;
    }
    if (error.code === "P2025") {
      res.status(404).json({ error: "The requested record was not found." });
      return;
    }
    if (error.code === "P2003") {
      res.status(409).json({ error: "This record is referenced by other data and cannot be removed." });
      return;
    }
  }
  if (knownStatus) {
    res.status(knownStatus).json({ error: error.message });
    return;
  }
  console.error("API request failed:", error);
  res.status(500).json({ error: "The server could not complete the request." });
};
app.use(errorHandler);

// Vercel invokes the exported Express app as a serverless function. Local and
// self-hosted deployments continue to use the long-running HTTP listener.
if (!process.env.VERCEL) {
  const server = app.listen(port, () => {
    console.log(`VioTrack API listening on port ${port}`);
  });

  const shutdown = async () => {
    server.close(async () => {
      await prisma.$disconnect();
      process.exit(0);
    });
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

export default app;
