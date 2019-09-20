import React, { Component } from "react";
import {
  Text,
} from "native-base"
import {
  ImageBackground,
  Dimensions,
  View,
  StyleSheet,
  TouchableOpacity,
  BackHandler,
  StatusBar,
  AsyncStorage,
  ActivityIndicator,
  Alert
} from "react-native";
import DeviceInfo from 'react-native-device-info';
// import store from 'react-native-simple-store';
// import logo from '../assets/images/logo.png';
import firstBg from '../assets/images/first_bg.jpg';
import Global from './Global';

import { SERVER_URL } from '../config/constants';

class FirstScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoaded: true,
    };
  }
  static navigationOptions = {
    header: null
  };

  getdeviceId = async () => {
    //Getting the Unique Id from here
    var id = DeviceInfo.getUniqueID();
    return id;
  };

  componentDidMount() {
    this.getdeviceId().then(deviceId => {
      if (deviceId) {
        fetch(`${SERVER_URL}/api/user/checkDeviceUniqueId/${deviceId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }).then((response) => response.json())
          .then((responseJson) => {
            
            if (responseJson.error === false) {
              if (responseJson.user) {
                //logined
                Global.saveData.token = responseJson.user.token;
                Global.saveData.u_id = responseJson.user.id;
                Global.saveData.u_name = responseJson.user.name;
                Global.saveData.u_age = responseJson.user.age;
                Global.saveData.u_gender = responseJson.user.gender;
                Global.saveData.u_email = responseJson.user.email;
                Global.saveData.u_language = responseJson.user.language;
                Global.saveData.u_city = responseJson.user.ethnicity;
                Global.saveData.u_country = responseJson.user.country;
                Global.saveData.u_description = responseJson.user.description;
                Global.saveData.newUser = false;
                
                this.setState({
                  isLoaded: false
                }, function() {
                  this.props.navigation.replace("Browse");
                });                
              } else {
                this.setState({
                  isLoaded: false
                }, function() {
                  this.props.navigation.navigate("Signup");
                });
              }
            }
          }).catch(error => {
            alert(JSON.stringify(error));
          });
      } else {
        this.setState({
          isLoaded: false
        })
      }
    })
    // this.retrieveData().then((userToken) => {
    //   if (userToken) {
    //     fetch(`${SERVER_URL}/api/user/checkLoginStatus`, {
    //       method: 'GET',
    //       headers: {
    //         'Content-Type': 'application/x-www-form-urlencoded',
    //         'Authorization': userToken
    //       }
    //     }).then((response) => response.json())
    //       .then((responseJson) => {
    //         if (responseJson.message === 'Auth Failed') {
    //           this.setState({
    //             isLoaded: false
    //           });
    //         } else if (!responseJson.error) {
    //           Global.saveData.token = userToken;
    //           Global.saveData.u_id = responseJson.data.id;
    //           Global.saveData.u_name = responseJson.data.name;
    //           Global.saveData.u_age = responseJson.data.age;
    //           Global.saveData.u_gender = responseJson.data.gender;
    //           Global.saveData.u_email = responseJson.data.email;
    //           Global.saveData.u_language = responseJson.data.language;
    //           Global.saveData.u_city = responseJson.data.ethnicity;
    //           Global.saveData.u_country = responseJson.data.country;
    //           Global.saveData.newUser = false;
    //           if (parseInt(responseJson.data.email_status) !== 1) {
    //             this.props.navigation.replace("EmailConfirm");
    //           } else {
    //             this.props.navigation.replace("Browse");
    //           }
    //         } else {
    //           Alert.alert(
    //             '',
    //             responseJson.message,
    //             [
    //               { text: 'Ok', onPress: () => console.log(responseJson.message)},
    //             ],
    //             { cancelable: true });
    //           this.setState({
    //             isLoaded: false
    //           });
    //         } 
    //       }).catch((error) => {
    //         return
    //       });
    //   } else {
    //     this.setState({
    //       isLoaded: false
    //     });
    //   }
    // });
  }
  retrieveData = async () => {
    try {
      const value = await AsyncStorage.getItem('globalData');      // We have data!!
      return JSON.parse(value);
    } catch (error) {
      // Error retrieving data
      console.log(error);
    }
    return;
  };
  gotoLogin() {
    this.props.navigation.replace("Login");
  }
  gotoSignUp() {
    this.props.navigation.navigate("Signup");
  }
  render() {
    return (
      <View style={styles.contentContainer}>
        <ImageBackground source={firstBg} style={{ width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
          <StatusBar backgroundColor='#ED6164' barStyle='dark-content' />
          {(this.state.isLoaded === false) && (
            <View style={{ position: 'absolute', width: DEVICE_WIDTH, height: 40, bottom: 60, left: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
              {/* <TouchableOpacity style={{ alignItems: 'center', justifyContent: 'center', width: 150, height: 40, borderWidth: 1, borderRadius: 20, borderColor: '#fff' }}
                onPress={() => this.gotoLogin()}>
                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 14 }}>{"Login"}</Text>
              </TouchableOpacity> */}
              <TouchableOpacity style={{ alignItems: 'center', justifyContent: 'center', width: 150, height: 40, borderWidth: 1, borderRadius: 20, borderColor: '#fff', marginLeft: 5 }}
                onPress={() => this.gotoSignUp()}>
                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 14 }}>{"REGISTER"}</Text>
              </TouchableOpacity>
            </View>
          )}
          {(this.state.isLoaded === true) && (
            <View style={{flex: 1, alignSelf: 'center', justifyContent: 'center', justifyContent: 'space-around', padding: 10}}>
              <ActivityIndicator size="large" color="#FFFFFF"/>
            </View>
          )}
        </ImageBackground>
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
    backgroundColor: '#ED6164',
    alignItems: 'center',
    justifyContent: 'center'
  },
});
export default FirstScreen;
