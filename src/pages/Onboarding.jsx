import { useState } from "react";
import careersData from "../data/clearcareers_data.json";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:5000";

const STEPS = [
  { key: "basics", label: "The Basics", icon: "✓" },
  { key: "academics", label: "Academics", icon: "▭" },
  { key: "superpowers", label: "Superpowers", icon: "◎" },
  { key: "passions", label: "Passions", icon: "♡" },
];

const GRADES = ["9th", "10th", "11th", "12th"];
const SUBJECTS = [
  "Math",
  "Science",
  "Literature",
  "History",
  "Art",
  "Computer Science",
  "Languages",
  "Music",
  "Business",
];

const SUPERPOWERS = [
  "Problem Solving",
  "Public Speaking",
  "Writing",
  "Coding",
  "Design",
  "Leadership",
  "Empathy",
  "Data Analysis",
  "Debate",
  "Organization",
  "Creativity",
];

const PASSIONS = [
  {
    title: "Building Technology",
    subtitle: "Software, AI, Hardware",
  },
  {
    title: "Helping People",
    subtitle: "Medicine, Psychology, Therapy",
  },
  {
    title: "Creating Art/Media",
    subtitle: "Design, Film, Writing",
  },
  {
    title: "Running a Business",
    subtitle: "Startups, Finance, Marketing",
  },
  {
    title: "Environment",
    subtitle: "Sustainability, Biology, Outdoors",
  },
  {
    title: "Law & Society",
    subtitle: "Politics, Activism, Law",
  },
];

const STAGE_ORDER = ["basics", "academics", "superpowers", "passions"];

const PASSION_TO_CLUSTER = {
  "Building Technology": "Cluster 1",
  "Helping People": "Cluster 2",
  "Creating Art/Media": "Cluster 3",
  "Running a Business": "Cluster 4",
  Environment: "Cluster 5",
  "Law & Society": "Cluster 6",
};

