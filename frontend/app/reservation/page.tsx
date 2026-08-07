import { Suspense } from "react";

import ReservationHero from "@/components/reservation/ReservationHero";
import ReservationSteps from "@/components/reservation/ReservationSteps";

export default function ReservationPage() {
  return (
    <>
      <ReservationHero />

      <Suspense fallback={<div>Loading reservation...</div>}>
        <ReservationSteps />
      </Suspense>
    </>
  );
}