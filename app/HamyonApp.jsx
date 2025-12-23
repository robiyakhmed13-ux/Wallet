import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";

import { I18N } from "../data/i18n";
import { THEME } from "../data/theme";
import { DEFAULT_CATEGORIES } from "../data/defaultCategories";

import { uid } from "../utils/uid";
import { formatUZS } from "../utils/format";
import { todayISO, startOfWeekISO, monthPrefix } from "../utils/date";
import { clamp } from "../utils/math";
import { safeJSON } from "../utils/storage";

import { sb } from "../services/supabase";

import HomeScreen from "../screens/HomeScreen";
import CategoriesScreen from "../screens/CategoriesScreen";
import LimitsScreen from "../screens/LimitsScreen";
import TransactionsScreen from "../screens/TransactionsScreen";
import AnalyticsScreen from "../screens/AnalyticsScreen";
import DebtsScreen from "../screens/DebtsScreen";
import GoalsScreen from "../screens/GoalsScreen";
import SettingsScreen from "../screens/SettingsScreen";

import AddEditTransactionModal from "../modals/AddEditTransactionModal";
import BottomNav from "../components/BottomNav";

export default function HamyonApp() {
export default function HamyonApp() {
  const [lang, setLang] = useState(() => safeJSON.get("hamyon_lang", "uz"));
  const t = I18N[lang] || I18N.uz;

  // Telegram user
  const [tgUser, setTgUser] = useState(null);

  // Data mode
  const [remoteOk, setRemoteOk] = useState(false);
  const [dataMode, setDataMode] = useState(() => safeJSON.get("hamyon_dataMode", "auto")); // auto | local | remote

  // Core data
  const [balance, setBalance] = useState(() => safeJSON.get("hamyon_balance", 0));
  const [transactions, setTransactions] = useState(() => safeJSON.get("hamyon_transactions", []));
  const [limits, setLimits] = useState(() => safeJSON.get("hamyon_limits", []));
  const [goals, setGoals] = useState(() => safeJSON.get("hamyon_goals", []));
  const [categories, setCategories] = useState(() => safeJSON.get("hamyon_categories", DEFAULT_CATEGORIES));

  // UI state
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  const [showAddTx, setShowAddTx] = useState(false);
  const [editTxId, setEditTxId] = useState(null);

  const [showCategories, setShowCategories] = useState(false);
  const [showLimits, setShowLimitsScreen] = useState(false);
  const [showTransactions, setShowTransactionsScreen] = useState(false);
  const [showAnalytics, setShowAnalyticsScreen] = useState(false);
  const [showDebts, setShowDebtsScreen] = useState(false);
  const [showGoals, setShowGoalsScreen] = useState(false);
  const [showSettings, setShowSettingsScreen] = useState(false);

  // Forms
  const [txForm, setTxForm] = useState({
    type: "expense", // expense|income|debt
    amount: "",
    description: "",
    categoryId: "food",
    date: todayISO(),
  });

  const [limitForm, setLimitForm] = useState({ id: null, categoryId: "food", amount: "" });
  const [goalForm, setGoalForm] = useState({ id: null, name: "", target: "", current: "", emoji: "🎯" });

  // ---------------------------
  // Toast
  // ---------------------------
  const showToast = (msg, ok = true) => {
    setToast({ msg, ok });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2000);
  };

  // ---------------------------
  // Persist local changes
  // ---------------------------
  useEffect(() => safeJSON.set("hamyon_lang", lang), [lang]);
  useEffect(() => safeJSON.set("hamyon_dataMode", dataMode), [dataMode]);
  useEffect(() => safeJSON.set("hamyon_balance", balance), [balance]);
  useEffect(() => safeJSON.set("hamyon_transactions", transactions), [transactions]);
  useEffect(() => safeJSON.set("hamyon_limits", limits), [limits]);
  useEffect(() => safeJSON.set("hamyon_goals", goals), [goals]);
  useEffect(() => safeJSON.set("hamyon_categories", categories), [categories]);

  // ---------------------------
  // Telegram init
  // ---------------------------
  useEffect(() => {
    let u = null;
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();
      tg.setHeaderColor(THEME.bg.primary);
      tg.setBackgroundColor(THEME.bg.primary);
      u = tg.initDataUnsafe?.user || null;
    }
    if (!u) {
      u = { id: safeJSON.get("hamyon_uid", Date.now()), first_name: "User" };
      safeJSON.set("hamyon_uid", u.id);
    }
    setTgUser(u);
  }, []);

  // ---------------------------
  // Supabase connectivity check
  // ---------------------------
  useEffect(() => {
    (async () => {
      if (!sb.enabled()) {
        setRemoteOk(false);
        return;
      }
      try {
        await sb.req("users?select=id&limit=1");
        setRemoteOk(true);
      } catch {
        setRemoteOk(false);
      }
    })();
  }, []);

  const useRemote = useMemo(() => {
    if (dataMode === "local") return false;
    if (dataMode === "remote") return remoteOk && sb.enabled();
    return remoteOk && sb.enabled();
  }, [dataMode, remoteOk]);

  // ---------------------------
  // Category helpers
  // ---------------------------
  const allCats = useMemo(() => {
    const c = categories || DEFAULT_CATEGORIES;
    return {
      expense: c.expense || [],
      income: c.income || [],
      debt: c.debt || [],
    };
  }, [categories]);

  const getCat = (id) => {
    const list = [...allCats.expense, ...allCats.income, ...allCats.debt];
    return list.find((x) => x.id === id) || { id, uz: id, ru: id, en: id, emoji: "❓", color: "#777" };
  };

  const catLabel = (cat) => (lang === "uz" ? cat.uz : lang === "ru" ? cat.ru : cat.en);

  // ---------------------------
  // Derived stats
  // ---------------------------
  const today = todayISO();
  const weekStart = startOfWeekISO();
  const month = monthPrefix();

  const txToday = transactions.filter((x) => x.date === today);
  const txWeek = transactions.filter((x) => x.date >= weekStart);
  const txMonth = transactions.filter((x) => x.date.startsWith(month));

  const todayExp = txToday.filter((x) => x.amount < 0).reduce((s, x) => s + Math.abs(x.amount), 0);
  const todayInc = txToday.filter((x) => x.amount > 0).reduce((s, x) => s + x.amount, 0);

  const weekSpend = txWeek.filter((x) => x.amount < 0).reduce((s, x) => s + Math.abs(x.amount), 0);
  const monthSpend = txMonth.filter((x) => x.amount < 0).reduce((s, x) => s + Math.abs(x.amount), 0);

  const topCats = useMemo(() => {
    const m = new Map();
    for (const x of txMonth) {
      if (x.amount >= 0) continue;
      m.set(x.categoryId, (m.get(x.categoryId) || 0) + Math.abs(x.amount));
    }
    return [...m.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([categoryId, spent]) => ({ categoryId, spent, cat: getCat(categoryId) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactions, month, categories, lang]);

  const monthSpentByCategory = (categoryId) => {
    return txMonth
      .filter((x) => x.categoryId === categoryId && x.amount < 0)
      .reduce((s, x) => s + Math.abs(x.amount), 0);
  };

  // ---------------------------
  // Remote sync (optional)
  // ---------------------------
  const syncFromRemote = async () => {
    if (!tgUser?.id) return;
    if (!useRemote) {
      showToast(t.syncFail, false);
      return;
    }
    try {
      const users = await sb.req(`users?telegram_id=eq.${tgUser.id}&select=*`);
      let u = users?.[0] || null;
      if (!u) {
        const created = await sb.req("users", {
          method: "POST",
          body: { telegram_id: tgUser.id, name: tgUser.first_name || "User", balance: 0 },
        });
        u = created?.[0] || null;
      }

      const [tx, lim, gl] = await Promise.all([
        sb.req(`transactions?user_telegram_id=eq.${tgUser.id}&select=*&order=created_at.desc&limit=200`),
        sb.req(`limits?user_telegram_id=eq.${tgUser.id}&select=*`),
        sb.req(`goals?user_telegram_id=eq.${tgUser.id}&select=*`),
      ]);

      const txLocal =
        (tx || []).map((r) => ({
          id: r.id,
          type: r.amount < 0 ? "expense" : "income",
          amount: Number(r.amount),
          description: r.description || "",
          categoryId: r.category_id || "other",
          date: (r.created_at || new Date().toISOString()).slice(0, 10),
          time: (r.created_at || new Date().toISOString()).slice(11, 16),
          source: r.source || "app",
          remote: true,
        })) || [];

      const limLocal =
        (lim || []).map((r) => ({
          id: r.id,
          categoryId: r.category_id,
          amount: Number(r.limit_amount || 0),
          remote: true,
        })) || [];

      const goalsLocal =
        (gl || []).map((r) => ({
          id: r.id,
          name: r.name,
          target: Number(r.target_amount || 0),
          current: Number(r.current_amount || 0),
          emoji: r.emoji || "🎯",
          remote: true,
        })) || [];

      setBalance(Number(u?.balance || 0));
      setTransactions(txLocal);
      setLimits(limLocal);
      setGoals(goalsLocal);

      showToast(t.syncOk, true);
    } catch (e) {
      console.error(e);
      showToast(t.syncFail, false);
    }
  };

  const pushTxToRemote = async (tx) => {
    if (!tgUser?.id) return;
    if (!useRemote) return;

    try {
      const users = await sb.req(`users?telegram_id=eq.${tgUser.id}&select=id,telegram_id`);
      if (!users?.[0]) {
        await sb.req("users", {
          method: "POST",
          body: { telegram_id: tgUser.id, name: tgUser.first_name || "User", balance: 0 },
        });
      }

      const created_at = new Date(`${tx.date}T${tx.time || "12:00"}:00.000Z`).toISOString();

      const inserted = await sb.req("transactions", {
        method: "POST",
        body: {
          user_telegram_id: tgUser.id,
          description: tx.description,
          amount: tx.amount,
          category_id: tx.categoryId,
          created_at,
          source: "app",
        },
      });

      const row = inserted?.[0];
      if (row?.id) {
        setTransactions((prev) => prev.map((x) => (x.id === tx.id ? { ...x, id: row.id, remote: true } : x)));
      }

      try {
        const users2 = await sb.req(`users?telegram_id=eq.${tgUser.id}&select=id,balance`);
        const u = users2?.[0];
        if (u?.id) {
          await sb.req(`users?id=eq.${u.id}`, { method: "PATCH", body: { balance: balance + tx.amount } });
        }
      } catch {}
    } catch (e) {
      console.error("pushTxToRemote error:", e);
    }
  };

  const deleteTxRemote = async (tx) => {
    if (!useRemote) return;
    if (!tx?.id || typeof tx.id !== "string" || tx.id.length < 10) return;
    try {
      await sb.req(`transactions?id=eq.${tx.id}`, { method: "DELETE" });
    } catch (e) {
      console.error(e);
    }
  };

  // ---------------------------
  // CRUD: Transactions
  // ---------------------------
  const openAddTx = (type) => {
    const defaultCat =
      type === "expense"
        ? allCats.expense[0]?.id || "food"
        : type === "income"
        ? allCats.income[0]?.id || "salary"
        : allCats.debt[0]?.id || "borrowed";

    setEditTxId(null);
    setTxForm({
      type,
      amount: "",
      description: "",
      categoryId: defaultCat,
      date: todayISO(),
    });
    setShowAddTx(true);
  };

  const openEditTx = (tx) => {
    setEditTxId(tx.id);
    setTxForm({
      type: tx.type,
      amount: String(Math.abs(tx.amount)),
      description: tx.description || "",
      categoryId: tx.categoryId,
      date: tx.date || todayISO(),
    });
    setShowAddTx(true);
  };

  const saveTx = async () => {
    const amtNum = Number(txForm.amount);
    if (!amtNum || !txForm.categoryId) return;

    const isExpense = txForm.type === "expense";
    const isIncome = txForm.type === "income";
    const isDebt = txForm.type === "debt";

    const debtSign = (() => {
      if (!isDebt) return 1;
      const c = txForm.categoryId;
      if (c === "borrowed") return 1;
      if (c === "lent") return -1;
      if (c === "loan_payment") return -1;
      if (c === "credit") return -1;
      return 1;
    })();

    const signed =
      isExpense ? -Math.abs(amtNum) : isIncome ? Math.abs(amtNum) : debtSign * Math.abs(amtNum);

    const now = new Date();
    const time = now.toISOString().slice(11, 16);

    if (editTxId) {
      setTransactions((prev) => {
        const old = prev.find((x) => x.id === editTxId);
        const delta = old ? signed - old.amount : signed;
        setBalance((b) => b + delta);

        return prev.map((x) =>
          x.id === editTxId
            ? {
                ...x,
                type: txForm.type,
                amount: signed,
                categoryId: txForm.categoryId,
                description: txForm.description || catLabel(getCat(txForm.categoryId)),
                date: txForm.date,
                time,
              }
            : x
        );
      });
      showToast("✓", true);
      setShowAddTx(false);
      return;
    }

    const tx = {
      id: uid(),
      type: txForm.type,
      amount: signed,
      categoryId: txForm.categoryId,
      description: txForm.description || catLabel(getCat(txForm.categoryId)),
      date: txForm.date,
      time,
      source: "app",
      remote: false,
    };

    setTransactions((prev) => [tx, ...prev]);
    setBalance((b) => b + signed);
    setShowAddTx(false);
    showToast("✓", true);

    await pushTxToRemote(tx);
  };

  const removeTx = async (tx) => {
    if (!confirm(t.confirmDelete)) return;
    setTransactions((prev) => prev.filter((x) => x.id !== tx.id));
    setBalance((b) => b - tx.amount);
    showToast("✓", true);
    await deleteTxRemote(tx);
  };

  // ---------------------------
  // CRUD: Limits
  // ---------------------------
  const openAddLimit = () => {
    setLimitForm({ id: null, categoryId: allCats.expense[0]?.id || "food", amount: "" });
  };

  const openEditLimit = (lim) => {
    setLimitForm({ id: lim.id, categoryId: lim.categoryId, amount: String(lim.amount) });
  };

  const saveLimit = () => {
    const amt = Number(limitForm.amount);
    if (!limitForm.categoryId || !amt) return;

    if (limitForm.id) {
      setLimits((prev) =>
        prev.map((l) => (l.id === limitForm.id ? { ...l, categoryId: limitForm.categoryId, amount: amt } : l))
      );
    } else {
      setLimits((prev) => [{ id: uid(), categoryId: limitForm.categoryId, amount: amt }, ...prev]);
    }
    showToast("✓", true);
    setLimitForm({ id: null, categoryId: allCats.expense[0]?.id || "food", amount: "" });
  };

  const deleteLimit = (id) => {
    if (!confirm(t.confirmDelete)) return;
    setLimits((prev) => prev.filter((x) => x.id !== id));
    showToast("✓", true);
  };

  // ---------------------------
  // CRUD: Goals
  // ---------------------------
  const openAddGoal = () => setGoalForm({ id: null, name: "", target: "", current: "0", emoji: "🎯" });
  const openEditGoal = (g) =>
    setGoalForm({ id: g.id, name: g.name, target: String(g.target), current: String(g.current), emoji: g.emoji || "🎯" });

  const saveGoal = () => {
    const name = (goalForm.name || "").trim();
    const target = Number(goalForm.target);
    const current = Number(goalForm.current || 0);
    if (!name || !target) return;

    if (goalForm.id) {
      setGoals((prev) => prev.map((g) => (g.id === goalForm.id ? { ...g, name, target, current, emoji: goalForm.emoji || "🎯" } : g)));
    } else {
      setGoals((prev) => [{ id: uid(), name, target, current, emoji: goalForm.emoji || "🎯" }, ...prev]);
    }
    showToast("✓", true);
    setGoalForm({ id: null, name: "", target: "", current: "", emoji: "🎯" });
  };

  const deleteGoal = (id) => {
    if (!confirm(t.confirmDelete)) return;
    setGoals((prev) => prev.filter((g) => g.id !== id));
    showToast("✓", true);
  };

  const depositToGoal = (goalId, delta) => {
    const d = Number(delta || 0);
    if (!d) return;
    setGoals((prev) => prev.map((g) => (g.id === goalId ? { ...g, current: clamp((g.current || 0) + d, 0, g.target || 0) } : g)));
    showToast("✓", true);
  };

  // ---------------------------
  // Open bot
  // ---------------------------
  const openBot = () => {
    const BOT_USERNAME = "hamyonmoneybot"; // change if needed
    if (window.Telegram?.WebApp?.openTelegramLink) {
      window.Telegram.WebApp.openTelegramLink(`https://t.me/${BOT_USERNAME}`);
    } else {
      window.open(`https://t.me/${BOT_USERNAME}`, "_blank");
    }
  };

  const sbEnabled = sb.enabled();

  const resetLocal = () => {
    try {
      localStorage.removeItem("hamyon_balance");
      localStorage.removeItem("hamyon_transactions");
      localStorage.removeItem("hamyon_limits");
      localStorage.removeItem("hamyon_goals");
      localStorage.removeItem("hamyon_categories");
      showToast("✓", true);
      setBalance(0);
      setTransactions([]);
      setLimits([]);
      setGoals([]);
      setCategories(DEFAULT_CATEGORIES);
    } catch {}
  };

  const [tab, setTab] = useState("home");

  return (
    <div className="min-h-screen" style={{ background: THEME.bg.primary }}>
      {tab === "home" && (
        <HomeScreen
          t={t}
          tgUser={tgUser}
          balance={balance}
          useRemote={useRemote}
          syncFromRemote={syncFromRemote}
          openAddTx={openAddTx}
          onOpenCategories={() => setShowCategories(true)}
          onOpenLimits={() => setShowLimitsScreen(true)}
          weekSpend={weekSpend}
          monthSpend={monthSpend}
          onOpenAnalytics={() => setShowAnalyticsScreen(true)}
          transactions={transactions}
          getCat={getCat}
          catLabel={catLabel}
          openEditTx={openEditTx}
          removeTx={removeTx}
          onOpenTransactions={() => setShowTransactionsScreen(true)}
          openBot={openBot}
          onOpenSettings={() => setShowSettingsScreen(true)}
        />
      )}

      <AnimatePresence>
        {showAddTx && (
          <AddEditTransactionModal
            t={t}
            lang={lang}
            allCats={allCats}
            getCat={getCat}
            catLabel={catLabel}
            txForm={txForm}
            setTxForm={setTxForm}
            editTxId={editTxId}
            onClose={() => setShowAddTx(false)}
            onSaveTx={saveTx}
          />
        )}

        {showCategories && (
          <CategoriesScreen
            onClose={() => setShowCategories(false)}
            THEME={THEME}
            t={t}
            lang={lang}
            transactions={transactions}
            limits={limits}
            allCats={allCats}
            catLabel={catLabel}
            formatUZS={formatUZS}
            monthSpentByCategory={monthSpentByCategory}
            setCategories={setCategories}
            showToast={showToast}
          />
        )}

        {showLimits && (
          <LimitsScreen
            onClose={() => setShowLimitsScreen(false)}
            THEME={THEME}
            t={t}
            limits={limits}
            allCats={allCats}
            getCat={getCat}
            catLabel={catLabel}
            monthSpentByCategory={monthSpentByCategory}
            formatUZS={formatUZS}
            clamp={clamp}
            openAddLimit={openAddLimit}
            openEditLimit={openEditLimit}
            deleteLimit={deleteLimit}
            saveLimit={saveLimit}
            limitForm={limitForm}
            setLimitForm={setLimitForm}
            showToast={showToast}
          />
        )}

        {showTransactions && (
          <TransactionsScreen
            onClose={() => setShowTransactionsScreen(false)}
            THEME={THEME}
            t={t}
            transactions={transactions}
            today={today}
            weekStart={weekStart}
            month={month}
            getCat={getCat}
            catLabel={catLabel}
            formatUZS={formatUZS}
            openAddTx={openAddTx}
            openEditTx={openEditTx}
            removeTx={removeTx}
          />
        )}

        {showAnalytics && (
          <AnalyticsScreen
            onClose={() => setShowAnalyticsScreen(false)}
            THEME={THEME}
            t={t}
            weekSpend={weekSpend}
            monthSpend={monthSpend}
            topCats={topCats}
            formatUZS={formatUZS}
            catLabel={catLabel}
          />
        )}

        {showDebts && (
          <DebtsScreen
            onClose={() => setShowDebtsScreen(false)}
            THEME={THEME}
            t={t}
            transactions={transactions}
            allCats={allCats}
            getCat={getCat}
            catLabel={catLabel}
            formatUZS={formatUZS}
            openAddTx={openAddTx}
            openEditTx={openEditTx}
            removeTx={removeTx}
            showToast={showToast}
            clamp={clamp}
          />
        )}

        {showGoals && (
          <GoalsScreen
            onClose={() => setShowGoalsScreen(false)}
            THEME={THEME}
            t={t}
            goals={goals}
            goalForm={goalForm}
            setGoalForm={setGoalForm}
            openAddGoal={openAddGoal}
            openEditGoal={openEditGoal}
            saveGoal={saveGoal}
            deleteGoal={deleteGoal}
            depositToGoal={depositToGoal}
            formatUZS={formatUZS}
            clamp={clamp}
          />
        )}

        {showSettings && (
          <SettingsScreen
            onClose={() => setShowSettingsScreen(false)}
            THEME={THEME}
            t={t}
            lang={lang}
            setLang={setLang}
            dataMode={dataMode}
            setDataMode={setDataMode}
            useRemote={useRemote}
            remoteOk={remoteOk}
            sbEnabled={sbEnabled}
            syncFromRemote={syncFromRemote}
            resetLocal={resetLocal}
          />
        )}
      </AnimatePresence>

      <BottomNav tab={tab} setTab={setTab} />

      {toast && (
        <div className="fixed top-4 left-0 right-0 z-[90] flex justify-center pointer-events-none">
          <div
            className="px-4 py-3 rounded-2xl text-sm font-semibold pointer-events-none"
            style={{
              background: toast.ok ? "rgba(34,197,94,0.18)" : "rgba(239,68,68,0.18)",
              color: THEME.text.primary,
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            {toast.msg}
          </div>
        </div>
      )}
    </div>
  );
}
