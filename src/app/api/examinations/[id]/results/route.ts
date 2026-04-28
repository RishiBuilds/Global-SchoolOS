import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET /api/examinations/[id]/results
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const examination = await prisma.examination.findUnique({
      where: { id },
      include: {
        class: {
          select: {
            name: true,
            section: true,
            students: {
              where: { isActive: true },
              select: { id: true, firstName: true, lastName: true, admissionNo: true },
              orderBy: [{ firstName: "asc" }],
            },
          },
        },
        examDetails: {
          include: {
            subject: { select: { id: true, name: true } },
            results: {
              include: {
                student: { select: { id: true, firstName: true, lastName: true } },
              },
            },
          },
        },
      },
    });

    if (!examination) {
      return NextResponse.json({ error: "Examination not found" }, { status: 404 });
    }

    return NextResponse.json(examination);
  } catch (error) {
    console.error("Error fetching exam results:", error);
    return NextResponse.json({ error: "Failed to fetch exam results" }, { status: 500 });
  }
}

// POST /api/examinations/[id]/results — bulk enter results
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await params; // consume params
    const body = await req.json();
    const { examDetailId, results } = body;

    if (!examDetailId || !results?.length) {
      return NextResponse.json({ error: "examDetailId and results are required" }, { status: 400 });
    }

    // Get the exam detail to auto-calculate grade
    const examDetail = await prisma.examDetail.findUnique({
      where: { id: examDetailId },
      include: {
        examination: { select: { schoolId: true } },
      },
    });

    if (!examDetail) {
      return NextResponse.json({ error: "Exam detail not found" }, { status: 404 });
    }

    // Fetch grade scales for this school
    const gradeScales = await prisma.gradeScale.findMany({
      where: { schoolId: examDetail.examination.schoolId },
      orderBy: { minMarks: "desc" },
    });

    const getGrade = (marks: number): string | null => {
      const pct = (marks / examDetail.maxMarks) * 100;
      const scale = gradeScales.find((g) => pct >= g.minMarks && pct <= g.maxMarks);
      return scale?.name || null;
    };

    const upserted = await Promise.all(
      results.map(async (r: any) => {
        const grade = getGrade(parseFloat(r.marksObtained));
        return prisma.examResult.upsert({
          where: {
            examDetailId_studentId: {
              examDetailId,
              studentId: r.studentId,
            },
          },
          update: {
            marksObtained: parseFloat(r.marksObtained),
            grade,
            remarks: r.remarks || null,
          },
          create: {
            examDetailId,
            studentId: r.studentId,
            marksObtained: parseFloat(r.marksObtained),
            grade,
            remarks: r.remarks || null,
          },
        });
      })
    );

    return NextResponse.json({ success: true, count: upserted.length }, { status: 201 });
  } catch (error) {
    console.error("Error saving results:", error);
    return NextResponse.json({ error: "Failed to save results" }, { status: 500 });
  }
}
