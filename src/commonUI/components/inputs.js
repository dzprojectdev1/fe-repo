import React, {Component} from 'react'
import {StyleSheet, TextInput, Text, View, Image, TouchableOpacity} from 'react-native'

import Picker, {CascadePicker, RelationPicker} from './pickerWithIcon'
import {DatePicker} from '../components/datepicker'

import {em, W, colors} from  '../base'
import {formStyles, fixedFormStyles, textStyles} from '../styles'
import {COMMON} from '../../config'

export class InputField extends Component {
	onChangeField(fieldValue) {
		let fieldName = this.props.name;		
		this.props.onChangeField(fieldName, fieldValue);
	}
	render() {
		const {image} = this.props;
		if (image) {
			return (
				<InputFieldWithImage name={this.props.name} image={this.props.image} onChangeField={this.props.onChangeField} placeholder={this.props.placeholder} passwordField={this.props.passwordField?true:false}/>
			)
		}
		return (
			<View style={formStyles.formField}>
				<TextInput placeholder={this.props.placeholder} onChangeText={this.onChangeField.bind(this)} 
					secureTextEntry={this.props.passwordField?true:false} value={this.props.value} maxLength={this.props.maxLength}
					style={{borderBottomColor:'green', borderBottomWidth:1, width: '90%', marginLeft:15, paddingBottom:0}}
					/>
			</View>
		)
	}
}

class InputFieldWithImage extends Component {
	onChangeField(fieldValue) {
		let fieldName = this.props.name;
		this.props.onChangeField(fieldName, fieldValue);
	}
	render() {
		return (
			<View style={formStyles.formField}>
				<Image source={this.props.image} style={{width: 40*em, height: 40*em, margin: 25*em,}}/>
				<TextInput placeholder={this.props.placeholder} onChangeText={this.onChangeField.bind(this)}
				style={[formStyles.fieldText, {width: 468*em}]} secureTextEntry={this.props.passwordField?true:false}/>
			</View>
		)
	}
}

export class CheckField extends Component {
	render() {
		let checkedImage = require('../images/checkbox_checked.png')
		const {checked} = this.props
		if (!checked) checkedImage = require('../images/checkbox_unchecked.png')

		return (
		  	<View>
				<TouchableOpacity style={{flexDirection: 'row', marginLeft:12 }} onPress={this.props.onChange}>
					<Image source={checkedImage} style={{width: 40*em, height: 40*em}}/>
					<Text style={styles.text1}>{this.props.label}</Text>
				</TouchableOpacity>
			</View>
		)
	}
}

const styles = StyleSheet.create({
	text1: {
		fontSize: 8,
		color: '#666',
		textAlignVertical: 'center',
	},
});
  
const HEIGHT_INPUTFIELD	= (82*em);
export class SelectField extends Component {
	onChangeField(fieldText, selectIndex, fieldValue) {
		let fieldName = this.props.name;
		this.props.onChangeField(fieldName, fieldValue[0]);
	}
	render() {
  		let {value} = this.props
		if (!value) value=this.props.placeholder
		let textStyle = {alignItems: 'flex-start', textAlign: 'left'}
		if (!this.props.value)
			textStyle = {...textStyle, color: '#9a9a9a', fontSize: 24*em}
		if (this.props.rightAligned)
			textStyle = {...textStyle, textAlign: 'right', fontSize: 28*em, paddingRight: 50*em}
	  	return (
			<View style={[formStyles.formField, {height: HEIGHT_INPUTFIELD, borderTopColor: '#ccc', borderTopWidth: 1, borderBottomWidth: 0,
				alignItems: 'center', justifyContent: 'space-around'}]}>
				<View  style={formStyles.fieldLabelWrapper}>
					<Text style={[formStyles.fieldLabel, {fontSize: 28*em, color: '#000', marginLeft: -18*em}]}>
			            {this.props.label}
					</Text>
				</View>
				<View style={{flexDirection: 'row',	width: '75%', position: 'relative'}}>
					<Picker data={this.props.data} iconStyle={{display: 'none'}} textStyle={textStyle} inputValue={value}
						inputStyle={{borderWidth: 0, width: '100%', alignItems: 'flex-start', textAlign: 'left',
							width: W*0.75, zIndex: 12, backgroundColor: 'transparent'}}
						pickerName={this.props.pickerName?this.props.pickerName:''}	onResult={this.onChangeField.bind(this)}/>
				</View>
			</View>
		)
	}
}

