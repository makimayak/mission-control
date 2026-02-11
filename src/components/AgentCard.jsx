export default function AgentCard({ agent }) {
  const statusColors = {
    active: 'border-green-500 glow-green',
    online: 'border-green-500 glow-green',
    idle: 'border-gray-600',
    busy: 'border-yellow-500 glow-yellow',
    blocked: 'border-red-500 glow-pink',
    offline: 'border-gray-700'
  }

  const statusDots = {
    active: 'bg-green-500',
    online: 'bg-green-500',
    idle: 'bg-gray-500',
    busy: 'bg-yellow-500 animate-pulse',
    blocked: 'bg-red-500 animate-pulse',
    offline: 'bg-gray-700'
  }

  const status = agent.status || 'idle'

  return (
    <div className={`bg-gray-800 rounded-lg p-4 border-2 ${statusColors[status]} transition-all`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">{agent.emoji}</span>
          <div>
            <h3 className="font-bold">{agent.name}</h3>
            <p className="text-xs text-gray-400">{agent.role}</p>
          </div>
        </div>
        <div className={`w-3 h-3 rounded-full ${statusDots[status]}`} title={status} />
      </div>

      {agent.current ? (
        <div className="space-y-2">
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wide">Working on</div>
            <div className="text-sm text-gray-200 mt-1">
              {typeof agent.current === 'object' ? (agent.current.task || JSON.stringify(agent.current)) : agent.current}
            </div>
          </div>
          {agent.blocked && (
            <div className="mt-2 p-2 bg-red-500/10 border border-red-500/30 rounded text-xs text-red-300">
              <span className="font-medium">Blocked:</span> {agent.blocked}
            </div>
          )}
        </div>
      ) : (
        <div className="text-sm text-gray-500 italic">No active task</div>
      )}

      {agent.lastUpdated && (
        <div className="mt-3 pt-3 border-t border-gray-700 text-xs text-gray-500">
          Updated {formatTimeAgo(new Date(agent.lastUpdated))}
        </div>
      )}
    </div>
  )
}

function formatTimeAgo(date) {
  const seconds = Math.floor((new Date() - date) / 1000)
  
  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}
