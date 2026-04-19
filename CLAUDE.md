# General

Be concise and direct. Do not apologize for previous mistakes; simply fix them and explain why.
If a request is ambiguous, ask for clarification before writing code.
Explain 'why' instead of 'what'—I can read the code, I need to know the rationale.
Avoid conversational filler like 'Sure, I can help with that' or 'Here is the updated code'.
If you need to install a new dependency, list it clearly and explain why it’s the best choice vs. a native solution.



## First
Don't make changes until you have a 95% confidence in what you need to build. Ask me follow-up questions until you reach that confidence.

Never take a screenshot and show it in the chat unless instructed otherwise.


## Second

UI Library: Material Design 3 (Web Components)
Always use the official Google Material Design Web Components (@material/web) for all UI elements.

1. Component Usage
• Tags: Use the standard <md-*> custom element tags.
• Imports: When adding a new component, remind me to include the side-effect import.
• Example: import '@material/web/button/filled-button.js';
• Avoid: Do not use Material UI (MUI), Vuetify, or generic HTML/Tailwind components unless specifically requested.

2. Standard Mapping Reference
Element	Material Component Tag
Button	<md-filled-button>, <md-outlined-button>, or <md-text-button>
Input	<md-filled-text-field> or <md-outlined-text-field>
Checkbox	<md-checkbox>
Dialog	<md-dialog>
List	<md-list> and <md-list-item>
Chips	<md-chip-set> and <md-filter-chip>

3. Styling & Theming
• Design Tokens: Use CSS system variables (Design Tokens) for colors and typography.
• Example: color: var(--md-sys-color-primary);
• Customization: If a component needs styling, wrap it in a container or use the documented CSS shadow parts/custom properties. Do not attempt to override internal component CSS with !important.

4. Implementation Rules
• Declarative Syntax: In frameworks like React or Lit, ensure attributes are passed correctly (e.g., hasIcon instead of has-icon depending on the wrapper).
• Icons: Use the Material Symbols font. Use the <md-icon> component to wrap them.
• Example: `<md-icon slot="icon">settings</md-icon>`

## Review
Before providing a solution, mentally 'peer-review' your own code. Check for edge cases, performance bottlenecks, and adherence to the project rules defined above.
