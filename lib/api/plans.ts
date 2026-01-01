import { apiClient } from './client';
import { Plan, Subscription, SubscriptionCreateRequest } from '@/types';

// ============================================================================
// Plan Services
// ============================================================================

/**
 * Get all available subscription plans
 */
export async function getAllPlans(): Promise<Plan[]> {
  const response = await apiClient.get<Plan[]>('/plans');
  return response.data;
}

/**
 * Get specific plan details
 */
export async function getPlanById(id: number): Promise<Plan> {
  const response = await apiClient.get<Plan>(`/plans/${id}`);
  return response.data;
}

// ============================================================================
// Subscription Services
// ============================================================================

/**
 * Get all subscriptions for authenticated user
 */
export async function getUserSubscriptions(): Promise<Subscription[]> {
  const response = await apiClient.get<Subscription[]>('/subscriptions');
  return response.data;
}

/**
 * Get current active subscription for authenticated user
 */
export async function getCurrentSubscription(): Promise<Subscription> {
  const response = await apiClient.get<Subscription>('/subscriptions/current');
  return response.data;
}

/**
 * Get specific subscription details
 */
export async function getSubscriptionById(id: number): Promise<Subscription> {
  const response = await apiClient.get<Subscription>(`/subscriptions/${id}`);
  return response.data;
}

/**
 * Create a new subscription (subscribe to a plan)
 */
export async function createSubscription(data: SubscriptionCreateRequest): Promise<Subscription> {
  const response = await apiClient.post<Subscription>('/subscriptions', data);
  return response.data;
}

/**
 * Upgrade subscription to a new plan
 */
export async function upgradeSubscription(planId: number): Promise<Subscription> {
  const response = await apiClient.post<Subscription>('/subscriptions/upgrade', { planId });
  return response.data;
}

/**
 * Downgrade subscription to a lower plan
 */
export async function downgradeSubscription(planId: number): Promise<Subscription> {
  const response = await apiClient.post<Subscription>('/subscriptions/downgrade', { planId });
  return response.data;
}

/**
 * Cancel current subscription
 */
export async function cancelSubscription(): Promise<void> {
  await apiClient.post('/subscriptions/cancel');
}

/**
 * Renew expired subscription
 */
export async function renewSubscription(): Promise<Subscription> {
  const response = await apiClient.post<Subscription>('/subscriptions/renew');
  return response.data;
}
