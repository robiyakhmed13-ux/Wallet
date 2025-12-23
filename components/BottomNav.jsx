import React from "react";
import { motion } from "framer-motion";
import { THEME } from "../data/theme";

const BottomNav = ({ tab, setTab }) => (
  <div
    className="fixed bottom-0 left-0 right-0 z-40 px-4 pb-4"
    style={{ background: "linear-gradient(to top, rgba(15,15,20,0.95), rgba(15,15,20,0.0))" }}
  >
    <div
      className="mx-auto max-w-md rounded-3xl p-2 flex items-center justify-between"
      style={{ background: "rgba(28,28,38,0.9)", border: "1px solid rgba(255,255,255,0.06)" }}
    >
      {[
        { label: t.home, icon: "🏠", onClick: () => {} },
        { label: t.transactions, icon: "🧾", onClick: () => setShowTransactionsScreen(true) },
        { label: t.add, icon: "➕", onClick: () => openAddTx("expense"), primary: true },
        { label: t.debts, icon: "💳", onClick: () => setShowDebtsScreen(true) },
        { label: t.settings, icon: "⚙️", onClick: () => setShowSettingsScreen(true) },
      ].map((x, i) => (
        <button
          key={i}
          onClick={x.onClick}
          className="flex-1 py-3 rounded-2xl flex flex-col items-center justify-center gap-1"
          style={{
            background: x.primary ? THEME.gradient.primary : "transparent",
            color: x.primary ? "#000" : THEME.text.secondary,
            margin: x.primary ? "0 6px" : 0,
          }}
        >
          <span className="text-xl">{x.icon}</span>
          <span className="text-[11px] font-semibold">{x.label}</span>
        </button>
      ))}
    </div>
  </div>
);

export default BottomNav;
