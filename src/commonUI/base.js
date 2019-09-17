export const colors = {
	primary: '#2288ea',
	primaryBackground: '#046390',
	primaryForeground: '#fff',
	text: '#999',
	itemText: '#666',
	inputLabel: '#333',
	secondaryBackground: '#fff',
	secondaryForeground: '#2288ea',
	danger: '#f25c46',
	white: '#fff',
	background: '#F5FCFF',
	buttonDisabled: '#aaa'
}

import Dimensions from 'Dimensions';
export const W = Dimensions.get('window').width;
export const H = Dimensions.get('window').height;
export const em = W/720

export const fontSizes = {
	default: 26*em,
	small: 24*em,
	button: 32*em,
}