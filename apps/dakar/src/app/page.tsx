import { HeroSectionWithHeader } from '@/components/hero/HeroSectionWithHeader';
import { HowToMove } from '@/components/move/HowtoMove';
import { PlacesToStay } from '@/components/places/PlacesSection';
import { AllSpots } from '@/components/spots/AllSpots';

export default function Home() {
  return (
    <div>
      <main className="flex flex-col text-lg">
        <HeroSectionWithHeader />
        <PlacesToStay />
        <AllSpots />
        <HowToMove />
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://www.robusta.build"
          target="_blank"
        >
          Edited by Robusta Build
        </a>
      </footer>
    </div>
  );
}
