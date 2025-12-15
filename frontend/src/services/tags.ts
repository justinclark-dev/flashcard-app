/**
 * Tags service for interacting with the Tags API
 */
import { get, post, put, del } from './api';
import { Tag } from './notes';

export interface TagListResponse {
  data: Tag[];
  status: 'success';
}

export interface TagResponse {
  data: Tag;
  status: 'success';
}

export interface TagCreateData {
  name: string;
}

export interface TagUpdateData {
  name: string;
}

/**
 * Get list of tags
 */
export async function getTags(): Promise<TagListResponse> {
  return get<TagListResponse>('/api/tags/');
}

/**
 * Get a single tag by ID
 */
export async function getTag(id: number): Promise<TagResponse> {
  return get<TagResponse>(`/api/tags/${id}/`);
}

/**
 * Create a new tag
 */
export async function createTag(data: TagCreateData): Promise<TagResponse> {
  return post<TagResponse>('/api/tags/', data);
}

/**
 * Update a tag
 */
export async function updateTag(id: number, data: TagUpdateData): Promise<TagResponse> {
  return put<TagResponse>(`/api/tags/${id}/`, data);
}

/**
 * Delete a tag
 */
export async function deleteTag(id: number): Promise<void> {
  return del(`/api/tags/${id}/`);
}

