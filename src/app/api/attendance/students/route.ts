import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET /api/attendance/students — fetch attendance for a class + date
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const classId = searchParams.get("classId");
    const date = searchParams.get("date");
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    if (!classId) {
      return NextResponse.json({ error: "classId is required" }, { status: 400 });
    }

    const where: any = { classId };

    if (date) {
      // Single day
      const d = new Date(date);
      const next = new Date(d);
      next.setDate(next.getDate() + 1);
      where.date = { gte: d, lt: next };
    } else if (from && to) {
      where.date = { gte: new Date(from), lte: new Date(to) };
    }

    const records = await prisma.studentAttendance.findMany({
      where,
      include: {
        student: { select: { id: true, firstName: true, lastName: true, admissionNo: true } },
      },
      orderBy: [{ date: "desc" }, { student: { firstName: "asc" } }],
    });

    return NextResponse.json(records);
  } catch (error) {
    console.error("Error fetching attendance:", error);
    return NextResponse.json({ error: "Failed to fetch attendance" }, { status: 500 });
  }
}

// POST /api/attendance/students — bulk mark attendance
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { classId, date, entries } = body;

    if (!classId || !date || !entries?.length) {
      return NextResponse.json({ error: "classId, date, and entries are required" }, { status: 400 });
    }

    const attendanceDate = new Date(date);

    // Upsert each attendance record
    const results = await Promise.all(
      entries.map(async (entry: any) => {
        return prisma.studentAttendance.upsert({
          where: {
            studentId_date: {
              studentId: entry.studentId,
              date: attendanceDate,
            },
          },
          update: {
            status: entry.status,
            remarks: entry.remarks || null,
          },
          create: {
            studentId: entry.studentId,
            classId,
            date: attendanceDate,
            status: entry.status,
            remarks: entry.remarks || null,
          },
        });
      })
    );

    return NextResponse.json({ success: true, count: results.length }, { status: 201 });
  } catch (error) {
    console.error("Error saving attendance:", error);
    return NextResponse.json({ error: "Failed to save attendance" }, { status: 500 });
  }
}
