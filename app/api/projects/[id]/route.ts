import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/passwords";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { teamNumber, title, url, description, password, newPassword } =
      await request.json();

    const project = await prisma.project.findUnique({ where: { id: params.id } });
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const valid = await verifyPassword(password, project.password);
    if (!valid) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    const updated = await prisma.project.update({
      where: { id: params.id },
      data: {
        teamNumber: Number(teamNumber),
        title,
        url,
        description,
        ...(newPassword ? { password: await hashPassword(newPassword) } : {}),
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
    return NextResponse.json(updated);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update project" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { password } = await request.json();

    const project = await prisma.project.findUnique({ where: { id: params.id } });
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const valid = await verifyPassword(password, project.password);
    if (!valid) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    await prisma.project.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to delete project" }, { status: 500 });
  }
}
