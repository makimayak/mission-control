import { useState, useEffect, useCallback } from 'react'
import AgentCard from './components/AgentCard'
import TaskList from './components/TaskList'
import ResearchBoard from './components/ResearchBoard'
import ProposalBoard from './components/ProposalBoard'

function App() {
  const [data, setData] = useState({ agents: {}, tasks: [], research: [], proposals: [] })
  const [activeTab, setActiveTab] = useState('overview')
  const [connected, setConnected] = useState(false)

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/status')
      const json = await res.json()
      setData(json)
    } catch (err) {
      console.error('Failed to fetch:', err)
    }
  }, [])

  useEffect(() => {
    fetchData()

    // WebSocket connection
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const wsUrl = window.location.port === '5173' 
      ? 'ws://localhost:3001' 
      : `${wsProtocol}//${window.location.host}`
    const ws = new WebSocket(wsUrl)
    
    ws.onopen = () => {
      setConnected(true)
      console.log('WebSocket connected')
    }

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data)
      if (msg.type === 'connected') {
        setData(msg.data)
      } else if (msg.type === 'agent_update') {
        setData(prev => ({
          ...prev,
          agents: { ...prev.agents, [msg.agent.id]: msg.agent }
        }))
      } else {
        // Refetch on other updates
        fetchData()
      }
    }

    ws.onclose = () => {
      setConnected(false)
      console.log('WebSocket disconnected')
    }

    return () => ws.close()
  }, [fetchData])

  const agents = Object.values(data.agents || {})
  const activeAgents = agents.filter(a => a.status === 'active')
  const tasks = data.tasks || []
  const research = data.research || []
  const proposals = data.proposals || []

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'tasks', label: 'Tasks', icon: '✓', count: tasks.length },
    { id: 'research', label: 'Research', icon: '🔬', count: research.filter(r => r.status === 'ongoing').length },
    { id: 'proposals', label: 'Proposals', icon: '💡', count: proposals.filter(p => p.status === 'pending').length }
  ]

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-cyber-pink to-cyber-blue bg-clip-text text-transparent">
              ClawdBot Dashboard
            </h1>
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              connected ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
            }`}>
              {connected ? '● Live' : '○ Offline'}
            </span>
          </div>
          <div className="text-sm text-gray-400">
            {activeAgents.length} of {agents.length} agents active
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-gray-800/50 border-b border-gray-700 px-6">
        <div className="flex space-x-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-medium transition-colors relative ${
                activeTab === tab.id
                  ? 'text-cyber-blue'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
              {tab.count > 0 && (
                <span className="ml-2 px-1.5 py-0.5 bg-gray-700 rounded text-xs">
                  {tab.count}
                </span>
              )}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyber-blue" />
              )}
            </button>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <main className="p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Agent Grid */}
            <section>
              <h2 className="text-lg font-semibold mb-4 text-gray-300">Agent Status</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {agents.map(agent => (
                  <AgentCard key={agent.name} agent={agent} />
                ))}
              </div>
            </section>

            {/* Quick Stats */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <div className="text-3xl font-bold text-green-400">{tasks.filter(t => {
                  const d = new Date(t.completedAt)
                  const today = new Date()
                  return d.toDateString() === today.toDateString()
                }).length}</div>
                <div className="text-sm text-gray-400">Tasks completed today</div>
              </div>
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <div className="text-3xl font-bold text-yellow-400">{research.filter(r => r.status === 'ongoing').length}</div>
                <div className="text-sm text-gray-400">Active research threads</div>
              </div>
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <div className="text-3xl font-bold text-purple-400">{proposals.filter(p => p.status === 'pending').length}</div>
                <div className="text-sm text-gray-400">Pending proposals</div>
              </div>
            </section>

            {/* Recent Activity */}
            <section>
              <h2 className="text-lg font-semibold mb-4 text-gray-300">Recent Activity</h2>
              <div className="bg-gray-800 rounded-lg border border-gray-700 divide-y divide-gray-700">
                {tasks.slice(0, 5).map(task => (
                  <div key={task.id} className="p-4 flex items-start space-x-3">
                    <span className="text-lg">{data.agents[task.agentId]?.emoji || '🤖'}</span>
                    <div>
                      <div className="font-medium">{task.title}</div>
                      <div className="text-sm text-gray-400">{task.outcome}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(task.completedAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
                {tasks.length === 0 && (
                  <div className="p-8 text-center text-gray-500">
                    No tasks completed yet
                  </div>
                )}
              </div>
            </section>
          </div>
        )}

        {activeTab === 'tasks' && <TaskList tasks={tasks} agents={data.agents} />}
        {activeTab === 'research' && <ResearchBoard items={research} agents={data.agents} />}
        {activeTab === 'proposals' && <ProposalBoard proposals={proposals} agents={data.agents} />}
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 px-6 py-2">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>🌙 Lucy's Dashboard v1.0</span>
          <span>Last update: {new Date().toLocaleTimeString()}</span>
        </div>
      </footer>
    </div>
  )
}

export default App
