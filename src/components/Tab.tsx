import React from 'react'
import { TabButton } from './TabButton'

interface TabProps {
  tabs: Array<{ id: string; label: string }>
}

const Tab = React.forwardRef<HTMLDivElement, TabProps & { children?: React.ReactNode }>(
  ({ tabs, children }, ref) => {
    const [activeTabId, setActiveTabId] = React.useState(tabs[0]?.id ?? '')

    return (
      <div className="flex flex-col gap-6" ref={ref}>
        {/* Tab Navigation */}
        <div role="tablist" aria-label="Content sections" className="relative flex justify-between overflow-x-auto bg-gradient-to-b from-slate-50 to-white px-4 py-3 dark:from-slate-900/80 dark:to-slate-950/60">
          <div className="flex items-center gap-1 pb-[2px] scrollbar-hide">
            {tabs.map((tab) => (
              <TabButton
                key={tab.id}
                id={tab.id}
                label={tab.label}
                isActive={activeTabId === tab.id}
                onClick={() => setActiveTabId(tab.id)}
              />
            ))}
          </div>
        </div>

        {/* Tab Content - only render active content */}
        <div className="relative flex flex-1 min-h-[300px] bg-white p-6 shadow-glow ring-1 ring-slate-200/30 transition-all duration-500 dark:bg-slate-900/40 dark:ring-white/10">
          {tabs.map((tab) => (
            <TabContent key={tab.id}>
              {/* Only render content for active tab */}
              {activeTabId === tab.id && children}
            </TabContent>
          ))}
        </div>

        {/* Tab Title */}
        <div className="flex items-center justify-between border-t border-slate-200 pt-6 dark:border-white/10">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
            {tabs.find((t) => t.id === activeTabId)?.label}
          </h3>
        </div>
      </div>
    )
  }
)

export default Tab

const TabContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ children, ...props }, ref) => (
    <div ref={ref} {...props}>
      {children}
    </div>
  )
)

export const Content = TabContent
