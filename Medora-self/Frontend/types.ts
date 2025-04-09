// types.ts

export interface User {
    _id: string;
    name: string;
    email: string;
    profilePicture?: string;
    gender?: string;
    dob?: string;
    phone?: string;
    familyMembers?: FamilyMember[];
    createdAt?: string;
    updatedAt?: string;
  }
  
  export interface FamilyMember {
    _id: string;
    name: string;
    relation: string;
    dob?: string;
    gender?: string;
  }
  
  export interface Record {
    _id: string;
    user: User | string;
    category: 'Lab Report' | 'Prescription' | 'Doctor Note' | 'Imaging' | 'Medical Expense' | string;
    labName?: string;
    description?: string;
    condition?: string;
    tags?: string[];
    emergencyUse?: boolean;
    imageUrl?: string;
    createdAt?: string;
    updatedAt?: string;
  }
  
  export interface HealthMetric {
    _id: string;
    user: User | string;
    metricType: 'bloodPressure' | 'bloodSugar' | 'cholesterol' | string;
    value: number;
    unit: string;
    recordedAt: string;
    createdAt?: string;
    updatedAt?: string;
  }
  
  export interface WellnessTip {
    _id: string;
    title: string;
    content: string;
    imageUrl?: string;
    category?: string;
    createdAt?: string;
    updatedAt?: string;
  }
  
  export interface Notification {
    _id: string;
    user: User | string;
    title: string;
    message: string;
    type?: string;
    read: boolean;
    createdAt?: string;
    updatedAt?: string;
  }
  
  export interface MoodEntry {
    _id: string;
    user: User | string;
    mood: 'Happy' | 'Sad' | 'Neutral' | 'Stressed' | string;
    note?: string;
    date: string;
    createdAt?: string;
    updatedAt?: string;
  }
  
  export interface DailyGoal {
    _id: string;
    user: User | string;
    goalType: 'Steps' | 'Water' | 'Sleep' | 'Exercise' | string;
    target: number;
    progress: number;
    unit: string;
    date: string;
    createdAt?: string;
    updatedAt?: string;
  }
  
  export interface MotivationalQuote {
    _id: string;
    quote: string;
    author?: string;
    createdAt?: string;
    updatedAt?: string;
  }
  
  export interface MicroChallenge {
    _id: string;
    title: string;
    description: string;
    category?: string;
    rewardPoints?: number;
    createdAt?: string;
    updatedAt?: string;
  }
  
  