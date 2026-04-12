import { products } from '../data';
import type { Product } from '../types';
import { mockLatency } from './mockUtils';

export async function fetchProducts(): Promise<Product[]> {
  await mockLatency();
  return products.map((p) => ({ ...p }));
}
