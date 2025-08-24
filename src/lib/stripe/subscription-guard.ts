import { supabase } from '@/lib/supabase/client'
import { SUBSCRIPTION_PLANS, type PlanId } from './config'

export async function checkSubscriptionAccess(
  userId: string,
  requiredPlan?: PlanId
): Promise<{ hasAccess: boolean; userPlan: PlanId; message?: string }> {
  // Use the exported supabase client
  
  try {
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('subscription_plan, subscription_status, subscription_period_end')
      .eq('user_id', userId)
      .single()

    if (error || !profile) {
      return {
        hasAccess: false,
        userPlan: 'free',
        message: 'Profile not found',
      }
    }

    const userPlan = (profile.subscription_plan || 'free') as PlanId
    const isActive = profile.subscription_status === 'active'
    const periodEnd = profile.subscription_period_end
      ? new Date(profile.subscription_period_end)
      : null
    const isExpired = periodEnd ? periodEnd < new Date() : false

    // If no specific plan is required, check if user has any paid plan
    if (!requiredPlan) {
      const hasAccess = isActive && !isExpired && userPlan !== 'free'
      return {
        hasAccess,
        userPlan,
        message: hasAccess ? undefined : 'Subscription required',
      }
    }

    // Check specific plan access
    const planHierarchy: Record<PlanId, number> = {
      free: 0,
      basic: 1,
      pro: 2,
      master: 3,
      dojo_basic: 4,
      dojo_pro: 5,
      dojo_enterprise: 6,
    }

    const userPlanLevel = planHierarchy[userPlan]
    const requiredPlanLevel = planHierarchy[requiredPlan]

    // User must have at least the required plan level
    const hasAccess = isActive && !isExpired && userPlanLevel >= requiredPlanLevel

    return {
      hasAccess,
      userPlan,
      message: hasAccess ? undefined : `${requiredPlan} plan required`,
    }
  } catch (error) {
    console.error('Error checking subscription access:', error)
    return {
      hasAccess: false,
      userPlan: 'free',
      message: 'Error checking subscription',
    }
  }
}

// Hook for client-side subscription checks
export function useSubscriptionGuard(requiredPlan?: PlanId) {
  const checkAccess = async (userId: string) => {
    return checkSubscriptionAccess(userId, requiredPlan)
  }

  return { checkAccess }
}