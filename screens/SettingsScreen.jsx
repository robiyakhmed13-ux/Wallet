import React, { useMemo, useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import GlassCard from "../components/ui/GlassCard";
import ModalShell from "../components/ui/ModalShell";

const SettingsScreen = (props) => {
  const {
    THEME, t, lang,
    transactions, limits, goals, categories,
    allCats, getCat, catLabel,
    formatUZS, today, weekStart, month,
    weekSpend, monthSpend, topCats, monthSpentByCategory,
    openAddTx, openEditTx, removeTx,
    openAddLimit, openEditLimit, deleteLimit, saveLimit, limitForm, setLimitForm,
    openAddGoal, openEditGoal, deleteGoal, saveGoal, goalForm, setGoalForm, depositToGoal,
    setCategories, showToast, clamp,
    setLang, dataMode, setDataMode, useRemote, remoteOk, sbEnabled, syncFromRemote, resetLocal,
  } = props;

  const [resetOpen, setResetOpen] = useState(false);

  const doReset = () => {
    setBalance(0);
    setTransactions([]);
    setLimits([]);
    setGoals([]);
    setCategories(DEFAULT_CATEGORIES);
    showToast("✓ Reset", true);
    setResetOpen(false);
  };

  return (
    <motion.div
      initial={false} // ✅ IMPORTANT
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      className="fixed inset-0 z-50 overflow-y-auto"
      style={{ background: THEME.bg.primary }}
    >
      <div className="p-5 pb-28">
        <div className="flex items-center gap-4 mb-6">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => props.onClose()}
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: THEME.bg.card }}
          >
            ←
          </motion.button>

          <div className="flex-1">
            <h1 className="text-2xl font-bold" style={{ color: THEME.text.primary }}>
              {t.settings}
            </h1>
            <p className="text-sm" style={{ color: THEME.text.muted }}>
              {t.appName} • {tgUser?.id ? `ID: ${tgUser.id}` : "no user"}
            </p>
          </div>
        </div>

        <GlassCard className="p-5 mb-4">
          <p className="font-semibold mb-3" style={{ color: THEME.text.primary }}>
            {t.language}
          </p>
          <div className="grid grid-cols-3 gap-2">
            {LANGS.map((l) => (
              <button
                key={l.key}
                onClick={() => setLang(l.key)}
                className="py-3 rounded-2xl font-semibold"
                style={{
                  background: lang === l.key ? "rgba(249,115,22,0.18)" : THEME.bg.card,
                  color: lang === l.key ? THEME.accent.primary : THEME.text.secondary,
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                {l.flag} {l.label}
              </button>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="p-5 mb-4">
          <p className="font-semibold mb-2" style={{ color: THEME.text.primary }}>
            {t.dataMode}
          </p>
          <p className="text-sm mb-4" style={{ color: THEME.text.muted }}>
            {sb.enabled() ? "Supabase env detected" : "No Supabase env (offline only)"}
          </p>

          <div className="grid grid-cols-3 gap-2">
            {[
              { k: "auto", label: "Auto" },
              { k: "local", label: "Local" },
              { k: "remote", label: "Supabase" },
            ].map((x) => (
              <button
                key={x.k}
                onClick={() => setDataMode(x.k)}
                className="py-3 rounded-2xl font-semibold"
                style={{
                  background: dataMode === x.k ? "rgba(56,189,248,0.16)" : THEME.bg.card,
                  color: dataMode === x.k ? THEME.accent.info : THEME.text.secondary,
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                {x.label}
              </button>
            ))}
          </div>

          <div className="mt-4">
            <button
              onClick={syncFromRemote}
              className="w-full py-4 rounded-2xl font-semibold"
              style={{
                background: useRemote ? "rgba(34,197,94,0.16)" : "rgba(255,255,255,0.06)",
                color: useRemote ? THEME.accent.success : THEME.text.secondary,
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              🔄 {t.sync}
            </button>
          </div>
        </GlassCard>

        <GlassCard className="p-5">
          <p className="font-semibold mb-2" style={{ color: THEME.text.primary }}>
            Data tools
          </p>
          <p className="text-sm mb-4" style={{ color: THEME.text.muted }}>
            Export/Import works offline. Useful to back up or move data.
          </p>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => {
                const payload = { v: 1, lang, balance, transactions, limits, goals, categories, exportedAt: new Date().toISOString() };
                const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `hamyon-backup-${todayISO()}.json`;
                a.click();
                URL.revokeObjectURL(url);
                showToast("✓ Export", true);
              }}
              className="py-4 rounded-2xl font-semibold"
              style={{ background: THEME.bg.card, color: THEME.text.secondary, border: "1px solid rgba(255,255,255,0.06)" }}
            >
              ⬇ Export
            </button>

            <button
              onClick={() => {
                const input = document.createElement("input");
                input.type = "file";
                input.accept = "application/json";
                input.onchange = async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const text = await file.text();
                  try {
                    const obj = JSON.parse(text);
                    setLang(obj.lang || "uz");
                    setBalance(Number(obj.balance || 0));
                    setTransactions(Array.isArray(obj.transactions) ? obj.transactions : []);
                    setLimits(Array.isArray(obj.limits) ? obj.limits : []);
                    setGoals(Array.isArray(obj.goals) ? obj.goals : []);
                    setCategories(obj.categories || DEFAULT_CATEGORIES);
                    showToast("✓ Import", true);
                  } catch {
                    showToast("Import failed", false);
                  }
                };
                input.click();
              }}
              className="py-4 rounded-2xl font-semibold"
              style={{ background: THEME.bg.card, color: THEME.text.secondary, border: "1px solid rgba(255,255,255,0.06)" }}
            >
              ⬆ Import
            </button>
          </div>

          <div className="mt-4">
            {/* ✅ replace confirm() with modal */}
            <button
              onClick={() => setResetOpen(true)}
              className="w-full py-4 rounded-2xl font-semibold"
              style={{ background: "rgba(239,68,68,0.14)", color: THEME.accent.danger, border: "1px solid rgba(255,255,255,0.06)" }}
            >
              🗑 {t.resetLocal}
            </button>
          </div>
        </GlassCard>
      </div>

      {/* ✅ Telegram-safe reset modal */}
      {resetOpen && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center p-4" style={{ background: "rgba(0,0,0,0.55)" }}>
          <div className="w-full max-w-md rounded-3xl p-4" style={{ background: THEME.bg.card }}>
            <h3 className="text-lg font-bold mb-2" style={{ color: THEME.text.primary }}>
              Reset all local data?
            </h3>
            <p className="text-sm mb-3" style={{ color: THEME.text.muted }}>
              This will delete balance, transactions, limits, goals and custom categories on this device.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setResetOpen(false)}
                className="flex-1 py-3 rounded-2xl"
                style={{ background: "rgba(255,255,255,0.08)", color: THEME.text.primary }}
              >
                {t.cancel}
              </button>
              <button
                onClick={doReset}
                className="flex-1 py-3 rounded-2xl font-semibold"
                style={{ background: "rgba(239,68,68,0.20)", color: THEME.text.primary }}
              >
                {t.delete}
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

// ---------------------------
// Bottom navigation
// ---------------------------

export default SettingsScreen;
