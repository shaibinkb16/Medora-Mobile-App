// src/types/user.ts

export type UserRole = "user" | "admin" | "superadmin";
export type UserStatus = "active" | "pending" | "blocked";

export interface User {
  phone: string;
  address: string;
  records: any;
  predictions: any;
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  createdAt: Date;
  updatedAt?: Date;
  phoneNumber?: string;
  dateOfBirth?: Date;
  gender?: "Male" | "Female" | "Other";
  profileImageUrl?: string;
  isVerified?: boolean;
  lastLogin?: Date;
  recordsCount?: number;
  predictionsCount?: number;
  // Add other fields from your user model as needed
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
  totalCount?: number;
  page?: number;
  limit?: number;
}