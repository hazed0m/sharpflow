import { useMemo } from 'react'
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { useSharpFlowStore } from '../store/useSharpFlowStore'

export function MetricsChart() {
  const { tasks, memories } = useSharpFlowStore((state) => ({
    tasks: state.tasks,
    memories: state.memories,
  }))

  const chartData = useMemo(() => {
    // 1. Task Status Distribution (Pie Chart)
    const completedTasks = tasks.filter((task) => task.status === 'completed')
    const burnedTasks = tasks.filter((task) => task.status === 'ash')
    const statusData = [
      { name: 'Completed', value: completedTasks.length, fill: '#10b981' },
      { name: 'Burned', value: burnedTasks.length, fill: '#f59e0b' },
    ].filter((item) => item.value > 0)

    // 2. Focus Time Distribution by Duration Categories (Bar Chart)
    const durationBuckets: Record<string, number> = {
      '5-10 min': 0,
      '15-20 min': 0,
      '25-30 min': 0,
      '45+ min': 0,
    }

    completedTasks.forEach((task) => {
      if (task.timerMinutes <= 10) durationBuckets['5-10 min'] += task.timerMinutes
      else if (task.timerMinutes <= 20) durationBuckets['15-20 min'] += task.timerMinutes
      else if (task.timerMinutes <= 30) durationBuckets['25-30 min'] += task.timerMinutes
      else durationBuckets['45+ min'] += task.timerMinutes
    })

    const durationData = Object.entries(durationBuckets)
      .filter(([, value]) => value > 0)
      .map(([key, value]) => ({
        name: key,
        minutes: value,
      }))

    // 3. Completion Trend (last 7 days - Line Chart)
    const today = new Date()
    const trendData: Record<string, number> = {}

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      trendData[dateStr] = 0
    }

    completedTasks.forEach((task) => {
      const taskDate = new Date(task.createdAt)
      const dateStr = taskDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      if (dateStr in trendData) {
        trendData[dateStr]++
      }
    })

    const trendChartData = Object.entries(trendData).map(([date, count]) => ({
      date,
      tasks: count,
    }))

    // 4. Memory Types Distribution (Pie Chart)
    const memoryTypeCount: Record<string, number> = {
      Note: 0,
      Reflection: 0,
      Win: 0,
    }

    memories.forEach((mem) => {
      const type = mem.type.charAt(0).toUpperCase() + mem.type.slice(1)
      memoryTypeCount[type]++
    })

    const memoryData = Object.entries(memoryTypeCount)
      .filter(([, value]) => value > 0)
      .map(([name, value]) => ({
        name,
        value,
      }))

    return { statusData, durationData, trendChartData, memoryData }
  }, [tasks, memories])

  const COLORS = ['#10b981', '#f59e0b', '#3b82f6', '#8b5cf6']

  return (
    <div className="space-y-6">
      {/* Row 1: Status and Duration */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Task Status Distribution */}
        {chartData.statusData.length > 0 && (
          <div className="rounded-[2rem] border border-slate-200/20 bg-white/95 p-6 shadow-glow ring-1 ring-slate-200/30 transition-colors duration-300 dark:border-white/10 dark:bg-slate-950/90 dark:ring-white/10">
            <p className="text-xs uppercase tracking-[0.35em] text-slate-600 dark:text-slate-400">Task Status</p>
            <h3 className="mt-2 text-lg font-semibold text-slate-900 dark:text-white mb-4">Completion Breakdown</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={chartData.statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {chartData.statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '0.5rem',
                    color: '#e2e8f0',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 flex flex-col gap-2">
              {chartData.statusData.map((item) => (
                <div key={item.name} className="flex items-center gap-2 text-sm">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: item.fill }}
                  />
                  <span className="text-slate-600 dark:text-slate-400">
                    {item.name}: {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Focus Time by Duration */}
        {chartData.durationData.length > 0 && (
          <div className="rounded-[2rem] border border-slate-200/20 bg-white/95 p-6 shadow-glow ring-1 ring-slate-200/30 transition-colors duration-300 dark:border-white/10 dark:bg-slate-950/90 dark:ring-white/10">
            <p className="text-xs uppercase tracking-[0.35em] text-slate-600 dark:text-slate-400">Focus Distribution</p>
            <h3 className="mt-2 text-lg font-semibold text-slate-900 dark:text-white mb-4">Time by Session Length</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData.durationData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
                <XAxis dataKey="name" stroke="rgba(148, 163, 184, 0.5)" tick={{ fontSize: 12 }} />
                <YAxis stroke="rgba(148, 163, 184, 0.5)" tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '0.5rem',
                    color: '#e2e8f0',
                  }}
                />
                <Bar dataKey="minutes" fill="#0ea5e9" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Row 2: Completion Trend */}
      {chartData.trendChartData.some((d) => d.tasks > 0) && (
        <div className="rounded-[2rem] border border-slate-200/20 bg-white/95 p-6 shadow-glow ring-1 ring-slate-200/30 transition-colors duration-300 dark:border-white/10 dark:bg-slate-950/90 dark:ring-white/10">
          <p className="text-xs uppercase tracking-[0.35em] text-slate-600 dark:text-slate-400">Activity</p>
          <h3 className="mt-2 text-lg font-semibold text-slate-900 dark:text-white mb-4">Last 7 Days Completion Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData.trendChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
              <XAxis dataKey="date" stroke="rgba(148, 163, 184, 0.5)" tick={{ fontSize: 12 }} />
              <YAxis stroke="rgba(148, 163, 184, 0.5)" tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(15, 23, 42, 0.9)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '0.5rem',
                  color: '#e2e8f0',
                }}
              />
              <Legend wrapperStyle={{ color: 'rgba(148, 163, 184, 0.7)' }} />
              <Line
                type="monotone"
                dataKey="tasks"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ fill: '#10b981', r: 4 }}
                activeDot={{ r: 6 }}
                name="Tasks Completed"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Row 3: Memory Distribution */}
      {chartData.memoryData.length > 0 && (
        <div className="rounded-[2rem] border border-slate-200/20 bg-white/95 p-6 shadow-glow ring-1 ring-slate-200/30 transition-colors duration-300 dark:border-white/10 dark:bg-slate-950/90 dark:ring-white/10">
          <p className="text-xs uppercase tracking-[0.35em] text-slate-600 dark:text-slate-400">Reflections</p>
          <h3 className="mt-2 text-lg font-semibold text-slate-900 dark:text-white mb-4">Memory Types</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={chartData.memoryData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.memoryData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(15, 23, 42, 0.9)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '0.5rem',
                  color: '#e2e8f0',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 flex flex-col gap-2">
            {chartData.memoryData.map((item, index) => (
              <div key={item.name} className="flex items-center gap-2 text-sm">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-slate-600 dark:text-slate-400">
                  {item.name}: {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
