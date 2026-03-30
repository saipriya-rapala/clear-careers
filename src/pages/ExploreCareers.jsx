import { useEffect, useMemo, useState } from "react";
import Papa from "papaparse";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Search, X } from "lucide-react";

const cardColors = [
  "from-cyan-500 to-blue-600",
  "from-blue-500 to-indigo-600",
  "from-emerald-500 to-teal-600",
  "from-fuchsia-500 to-pink-600",
  "from-amber-500 to-orange-600",
  "from-violet-500 to-purple-600",
  "from-lime-500 to-green-600",
  "from-sky-500 to-cyan-600",
  "from-rose-500 to-red-600",
  "from-indigo-500 to-blue-700",
];

function sortByClusterNumber(a, b) {
  const aNum = Number(String(a.cluster_id || a.id).replace(/\D/g, ""));
  const bNum = Number(String(b.cluster_id || b.id).replace(/\D/g, ""));
  return aNum - bNum;
}

function parseClusterNumber(value) {
  const match = String(value || "").trim().toLowerCase().match(/^cluster\s*(\d+)$/);
  return match ? Number(match[1]) : null;
}

export default function ExploreCareers({ onBack, initialSearch = "" }) {
  const [clusters, setClusters] = useState([]);
  const [careers, setCareers] = useState([]);
  const [selectedCluster, setSelectedCluster] = useState(null);
  const [globalSearch, setGlobalSearch] = useState("");
  const [panelSearch, setPanelSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setGlobalSearch(initialSearch || "");
  }, [initialSearch]);

  useEffect(() => {
    let isMounted = true;

    async function loadCsvData() {
      setLoading(true);
      setError("");

      try {
        const [clustersResult, careersResult] = await Promise.all([
          new Promise((resolve, reject) => {
            Papa.parse("/data/ClusterSummary.csv", {
              download: true,
              header: true,
              skipEmptyLines: true,
              complete: resolve,
              error: reject,
            });
          }),
          new Promise((resolve, reject) => {
            Papa.parse("/data/Careers.csv", {
              download: true,
              header: true,
              skipEmptyLines: true,
              complete: resolve,
              error: reject,
            });
          }),
        ]);

        if (!isMounted) {
          return;
        }

        const parsedClusters = (clustersResult.data || [])
          .map((row) => ({
            id: row.cluster_id,
            name: row.cluster_name,
          }))
          .filter((cluster) => cluster.id && cluster.name)
          .sort(sortByClusterNumber);

        const parsedCareers = (careersResult.data || [])
          .map((row) => ({
            id: Number(row["No."] || 0),
            clusterId: row.Cluster,
            name: row["Career Name"] || "",
            summary: row["One-Line Summary"] || "",
            demand: row["Demand Level"] || "",
            entrySalary: row["Entry Salary (LPA)"] || "",
            growthRate: row["Growth Rate"] || "",
          }))
          .filter((career) => career.id > 0 && career.clusterId && career.name)
          .sort((a, b) => a.id - b.id);

        setClusters(parsedClusters);
        setCareers(parsedCareers);
      } catch {
        if (!isMounted) {
          return;
        }
        setError("Could not load Careers.csv / Cluster Summary.csv.");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadCsvData();
    return () => {
      isMounted = false;
    };
  }, []);

  const groupedClusters = useMemo(() => {
    const countMap = careers.reduce((acc, career) => {
      acc[career.clusterId] = (acc[career.clusterId] || 0) + 1;
      return acc;
    }, {});

    const query = globalSearch.trim().toLowerCase();

    return clusters
      .map((cluster) => {
        const clusterCareers = careers.filter((career) => career.clusterId === cluster.id);
        return {
          ...cluster,
          count: countMap[cluster.id] || 0,
          careers: clusterCareers,
        };
      })
      .filter((cluster) => {
        if (!query) {
          return true;
        }

        const queryClusterNumber = parseClusterNumber(query);
        const clusterNumber = Number(String(cluster.id || "").replace(/\D/g, ""));

        if (queryClusterNumber !== null) {
          return clusterNumber === queryClusterNumber;
        }

        const inClusterId = String(cluster.id || "").toLowerCase().includes(query);
        const inClusterName = cluster.name.toLowerCase().includes(query);
        const inCareers = cluster.careers.some((career) =>
          career.name.toLowerCase().includes(query)
        );

        return inClusterId || inClusterName || inCareers;
      });
  }, [clusters, careers, globalSearch]);

  const selectedCareers = useMemo(() => {
    if (!selectedCluster) {
      return [];
    }

    const query = panelSearch.trim().toLowerCase();
    if (!query) {
      return selectedCluster.careers;
    }

    return selectedCluster.careers.filter((career) =>
      career.name.toLowerCase().includes(query)
    );
  }, [selectedCluster, panelSearch]);

  return (
    <div className="min-h-screen bg-slate-900">
      <header className="border-b border-slate-700/60 bg-slate-900/95 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <button
            onClick={onBack}
            className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </button>
          <h1 className="text-4xl font-black text-white">Explore Careers</h1>
          <p className="mt-2 text-slate-300">
            Browse 10 career clusters and discover the right path with real career data.
          </p>

          <div className="mt-5 max-w-lg">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                value={globalSearch}
                onChange={(event) => setGlobalSearch(event.target.value)}
                placeholder="Search cluster or career name"
                className="w-full rounded-xl border border-slate-700 bg-slate-800/70 py-2.5 pl-10 pr-4 text-sm text-slate-100 placeholder:text-slate-500 focus:border-cyan-500/70 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </header>

      <section className="bg-white py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {loading && <p className="text-sm font-semibold text-slate-500">Loading CSV data...</p>}
          {error && <p className="text-sm font-semibold text-red-600">{error}</p>}

          {!loading && !error && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
              {groupedClusters.map((cluster, index) => (
                <motion.button
                  key={cluster.id}
                  whileHover={{ y: -3 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setSelectedCluster(cluster);
                    setPanelSearch("");
                  }}
                  className={`overflow-hidden rounded-2xl bg-gradient-to-br ${
                    cardColors[index % cardColors.length]
                  } p-5 text-left text-white shadow-md`}
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-white/80">
                    {cluster.id}
                  </p>
                  <h3 className="mt-3 text-lg font-bold leading-tight">{cluster.name}</h3>
                  <p className="mt-3 text-sm font-semibold text-white/85">{cluster.count} careers</p>
                </motion.button>
              ))}
            </div>
          )}
        </div>
      </section>

      <AnimatePresence>
        {selectedCluster && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-slate-950/45"
              onClick={() => setSelectedCluster(null)}
            />

            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 120, damping: 20 }}
              className="fixed right-0 top-0 z-50 h-full w-full max-w-2xl overflow-y-auto bg-white shadow-2xl"
            >
              <div className="sticky top-0 z-10 border-b border-slate-200 bg-white px-6 py-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {selectedCluster.id}
                    </p>
                    <h2 className="mt-1 text-2xl font-black text-slate-900">{selectedCluster.name}</h2>
                    <p className="mt-1 text-sm text-slate-500">
                      {selectedCluster.careers.length} careers in this cluster
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedCluster(null)}
                    className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-100"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="relative mt-4">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    value={panelSearch}
                    onChange={(event) => setPanelSearch(event.target.value)}
                    placeholder="Search inside this cluster"
                    className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-4 text-sm text-slate-700 placeholder:text-slate-400 focus:border-cyan-500/70 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-3 px-6 py-5">
                {selectedCareers.map((career) => (
                  <article
                    key={career.id}
                    className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-lg font-bold text-slate-900">{career.name}</h3>
                      <span className="rounded-full bg-cyan-100 px-2.5 py-1 text-xs font-semibold text-cyan-700">
                        #{career.id}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">{career.summary}</p>
                    <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                      <p className="rounded bg-white px-2 py-1 text-slate-600">Demand: {career.demand}</p>
                      <p className="rounded bg-white px-2 py-1 text-slate-600">Entry: {career.entrySalary}</p>
                      <p className="rounded bg-white px-2 py-1 text-slate-600">Growth: {career.growthRate}</p>
                    </div>
                  </article>
                ))}

                {selectedCareers.length === 0 && (
                  <p className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
                    No careers found for this search.
                  </p>
                )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