export class SelectFieldMy extends Component {
	onChangeField(fieldText, selectIndex, fieldValue) {
	  let fieldName = this.props.name;
	  this.props.onChangeField(fieldName, fieldValue[0]);
	}

	onWheelChange(item, index, wheelNumber) {
	}

	render() {
		let {value} = this.props
		let textStyle = {alignItems: 'flex-start', textAlign: 'left', color: (!value)?'#999':'#666', fontSize: 28*em}
		if (!this.props.value)
			textStyle = {...textStyle}
		if (this.props.rightAligned)
			textStyle = {...textStyle, textAlign: 'right'}
		let rootStyle = {backgroundColor: 'transparent', borderBottomWidth: 1, borderBottomColor: '#ccc',
			flexDirection: 'row', alignItems : 'center', justifyContent: this.props.rightAligned?'space-between':'flex-start', width: '100%', height: HEIGHT_INPUTFIELD}
		if (this.props.noBorder)
			rootStyle = {...rootStyle, borderBottomWidth: 0}
		return (
			<View style={rootStyle}>
				{this.props.required?
				<View style={[formStyles.fieldLabelWrapper, {height: HEIGHT_INPUTFIELD, flexDirection: 'row', paddingTop: 18*em}]}>
					<Text style={{color: 'red', paddingTop: 7*em}}>
						*
					</Text>
					<Text style={[formStyles.fieldLabel, {fontSize: 28*em, color: '#000'}]}>
						{this.props.label}
					</Text>
				</View>:
				<View style={[formStyles.fieldLabelWrapper, {height: HEIGHT_INPUTFIELD*em}]}>
					<Text style={[formStyles.fieldLabel, {fontSize: 28*em, color: '#000'}]}>{this.props.label}</Text>
				</View>
				}
				<View style={{flexDirection: 'row', alignItems: 'center', justifyContent: this.props.rightAligned?'flex-end':'space-between'}}>
					<Picker data={this.props.data} iconStyle={{display: 'none'}}
						inputStyle={{borderWidth: 0, width: this.props.rightAligned?400*em:500*em, marginRight: 10*em, alignItems: 'flex-start', textAlign: 'left'}}
						pickerNameStyle={{color: '#333333', fontSize: 26*em}}  confirmBtnStyle={{color: colors.primary, fontSize: 26*em}}
						cancelBtnStyle={{color: colors.primary, fontSize: 26*em}} textStyle={textStyle} inputValue={!this.props.value?this.props.placeholder:value}
						pickerName={this.props.pickerName?this.props.pickerName:''}	selectIndex={this.props.selectIndex?this.props.selectIndex:[1]}
						onWheelChange={this.onWheelChange.bind(this)} onResult={this.onChangeField.bind(this)}/>
					<Image source={(!this.props.iconSrc)?require('../images/forward.png'):this.props.iconSrc} style={{width: 10*em, height: 19*em}}/>
				</View>
			</View>
		)
	}
}

export class SelectField2My extends Component {
	onChangeField(fieldText, selectIndex, fieldValue) {
	  let fieldName = this.props.name;
	  this.props.onChangeField(fieldName, fieldValue[0]);
	}

	onWheelChange(item, index, wheelNumber) {
	}

