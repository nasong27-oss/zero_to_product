import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const ADMIN_PASSWORD = "0417";

export async function POST(request: Request) {
  try {
    const { adminPassword } = await request.json();

    if (adminPassword !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Invalid admin password" }, { status: 401 });
    }

    await prisma.vote.deleteMany({});
    await prisma.votingState.upsert({
      where: { id: 1 },
      update: { status: "not_started" },
      create: { id: 1, status: "not_started" },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to reset votes" }, { status: 500 });
  }
}
