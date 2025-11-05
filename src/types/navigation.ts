/**
 * TypeScript type definitions for navigation
 */

// Root Navigator
export type RootStackParamList = {
  Auth: undefined;
  Client: undefined;
  Barber: undefined;
  Admin: undefined;
  SuperAdmin: undefined;
};

// Auth Navigator
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  VerifyEmail: { email: string };
  ResetPassword: undefined;
};

// Client Navigator
export type ClientTabParamList = {
  Home: undefined;
  Search: undefined;
  Appointments: undefined;
  Profile: undefined;
};

export type ClientStackParamList = {
  ClientTabs: undefined;
  BarbershopDetail: { barbershopId: string };
  BarberDetail: { barberId: string };
  BookAppointment: { barbershopId: string; barberId?: string };
  AppointmentDetail: { appointmentId: string };
  Notifications: undefined;
  History: undefined;
};

// Barber Navigator
export type BarberTabParamList = {
  Schedule: undefined;
  Appointments: undefined;
  History: undefined;
  Profile: undefined;
};

export type BarberStackParamList = {
  BarberTabs: undefined;
  AppointmentDetail: { appointmentId: string };
  ClientProfile: { clientId: string };
  Notifications: undefined;
};

// Admin Navigator
export type AdminTabParamList = {
  Dashboard: undefined;
  Appointments: undefined;
  Barbers: undefined;
  Services: undefined;
  Profile: undefined;
};

export type AdminStackParamList = {
  AdminTabs: undefined;
  BarbershopSettings: undefined;
  AddBarber: undefined;
  EditBarber: { barberId: string };
  AddService: undefined;
  EditService: { serviceId: string };
  AppointmentDetail: { appointmentId: string };
  Statistics: undefined;
  WaitlistManagement: undefined;
};

// Super Admin Navigator
export type SuperAdminTabParamList = {
  Dashboard: undefined;
  Barbershops: undefined;
  Users: undefined;
  Statistics: undefined;
  Settings: undefined;
};

export type SuperAdminStackParamList = {
  SuperAdminTabs: undefined;
  AddBarbershop: undefined;
  EditBarbershop: { barbershopId: string };
  BarbershopDetail: { barbershopId: string };
  UserManagement: undefined;
  GlobalSettings: undefined;
};
