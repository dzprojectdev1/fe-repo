import React, {Component} from 'react';
import {LogBox, PermissionsAndroid, Platform} from 'react-native';
import {Provider} from 'react-redux';
import {createStore} from 'redux';
import storeReducer from './Reducer';
import Geolocation from 'react-native-geolocation-service';
import firebase, {getFirebaseApp} from '@react-native-firebase/app';
import messaging from '@react-native-firebase/messaging';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import AppView from './AppView';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {NativeBaseProvider} from 'native-base';
import {setup} from 'react-native-iap';
import Instabug, {InvocationEvent} from 'instabug-reactnative';
// "react-native-firebase": "^5.5.4",
//     "react-navigation": "^2.18.2",
// "react-navigation-hooks": "^1.1.0",
const store = createStore(storeReducer);
setup({storekitMode: 'STOREKIT2_MODE'});

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
    };
  }

  async componentDidMount() {
    console.disableYellowBox = true;
    const firebaseConfig = {
      apiKey: 'AIzaSyBuJ1590DczIiuH7JA_Ls8Pido4IJ_GVT4',
      authDomain: 'dazzled-date-dev.firebaseapp.com',
      databaseURL: 'https://dazzled-date-dev.firebaseio.com',
      projectId: 'dazzled-date-dev',
      storageBucket: '',
      messagingSenderId: '725302073253',
      appId: '1:725302073253:android:0aa373b87b7f562c2a3a4c',
    };

    if (!getFirebaseApp().apps.length) {
      await getFirebaseApp().initializeApp({});
    }
    await getFirebaseApp().initializeApp(firebaseConfig);
    this.setState({loading: false});

    if (Platform.OS === 'android') {
      await this.checkDefaultPermissions();
    } else if (Platform.OS === 'ios') {
      await Geolocation.requestAuthorization();
    }
    await this.checkFirebasePermission();
    firebase.auth();
    Instabug.init({
      token: 'ff3b8a4fe0671f532e00d66118749a2d',
      invocationEvents: [InvocationEvent.none],
    });

    LogBox.ignoreLogs([
      'In React 18, SSRProvider is not necessary and is a noop. You can remove it from your app.',
    ]);
  }

  componentWillUnmount() {
    // this.notificationListener();
    // this.notificationOpenedListener();
  }

  async checkDefaultPermissions() {
    try {
      var permissions = [];
      // const isCameraPermission = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.CAMERA);
      const isStoragePermission = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      );
      const isAccessFineLocationPermission = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );
      // if (!isCameraPermission) {
      //   permissions.push(PermissionsAndroid.PERMISSIONS.CAMERA);
      // }
      if (!isStoragePermission) {
        permissions.push(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE);
      }
      if (!isAccessFineLocationPermission) {
        permissions.push(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
      }

      const isNotificationPermission = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      );

      if (permissions.length === 0) {
        return;
      }
      await this.requestPermissions(permissions);
    } catch (error) {
      // Error retrieving data
      console.error(error);
    }
  }

  async requestPermissions(permissions) {
    try {
      const granted = await PermissionsAndroid.requestMultiple(permissions, {
        title: 'Cool App Some Permissions',
        message: 'Cool App needs access to your some permissions.',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      });

      if (
        granted['android.permission.WRITE_EXTERNAL_STORAGE'] &&
        granted['android.permission.ACCESS_FINE_LOCATION'] ===
          PermissionsAndroid.RESULTS.GRANTED
      ) {
        console.log('You can use the all');
      } else {
        console.log('all permission denied');
      }
      return;
    } catch (error) {
      // Error retrieving data
      console.error(error);
      return;
    }
  }

  async checkFirebasePermission() {
    const authStatus = await messaging().requestPermission();

    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      await this.getToken();
    } else {
      await this.requestPermission();
    }
  }

  async requestPermission() {
    try {
      await messaging().requestPermission();
      // User has authorised
      await this.getToken();
    } catch (error) {
      // User has rejected permissions
      alert('Firebase permission rejected');
    }
  }

  async getToken() {
    let fcmToken = await AsyncStorage.getItem('fcmToken');
    if (!fcmToken) {
      fcmToken = await messaging().getToken();
      if (fcmToken) {
        // user has a device token
        await AsyncStorage.setItem('fcmToken', fcmToken);
      }
    }
  }

  render() {
    return (
      <GestureHandlerRootView style={{flex: 1}}>
        <Provider store={store}>
          <NativeBaseProvider>
            <AppView />
          </NativeBaseProvider>
        </Provider>
      </GestureHandlerRootView>
    );
  }
}

export default App;
