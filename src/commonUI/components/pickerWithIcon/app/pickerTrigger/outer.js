/**
 * 依赖引用
 */
import React, {Component,PropTypes} from 'react';
import {
    View,
    Text,
    Dimensions,
    TouchableOpacity,
    TouchableWithoutFeedback,
    TextInput,
    Animated,
    Platform,
    PickerIOS,
    StatusBar,
    Modal,
    Image,
} from 'react-native';
import styles from './outerStyle';
import Icon from 'react-native-vector-icons/Entypo';
import {em} from '../../../../base';

/**
 * 组件扩展
 */
class InputOuter extends Component {

    /**
     * 类型约束
     * @type {{data: Requireable<any>, visible: Requireable<any>, transparent: Requireable<any>, animationType: Requireable<any>, enable: Requireable<any>, inputValue: Requireable<any>}}
       */
      /*
    static propTypes = {
        //传递的数据
        data: PropTypes.array
    };
    */

    /**
     * 构造函数
     * @param props {object} 继承的属性
     * @param context 上下文
       */
    constructor(props, context){
        super(props, context);
    }

    /**
     * 渲染函数
     * @returns {XML}
       */
    render(){
        return (
            <TouchableWithoutFeedback style={[styles.outerInput, !this.props.enable && {backgroundColor: '#888'}, this.props.inputStyle]} onPress={() => {this.props.onPress();}}>
                <View style={[styles.outerInput, !this.props.enable && {backgroundColor: 'transparent'}, this.props.inputStyle]}>
                    <View style={[styles.textInput]} style = {[styles.textInput]}>
                        {this.props.inputValue?
                            <Text style={[styles.inputLabel, this.props.textStyle]}>{this.props.inputValue}</Text>:
                            <Text style={[styles.inputLabel, this.props.textStyle, {fontSize: 28*em, color: '#999'}]}>{this.props.placeholder}</Text>
                        }
                    </View>
                </View>
            </TouchableWithoutFeedback>
        );
    }
}

export default InputOuter;
