import {Dimensions, StyleSheet} from 'react-native';
import {em} from '../../base';

let width = Dimensions.get('window').width;

let style = StyleSheet.create({
    dateTouch: {
        width: width,
    },
    dateTouchBody: {
        flexDirection: 'row',
        height: 60*em,
        alignItems: 'center',
        justifyContent: 'center'
    },
    dateIcon: {
        width: 32*em,
        height: 32*em,
        marginLeft: 5*em,
        marginRight: 5*em
    },
    dateInput: {
        flex: 1,
        height: 60*em,
        borderWidth: 0*em,
        borderColor: '#aaa',
        fontSize: 28*em,
        alignItems: 'flex-start',
        justifyContent: 'center'
    },
    dateText: {
        color: '#333',
        fontSize: 28*em,
    },
    placeholderText: {
        fontSize: 28*em,
        color: '#c9c9c9'
    },
    datePickerMask: {
        flex: 1,
        alignItems: 'flex-end',
        flexDirection: 'row',
        backgroundColor: '#00000077'
    },
    datePickerCon: {
        backgroundColor: '#fff',
        height: 0,
        overflow: 'hidden'
    },
    btnText: {
        position: 'absolute',
        top: 0,
        height: 42*em,
//        paddingHorizontal: 20*em,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    },
    btnTextText: {
        fontSize: 26*em,
        color: '#2288ea'
    },
    btnTextCancel: {
        color: '#666'
    },
    btnCancel: {
        left: 0
    },
    btnConfirm: {
        right: 0
    },
    datePicker: {
        marginTop: 42*em,
        borderTopColor: '#ccc',
        borderTopWidth: 0
    },
    disabled: {
        backgroundColor: '#eee'
    }
});

export default style;
