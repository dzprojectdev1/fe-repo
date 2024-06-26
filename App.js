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
const store = createStore(storeReducer);
setup({storekitMode: 'STOREKIT2_MODE'});
import * as Sentry from '@sentry/react-native';
import { PRODUCTION } from './src/config/constants';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
    };
  }

  async componentDidMount() {
    console.disableYellowBox = true;
    Sentry.init({
      dsn: 'https://56f60f84556c1107c18b25fd83f399c4@o4506133148401664.ingest.us.sentry.io/4506133149712384',
      appHangTimeoutInterval: 1,
      enableAutoSessionTracking: true,
      // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
      // We recommend adjusting this value in production.
      tracesSampleRate: 1.0,
      
      _experiments: {
        // profilesSampleRate is relative to tracesSampleRate.
        // Here, we'll capture profiles for 100% of transactions.
        profilesSampleRate: 1.0,
      },
      sendDefaultPii: true,
    });

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
    LogBox.ignoreLogs([
      'In React 18, SSRProvider is not necessary and is a noop. You can remove it from your app.',
    ]);

    Sentry.setTag('Production', PRODUCTION);
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
      Sentry.captureException(new Error(error));
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
      Sentry.captureException(new Error(error));
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
      Sentry.captureException(new Error(error));
      // User has rejected permissions
      alert('Firebase permission rejected');
    }
  }

  async getToken() {
    try {
      let fcmToken = await AsyncStorage.getItem('fcmToken');
      if (!fcmToken) {
        fcmToken = await messaging().getToken();
        if (fcmToken) {
          // user has a device token
          await AsyncStorage.setItem('fcmToken', fcmToken);
        }
      }
    } catch (error) {
      Sentry.captureException(new Error(error));
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

export default Sentry.wrap(App);
