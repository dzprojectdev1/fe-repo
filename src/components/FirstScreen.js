import React, {Component} from 'react';
import {Text} from 'native-base';
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  Dimensions,
  ImageBackground,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {
  changeReadFlag,
  updateFCMTocken,
  updateQuickBlox,
  updateUserData,
} from '../../Action';
import DeviceInfo from 'react-native-device-info';
import logo from '../assets/images/logo.png';
import Global from './Global';
import {FIREBASE_DB, FIREBASE_DB_UNREAD, SERVER_URL} from '../config/constants';
import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import database from '@react-native-firebase/database';
import {isQBOn} from '../config';
import auth from '@react-native-firebase/auth';
import * as Sentry from '@sentry/react-native';

class FirstScreen extends Component {
  static navigationOptions = {
    header: null,
  };

  constructor(props) {
    super(props);
    this.state = {
      isLoaded: true,
    };
  }

  getdeviceId = async () => {
    let id = await DeviceInfo.getUniqueId();
    return id;
  };

  // async checkMultiPermissions() {
  //   try {
  //     let result = await PermissionsAndroid.requestMultiple([
  //       PermissionsAndroid.PERMISSIONS.CAMERA,
  //       PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
  //     ]).catch(e => {
  //       console.log('request permission', e.message);
  //     });
  //     if (
  //       result['android.permission.CAMERA'] &&
  //       result['android.permission.RECORD_AUDIO'] === 'granted'
  //     ) {
  //       return true;
  //     }
  //     return false;
  //   } catch (error) {
  //     // Error retrieving data
  //     Sentry.captureException(new Error(error));
  //     console.log('check permissions = ', error.message);
  //     return false;
  //   }
  // }

