import {
    StyleSheet,
    Dimensions,
    PixelRatio
} from 'react-native';
import {em} from '../../../../base';

let height = Dimensions.get('window').height;
let width = Dimensions.get('window').width;
let ratio = PixelRatio.get();
let styles = StyleSheet.create({
    container: {

    },
    pickContainer:{
        flex:9,
        flexDirection:'row',
        justifyContent: 'space-around',
        marginLeft: 100*em,
        marginRight: 100*em,
    },
    modalContainer: {
        flex: 1,
        backgroundColor:'rgba(0, 0, 0, 0.5)',
    },
    innerContainer: {
        position:'absolute',
        height: 400*em,
        width: width,
        backgroundColor:'#fff',
    }
});

let rollStyles = StyleSheet.create({

    container: {
        flex:1,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        backgroundColor: 'rgba(255,255,255,0)'
    },
    middle: {
        alignSelf:'stretch',
        borderColor: '#aaa',
        borderTopWidth: 1 / ratio,
        borderBottomWidth: 1 / ratio
    },
    middleView: {
        justifyContent: 'center',
        alignItems: 'center'
    },
    textContainer: {
        height: 80*em,
        alignSelf: 'stretch',
        alignItems: 'center',
        justifyContent: 'center'
    },
    middleText: {
        color: '#046390',
        fontSize: 26*em,
        marginTop: 0,
        marginBottom: 0,
    },
    middleTextDisable: {
      color: '#aaa',
      fontSize: 26*em,
      marginTop: 0,
      marginBottom: 0,
  }
});

export {styles as styles, rollStyles as rollStyles};
