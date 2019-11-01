if (__DEV__) {
  import('./ReactotronConfig').then(() => console.log('Reactotron Configured'));
}
import React from 'react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import storeReducer from './Reducer';
import { AsyncStorage, View, PermissionsAndroid, Platform } from 'react-native';
import Geolocation from 'react-native-geolocation-service';
// import { connect } from 'react-redux';
import firebase from 'firebase';
import nativeFirebase from 'react-native-firebase';
// import FlashMessage, { showMessage } from 'react-native-flash-message';
import AppView from './AppView';
// import Global from './src/components/Global';

const store = createStore(storeReducer);

class App extends React.Component {
  constructor(props) {
    super(props);
  }

  async componentWillMount() {
    console.disableYellowBox = true;
    var firebaseConfig = {
      apiKey: "AIzaSyB2V7gfc-XeADjk66oZ6E6cLG3RZ8GxeI0",
      authDomain: "dazzled-date-prod.firebaseapp.com",
      databaseURL: "https://dazzled-date-prod.firebaseio.com",
      projectId: "dazzled-date-prod",
      storageBucket: "",
      messagingSenderId: "220585011058",
      appId: "1:220585011058:android:5e783118c820cfb1e6dfeb"
    };
    firebase.initializeApp(firebaseConfig);
    this.setState({ loading: false });
  }

  componentDidMount() {
    if (Platform.OS === 'android') {
      this.checkDefaultPermissions();
    } else if (Platform.OS === 'ios') {
      Geolocation.requestAuthorization();
    }
    this.checkFirebasePermission();
    // this.createNotificationListeners();
  }

  componentWillUnmount() {
    this.notificationListener();
    this.notificationOpenedListener();
  }

  // async checkLocationPermission() {
  //   try {
  //     const granted = await PermissionsAndroid.request(
  //       PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
  //       {
  //         title: 'This app need location permission',
  //         // message:
  //         //   'Cool Photo App needs access to your camera ' +
  //         //   'so you can take awesome pictures.',
  //         // buttonNeutral: 'Ask Me Later',
  //         // buttonNegative: 'Cancel',
  //         buttonPositive: 'OK',
  //       },
  //     );
  //     if (granted === PermissionsAndroid.RESULTS.GRANTED) {
  //       console.log('You can use the camera');
  //     } else {
  //       console.log('Camera permission denied');
  //     }
  //   } catch (err) {
  //     console.warn(err);
  //   }
  // }

  async checkDefaultPermissions() {
    try {
      var permissions = [];
      // const isCameraPermission = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.CAMERA);
      const isStoragePermission = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE);
      const isAccessFineLocationPermission = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
      // if (!isCameraPermission) {
      //   permissions.push(PermissionsAndroid.PERMISSIONS.CAMERA);
      // }
      if (!isStoragePermission) {
        permissions.push(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE);
      }
      if (!isAccessFineLocationPermission) {
        permissions.push(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
      }
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
      const granted = await PermissionsAndroid.requestMultiple(
        permissions,
        {
          title: 'Cool App Some Permissions',
          message:
            'Cool App needs access to your some permissions.',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );

      if (granted['android.permission.WRITE_EXTERNAL_STORAGE']
        && granted['android.permission.ACCESS_FINE_LOCATION'] === PermissionsAndroid.RESULTS.GRANTED) {
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
    const enabled = await nativeFirebase.messaging().hasPermission();
    if (enabled) {
      this.getToken();
    } else {
      this.requestPermission();
    }
  }

  async requestPermission() {
    try {
      await nativeFirebase.messaging().requestPermission();
      // User has authorised
      this.getToken();
    } catch (error) {
      // User has rejected permissions
      alert('Firebase permission rejected');
    }
  }

  async getToken() {
    let fcmToken = await AsyncStorage.getItem('fcmToken');
    if (!fcmToken) {
      fcmToken = await nativeFirebase.messaging().getToken();
      if (fcmToken) {
        // user has a device token
        await AsyncStorage.setItem('fcmToken', fcmToken);
      }
    }
  }

  render() {
    return (
      <Provider store={store}>
        <AppView />
        {/* <View style={{ flex: 1 }}>
         
          <FlashMessage position="top" />
        </View> */}
      </Provider>
    );
  }
}

export default App;
