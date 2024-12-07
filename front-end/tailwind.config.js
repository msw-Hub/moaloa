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
        hoverdark: "#373737",
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
          filter: "invert(82%) sepia(6%) saturate(0%) hue-rotate(233deg) brightness(92%) contrast(86%)",
        },
        ".btn": {
          transition: "all 0.3s ease",

          "@apply font-bold dark:text-gray-200 hover:bg-blue-300 hover:text-white dark:hover:bg-hoverdark shadow-md": {},
        },
        ".content-box": {
          "@apply rounded-sm shadow-md bg-gray-50 dark:bg-ctdark text-bgdark dark:text-light": {},
        },
      });
    },
  ],
  darkMode: "class",
};
