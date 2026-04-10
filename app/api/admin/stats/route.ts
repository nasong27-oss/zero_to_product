import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const ADMIN_PASSWORD = "0417";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const adminPassword = searchParams.get("adminPassword");

    if (adminPassword !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Invalid admin password" }, { status: 401 });
    }

    const [projects, votes, votingState] = await Promise.all([
      prisma.project.findMany({
        orderBy: { teamNumber: "asc" },
        select: {
          id: true,
          teamNumber: true,
          title: true,
          votes: {
            select: {
              id: true,
              voterName: true,
              voterTeam: true,
              isParticipant: true,
              createdAt: true,
            },
          },
        },
      }),
      prisma.vote.findMany({
        select: {
          id: true,
          voterName: true,
          voterTeam: true,
          isParticipant: true,
          projectId: true,
          createdAt: true,
        },
        orderBy: { createdAt: "asc" },
      }),
      prisma.votingState.findUnique({ where: { id: 1 } }),
    ]);

    // Build participant status grouped by team
    const teams: Record<number, { voters: typeof votes }> = {};
    for (let i = 1; i <= 8; i++) {
      teams[i] = { voters: [] };
    }

    for (const vote of votes) {
      if (vote.isParticipant && vote.voterTeam) {
        teams[vote.voterTeam].voters.push(vote);
      }
    }

    return NextResponse.json({
      projects: projects.map((p) => ({
        ...p,
        voteCount: p.votes.length,
      })),
      totalVotes: votes.length,
      votingState,
      teams,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
