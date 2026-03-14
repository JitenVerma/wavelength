import { GamePageClient } from "@/components/game-page-client";

interface GameRoutePageProps {
  params: Promise<{ code: string }>;
}

export default async function GameRoutePage({ params }: GameRoutePageProps) {
  const { code } = await params;

  return <GamePageClient roomCode={code.toUpperCase()} />;
}
