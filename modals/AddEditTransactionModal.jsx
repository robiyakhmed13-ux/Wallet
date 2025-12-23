import React, { useMemo } from "react";
import ModalShell from "../components/ui/ModalShell";
import { THEME } from "../data/theme";

export default function AddEditTransactionModal({
  t,
  lang,
  allCats,
  getCat,
  catLabel,
  txForm,
  setTxForm,
  editTxId,
  onClose,
  onSaveTx,
}) {
  const txModalType = txForm.type;
  const txModalCats = useMemo(
    () =>
      txModalType === "expense"
        ? allCats.expense
        : txModalType === "income"
        ? allCats.income
        : allCats.debt,
    [txModalType, allCats]
  );

  const setTxType = (newType) => {
    const defaultCat =
      newType === "expense"
        ? allCats.expense[0]?.id || "food"
        : newType === "income"
        ? allCats.income[0]?.id || "salary"
        : allCats.debt[0]?.id || "borrowed";
    setTxForm((p) => ({ ...p, type: newType, categoryId: defaultCat }));
  };

  return (
    <ModalShell onClose={onClose} mode="bottom">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-bold" style={{ color: THEME.text.primary }}>
          {editTxId ? t.editTransaction : t.addTransaction}
        </h2>
        <button onClick={onClose} style={{ color: THEME.text.muted }}>
          ✕
        </button>
      </div>

      <div className="flex gap-2 my-4">
        {[
          { k: "expense", label: t.expense, icon: "↘" },
          { k: "income", label: t.incomeType, icon: "↗" },
          { k: "debt", label: t.debtType, icon: "💳" },
        ].map((x) => (
          <button
            key={x.k}
            onClick={() => setTxType(x.k)}
            className="flex-1 py-3 rounded-xl flex items-center justify-center gap-2"
            style={{
              background:
                txModalType === x.k ? "rgba(249,115,22,0.18)" : THEME.bg.card,
              color:
                txModalType === x.k ? THEME.accent.primary : THEME.text.secondary,
              border: "1px solid rgba(255,255,255,0.05)",
            }}
          >
            <span>{x.icon}</span>
            <span className="text-sm font-semibold">{x.label}</span>
          </button>
        ))}
      </div>

      <div className="space-y-3">
        <div>
          <label className="text-sm block mb-2" style={{ color: THEME.text.muted }}>
            {t.amount} (UZS)
          </label>
          <input
            value={txForm.amount}
            onChange={(e) => setTxForm((p) => ({ ...p, amount: e.target.value }))}
            type="number"
            className="w-full p-4 rounded-2xl"
            style={{
              background: THEME.bg.input,
              color: THEME.text.primary,
              border: "1px solid rgba(255,255,255,0.06)",
            }}
            placeholder="15000"
          />
        </div>

        <div>
          <label className="text-sm block mb-2" style={{ color: THEME.text.muted }}>
            {t.description}
          </label>
          <input
            value={txForm.description}
            onChange={(e) =>
              setTxForm((p) => ({ ...p, description: e.target.value }))
            }
            type="text"
            className="w-full p-4 rounded-2xl"
            style={{
              background: THEME.bg.input,
              color: THEME.text.primary,
              border: "1px solid rgba(255,255,255,0.06)",
            }}
            placeholder={catLabel(getCat(txForm.categoryId))}
          />
        </div>

        <div>
          <label className="text-sm block mb-2" style={{ color: THEME.text.muted }}>
            {t.date}
          </label>
          <input
            value={txForm.date}
            onChange={(e) => setTxForm((p) => ({ ...p, date: e.target.value }))}
            type="date"
            className="w-full p-4 rounded-2xl"
            style={{
              background: THEME.bg.input,
              color: THEME.text.primary,
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          />
        </div>

        <div>
          <label className="text-sm block mb-2" style={{ color: THEME.text.muted }}>
            {t.category}
          </label>
          <div className="grid grid-cols-4 gap-2">
            {txModalCats.map((c) => (
              <button
                key={c.id}
                onClick={() => setTxForm((p) => ({ ...p, categoryId: c.id }))}
                className="p-3 rounded-2xl flex flex-col items-center gap-1"
                style={{
                  background:
                    txForm.categoryId === c.id ? `${c.color}30` : THEME.bg.card,
                  border:
                    txForm.categoryId === c.id
                      ? `2px solid ${c.color}`
                      : "2px solid transparent",
                }}
              >
                <span className="text-xl">{c.emoji}</span>
                <span
                  className="text-[11px] w-full truncate text-center"
                  style={{ color: THEME.text.secondary }}
                >
                  {catLabel(c)}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-3">
          <button
            onClick={onClose}
            className="flex-1 py-4 rounded-2xl font-semibold"
            style={{
              background: THEME.bg.card,
              color: THEME.text.secondary,
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            {t.cancel}
          </button>
          <button
            onClick={onSaveTx}
            className="flex-1 py-4 rounded-2xl font-semibold"
            style={{ background: THEME.gradient.primary, color: "#000" }}
          >
            {t.save}
          </button>
        </div>
      </div>
    </ModalShell>
  );
}
