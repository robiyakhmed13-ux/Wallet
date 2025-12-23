import React from "react";
import { motion } from "framer-motion";
import { THEME } from "../data/theme";

const QuickActions = ({ t, openAddTx, onOpenCategories, onOpenLimits }) => (
    <div className="px-5 mb-4">
      <div className="grid grid-cols-2 gap-3">
        {[
          { icon: "➕", label: t.addExpense, action: () => openAddTx("expense"), grad: THEME.gradient.primary },
          { icon: "💰", label: t.addIncome, action: () => openAddTx("income"), grad: THEME.gradient.success },
         { icon: "📁", label: t.categories, action: onOpenCategories, grad: THEME.gradient.blue },
         { icon: "🎯", label: t.limits, action: onOpenLimits, grad: "linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%)" },
        ].map((x, i) => (
          <motion.button
            key={i}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={x.action}
            className="p-4 rounded-2xl flex flex-col items-center gap-2"
            style={{ background: THEME.bg.card, border: "1px solid rgba(255,255,255,0.05)" }}
          >
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ background: x.grad }}>
              {x.icon}
            </div>
            <span className="text-sm font-medium" style={{ color: THEME.text.primary }}>
              {x.label}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );

export default QuickActions;
