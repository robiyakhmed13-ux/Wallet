import React, { useMemo, useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import GlassCard from "../components/ui/GlassCard";
import ModalShell from "../components/ui/ModalShell";

const TransactionsScreen = (props) => {
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

  const [filter, setFilter] = useState("all"); // all|expense|income|debt|today|week|month

  // ✅ include today/weekStart/month in deps, and guard month startsWith
  const filtered = useMemo(() => {
    const base = [...transactions];
    if (filter === "all") return base;
    if (filter === "expense") return base.filter((x) => x.type === "expense");
    if (filter === "income") return base.filter((x) => x.type === "income");
    if (filter === "debt") return base.filter((x) => x.type === "debt");
    if (filter === "today") return base.filter((x) => x.date === today);
    if (filter === "week") return base.filter((x) => x.date >= weekStart);
    if (filter === "month") return base.filter((x) => String(x.date || "").startsWith(month));
    return base;
  }, [filter, transactions, today, weekStart, month]);

  // ✅ Telegram-safe delete confirmation (NO confirm())
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

  const requestDelete = (txId) => setPendingDeleteId(txId);

  const confirmDelete = () => {
    const txId = pendingDeleteId;
    if (!txId) return;

    const tx = transactions.find((x) => x.id === txId);
    if (tx) removeTx(tx); // IMPORTANT: removeTx must NOT call confirm() inside

    setPendingDeleteId(null);
  };

  const cancelDelete = () => setPendingDeleteId(null);

  return (
    <motion.div
      initial={false} // ✅ IMPORTANT: prevents re-running slide-in on Telegram keyboard resize
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
              {t.allTransactions}
            </h1>
            <p className="text-sm" style={{ color: THEME.text.muted }}>
              {filtered.length} / {transactions.length}
            </p>
          </div>

          <button
            onClick={() => openAddTx("expense")}
            className="px-4 py-3 rounded-2xl font-semibold"
            style={{ background: THEME.gradient.primary, color: "#000" }}
          >
            + {t.add}
          </button>
        </div>

        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {[
            { k: "all", label: t.all },
            { k: "expense", label: t.expense },
            { k: "income", label: t.incomeType },
            { k: "debt", label: t.debtType },
            { k: "today", label: t.today },
            { k: "week", label: t.week },
            { k: "month", label: t.month },
          ].map((x) => (
            <button
              key={x.k}
              onClick={() => setFilter(x.k)}
              className="px-4 py-2 rounded-xl whitespace-nowrap text-sm font-medium"
              style={{
                background: filter === x.k ? THEME.accent.primary : THEME.bg.card,
                color: filter === x.k ? "#000" : THEME.text.secondary,
              }}
            >
              {x.label}
            </button>
          ))}
        </div>

        <div className="space-y-2">
          {filtered.length === 0 ? (
            <GlassCard className="p-6 text-center">
              <span className="text-5xl block mb-2">📝</span>
              <p style={{ color: THEME.text.muted }}>{t.empty}</p>
            </GlassCard>
          ) : (
            filtered.map((tx) => {
              const c = getCat(tx.categoryId);
              return (
                <GlassCard key={tx.id} className="p-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-xl"
                      style={{ background: `${c.color}30` }}
                    >
                      {c.emoji}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate" style={{ color: THEME.text.primary }}>
                        {tx.description}
                      </p>
                      <p className="text-xs" style={{ color: THEME.text.muted }}>
                        {tx.date} • {catLabel(c)} • {tx.source || "app"}
                      </p>
                    </div>

                    <div className="text-right">
                      <p
                        className="font-bold text-lg"
                        style={{ color: tx.amount > 0 ? THEME.accent.success : THEME.accent.danger }}
                      >
                        {tx.amount > 0 ? "+" : ""}
                        {formatUZS(tx.amount)} UZS
                      </p>

                      <div className="flex gap-2 justify-end mt-1">
                        <button onClick={() => openEditTx(tx)} className="text-xs" style={{ color: THEME.accent.info }}>
                          {t.edit}
                        </button>
                        <button
                          onClick={() => requestDelete(tx.id)}
                          className="text-xs"
                          style={{ color: THEME.accent.danger }}
                        >
                          {t.delete}
                        </button>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              );
            })
          )}
        </div>
      </div>

      {/* ✅ Telegram-safe delete modal */}
      {pendingDeleteId && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center p-4" style={{ background: "rgba(0,0,0,0.55)" }}>
          <div className="w-full max-w-md rounded-3xl p-4" style={{ background: THEME.bg.card }}>
            <h3 className="text-lg font-bold mb-3" style={{ color: THEME.text.primary }}>
              {t.confirmDelete}
            </h3>
            <div className="flex gap-2">
              <button
                onClick={cancelDelete}
                className="flex-1 py-3 rounded-2xl"
                style={{ background: "rgba(255,255,255,0.08)", color: THEME.text.primary }}
              >
                {t.cancel}
              </button>
              <button
                onClick={confirmDelete}
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
// Analytics screen (FIXED: Telegram-safe - no re-anim on resize)
// ---------------------------

export default TransactionsScreen;
