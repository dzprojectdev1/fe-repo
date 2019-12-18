import {
  StyleSheet,
  Dimensions,
  PixelRatio
} from 'react-native';
import {em} from '../../../../base';

let styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#77D7CB'
  },
  titleContainer: {
    alignItems: 'center'
  },
  title: {
    fontSize: 18*em,
    marginTop: 18*em,
    marginBottom: 10*em,
    color: '#fff'
  },
  demoValue: {
    marginLeft: 20*em,
    marginTop: 10*em,
    marginBottom: 10*em,
    color: '#fff'
  },
  button: {
    width: 200*em,
    height: 30*em,
    marginLeft: 20*em,
    marginTop: 10*em,
    backgroundColor: '#f79e80',
    borderRadius: 3*em,
    borderWidth: 1*em,
    borderColor: '#ba3407',
    justifyContent: 'center',
    alignItems: 'center'
  }
});


export default styles;
