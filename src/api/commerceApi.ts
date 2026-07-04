import { annualProducts, normalProducts } from '../data';
import type { Product } from '../types';
import { mockLatency } from './mockUtils';

export interface ProductCatalog {
  normal: Product[];
  annual: Product[];
}

export async function fetchProducts(): Promise<ProductCatalog> {
  await mockLatency();
  return {
    normal: normalProducts.map((p) => ({ ...p })),
    annual: annualProducts.map((p) => ({ ...p })),
  };
}
