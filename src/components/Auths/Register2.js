import React, {Component} from 'react';
import {
  ImageBackground,
  Image,
  Platform,
  Dimensions,
  View,
  StyleSheet,
  StatusBar,
  Alert,
  PermissionsAndroid,
  Linking,
  Text,
} from 'react-native';
import QB from 'quickblox-react-native-sdk';
import DeviceInfo from 'react-native-device-info';
import AnimateLoadingButton from 'react-native-animate-loading-button';
import Geolocation from '@react-native-community/geolocation';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {Dropdown} from 'react-native-material-dropdown';
import Global from '../Global';
import {
  updateFCMTocken,
  updateUserData,
  updateQuickBlox,
} from '../../../Action';
import {SERVER_URL} from '../../config/constants';
import messaging from '@react-native-firebase/messaging';
import logo from '../../assets/images/logo.png';
import slogo from '../../assets/images/second_bg.png';
import {isQBOn} from '../../config';
import * as Sentry from '@sentry/react-native';

const DEVICE_WIDTH = Dimensions.get('window').width;

class Register2 extends Component {
  constructor(props) {
    super(props);
    this.state = {
      nickName: '',
      birthday: '',
      gender: '',
      description: '',
      languageData: [],
      language: '',
      cityData: [],
      city: '',
      country: '',
      countryData: [],
      register_click_count: 0,
    };
  }

  static navigationOptions = {
    header: null,
  };
  componentDidMount() {
    const {nickName, birthday, description, gender} = this.props.route.params;
    this.setState({nickName, birthday, description, gender});
    this.get_ethnicity();
    this.get_country();
    this.get_language();
  }
  get_ethnicity() {
    fetch(`${SERVER_URL}/api/ethnicity/all`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(response => response.json())
      .then(responseJson => {
        //alert(JSON.stringify(responseJson))
        if (!responseJson.error) {
          const data = responseJson.data;
          const itmes = [];
          for (let i = 0; i < data.length; i++) {
            itmes.push({value: data[i].ethnicity_name, id: data[i].id});
          }
          this.setState({city: data[0].ethnicity_name, cityData: itmes});
        }
      })
      .catch(error => {
        Sentry.captureException(new Error(error));
        alert(JSON.stringify(error));
        return;
      });
  }
  get_country() {
    fetch(`${SERVER_URL}/api/country/all`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(response => response.json())
      .then(responseJson => {
        // alert(JSON.stringify(responseJson))
        if (!responseJson.error) {
          const data = responseJson.data;
          const itmes = [];
          for (let i = 0; i < data.length; i++) {
            itmes.push({value: data[i].country_name, id: data[i].id});
          }
          this.setState({country: data[0].country_name, countryData: itmes});
        }
      })
      .catch(error => {
        Sentry.captureException(new Error(error));
        alert(JSON.stringify(error));
        return;
      });
  }

  get_language() {
    fetch(`${SERVER_URL}/api/language/all`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(response => response.json())
      .then(responseJson => {
        //  alert(JSON.stringify(responseJson))
        if (!responseJson.error) {
          const data = responseJson.data;
          const itmes = [];
          for (let i = 0; i < data.length; i++) {
            itmes.push({value: data[i].language_name, id: data[i].id});
          }
          this.setState({language: data[0].language_name, languageData: itmes});
        }
      })
      .catch(error => {
        Sentry.captureException(new Error(error));
        alert(JSON.stringify(error));
        return;
      });
  }

  async checkMultiPermissions() {
    try {
      let result = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.CAMERA,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      ]).catch(e => {
        alert(JSON.stringify('request permission' + e.message));
      });
      if (
        result[PermissionsAndroid.PERMISSIONS.CAMERA] &&
        result[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION] &&
        result[PermissionsAndroid.PERMISSIONS.RECORD_AUDIO] === 'granted'
      ) {
        return true;
      }
      return false;
    } catch (error) {
      // Error retrieving data
      Sentry.captureException(new Error(error));
      alert(JSON.stringify('check permissions = ' + error.message));
      return false;
    }
  }

  showAlert(title, body) {
    Alert.alert(
      title,
      body,
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        {text: 'OK', onPress: () => console.log('OK Pressed')},
      ],
      {cancelable: false},
    );
  }

