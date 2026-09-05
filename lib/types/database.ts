// Tipos manuales alineados con supabase/migrations/*.sql
// Si más adelante se linkea el proyecto con la Supabase CLI, se pueden
// regenerar automáticamente con `supabase gen types typescript`.

export type MovementType = "gasto" | "ingreso";
export type AccountType = "efectivo" | "banco" | "tarjeta" | "otro";
export type RecurrenceFrequency = "semanal" | "mensual";
export type TransactionSource = "web" | "whatsapp" | "api";
export type BudgetPeriod = "mensual";

export interface Profile {
  id: string;
  email: string;
  display_name: string | null;
  phone_number: string | null;
  default_account_id: string | null;
  created_at: string;
}

export interface Account {
  id: string;
  user_id: string;
  name: string;
  type: AccountType;
  initial_balance: number;
  created_at: string;
}

export interface Category {
  id: string;
  user_id: string;
  name: string;
  icon: string;
  color: string;
  type: MovementType;
  parent_category_id: string | null;
  is_archived: boolean;
  sort_order: number;
  created_at: string;
}

export interface PaymentMethod {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
}

export interface RecurringExpense {
  id: string;
  user_id: string;
  category_id: string;
  account_id: string;
  payment_method_id: string | null;
  amount: number;
  description: string;
  frequency: RecurrenceFrequency;
  day_of_month: number | null;
  start_date: string;
  end_date: string | null;
  active: boolean;
  created_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  account_id: string;
  category_id: string;
  payment_method_id: string | null;
  type: MovementType;
  amount: number;
  description: string | null;
  occurred_at: string;
  installment_group_id: string | null;
  installment_number: number | null;
  installments_total: number | null;
  recurring_expense_id: string | null;
  source: TransactionSource;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Budget {
  id: string;
  user_id: string;
  category_id: string | null;
  amount: number;
  period: BudgetPeriod;
  start_date: string;
  created_at: string;
}

export interface TransactionWithCategory extends Transaction {
  category: Pick<Category, "id" | "name" | "icon" | "color">;
}
