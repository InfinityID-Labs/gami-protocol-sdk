/**
 * Gamification module for the SDK
 * This module provides the client-side functions to interact with the gamification endpoints
 */

import { apiRequest } from "./api";

/**
 * Award an achievement to a user
 */
export async function awardAchievement(userId: string, achievement: {
  achievementId: string;
  title: string;
  description: string;
  imageUrl?: string;
  xpAmount?: number;
  metadata?: Record<string, any>;
}) {
  const response = await apiRequest('POST', `/users/${userId}/achievements`, achievement);
  return await response.json();
}

/**
 * Add an item to a user's inventory
 */
export async function addInventoryItem(userId: string, item: {
  itemId: string;
  name: string;
  description?: string;
  imageUrl?: string;
  quantity?: number;
  attributes?: Record<string, any>;
  metadata?: Record<string, any>;
}) {
  const response = await apiRequest('POST', `/users/${userId}/inventory`, item);
  return await response.json();
}

/**
 * Track a gamification event with optional XP
 */
export async function trackEvent(data: {
  userId: string;
  event: string;
  actionType?: string;
  xpAmount?: number;
  contextData?: Record<string, any>;
  metadata?: Record<string, any>;
  sessionId?: string;
}) {
  const response = await apiRequest('POST', '/track/v2', data);
  return await response.json();
}

/**
 * Get a user's profile with achievements and inventory
 */
export async function getUserProfile(userId: string) {
  const response = await apiRequest('GET', `/users/${userId}/profile`);
  return await response.json();
}

/**
 * Get a user's event history
 */
export async function getUserEvents(userId: string, options?: { limit?: number; skip?: number }) {
  const query = new URLSearchParams();
  if (options?.limit) query.append('limit', options.limit.toString());
  if (options?.skip) query.append('skip', options.skip.toString());
  
  const queryString = query.toString() ? `?${query.toString()}` : '';
  const response = await apiRequest('GET', `/users/${userId}/events${queryString}`);
  return await response.json();
}

/**
 * Get analytics for the current project
 */
export async function getAnalytics() {
  const response = await apiRequest('GET', '/admin/analytics');
  return await response.json();
}

/**
 * Check service status
 */
export async function checkStatus() {
  const response = await apiRequest('GET', '/status');
  return await response.json();
}