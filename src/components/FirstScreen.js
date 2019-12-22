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
import firebase from 'firebase';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { changeReadFlag, updateUserData, updateFCMTocken, updateQuickBlox } from '../../Action';
import DeviceInfo from 'react-native-device-info';
import firstBg from '../assets/images/first_bg.jpg';
import Global from './Global';
import QB from 'quickblox-react-native-sdk';
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

  async componentDidMount() {
    let fcmToken = await nativeFirebase.messaging().getToken();
    if (fcmToken) {
      this.props.updateFCMTocken(fcmToken);
      let deviceId = await this.getdeviceId();
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
      let responseJson = await fetch(`${SERVER_URL}/api/user/checkDeviceUniqueId/${deviceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formBody
      }).then((response) => response.json()).catch(e => alert(JSON.stringify(e.message)));
      if (responseJson.error === false) {
        if (responseJson.user) {
          //logined
          let info = await QB.auth.login({
            login: responseJson.user.id,
            password: 'quickblox'
          }).catch((e) => {
            // handle error
            alert(JSON.stringify("my login = " + e.message));
          });
          if (!info) {
            let user = await QB.users.create({
              email: responseJson.user.name + '@quickblox.com',
              fullName: responseJson.user.name,
              login: responseJson.user.id,
              password: 'quickblox',
              // phone: '404-388-5366',
              tags: ['#awesome', '#quickblox']
            }).catch((e) => {
              alert(JSON.stringify(e.message));
            });
            let info = await QB.auth.login({
              login: user.login,
              password: 'quickblox'
            }).catch((e) => {
              // handle error
              alert(JSON.stringify("my login = " + e.message));
            });
            this.props.updateQuickBlox(info);
            const subscription = { deviceToken: fcmToken };
            await QB.subscriptions.create(subscription).catch(e => {
              /* handle error */
              alert(JSON.stringify("subscription = " + e.message));
            });
            let isConnected = await QB.chat.isConnected().catch((e) => {
              alert(JSON.stringify('chat connect check = ' + e.message));
            });
            if (isConnected === false) {
              await QB.chat.connect({ userId: info.user.id, password: 'quickblox' }).catch((e) => {
                alert(JSON.stringify("new chat connect = " + e.message));
              });
            }
            await QB.webrtc.init().catch((e) => {
              /* handle error */
              alert(JSON.stringify(e.message))
            });
            this.nextThrough(responseJson);
          } else {
            this.props.updateQuickBlox(info);
            const subscription = { deviceToken: fcmToken };
            await QB.subscriptions.create(subscription).catch(e => {
              /* handle error */
              alert(JSON.stringify("subscription = " + e.message));
            });
            let isConnected = await QB.chat.isConnected().catch((e) => {
              alert(JSON.stringify('chat connect check = ' + e.message));
            });
            if (isConnected === false) {
              await QB.chat.connect({ userId: info.user.id, password: 'quickblox' }).catch((e) => {
                alert(JSON.stringify("new chat connect = " + e.message));
              });
            }
            await QB.webrtc.init().catch((e) => {
              /* handle error */
              alert(JSON.stringify(e.message))
            });
            this.nextThrough(responseJson);
          }
        } else {
          this.setState({
            isLoaded: false
          }, function () {
            this.props.navigation.navigate("Signup");
          });
        }
      }
    }
  }

  nextThrough = (responseJson) => {
    // connected successfully
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
        alert(JSON.stringify(error.message));
        return
      });
  }

  retrieveData = async () => {
    try {
      const value = await AsyncStorage.getItem('globalData');      // We have data!!
      return JSON.parse(value);
    } catch (error) {
      // Error retrieving data
      console.log(error.message);
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
  const { unreadFlag, senders, fcmID, userData } = state.reducer
  return { unreadFlag, senders, fcmID, userData }
};

const mapDispatchToProps = dispatch => (
  bindActionCreators({
    changeReadFlag,
    updateUserData,
    updateFCMTocken,
    updateQuickBlox
  }, dispatch)
);

export default connect(mapStateToProps, mapDispatchToProps)(FirstScreen);
