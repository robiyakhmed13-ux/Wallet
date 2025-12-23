import React from "react";
import GlassCard from "./ui/GlassCard";
import { THEME } from "../data/theme";
import { formatUZS } from "../utils/format";

const BalanceCard = ({ t, balance, useRemote, syncFromRemote }) => (
    <div className="px-5 mb-4">
      <GlassCard className="p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm mb-1" style={{ color: THEME.text.muted }}>
              {t.balance}
            </p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: THEME.accent.success }} />
              <h2 className="text-3xl font-bold" style={{ color: THEME.text.primary }}>
                {formatUZS(balance)} UZS
              </h2>
            </div>
          </div>

          <button
            onClick={syncFromRemote}
            className="px-4 py-3 rounded-2xl text-sm font-semibold"
            style={{
              background: useRemote ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.06)",
              color: useRemote ? THEME.accent.success : THEME.text.secondary,
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            🔄 {t.sync}
          </button>
        </div>

        <div className="mt-4 p-4 rounded-xl" style={{ background: "rgba(255,255,255,0.03)" }}>
          <p className="text-sm mb-3 text-center" style={{ color: THEME.text.muted }}>
            {t.todaySummary}
          </p>
          <div className="flex justify-around">
            <div className="text-center">
              <p className="text-xl font-bold" style={{ color: THEME.accent.danger }}>
                {todayExp ? `${formatUZS(todayExp)} UZS` : "0"}
              </p>
              <div className="flex items-center gap-1 justify-center">
                <span style={{ color: THEME.accent.danger }}>↘</span>
                <span className="text-xs" style={{ color: THEME.text.muted }}>
                  {t.expenses}
                </span>
              </div>
            </div>

            <div className="w-px" style={{ background: "rgba(255,255,255,0.1)" }} />

            <div className="text-center">
              <p className="text-xl font-bold" style={{ color: THEME.accent.success }}>
                {todayInc ? `${formatUZS(todayInc)} UZS` : "0"}
              </p>
              <div className="flex items-center gap-1 justify-center">
                <span style={{ color: THEME.accent.success }}>↗</span>
                <span className="text-xs" style={{ color: THEME.text.muted }}>
                  {t.income}
                </span>
              </div>
            </div>
          </div>
        </div>

        <p className="text-xs mt-3" style={{ color: THEME.text.muted }}>
          {t.dataMode}:{" "}
          <span style={{ color: useRemote ? THEME.accent.success : THEME.text.secondary }}>
            {useRemote ? t.remoteMode : t.localMode}
          </span>
          {sb.enabled() ? "" : " (no env)"}
        </p>
      </GlassCard>
    </div>
  );

export default BalanceCard;
