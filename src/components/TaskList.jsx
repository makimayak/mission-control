export default function TaskList({ tasks, agents }) {
  const groupByDate = (tasks) => {
    const groups = {}
    tasks.forEach(task => {
      const date = new Date(task.completedAt).toDateString()
      if (!groups[date]) groups[date] = []
      groups[date].push(task)
    })
    return groups
  }

  const grouped = groupByDate(tasks)
  const dates = Object.keys(grouped).sort((a, b) => new Date(b) - new Date(a))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Completed Tasks</h2>
        <div className="text-sm text-gray-400">{tasks.length} total</div>
      </div>

      {dates.length === 0 ? (
        <div className="bg-gray-800 rounded-lg p-12 text-center border border-gray-700">
          <div className="text-4xl mb-4">📋</div>
          <div className="text-gray-400">No completed tasks yet</div>
          <div className="text-sm text-gray-500 mt-2">Tasks will appear here when agents complete them</div>
        </div>
      ) : (
        dates.map(date => (
          <div key={date} className="space-y-3">
            <h3 className="text-sm font-medium text-gray-400 sticky top-0 bg-gray-900 py-2">
              {formatDate(new Date(date))}
            </h3>
            <div className="space-y-2">
              {grouped[date].map(task => (
                <div
                  key={task.id}
                  className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-colors"
                >
                  <div className="flex items-start space-x-3">
                    <span className="text-xl">{agents[task.agentId]?.emoji || '🤖'}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="font-medium">{task.title}</div>
                        <div className="text-xs text-gray-500 whitespace-nowrap ml-4">
                          {new Date(task.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                      {task.outcome && (
                        <div className="text-sm text-gray-400 mt-1">{task.outcome}</div>
                      )}
                      {task.link && (
                        <a
                          href={task.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-xs text-cyber-blue hover:underline mt-2"
                        >
                          View output →
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  )
}

function formatDate(date) {
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (date.toDateString() === today.toDateString()) return 'Today'
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday'
  
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
}
