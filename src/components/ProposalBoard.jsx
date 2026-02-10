export default function ProposalBoard({ proposals, agents }) {
  const typeColors = {
    skill: 'bg-purple-500/20 text-purple-400',
    tool: 'bg-blue-500/20 text-blue-400',
    model: 'bg-green-500/20 text-green-400',
    upgrade: 'bg-orange-500/20 text-orange-400'
  }

  const priorityColors = {
    low: 'text-gray-400',
    medium: 'text-yellow-400',
    high: 'text-orange-400',
    critical: 'text-red-400'
  }

  const pending = proposals.filter(p => p.status === 'pending')
  const approved = proposals.filter(p => p.status === 'approved')
  const rejected = proposals.filter(p => p.status === 'rejected')

  const getVoteCount = (proposal) => {
    if (!proposal.votes) return { up: 0, down: 0 }
    return {
      up: proposal.votes.filter(v => v.vote === 'up').length,
      down: proposal.votes.filter(v => v.vote === 'down').length
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Proposals</h2>
        <div className="flex space-x-4 text-sm">
          <span className="text-yellow-400">{pending.length} pending</span>
          <span className="text-green-400">{approved.length} approved</span>
          <span className="text-red-400">{rejected.length} rejected</span>
        </div>
      </div>

      {proposals.length === 0 ? (
        <div className="bg-gray-800 rounded-lg p-12 text-center border border-gray-700">
          <div className="text-4xl mb-4">💡</div>
          <div className="text-gray-400">No proposals yet</div>
          <div className="text-sm text-gray-500 mt-2">Agents can propose new skills, tools, and upgrades</div>
        </div>
      ) : (
        <div className="space-y-4">
          {proposals.map(proposal => {
            const votes = getVoteCount(proposal)
            return (
              <div
                key={proposal.id}
                className="bg-gray-800 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors"
              >
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start space-x-3">
                      <span className="text-xl">{agents[proposal.agentId]?.emoji || '🤖'}</span>
                      <div>
                        <h3 className="font-medium">{proposal.title}</h3>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${typeColors[proposal.type] || 'bg-gray-500/20 text-gray-400'}`}>
                            {proposal.type}
                          </span>
                          <span className={`text-xs ${priorityColors[proposal.priority] || 'text-gray-400'}`}>
                            {proposal.priority} priority
                          </span>
                        </div>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      proposal.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                      proposal.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {proposal.status}
                    </span>
                  </div>

                  {proposal.description && (
                    <p className="text-sm text-gray-300 mb-4">{proposal.description}</p>
                  )}

                  <div className="flex items-center justify-between pt-3 border-t border-gray-700">
                    <div className="flex items-center space-x-4">
                      <button className="flex items-center space-x-1 text-sm text-gray-400 hover:text-green-400 transition-colors">
                        <span>👍</span>
                        <span>{votes.up}</span>
                      </button>
                      <button className="flex items-center space-x-1 text-sm text-gray-400 hover:text-red-400 transition-colors">
                        <span>👎</span>
                        <span>{votes.down}</span>
                      </button>
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(proposal.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
