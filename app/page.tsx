import NewSeason from '../components/NewSeason';
import Season31Champs from '../components/Season31Champs';
import News from '../components/News';
import NextMatch from '@/components/NextMatch';
import AllstarsHighlights from '@/components/AllstarsHighlights';

export default function Page() {
  return (
    <main className="min-h-screen bg-background overflow-hidden relative">

      {/* Hero Sektion */}
      <section className="relative z-10 flex min-h-[80vh] items-center px-4 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl w-full items-start gap-12 pb-12 pt-10 md:pt-8 lg:grid-cols-12 lg:gap-8">
          
          {/* Venstre side: Tekst og titler - Nu markant større og uden sidestreg */}
          <div className="flex flex-col justify-center lg:col-span-7">
            <div className="inline-block self-start mb-2">
              <NewSeason />
            </div>

            {/* Kæmpe, slagkraftig H1 overskrift */}
            <h1 className="font-black uppercase tracking-tighter text-white text-6xl sm:text-7xl md:text-8xl lg:text-[6.5rem] xl:text-[7.5rem] leading-[0.85] mb-6">
              <span className="text-orange-brand drop-shadow-[0_0_30px_rgba(var(--brand-orange-rgb),0.15)]">POWER</span>
              <br />
              LIGAEN
            </h1>

            {/* Underoverskrifter uden nogen sidestreg eller kasser */}
            <div className="space-y-2 mt-4">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black uppercase tracking-tight text-white leading-tight">
                Danmarks <span className="text-orange-brand font-black">største</span> CS2 Liga
              </h2>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black uppercase tracking-tight text-white leading-tight">
                <span className="text-orange-brand drop-shadow-[0_0_15px_rgba(var(--brand-orange-rgb),0.25)] font-black">160.000 KR</span> PÅ HØJKANT
              </h2>
            </div>
          </div>

          {/* Højre side: NextMatch kortet */}
          <div className="w-full flex justify-center lg:justify-end lg:col-span-5">
            <div className="w-full max-w-md lg:max-w-full transition-all duration-500 hover:scale-[1.015]">
              <NextMatch />
            </div>
          </div>

        </div>
      </section>

      {/* MVP/Season highlight - Helt rent, gennemsigtigt og uden baggrundsfarve eller rundede kanter */}
      <section className="relative z-10 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Season31Champs />
        </div>
      </section>

      {/* Allstars Highlights */}
      <section className="relative z-10 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <AllstarsHighlights />
        </div>
      </section>

      {/* Nyheds-slider - Ligeledes rent opsat */}
      <section className="relative z-10 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <p className="text-[10px] font-black uppercase tracking-widest text-orange-brand mb-1">
              NYHEDER
            </p>
            <h2 className="text-3xl font-black uppercase tracking-tight text-white sm:text-4xl">
              Seneste artikler
            </h2>
            <div className="mt-2 h-0.5 w-16 rounded-full bg-orange-brand" />
          </div>
          <News />
        </div>
      </section>
    </main>
  );
}