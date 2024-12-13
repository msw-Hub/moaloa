/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{html,js,jsx,ts,tsx}", // Adjust the paths according to your project structure
  ],
  theme: {
    extend: {
      colors: {
        bgdark: "#303030",
        btdark: "#383838",
        ctdark: "#424242",
        bddark: "#808080",
        light: "#ebebeb",
        hover: "#f0f0f0",
        hoverdark: "#282828",
      },
    },
  },
  plugins: [
    ({ addUtilities }) => {
      addUtilities({
        ".container-full": {
          backgroundColor: "#f5f5f5", // bg-bglight
          color: "#303030", // text-bgdark
          transition: "all 0.3s ease",
          "@apply dark:bg-bgdark dark:text-light": {},
        },
        ".navBtn": {
          whiteSpace: "nowrap",
          fontWeight: "500",
          borderRadius: "0.25rem",
          transition: "all 0.3s ease",
          "@apply py-2 px-6 dark:border-ctdark dark:text-light hover:bg-[#2652e6] dark:hover:bg-ctdark": {},
        },
        ".white-Mode-icon-filter": {
          filter: "invert(65%) sepia(24%) saturate(5655%) hue-rotate(190deg) brightness(102%) contrast(96%)",
        },
        ".btn": {
          transition: "all 0.2s ease",
          "@apply font-bold rounded-md shadow-md bg-blue-400 dark:bg-bgdark text-white dark:text-light hover:bg-blue-500 dark:hover:bg-hoverdark": {},
        },
        ".content-box": {
          "@apply rounded-sm shadow-md bg-gray-50 dark:bg-ctdark text-bgdark dark:text-light": {},
        },
        ".active-btn": {
          transition: "all 0.2s ease-in-out",
          "@apply shadow-md font-bold text-white dark:text-light bg-blue-400 dark:bg-bgdark border-2 border-solid border-blue-400 dark:border-bgdark": {},
        },
        ".default-btn": {
          transition: "all 0.2s ease-in-out",
          "@apply shadow-md font-bold text-blue-400 dark:text-zinc-300 bg-[#f9fafb] dark:bg-ctdark border-2 border-solid border-blue-400 dark:border-bgdark hover:text-white hover:bg-blue-300 hover:border-blue-300 dark:hover:bg-[#393939]": {},
        },
        ".flexCC": {
          "@apply flex items-center justify-center": {},
        },
      });
    },
  ],
  darkMode: "class",
};
