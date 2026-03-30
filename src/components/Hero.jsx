export default function Hero({ onStartDiscovery, onExploreCareers, careersCount = 0 }) {

  return (
    <section className="px-4 py-5 sm:px-5 lg:px-7">
      <div className="mx-auto grid max-w-[1100px] gap-5 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[25px] bg-[#dde5f2]/55 px-5 py-6 sm:px-6 sm:py-7 lg:py-8">
          <span className="cc-body inline-flex rounded-full border border-[#c4d4f1] bg-[#dce8fa] px-3 py-1.5 text-xs font-bold tracking-[0.03em] text-[#3a63d4] sm:text-sm">
            ● THE FUTURE OF CAREER DISCOVERY
          </span>

          <h1 className="cc-display mt-6 text-[36px] font-black leading-[0.95] tracking-[-0.025em] text-[#101c3e] sm:text-[45px] lg:text-[50px]">
            Stop guessing <br />
            your future. <br />
            <span className="bg-[linear-gradient(90deg,#2f67e3_0%,#3867e7_45%,#5b5be8_100%)] bg-clip-text text-transparent">
              Experience it.
            </span>
          </h1>

          <p className="cc-body mt-5 max-w-3xl text-base leading-[1.45] text-[#4f6283] sm:text-lg">
            Eliminate career confusion caused by pressure and trends.
            Discover your true path through structured assessment,
            real-world trials, and evidence-based guidance.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-3.5">
            <button
              onClick={onStartDiscovery}
              className="cc-display flex items-center justify-between gap-2.5 rounded-full bg-[linear-gradient(120deg,#2f67e3_0%,#315fd6_100%)] px-6 py-3.5 text-left text-base font-bold text-white shadow-[0_10px_24px_rgba(46,98,223,0.28)] transition hover:translate-y-[-1px] sm:flex-1"
            >
              <span>Start Your Career Discovery Journey</span>
              <span className="text-xl">→</span>
            </button>

            <button
              onClick={onExploreCareers}
              className="cc-display flex items-center justify-center gap-2.5 rounded-full border border-[#cdd8ea] bg-[#dce5f3]/55 px-5 py-3 text-base font-bold text-[#304f84] hover:bg-[#ccd8ed] transition sm:shrink-0"
            >
              <span>🎯 Explore Careers</span>
            </button>
          </div>

        </div>

        <div className="rounded-[28px] border border-[#d2d9e6] bg-[#f2f4f8] shadow-[0_13px_26px_rgba(86,102,136,0.14)]">
          <div className="border-b border-[#d9dee8] p-3.5 sm:p-4">
            <div className="flex items-center gap-3">
              <span className="h-3.5 w-3.5 rounded-full bg-[#ff6560]" />
              <span className="h-3.5 w-3.5 rounded-full bg-[#f4bc21]" />
              <span className="h-3.5 w-3.5 rounded-full bg-[#16c392]" />
              <span className="ml-3 h-7 flex-1 rounded-lg bg-[#e0e5ed]" />
            </div>
          </div>

          <div className="space-y-3 p-3.5 sm:p-5">
            <Feature index="1" title="Direction Assessment" desc="Psychometric & interest routing" tint="blue" />
            <Feature index="2" title="Reality-Based Intel" desc="Data-driven authentic reality" tint="violet" />
            <Feature index="3" title="Career Trial Missions" desc="Experiential micro-internships" tint="green" />
            <Feature index="4" title="Dual-Confidence Reports" desc="Actionable analytics for all" tint="amber" />
          </div>
        </div>
      </div>

      <div className="mx-auto mt-7 max-w-[1100px] rounded-[20px] border border-[#d9e0ec] bg-[#f7f9fc] p-4 sm:p-6">
        <div className="text-center">
          <h2 className="cc-display text-xl font-black tracking-[-0.02em] text-[#0f1c3d] sm:text-3xl">
            Designed for the entire ecosystem
          </h2>
          <p className="cc-body mx-auto mt-2.5 max-w-4xl text-sm text-[#4f6283] sm:text-lg">
            Aligning students, parents, and educators with evidence-based career discovery.
          </p>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-3">
          <EcosystemCard
            icon="◎"
            iconClass="bg-[#d9e8ff] text-[#2f66de]"
            title="For Students"
            description="Stop guessing. Try careers before committing to a major. Build confidence through real-world micro-internships and discover what you actually enjoy doing."
          />
          <EcosystemCard
            icon="◈"
            iconClass="bg-[#e2e5ff] text-[#5a5ce6]"
            title="For Parents"
            description="Get peace of mind. Receive data-driven confidence reports that validate your child's choices based on their actual performance and sustained interest."
          />
          <EcosystemCard
            icon="↗"
            iconClass="bg-[#d9f5eb] text-[#119b72]"
            title="For Schools"
            description="Scale career counseling. Provide every student with personalized, structured discovery paths and track aggregate engagement and outcomes."
          />
        </div>
      </div>
    </section>
  );
}

function Feature({ index, title, desc, tint }) {
  const iconColor = {
    blue: "bg-[#d5e5ff] text-[#356ce4]",
    violet: "bg-[#e0e0ff] text-[#6366f1]",
    green: "bg-[#d8f5eb] text-[#0ea777]",
    amber: "bg-[#f9efcc] text-[#db8a00]",
  };

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-[#e1e5ec] bg-[#ecf0f7] p-3 sm:p-3.5">
      <div className={`grid h-10 w-10 place-items-center rounded-xl text-base font-black ${iconColor[tint]}`}>
        {index}
      </div>
      <div>
        <h4 className="cc-display text-lg font-black leading-none text-[#142447]">{title}</h4>
        <p className="cc-body mt-1 text-sm leading-tight text-[#5b6f92]">{desc}</p>
      </div>
    </div>
  );
}

function EcosystemCard({ icon, iconClass, title, description }) {
  return (
    <article className="rounded-2xl border border-[#e2e7f0] bg-[#eef2f8] p-4 sm:p-5">
      <div className={`grid h-10 w-10 place-items-center rounded-xl text-lg font-black ${iconClass}`}>
        {icon}
      </div>
      <h3 className="cc-display mt-4 text-2xl font-black text-[#132447]">{title}</h3>
      <p className="cc-body mt-2.5 text-sm leading-[1.5] text-[#415b86] sm:text-base">
        {description}
      </p>
    </article>
  );
}