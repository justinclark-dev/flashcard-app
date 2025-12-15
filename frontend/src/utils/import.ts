/**
 * Import Utilities
 * Functions for importing notes and flashcard sets from various formats
 */

import type { NoteCreateData } from '../services/notes';
import type { FlashcardSet, Flashcard } from '../types/flashcards';

/**
 * Parse Markdown content into note data
 */
export function parseMarkdownToNote(markdown: string): Partial<NoteCreateData> {
  const lines = markdown.split('\n');
  let title = '';
  let content = '';
  let category: string | null = null;
  let tags: string[] = [];
  
  let inContent = false;
  let contentLines: string[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Extract title from first H1
    if (!title && line.startsWith('# ')) {
      title = line.substring(2).trim();
      continue;
    }
    
    // Extract category
    if (line.startsWith('**Category:**')) {
      category = line.replace('**Category:**', '').trim();
      continue;
    }
    
    // Extract tags
    if (line.startsWith('**Tags:**')) {
      const tagsStr = line.replace('**Tags:**', '').trim();
      tags = tagsStr.split(',').map(t => t.trim()).filter(t => t);
      continue;
    }
    
    // Skip metadata lines and separator
    if (line.startsWith('**') || line.startsWith('---') || line.trim() === '') {
      if (line.startsWith('---')) {
        inContent = true;
      }
      continue;
    }
    
    // Collect content
    if (inContent || (!line.startsWith('**') && line.trim() !== '')) {
      contentLines.push(line);
      inContent = true;
    }
  }
  
  content = contentLines.join('\n').trim();
  
  // If no title found, use first line or default
  if (!title && contentLines.length > 0) {
    title = contentLines[0].substring(0, 50) || 'Imported Note';
  }
  
  return {
    title: title || 'Imported Note',
    content,
    category_name: category || undefined,
    tag_names: tags.length > 0 ? tags : undefined,
  };
}

/**
 * Parse JSON flashcard set data
 */
export function parseJSONToFlashcardSet(json: string): {
  set: Partial<FlashcardSet>;
  flashcards: Array<{ front: string; back: string; order?: number }>;
} {
  try {
    const data = JSON.parse(json);
    
    return {
      set: {
        name: data.name || 'Imported Flashcard Set',
        description: data.description || '',
        category_name: data.category || undefined,
      },
      flashcards: data.flashcards || [],
    };
  } catch (error) {
    throw new Error('Invalid JSON format');
  }
}

/**
 * Read file as text
 */
export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      resolve(e.target?.result as string);
    };
    reader.onerror = (e) => {
      reject(new Error('Failed to read file'));
    };
    reader.readAsText(file);
  });
}

/**
 * Validate file type
 */
export function validateFileType(file: File, allowedTypes: string[]): boolean {
  const fileExtension = file.name.split('.').pop()?.toLowerCase();
  return allowedTypes.includes(fileExtension || '');
}

