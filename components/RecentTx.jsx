import React from "react";
import GlassCard from "./ui/GlassCard";
import { THEME } from "../data/theme";
import { formatUZS } from "../utils/format";

const RecentTx = ({ t, transactions, getCat, catLabel, openAddTx, openEditTx, removeTx, onOpenTransactions, openBot }) => (
    <div className="px-5 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold" style={{ color: THEME.text.primary }}>
          {t.allTransactions}
        </h3>
        <button onClick={onOpenTransactions} className="text-sm font-medium" style={{ color: THEME.accent.primary }}>
          {t.all}
        </button>
      </div>

      <div className="space-y-2">
        {transactions.slice(0, 5).length === 0 ? (
          <GlassCard className="p-6 text-center">
            <span className="text-5xl block mb-2">📝</span>
            <p style={{ color: THEME.text.muted }}>{t.empty}</p>
            <div className="mt-4">
              <button
                onClick={() => openAddTx("expense")}
                className="px-4 py-3 rounded-2xl font-semibold"
                style={{ background: THEME.gradient.primary, color: "#000" }}
              >
                {t.addTransaction}
              </button>
            </div>
          </GlassCard>
        ) : (
          transactions.slice(0, 5).map((tx) => {
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

                  <div className="text-right">
                    <p className="font-bold" style={{ color: tx.amount > 0 ? THEME.accent.success : THEME.accent.danger }}>
                      {tx.amount > 0 ? "+" : ""}
                      {formatUZS(tx.amount)} UZS
                    </p>
                    <div className="flex gap-2 justify-end mt-1">
                      <button onClick={() => openEditTx(tx)} className="text-xs" style={{ color: THEME.accent.info }}>
                        {t.edit}
                      </button>
                      <button onClick={() => removeTx(tx)} className="text-xs" style={{ color: THEME.accent.danger }}>
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

      <div className="mt-4">
        <GlassCard className="p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-semibold" style={{ color: THEME.text.primary }}>
                🤖
              </p>
              <p className="text-sm" style={{ color: THEME.text.muted }}>
                {t.botHint}
              </p>
            </div>
            <button
              onClick={openBot}
              className="px-4 py-3 rounded-2xl font-semibold"
              style={{
                background: "rgba(249,115,22,0.15)",
                color: THEME.accent.primary,
                border: "1px solid rgba(255,255,255,0.05)",
              }}
            >
              {t.openBot}
            </button>
          </div>
        </GlassCard>
      </div>
    </div>
  );

export default RecentTx;