	render() {
		let {value} = this.props
		let textStyle = {alignItems: 'flex-start', textAlign: 'left', color: (!value)?'#999':'#666', fontSize: 28*em}
		if (!this.props.value)
			textStyle = {...textStyle}
		if (this.props.rightAligned)
			textStyle = {...textStyle, textAlign: 'right'}
		let rootStyle = {backgroundColor: 'transparent', borderBottomWidth: 1, borderBottomColor: '#ccc',
			flexDirection: 'row', alignItems : 'center', justifyContent: this.props.rightAligned?'space-between':'flex-start', width: '100%', height: HEIGHT_INPUTFIELD}
		if (this.props.noBorder)
			rootStyle = {...rootStyle, borderBottomWidth: 0}
		return (
			<View style={rootStyle}>
				{this.props.required?
				<View style={[formStyles.fieldLabelWrapper, {height: HEIGHT_INPUTFIELD, flexDirection: 'row', paddingTop: 18*em}]}>
					<Text style={{color: 'red', paddingTop: 7*em}}>*</Text>
					<Text style={[formStyles.fieldLabel, {fontSize: 28*em, color: '#000'}]}>{this.props.label}
					</Text>
				</View>:
				<View style={[formStyles.fieldLabelWrapper, {height: HEIGHT_INPUTFIELD*em}]}>
					<Text style={[formStyles.fieldLabel, {fontSize: 28*em, color: '#000'}]}>{this.props.label}</Text>
				</View>
				}
				<View style={{flexDirection: 'row', alignItems: 'center', justifyContent: this.props.rightAligned?'flex-end':'space-between'}}>
					<Picker
						textStyle={{fontSize: 28*em, color: '#333'}} placeholder={this.props.placeholder}
						inputValue ={value}
						inputStyle={{borderWidth: 0, width: 530*em, fontSize: 28*em, marginLeft: 0, marginRight: 0, alignItems: 'flex-start',
							textAlign: 'left', backgroundColor: 'transparent', paddingLeft: 20*em}}
						iconStyle={{display: 'none'}}
						confirmBtnText = {COMMON.ok}
						pickerName={this.props.pickerName?this.props.pickerName:''}
						pickerNameStyle={{color: '#333', fontSize: 30*em}}
						cancelBtnText = {COMMON.cancel1}
						data = {this.props.data}
						confirmBtnStyle={{color: '#046390', fontSize: 28*em}}
						cancelBtnStyle={{color: '#046390', fontSize: 28*em}}
						onResult ={(str, selectIndex, selectValue) => {
							this.props.onChangeField(this.props.name, str);
							this.props.onChangeField('selectFromIndex', selectIndex);
						}}/>
					<Image source={(!this.props.iconSrc)?require('../images/forward.png'):this.props.iconSrc} style={{width: 10*em, height: 19*em}}/>
				</View>
			</View>
		)
	}
}

export class SelectDateTime extends Component {
	onChangeField(fieldText, selectIndex, fieldValue) {
	  let fieldName = this.props.name;
	  this.props.onChangeField(fieldName, fieldValue[0]);
	}

	onWheelChange(item, index, wheelNumber) {
	}

	render() {
		let {value} = this.props
		let textStyle = {alignItems: 'flex-start', textAlign: 'left', color: (!value)?'#d8d9d9':'#333', fontSize: 28*em}
		if (!this.props.value)
			textStyle = {...textStyle}
		let rootStyle = {backgroundColor: 'transparent', borderBottomWidth: 1, borderBottomColor: '#ccc',
			flexDirection: 'row', alignItems : 'center', justifyContent: 'flex-start', width: '100%', height: HEIGHT_INPUTFIELD}
		if (this.props.noBorder)
			rootStyle = {...rootStyle, borderBottomWidth: 0}
		return (
			<View style={rootStyle}>
				<View  style={[formStyles.fieldLabelWrapper, {height: HEIGHT_INPUTFIELD*em}]}>
					<Text style={[formStyles.fieldLabel, {fontSize: 28*em, color: '#333333'}]}>{this.props.label}</Text>
				</View>
				<View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around'}}>
					<DatePicker iconStyle={{display: 'none'}} mode={'spinner'} textStyle={textStyle} date={value} format={this.props.format}/>
					<Image source={(!this.props.iconSrc)?require('../images/calender1.png'):this.props.iconSrc}/>
				</View>
			</View>
		)
	}
}

