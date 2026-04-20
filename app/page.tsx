import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function LandingPage() {
  return (
    <div className="bg-tbwr-black min-h-screen">
      <Header />

      {/* HERO */}
      <section className="relative min-h-screen flex items-center pt-16">
        <div className="absolute inset-0 bg-gradient-to-b from-tbwr-black via-tbwr-black to-[#0a0a0a]" />
        <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-8 py-24 md:py-32">
          <div className="max-w-4xl">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-[2px] bg-tbwr-gold" />
              <span className="text-xs font-bold uppercase tracking-widest text-tbwr-gold">
                Reno / Sparks, Nevada
              </span>
            </div>

            <h1 className="tbwr-heading-xl text-tbwr-white mb-6 text-balance">
              Built for Athletes
              <br />
              <span className="text-tbwr-gold">Who Are Serious</span>
              <br />
              About Growth
            </h1>

            <p className="text-gray-400 text-lg md:text-xl max-w-2xl mb-12 leading-relaxed">
              TBWR is a premium youth wrestling club built around structured development,
              real coaching, and clear pathways. Every athlete enters with a plan.
              Every parent knows what to expect.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/assessment"
                className="inline-flex items-center justify-center bg-tbwr-gold text-tbwr-black font-black uppercase tracking-widest text-sm px-8 py-4 hover:bg-yellow-400 transition-colors"
              >
                Start Your Assessment
                <svg
                  className="ml-2 w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center border border-[#444] text-tbwr-white font-bold uppercase tracking-widest text-sm px-8 py-4 hover:border-tbwr-gold hover:text-tbwr-gold transition-colors"
              >
                How It Works
              </a>
            </div>
          </div>
        </div>

        {/* Gold accent bar */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-tbwr-gold to-transparent opacity-40" />
      </section>

      {/* STATS STRIP */}
      <section className="border-y border-[#1a1a1a] bg-[#050505]">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-[#1a1a1a]">
            {[
              { value: "3", label: "Pathway Programs" },
              { value: "100%", label: "Individualized Entry" },
              { value: "Day 1", label: "Development Begins" },
              { value: "Elite", label: "Standard of Coaching" },
            ].map((stat) => (
              <div key={stat.label} className="py-8 px-6 text-center">
                <div className="text-3xl md:text-4xl font-black text-tbwr-gold mb-1">
                  {stat.value}
                </div>
                <div className="text-xs font-bold uppercase tracking-widest text-gray-500">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PATHWAYS */}
      <section className="tbwr-section">
        <div className="tbwr-container">
          <div className="mb-14">
            <span className="tbwr-label block mb-4">Programs</span>
            <h2 className="tbwr-heading-lg text-tbwr-white">
              Three Pathways.<br />
              <span className="text-tbwr-gold">One Standard.</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: "LITTLE CHAMPS",
                ages: "Ages 5–8",
                description:
                  "Foundational movement, coordination, and confidence. No prior experience required. Built for first-time athletes entering a structured program.",
                focus: ["Fundamentals", "Movement", "Confidence", "Fun"],
              },
              {
                name: "WORLD TEAM",
                ages: "Ages 9–13",
                description:
                  "Competitive development and technique refinement. Athletes in this pathway train with tournament readiness as a clear goal.",
                focus: ["Technique", "Competition", "Conditioning", "Discipline"],
                featured: true,
              },
              {
                name: "FUTURE OLYMPIANS",
                ages: "Ages 14+",
                description:
                  "High-performance training for serious athletes. This pathway demands commitment and rewards it with elite-level coaching and development.",
                focus: ["Elite Training", "Strategy", "Mental Strength", "Performance"],
              },
            ].map((pathway) => (
              <div
                key={pathway.name}
                className={`border p-8 flex flex-col ${
                  pathway.featured
                    ? "border-tbwr-gold bg-[#0d0900]"
                    : "border-[#2a2a2a] bg-[#080808]"
                }`}
              >
                {pathway.featured && (
                  <span className="text-xs font-bold uppercase tracking-widest text-tbwr-gold mb-4 block">
                    Most Common
                  </span>
                )}
                <h3 className="tbwr-heading-sm text-tbwr-white mb-1">{pathway.name}</h3>
                <span className="text-tbwr-gold text-sm font-bold mb-4 block">{pathway.ages}</span>
                <p className="text-gray-400 text-sm leading-relaxed mb-6 flex-1">
                  {pathway.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {pathway.focus.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs font-bold uppercase tracking-widest text-gray-500 border border-[#333] px-2 py-1"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="tbwr-section border-t border-[#1a1a1a] bg-[#050505]">
        <div className="tbwr-container">
          <div className="mb-14">
            <span className="tbwr-label block mb-4">Process</span>
            <h2 className="tbwr-heading-lg text-tbwr-white">
              How Entry Works
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: "01",
                title: "Assessment",
                description:
                  "Complete a short 5-question assessment about your athlete. No guesswork — structured questions that inform real decisions.",
              },
              {
                step: "02",
                title: "Routing",
                description:
                  "Your answers determine the right entry point: a private evaluation, a trial session, or a preparation track.",
              },
              {
                step: "03",
                title: "Scheduling",
                description:
                  "Select availability and confirm your preferred days. A coach will follow up within 24 hours to finalize details.",
              },
              {
                step: "04",
                title: "Enrollment",
                description:
                  "Your athlete enters the program with a defined pathway, clear expectations, and a coach who knows their starting point.",
              },
            ].map((item) => (
              <div key={item.step} className="flex flex-col">
                <span className="text-5xl font-black text-tbwr-gold/20 mb-4 leading-none">
                  {item.step}
                </span>
                <h3 className="tbwr-heading-sm text-tbwr-white mb-3">{item.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY TBWR */}
      <section className="tbwr-section border-t border-[#1a1a1a]">
        <div className="tbwr-container">
          <div className="grid md:grid-cols-2 gap-16 items-start">
            <div>
              <span className="tbwr-label block mb-4">Why TBWR</span>
              <h2 className="tbwr-heading-lg text-tbwr-white mb-6">
                Structure Is<br />
                <span className="text-tbwr-gold">the Advantage</span>
              </h2>
              <p className="text-gray-400 leading-relaxed mb-4">
                Most youth programs treat every athlete the same. TBWR does not.
                Every athlete enters through a defined process, lands in the right
                pathway, and develops under coaches who know exactly where they are
                and where they are going.
              </p>
              <p className="text-gray-400 leading-relaxed">
                Parents get clarity. Athletes get direction. Coaches get context.
                This is what development looks like when it is taken seriously.
              </p>
            </div>

            <div className="flex flex-col gap-4">
              {[
                {
                  title: "Defined Entry",
                  body: "No confusion about whether your child is in the right program. The assessment places them correctly from day one.",
                },
                {
                  title: "Real Coaching",
                  body: "Coaches who track each athlete individually — not generic group instruction with no follow-through.",
                },
                {
                  title: "Parent Visibility",
                  body: "You will always know your child's pathway, current focus, and what comes next. No black box.",
                },
                {
                  title: "Long-Term Development",
                  body: "Built for athletes who want to compete and grow over years — not just fill a roster slot.",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="border border-[#2a2a2a] p-5 flex gap-4"
                >
                  <div className="w-1 bg-tbwr-gold flex-shrink-0" />
                  <div>
                    <h4 className="font-black uppercase tracking-wide text-sm text-tbwr-white mb-1">
                      {item.title}
                    </h4>
                    <p className="text-gray-400 text-sm leading-relaxed">{item.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="tbwr-section border-t border-[#1a1a1a] bg-[#030300]">
        <div className="tbwr-container text-center">
          <span className="tbwr-label block mb-6">Ready to Start</span>
          <h2 className="tbwr-heading-xl text-tbwr-white mb-6 text-balance">
            Your Athlete&apos;s<br />
            <span className="text-tbwr-gold">Development Begins Here</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-xl mx-auto mb-10">
            The assessment takes under three minutes. Your pathway recommendation
            is immediate. A coach will follow up within one business day.
          </p>
          <Link
            href="/assessment"
            className="inline-flex items-center justify-center bg-tbwr-gold text-tbwr-black font-black uppercase tracking-widest text-base px-10 py-5 hover:bg-yellow-400 transition-colors"
          >
            Begin Assessment
            <svg
              className="ml-2 w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
