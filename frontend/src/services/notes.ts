/**
 * Notes service for interacting with the Notes API
 */
import { get, post, put, patch, del } from './api';

export interface Note {
  id: number;
  title: string;
  content: string;
  category: Category | null;
  tags: Tag[];
  source_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: number;
  name: string;
  color: string;
  created_at: string;
  updated_at?: string;
}

export interface Tag {
  id: number;
  name: string;
  created_at: string;
}

export interface NoteListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Note[];
  status: 'success';
}

export interface NoteResponse {
  data: Note;
  status: 'success';
}

export interface NoteCreateData {
  title: string;
  content: string;
  category_id?: number | null;
  tag_ids?: number[];
  source_url?: string;
}

export interface NoteUpdateData {
  title?: string;
  content?: string;
  category_id?: number | null;
  tag_ids?: number[];
  source_url?: string;
}

export interface NotesQueryParams {
  category?: number;
  search?: string;
  ordering?: string;
  page?: number;
  page_size?: number;
}

/**
 * Get list of notes with optional filtering
 */
export async function getNotes(params?: NotesQueryParams): Promise<NoteListResponse> {
  const queryParams = new URLSearchParams();
  
  if (params?.category) {
    queryParams.append('category', params.category.toString());
  }
  if (params?.search) {
    queryParams.append('search', params.search);
  }
  if (params?.ordering) {
    queryParams.append('ordering', params.ordering);
  }
  if (params?.page) {
    queryParams.append('page', params.page.toString());
  }
  if (params?.page_size) {
    queryParams.append('page_size', params.page_size.toString());
  }
  
  const queryString = queryParams.toString();
  const url = `/api/notes/${queryString ? `?${queryString}` : ''}`;
  
  return get<NoteListResponse>(url);
}

/**
 * Get a single note by ID
 */
export async function getNote(id: number): Promise<NoteResponse> {
  return get<NoteResponse>(`/api/notes/${id}/`);
}

/**
 * Create a new note
 */
export async function createNote(data: NoteCreateData): Promise<NoteResponse> {
  return post<NoteResponse>('/api/notes/', data);
}

/**
 * Update a note (full or partial)
 */
export async function updateNote(
  id: number,
  data: NoteUpdateData,
  partial: boolean = false
): Promise<NoteResponse> {
  const method = partial ? patch : put;
  return method<NoteResponse>(`/api/notes/${id}/`, data);
}

/**
 * Delete a note
 */
export async function deleteNote(id: number): Promise<void> {
  return del(`/api/notes/${id}/`);
}

