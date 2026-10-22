import React from "react";
import { TABS, type TabKey } from "../tabs";

interface TabNavProps {
  activeTab: TabKey;
  onSelect: (tab: TabKey) => void;
}

export const TabNav: React.FC<TabNavProps> = ({ activeTab, onSelect }) => (
  <nav className="tabs" aria-label="Bagian laboratorium">
    {TABS.map((tab) => {
      const isActive = activeTab === tab.key;
      return (
        <button
          key={tab.key}
          type="button"
          className={`tab ${isActive ? "is-active" : ""}`}
          aria-current={isActive ? "page" : undefined}
          onClick={() => onSelect(tab.key)}
        >
          <span className="tab-index" aria-hidden="true">
            {tab.index}
          </span>
          <img className="tab-icon" src={tab.icon} alt="" />
          <span className="tab-label">{tab.label}</span>
        </button>
      );
    })}
  </nav>
);

export default TabNav;
