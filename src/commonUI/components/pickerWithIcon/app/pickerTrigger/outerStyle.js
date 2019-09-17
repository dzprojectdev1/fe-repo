import {
    StyleSheet,
    Dimensions,
    PixelRatio
} from 'react-native';
import {em} from '../../../../base';

let styles = StyleSheet.create({
    container: {
    },
    outerInput: {
        borderColor:'#d8d8d8',
        borderWidth: 1*em,
        marginLeft:20*em,
        marginRight:20*em,
        marginBottom:5*em,
        marginTop:5*em,
        flexDirection:'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 40*em,
        backgroundColor: 'transparent',
        borderRadius: 3*em
    },
    textInput:{
        flex: 1,
        height: 40*em,
        justifyContent: 'center'
    },
    inputLabel: {
        fontSize: 14*em,
        color: '#666',
        paddingLeft: 10*em
    },
    vectorIcon: {
        marginRight: 10*em
    },
    icon: {
        width:30*em,
        height:30*em
    }
});

export default styles;
