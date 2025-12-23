import React, { useMemo, useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import GlassCard from "../components/ui/GlassCard";
import ModalShell from "../components/ui/ModalShell";

const AnalyticsScreen = (props) => (
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
        <div className="flex-1">
          <h1 className="text-2xl font-bold" style={{ color: THEME.text.primary }}>
            {t.analytics}
          </h1>
          <p className="text-sm" style={{ color: THEME.text.muted }}>
            {t.weekSpending}: {formatUZS(weekSpend)} • {t.monthSpending}: {formatUZS(monthSpend)}
          </p>
        </div>
      </div>

      <GlassCard className="p-5 mb-4">
        <h3 className="font-semibold mb-4" style={{ color: THEME.text.primary }}>
          {t.topCategories} ({month})
        </h3>
        <div className="space-y-3">
          {topCats.length === 0 ? (
            <p style={{ color: THEME.text.muted }}>{t.empty}</p>
          ) : (
            topCats.map((x, i) => (
              <div key={x.categoryId} className="flex items-center gap-3">
                <span className="text-lg">{x.cat.emoji}</span>
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm" style={{ color: THEME.text.primary }}>
                      {catLabel(x.cat)}
                    </span>
                    <span className="text-sm font-semibold" style={{ color: x.cat.color }}>
                      {formatUZS(x.spent)} UZS
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.1)" }}>
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: x.cat.color }}
                      initial={false}                 // ✅ IMPORTANT (bars also)
                      animate={{ width: `${clamp((x.spent / Math.max(1, monthSpend)) * 100, 2, 100)}%` }}
                      transition={{ delay: i * 0.06 }}
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </GlassCard>

      <GlassCard className="p-5">
        <h3 className="font-semibold mb-3" style={{ color: THEME.text.primary }}>
          {t.weekSpending} / {t.monthSpending}
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl" style={{ background: "rgba(239,68,68,0.10)" }}>
            <p className="text-xs" style={{ color: THEME.text.muted }}>
              {t.weekSpending}
            </p>
            <p className="text-xl font-bold" style={{ color: THEME.accent.danger }}>
              -{formatUZS(weekSpend)} UZS
            </p>
          </div>
          <div className="p-4 rounded-2xl" style={{ background: "rgba(239,68,68,0.10)" }}>
            <p className="text-xs" style={{ color: THEME.text.muted }}>
              {t.monthSpending}
            </p>
            <p className="text-xl font-bold" style={{ color: THEME.accent.danger }}>
              -{formatUZS(monthSpend)} UZS
            </p>
          </div>
        </div>
      </GlassCard>
    </div>
  </motion.div>
);

// ---------------------------
// Debts screen (FIXED: Telegram-safe - no re-anim on resize)
// ---------------------------

export default AnalyticsScreen;