export class DateField extends Component {
  onChangeField(fieldValue) {
    let fieldName = this.props.name;
    this.props.onChangeField(fieldName, fieldValue);
  }
  render() {
    return (
			<View style={formStyles.formField}>
				<View  style={formStyles.fieldLabelWrapper}>
					<Text style={formStyles.fieldLabel}>
            {this.props.label}
					</Text>
				</View>
				<View style={{width: '75%'}}>
					{/*
					<InputField placeholder={this.props.placeholder} mode='date' format='YYYY.MM.DD' showIcon={false} style={{width: '100%', }} customStyles={{placeholderText: {textAlign: 'left', width: '100%'}, dateText: {textAlign: 'left', width: '100%'}, dateInput: {borderWidth: 0}}} onDateChange={this.onChangeField.bind(this)} date={this.props.value}/>
					*/}
					{/* <InputField placeholder={this.props.placeholder} mode='date' format='YYYY.MM.DD' onDateChange={this.onChangeField.bind(this)} date={this.props.value}/> */}
				</View>
			</View>
    )
  }
}

export class DateBetweenField extends Component {
	onChangeFromField(fieldValue) {
		let fieldName = this.props.fromName;
		this.props.onChangeField(fieldName, fieldValue);
	}
	onChangeToField(fieldValue) {
		let fieldName = this.props.to_name;
		this.props.onChangeField(fieldName, fieldValue);
	}
	render() {
	    return (
			<View style={formStyles.formField}>
				<View  style={formStyles.fieldLabelWrapper}>
					<Text style={formStyles.fieldLabel}>
			            {this.props.label}
					</Text>
				</View>
				<View style={{
					flexDirection: 'row',
					alignItems: 'center', justifyContent: 'center'
				}}>
					<InputField placeholder={this.props.fromPlaceholder} style={{width: 215*em}} mode='date' date={this.props.fromValue} format='YYYY.MM.DD' showIcon={false}
											customStyles={{dateInput: {borderWidth: 0}}} onDateChange={this.onChangeFromField.bind(this)}/>
					<Image source={require('../images/calender.png')} style={{marginLeft: 20*em, marginRight: 20*em, width: 22*em, height: 15*em}}/>
					<InputField placeholder={this.props.toPlaceholder} style={{width: 215*em}} mode='date' date={this.props.toValue} format='YYYY.MM.DD' showIcon={false}
											customStyles={{dateInput: {borderWidth: 0}}} onDateChange={this.onChangeToField.bind(this)}/>
					<Image source={require('../images/calender.png')} style={{marginLeft: 20*em, marginRight: 20*em, width: 22*em, height: 15*em}}/>
				</View>
			</View>
    	)
	}
}

export class TextField extends Component {
  	render() {
	  	const {label, value, placeholder, onChangeField} = this.props
		const isEmptyField = !(value&&value!='')
    return (
			<View style={fixedFormStyles.formField}>
				<View  style={fixedFormStyles.fieldLabelWrapper}>
					<Text style={fixedFormStyles.fieldLabel}>
			            {label}
					</Text>
				</View>
				<View style={fixedFormStyles.fieldTextWrapper}>
			        {isEmptyField ?
						<Text style={[fixedFormStyles.fieldPlaceholder, onChangeField?{paddingRight:22*em}:{}]}>{placeholder}</Text>:
						<Text style={[fixedFormStyles.fieldText, onChangeField?{paddingRight:22*em}:{}]}>{value}</Text>
          			}
					{onChangeField ?
						<TouchableOpacity style={{position: 'absolute', top: 38*em, right: 0}} onPress={this.onChangeField.bind(this, value)}>
							{/* <Image source={require('../images/calender1.png')} style={{width: 16*em, height: 28*em}}/> */}
						</TouchableOpacity> :
						<View/>
					}
				</View>
			</View>
	    )
	}
	onChangeField(fieldValue) {
		let fieldName = this.props.name;
		this.props.onChangeField(fieldName, fieldValue);
	}
}

