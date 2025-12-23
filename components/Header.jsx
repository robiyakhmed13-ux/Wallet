import React from "react";
import { THEME } from "../data/theme";

const Header = ({ t, tgUser, onOpenSettings }) => (
    <header className="px-5 pt-6 pb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full flex items-center justify-center text-lg font-bold" style={{ background: THEME.gradient.primary }}>
            {(tgUser?.first_name || "U").charAt(0)}
          </div>
          <div>
            <h1 className="text-xl font-bold" style={{ color: THEME.text.primary }}>
              {t.hello}, {tgUser?.first_name || "User"}!
            </h1>
            <p className="text-sm" style={{ color: THEME.text.muted }}>
              {t.assistant}
            </p>
          </div>
        </div>
        <button
          className="text-2xl font-black tracking-tight"
          style={{ background: THEME.gradient.primary, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
          onClick={onOpenSettings}
          title={t.settings}
        >
          {t.appName}
        </button>
      </div>
    </header>
  );

export default Header;
