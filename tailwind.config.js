import defaultTheme from 'tailwindcss/defaultTheme';

export default {
	content: [
		"./Fraktvalg/**/*.php",
		"./src/**/*.js",
		"./src/**/*.jsx"
	],
	prefix: "",
	theme: {
		extend: {
			colors: {
				primary: '#2F463E',
				secondary: '#4D8965',
				tertiary: '#65C7A4',
				black: '#000000',
				white: '#FFFFFF',
			},
			fontFamily: {
				sans: ['Poppins', ...defaultTheme.fontFamily.sans],
			},
		},
	}
}