  getdeviceId = async () => {
    //Getting the Unique Id from here
    const fcmToken = await messaging().getToken();
    const id = await DeviceInfo.getUniqueId();
    const deviceInfo = {device_id: id, fcm_id: fcmToken};
    return deviceInfo;
  };

  createNewAccount = async position => {
    let deviceInfo = await this.getdeviceId().catch(e => {
      alert(JSON.stringify('deviceinfo = ' + e.message));
    });
    this.props.updateFCMTocken(deviceInfo.fcm_id);
    let language_index = 1;
    this.state.languageData.forEach((item, index) => {
      if (item.value === this.state.language) {
        language_index = item.id;
      }
    });
    let country_index = 1;
    this.state.countryData.forEach((item, index) => {
      if (item.value === this.state.country) {
        country_index = item.id;
      }
    });
    let city_index = 1;
    this.state.cityData.forEach((item, index) => {
      if (item.value === this.state.city) {
        city_index = item.id;
      }
    });
    // const details = {
    //   username: this.state.nickName.trim(),
    //   usergender: this.state.gender,
    //   description: this.state.description.trim(),
    //   language: language_index,
    //   country: country_index,
    //   ethnicity: city_index,
    //   birth_date: this.state.birthday,
    //   lat_geo: position !== null ? position.coords.latitude : 0,
    //   long_geo: position !== null ? position.coords.longitude : 0,
    //   device_id: deviceInfo.device_id,
    //   fcm_id: deviceInfo.fcm_id,
    // };

    const details = {
      username: this.state.nickName.trim(),
      usergender: this.state.gender,
      description: this.state.description.trim(),
      language: language_index,
      country: country_index,
      ethnicity: city_index,
      birth_date: this.state.birthday,
      lat_geo: 0,
      long_geo: 0,
      device_id: deviceInfo.device_id,
      fcm_id: deviceInfo.fcm_id,
    };

    let formBody = [];
    for (const property in details) {
      const encodedKey = encodeURIComponent(property);
      const encodedValue = encodeURIComponent(details[property]);
      formBody.push(encodedKey + '=' + encodedValue);
    }
    formBody = formBody.join('&');
    let responseJson = await fetch(`${SERVER_URL}/api/user/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formBody,
    })
      .then(response => response.json())
      .catch(error => {
        Sentry.captureException(new Error(error));
        alert(JSON.stringify('account create = ' + error.message));
      });
    if (!responseJson.error) {
      if (isQBOn()) {
        let user = await QB.users
          .create({
            fullName: responseJson.user.name,
            login: responseJson.user.id,
            password: 'quickblox',
            // phone: '404-388-5366',
            tags: ['awesome', 'quickblox'],
          })
          .catch(e => {
            console.log(e);
            alert(JSON.stringify(e.message));
          });
        let info = await QB.auth
          .login({
            login: user.login,
            password: 'quickblox',
          })
          .catch(e => {
            // handle error
            alert(JSON.stringify('my login = ' + e.message));
          });
        this.props.updateQuickBlox(info);
        // const subscription = { deviceToken: deviceInfo.fcm_id };
        // await QB.subscriptions.create(subscription).catch(e => {
        //   /* handle error */
        //   alert(JSON.stringify("subscription = " + e.message));
        // });
        let isConnected = await QB.chat.isConnected().catch(e => {
          alert(JSON.stringify('chat connect check = ' + e.message));
        });
        if (isConnected === false) {
          await QB.chat
            .connect({userId: info.user.id, password: 'quickblox'})
            .catch(e => {
              alert(JSON.stringify('new chat connect = ' + e.message));
            });
        }
        await QB.webrtc.init().catch(e => {
          /* handle error */
          alert(JSON.stringify(e.message));
        });
        this.nextThrough(responseJson);
        this.registerLoadingBtn.showLoading(false);
      }
      this.nextThrough(responseJson);
      this.registerLoadingBtn.showLoading(false);
    }
  };

  onRegister = async () => {
    this.registerLoadingBtn.showLoading(true);
    if (this.state.register_click_count === 0) {
      this.setState({
        register_click_count: 1,
      });
      if (Platform.OS === 'android') {
        // let isPermission = await this.checkMultiPermissions();
        let isPermission = true;
        if (isPermission) {
          this.createNewAccount(null);
          // Geolocation.getCurrentPosition(
          //   position => {
          //     this.createNewAccount(position);
          //   },
          //   error => {
          //     console.error(error);
          //     console.error(error.code);
          //     console.error(error.message);
          //     if (error.code == 2) {
          //       this.createNewAccount(null);
          //     } else {
          //       // See error code charts below.
          //       alert(error.message);
          //       return null;
          //     }
          //   },
          //   // { enableHighAccuracy: Platform.OS != 'android', timeout: 5000, }
          //   {enableHighAccuracy: false, timeout: 25000, maximumAge: 3600000},
          // );
        } else {
          Alert.alert(
            'Alert',
            'Dorry.ai requires these permissions to be granted. please restart app and check that permissions.',
            [{text: 'Ok', onPress: () => BackAndroid.exitApp()}],
            {cancelable: false},
          );
        }
      } else if (Platform.OS === 'ios') {
        this.createNewAccount(null);
        // await Geolocation.requestAuthorization();
        // Geolocation.getCurrentPosition(
        //   position => {
        //     this.createNewAccount(position);
        //   },
        //   error => {
        //     if (error.code == 2) {
        //       this.createNewAccount(null);
        //     } else {
        //       // See error code charts below.
        //       alert(error.message);
        //       return null;
        //     }
        //   },
        //   // { enableHighAccuracy: Platform.OS != 'android', timeout: 5000, }
        //   {enableHighAccuracy: true, timeout: 15000},
        // );
      }
    }
  };

  nextThrough = responseJson => {
    this.props.updateUserData(responseJson.user);
    Global.saveData.token = responseJson.user.token;
    Global.saveData.u_id = responseJson.user.id;
    Global.saveData.u_name = responseJson.user.name;
    Global.saveData.u_age = responseJson.user.age;
    Global.saveData.u_gender = responseJson.user.gender;
    Global.saveData.u_language = responseJson.user.language;
    Global.saveData.u_city = responseJson.user.ethnicity;
    Global.saveData.u_country = responseJson.user.country;
    Global.saveData.u_description = responseJson.user.description;
    Global.saveData.coin_count = responseJson.user.coin_count;
    Global.saveData.account_status = responseJson.user.account_status;
    Global.saveData.auto_block = responseJson.user.auto_block;
    Global.saveData.is_admin = responseJson.user.is_admin;
    Global.saveData.fan_count = responseJson.user.fan_count;
    Global.saveData.coin_per_message = responseJson.user.coin_per_message;
    Global.saveData.newUser = true;
    this.props.navigation.navigate('BrowseList');
  };

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
            style={{width: 255, height: 150, resizeMode: 'contain'}}
          />
        </ImageBackground>
        <View>
          <View
            style={{
              width: DEVICE_WIDTH * 0.8,
              marginLeft: DEVICE_WIDTH * 0.1,
              marginTop: 50,
            }}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Text style={{color: '#808080', fontSize: 12}}>{'LANGUAGE'}</Text>
            </View>
            <View>
              <Dropdown
                containerStyle={{width: '100%', marginTop: -15}}
                label=" "
                style={{color: 'black'}}
                inputContainerStyle={{borderBottomColor: '#808080'}}
                baseColor="#DE5859" //indicator color
                textColor="#000"
                data={this.state.languageData}
                onChangeText={language => this.setState({language})}
                value={this.state.language}
                dropdownPosition={-4}
              />
            </View>
          </View>
          <View
            style={{
              width: DEVICE_WIDTH * 0.8,
              marginLeft: DEVICE_WIDTH * 0.1,
              marginTop: 20,
            }}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Text style={{color: '#808080', fontSize: 12}}>
                {'Ethnicity'}
              </Text>
            </View>
            <View>
              <Dropdown
                containerStyle={{width: '100%', marginTop: -15}}
                label=" "
                style={{color: 'black'}}
                inputContainerStyle={{borderBottomColor: '#808080'}}
                baseColor="#DE5859" //indicator color
                textColor="#000"
                data={this.state.cityData}
                onChangeText={city => this.setState({city})}
                value={this.state.city}
                dropdownPosition={-4}
              />
            </View>
          </View>

          <View
            style={{
              width: DEVICE_WIDTH * 0.8,
              marginLeft: DEVICE_WIDTH * 0.1,
              marginTop: 20,
            }}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Text style={{color: '#808080', fontSize: 12}}>{'COUNTRY'}</Text>
            </View>
            <View>
              <Dropdown
                containerStyle={{width: '100%', marginTop: -15}}
                label=" "
                style={{color: 'black'}}
                inputContainerStyle={{borderBottomColor: '#808080'}}
                baseColor="#DE5859" //indicator color
                textColor="#000"
                data={this.state.countryData}
                onChangeText={country => this.setState({country})}
                value={this.state.country}
                dropdownPosition={-4}
              />
            </View>
          </View>
          <View
            style={{
              width: DEVICE_WIDTH * 0.8,
              marginLeft: DEVICE_WIDTH * 0.1,
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: 30,
            }}>
            <Text style={{color: '#808080', fontSize: 12, textAlign: 'center'}}>
              {'BY SIGNING UP, YOU AGREE TO'}
            </Text>
            <Text style={{marginTop: 10}}>
              <Text
                style={{color: '#808080', fontSize: 12, textAlign: 'center'}}>
                {' OUR '}
              </Text>
              <Text
                style={{
                  color: '#808080',
                  fontSize: 12,
                  textAlign: 'center',
                  textDecorationLine: 'underline',
                }}
                onPress={() => {
                  Linking.openURL('https://dorry.ai/terms-and-conditions/');
                }}>
                {' TERMS OF SERVICE '}
              </Text>
              <Text
                style={{color: '#808080', fontSize: 12, textAlign: 'center'}}>
                {' AND '}
              </Text>
              <Text
                style={{
                  color: '#808080',
                  fontSize: 12,
                  textAlign: 'center',
                  textDecorationLine: 'underline',
                }}
                onPress={() => {
                  Linking.openURL('https://dorry.ai/privacy-policy/');
                }}>
                {' PRIVACY POLICY '}
              </Text>
            </Text>
          </View>
          <View
            style={{
              width: DEVICE_WIDTH,
              height: 50,
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: 30,
            }}>
            <AnimateLoadingButton
              ref={c => (this.registerLoadingBtn = c)}
              width={DEVICE_WIDTH * 0.8}
              height={40}
              title="REGISTER"
              titleFontSize={16}
              titleColor="#fff"
              backgroundColor="#DE5859"
              borderRadius={20}
              onPress={this.onRegister.bind(this)}
            />
          </View>
          <View style={{height: 100}} />
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
});

const mapStateToProps = state => {
  return state.reducer;
};

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      updateUserData,
      updateFCMTocken,
      updateQuickBlox,
    },
    dispatch,
  );
export default connect(mapStateToProps, mapDispatchToProps)(Register2);
