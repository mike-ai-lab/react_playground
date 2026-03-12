---
inclusion: always
---

# Code Style Guidelines

## Character Encoding Rules

### Strict ASCII Policy
- NEVER use emojis in code, comments, or documentation
- NEVER use Unicode characters beyond standard ASCII (0-127)
- NEVER use special symbols like: ✓ ✗ → ← ★ ● ■ etc.
- NEVER use smart quotes (" " ' ') - use straight quotes only (" ')
- NEVER use em dashes (—) or en dashes (–) - use hyphens (-) only

### Allowed Characters
- Standard ASCII letters (a-z, A-Z)
- Numbers (0-9)
- Standard punctuation: . , ; : ! ? ' " - _ ( ) [ ] { } / \ @ # $ % & * + = < > |
- Whitespace: spaces, tabs, newlines

### Rationale
Avoiding non-ASCII characters prevents:
- Encoding issues across different systems and editors
- Git diff problems
- Build tool compatibility issues
- Terminal display problems
- Copy-paste errors between environments

## Comments and Documentation
- Use clear, descriptive English text only
- Replace visual indicators with text:
  - Instead of: "// TODO ✓ Done"
  - Use: "// TODO: Completed"
- Replace arrows with words:
  - Instead of: "// value → result"
  - Use: "// value to result" or "// value => result"

## String Literals
- Use straight double quotes for JSX attributes
- Use straight single quotes for JavaScript strings
- Escape quotes properly when needed

## Examples

### Bad (DO NOT USE)
```javascript
// ✓ This function works great! 🎉
const greet = (name) => `Hello ${name}!`; // → returns greeting
```

### Good (USE THIS)
```javascript
// This function works great
const greet = (name) => `Hello ${name}!`; // returns greeting
```

## Enforcement
When generating or modifying code:
1. Review all text content for non-ASCII characters
2. Replace any emojis or special symbols with plain text
3. Verify comments use only standard ASCII
4. Check string literals for smart quotes or unusual characters
