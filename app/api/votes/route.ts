import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const votes = await prisma.vote.groupBy({
      by: ["projectId"],
      _count: { projectId: true },
    });
    return NextResponse.json(votes);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch votes" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { voterName, voterTeam, isParticipant, projectId } =
      await request.json();

    if (!voterName || !projectId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const votingState = await prisma.votingState.findUnique({ where: { id: 1 } });
    if (!votingState || votingState.status !== "active") {
      return NextResponse.json({ error: "Voting is not active" }, { status: 400 });
    }

    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (isParticipant && voterTeam && project.teamNumber === Number(voterTeam)) {
      return NextResponse.json(
        { error: "자신이 속한 조의 서비스는 투표할 수 없습니다." },
        { status: 400 }
      );
    }

    // Check for duplicate vote
    const existingVote = await prisma.vote.findFirst({
      where: {
        voterName,
        voterTeam: isParticipant && voterTeam ? Number(voterTeam) : null,
      },
    });

    if (existingVote) {
      return NextResponse.json({ error: "이미 투표하셨습니다." }, { status: 400 });
    }

    const vote = await prisma.vote.create({
      data: {
        voterName,
        voterTeam: isParticipant && voterTeam ? Number(voterTeam) : null,
        isParticipant: Boolean(isParticipant),
        projectId,
      },
    });

    return NextResponse.json(vote, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to cast vote" }, { status: 500 });
  }
}
