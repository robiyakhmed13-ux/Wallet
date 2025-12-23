import React, { useMemo, useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import GlassCard from "../components/ui/GlassCard";
import ModalShell from "../components/ui/ModalShell";

const DebtsScreen = (props) => {
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

  const debtTx = transactions.filter((x) => x.type === "debt");
  const owedByMe = debtTx.filter((x) => x.amount < 0).reduce((s, x) => s + Math.abs(x.amount), 0);
  const owedToMe = debtTx.filter((x) => x.amount > 0).reduce((s, x) => s + x.amount, 0);

  return (
    <motion.div
      initial={false}               // ✅ IMPORTANT
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
          <div>
            <h1 className="text-2xl font-bold" style={{ color: THEME.text.primary }}>
              {t.debts}
            </h1>
            <p className="text-sm" style={{ color: THEME.text.muted }}>
              {debtTx.length}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <GlassCard className="p-4 text-center" gradient="linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(239, 68, 68, 0.05) 100%)">
            <p className="text-xs mb-1" style={{ color: THEME.text.muted }}>
              Men qarzdorman
            </p>
            <p className="text-xl font-bold" style={{ color: THEME.accent.danger }}>
              {formatUZS(owedByMe)} UZS
            </p>
          </GlassCard>

          <GlassCard className="p-4 text-center" gradient="linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(34, 197, 94, 0.05) 100%)">
            <p className="text-xs mb-1" style={{ color: THEME.text.muted }}>
              Menga qarzdor
            </p>
            <p className="text-xl font-bold" style={{ color: THEME.accent.success }}>
              {formatUZS(owedToMe)} UZS
            </p>
          </GlassCard>
        </div>

        <button
          onClick={() => openAddTx("debt")}
          className="w-full py-4 rounded-2xl font-semibold mb-6"
          style={{ background: THEME.gradient.primary, color: "#000" }}
        >
          + {t.addTransaction}
        </button>

        <div className="space-y-2">
          {debtTx.length === 0 ? (
            <div className="text-center py-12">
              <span className="text-6xl mb-4 block">💳</span>
              <p style={{ color: THEME.text.muted }}>{t.empty}</p>
            </div>
          ) : (
            debtTx.map((tx) => {
              const c = getCat(tx.categoryId);
              return (
                <GlassCard key={tx.id} className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style={{ background: `${c.color}20` }}>
                      {c.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate" style={{ color: THEME.text.primary }}>
                        {tx.description}
                      </p>
                      <p className="text-xs" style={{ color: THEME.text.muted }}>
                        {tx.date} • {catLabel(c)}
                      </p>
                    </div>
                    <p className="font-bold" style={{ color: tx.amount > 0 ? THEME.accent.success : THEME.accent.danger }}>
                      {tx.amount > 0 ? "+" : ""}
                      {formatUZS(tx.amount)} UZS
                    </p>
                  </div>
                </GlassCard>
              );
            })
          )}
        </div>
      </div>
    </motion.div>
  );
};

  // ---------------------------
// Goals screen (FIXED: Telegram-safe)
// - no prompt()
// - no type="number" (use inputMode numeric)
// - motion initial={false} (no re-animate jump)
// - delete confirm modal (optional, Telegram-safe)
// ---------------------------

export default DebtsScreen;
