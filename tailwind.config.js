/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html","./src/**/*.{html,js,jsx,tsx,ts}"],
  theme: {
    extend: {
      colors: {
        "chrome-light": "#ffffff",
        "chrome-dark": "#3c3c3c",
        "chrome-text-light": "#454545",
        "chrome-text-dark": "#cccccc",
        "chrome-hover-light": "#f2f2f2",
        "chrome-hover-dark": "#505050",
        "chrome-barbottom-light": "#e1e1e1",
        "chrome-barbottom-dark": "#454545",
        "chrome-dropdown-light": "#ffffff",
        "chrome-dropdown-dark": "#1f1f1f",
        "chrome-dropdown-border-light": "#252525",
        "chrome-dropdown-border-dark": "#070707",
        "chrome-dropdown-hover-light": "#f2f2f2",
        "chrome-dropdown-hover-dark": "#363636",
        "chrome-dropdown-text-light": "#272727",
        "chrome-dropdown-text-dark": "#dddddd",
        "chrome-dropdown-text-hover-light": "#252525",
        "chrome-dropdown-text-hover-dark": "#e0e0e0",
        "chrome-dropdown-caret-light": "#676767",
        "chrome-dropdown-caret-dark": "#a5a5a5",
      },
    },
  },
  plugins: [],
};