export class DateBetweenFieldSelect extends Component {
	render() {
		let {fromValue, toValue, selectFromIndex, selectToIndex} = this.props
		let baseFromStyle = {fontSize: 28*em, color: '#d8d9d9'}
		let baseToStyle = {fontSize: 28*em, color: '#d8d9d9'}

		return (
			<View style={formStyles.formField}>
				<View  style={formStyles.fieldLabelWrapper}>
					<Text style={formStyles.fieldLabel}>
						{this.props.label}
					</Text>
				</View>
				<View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 17*em, marginLeft: 20*em}}>
					<Picker
						textStyle={{fontSize: 28*em, color: '#333'}} placeholder={this.props.fromPlaceholder}
						inputValue ={fromValue}
						inputStyle={[baseFromStyle, {borderWidth: 0, width: 230*em, fontSize: 28*em, marginLeft: 0, marginRight: 0, alignItems: 'flex-start', textAlign: 'left', backgroundColor: 'transparent'}]}
						iconStyle={{display: 'none'}} 
						confirmBtnText = {COMMON.ok}
						selectIndex = {selectFromIndex}
						pickerName={this.props.pickerName?this.props.pickerName:''}
						pickerNameStyle={{color: '#333', fontSize: 30*em}}
						cancelBtnText = {COMMON.cancel1}
						data = {this.props.data}
						confirmBtnStyle={{color: '#046390', fontSize: 28*em}}
						cancelBtnStyle={{color: '#046390', fontSize: 28*em}}
						onResult ={(str, selectIndex, selectValue) => {
							this.props.onChangeField(this.props.fromName, str);
							this.props.onChangeField('selectFromIndex', selectIndex);
						}}
						/>
					<Image source={require('../images/calender.png')} style={{width: em*24, height: em*24}}/>
				</View>
				<View style={{alignItems: 'center', justifyContent: 'center', marginTop: 20*em}}><Text>{'  ~'}</Text></View>
				<View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 17*em}}>
					<Picker
						textStyle={{fontSize: 28*em, color: '#333'}} placeholder={this.props.toPlaceholder}
						inputValue={toValue}
						inputStyle={[baseToStyle, {borderWidth: 0, width: 230*em, fontSize: 28*em, marginLeft: 0, marginRight: 0, alignItems: 'flex-start', textAlign: 'left', backgroundColor: 'transparent'}]}
						iconStyle={{display: 'none'}} 
						confirmBtnText = {COMMON.ok}
						selectIndex = {selectToIndex}
						pickerName={this.props.pickerName?this.props.pickerName:''}
						pickerNameStyle={{color: '#333', fontSize: 30*em}}
						cancelBtnText = {COMMON.cancel1}
						data = {this.props.data}
						confirmBtnStyle={{color: '#046390', fontSize: 28*em}} 
						cancelBtnStyle={{color: '#046390', fontSize: 28*em}}
						onResult ={(str, selectIndex, selectValue) => {
							this.props.onChangeField(this.props.toName, str);
							this.props.onChangeField('selectToIndex', selectIndex);
						}}
						/>
					<Image source={require('../images/calender.png')} style={{width: em*24, height: em*24}}/>
				</View>
			</View>
		)
	}
}

export class TextFieldMy extends Component {
	render() {
		const {label, value, placeholder, onChangeField} = this.props
		const isEmptyField = !(value&&value!='')
		return (
			<View style={[fixedFormStyles.formField, {height: HEIGHT_INPUTFIELD}]}>
			  	{this.props.required?
				  <View  style={[ {width: '45%', flexDirection: 'row', paddingTop: 18*em}]}>
					  <Text style={{color: 'red', paddingRight: 5*em, paddingTop: 7*em}}>
						  *
					  </Text>
					  <Text style={[textStyles.default, {color: '#333333'}]}>
			  			{label}
					  </Text>
				  </View>:
				  <View  style={{width: '45%', height: HEIGHT_INPUTFIELD, justifyContent: 'center'}}>
					  <Text style={[textStyles.default, {color: '#333333'}]}>
			  			{label}
					  </Text>
				  </View>
				}

				<View style={{width: '55%', height: HEIGHT_INPUTFIELD, justifyContent: 'center'}}>
					{isEmptyField ?
						<Text style={[fixedFormStyles.fieldPlaceholder, onChangeField?{paddingRight:22*em}:{}]}>{placeholder}</Text>:
						<Text style={[{color: '#666666', fontSize: 28*em, textAlign: 'right'},  onChangeField?{paddingRight:22*em}:{}]}>{value}</Text>
					}
					{onChangeField ?
						<TouchableOpacity style={{position: 'absolute', top: 30*em, right: 0}} onPress={this.onChangeField.bind(this, value)}>
							<Image source={require('../images/forward.png')} style={{width: 10*em, height: 19*em}}/>
						</TouchableOpacity> :
						<View/>
					}
				</View>
			</View>
	  	)
	}
	onChangeField(fieldValue) {
	  let fieldName = this.props.name;
	  this.props.onChangeField(fieldName, fieldValue);
	}
}

