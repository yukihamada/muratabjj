/**
 * Adaptive Review System using Spaced Repetition and Ebbinghaus Forgetting Curve
 * 
 * Based on SM-2 algorithm with modifications for BJJ technique learning
 */

export interface ReviewItem {
  id: string
  type: 'video' | 'flow' | 'technique'
  title: string
  masteryLevel: number // 1-5 (理解→手順→再現→連携→実戦)
  lastReviewed: Date
  reviewCount: number
  successRate: number // 0-1
  difficulty: number // 0-1 (0: easy, 1: hard)
  interval: number // days until next review
  efactor: number // easiness factor (SM-2 algorithm)
  priority: number // calculated priority score
}

export interface ReviewSession {
  items: ReviewItem[]
  sessionType: 'daily' | 'weakness' | 'prep' | 'maintenance'
  estimatedDuration: number // minutes
  focusAreas: string[]
}

export class AdaptiveReviewSystem {
  private readonly MIN_EFACTOR = 1.3
  private readonly MAX_EFACTOR = 2.5
  private readonly DEFAULT_EFACTOR = 2.5

  /**
   * Calculate next review interval based on SM-2 algorithm
   */
  calculateNextInterval(item: ReviewItem, quality: number): number {
    // Quality: 0-5 scale (0: complete failure, 5: perfect recall)
    let { efactor, interval, reviewCount } = item

    // Update easiness factor
    efactor = efactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
    efactor = Math.max(this.MIN_EFACTOR, Math.min(this.MAX_EFACTOR, efactor))

    // Calculate next interval
    if (quality < 3) {
      // Reset if quality is poor
      interval = 1
      reviewCount = 0
    } else {
      if (reviewCount === 0) {
        interval = 1
      } else if (reviewCount === 1) {
        interval = 6
      } else {
        interval = Math.round(interval * efactor)
      }
      reviewCount++
    }

    return interval
  }

  /**
   * Calculate priority score for review item
   */
  calculatePriority(item: ReviewItem, today: Date = new Date()): number {
    const daysSinceReview = Math.floor(
      (today.getTime() - item.lastReviewed.getTime()) / (1000 * 60 * 60 * 24)
    )
    
    // Base priority factors
    const urgency = Math.max(0, daysSinceReview - item.interval) / item.interval
    const difficultyWeight = item.difficulty * 0.3
    const masteryWeight = (5 - item.masteryLevel) * 0.2
    const successWeight = (1 - item.successRate) * 0.3
    const intervalWeight = item.interval > 0 ? 1 / Math.log(item.interval + 1) : 1

    return urgency + difficultyWeight + masteryWeight + successWeight + intervalWeight
  }

  /**
   * Generate personalized review session
   */
  generateReviewSession(
    items: ReviewItem[], 
    sessionType: 'daily' | 'weakness' | 'prep' | 'maintenance' = 'daily',
    maxDuration: number = 30
  ): ReviewSession {
    const today = new Date()
    
    // Filter items that need review
    let candidateItems = items.filter(item => {
      const daysSinceReview = Math.floor(
        (today.getTime() - item.lastReviewed.getTime()) / (1000 * 60 * 60 * 24)
      )
      return daysSinceReview >= item.interval
    })

    // Calculate priorities
    candidateItems = candidateItems.map(item => ({
      ...item,
      priority: this.calculatePriority(item, today)
    }))

    // Sort by priority and session type preferences
    candidateItems.sort((a, b) => {
      if (sessionType === 'weakness') {
        // Focus on low mastery and high difficulty
        const aWeaknessScore = (5 - a.masteryLevel) + a.difficulty
        const bWeaknessScore = (5 - b.masteryLevel) + b.difficulty
        return bWeaknessScore - aWeaknessScore
      } else if (sessionType === 'maintenance') {
        // Focus on high mastery items that need maintenance
        return (a.masteryLevel >= 4 ? b.priority : -1) - (b.masteryLevel >= 4 ? a.priority : -1)
      }
      return b.priority - a.priority
    })

    // Select items for session based on time constraint
    const selectedItems: ReviewItem[] = []
    let totalEstimatedTime = 0
    const avgTimePerItem = sessionType === 'weakness' ? 5 : 3 // minutes

    for (const item of candidateItems) {
      const estimatedTime = this.estimateReviewTime(item, sessionType)
      if (totalEstimatedTime + estimatedTime <= maxDuration) {
        selectedItems.push(item)
        totalEstimatedTime += estimatedTime
      }
    }

    // Identify focus areas
    const focusAreas = this.identifyFocusAreas(selectedItems)

    return {
      items: selectedItems,
      sessionType,
      estimatedDuration: totalEstimatedTime,
      focusAreas
    }
  }

