import React, {Component} from 'react';
import {
  ImageBackground,
  Image,
  Platform,
  Dimensions,
  View,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  TextInput,
  Alert,
  Text,
} from 'react-native';
import Picker from '@gregfrench/react-native-wheel-picker';
import logo from '../../assets/images/logo.png';
import slogo from '../../assets/images/second_bg.png';
import radioIcon from '../../assets/images/radio.png';
import unradioIcon from '../../assets/images/unradio.png';

const PickerItem = Picker.Item;
const DEVICE_WIDTH = Dimensions.get('window').width;
const DEVICE_HEIGHT = Dimensions.get('window').height;

class Register1 extends Component {
  constructor(props) {
    super(props);
    this.state = {
      nickName: '',
      birthday: new Date(),
      isMale: true,
      description: '',
    };
  }

  static navigationOptions = {
    header: null,
  };

  componentDidMount() {
    const {nickName, birthday} = this.props.route.params;
    this.setState({nickName, birthday});
  }
  goNext() {
    const {description, isMale, nickName, birthday} = this.state;

    if (description === '') {
      Alert.alert(
        '',
        'Introduction is required',
        [{text: 'OK', onPress: () => console.log('OK Pressed')}],
        {cancelable: false},
      );
      return;
    }

    const gender = isMale ? 1 : 2;

    this.props.navigation.navigate('Register2', {
      nickName,
      birthday,
      gender,
      description,
    });
  }

  render() {
    return (
      <View style={styles.contentContainer}>
        <StatusBar backgroundColor="#fff" barStyle="dark-content" />
        <ImageBackground
          source={slogo}
          style={{
            width: DEVICE_WIDTH,
            height: 150,
            marginTop: Platform.select({android: 0, ios: 30}),
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Image
            source={logo}
            style={{width: 205, height: 83, tintColor: '#DE5859'}}
          />
        </ImageBackground>
        <View>
          <View
            style={{
              width: DEVICE_WIDTH * 0.8,
              marginLeft: DEVICE_WIDTH * 0.1,
              marginTop: 50,
            }}>
            <Text style={{color: '#808080', fontSize: 12, marginLeft: 10}}>
              {'INTRODUCTION'}
            </Text>
          </View>
          <View
            style={{
              width: DEVICE_WIDTH * 0.8,
              marginLeft: DEVICE_WIDTH * 0.1,
              marginTop: Platform.select({android: 15, ios: 15}),
            }}>
            <TextInput
              style={{
                borderColor: 'gray',
                borderWidth: 1,
                minHeight: DEVICE_HEIGHT * 0.3,
                color: '#000',
              }}
              onChangeText={description => {
                this.setState({description});
              }}
              value={this.state.description}
              maxLength={255}
              multiline
              textAlignVertical="top"
            />
            <Text style={styles.requiredSent}>* This field is required</Text>
          </View>
          {/* <View style={{ width: DEVICE_WIDTH * 0.8, marginLeft: DEVICE_WIDTH * 0.1, marginTop: 50, }}>
            <Text style={{ color: '#808080', fontSize: 12, marginLeft: 10 }}>{"BIRTHDAY"}</Text>
          </View>
          <View style={{ width: DEVICE_WIDTH * 0.8, marginLeft: DEVICE_WIDTH * 0.1, height: 60, marginTop: Platform.select({ 'android': 15, 'ios': 0 }), flexDirection: 'row', justifyContent: 'space-between' }}>
            <Picker style={{ width: 60, height: 60, backgroundColor: '#fff', tintColor: '#00f' }}
              selectedValue={this.state.selected_mItem}
              itemStyle={{ color: "#000", fontSize: 16 }}
              onValueChange={(index) => this.onmPickerSelect(index)}>
              {this.state.mitemList.map((value, i) => (
                <PickerItem label={value} value={i} key={"money" + value} />
              ))}
            </Picker>
            <Picker style={{ width: 60, height: 60, backgroundColor: '#fff', tintColor: '#00f' }}
              selectedValue={this.state.selected_dItem}
              itemStyle={{ color: "#000", fontSize: 16, }}
              onValueChange={(index) => this.ondPickerSelect(index)}>
              {this.state.ditemList.map((value, i) => (
                <PickerItem label={value} value={i} key={"money" + value} />
              ))}
            </Picker>
            <Picker style={{ width: 60, height: 60, backgroundColor: '#fff', tintColor: '#00f' }}
              selectedValue={this.state.selected_yItem}
              itemStyle={{ color: "#000", fontSize: 16 }}
              onValueChange={(index) => this.onyPickerSelect(index)}>
              {this.state.yitemList.map((value, i) => (
                <PickerItem label={value} value={i} key={"money" + value} />
              ))}
            </Picker>
          </View> */}
          <View
            style={{
              width: DEVICE_WIDTH * 0.8,
              marginLeft: DEVICE_WIDTH * 0.1,
              marginTop: 50,
            }}>
            <Text style={{color: '#808080', fontSize: 12, marginLeft: 10}}>
              {'GENDER'}
            </Text>
          </View>
          <View
            style={{
              width: DEVICE_WIDTH * 0.8,
              marginLeft: DEVICE_WIDTH * 0.1,
              height: 30,
              marginTop: Platform.select({android: 15, ios: 15}),
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onPress={() => this.setState({isMale: true})}>
              {!this.state.isMale && (
                <Image
                  source={unradioIcon}
                  style={{tintColor: '#DE5859', width: 15, height: 15}}
                />
              )}
              {this.state.isMale && (
                <Image
                  source={radioIcon}
                  style={{tintColor: '#DE5859', width: 15, height: 15}}
                />
              )}
              <Text
                style={{color: '#DE5859', marginLeft: 5, fontWeight: 'bold'}}>
                {'Male'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                marginLeft: 20,
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onPress={() => this.setState({isMale: false})}>
              {!this.state.isMale && (
                <Image
                  source={radioIcon}
                  style={{tintColor: '#DE5859', width: 15, height: 15}}
                />
              )}
              {this.state.isMale && (
                <Image
                  source={unradioIcon}
                  style={{tintColor: '#DE5859', width: 15, height: 15}}
                />
              )}
              <Text
                style={{color: '#DE5859', marginLeft: 5, fontWeight: 'bold'}}>
                {'Female'}
              </Text>
            </TouchableOpacity>
          </View>
          <View
            style={{
              width: DEVICE_WIDTH,
              height: 50,
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: 20,
            }}>
            <TouchableOpacity
              style={{
                width: DEVICE_WIDTH * 0.8,
                height: 40,
                borderRadius: 20,
                backgroundColor: '#DE5859',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onPress={() => this.goNext()}>
              <Text style={{color: '#fff', fontSize: 16, fontWeight: 'bold'}}>
                {'NEXT'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  contentContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: '#fff',
  },
  instructions: {
    textAlign: 'center',
    color: '#3333ff',
    marginBottom: 5,
  },
  requiredSent: {
    textAlign: 'right',
    color: 'red',
    fontSize: 10,
  },
});
export default Register1;
