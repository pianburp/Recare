// shared/types/user.types.ts

export interface UserData {
    id?: string;
    uid: string;
    email: string;
    fullName: string;
    userType: 'elderly' | 'caregiver';
    isVerified: boolean; // Email verification status
    createdAt: Date | any; // Firebase Timestamp
    updatedAt: Date | any; // Firebase Timestamp
    
    // Optional fields for future expansion
    phoneNumber?: string;
    dateOfBirth?: Date | any;
    address?: Address;
    profilePicture?: string;
    bio?: string;
    isActive?: boolean;
  }
  
  export interface Address {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  }
  
  export interface ElderlyProfile extends UserData {
    userType: 'elderly';
    medicalConditions?: string[];
    emergencyContact?: EmergencyContact;
    carePreferences?: CarePreferences;
    mobility?: 'independent' | 'assisted' | 'wheelchair';
  }
  
  export interface CaregiverProfile extends UserData {
    userType: 'caregiver';
    qualifications?: string[];
    experience?: number; // years of experience
    specializations?: string[];
    availability?: Availability[];
    hourlyRate?: number;
    rating?: number;
    totalReviews?: number;
    KYCVerified?: boolean; 
  }
  
  export interface EmergencyContact {
    name: string;
    relationship: string;
    phoneNumber: string;
    email?: string;
  }
  
  export interface CarePreferences {
    preferredLanguages?: string[];
    preferredGender?: 'male' | 'female' | 'any';
    specialNeeds?: string[];
    communicationPreference?: 'phone' | 'text' | 'email' | 'app';
  }
  
  export interface Availability {
    dayOfWeek: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
    startTime: string; // "09:00"
    endTime: string;   // "17:00"
    isAvailable: boolean;
  }
  
  // Authentication related types
  export interface AuthUser {
    uid: string;
    email: string | null;
    emailVerified: boolean;
    displayName?: string | null;
    photoURL?: string | null;
  }
  
  // Form interfaces
  export interface LoginForm {
    email: string;
    password: string;
    rememberMe: boolean;
  }
  
  export interface RegisterForm {
    fullName: string;
    email: string;
    password: string;
    confirmPassword: string;
    userType: 'elderly' | 'caregiver';
    acceptTerms: boolean;
  }
  
  // API Response types
  export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
  }
  
  // Firestore collection names (for consistency)
  export const COLLECTIONS = {
    USERS: 'users',
    APPOINTMENTS: 'appointments',
    REVIEWS: 'reviews',
    MESSAGES: 'messages',
    NOTIFICATIONS: 'notifications'
  } as const;
  
  // User type guards
  export const isElderlyUser = (user: UserData): user is ElderlyProfile => {
    return user.userType === 'elderly';
  };
  
  export const isCaregiverUser = (user: UserData): user is CaregiverProfile => {
    return user.userType === 'caregiver';
  };
  
  // Validation helpers
  export const isValidUserType = (userType: string): userType is 'elderly' | 'caregiver' => {
    return userType === 'elderly' || userType === 'caregiver';
  };