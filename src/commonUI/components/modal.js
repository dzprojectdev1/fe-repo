import React, {Component} from 'react'
import {View} from 'react-native'
import {em} from '../base'

export class Modal extends Component {
  render() {
		return (
			<View style={{
				position: 'absolute', left: 0, right: 0, top: 0, bottom: 0,
				alignItems: 'center', justifyContent: 'center'
			}}>
				<View style={{
					backgroundColor: '#888',
					opacity: 0.4,
					position: 'absolute', left: 0, right: 0, top: 0, bottom: 0,
				}}/>
				<View style={{
					padding: em*10,
					alignItems: 'center',
					backgroundColor: '#fff',
					borderRadius: 5*em,
					zIndex: 100,
					width: this.props.width, height: this.props.height
				}}>
					{this.props.children}
				</View>
			</View>
		)
	}
}