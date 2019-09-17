import {
    StyleSheet,
} from 'react-native';
import {em} from '../../../base';

export default StyleSheet.create({
    buttonContainer: {
        width: 80*em,
        height: 80*em,
        borderRadius: 40*em,
        backgroundColor: '#D91E18',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 5*em,
        borderColor: 'white',
    },
    circleInside: {
        width: 60*em,
        height: 60*em,
        borderRadius: 30*em,
        backgroundColor: '#D91E18',
    },
    buttonStopContainer: {
        backgroundColor: 'transparent',
    },
    buttonStop: {
        backgroundColor: '#D91E18',
        width: 40*em,
        height: 40*em,
        borderRadius: 3*em,
    },
});
