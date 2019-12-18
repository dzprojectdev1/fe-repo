import React, {Component} from 'react'
import {View, Text} from 'react-native'
import {em} from '../base'

export class Chart extends Component {
	render() {
		return (
			<View style={{height: 58*em, width: 58*em, borderColor: '#1775a0', borderRadius: 29*em, borderWidth: 3*em, alignItems: 'center', justifyContent: 'center'}}>
				<View style={{position: 'absolute', top: 29*em, left: 29*em, width: 29*em, height: 29*em, backgroundColor: '#fff'}}></View>
				<Text style={{fontSize: 20*em, color: '#1775a0'}}>{this.props.percent + '%'}</Text>
			</View>
		)
	}
}
