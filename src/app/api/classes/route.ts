import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET /api/classes - list all classes for the school
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const schoolId = (session.user as any).schoolId;

    const classes = await prisma.class.findMany({
      where: { schoolId },
      include: {
        academicYear: { select: { name: true } },
        _count: { select: { students: true } },
      },
      orderBy: [{ name: "asc" }, { section: "asc" }],
    });

    return NextResponse.json(classes);
  } catch (error) {
    console.error("Error fetching classes:", error);
    return NextResponse.json(
      { error: "Failed to fetch classes" },
      { status: 500 }
    );
  }
}

// POST /api/classes - create a new class
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const schoolId = (session.user as any).schoolId;
    const body = await req.json();

    const newClass = await prisma.class.create({
      data: {
        name: body.name,
        section: body.section || null,
        capacity: body.capacity ? parseInt(body.capacity) : null,
        academicYearId: body.academicYearId,
        schoolId,
      },
      include: {
        academicYear: { select: { name: true } },
      },
    });

    return NextResponse.json(newClass, { status: 201 });
  } catch (error: any) {
    if (error?.code === "P2002") {
      return NextResponse.json(
        { error: "A class with this name and section already exists for this academic year" },
        { status: 409 }
      );
    }
    console.error("Error creating class:", error);
    return NextResponse.json(
      { error: "Failed to create class" },
      { status: 500 }
    );
  }
}
