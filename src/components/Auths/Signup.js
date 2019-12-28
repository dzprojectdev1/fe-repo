import React, { Component } from "react";
import {
  Text,
  Content
} from "native-base"
import {
  ImageBackground,
  Image,
  Platform,
  Dimensions,
  TextInput,
  View, StyleSheet,
  TouchableOpacity,
  StatusBar,
  Alert
} from "react-native";
import Picker from 'react-native-wheel-picker';
import logo from '../../assets/images/logo.png';
import slogo from '../../assets/images/second_bg.png';
// import emailIcon from '../../assets/images/emailIcon.png';
// import passswordIcon from '../../assets/images/passwordIcon.png';
import userIcon from '../../assets/images/userIcon.png';

var PickerItem = Picker.Item;

class Signup extends Component {
  constructor(props) {
    super(props);
    this.state = {
      nickName: '',
      email: '',
      // password: '',
      // cpassword: '',
      birthday: new Date(),
      selected_dItem: 6,
      selected_yItem: 30,
      selected_mItem: 6,
      mitemList: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      yitemList: ['2019'],
      ditemList: ['1'],
    };
  }

  static navigationOptions = {
    header: null
  };

  componentWillMount() {
    var y_item = []
    var d_item = []
    for (var i = 1959; i < 2059; i++) {
      y_item.push("" + i);
    }
    for (var i = 1; i < 32; i++) {
      d_item.push("" + i)
    }
    this.setState({ yitemList: y_item, ditemList: d_item })
  }

  ondPickerSelect(index) {
    this.setState({
      selected_dItem: index,
    })
  }
  onmPickerSelect(index) {
    this.setState({
      selected_mItem: index,
    })
  }
  onyPickerSelect(index) {
    this.setState({
      selected_yItem: index,
    })
  }

