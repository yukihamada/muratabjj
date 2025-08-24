'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import DashboardNav from '@/components/DashboardNav'
import { Loader2, BarChart3, Users, TrendingUp, Calendar } from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

interface ExperimentResult {
  variant_id: string
  variant_name: string
  user_count: number
  event_counts: Record<string, number>
  avg_values: Record<string, number>
  conversion_rates: Record<string, number>
}

interface Experiment {
  id: string
  name: string
  description: string
  variants: Array<{ id: string; name: string; weight: number }>
  metrics: string[]
  start_date: string
  end_date: string | null
  enabled: boolean
}

export default function ExperimentsPage() {
  const { user } = useAuth()
  const [experiments, setExperiments] = useState<Experiment[]>([])
  const [selectedExperiment, setSelectedExperiment] = useState<string | null>(null)
  const [results, setResults] = useState<ExperimentResult[]>([]))
  const [loading, setLoading] = useState(true)
  const [loadingResults, setLoadingResults] = useState(false)
  
  // Check if user is admin
  const isAdmin = user?.email && ['admin@test.muratabjj.com', 'yukihamada@me.com'].includes(user.email)
  
  useEffect(() => {
    if (!isAdmin) {
      toast.error('Admin access required')
      return
    }
    
    loadExperiments()
  }, [isAdmin])
  
  const loadExperiments = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('experiments')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setExperiments(data || [])
    } catch (error) {
      console.error('Error loading experiments:', error)
      toast.error('Failed to load experiments')
    } finally {
      setLoading(false)
    }
  }
  
  const loadResults = async (experimentId: string) => {
    setLoadingResults(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .rpc('get_experiment_results', { p_experiment_id: experimentId })
      
      if (error) throw error
      setResults(data || [])
      setSelectedExperiment(experimentId)
    } catch (error) {
      console.error('Error loading results:', error)
      toast.error('Failed to load experiment results')
    } finally {
      setLoadingResults(false)
    }
  }
  
  const toggleExperiment = async (experiment: Experiment) => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('experiments')
        .update({ enabled: !experiment.enabled })
        .eq('id', experiment.id)
      
      if (error) throw error
      
      toast.success(`Experiment ${!experiment.enabled ? 'enabled' : 'disabled'}`)
      loadExperiments()
    } catch (error) {
      console.error('Error toggling experiment:', error)
      toast.error('Failed to update experiment')
    }
  }
  
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#0a0a0f]">
        <DashboardNav />
        <div className="flex items-center justify-center h-[50vh]">
          <p className="text-gray-400">Admin access required</p>
        </div>
      </div>
    )
  }
  
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f]">
        <DashboardNav />
        <div className="flex items-center justify-center h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <DashboardNav />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-8">A/B Testing Dashboard</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Experiments List */}
          <div className="lg:col-span-1">
            <h2 className="text-xl font-semibold text-white mb-4">Experiments</h2>
            <div className="space-y-4">
              {experiments.map((experiment) => (
                <div
                  key={experiment.id}
                  className="bg-[#13131a] border border-gray-800 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-white">{experiment.name}</h3>
                    <button
                      onClick={() => toggleExperiment(experiment)}
                      className={`px-2 py-1 rounded text-xs ${
                        experiment.enabled
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-gray-500/20 text-gray-400'
                      }`}
                    >
                      {experiment.enabled ? 'Active' : 'Inactive'}
                    </button>
                  </div>
                  
                  <p className="text-sm text-gray-400 mb-3">{experiment.description}</p>
                  
                  <div className="flex items-center text-xs text-gray-500 mb-3">
                    <Calendar className="h-3 w-3 mr-1" />
                    {format(new Date(experiment.start_date), 'MMM d')} - 
                    {experiment.end_date 
                      ? format(new Date(experiment.end_date), 'MMM d')
                      : 'Ongoing'
                    }
                  </div>
                  
                  <button
                    onClick={() => loadResults(experiment.id)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-sm"
                  >
                    View Results
                  </button>
                </div>
              ))}
            </div>
          </div>
          
          {/* Results View */}
          <div className="lg:col-span-2">
            {selectedExperiment && (
              <>
                <h2 className="text-xl font-semibold text-white mb-4">Results</h2>
                
                {loadingResults ? (
                  <div className="flex items-center justify-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Variant Comparison */}
                    <div className="bg-[#13131a] border border-gray-800 rounded-lg p-6">
                      <h3 className="text-lg font-medium text-white mb-4">Variant Performance</h3>
                      
                      <div className="space-y-4">
                        {results.map((result) => (
                          <div key={result.variant_id} className="border-b border-gray-800 pb-4 last:border-0">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-white">
                                {result.variant_name || result.variant_id}
                              </h4>
                              <div className="flex items-center text-sm text-gray-400">
                                <Users className="h-4 w-4 mr-1" />
                                {result.user_count} users
                              </div>
                            </div>
                            
                            {/* Event Counts */}
                            <div className="grid grid-cols-2 gap-4 mt-3">
                              {Object.entries(result.event_counts).map(([event, count]) => (
                                <div key={event} className="bg-[#0a0a0f] rounded p-3">
                                  <p className="text-xs text-gray-500">{event}</p>
                                  <p className="text-lg font-semibold text-white">{count}</p>
                                  {result.conversion_rates[event] && (
                                    <p className="text-xs text-green-400">
                                      {result.conversion_rates[event]}% conversion
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                            
                            {/* Average Values */}
                            {Object.keys(result.avg_values).length > 0 && (
                              <div className="mt-3">
                                <p className="text-sm text-gray-400 mb-2">Average Values</p>
                                <div className="flex gap-4">
                                  {Object.entries(result.avg_values).map(([metric, value]) => (
                                    <div key={metric} className="flex items-center">
                                      <TrendingUp className="h-4 w-4 text-blue-400 mr-1" />
                                      <span className="text-sm text-white">
                                        {metric}: {value}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Statistical Significance Note */}
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                      <p className="text-sm text-blue-400">
                        <strong>Note:</strong> Results should be interpreted with caution. 
                        Statistical significance testing requires sufficient sample size and time.
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}
            
            {!selectedExperiment && (
              <div className="flex items-center justify-center h-64 bg-[#13131a] border border-gray-800 rounded-lg">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">Select an experiment to view results</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}