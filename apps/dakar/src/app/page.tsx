import {HeroSection} from "./components/hero/HeroSection";
import {PlacesToStay} from "./components/places/PlacesSection";

export default function Home() {
  return (
    <div >
      <main className="flex">

        <HeroSection/>

          <PlacesToStay/>
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
