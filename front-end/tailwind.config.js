/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{html,js,jsx,ts,tsx}", // Adjust the paths according to your project structure
  ],
  theme: {
    extend: {
      colors: {
        bgdark: "#303030",
        ctdark: "#424242",
        bddark: "#808080",
        light: "#f5f5f5",
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
          "@apply text-bgdark py-2 px-6 dark:border-ctdark dark:text-light hover:bg-hover dark:hover:bg-ctdark": {},
        },
        ".icon-filter": {
          filter: "invert(82%) sepia(6%) saturate(0%) hue-rotate(233deg) brightness(92%) contrast(86%)",
        },
        ".btn": {
          transition: "all 0.3s ease",
          "@apply text-bgdark dark:text-gray-200 hover:bg-hover dark:hover:bg-hoverdark": {},
        },
      });
    },
  ],
  darkMode: "class",
};
