export interface CreateUserInitialPainDetails {
  user_id: number;
  type_of_injury: string;
  injury_occured: string;
  diagnosed_by_medical_professional: boolean;
  pain_level: number;
  stiffness: number;
  swelling: number;
  is_previous_physiotherapy_completed: boolean;
  has_pain_during_daily_activities: boolean;
  had_surgery: boolean;
  surgery_date: Date;
  is_get_physiotherapy_before: boolean;
  physiothrtapy_description: string;
}
