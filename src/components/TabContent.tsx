import React from 'react'

interface TabContentProps {
  id: string | number
}

export function TabContent({ children, id }: { children?: React.ReactNode; id: string | number }) {
  return (
    <div className="animate-in fade-in duration-300">
      {children}
    </div>
  )
}

export default TabContent