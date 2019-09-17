import {StyleSheet} from 'react-native'

import {em, W, H, fontSizes, colors} from './base'

export const textStyles = StyleSheet.create({
	default: {
		fontSize: fontSizes.default, color: colors.text
	},
	small: {
		fontSize: fontSizes.small, color: colors.text
	},
	primary: {
		fontSize: fontSizes.default, color: colors.primary
	},
	smallPrimary: {
		fontSize: fontSizes.small, color: colors.primary
	}
})

export const formStyles = StyleSheet.create({
	formWrapper: {
		backgroundColor: '#fff', marginLeft: 30*em, marginRight: 30*em, marginTop: 10*em, height: H-96
	},
	formWithoutFieldsWrapper: {
	    backgroundColor: '#fff', marginTop: 10*em, height: H-80*em, alignItems: 'center'
	},
	formInnerWrapper: {
		marginLeft: 30*em, marginRight: 30*em, width: 660*em
	},
	formField: {
		marginTop:0,
		backgroundColor: '#fff',
		flexDirection: 'row', alignItems : 'flex-start',
		width: '100%',height: 30,
	},
	fieldLabelWrapper: {
		height: em*80, paddingRight: 10*em,
		justifyContent: 'center'
	},
	fieldLabel: {
		fontSize: fontSizes.default, color: colors.inputLabel,
		opacity: 0.9,
	},
	loginFormField: {
		backgroundColor: '#fff', opacity: 0.5,
		flexDirection: 'row', alignItems : 'flex-start',
		width: '100%',
		borderRadius: 5,
	},
	loginFieldLabelWrapper: {
		width: '20%', height: em*80,
		justifyContent: 'center'
	},
	loginFieldText: {
		width: '80%', height: em*80, opacity: 1,
		fontSize: 30*em, color: colors.loginFormText,
	},
	fieldText: {
		fontSize: fontSizes.default, color: colors.text,
	}	
})
export const actionButtonStyles = StyleSheet.create({
	container: {
		position: 'absolute', bottom: 60*em, left:0,
		width: '100%',
		backgroundColor: '#fff',
		paddingLeft: 30*em, paddingRight: 30*em, paddingTop: em*20, paddingBottom: em*30,
		borderRadius: 7*em,
	}	
})

export const fixedFormStyles = StyleSheet.create({
	container: {
		paddingLeft: 20*em, paddingRight: 20*em,
	    backgroundColor: colors.white
	},
	formTitle: {
		height: 60*em, fontSize: 30*em, lineHeight: 60*em, backgroundColor: '#fff'
	},
	vSpace: {
		height: 30*em, backgroundColor: 'transparent'
	},
	formField: {
		borderBottomWidth: 1, borderBottomColor: '#ccc',
		flexDirection: 'row', alignItems : 'flex-start',
		width: '100%',
	},
	fieldLabelWrapper: {
		width: '25%', height: 100*em, justifyContent: 'center'
	},
	fieldLabel: {
		fontSize: fontSizes.default,
	},
  	fieldTextWrapper: {
	    width: '75%', height: 100*em, justifyContent: 'center',
  	},
	fieldText: {
		fontSize: fontSizes.default, color: '#333',
		width: '100%', textAlign: 'right',
	},
	fieldPlaceholder: {
		fontSize: fontSizes.default, color: '#999',
		width: '100%', textAlign: 'right',
	},
	actionButton: {
		color: colors.primary, fontSize: fontSizes.default
	}
})

export const faceDetectStyles = StyleSheet.create({
	default: {
		fontSize: 28*em, 
		color: '#666666'
	},
	detectSucessField: {
		width: 260*em,
		height: 80*em,
		backgroundColor: '#808080',
		borderRadius: 5*em,
		justifyContent: 'center',
		alignItems: 'center',
		position: 'absolute',
		top: 300*em,
		left: 100*em
	},
	detectSucessText: {
		fontSize: 28*em, 
		color: '#ffffff',
		justifyContent: 'center',
		alignItems: 'center'
	},
	detectFailueText: {
		color: '#333333',
		justifyContent: 'center',
		alignItems: 'center'
	}
})