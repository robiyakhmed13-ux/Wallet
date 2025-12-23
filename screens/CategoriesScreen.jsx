import React, { useMemo, useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import GlassCard from "../components/ui/GlassCard";
import ModalShell from "../components/ui/ModalShell";

const CategoriesScreen = (props) => {
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

  const [activeType, setActiveType] = useState("expense");
  const list = allCats[activeType] || [];

  const [editInlineId, setEditInlineId] = useState(null);
  const [editName, setEditName] = useState("");

  // Add Category modal state (replaces prompt())
  const [showAddCat, setShowAddCat] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatEmoji, setNewCatEmoji] = useState("📦");
  const [newCatColor, setNewCatColor] = useState("#90A4AE");

  // Delete confirm modal state (replaces confirm())
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

  const startInlineEdit = (cat) => {
    setEditInlineId(cat.id);
    setEditName(catLabel(cat));
  };

  const saveInlineEdit = (cat) => {
    const name = (editName || "").trim();
    if (!name) return;

    setCategories((prev) => {
      const copy = { ...prev, [activeType]: [...(prev[activeType] || [])] };
      const idx = copy[activeType].findIndex((c) => c.id === cat.id);
      if (idx >= 0) {
        const old = copy[activeType][idx];
        const patch = lang === "uz" ? { uz: name } : lang === "ru" ? { ru: name } : { en: name };
        copy[activeType][idx] = { ...old, ...patch, custom: true };
      }
      return copy;
    });

    setEditInlineId(null);
    setEditName("");
    showToast("✓", true);
  };

  const cancelInlineEdit = () => {
    setEditInlineId(null);
    setEditName("");
  };

  const openAddCategory = () => {
    setNewCatName("");
    setNewCatEmoji("📦");
    setNewCatColor("#90A4AE");
    setShowAddCat(true);
  };

  const saveNewCategory = () => {
    const nm = String(newCatName || "").trim();
    if (!nm) return;

    const newId = uid().slice(0, 8);
    const safeEmoji = String(newCatEmoji || "📦").trim() || "📦";
    const safeColor = String(newCatColor || "#90A4AE").trim() || "#90A4AE";

    const newCat = {
      id: newId,
      uz: nm,
      ru: nm,
      en: nm,
      emoji: safeEmoji,
      color: safeColor,
      custom: true,
    };

    setCategories((prev) => {
      const copy = { ...prev, [activeType]: [...(prev[activeType] || [])] };
      copy[activeType].unshift(newCat);
      return copy;
    });

    setShowAddCat(false);
    showToast("✓", true);
  };

  const requestDeleteCategory = (catId) => {
    // Telegram-safe: open our modal, not confirm()
    setPendingDeleteId(catId);
  };

  const confirmDeleteCategory = () => {
    const catId = pendingDeleteId;
    if (!catId) return;

    // prevent deleting if used
    const usedTx = transactions.some((x) => x.categoryId === catId);
    const usedLim = limits.some((x) => x.categoryId === catId);
    if (usedTx || usedLim) {
      setPendingDeleteId(null);
      showToast("⚠️ Used", false);
      return;
    }

    setCategories((prev) => {
      const copy = { ...prev, [activeType]: [...(prev[activeType] || [])] };
      copy[activeType] = copy[activeType].filter((c) => c.id !== catId);
      return copy;
    });

    setPendingDeleteId(null);
    showToast("✓", true);
  };

  const cancelDeleteCategory = () => setPendingDeleteId(null);

  return (
    <motion.div
      initial={{ x: "100%" }}
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
              {t.categories}
            </h1>
            <p className="text-sm" style={{ color: THEME.text.muted }}>
              {list.length}
            </p>
          </div>

          <button
            onClick={openAddCategory}
            className="px-4 py-3 rounded-2xl font-semibold"
            style={{ background: THEME.gradient.primary, color: "#000" }}
          >
            + {t.addCategory}
          </button>
        </div>

        <div className="flex gap-2 mb-4">
          {[
            { key: "expense", label: t.expense, icon: "↘", count: allCats.expense.length },
            { key: "income", label: t.incomeType, icon: "↗", count: allCats.income.length },
            { key: "debt", label: t.debtType, icon: "💳", count: allCats.debt.length },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setActiveType(tab.key);
                cancelInlineEdit();
              }}
              className="flex-1 py-3 rounded-xl flex items-center justify-center gap-2 transition-all"
              style={{
                background: activeType === tab.key ? THEME.bg.card : "transparent",
                color: activeType === tab.key ? THEME.text.primary : THEME.text.muted,
                border: `1px solid ${activeType === tab.key ? "rgba(255,255,255,0.1)" : "transparent"}`,
              }}
            >
              <span>{tab.icon}</span>
              <span className="text-sm font-medium">{tab.label}</span>
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(255,255,255,0.1)" }}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div className="space-y-2">
          {list.length === 0 ? (
            <GlassCard className="p-6 text-center">
              <span className="text-5xl block mb-2">📁</span>
              <p style={{ color: THEME.text.muted }}>{t.noCategories}</p>
            </GlassCard>
          ) : (
            list.map((cat) => (
              <GlassCard key={cat.id} className="p-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-xl"
                    style={{ background: `${cat.color}30` }}
                  >
                    {cat.emoji}
                  </div>

                  <div className="flex-1 min-w-0">
                    {editInlineId === cat.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="flex-1 p-3 rounded-xl"
                          style={{
                            background: THEME.bg.input,
                            color: THEME.text.primary,
                            border: "1px solid rgba(255,255,255,0.06)",
                          }}
                          autoFocus
                        />
                        <button
                          onClick={() => saveInlineEdit(cat)}
                          className="w-10 h-10 rounded-xl flex items-center justify-center"
                          style={{ background: "rgba(34,197,94,0.18)" }}
                          title="Save"
                        >
                          💾
                        </button>
                        <button
                          onClick={cancelInlineEdit}
                          className="w-10 h-10 rounded-xl flex items-center justify-center"
                          style={{ background: "rgba(239,68,68,0.18)" }}
                          title="Cancel"
                        >
                          ✖
                        </button>
                      </div>
                    ) : (
                      <>
                        <p className="font-medium truncate" style={{ color: THEME.text.primary }}>
                          {catLabel(cat)}
                        </p>
                        <p className="text-xs" style={{ color: THEME.text.muted }}>
                          {activeType === "expense" ? `${formatUZS(monthSpentByCategory(cat.id))} UZS (month)` : ""}
                        </p>
                      </>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => startInlineEdit(cat)}
                      className="w-9 h-9 rounded-lg flex items-center justify-center"
                      style={{ background: "rgba(56, 189, 248, 0.18)" }}
                      title={t.edit}
                    >
                      <span style={{ color: THEME.accent.info }}>✏️</span>
                    </button>

                    <button
                      onClick={() => requestDeleteCategory(cat.id)}
                      className="w-9 h-9 rounded-lg flex items-center justify-center"
                      style={{ background: "rgba(239, 68, 68, 0.18)" }}
                      title={t.delete}
                    >
                      <span style={{ color: THEME.accent.danger }}>🗑️</span>
                    </button>
                  </div>
                </div>
              </GlassCard>
            ))
          )}
        </div>
      </div>

      {/* Add Category Modal */}
      {showAddCat && (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center p-4"
          style={{ background: "rgba(0,0,0,0.55)" }}
        >
          <div className="w-full max-w-md rounded-3xl p-4" style={{ background: THEME.bg.card }}>
            <h3 className="text-lg font-bold mb-3" style={{ color: THEME.text.primary }}>
              {t.addCategory}
            </h3>

            <input
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              placeholder={t.description}
              className="w-full p-3 rounded-xl mb-2"
              style={{
                background: THEME.bg.input,
                color: THEME.text.primary,
                border: "1px solid rgba(255,255,255,0.06)",
              }}
              autoFocus
            />

            <div className="flex gap-2">
              <input
                value={newCatEmoji}
                onChange={(e) => setNewCatEmoji(e.target.value)}
                className="w-24 p-3 rounded-xl"
                style={{
                  background: THEME.bg.input,
                  color: THEME.text.primary,
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
                placeholder="📦"
              />
              <input
                value={newCatColor}
                onChange={(e) => setNewCatColor(e.target.value)}
                className="flex-1 p-3 rounded-xl"
                style={{
                  background: THEME.bg.input,
                  color: THEME.text.primary,
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
                placeholder="#90A4AE"
              />
            </div>

            <div className="flex gap-2 mt-3">
              <button
                onClick={() => setShowAddCat(false)}
                className="flex-1 py-3 rounded-2xl"
                style={{ background: "rgba(255,255,255,0.08)", color: THEME.text.primary }}
              >
                {t.cancel}
              </button>
              <button
                onClick={saveNewCategory}
                className="flex-1 py-3 rounded-2xl font-semibold"
                style={{ background: THEME.gradient.primary, color: "#000" }}
              >
                {t.save}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {pendingDeleteId && (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center p-4"
          style={{ background: "rgba(0,0,0,0.55)" }}
        >
          <div className="w-full max-w-md rounded-3xl p-4" style={{ background: THEME.bg.card }}>
            <h3 className="text-lg font-bold mb-2" style={{ color: THEME.text.primary }}>
              {t.confirmDelete}
            </h3>
            <p className="text-sm mb-3" style={{ color: THEME.text.muted }}>
              {t.delete}?
            </p>

            <div className="flex gap-2">
              <button
                onClick={cancelDeleteCategory}
                className="flex-1 py-3 rounded-2xl"
                style={{ background: "rgba(255,255,255,0.08)", color: THEME.text.primary }}
              >
                {t.cancel}
              </button>
              <button
                onClick={confirmDeleteCategory}
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

// ✅ PATCH 1: stop re-animating on every re-render (Telegram keyboard resize)

export default CategoriesScreen;
