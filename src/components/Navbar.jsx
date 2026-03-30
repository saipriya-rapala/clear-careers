import { motion } from "framer-motion";
import { LogIn, LogOut, Search, UserCircle2 } from "lucide-react";

export default function Navbar({
  user,
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  clusterResults = [],
  onSelectCluster,
  onOpenAuth,
  onLogout,
}) {
  const hasSearchQuery = Boolean(String(searchQuery || "").trim());

  return (
    <motion.nav
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 120, damping: 16 }}
      className="sticky top-0 z-50 border-b border-slate-700/60 bg-slate-900/95 backdrop-blur-xl"
    >
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-sm font-black text-white">
            C
          </div>
          <div>
            <p className="text-lg font-black leading-tight tracking-tight text-white">
              Clear Careers
            </p>
            <p className="text-xs font-medium text-slate-400">
              Build your future with clarity
            </p>
          </div>
        </div>

        <div className="ml-auto flex w-full items-center justify-end gap-3 sm:w-auto">
          <div className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              value={searchQuery || ""}
              onChange={(e) => onSearchChange?.(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  onSearchSubmit?.();
                }
              }}
              placeholder="Search careers across clusters"
              className="w-full rounded-full border border-slate-700 bg-slate-800/70 py-2.5 pl-10 pr-4 text-sm text-slate-100 placeholder:text-slate-500 focus:border-cyan-500/60 focus:outline-none"
            />

            {hasSearchQuery && (
              <div className="absolute left-0 right-0 top-[calc(100%+10px)] z-50 overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-xl">
                {clusterResults.length > 0 ? (
                  <ul className="max-h-64 overflow-y-auto py-1">
                    {clusterResults.map((clusterName) => (
                      <li key={clusterName}>
                        <button
                          type="button"
                          onClick={() => onSelectCluster?.(clusterName)}
                          className="block w-full px-4 py-2.5 text-left text-sm text-slate-200 transition hover:bg-slate-800"
                        >
                          {clusterName}
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="px-4 py-3 text-sm text-slate-400">No matching clusters found.</p>
                )}
              </div>
            )}
          </div>

          {user ? (
            <div className="flex items-center gap-2">
              <div className="hidden items-center gap-2 rounded-full border border-slate-700 bg-slate-800/70 px-3 py-2 sm:flex">
                <UserCircle2 className="h-4 w-4 text-cyan-300" />
                <span className="max-w-28 truncate text-xs font-semibold text-slate-200">
                  {user.email}
                </span>
              </div>
              <button
                onClick={onLogout}
                className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-300 transition hover:bg-red-500/20"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-200 transition hover:bg-cyan-500/20"
            >
              <LogIn className="h-4 w-4" />
              Login / Sign-up
            </button>
          )}
        </div>
      </div>
    </motion.nav>
  );
}