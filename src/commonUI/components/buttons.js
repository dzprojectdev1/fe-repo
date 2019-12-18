import React, {Component} from 'react'
import {View, TouchableOpacity, Text} from 'react-native'

import {em, colors, fontSizes} from '../base'
import {textStyles} from '../styles'

export class TextButton extends Component {
	render() {
		return (
			<View style={{}}>
				<TouchableOpacity onPress={this.props.onPress} style={{
				}}>
					<Text style={textStyles.default}>
						{this.props.title}
					</Text>
				</TouchableOpacity>
			</View>
		)
	}
}

export class PrimaryButton extends Component {
	onPress() {
		if (this.props.disabled) {
			return
		}
		this.props.onPress()
	}
	render() {
		const {disabled} = this.props
		if (disabled) {
			return (
				<View>			
					<View style={{
						width: '100%', height: em*80,
						backgroundColor: colors.buttonDisabled, 
						justifyContent: 'center',
						borderRadius: 7*em,
						opacity: 0.7
					}}>
						<Text style={{
							alignSelf:'center',
							color:colors.primaryForeground,
							fontSize: fontSizes.button,
						}}>{this.props.title}</Text>
					</View>
				</View>
			)
		}
		return (
			<View>			
				<TouchableOpacity onPress={this.onPress.bind(this)} style={[{
					width: '100%', height: em*80,
					backgroundColor: colors.primaryBackground, 
					justifyContent: 'center',
					borderRadius: 7*em}]}>
					<Text style={{
						alignSelf:'center',
						color:colors.primaryForeground,
						fontSize: fontSizes.button,
					}}>{this.props.title}</Text>
				</TouchableOpacity>
			</View>
		)
	}
}

export class SecondaryButton extends Component {
	render() {
		const {title, buttonStyle, inputStyle} = this.props
		return (
			<View>
				<TouchableOpacity onPress={this.props.onPress}
				style={[{
					width: this.props.width, height:60*em,
					backgroundColor: colors.secondaryBackground,
					justifyContent: 'center',
					paddingLeft: 24*em, paddingRight: 24*em,
					borderRadius: 30*em, borderColor: colors.primary, borderWidth: 1*em,
				}, buttonStyle]}>
					<Text style={[{
						alignSelf:'center',
						color:colors.secondaryForeground,
						fontSize: fontSizes.small,
					}, inputStyle]}>{title}</Text>
				</TouchableOpacity>
			</View>
		)
	}
}