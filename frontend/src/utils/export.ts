/**
 * Export Utilities
 * Functions for exporting notes and flashcard sets to various formats
 */

import type { Note } from '../services/notes';
import type { FlashcardSet, Flashcard } from '../types/flashcards';

/**
 * Export a note as Markdown
 */
export function exportNoteAsMarkdown(note: Note): string {
  let markdown = `# ${note.title}\n\n`;
  
  if (note.category) {
    markdown += `**Category:** ${note.category.name}\n\n`;
  }
  
  if (note.tags && note.tags.length > 0) {
    markdown += `**Tags:** ${note.tags.map(t => t.name).join(', ')}\n\n`;
  }
  
  if (note.created_at) {
    const createdDate = new Date(note.created_at).toLocaleDateString();
    markdown += `**Created:** ${createdDate}\n\n`;
  }
  
  if (note.updated_at) {
    const updatedDate = new Date(note.updated_at).toLocaleDateString();
    markdown += `**Updated:** ${updatedDate}\n\n`;
  }
  
  markdown += `---\n\n`;
  markdown += note.content || '';
  
  return markdown;
}

/**
 * Export multiple notes as Markdown
 */
export function exportNotesAsMarkdown(notes: Note[]): string {
  return notes.map(note => exportNoteAsMarkdown(note)).join('\n\n---\n\n');
}

/**
 * Export a flashcard set as JSON
 */
export function exportFlashcardSetAsJSON(set: FlashcardSet, flashcards: Flashcard[]): string {
  const exportData = {
    name: set.name,
    description: set.description,
    category: set.category?.name || null,
    created_at: set.created_at,
    flashcards: flashcards.map(card => ({
      front: card.front,
      back: card.back,
      order: card.order || 0,
    })),
  };
  
  return JSON.stringify(exportData, null, 2);
}

/**
 * Download a file
 */
export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export note as Markdown file
 */
export function downloadNoteAsMarkdown(note: Note) {
  const markdown = exportNoteAsMarkdown(note);
  const filename = `${note.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
  downloadFile(markdown, filename, 'text/markdown');
}

/**
 * Export notes as Markdown file
 */
export function downloadNotesAsMarkdown(notes: Note[]) {
  const markdown = exportNotesAsMarkdown(notes);
  const filename = `notes_export_${new Date().toISOString().split('T')[0]}.md`;
  downloadFile(markdown, filename, 'text/markdown');
}

/**
 * Export flashcard set as JSON file
 */
export function downloadFlashcardSetAsJSON(set: FlashcardSet, flashcards: Flashcard[]) {
  const json = exportFlashcardSetAsJSON(set, flashcards);
  const filename = `${set.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
  downloadFile(json, filename, 'application/json');
}

/**
 * Export note as PDF (using browser print functionality)
 */
export function exportNoteAsPDF(note: Note) {
  const markdown = exportNoteAsMarkdown(note);
  
  // Convert markdown to HTML for better PDF rendering
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${note.title}</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          max-width: 800px;
          margin: 0 auto;
          padding: 2rem;
          line-height: 1.6;
        }
        h1 { color: #333; border-bottom: 2px solid #eee; padding-bottom: 0.5rem; }
        strong { color: #666; }
        hr { border: none; border-top: 1px solid #eee; margin: 2rem 0; }
        pre { background: #f5f5f5; padding: 1rem; border-radius: 4px; overflow-x: auto; }
        code { background: #f5f5f5; padding: 0.2rem 0.4rem; border-radius: 3px; }
      </style>
    </head>
    <body>
      ${markdownToHTML(markdown)}
    </body>
    </html>
  `;
  
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
    };
  }
}

/**
 * Simple markdown to HTML converter (basic)
 */
function markdownToHTML(markdown: string): string {
  let html = markdown
    // Headers
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Code blocks
    .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
    // Inline code
    .replace(/`(.+?)`/g, '<code>$1</code>')
    // Line breaks
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>');
  
  return `<p>${html}</p>`;
}

