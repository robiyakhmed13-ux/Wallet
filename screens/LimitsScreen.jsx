import React, { useMemo, useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import GlassCard from "../components/ui/GlassCard";
import ModalShell from "../components/ui/ModalShell";

const LimitsScreen = (props) => (
  <motion.div
    initial={false}              // <-- IMPORTANT
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
            {t.limits}
          </h1>
          <p className="text-sm" style={{ color: THEME.text.muted }}>
            {limits.length}
          </p>
        </div>

        <button
          onClick={openAddLimit}
          className="px-4 py-3 rounded-2xl font-semibold"
          style={{ background: THEME.gradient.primary, color: "#000" }}
        >
          + {t.limits}
        </button>
      </div>

      <div className="space-y-3">
        {limits.length === 0 ? (
          <GlassCard className="p-6 text-center">
            <span className="text-5xl block mb-2">🎯</span>
            <p style={{ color: THEME.text.muted }}>{t.noLimits}</p>
          </GlassCard>
        ) : (
          limits.map((l) => {
            const c = getCat(l.categoryId);
            const spent = monthSpentByCategory(l.categoryId);
            const pct = l.amount ? Math.round((spent / l.amount) * 100) : 0;
            const isOver = pct >= 100;
            const isNear = pct >= 80;

            return (
              <GlassCard key={l.id} className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-xl"
                      style={{ background: `${c.color}30` }}
                    >
                      {c.emoji}
                    </div>
                    <div>
                      <p className="font-semibold" style={{ color: THEME.text.primary }}>
                        {catLabel(c)}
                      </p>
                      <p className="text-sm" style={{ color: THEME.text.muted }}>
                        {formatUZS(spent)} / {formatUZS(l.amount)} UZS
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className="text-xl font-bold"
                      style={{
                        color: isOver ? THEME.accent.danger : isNear ? THEME.accent.warning : THEME.accent.success,
                      }}
                    >
                      {clamp(pct, 0, 999)}%
                    </p>
                    <div className="flex gap-2 justify-end mt-1">
                      <button onClick={() => openEditLimit(l)} className="text-xs" style={{ color: THEME.accent.info }}>
                        {t.edit}
                      </button>
                      <button onClick={() => deleteLimit(l.id)} className="text-xs" style={{ color: THEME.accent.danger }}>
                        {t.delete}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="h-3 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.1)" }}>
                  <motion.div
                    className="h-full rounded-full"
                    style={{
                      background: isOver
                        ? THEME.gradient.danger
                        : isNear
                        ? "linear-gradient(90deg, #FBBF24, #F59E0B)"
                        : `linear-gradient(90deg, ${c.color}, ${c.color}88)`,
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: `${clamp(pct, 0, 100)}%` }}
                    transition={{ duration: 0.6 }}
                  />
                </div>
              </GlassCard>
            );
          })
        )}
      </div>

      <div className="mt-6">
        <GlassCard className="p-5">
          <p className="font-semibold mb-3" style={{ color: THEME.text.primary }}>
            {limitForm.id ? t.edit : t.add}
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-xs block mb-1" style={{ color: THEME.text.muted }}>
                {t.category}
              </label>
              <select
                value={limitForm.categoryId}
                onChange={(e) => setLimitForm((p) => ({ ...p, categoryId: e.target.value }))}
                className="w-full p-4 rounded-2xl"
                style={{
                  background: THEME.bg.input,
                  color: THEME.text.primary,
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                {allCats.expense.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.emoji} {catLabel(c)}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-span-2">
              <label className="text-xs block mb-1" style={{ color: THEME.text.muted }}>
                {t.amount} (UZS)
              </label>

              {/* ✅ PATCH 2: Telegram-safe numeric input (NO type="number") */}
              <input
                value={limitForm.amount}
                onChange={(e) => {
                  const v = e.target.value.replace(/[^\d]/g, ""); // digits only
                  setLimitForm((p) => ({ ...p, amount: v }));
                }}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                className="w-full p-4 rounded-2xl"
                style={{
                  background: THEME.bg.input,
                  color: THEME.text.primary,
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
                placeholder="500000"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-4">
            <button
              onClick={() => setLimitForm({ id: null, categoryId: allCats.expense[0]?.id || "food", amount: "" })}
              className="flex-1 py-3 rounded-2xl font-semibold"
              style={{
                background: THEME.bg.card,
                color: THEME.text.secondary,
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              {t.cancel}
            </button>
            <button
              onClick={saveLimit}
              className="flex-1 py-3 rounded-2xl font-semibold"
              style={{ background: THEME.gradient.primary, color: "#000" }}
            >
              {t.save}
            </button>
          </div>
        </GlassCard>
      </div>
    </div>
  </motion.div>
);
  // ---------------------------
// Transactions screen (FIXED: Telegram-safe, no "jumping")
// ---------------------------

export default LimitsScreen;
