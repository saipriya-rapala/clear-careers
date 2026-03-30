export default function Profile({ profile, onRestart }) {
  if (!profile) {
    return (
      <section className="min-h-screen bg-[#dbe4f2] px-4 py-7 sm:px-7">
        <div className="mx-auto max-w-4xl rounded-2xl border border-[#d4dbe8] bg-[#f7f9fc] p-9 text-center">
          <h1 className="cc-display text-3xl font-black text-[#0f1c3d]">No profile found</h1>
          <p className="cc-body mt-4 text-lg text-[#5f7194]">Please complete onboarding to generate your profile.</p>
          <button
            onClick={onRestart}
            className="cc-display mt-7 rounded-full bg-[#0f1c3d] px-8 py-3 text-lg font-bold text-white"
          >
            Back to Home
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-[#dbe4f2] px-4 py-7 sm:px-7">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="rounded-2xl border border-[#d4dbe8] bg-[#f7f9fc] p-7 sm:p-9">
          <p className="cc-body text-sm font-semibold tracking-[0.08em] text-[#4e68a0]">PROFILE GENERATED</p>
          <h1 className="cc-display mt-3 text-4xl font-black text-[#0f1c3d] sm:text-5xl">
            {profile.name}'s Career Profile
          </h1>
          <p className="cc-body mt-5 text-lg text-[#4f6283] sm:text-xl">{profile.profile_summary}</p>

          <div className="mt-7 grid gap-4 sm:grid-cols-2">
            <InfoBlock title="Grade" values={[profile.grade]} />
            <InfoBlock title="Top Superpowers" values={profile.superpowers || []} />
            <InfoBlock title="Academic Interests" values={profile.subjects || []} />
            <InfoBlock title="Passion Areas" values={profile.passions || []} />
          </div>
        </div>

        <div className="rounded-2xl border border-[#d4dbe8] bg-[#f7f9fc] p-7 sm:p-9">
          <h2 className="cc-display text-3xl font-black text-[#0f1c3d]">Recommended Career Paths</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {(profile.suggested_careers || []).map((career) => (
              <article key={career.id} className="rounded-xl border border-[#dce3ef] bg-[#eef3fb] p-5">
                <p className="cc-body text-xs font-bold tracking-[0.08em] text-[#4e68a0]">{career.cluster}</p>
                <h3 className="cc-display mt-2 text-2xl font-bold text-[#20365d]">{career.title}</h3>
                <p className="cc-body mt-2 text-sm text-[#5f7194]">Demand: {career.demand_level}</p>
                <p className="cc-body text-sm text-[#5f7194]">Entry Salary: {career.entry_salary} LPA</p>
              </article>
            ))}
          </div>

          <div className="mt-7">
            <button
              onClick={onRestart}
              className="cc-display rounded-full bg-[#2f66de] px-8 py-3 text-lg font-bold text-white shadow-[0_8px_24px_rgba(47,102,222,0.34)]"
            >
              Create Another Profile
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function InfoBlock({ title, values }) {
  return (
    <div className="rounded-xl border border-[#dce3ef] bg-[#eef3fb] p-5">
      <p className="cc-display text-lg font-bold text-[#20365d]">{title}</p>
      <div className="mt-2.5 flex flex-wrap gap-2">
        {values.map((value) => (
          <span key={value} className="cc-body rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-[#48608b]">
            {value}
          </span>
        ))}
      </div>
    </div>
  );
}
