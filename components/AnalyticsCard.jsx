import React from "react";
import { motion } from "framer-motion";
import { THEME } from "../data/theme";
import { formatUZS } from "../utils/format";

const AnalyticsCard = ({ t, weekSpend, monthSpend, onOpenAnalytics }) => (
    <div className="px-5 mb-4">
      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={onOpenAnalytics}
        className="w-full p-5 rounded-2xl flex items-center gap-4"
        style={{ background: THEME.bg.card, border: "1px solid rgba(255,255,255,0.05)" }}
      >
        <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{ background: THEME.gradient.purple }}>
          <span className="text-2xl">📈</span>
        </div>
        <div className="text-left flex-1">
          <p className="font-semibold" style={{ color: THEME.text.primary }}>
            {t.analytics}
          </p>
          <p className="text-sm" style={{ color: THEME.text.muted }}>
            {t.weekSpending}: {formatUZS(weekSpend)} • {t.monthSpending}: {formatUZS(monthSpend)}
          </p>
        </div>
        <span style={{ color: THEME.text.muted }}>→</span>
      </motion.button>
    </div>
  );

export default AnalyticsCard;
