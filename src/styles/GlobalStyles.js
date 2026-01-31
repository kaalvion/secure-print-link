import { createGlobalStyle } from 'styled-components';

const GlobalStyles = createGlobalStyle`
  :root {
    /* Premium Color Palette */
    --primary: #3b82f6;          /* Bright Blue */
    --primary-gradient: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
    --secondary: #64748b;        /* Slate */
    --accent: #f43f5e;           /* Rose */
    
    /* Backgrounds */
    --bg-dark: #0f172a;          /* Deep Navy */
    --bg-glass: rgba(255, 255, 255, 0.1);
    --bg-glass-dark: rgba(15, 23, 42, 0.6);
    
    /* Status Colors */
    --success: #10b981;          /* Emerald */
    --error: #ef4444;            /* Red */
    --warning: #f59e0b;          /* Amber */
    
    /* Text */
    --text-main: #f8fafc;        /* White-ish */
    --text-secondary: #94a3b8;   /* Light Slate */
    --text-dark: #1e293b;        /* Dark Slate for light modes */
    
    /* Effects */
    --glass-border: 1px solid rgba(255, 255, 255, 0.1);
    --glass-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
    --backdrop-blur: blur(10px);
    
    /* Transitions */
    --transition-fast: 0.2s ease;
    --transition-normal: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body {
    font-family: 'Inter', sans-serif;
    background-color: var(--bg-dark);
    color: var(--text-main);
    overflow-x: hidden;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  a {
    text-decoration: none;
    color: inherit;
  }

  button {
    font-family: inherit;
  }
  
  /* Scrollbar */
  ::-webkit-scrollbar {
    width: 8px;
  }
  
  ::-webkit-scrollbar-track {
    background: transparent;
  }
  
  ::-webkit-scrollbar-thumb {
    background: var(--secondary);
    border-radius: 4px;
  }
  
  ::-webkit-scrollbar-thumb:hover {
    background: var(--primary);
  }
`;

export default GlobalStyles;
