import { RoomPageClient } from "@/components/room-page-client";

interface RoomRoutePageProps {
  params: Promise<{ code: string }>;
}

export default async function RoomRoutePage({ params }: RoomRoutePageProps) {
  const { code } = await params;

  return <RoomPageClient roomCode={code.toUpperCase()} />;
}
