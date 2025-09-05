import { z } from 'zod'

/**
 * Enums
 * Enumerações para validação de dados
 */
export const UserRole = z.enum(['user', 'partner', 'admin'])
export const PlugType = z.enum(['CCS2', 'Type2', 'CHAdeMO', 'GB_T', 'Tesla'])
export const ConnectorStatus = z.enum(['available', 'occupied', 'offline', 'maintenance'])
export const BookingStatus = z.enum([
  'pending',
  'confirmed',
  'canceled',
  'expired',
  'completed',
  'no_show',
])
export const ChargeSessionStatus = z.enum(['started', 'finished', 'canceled', 'failed'])
export const NotificationType = z.enum([
  'booking_created',
  'booking_reminder',
  'booking_canceled',
  'station_issue_update',
  'loyalty_reward',
  'general',
])
export const IssueType = z.enum([
  'station_offline',
  'connector_broken',
  'price_mismatch',
  'blocked_access',
  'other',
])
export const IssueStatus = z.enum(['open', 'in_progress', 'resolved', 'dismissed'])
export const PartnerType = z.enum([
  'charging_operator',
  'retail',
  'hospitality',
  'automotive',
  'other',
])
export const LoyaltyEventType = z.enum([
  'session_completed',
  'booking_completed',
  'referral',
  'milestone',
  'manual_adjust',
])
export const RewardType = z.enum(['discount', 'cashback', 'free_minutes', 'perk'])
export const AmenityType = z.enum([
  'restroom',
  'wifi',
  'parking',
  'food_drink',
  'shopping',
  'lounge',
  'pet_friendly',
])
