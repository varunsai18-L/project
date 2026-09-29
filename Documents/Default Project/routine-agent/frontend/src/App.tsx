import { Routes, Route } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { Dashboard } from '@/pages/Dashboard'
import { RoutineBuilder } from '@/pages/RoutineBuilder'
import { Goals } from '@/pages/Goals'
import { Settings } from '@/pages/Settings'
import { CalendarSync } from '@/pages/CalendarSync'

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="builder" element={<RoutineBuilder />} />
        <Route path="goals" element={<Goals />} />
        <Route path="calendar" element={<CalendarSync />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  )
}