function dedupeById(list) {
  const seen = new Set();
  return list.filter((item) => {
    const key = item.id;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

function buildFallbackProfile({ name, grade, subjects, superpowers, passions }) {
  const preferredClusters = passions
    .map((passion) => PASSION_TO_CLUSTER[passion])
    .filter(Boolean);

  const mappedCareers = (careersData || [])
    .map((career) => ({
      id: Number(career["No."] || 0),
      title: career["Career Name"] || "",
      cluster: career.Cluster || "",
      demand_level: career["Demand Level"] || "",
      entry_salary: career["Entry Salary (LPA)"] || "",
    }))
    .filter((career) => career.id > 0 && career.title && career.cluster);

  const preferredCareerMatches = mappedCareers.filter((career) =>
    preferredClusters.includes(career.cluster)
  );
  const fallbackCareerMatches = mappedCareers.slice(0, 5);

  const suggested_careers = dedupeById(
    (preferredCareerMatches.length > 0 ? preferredCareerMatches : fallbackCareerMatches).slice(0, 5)
  );

  const primaryPassions = passions.length ? passions.join(", ") : "your interests";
  const strongestSkills = superpowers.length ? superpowers.slice(0, 2).join(" and ") : "your strengths";

  const profile_summary = `${name} is a Grade ${grade} learner passionate about ${primaryPassions}. With strong ${strongestSkills}, this profile is aligned to career paths that combine these interests and strengths.`;

  return {
    id: `local-${Date.now()}`,
    name,
    grade,
    subjects,
    superpowers,
    passions,
    profile_summary,
    suggested_careers,
    created_at: new Date().toISOString(),
    source: "fallback",
  };
}

export default function Onboarding({ onBack, onContinue }) {
  const [name, setName] = useState("");
  const [grade, setGrade] = useState("");
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [selectedSuperpowers, setSelectedSuperpowers] = useState([]);
  const [selectedPassions, setSelectedPassions] = useState([]);
  const [stage, setStage] = useState("basics");
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const canContinueBasics = name.trim().length > 1 && grade;
  const canContinueAcademics = selectedSubjects.length > 0;
  const canContinueSuperpowers = selectedSuperpowers.length > 0;
  const canContinuePassions = selectedPassions.length > 0;

  const activeIndex = STAGE_ORDER.indexOf(stage);

  const handleContinue = async () => {
    if (stage === "basics") {
      if (!canContinueBasics) return;
      setStage("academics");
      return;
    }

    if (stage === "academics") {
      if (!canContinueAcademics) return;
      setStage("superpowers");
      return;
    }

    if (stage === "superpowers") {
      if (!canContinueSuperpowers) return;
      setStage("passions");
      return;
    }

    if (!canContinuePassions || isSaving) return;

    setErrorMessage("");
    setIsSaving(true);
    try {
      const response = await fetch(`${API_BASE_URL}/profiles`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          grade,
          subjects: selectedSubjects,
          superpowers: selectedSuperpowers,
          passions: selectedPassions,
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error || "Could not generate profile");
      }

      const profile = await response.json();
      onContinue?.(profile);
    } catch {
      const fallbackProfile = buildFallbackProfile({
        name: name.trim(),
        grade,
        subjects: selectedSubjects,
        superpowers: selectedSuperpowers,
        passions: selectedPassions,
      });

      setErrorMessage("Backend is unreachable, so we generated your profile locally.");
      onContinue?.(fallbackProfile);
    } finally {
      setIsSaving(false);
    }
  };

  const handleBack = () => {
    if (stage === "passions") {
      setStage("superpowers");
      return;
    }

    if (stage === "superpowers") {
      setStage("academics");
      return;
    }

    if (stage === "academics") {
      setStage("basics");
      return;
    }

    onBack?.();
  };

  const toggleSubject = (subject) => {
    setSelectedSubjects((prev) => {
      if (prev.includes(subject)) {
        return prev.filter((item) => item !== subject);
      }
      return [...prev, subject];
    });
  };

  const toggleSuperpower = (superpower) => {
    setSelectedSuperpowers((prev) => {
      if (prev.includes(superpower)) {
        return prev.filter((item) => item !== superpower);
      }
      return [...prev, superpower];
    });
  };

  const togglePassion = (passionTitle) => {
    setSelectedPassions((prev) => {
      if (prev.includes(passionTitle)) {
        return prev.filter((item) => item !== passionTitle);
      }
      return [...prev, passionTitle];
    });
  };

  const canContinueCurrent =
    (stage === "basics" && canContinueBasics) ||
    (stage === "academics" && canContinueAcademics) ||
    (stage === "superpowers" && canContinueSuperpowers) ||
    (stage === "passions" && canContinuePassions);

  const continueLabel = stage === "passions" ? "Generate Profile" : "Continue";

  return (
    <section className="min-h-screen bg-[#dbe4f2] px-4 py-6 sm:px-7">
      <div className="mx-auto max-w-5xl">
        <div className="grid grid-cols-4 items-center gap-3 pb-6 sm:gap-5">
          {STEPS.map((step, idx) => (
            <div key={step.key} className="flex flex-col items-center">
              <div className="relative w-full pb-2">
                {idx < STEPS.length - 1 ? (
                  <span
                    className={`absolute left-1/2 top-5 h-[2px] w-full ${
                      idx < activeIndex ? "bg-[#3573ea]" : "bg-[#cfd8e8]"
                    }`}
                  />
                ) : null}
                <div
                  className={`relative z-10 mx-auto grid h-11 w-11 place-items-center rounded-full border text-base ${
                    idx === activeIndex
                      ? "border-[#2e66df] bg-[#2f66de] text-white shadow-[0_8px_24px_rgba(47,102,222,0.35)]"
                      : idx < activeIndex
                        ? "border-[#9eb9ef] bg-[#dbe8ff] text-[#2f66de]"
                        : "border-[#cad4e6] bg-[#dbe3f1] text-[#b2bfd6]"
                  }`}
                >
                  {step.icon}
                </div>
              </div>
              <span
                className={`cc-body text-sm font-semibold sm:text-base ${
                  idx === activeIndex || idx < activeIndex
                    ? "text-[#2f66de]"
                    : "text-[#7f92b5]"
                }`}
              >
                {step.label}
              </span>
            </div>
          ))}
        </div>

        <div className="overflow-hidden rounded-[26px] border border-[#d4dbe8] bg-[#f7f9fc] shadow-[0_15px_40px_rgba(49,73,117,0.12)]">
          <div className="px-6 pb-7 pt-8 sm:px-12 sm:pb-9 sm:pt-9">
            {stage === "basics" ? (
              <>
                <div className="mx-auto max-w-2xl text-center">
                  <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-[#e3ebf8] text-2xl text-[#2d63df]">
                    ✧
                  </div>
                  <h1 className="cc-display text-3xl font-black tracking-[-0.02em] text-[#0f1c3d] sm:text-4xl">
                    Let's build your profile
                  </h1>
                  <p className="cc-body mt-3 text-lg text-[#5f7194] sm:text-2xl">First, what should we call you?</p>
                </div>

                <div className="mx-auto mt-6 max-w-xl">
                  <label className="cc-display mb-2 block text-xl font-bold text-[#21365d] sm:text-2xl">Your Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="e.g. Alex"
                    className="cc-body w-full rounded-xl border border-[#d6ddeb] bg-[#f2f5fa] px-4 py-3.5 text-xl text-[#2b3f66] placeholder:text-[#889ab9] outline-none focus:border-[#9cb4e5] focus:ring-2 focus:ring-[#c3d4f4]"
                  />

                  <p className="cc-display mb-2.5 mt-6 text-xl font-bold text-[#21365d] sm:text-2xl">Current Grade</p>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
                    {GRADES.map((value) => (
                      <button
                        key={value}
                        onClick={() => setGrade(value)}
                        className={`cc-body rounded-xl border px-3.5 py-2.5 text-xl font-semibold transition ${
                          grade === value
                            ? "border-[#2f66de] bg-[#e6eeff] text-[#2458cd]"
                            : "border-[#d3dbe9] bg-[#eef2f8] text-[#38507a] hover:bg-[#e5ecf7]"
                        }`}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            ) : stage === "academics" ? (
              <div className="mx-auto max-w-4xl">
                <div className="text-center">
                  <h1 className="cc-display text-3xl font-black tracking-[-0.02em] text-[#0f1c3d] sm:text-5xl">
                    What do you enjoy learning?
                  </h1>
                  <p className="cc-body mt-3 text-lg text-[#5f7194] sm:text-2xl">
                    Select the subjects you actually look forward to.
                  </p>
                </div>

                <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {SUBJECTS.map((subject) => {
                    const selected = selectedSubjects.includes(subject);
                    return (
                      <button
                        key={subject}
                        onClick={() => toggleSubject(subject)}
                        className={`rounded-2xl border p-4.5 text-left transition ${
                          selected
                            ? "border-[#8fb0f0] bg-[#e6efff]"
                            : "border-[#dee4ef] bg-[#f7f9fc] hover:bg-[#edf2fb]"
                        }`}
                      >
                        <span
                          className={`mb-5 block h-6 w-6 rounded-full border ${
                            selected
                              ? "border-[#2f66de] bg-[#2f66de]"
                              : "border-[#e2e7f1] bg-[#eef2f8]"
                          }`}
                        />
                        <span className="cc-display text-2xl font-semibold text-[#334f78]">{subject}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : stage === "superpowers" ? (
              <div className="mx-auto max-w-4xl">
                <div className="text-center">
                  <h1 className="cc-display text-3xl font-black tracking-[-0.02em] text-[#0f1c3d] sm:text-5xl">
                    What are your superpowers?
                  </h1>
                  <p className="cc-body mt-3 text-lg text-[#5f7194] sm:text-2xl">
                    Don't be humble. What are you naturally good at?
                  </p>
                </div>

                <div className="mx-auto mt-8 flex max-w-4xl flex-wrap items-center justify-center gap-4">
                  {SUPERPOWERS.map((power) => {
                    const selected = selectedSuperpowers.includes(power);
                    return (
                      <button
                        key={power}
                        onClick={() => toggleSuperpower(power)}
                        className={`cc-display rounded-full border px-6 py-3 text-lg font-semibold transition sm:text-xl ${
                          selected
                            ? "border-[#5e79ff] bg-[#edf1ff] text-[#274fce]"
                            : "border-[#d6deeb] bg-[#f7f9fc] text-[#334f78] hover:bg-[#edf2fb]"
                        }`}
                      >
                        {power}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="mx-auto max-w-5xl">
                <div className="text-center">
                  <h1 className="cc-display text-3xl font-black tracking-[-0.02em] text-[#0f1c3d] sm:text-5xl">
                    What sparks your curiosity?
                  </h1>
                  <p className="cc-body mt-3 text-lg text-[#5f7194] sm:text-2xl">
                    Pick a few areas you'd love to explore in the real world.
                  </p>
                </div>

                <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {PASSIONS.map((passion) => {
                    const selected = selectedPassions.includes(passion.title);
                    return (
                      <button
                        key={passion.title}
                        onClick={() => togglePassion(passion.title)}
                        className={`rounded-2xl border p-5 text-left transition ${
                          selected
                            ? "border-[#5e79ff] bg-[#edf1ff]"
                            : "border-[#dee4ef] bg-[#f7f9fc] hover:bg-[#edf2fb]"
                        }`}
                      >
                        <p className="cc-display text-xl font-bold text-[#2d4270]">{passion.title}</p>
                        <p className="cc-body mt-2 text-base text-[#7b8ba7]">{passion.subtitle}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between border-t border-[#dde3ee] bg-[#eef2f8] px-6 py-4.5 sm:px-12">
            <button
              onClick={handleBack}
              className="cc-display text-lg font-bold text-[#9fb0cb] transition hover:text-[#7f93b5]"
            >
              ← Back
            </button>

            <button
              onClick={handleContinue}
              disabled={!canContinueCurrent || isSaving}
              className={`cc-display rounded-full px-9 py-3 text-lg font-bold text-white transition ${
                canContinueCurrent && !isSaving
                  ? "bg-[#0f1c3d] shadow-[0_10px_28px_rgba(15,28,61,0.26)] hover:translate-y-[-1px]"
                  : "bg-[#93a3c2]"
              }`}
            >
              {isSaving ? "Saving..." : `${continueLabel} →`}
            </button>
          </div>
          {errorMessage ? (
            <p className="cc-body px-6 pb-5 text-sm font-semibold text-[#be2f2f] sm:px-14">{errorMessage}</p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
