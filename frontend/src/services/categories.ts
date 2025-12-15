/**
 * Categories service for interacting with the Categories API
 */
import { get, post, put, del } from './api';
import { Category } from './notes';

export interface CategoryListResponse {
  data: Category[];
  status: 'success';
}

export interface CategoryResponse {
  data: Category;
  status: 'success';
}

export interface CategoryCreateData {
  name: string;
  color?: string;
}

export interface CategoryUpdateData {
  name?: string;
  color?: string;
}

/**
 * Get list of categories
 */
export async function getCategories(): Promise<CategoryListResponse> {
  return get<CategoryListResponse>('/api/categories/');
}

/**
 * Get a single category by ID
 */
export async function getCategory(id: number): Promise<CategoryResponse> {
  return get<CategoryResponse>(`/api/categories/${id}/`);
}

/**
 * Create a new category
 */
export async function createCategory(data: CategoryCreateData): Promise<CategoryResponse> {
  return post<CategoryResponse>('/api/categories/', data);
}

/**
 * Update a category
 */
export async function updateCategory(
  id: number,
  data: CategoryUpdateData
): Promise<CategoryResponse> {
  return put<CategoryResponse>(`/api/categories/${id}/`, data);
}

/**
 * Delete a category
 */
export async function deleteCategory(id: number): Promise<void> {
  return del(`/api/categories/${id}/`);
}

