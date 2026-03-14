import { Suspense } from "react";

import { JoinPage } from "@/components/join-page";

export default function JoinRoutePage() {
  return (
    <Suspense fallback={null}>
      <JoinPage />
    </Suspense>
  );
}
