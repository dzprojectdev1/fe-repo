import React, {Component} from 'react';
import {
    View,
    Text,
    Dimensions,
    Animated,
    Platform,
    PickerIOS,
    StatusBar,
    Modal,
} from 'react-native';
import Pickroll from './basicRoll';
import {styles} from './pickerStyle';
import InputOuter from '../pickerTrigger/outer';
import Handle from '../pickerHandle/handle';
import {em} from '../../../../base';

let PickRoll = Platform.OS === 'ios' ? PickerIOS : Pickroll;
let modalHeight = Platform.OS === 'ios' ? 400*em : (StatusBar.currentHeight + 400*em);
let PickerItem = PickRoll.Item;

let height = Dimensions.get('window').height;

var dataArray = [];
var selIndex = [3];
var countKey = [3];
class RelationPicker extends Component {
    constructor(props, context){
        super(props, context);
        this._changeAnimateStatus = this._changeAnimateStatus.bind(this);
        this._setEventBegin = this._setEventBegin.bind(this);
        this._confirmChose = this._confirmChose.bind(this);
        this._setModalVisible = this._setModalVisible.bind(this);

        this.state = {};
        this.state.visible = props.visible;
        this.state.animatedHeight = new Animated.Value(height);

        selIndex[0] = selIndex[1] = selIndex[2] = 0;
        countKey[0] = 0;
        countKey[1] = 100;
        countKey[2] = 200;
    }

    componentWillMount() {
        this.valueCount = [];
        this.indexCount = [];
        this.str = '';
        if (this.state.visible) {
            this._setEventBegin();
        }
        this._updateData(0, 0, 0);
    }

    _calculateSelecteValue() {
        let selectIndex = [];
        let selectedValue = [];
        if (!this.props.selectIndex){
            for (let item of dataArray){
                selectIndex.push(0);
                selectedValue.push(Object.keys(item)[0]);
            }
        } else {
            selectIndex = this.props.selectIndex.slice();
            dataArray.map((item,index) =>{
                selectedValue.push(Object.keys(item)[selectIndex[index]]);
            });
        }
        return {selectIndex: selectIndex, selectedValue: selectedValue};
    }

    _confirmChose(){
        this.str = this.str +  dataArray[0][selIndex[0]].name + dataArray[1][selIndex[1]].name;
        if( this.props.selCount > 2 )
            this.str += dataArray[2][selIndex[2]].name;
        this._setModalVisible(false,'confirm');
        return this.str;
    }

    _setEventBegin(){
        this.hack = false;
        if (this.props.enable){
            this._setModalVisible(true);
            this.str = '';
            return {valueCount: this.select.selectIndex, indexCount:this.select.selectedValue};
        } else {
            this.state.visible = false;
            return 'it is disabled';
        }
    }

    _setModalVisible(visible,type) {
        if (visible){
            this.setState({visible: visible});
            Animated.timing(
                this.state.animatedHeight,
                {toValue: height - modalHeight,
                  delay: 300}
            ).start();
        } else {
            Animated.timing(
                this.state.animatedHeight,
                {toValue: height}
            ).start(() => this._changeAnimateStatus(type));
        }
    }

    _changeAnimateStatus(type){
        if (type === 'confirm'){
            if (this.props.onResult){
                this.props.onResult(this.str, this.select.selectIndex, this.select.selectedValue);
            }
            this.setState({visible:false});
        }
        else if (type === 'cancel'){
            this.setState({visible:false});
        }
    }

    _updateData(index0, index1, start) {
        dataArray.splice(dataArray.length);

        var tmp0 = [];
        for( j = 0; j < this.props.data.length; j++ ) tmp0[j] = this.props.data[j];
        dataArray[0] = tmp0;

        var tmp1 = [];
        for( j = 0; j < this.props.data[index0].children.length; j++ ) tmp1[j] = this.props.data[index0].children[j];
        dataArray[1] = tmp1;

        if( this.props.selCount == 3 ) {
            var tmp2 = [];
            len = this.props.data[index0].children[index1].children.length;
            for( j = 0; j < len; j++ ) tmp2[j] = this.props.data[index0].children[index1].children[j];
            dataArray[2] = tmp2;
        }
        for( i = start + 1; i < this.props.selCount; i++ ) countKey[i]++;
        this.forceUpdate();
    }

    render(){
        if (!this.hack) {
            this.select = this._calculateSelecteValue();
            this.hack = false;
        }

        return (
            <View style={styles.container}>
                <Modal animationType={this.props.animationType} transparent={true} visible={this.state.visible} onRequestClose={() => {this._setModalVisible(false);}}>
                    <View style={[styles.modalContainer]}>
                        <Animated.View style={[styles.innerContainer, {top: this.state.animatedHeight}]}>
                            <Handle
                                navStyle = {this.props.navStyle}
                                confirmBtnStyle = {this.props.confirmBtnStyle}
                                cancelBtnStyle = {this.props.cancelBtnStyle}
                                pickerNameStyle ={this.props.pickerNameStyle}
                                pickerName = {this.props.pickerName}
                                confirmBtnText = {this.props.confirmBtnText}
                                cancelBtnText = {this.props.cancelBtnText}
                                confirmChose = {this._confirmChose}
                                cancelChose = {this._setModalVisible}
                                />
                            <View style={styles.pickContainer}>
                            {
                                dataArray.map((row, index) =>{
                                    if( index == this.props.selCount ) return;
                                    return (
                                        <PickRoll
                                            key = {countKey[index]}
                                            style = {{flex: 1}}
                                            className = {'test' + countKey[index]}
                                            selectIndex = {this.select.selectIndex[index]}
                                            selectedValue={this.select.selectedValue[index]}
                                            pickerStyle = {{flex:1}}
                                            data = {dataArray[index]}
                                            itemCount = {dataArray[index].length}
                                            onValueChange={(newValue, newIndex) => {
                                                this.select.selectIndex.splice(index, 1, newIndex);
                                                this.select.selectedValue.splice(index, 1, newValue);
                                                if( selIndex[index] != this.select.selectIndex[index] ) {
                                                    if( index < this.props.selCount - 1 ) {
                                                        selIndex[index] = newIndex;
                                                        for( i = index + 1; i < this.props.selCount; i++ ) {
                                                            this.select.selectIndex[i] = 0;
                                                            selIndex[i] = 0;
                                                        }
                                                        this._updateData(selIndex[0], selIndex[1], index);
                                                    }
                                                }
                                                if (Platform.OS === 'ios') {
                                                    this.hack = true;
                                                    this.forceUpdate();
                                                }
                                            }}>
                                        {
                                            Platform.OS === 'ios' && (Object.keys(dataArray[index]).map((carMake) => (
                                                <PickerItem key={carMake} value={carMake} label={dataArray[index][carMake].name}/>)))
                                        }
                                        </PickRoll>);
                                    }
                                )
                            }
                            </View>
                        </Animated.View>
                    </View>
                </Modal>
                <InputOuter
                    textStyle={this.props.textStyle}
                    inputStyle={this.props.inputStyle}
                    iconSize={this.props.iconSize}
                    iconName={this.props.iconName}
                    onPress={this._setEventBegin}
                    iconStyle={this.props.iconStyle}
                    enable={this.props.enable}
                    inputValue={this.props.inputValue}
                    placeholder={this.props.placeholder}/>
            </View>
        );
    }
}

RelationPicker.defaultProps = {
    animationType: 'none',
    visible: false,
    enable: true,
    inputValue: 'please chose',
    confirmBtnText: '确定',
    cancelBtnText: '取消'
};
export default RelationPicker;
