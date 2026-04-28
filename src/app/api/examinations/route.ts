import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET /api/examinations
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const schoolId = (session.user as any).schoolId;

    const examinations = await prisma.examination.findMany({
      where: { schoolId },
      include: {
        class: { select: { name: true, section: true } },
        examDetails: {
          include: {
            subject: { select: { name: true } },
            _count: { select: { results: true } },
          },
        },
      },
      orderBy: { startDate: "desc" },
    });

    return NextResponse.json(examinations);
  } catch (error) {
    console.error("Error fetching examinations:", error);
    return NextResponse.json({ error: "Failed to fetch examinations" }, { status: 500 });
  }
}

// POST /api/examinations
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const schoolId = (session.user as any).schoolId;
    const body = await req.json();

    const examination = await prisma.examination.create({
      data: {
        name: body.name,
        classId: body.classId,
        schoolId,
        startDate: new Date(body.startDate),
        endDate: new Date(body.endDate),
        description: body.description || null,
        examDetails: body.examDetails?.length
          ? {
              create: body.examDetails.map((d: any) => ({
                subjectId: d.subjectId,
                examDate: new Date(d.examDate),
                maxMarks: parseFloat(d.maxMarks),
                passingMarks: parseFloat(d.passingMarks),
              })),
            }
          : undefined,
      },
      include: {
        class: { select: { name: true, section: true } },
        examDetails: {
          include: { subject: { select: { name: true } } },
        },
      },
    });

    return NextResponse.json(examination, { status: 201 });
  } catch (error) {
    console.error("Error creating examination:", error);
    return NextResponse.json({ error: "Failed to create examination" }, { status: 500 });
  }
}
