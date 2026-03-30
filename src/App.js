import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import Landing from "./pages/Landing";
import Onboarding from "./pages/Onboarding";
import Profile from "./pages/Profile";
import ExploreCareers from "./pages/ExploreCareers";
import AuthModal from "./components/AuthModal";
import { auth, isFirebaseConfigured } from "./firebaseConfig";

const PROFILE_STORAGE_KEY = "clear-careers-generated-profile";
const THEME_STORAGE_KEY = "clear-careers-theme";

function App() {
  const [step, setStep] = useState("landing");
  const [generatedProfile, setGeneratedProfile] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState("light");
  const [careerSearchQuery, setCareerSearchQuery] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (saved) {
      try {
        setGeneratedProfile(JSON.parse(saved));
      } catch {
        localStorage.removeItem(PROFILE_STORAGE_KEY);
      }
    }
  }, []);

  useEffect(() => {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    if (savedTheme === "dark" || savedTheme === "light") {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      return () => {};
    }

    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser || null);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div>
      {step === "landing" && (
        <Landing
          onStartDiscovery={() => setStep("onboarding")}
          onExploreCareers={(query = "") => {
            if (typeof query === "string") {
              setCareerSearchQuery(query);
            }
            setStep("explore-careers");
          }}
          onOpenAuth={() => setShowAuth(true)}
          profile={generatedProfile}
          user={user}
          theme={theme}
          searchQuery={careerSearchQuery}
          onSearchChange={setCareerSearchQuery}
          onToggleTheme={() => setTheme((prev) => (prev === "light" ? "dark" : "light"))}
          onLogout={async () => {
            if (isFirebaseConfigured && auth) {
              await signOut(auth);
            }
            setUser(null);
          }}
        />
      )}

      {step === "onboarding" && (
        <Onboarding
          onBack={() => setStep("landing")}
          onContinue={(profile) => {
            setGeneratedProfile(profile);
            localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
            setStep("profile");
          }}
        />
      )}

      {step === "profile" && (
        <Profile
          profile={generatedProfile}
          onRestart={() => {
            setGeneratedProfile(null);
            localStorage.removeItem(PROFILE_STORAGE_KEY);
            setStep("landing");
          }}
        />
      )}

      {step === "explore-careers" && (
        <ExploreCareers
          onBack={() => setStep("landing")}
          user={user}
          onOpenAuth={() => setShowAuth(true)}
          initialSearch={careerSearchQuery}
        />
      )}

      {showAuth && (
        <AuthModal
          onClose={() => setShowAuth(false)}
          onAuthSuccess={() => setShowAuth(false)}
        />
      )}
    </div>
  );
}

export default App;