  /**
   * Estimate time needed for reviewing an item
   */
  private estimateReviewTime(item: ReviewItem, sessionType: string): number {
    let baseTime = 3 // minutes

    // Adjust based on mastery level
    if (item.masteryLevel <= 2) baseTime = 5
    else if (item.masteryLevel >= 4) baseTime = 2

    // Adjust based on session type
    if (sessionType === 'weakness') baseTime *= 1.5
    else if (sessionType === 'maintenance') baseTime *= 0.7

    // Adjust based on success rate
    baseTime *= (2 - item.successRate)

    return Math.round(baseTime)
  }

  /**
   * Identify focus areas from selected items
   */
  private identifyFocusAreas(items: ReviewItem[]): string[] {
    const areas: { [key: string]: number } = {}
    
    items.forEach(item => {
      // Extract focus areas from item metadata or categorization
      // This would be implemented based on your data structure
      if (item.masteryLevel <= 2) {
        areas['基礎理解'] = (areas['基礎理解'] || 0) + 1
      } else if (item.masteryLevel <= 3) {
        areas['技術再現'] = (areas['技術再現'] || 0) + 1
      } else if (item.masteryLevel <= 4) {
        areas['連携練習'] = (areas['連携練習'] || 0) + 1
      } else {
        areas['実戦応用'] = (areas['実戦応用'] || 0) + 1
      }
    })

    return Object.entries(areas)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([area]) => area)
  }

  /**
   * Update item after review session
   */
  updateAfterReview(
    item: ReviewItem, 
    quality: number, 
    timeSpent: number,
    wasSuccessful: boolean
  ): ReviewItem {
    const newInterval = this.calculateNextInterval(item, quality)
    const newEfactor = item.efactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
    
    // Update success rate with exponential moving average
    const alpha = 0.2
    const newSuccessRate = alpha * (wasSuccessful ? 1 : 0) + (1 - alpha) * item.successRate

    // Update difficulty based on time spent vs estimated
    const expectedTime = this.estimateReviewTime(item, 'daily')
    const timeRatio = timeSpent / expectedTime
    const newDifficulty = Math.max(0, Math.min(1, 
      item.difficulty * 0.8 + timeRatio * 0.2
    ))

    return {
      ...item,
      lastReviewed: new Date(),
      reviewCount: quality >= 3 ? item.reviewCount + 1 : 0,
      interval: newInterval,
      efactor: Math.max(this.MIN_EFACTOR, Math.min(this.MAX_EFACTOR, newEfactor)),
      successRate: newSuccessRate,
      difficulty: newDifficulty,
      priority: 0 // Will be recalculated next time
    }
  }

  /**
   * Get study recommendations based on upcoming events or goals
   */
  getStudyRecommendations(
    items: ReviewItem[],
    upcomingEvents: { type: 'competition' | 'test' | 'sparring', date: Date }[] = []
  ): {
    urgent: ReviewItem[]
    recommended: ReviewItem[]
    maintenance: ReviewItem[]
    suggestions: string[]
  } {
    const today = new Date()
    const urgent: ReviewItem[] = []
    const recommended: ReviewItem[] = []
    const maintenance: ReviewItem[] = []
    const suggestions: string[] = []

    items.forEach(item => {
      const priority = this.calculatePriority(item, today)
      
      if (priority > 2) {
        urgent.push(item)
      } else if (priority > 1) {
        recommended.push(item)
      } else if (item.masteryLevel >= 4) {
        maintenance.push(item)
      }
    })

    // Add suggestions based on upcoming events
    upcomingEvents.forEach(event => {
      const daysUntil = Math.floor(
        (event.date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      )
      
      if (daysUntil <= 7) {
        suggestions.push(`${event.type}まで${daysUntil}日: 実戦レベルの技術を重点復習`)
      } else if (daysUntil <= 30) {
        suggestions.push(`${event.type}に向けて連携技術を強化`)
      }
    })

    return {
      urgent: urgent.sort((a, b) => this.calculatePriority(b) - this.calculatePriority(a)),
      recommended: recommended.sort((a, b) => this.calculatePriority(b) - this.calculatePriority(a)),
      maintenance,
      suggestions
    }
  }
}