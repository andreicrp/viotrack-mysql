import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const seed = async () => {
  const email = process.env.INITIAL_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.INITIAL_ADMIN_PASSWORD;
  if (!email || !password || password.length < 12 || Buffer.byteLength(password) > 72) {
    throw new Error(
      "Set INITIAL_ADMIN_EMAIL and INITIAL_ADMIN_PASSWORD (12-72 characters) before seeding.",
    );
  }

  const existingAdmin = await prisma.admin.findUnique({ where: { email } });
  if (!existingAdmin) {
    const existingTeacher = await prisma.teacher.findUnique({ where: { email } });
    if (existingTeacher) {
      throw new Error("INITIAL_ADMIN_EMAIL is already assigned to a teacher account.");
    }
    await prisma.admin.create({
      data: {
        fname: process.env.INITIAL_ADMIN_FNAME?.trim() || "System",
        lname: process.env.INITIAL_ADMIN_LNAME?.trim() || "Administrator",
        email,
        role: "admin",
        position: "Head Admin",
        password: await bcrypt.hash(password, 12),
      },
    });
    console.log(`Created initial administrator: ${email}`);
  }

  if ((await prisma.violation.count()) === 0) {
    await prisma.violation.createMany({
      data: [
        {
          title: "Improper Uniform / Haircut",
          description: "Failure to follow the school uniform or grooming policy.",
          type: "Minor",
          severity: "Minor",
          defaultSanction: "Verbal warning",
        },
        {
          title: "Tardiness / Class Cutting",
          description: "Unexcused late arrival or absence from class.",
          type: "Minor",
          severity: "Minor",
          defaultSanction: "School community service",
        },
        {
          title: "Use of Mobile Device During Class",
          description: "Unauthorized device use during instruction.",
          type: "Minor",
          severity: "Minor",
          defaultSanction: "Device confiscation until dismissal",
        },
        {
          title: "Bullying / Harassment",
          description: "Physical, verbal, or cyber intimidation.",
          type: "Major",
          severity: "Major",
          defaultSanction: "Parent conference",
        },
        {
          title: "Vandalism / Property Damage",
          description: "Defacing or damaging school property.",
          type: "Major",
          severity: "Major",
          defaultSanction: "Restitution and parent conference",
        },
      ],
    });
  }
};

seed()
  .catch((error: unknown) => {
    console.error("Database seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
