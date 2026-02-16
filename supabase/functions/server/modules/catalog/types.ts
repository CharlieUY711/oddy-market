// ============================================================
// TIPOS E INTERFACES - CATÁLOGO
// ============================================================

export interface Department {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  icon?: string;
  image?: string;
  order?: number;
  visible?: boolean;
  active?: boolean;
  entity_id?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

export interface Subcategory {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  category_id: string;
  department_id?: string;
  icon?: string;
  image?: string;
  order?: number;
  visible?: boolean;
  active?: boolean;
  entity_id?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

export interface Item {
  id: string;
  sku: string;
  name: string;
  description?: string;
  subcategory_id: string;
  category_id?: string;
  department_id?: string;
  brand?: string;
  price: number;
  cost?: number;
  currency?: string;
  stock?: number;
  track_stock?: boolean;
  weight?: number;
  weight_unit?: string;
  images?: string[];
  barcode?: string;
  qr_code?: string;
  status?: "active" | "inactive" | "discontinued";
  visible?: boolean;
  entity_id?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

export interface Package {
  id: string;
  name: string;
  description?: string;
  sku?: string;
  items: PackageItem[];
  price: number;
  cost?: number;
  currency?: string;
  discount_percentage?: number;
  stock?: number;
  track_stock?: boolean;
  images?: string[];
  status?: "active" | "inactive" | "discontinued";
  visible?: boolean;
  entity_id?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

export interface PackageItem {
  item_id: string;
  quantity: number;
  price_override?: number;
}
