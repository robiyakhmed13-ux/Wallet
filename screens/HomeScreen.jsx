import React from "react";
import Header from "../components/Header";
import BalanceCard from "../components/BalanceCard";
import QuickActions from "../components/QuickActions";
import AnalyticsCard from "../components/AnalyticsCard";
import RecentTx from "../components/RecentTx";

const HomeScreen = (props) => (
    <div className="pb-28">
      <Header />
      <BalanceCard />
      <QuickActions />
      <AnalyticsCard />
      <RecentTx />
    </div>
  );

export default HomeScreen;
