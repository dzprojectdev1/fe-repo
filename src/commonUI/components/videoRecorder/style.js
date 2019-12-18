import {
    StyleSheet,
    Dimensions,
    Platform,
} from 'react-native';
import {em} from '../../base';

const { width, height } = Dimensions.get('window');
export default StyleSheet.create({
    modal: {
        alignItems: 'center',
        justifyContent: 'center',
        width,
        height,
    },
    backdrop: {
        position: 'absolute',
        top: 0,
        left: 0,
        backgroundColor: 'rgba(0,0,0,0.9)',
        width,
        height,
    },
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        width,
        height,
    },
    content: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonClose: {
        position: 'absolute',
        right: 5*em,
        top: 10*em,
        width: 40*em,
        height: 40*em,
        alignItems: 'center',
        justifyContent: 'center',
    },
    preview: {
        width,
        height,
    },
    controlLayer: {
      position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        backgroundColor: 'transparent',
    },
    controls: {
        position: 'absolute',
        bottom: 0,
        height: 120*em,
        alignItems: 'center',
        justifyContent: 'center',
        width,
    },
    recodingButton: {
        marginBottom: Platform.OS === 'ios' ? 0 : 20*em,
    },
    durationText: {
        marginTop: Platform.OS === 'ios' ? 20*em : 20*em,
        color: 'white',
        textAlign: 'center',
        fontSize: 20*em,
        alignItems: 'center',
    },
    dotText: {
        color: '#D91E18',
        fontSize: 10*em,
        lineHeight: 20*em,
    },
    btnUse: {
        position: 'absolute',
        width: 80*em,
        height: 80*em,
        right: 20*em,
        top: 20*em,
        alignItems: 'center',
        justifyContent: 'center',
    },
    btnUseContainer: {
        width: 40*em,
        height: 40*em,
        borderRadius: 20*em,
        borderWidth: 2*em,
        borderColor: 'white',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#03C9A9',
    },
    btnUseText: {
        backgroundColor: 'transparent',
    },
    convertingText: {
        color: 'white',
        fontSize: 17*em,
        marginTop: 5*em,
        textAlign: 'center',
    },
});
