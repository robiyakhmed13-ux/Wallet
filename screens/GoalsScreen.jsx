import React, { useMemo, useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import GlassCard from "../components/ui/GlassCard";
import ModalShell from "../components/ui/ModalShell";

const GoalsScreen = (props) => {
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

  const [pendingDeleteGoalId, setPendingDeleteGoalId] = useState(null);

  // Deposit/Withdraw modal (replaces prompt())
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [adjustGoalId, setAdjustGoalId] = useState(null);
  const [adjustSign, setAdjustSign] = useState(+1); // +1 deposit, -1 withdraw
  const [adjustValue, setAdjustValue] = useState("50000");

  const openAdjust = (goalId, sign) => {
    setAdjustGoalId(goalId);
    setAdjustSign(sign);
    setAdjustValue("50000");
    setAdjustOpen(true);
  };

  const applyAdjust = () => {
    const v = Math.abs(Number(String(adjustValue || "0").replace(/[^\d]/g, ""))) || 0;
    if (!adjustGoalId || v <= 0) {
      setAdjustOpen(false);
      return;
    }
    depositToGoal(adjustGoalId, adjustSign * v);
    setAdjustOpen(false);
  };

  const filteredGoals = goals || [];

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
              {t.goals}
            </h1>
            <p className="text-sm" style={{ color: THEME.text.muted }}>
              {filteredGoals.length}
            </p>
          </div>

          <button
            onClick={openAddGoal}
            className="px-4 py-3 rounded-2xl font-semibold"
            style={{ background: THEME.gradient.primary, color: "#000" }}
          >
            + {t.add}
          </button>
        </div>

        <div className="space-y-3">
          {filteredGoals.length === 0 ? (
            <GlassCard className="p-6 text-center">
              <span className="text-5xl block mb-2">🎯</span>
              <p style={{ color: THEME.text.muted }}>{t.noGoals}</p>
            </GlassCard>
          ) : (
            filteredGoals.map((g) => {
              const pct = g.target ? Math.round((Number(g.current || 0) / Number(g.target || 1)) * 100) : 0;
              const done = pct >= 100;

              return (
                <GlassCard key={g.id} className="p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-start gap-3">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                        style={{ background: "rgba(139,92,246,0.18)" }}
                      >
                        {g.emoji || "🎯"}
                      </div>
                      <div>
                        <p className="font-semibold" style={{ color: THEME.text.primary }}>
                          {g.name}
                        </p>
                        <p className="text-sm" style={{ color: THEME.text.muted }}>
                          {formatUZS(g.current)} / {formatUZS(g.target)} UZS
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-xl font-bold" style={{ color: done ? THEME.accent.success : THEME.accent.purple }}>
                        {clamp(pct, 0, 999)}%
                      </p>
                      <div className="flex gap-2 justify-end mt-1">
                        <button onClick={() => openEditGoal(g)} className="text-xs" style={{ color: THEME.accent.info }}>
                          {t.edit}
                        </button>
                        <button
                          onClick={() => setPendingDeleteGoalId(g.id)} // ✅ no confirm()
                          className="text-xs"
                          style={{ color: THEME.accent.danger }}
                        >
                          {t.delete}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="h-3 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.1)" }}>
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: done ? THEME.gradient.success : THEME.gradient.purple }}
                      initial={false} // ✅ IMPORTANT
                      animate={{ width: `${clamp(pct, 0, 100)}%` }}
                      transition={{ duration: 0.6 }}
                    />
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <button
                      onClick={() => openAdjust(g.id, +1)} // ✅ replaces prompt deposit
                      className="py-3 rounded-2xl font-semibold"
                      style={{
                        background: "rgba(34,197,94,0.16)",
                        color: THEME.accent.success,
                        border: "1px solid rgba(255,255,255,0.06)",
                      }}
                    >
                      + {I18N[lang]?.deposit || "Deposit"}
                    </button>

                    <button
                      onClick={() => openAdjust(g.id, -1)} // ✅ replaces prompt withdraw
                      className="py-3 rounded-2xl font-semibold"
                      style={{
                        background: "rgba(239,68,68,0.14)",
                        color: THEME.accent.danger,
                        border: "1px solid rgba(255,255,255,0.06)",
                      }}
                    >
                      − {I18N[lang]?.withdraw || "Withdraw"}
                    </button>
                  </div>
                </GlassCard>
              );
            })
          )}
        </div>

        <div className="mt-6">
          <GlassCard className="p-5">
            <p className="font-semibold mb-3" style={{ color: THEME.text.primary }}>
              {goalForm.id ? t.edit : t.add}
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="text-xs block mb-1" style={{ color: THEME.text.muted }}>
                  {t.description}
                </label>
                <input
                  value={goalForm.name}
                  onChange={(e) => setGoalForm((p) => ({ ...p, name: e.target.value }))}
                  className="w-full p-4 rounded-2xl"
                  style={{ background: THEME.bg.input, color: THEME.text.primary, border: "1px solid rgba(255,255,255,0.06)" }}
                  placeholder="Masalan: Telefon"
                />
              </div>

              <div>
                <label className="text-xs block mb-1" style={{ color: THEME.text.muted }}>
                  {t.amount} (UZS)
                </label>
                {/* ✅ Telegram-safe numeric input */}
                <input
                  value={goalForm.target}
                  onChange={(e) => {
                    const v = e.target.value.replace(/[^\d]/g, "");
                    setGoalForm((p) => ({ ...p, target: v }));
                  }}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  className="w-full p-4 rounded-2xl"
                  style={{ background: THEME.bg.input, color: THEME.text.primary, border: "1px solid rgba(255,255,255,0.06)" }}
                  placeholder="5000000"
                />
              </div>

              <div>
                <label className="text-xs block mb-1" style={{ color: THEME.text.muted }}>
                  Saved (UZS)
                </label>
                {/* ✅ Telegram-safe numeric input */}
                <input
                  value={goalForm.current}
                  onChange={(e) => {
                    const v = e.target.value.replace(/[^\d]/g, "");
                    setGoalForm((p) => ({ ...p, current: v }));
                  }}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  className="w-full p-4 rounded-2xl"
                  style={{ background: THEME.bg.input, color: THEME.text.primary, border: "1px solid rgba(255,255,255,0.06)" }}
                  placeholder="0"
                />
              </div>

              <div className="col-span-2">
                <label className="text-xs block mb-1" style={{ color: THEME.text.muted }}>
                  Emoji
                </label>
                <input
                  value={goalForm.emoji}
                  onChange={(e) => setGoalForm((p) => ({ ...p, emoji: e.target.value }))}
                  className="w-full p-4 rounded-2xl"
                  style={{ background: THEME.bg.input, color: THEME.text.primary, border: "1px solid rgba(255,255,255,0.06)" }}
                  placeholder="🎯"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setGoalForm({ id: null, name: "", target: "", current: "", emoji: "🎯" })}
                className="flex-1 py-3 rounded-2xl font-semibold"
                style={{ background: THEME.bg.card, color: THEME.text.secondary, border: "1px solid rgba(255,255,255,0.06)" }}
              >
                {t.cancel}
              </button>
              <button onClick={saveGoal} className="flex-1 py-3 rounded-2xl font-semibold" style={{ background: THEME.gradient.primary, color: "#000" }}>
                {t.save}
              </button>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* ✅ Deposit/Withdraw Modal */}
      {adjustOpen && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center p-4" style={{ background: "rgba(0,0,0,0.55)" }}>
          <div className="w-full max-w-md rounded-3xl p-4" style={{ background: THEME.bg.card }}>
            <h3 className="text-lg font-bold mb-3" style={{ color: THEME.text.primary }}>
              {adjustSign > 0 ? (I18N[lang]?.deposit || "Deposit") : (I18N[lang]?.withdraw || "Withdraw")} (UZS)
            </h3>

            <input
              value={adjustValue}
              onChange={(e) => setAdjustValue(e.target.value.replace(/[^\d]/g, ""))}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              className="w-full p-4 rounded-2xl"
              style={{ background: THEME.bg.input, color: THEME.text.primary, border: "1px solid rgba(255,255,255,0.06)" }}
              placeholder="50000"
              autoFocus
            />

            <div className="flex gap-2 mt-3">
              <button
                onClick={() => setAdjustOpen(false)}
                className="flex-1 py-3 rounded-2xl"
                style={{ background: "rgba(255,255,255,0.08)", color: THEME.text.primary }}
              >
                {t.cancel}
              </button>
              <button
                onClick={applyAdjust}
                className="flex-1 py-3 rounded-2xl font-semibold"
                style={{ background: THEME.gradient.primary, color: "#000" }}
              >
                {t.save}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Delete Confirm Modal */}
      {pendingDeleteGoalId && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center p-4" style={{ background: "rgba(0,0,0,0.55)" }}>
          <div className="w-full max-w-md rounded-3xl p-4" style={{ background: THEME.bg.card }}>
            <h3 className="text-lg font-bold mb-3" style={{ color: THEME.text.primary }}>
              {t.confirmDelete}
            </h3>

            <div className="flex gap-2">
              <button
                onClick={() => setPendingDeleteGoalId(null)}
                className="flex-1 py-3 rounded-2xl"
                style={{ background: "rgba(255,255,255,0.08)", color: THEME.text.primary }}
              >
                {t.cancel}
              </button>
              <button
                onClick={() => {
                  deleteGoal(pendingDeleteGoalId); // IMPORTANT: deleteGoal must NOT use confirm() inside
                  setPendingDeleteGoalId(null);
                }}
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
// Settings screen (FIXED: Telegram-safe)
// - initial={false} (no jump)
// - remove confirm() -> modal
// ---------------------------

export default GoalsScreen;
