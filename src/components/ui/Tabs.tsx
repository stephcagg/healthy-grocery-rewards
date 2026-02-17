interface TabItem {
  id: string;
  label: string;
  emoji?: string;
}

interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export function Tabs({ tabs, activeTab, onChange, className = '' }: TabsProps) {
  return (
    <div
      className={`
        flex overflow-x-auto scrollbar-hide
        border-b border-gray-200
        -mx-4 px-4
        ${className}
      `}
      role="tablist"
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;

        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={`
              flex items-center gap-1.5
              px-4 py-3
              text-sm font-medium
              whitespace-nowrap
              border-b-2
              transition-all duration-200
              flex-shrink-0
              ${
                isActive
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
            `}
          >
            {tab.emoji && <span className="text-base">{tab.emoji}</span>}
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
