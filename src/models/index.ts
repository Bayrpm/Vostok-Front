/**
 * Product interface for inventory management
 */
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Movement types for inventory tracking
 */
export const MovementType = {
  IN: 'IN',
  OUT: 'OUT',
  ADJUSTMENT: 'ADJUSTMENT'
} as const;

export type MovementType = typeof MovementType[keyof typeof MovementType];

/**
 * Movement interface
 */
export interface Movement {
  id: string;
  productId: string;
  type: MovementType;
  quantity: number;
  reason: string;
  createdAt: Date;
  createdBy: string;
}
