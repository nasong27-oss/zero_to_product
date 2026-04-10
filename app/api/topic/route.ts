import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const topic = await prisma.topic.upsert({
      where: { id: 1 },
      update: {},
      create: { id: 1, content: "" },
    });
    return NextResponse.json(topic);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch topic" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { content } = await request.json();
    const topic = await prisma.topic.upsert({
      where: { id: 1 },
      update: { content },
      create: { id: 1, content },
    });
    return NextResponse.json(topic);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update topic" }, { status: 500 });
  }
}
