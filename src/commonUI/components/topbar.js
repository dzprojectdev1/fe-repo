import React, {Component} from 'react'
import {View, Text, ImageBackground, Image, StatusBar, TouchableOpacity} from 'react-native'

import {colors, em} from '../base'

export class TopBar extends Component {
	onBack() {
		this.props.onBack();
	}
	render() {
		return (
			<View>
                <StatusBar BackImage="../../commonUI/images/background.png" backgroundColor="transparent" barStyle="light-content"  translucent={true}></StatusBar>
				<ImageBackground source={require('../images/background.png')} 
				style={{width: '100%', height: 140*em, position: 'relative', justifyContent: 'center'}}>
					<View style={{position: 'absolute', left: 21*em, top: 60*em, alignSelf: 'center'}}>
						<TouchableOpacity onPress={this.onBack.bind(this)}>
							<Image source={require('../images/back.png')} style={{left: 10*em, top:10*em, width: 15*em, height: 35*em}}/>
						</TouchableOpacity>
					</View>
					<View style={{position: 'absolute', left: 0, top: 70*em, width: '100%', justifyContent: 'center', alignItems: 'center'}}>
						<Text style={{color: colors.primaryForeground, fontSize: 34*em, }}>{this.props.title}</Text>
					</View>
					{this.renderActionBtn()}
				</ImageBackground>
			</View>
		)
	}
	renderActionBtn() {
		if (this.props.actionBtn) {
			return (
				<View style={{
					position: 'absolute', right: (this.props.actionBtnImg?30:20)*em, top: (this.props.actionBtnImg?83:73)*em,
					width: '100%',
					alignItems: 'flex-end'
				}}>
					<TouchableOpacity onPress={this.props.actionBtn}>
						{this.props.actionBtnImg?
						<Image source={this.props.actionBtnImg} style={{width: 30*em, height: 30*em}}/>:
						<Text style={{color: colors.primaryForeground, fontSize: 28*em}}>
							{this.props.actionBtnTitle}
						</Text>}
					</TouchableOpacity>
				</View>
			)
		}
	}
}