export class Select2Field extends Component {
	componentWillMount() {
		let data_ = this.props.data
		let data1 = []
		let data2 = []
		data_.map((item, index) => {
			const {id, name} = item
			data1.push({id, name})
		})
		let data = [data1, data2]
		this.setState({
			data,
			data_
		})
	}
	render() {
		let {value} = this.props
		if (!value) value=this.props.placeholder
		let textStyle = {alignItems: 'flex-start', textAlign: 'left'}
		if (!this.props.value)
			textStyle = {...textStyle, color: '#9a9a9a'}
		if (this.props.rightAligned)
			textStyle = {...textStyle, textAlign: 'right', paddingRight: 50*em}
		return (
			<View style={formStyles.formField}>
				<View  style={formStyles.fieldLabelWrapper}>
					<Text style={formStyles.fieldLabel}>
			            {this.props.label}
					</Text>
				</View>
				<View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: '75%', position: 'relative'}}>
					<CascadePicker data={this.state.data} onWheelChange={this.onWheelChange.bind(this)} iconStyle={{display: 'none'}}
						inputStyle={{borderWidth: 0, marginLeft: 0, marginRight: 0, alignItems: 'flex-start', textAlign: 'left', width: W*0.75,
						zIndex: 12, backgroundColor: 'transparent'}} textStyle={textStyle} inputValue={value}
						pickerName={this.props.pickerName?this.props.pickerName:''} onResult={this.onChangeField.bind(this)}/>
				</View>
			</View>
		)
	}
	onWheelChange(item, index, wheelNumber) {
		if (wheelNumber==0) {
			const {value} = item
			const {data_} = this.state
			let data1 = []
			let data2 = []
			data_.map((item_) => {
        const {id, name} = item_
        data1.push({id, name})
				if (item_.name==item.label){
        	item_.children.map((item2_) => {
            const {id, name} = item2_
            data2.push({id, name})
					})
				}
			})
      let data = [data1, data2]
      this.setState({
				...this.state,
				data
      })
		}
	}
  onChangeField(fieldText, selectIndex, fieldValue) {
    let fieldName = this.props.name;
    this.props.onChangeField(fieldName, fieldValue);
  }
}

export class Select2FieldMy extends Component {
	componentWillMount() {
		let data_ = this.props.data
		let data1 = []
		let data2 = []
		data_.map((item, index) => {
			const {id, name} = item
			data1.push({id, name})
		})
		let data = [data1, data2]
		this.setState({
			data,
			data_
		})
	}
	render() {
		let {value} = this.props
		let textStyle = {alignItems: 'flex-start', textAlign: 'left'}
		if (this.props.rightAligned)
			textStyle = {...textStyle, textAlign: 'right', paddingRight: 50*em, fontSize: 28*em, paddingTop: 30*em, color: '#666'}
		let rootStyle = {backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#ccc',
			flexDirection: 'row', alignItems : 'flex-start', width: '100%', paddingLeft: 0*em}
		if (this.props.noBorder)
			rootStyle = {...rootStyle, borderBottomWidth: 0}
		return (
			<View style={rootStyle}>
				<View style={formStyles.fieldLabelWrapper}>
					<Text style={[formStyles.fieldLabel, {color: '#000'}]}>
            			{this.props.label}
					</Text>
				</View>
				<View style={{flexDirection: 'row',	alignItems: 'center', justifyContent: 'center',
					width: '75%', position: 'relative'}}>
					<RelationPicker data={this.props.data} onWheelChange={this.onWheelChange.bind(this)} iconStyle={{display: 'none'}}
						inputStyle={{borderWidth: 0, marginLeft: 0, marginRight: -90*em, alignItems: 'flex-start', textAlign: 'left',
						width: W*0.75, zIndex: 12, backgroundColor: 'transparent'}} pickerNameStyle={{color: '#333333', fontSize: 26*em}}
						confirmBtnStyle={{color: colors.primary, fontSize: 26*em}}	cancelBtnStyle={{color: colors.primary, fontSize: 26*em}}
						textStyle={textStyle} inputValue={value} pickerName={this.props.pickerName?this.props.pickerName:''}
						placeholder={this.props.placeholder} onResult={this.onChangeField.bind(this)} colCount={2}/>
					<Image source={require('../images/forward.png')} style={{position: 'absolute', right: -30*em, top: 30*em, width: 10*em, height: 19*em, zIndex: 11}}/>
				</View>
			</View>
		)
	}

