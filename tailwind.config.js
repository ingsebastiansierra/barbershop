/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './App.{js,jsx,ts,tsx}',
        './src/**/*.{js,jsx,ts,tsx}',
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#6366F1',
                    dark: '#4F46E5',
                    light: '#818CF8',
                },
                secondary: {
                    DEFAULT: '#EC4899',
                    dark: '#DB2777',
                    light: '#F472B6',
                },
            },
        },
    },
    plugins: [],
};
