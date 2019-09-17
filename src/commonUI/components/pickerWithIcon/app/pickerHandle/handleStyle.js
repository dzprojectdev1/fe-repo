import {
    StyleSheet,
    Dimensions,
    PixelRatio
} from 'react-native';
import {em} from '../../../../base'

let styles = StyleSheet.create({
    nav: {
        flexDirection: 'row',
        flex:1,
        alignItems: 'stretch',
        marginLeft: 60*em,
        marginRight: 60*em,
    },
    confirm: {
        flex:1,
        justifyContent: 'center'
    },
    confirmBtnStyle:{
        textAlign:'right',
        paddingLeft:20*em,
        paddingRight:20*em,
        fontSize: 18*em
    },
    pickerName:{
        textAlign:'center',
        fontSize: 14*em
    },
    cancel: {
        flex:1,
        justifyContent: 'center'
    },
    pickerNameContainer: {
        flex:1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    cancelBtnStyle: {
        textAlign:'left',
        paddingLeft:20*em,
        paddingRight:20*em,
        fontSize: 18*em
    }
});

export default styles;
