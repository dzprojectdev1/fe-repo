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
  StatusBar,
  AsyncStorage,
  ActivityIndicator,
  Alert,
} from "react-native";
import nativeFirebase from 'react-native-firebase';
<<<<<<< HEAD
import QB from 'quickblox-react-native-sdk';
import firebase from 'firebase';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { changeReadFlag, updateQuickBlox, updateFCMTocken } from '../../Action';
import DeviceInfo from 'react-native-device-info';
=======
import firebase from 'firebase';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { changeReadFlag } from '../../Action';
import DeviceInfo from 'react-native-device-info';
// import store from 'react-native-simple-store';
// import logo from '../assets/images/logo.png';
>>>>>>> d560d4782725f6adaef8daaa058bfdb8f6d6ff8f
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
    nativeFirebase.messaging().getToken().then(fcmToken => {
      if (fcmToken) {
        this.getdeviceId().then(deviceId => {
          if (deviceId) {
            var details = {
              'fcmId': fcmToken
            };
            var formBody = [];
            for (var property in details) {
              var encodedKey = encodeURIComponent(property);
              var encodedValue = encodeURIComponent(details[property]);
              formBody.push(encodedKey + "=" + encodedValue);
            }
            formBody = formBody.join("&");
            fetch(`${SERVER_URL}/api/user/checkDeviceUniqueId/${deviceId}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
              },
              body: formBody
            }).then((response) => response.json())
              .then((responseJson) => {
                if (responseJson.error === false) {
                  if (responseJson.user) {
                    //logined
<<<<<<< HEAD
                    QB.auth
                      .login({
                        login: responseJson.user.id,
                        password: 'quickblox'
                      }).then((info) => {
                        // signed in successfully, handle info as necessary
                        // info.user - user information
                        // info.session - current session
                        this.props.updateQuickBlox(info);
                        this.props.updateFCMTocken(fcmToken);
                        const subscription = { deviceToken: fcmToken }
                        QB.subscriptions
                          .create(subscription)
                          .then(() => {
                            /* subscription(s) created successfully */
                            this.chatConnect(responseJson, info);
                          }).catch(e => {
                            /* handle error */
                            alert(JSON.stringify(e.message))
                          });
                      }).catch((e) => {
                        // handle error
                        alert(JSON.stringify(e.message));
                        if (e.message === "Unauthorized") {
                          QB.users
                            .create({
                              email: responseJson.user.name + '@quickblox.com',
                              fullName: responseJson.user.name,
                              login: responseJson.user.id,
                              password: 'quickblox',
                              // phone: '404-388-5366',
                              tags: ['#awesome', '#quickblox']
                            }).then((user) => {
                              // user created successfully
                              this.props.updateQuickBlox(user);
                              this.props.updateFCMTocken(fcmToken);
                              const subscription = { deviceToken: fcmToken }
                              QB.subscriptions
                                .create(subscription)
                                .then(() => {
                                  /* subscription(s) created successfully */
                                  this.chatConnect(responseJson, user);
                                }).catch(e => {
                                  /* handle error */
                                  alert(JSON.stringify(e.message))
                                });
                            }).catch((e) => {
                              alert(JSON.stringify(e.message));
                            })
                        }
                      });
=======
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
                    Global.saveData.coin_count = responseJson.user.coin_count;      
                    Global.saveData.account_status = responseJson.user.account_status; 
                    Global.saveData.confirmation_code = responseJson.user.confirmation_code; 
                    Global.saveData.auto_block = responseJson.user.auto_block;
                    Global.saveData.is_admin = responseJson.user.is_admin;
                    Global.saveData.fan_count = responseJson.user.fan_count;
                    Global.saveData.coin_per_message = responseJson.user.coin_per_message;

                    if (responseJson.user.account_status == 3) {

                      let alert_str = 'Your account is closed. Please send an email to admin@dazzleddate.com if this was done in error. Please include the following information in your email ';
                      alert_str += 'User ID : ' + responseJson.user.id +' Confirmation Code ' + responseJson.user.confirmation_code;
                      alert_str += ' In your email, please describe in details why this was done in error';

                      Alert.alert(
                        '',
                        alert_str,
                        [],
                        {cancelable: false},
                      );
                    } else if (responseJson.user.account_status == 2) {
                      Alert.alert(
                        '',
                        "You have to activate your account",
                        [
                          {text: 'Activate', onPress: () => this.activateAccount()},
                        ],
                        {cancelable: false},
                      );
                    } else if (responseJson.user.account_status == 0 || responseJson.user.account_status == 9 || responseJson.user.account_status == 10) {

                      let alert_str = 'Your account was banned for violating terms of use. Please send an email to admin@dazzleddate.com if this was done in error. Please include the following information in your email ';
                      alert_str += 'User ID : ' + responseJson.user.id +' Confirmation Code ' + responseJson.user.confirmation_code;
                      alert_str += ' In your email, please describe in details why this was done in error';

                      Alert.alert(
                        '',
                        alert_str,
                        [],
                        {cancelable: false},
                      );
                    } else {
                      this.checkUnreadMessage();

                      this.setState({
                        isLoaded: false
                      }, function() {
                        this.props.navigation.replace("BrowseList");
                      });                
                    }
>>>>>>> d560d4782725f6adaef8daaa058bfdb8f6d6ff8f
                  } else {
                    this.setState({
                      isLoaded: false
                    }, function () {
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
        });
      }
    });
<<<<<<< HEAD
  }

  chatConnect = (responseJson, info) => {
    QB.chat
      .isConnected()
      .then((connected) => { // boolean
        // handle as necessary, i.e.
        // if (connected === false) reconnect()
        if (connected === true) {
          this.initWebRTC(responseJson);
        } else {
          QB.chat
            .connect({
              userId: info.user.id,
              password: 'quickblox'
            }).then(() => {
              // connected successfully
              this.initWebRTC(responseJson);
            }).catch((e) => {
              // some error occurred
              alert(JSON.stringify(e.message));
            });
        }
      }).catch((e) => {
        // handle error
        alert(JSON.stringify(e.message));
      });
  }

  initWebRTC = (responseJson) => {
    QB.webrtc
      .init()
      .then(() => {
        /* module is ready for calls processing */
        this.nextThrough(responseJson);
      }).catch((e) => {
        /* handle error */
        alert(JSON.stringify(e.message))
      });
  }

  nextThrough = (responseJson) => {
    // connected successfully
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
    Global.saveData.coin_count = responseJson.user.coin_count;
    Global.saveData.account_status = responseJson.user.account_status;
    Global.saveData.confirmation_code = responseJson.user.confirmation_code;
    Global.saveData.auto_block = responseJson.user.auto_block;
    Global.saveData.is_admin = responseJson.user.is_admin;
    Global.saveData.fan_count = responseJson.user.fan_count;
    Global.saveData.coin_per_message = responseJson.user.coin_per_message;

    if (responseJson.user.account_status == 3) {
      let alert_str = 'Your account is closed. Please send an email to admin@dazzleddate.com if this was done in error. Please include the following information in your email ';
      alert_str += 'User ID : ' + responseJson.user.id + ' Confirmation Code ' + responseJson.user.confirmation_code;
      alert_str += ' In your email, please describe in details why this was done in error';

      Alert.alert(
        '',
        alert_str,
        [],
        { cancelable: false },
      );
    } else if (responseJson.user.account_status == 2) {
      Alert.alert(
        '',
        "You have to activate your account",
        [
          { text: 'Activate', onPress: () => this.activateAccount() },
        ],
        { cancelable: false },
      );
    } else if (responseJson.user.account_status == 0 || responseJson.user.account_status == 9 || responseJson.user.account_status == 10) {

      let alert_str = 'Your account was banned for violating terms of use. Please send an email to admin@dazzleddate.com if this was done in error. Please include the following information in your email ';
      alert_str += 'User ID : ' + responseJson.user.id + ' Confirmation Code ' + responseJson.user.confirmation_code;
      alert_str += ' In your email, please describe in details why this was done in error';

      Alert.alert(
        '',
        alert_str,
        [],
        { cancelable: false },
      );
    } else {
      this.checkUnreadMessage();
      this.setState({
        isLoaded: false
      }, function () {
        this.props.navigation.replace("BrowseList");
      });
    }
=======

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
>>>>>>> d560d4782725f6adaef8daaa058bfdb8f6d6ff8f
  }

  checkUnreadMessage = () => {
    firebase.database().ref().child('dz-chat-unread').child(Global.saveData.u_id + '/')
      .on('value', (value) => {
        let newPayload = {};
        let senderIdArr = value.toJSON();
        if (senderIdArr) {
          senderIdArr = senderIdArr.split(',');
          newPayload = {
            unreadFlag: true,
            senders: senderIdArr
          }
        } else {
          newPayload = {
            unreadFlag: false,
            senders: senderIdArr
          }
        }
        this.props.changeReadFlag(newPayload);
      });
  }

  activateAccount() {
    fetch(`${SERVER_URL}/api/user/activateAccount`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': Global.saveData.token
      }
    }).then((response) => response.json())
      .then((responseJson) => {
        if (!responseJson.error) {
          Alert.alert('Your account is activated');
          this.props.navigation.replace("BrowseList");
          Global.saveData.account_status = 1;
        }
      })
      .catch((error) => {
        alert(JSON.stringify(error))
        return
      });
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
            <View style={{ flex: 1, alignSelf: 'center', justifyContent: 'center', justifyContent: 'space-around', padding: 10 }}>
              <ActivityIndicator size="large" color="#FFFFFF" />
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

const mapStateToProps = (state) => {
<<<<<<< HEAD
  const { unreadFlag, senders, quickBloxInfo, fcmID } = state.reducer
  return { unreadFlag, senders, quickBloxInfo, fcmID }
=======
  const { unreadFlag, senders } = state.reducer
  return { unreadFlag, senders }
>>>>>>> d560d4782725f6adaef8daaa058bfdb8f6d6ff8f
};

const mapDispatchToProps = dispatch => (
  bindActionCreators({
    changeReadFlag,
<<<<<<< HEAD
    updateQuickBlox,
    updateFCMTocken
=======
>>>>>>> d560d4782725f6adaef8daaa058bfdb8f6d6ff8f
  }, dispatch)
);

export default connect(mapStateToProps, mapDispatchToProps)(FirstScreen);
