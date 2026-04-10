import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/passwords";

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      orderBy: { teamNumber: "asc" },
      select: {
        id: true,
        teamNumber: true,
        title: true,
        url: true,
        description: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { votes: true } },
      },
    });
    return NextResponse.json(projects);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { teamNumber, title, url, description, password } = await request.json();

    if (!teamNumber || !title || !url || !description || !password) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const hashedPassword = await hashPassword(password);
    const project = await prisma.project.create({
      data: {
        teamNumber: Number(teamNumber),
        title,
        url,
        description,
        password: hashedPassword,
      },
      select: {
        id: true,
        teamNumber: true,
        title: true,
        url: true,
        description: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { votes: true } },
      },
    });
    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
  }
}
