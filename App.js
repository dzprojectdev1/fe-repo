if (__DEV__) {
  import('./ReactotronConfig').then(() => console.log('Reactotron Configured'));
}
import React from 'react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import storeReducer from './Reducer';
import { AsyncStorage, View, PermissionsAndroid } from 'react-native';
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
      apiKey: "AIzaSyBuJ1590DczIiuH7JA_Ls8Pido4IJ_GVT4",
      authDomain: "dazzled-date-dev.firebaseapp.com",
      databaseURL: "https://dazzled-date-dev.firebaseio.com",
      projectId: "dazzled-date-dev",
      storageBucket: "",
      messagingSenderId: "725302073253",
      appId: "1:725302073253:android:0aa373b87b7f562c2a3a4c"
    };
    firebase.initializeApp(firebaseConfig);
    this.setState({ loading: false });
  }

  componentDidMount() {
    this.checkDefaultPermissions();
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