  async componentDidMount() {
    // let isAllowed = await this.checkMultiPermissions();
    let isAllowed = true;
    if (!auth().currentUser) {
      await auth().signInWithEmailAndPassword(
        'admin@dorry.ai',
        'dorry.ai#&T^%^%#UIUG',
      );
    }
    if (isAllowed) {
      let fcmToken = await AsyncStorage.getItem('fcmToken');
      if (!fcmToken) {
        fcmToken = await messaging().getToken();
      }
      if (fcmToken) {
        this.props.updateFCMTocken(fcmToken);
        let deviceId = await this.getdeviceId();
        // let deviceId = '84e3753af8012d49';
        // let deviceId = 'ac630ee6f3187683';
        const details = {fcmId: fcmToken};
        Global.saveData.device_id = deviceId;
        let formBody = [];
        for (const property in details) {
          const encodedKey = encodeURIComponent(property);
          const encodedValue = encodeURIComponent(details[property]);
          formBody.push(encodedKey + '=' + encodedValue);
        }
        formBody = formBody.join('&');

        let responseJson = await fetch(
          `${SERVER_URL}/api/user/checkDeviceUniqueId/${deviceId}`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formBody,
          },
        )
          .then(response => response.json())
          .catch(e => {
            Sentry.captureException(new Error(e));
            console.log(e.message);
          });
        if (responseJson.error === false) {
          if (responseJson.user) {
            if (isQBOn()) {
              // let info = await QB.auth
              //   .login({
              //     login: responseJson.user.id,
              //     password: 'quickblox',
              //   })
              //   .catch(e => {
              //     console.log('my login = ', e.message);
              //   });
              // if (!info) {
              //   let user = await QB.users
              //     .create({
              //       fullName: responseJson.user.name,
              //       login: responseJson.user.id,
              //       password: 'quickblox',
              //       // phone: '404-388-5366',
              //       tags: ['awesome', 'quickblox'],
              //     })
              //     .catch(e => {
              //       console.log(e.message);
              //     });
              //   // eslint-disable-next-line no-shadow
              //   let info = await QB.auth
              //     .login({
              //       login: user.login,
              //       password: 'quickblox',
              //     })
              //     .catch(e => {
              //       // handle error
              //       console.log('my login = ', e.message);
              //     });
              //   this.props.updateQuickBlox(info);
              //   // const subscription = { deviceToken: fcmToken };
              //   // await QB.subscriptions.create(subscription).catch(e => {
              //   //   /* handle error */
              //   //   console.log("subscription = ", e.message);
              //   // });
              //   let isConnected = await QB.chat.isConnected().catch(e => {
              //     //console.log('chat connect check = ', e.message);
              //   });
              //   if (isConnected === false) {
              //     await QB.chat
              //       .connect({userId: info.user.id, password: 'quickblox'})
              //       .catch(e => {
              //         console.log('new chat connect = ', e.message);
              //       });
              //   }
              //   await QB.webrtc.init().catch(e => {
              //     /* handle error */
              //     console.log(e.message);
              //   });
              //   this.nextThrough(responseJson);
              // } else {
              //   this.props.updateQuickBlox(info);
              //   const subscription = {deviceToken: fcmToken};
              //   await QB.subscriptions.create(subscription).catch(e => {
              //     /* handle error */
              //     console.log('subscription = ', e.message);
              //   });
              //   let isConnected = await QB.chat.isConnected().catch(e => {
              //     console.log('chat connect check = ', e.message);
              //   });
              //   if (isConnected === false) {
              //     await QB.chat
              //       .connect({userId: info.user.id, password: 'quickblox'})
              //       .catch(e => {
              //         console.log('new chat connect = ', e.message);
              //       });
              //   }
              //   await QB.webrtc.init().catch(e => {
              //     /* handle error */
              //     console.log(e.message);
              //   });
              //   this.nextThrough(responseJson);
              // }
            }
            this.nextThrough(responseJson);
          } else {
            this.setState(
              {
                isLoaded: false,
              },
              function () {
                this.props.navigation.navigate('Signup');
              },
            );
          }
        }
      }
    } else {
      Alert.alert(
        'Permission Required',
        'This app requires some permissions, please restart app and make it to be granted.',
        [{text: 'OK', onPress: () => BackHandler.exitApp()}],
        {cancelable: false},
      );
    }
  }

  nextThrough = responseJson => {
    // connected successfully
    // console.log("responseJson First Screen", responseJson);
    this.props.updateUserData(responseJson.user);
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

    Sentry.setUser({
      email: responseJson.user.email,
      id: responseJson.user.id,
      username: responseJson.user.name,
    });

    Sentry.setTag('FIREBASE_DB', FIREBASE_DB);
    Sentry.setTag('FIREBASE_DB_UNREAD', FIREBASE_DB_UNREAD);

    if (responseJson.user.account_status == 3) {
      let alert_str =
        'Your account is closed. Please send an email to contact@dorry.ai if this was done in error. Please include the following information in your email ';
      alert_str +=
        'User ID : ' +
        responseJson.user.id +
        ' Confirmation Code ' +
        responseJson.user.confirmation_code;
      alert_str +=
        ' In your email, please describe in details why this was done in error';

      Alert.alert('', alert_str, [], {cancelable: false});
    } else if (responseJson.user.account_status == 2) {
      Alert.alert(
        '',
        'You have to activate your account',
        [{text: 'Activate', onPress: () => this.activateAccount()}],
        {cancelable: false},
      );
    } else if (
      responseJson.user.account_status == 0 ||
      responseJson.user.account_status == 9 ||
      responseJson.user.account_status == 10
    ) {
      let alert_str =
        'Your account was banned for violating terms of use. Please send an email to contact@dorry.ai if this was done in error. Please include the following information in your email ';
      alert_str +=
        'User ID : ' +
        responseJson.user.id +
        ' Confirmation Code ' +
        responseJson.user.confirmation_code;
      alert_str +=
        ' In your email, please describe in details why this was done in error';

      Alert.alert('', alert_str, [], {cancelable: false});
    } else {
      this.checkUnreadMessage();
      this.setState(
        {
          isLoaded: false,
        },
        function () {
          this.props.navigation.replace('BrowseList');
        },
      );
    }
  };

  checkUnreadMessage = () => {
    database()
      .ref()
      .child(FIREBASE_DB_UNREAD)
      .child(Global.saveData.u_id + '/')
      .on('value', value => {
        let newPayload = {};
        let senderIdArr = value.toJSON();
        if (senderIdArr) {
          senderIdArr = senderIdArr.split(',');
          newPayload = {
            unreadFlag: true,
            senders: senderIdArr,
          };
        } else {
          newPayload = {
            unreadFlag: false,
            senders: senderIdArr,
          };
        }
        this.props.changeReadFlag(newPayload);
      });
  };

  activateAccount() {
    fetch(`${SERVER_URL}/api/user/activateAccount`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: Global.saveData.token,
      },
    })
      .then(response => response.json())
      .then(responseJson => {
        if (!responseJson.error) {
          Alert.alert('Your account is activated');
          this.props.navigation.replace('BrowseList');
          Global.saveData.account_status = 1;
        }
      })
      .catch(error => {
        console.log(error.message);
      });
  }

  retrieveData = async () => {
    try {
      const value = await AsyncStorage.getItem('globalData'); // We have data!!
      return JSON.parse(value);
    } catch (error) {
      // Error retrieving data
      Sentry.captureException(new Error(error));
      console.log(error.message);
    }
  };

  gotoLogin() {
    this.props.navigation.replace('Login');
  }

  gotoSignUp() {
    this.props.navigation.navigate('Signup');
  }

  render() {
    return (
      <View style={styles.contentContainer}>
        <View
          style={{
            backgroundColor: '#E06869',
            width: '100%',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
          }}>
          <View
            style={{
              flex: 1,
              width: 300,
              height: 300,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <ImageBackground
              source={logo}
              style={{
                width: 250,
                height: 250,
              }}
            />
          </View>
          <StatusBar backgroundColor="#ED6164" barStyle="dark-content" />
          {this.state.isLoaded === false && (
            <View
              style={{
                position: 'absolute',
                width: DEVICE_WIDTH,
                height: 40,
                bottom: 60,
                left: 0,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              {/* <TouchableOpacity style={{ alignItems: 'center', justifyContent: 'center', width: 150, height: 40, borderWidth: 1, borderRadius: 20, borderColor: '#fff' }}
                onPress={() => this.gotoLogin()}>
                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 14 }}>{"Login"}</Text>
              </TouchableOpacity> */}
              <TouchableOpacity
                style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 150,
                  height: 40,
                  borderWidth: 1,
                  borderRadius: 20,
                  borderColor: '#fff',
                  marginLeft: 5,
                }}
                onPress={() => this.gotoSignUp()}>
                <Text style={{color: '#fff', fontWeight: 'bold', fontSize: 14}}>
                  {'REGISTER'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
          {this.state.isLoaded === true && (
            <View
              style={{
                flex: 1,
                alignSelf: 'center',
                justifyContent: 'center',
                justifyContent: 'space-around',
                padding: 10,
              }}>
              <ActivityIndicator size="large" color="#FFFFFF" />
            </View>
          )}
        </View>
        {/*<ImageBackground*/}
        {/*  source={firstBg}*/}
        {/*  style={{*/}
        {/*    width: '100%',*/}
        {/*    height: '100%',*/}
        {/*    alignItems: 'center',*/}
        {/*    justifyContent: 'center',*/}
        {/*  }}>*/}
        {/*  <StatusBar backgroundColor="#ED6164" barStyle="dark-content" />*/}
        {/*  {this.state.isLoaded === false && (*/}
        {/*    <View*/}
        {/*      style={{*/}
        {/*        position: 'absolute',*/}
        {/*        width: DEVICE_WIDTH,*/}
        {/*        height: 40,*/}
        {/*        bottom: 60,*/}
        {/*        left: 0,*/}
        {/*        flexDirection: 'row',*/}
        {/*        alignItems: 'center',*/}
        {/*        justifyContent: 'center',*/}
        {/*      }}>*/}
        {/*      /!* <TouchableOpacity style={{ alignItems: 'center', justifyContent: 'center', width: 150, height: 40, borderWidth: 1, borderRadius: 20, borderColor: '#fff' }}*/}
        {/*        onPress={() => this.gotoLogin()}>*/}
        {/*        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 14 }}>{"Login"}</Text>*/}
        {/*      </TouchableOpacity> *!/*/}
        {/*      <TouchableOpacity*/}
        {/*        style={{*/}
        {/*          alignItems: 'center',*/}
        {/*          justifyContent: 'center',*/}
        {/*          width: 150,*/}
        {/*          height: 40,*/}
        {/*          borderWidth: 1,*/}
        {/*          borderRadius: 20,*/}
        {/*          borderColor: '#fff',*/}
        {/*          marginLeft: 5,*/}
        {/*        }}*/}
        {/*        onPress={() => this.gotoSignUp()}>*/}
        {/*        <Text style={{color: '#fff', fontWeight: 'bold', fontSize: 14}}>*/}
        {/*          {'REGISTER'}*/}
        {/*        </Text>*/}
        {/*      </TouchableOpacity>*/}
        {/*    </View>*/}
        {/*  )}*/}
        {/*  {this.state.isLoaded === true && (*/}
        {/*    <View*/}
        {/*      style={{*/}
        {/*        flex: 1,*/}
        {/*        alignSelf: 'center',*/}
        {/*        justifyContent: 'center',*/}
        {/*        justifyContent: 'space-around',*/}
        {/*        padding: 10,*/}
        {/*      }}>*/}
        {/*      <ActivityIndicator size="large" color="#FFFFFF" />*/}
        {/*    </View>*/}
        {/*  )}*/}
        {/*</ImageBackground>*/}
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
    backgroundColor: '#E06869',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

const mapStateToProps = state => {
  const {unreadFlag, senders, fcmID, userData} = state.reducer;
  return {unreadFlag, senders, fcmID, userData};
};

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      changeReadFlag,
      updateUserData,
      updateFCMTocken,
      updateQuickBlox,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(FirstScreen);
