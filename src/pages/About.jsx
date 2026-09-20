export default function About() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-20">
      <section className="grid gap-12 lg:grid-cols-[0.95fr_1.05fr] items-center">
        <div className="rounded-xl border border-mist bg-white/90 p-10">
          <p className="font-mono text-[20px] text-ink/50 mb-4">About TidyNow</p>
          <h1 className="font-display text-5xl text-ink mb-6 leading-tight">
            Premium home care rooted in Port Harcourt tradition.
          </h1>
          <p className="text-ink/70 text-lg leading-relaxed mb-8">
            TidyNow elevates everyday cleaning into a thoughtfully curated service that honours Rivers State heritage and modern hospitality. Our team blends trusted, polished service with local warmth, so every home feels more refined, balanced, and beautifully maintained.
          </p>
          <div className="grid gap-8 md:grid-cols-2">
            <div className="space-y-4">
              <p className="font-display text-xl text-ink">A promise of quiet excellence</p>
              <p className="text-ink/60 leading-relaxed">
                Every cleaner is selected for their attention to detail, trained on our premium rituals, and paired with your home for a seamless experience.
              </p>
            </div>
            <div className="space-y-4">
              <p className="font-display text-xl text-ink">Local focus, elevated care</p>
              <p className="text-ink/60 leading-relaxed">
                We honour the Port Harcourt lifestyle with thoughtful service that understands local rhythms, family life, and cultural cues.
              </p>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-xl border border-mist bg-ink/5">
          <img
            src="/cleaning3.jpg"
            alt="Styled cleaning scene"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <p className="text-xs text-linen/70">Refined care</p>
            <h2 className="font-display text-3xl text-linen">Crafted for the modern Rivers State home.</h2>
          </div>
        </div>
      </section>

      <section className="mt-16 grid gap-10 lg:grid-cols-[1.1fr_0.9fr] items-center">
        <div className="space-y-6">
          <p className="font-mono text-[20px] text-pine">Our standards</p>
          <h2 className="font-display text-4xl text-ink leading-tight">
            Cleanliness, trust, and cultural care in every visit.
          </h2>
          <p className="text-ink/65 leading-relaxed">
            From daily upkeep to special occasion preparation, TidyNow creates a home environment that feels polished and personal. We use premium practices, local insight, and care from a team who understands what matters most to Rivers State households.
          </p>
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="rounded-xl border border-mist bg-white p-6 shadow-sm">
              <p className="font-mono text-[16px] text-ink/45 mb-3">Our people</p>
              <p className="text-ink/70 leading-relaxed">
                Experienced professionals selected for reliability, discretion, and the ability to make your home feel cared for with grace.
              </p>
            </div>
            <div className="rounded-xl border border-mist bg-linen-dim p-6 shadow-sm">
              <p className="font-mono text-[16px] text-ink/45 mb-3">Our approach</p>
              <p className="text-ink/70 leading-relaxed">
                We balance deep cleaning with daily rituals, creating a calm, radiant environment that reflects local hospitality and luxury.
              </p>
            </div>
          </div>
        </div>

        <div className="relative rounded-xl overflow-hidden border border-mist">
          <img src="/cleaning4.jpg" alt="Premium cleaning interior" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-ink/10 to-ink/40" />
          <div className="absolute bottom-0 left-0 right-0 p-8 text-linen">
            <p className="text-xs text-linen/80">Visual harmony</p>
            <p className="max-w-sm font-display text-2xl">
              Every space is styled, soft, and ready for the next chapter.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
