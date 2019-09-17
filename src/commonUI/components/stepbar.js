import React, {Component} from 'react'
import {View, Text, Image} from 'react-native'

import {em, W} from '../base'
import {formStyles} from '../styles'
import {SIGN} from '../../config'

export class StepBar extends Component {
	constructor(props) {
		super(props);
	}
	render() {
		let selt=this;
		return (
			<View style={{width: W, paddingTop: 64*em, backgroundColor: '#fff'}}>
				<View style={{alignItems: 'center'}}>
					<Image source={this.props.imgSrc} style={{width: 650*em, height: 50*em}}/>
				</View>
				<View style={{flex: 1, flexDirection: 'row', flexWrap: 'nowrap', alignItems: 'flex-start', paddingTop: 6*em, paddingBottom: 60*em}}>
					<Text style={{fontSize: 24*em, color: this.props.color1, marginLeft: 40*em, paddingRight: 90*em}}>
						{SIGN.progress_1}
					</Text>
					<Text style={{fontSize: 24*em, color: this.props.color2, paddingRight: 80*em}}>
						{SIGN.progress_2}
					</Text>
					<Text style={{fontSize: 24*em, color: this.props.color3, paddingRight: 110*em}}>
						{SIGN.progress_3}
					</Text>
					<Text style={{fontSize: 24*em, color: this.props.color4, paddingRight: 90*em}}>
						{SIGN.progress_4}
					</Text>
				</View>
			</View>
		)
	}
}