  handleSignup() {
    if (this.state.nickName === '') {
      Alert.alert(
        '',
        "Nickname is required",
        [
          {text: 'OK', onPress: () => console.log('OK Pressed')},
        ],
        {cancelable: false},
      );
      return;
    }
    var y_item = this.state.yitemList;
    var m_item = this.state.mitemList;
    var d_item = this.state.ditemList;
    var mon = "";
    var date = "";
    if ((this.state.selected_mItem + 1) < 10) {
      mon = "0" + (this.state.selected_mItem + 1);
    }
    else {
      mon = "" + (this.state.selected_mItem + 1);
    }
    if ((this.state.selected_dItem + 1) < 10) {
      date = "0" + d_item[this.state.selected_dItem]
    }
    else {
      date = "" + d_item[this.state.selected_dItem]
    }
    var birthday = y_item[this.state.selected_yItem] + "-" + mon + "-" + date;
    // if (this.state.email == '') {
    //   Alert.alert("The email is not inputed")
    //   return;
    // }
    // if (this.state.password == '') {
    //   Alert.alert("The password is not inputed")
    //   return;
    // }
    // if (this.state.password != this.state.cpassword) {
    //   Alert.alert("The confirm password is not correct")
    //   return;
    // }
    // this.props.navigation.navigate("Register1", { nickName: this.state.nickName, email: this.state.email, password: this.state.password })
    var nowDate = new Date();
    var nowYear = nowDate.getFullYear();
    var deltaYear = parseInt(nowYear) - parseInt(y_item[this.state.selected_yItem]);
    if (deltaYear < 18) {
      Alert.alert(
        '',
        'Sorry, you must be 18 years or older to register.',
        [
          { text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
          { text: 'Yes', onPress: () => console.log("Ok Pressed") },
        ],
        { cancelable: true });
    } else {
      // this.props.navigation.navigate("Register2", { nickName: this.state.nickName, email: this.state.email, password: this.state.password, birthday: birthday, gender: gender })
      this.props.navigation.navigate("Register1", { nickName: this.state.nickName, birthday: birthday, });
    }
  }
  // gotoLogin() {
  //   this.props.navigation.navigate("Login")
  // }
  render() {
    return (
      <View style={styles.contentContainer}>
        <StatusBar backgroundColor='#fff' barStyle='dark-content' />
        <ImageBackground source={slogo} style={{ width: DEVICE_WIDTH, height: 150, marginTop: Platform.select({ 'android': 0, 'ios': 30 }), alignItems: 'center', justifyContent: 'center' }}>
          <Image source={logo} style={{ width: 205, height: 83, tintColor: '#DE5859' }} />
        </ImageBackground>
        <Content>
          <View style={{ width: DEVICE_WIDTH, alignItems: 'center', justifyContent: 'center', marginTop: 50 }}>
            <Text style={{ color: '#000', fontSize: 24, fontWeight: 'bold' }}>{"Create Account"}</Text>
          </View>
          <View style={{ width: DEVICE_WIDTH * 0.8, marginLeft: DEVICE_WIDTH * 0.1, marginTop: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              {/* <Image source={userIcon} style={{ width: 15, height: 15, tintColor: '#808080' }} /> */}
              <Text style={{ color: '#808080', fontSize: 14, marginLeft: 10 }}>{"NICKNAME"}</Text>
            </View>
            <View>
              <TextInput
                style={{ backgroundColor: 'transparent', width: DEVICE_WIDTH * 0.8, height: 40, paddingLeft: 10, color: '#000' }}
                selectionColor="#009788"
                onChangeText={nickName => this.setState({ nickName })}
                autoCapitalize="none"
                underlineColorAndroid="transparent"
              />
            </View>
            <View style={{ height: 1, width: DEVICE_WIDTH * 0.8, backgroundColor: '#808080' }} />
            <Text style={styles.requiredSent}>* This field is required</Text>
            <View style={{ width: DEVICE_WIDTH * 0.8, marginTop: 50, }}>
              <Text style={{ color: '#808080', fontSize: 14, marginLeft: 10 }}>{"BIRTHDAY"}</Text>
            </View>
            <View style={{ width: DEVICE_WIDTH * 0.8, height: 60, marginTop: Platform.select({ 'android': 15, 'ios': 0 }), flexDirection: 'row', justifyContent: 'space-between' }}>
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
            </View>
          </View>
          {/* <View style={{ width: DEVICE_WIDTH * 0.8, marginLeft: DEVICE_WIDTH * 0.1, marginTop: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Image source={emailIcon} style={{ width: 15, height: 15, tintColor: '#808080' }} />
              <Text style={{ color: '#808080', fontSize: 12, marginLeft: 10 }}>{"EMAIL ID"}</Text>
            </View>
            <View>
              <TextInput
                style={{ backgroundColor: 'transparent', width: DEVICE_WIDTH * 0.8, height: 40, paddingLeft: 10, color: '#000' }}
                selectionColor="#009788"
                // keyboardType="email-address"
                // textContentType="emailAddress"
                onChangeText={email => this.setState({ email })}
                autoCapitalize="none"
                underlineColorAndroid="transparent"
              />
            </View>
            <View style={{ height: 1, width: DEVICE_WIDTH * 0.8, backgroundColor: '#808080' }} />
          </View> */}
          {/* <View style={{ width: DEVICE_WIDTH * 0.8, marginLeft: DEVICE_WIDTH * 0.1, marginTop: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Image source={passswordIcon} style={{ width: 15, height: 15, tintColor: '#808080' }} />
              <Text style={{ color: '#808080', fontSize: 12, marginLeft: 10 }}>{"PASSWORD"}</Text>
            </View>
            <View>
              <TextInput
                style={{ backgroundColor: 'transparent', width: DEVICE_WIDTH * 0.8, height: 40, paddingLeft: 10, color: '#000' }}
                secureTextEntry
                selectionColor="#009788"
                onChangeText={password => this.setState({ password })}
                autoCapitalize="none"
                underlineColorAndroid="transparent"
              />
            </View>
            <View style={{ height: 1, width: DEVICE_WIDTH * 0.8, backgroundColor: '#808080' }} />
          </View> */}
          {/* <View style={{ width: DEVICE_WIDTH * 0.8, marginLeft: DEVICE_WIDTH * 0.1, marginTop: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Image source={passswordIcon} style={{ width: 15, height: 15, tintColor: '#808080' }} />
              <Text style={{ color: '#808080', fontSize: 12, marginLeft: 10 }}>{"CONFIRM PASSWORD"}</Text>
            </View>
            <View>
              <TextInput
                style={{ backgroundColor: 'transparent', width: DEVICE_WIDTH * 0.8, height: 40, paddingLeft: 10, color: '#000' }}
                secureTextEntry
                selectionColor="#009788"
                onChangeText={cpassword => this.setState({ cpassword })}
                autoCapitalize="none"
                underlineColorAndroid="transparent"
              />
            </View>
            <View style={{ height: 1, width: DEVICE_WIDTH * 0.8, backgroundColor: '#808080' }} />
          </View> */}
          <View style={{ width: DEVICE_WIDTH, height: 40, alignItems: 'center', justifyContent: 'center', marginTop: 40 }}>
            <TouchableOpacity style={{ width: DEVICE_WIDTH * 0.8, height: 40, borderRadius: 25, backgroundColor: '#DE5859', alignItems: 'center', justifyContent: 'center' }}
              onPress={() => this.handleSignup()}>
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>{"SIGN UP"}</Text>
            </TouchableOpacity>
          </View>
          {/* <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 30 }}>
            <Text style={{ color: '#000', fontSize: 14, }}>{"Already have an account?"}</Text>
            <TouchableOpacity onPress={() => this.gotoLogin()}>
              <Text style={{ color: '#DE5859', fontSize: 14, textDecorationLine: 'underline', fontWeight: 'bold' }}>{" Sign In "}</Text>
            </TouchableOpacity>
          </View> */}
          <View style={{ height: 10 }} />
        </Content>
      </View>
    );
  }
}
const DEVICE_WIDTH = Dimensions.get('window').width;
// const DEVICE_HEIGHT = Dimensions.get('window').height;
const styles = StyleSheet.create({
  contentContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: '#fff',
  },
  requiredSent: {
    textAlign: 'right',
    color: 'red',    
    fontSize: 10,
  }
});
export default Signup;
