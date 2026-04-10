"use client";

import { useEffect, useRef } from "react";
import { Project } from "./ProjectCard";

interface WinnerOverlayProps {
  winner: Project;
  totalVotes: number;
  onClose: () => void;
}

export default function WinnerOverlay({ winner, totalVotes, onClose }: WinnerOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let confetti: ((options: Record<string, unknown>) => void) | undefined;
    let animId: number;
    let stopped = false;

    import("canvas-confetti").then((mod) => {
      if (stopped) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      confetti = mod.create(canvas, { resize: true });

      function fire() {
        if (stopped || !confetti) return;
        confetti({
          particleCount: 80,
          spread: 100,
          origin: { y: 0.4 },
          colors: ["#6366f1", "#8b5cf6", "#f59e0b", "#10b981", "#ef4444"],
        });
        animId = window.setTimeout(fire, 2000);
      }
      fire();
    });

    return () => {
      stopped = true;
      clearTimeout(animId);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-4">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />
      <div className="relative text-center text-white max-w-2xl w-full">
        <div className="text-6xl md:text-8xl mb-4">🏆</div>
        <p className="text-lg md:text-2xl text-yellow-300 font-semibold mb-2 tracking-widest uppercase">
          Winner
        </p>
        <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 mb-6 border border-white/20">
          <span className="inline-block bg-yellow-400 text-yellow-900 text-lg font-bold px-4 py-1 rounded-full mb-4">
            {winner.teamNumber}조
          </span>
          <h1 className="text-3xl md:text-5xl font-black mb-4 leading-tight">
            {winner.title}
          </h1>
          <div className="flex items-center justify-center gap-2">
            <span className="text-3xl md:text-4xl font-bold text-yellow-300">
              {winner._count.votes}표
            </span>
            <span className="text-lg text-white/70">
              / 총 {totalVotes}표
            </span>
          </div>
        </div>
        <p className="text-white/60 text-sm mb-6">
          득표율: {totalVotes > 0 ? Math.round((winner._count.votes / totalVotes) * 100) : 0}%
        </p>
        <button
          onClick={onClose}
          className="px-8 py-3 bg-white/20 hover:bg-white/30 border border-white/30 text-white rounded-full font-medium transition-colors"
        >
          닫기
        </button>
      </div>
    </div>
  );
}
