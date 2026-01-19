# AI Coding Instructions - Curriculum Engine

## Project Overview
Resume/Curriculum Editor Engine ("Motor de Currículo") - A web-based dual-panel application for editing and exporting professional resumes. Built with vanilla HTML/CSS/JavaScript, featuring live preview and PDF export functionality.

## Architecture & Key Components

### File Structure
- `HTML cod.html` - Main HTML file linking CSS and JavaScript modules
- `estilos CSS` - Stylesheet (CSS, no .css extension)
- `JavaScript` - Application logic file (no .js extension)

### Core Data Model
Single global object `curriculumData` holds all resume data:
```javascript
{
  nome, idade, estadoCivil, endereco, telefone, email, linkedin,
  objetivo, resumo: Array,
  formacoes: Array,    // Added education entries
  experiencias: Array, // Added job experiences
  cursos: Array        // Added courses/certifications
}
```

### Two-Mode UI Pattern
- **Edit Mode**: Modify personal info and professional summary via markdown file upload
- **Add Mode**: Append new experiences, education, or courses to existing data
- Markdown processor extracts multi-line items by filtering content > 20 chars

## Critical Workflows

### Markdown Integration
- Users upload `.md` files describing job requirements/profiles
- `processMarkdownContent()` strips markdown syntax and auto-populates resume summary
- Processes line-by-line, adds semicolons to clean entries

### Preview Update Pipeline
1. Form input → `applyChanges()` or `addNew*()` 
2. Update `curriculumData` object
3. Call `updatePreview()` to sync DOM
4. DOM updates by setting text content and creating/inserting HTML elements

### PDF Generation
- Uses html2pdf.js (CDN) to export `curriculum` div
- Filename: `Curriculo_[Name]_[ISO-Date].pdf`
- A4 format, portrait, 10mm margins
- Downloads automatically with browser's download handling

## Key Code Patterns & Conventions

### Data Persistence
Currently NO persistent storage - application uses in-memory object only. `resetForm()` calls `location.reload()` for reset.

### DOM Manipulation
- Direct `getElementById()` and `querySelector()` - no framework
- `innerHTML` for complex elements, `textContent` for simple strings
- Creates elements with `createElement()` and `insertBefore()` for new items

### Form Handling
```javascript
// Common pattern: collect form inputs, validate, update data, refresh preview
function add*() {
  const data = { prop: getElementById('id').value };
  if (!data.required) { alert('message'); return; }
  curriculumData.*.unshift(data); // prepend new items
  clearAddForm();
  updatePreview();
}
```

### Validation
Minimal - checks only required fields exist, not empty strings

## Important Notes for AI Assistance

### File Naming Quirk
Files lack standard extensions (`.css`, `.js`). Update `<link>` and `<script>` references if renaming:
- Line ~8: `<link rel="stylesheet" href="styles.css">`
- Line ~243: `<script src="script.js"></script>`

### Styling Approach
- CSS Grid 2-column layout: control-panel (400px) + preview-panel (1fr)
- Gradient background (#667eea → #764ba2)
- Animations: fadeIn on form visibility changes
- Form fieldsets group related inputs

### User Flow Assumptions
1. Load page → default edit mode
2. Optional: upload .md file → auto-populate summary
3. Edit personal info OR add experiences → apply changes
4. Preview updates live
5. Generate PDF to export

## Development Tips
- Test markdown processing with various file formats (ensure semicolons append correctly)
- PDF generation depends on html2pdf.js CDN availability
- Browser file download API handles PDF save (user sees download dialog)
- Form clearing via querySelectorAll loop for all inputs/textareas
- New items prepend to lists (`unshift`) so latest appears first in preview

## Potential Enhancement Areas
- Add localStorage for data persistence between sessions
- Implement undo/redo for edit operations
- Add validation for email/URL formats
- Support multiple resume templates
- Add drag-to-reorder for entries
- Implement print-friendly styling separate from PDF export
