import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const ADMIN_PASSWORD = "0417";

export async function GET() {
  try {
    const state = await prisma.votingState.upsert({
      where: { id: 1 },
      update: {},
      create: { id: 1, status: "not_started" },
    });
    return NextResponse.json(state);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch voting state" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { status, adminPassword } = await request.json();

    if (adminPassword !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Invalid admin password" }, { status: 401 });
    }

    const validStatuses = ["not_started", "active", "ended"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const state = await prisma.votingState.upsert({
      where: { id: 1 },
      update: { status },
      create: { id: 1, status },
    });
    return NextResponse.json(state);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update voting state" }, { status: 500 });
  }
}
