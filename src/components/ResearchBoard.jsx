export default function ResearchBoard({ items, agents }) {
  const statusColors = {
    ongoing: 'border-l-yellow-500 bg-yellow-500/5',
    completed: 'border-l-green-500 bg-green-500/5',
    paused: 'border-l-gray-500 bg-gray-500/5',
    blocked: 'border-l-red-500 bg-red-500/5'
  }

  const ongoing = items.filter(i => i.status === 'ongoing')
  const completed = items.filter(i => i.status === 'completed')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Research Board</h2>
        <div className="flex space-x-4 text-sm">
          <span className="text-yellow-400">{ongoing.length} ongoing</span>
          <span className="text-green-400">{completed.length} completed</span>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="bg-gray-800 rounded-lg p-12 text-center border border-gray-700">
          <div className="text-4xl mb-4">🔬</div>
          <div className="text-gray-400">No research items yet</div>
          <div className="text-sm text-gray-500 mt-2">Agents will log their investigations here</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {items.map(item => (
            <div
              key={item.id}
              className={`bg-gray-800 rounded-lg border border-gray-700 border-l-4 ${statusColors[item.status]} overflow-hidden`}
            >
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{agents[item.agentId]?.emoji || '🤖'}</span>
                    <span className="font-medium">{item.topic}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    item.status === 'ongoing' ? 'bg-yellow-500/20 text-yellow-400' :
                    item.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {item.status}
                  </span>
                </div>

                {item.findings && (
                  <div className="text-sm text-gray-300 mb-3 whitespace-pre-wrap">
                    {item.findings}
                  </div>
                )}

                {item.sources && item.sources.length > 0 && (
                  <div className="space-y-1">
                    <div className="text-xs text-gray-500 uppercase">Sources</div>
                    <div className="flex flex-wrap gap-2">
                      {item.sources.map((source, i) => (
                        <a
                          key={i}
                          href={source}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-cyber-blue hover:underline truncate max-w-[200px]"
                        >
                          {new URL(source).hostname}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-3 pt-3 border-t border-gray-700 text-xs text-gray-500">
                  Started {new Date(item.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