	onWheelChange(item, index, wheelNumber) {
		if (wheelNumber==0) {
			const {value} = item
			const {data_} = this.state
			let data1 = []
			let data2 = []
			data_.map((item_) => {
			const {id, name} = item_
			data1.push({id, name})
					if (item_.name==item.label){
				item_.children.map((item2_) => {
				const {id, name} = item2_
				data2.push({id, name})
						})
					}
			})
			let data = [data1, data2]
			this.setState({
						...this.state,
						data
			})
		}
	}

	onChangeField(fieldText, selectIndex, fieldValue) {
		let fieldName = this.props.name;
		this.props.onChangeField(fieldName, fieldText);
	}
}

export class SelectNField extends Component {
	render() {
		let {value} = this.props
		let textStyle = {alignItems: 'flex-start', textAlign: 'left'}
		if (this.props.rightAligned)
			textStyle = {...textStyle, textAlign: 'right', paddingRight: 50*em, fontSize: 28*em, paddingTop: 30*em, color: '#666'}
		let rootStyle = {backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#ccc',
			flexDirection: 'row', alignItems : 'flex-start', width: '100%', paddingLeft: 0*em}
		if (this.props.noBorder)
			rootStyle = {...rootStyle, borderBottomWidth: 0}
		return (
			<View style={rootStyle}>
				<View style={formStyles.fieldLabelWrapper}>
					<Text style={[formStyles.fieldLabel, {color: '#000'}]}>
            			{this.props.label}
					</Text>
				</View>
				<View style={{flexDirection: 'row',	alignItems: 'center', justifyContent: 'center',
					width: '76%', position: 'relative'}}>
					<RelationPicker data={this.props.data} onWheelChange={this.onWheelChange.bind(this)} iconStyle={{display: 'none'}}
						inputStyle={{borderWidth: 0, marginLeft: 0, marginRight: -90*em, alignItems: 'flex-start', textAlign: 'left',
						width: W*0.76, zIndex: 12, backgroundColor: 'transparent'}} pickerNameStyle={{color: '#333333', fontSize: 26*em}}
						confirmBtnStyle={{color: colors.primary, fontSize: 26*em}}	cancelBtnStyle={{color: colors.primary, fontSize: 26*em}}
						textStyle={textStyle} inputValue={value} pickerName={this.props.pickerName?this.props.pickerName:''}
						placeholder={this.props.placeholder} onResult={this.onChangeField.bind(this)} selCount={this.props.selCount}/>
					<Image source={require('../images/forward.png')} style={{position: 'absolute', right: -30*em, top: 30*em, width: 10*em, height: 19*em, zIndex: 11}}/>
				</View>
			</View>
		)
	}

	onWheelChange(item, index, wheelNumber) {
		if (wheelNumber==0) {
			const {value} = item
			const {data_} = this.state
			let data1 = []
			let data2 = []
			data_.map((item_) => {
				const {id, name} = item_
				data1.push({id, name})
						if (item_.name==item.label){
					item_.children.map((item2_) => {
					const {id, name} = item2_
					data2.push({id, name})
							})
						}
			})
			let data = [data1, data2]
			this.setState({
						...this.state,
						data
			})
		}
	}

	onChangeField(fieldText, selectIndex, fieldValue) {
		let fieldName = this.props.name;
		this.props.onChangeField(fieldName, fieldText);
	}
}