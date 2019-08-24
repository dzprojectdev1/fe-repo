import React from 'react';
import Router from './src/Router';
import firebase from 'firebase';
// import OneSignal from 'react-native-onesignal';

export default class App extends React.Component {
  constructor(props) {
    super(props);
    // OneSignal.init("03bce2f7-61f5-43dd-a077-71f6587a2e05");

    // OneSignal.addEventListener('received', this.onReceived);
    // OneSignal.addEventListener('opened', this.onOpened);
    // OneSignal.addEventListener('ids', this.onIds);
    // OneSignal.configure(); 
    this.state = { loading: true };
  }

  async componentWillMount() {
    console.disableYellowBox = true;
    var firebaseConfig = {
      apiKey: "AIzaSyBLEM8NoFevrJ0uyvetYKrFUdeDuSVdL1Q",
      authDomain: "dz-chat-app.firebaseapp.com",
      databaseURL: "https://dz-chat-app.firebaseio.com",
      projectId: "dz-chat-app",
      storageBucket: "",
      messagingSenderId: "289099129817",
      appId: "1:289099129817:web:7ffff5d747763479"
    };
    firebase.initializeApp(firebaseConfig);
    this.setState({ loading: false });
  }

  // componentWillUnmount() {
  //   OneSignal.removeEventListener('received', this.onReceived);
  //   OneSignal.removeEventListener('opened', this.onOpened);
  //   OneSignal.removeEventListener('ids', this.onIds);
  // }

  // onReceived(notification) {
  //   console.log("Notification received: ", notification);
  // }

  // onOpened(openResult) {
  //   console.log('Message: ', openResult.notification.payload.body);
  //   console.log('Data: ', openResult.notification.payload.additionalData);
  //   console.log('isActive: ', openResult.notification.isAppInFocus);
  //   console.log('openResult: ', openResult);
  // }

  // onIds(device) {
  //   console.log('Device info: ', device);
  // }

  render() {
    return (
      <Router />
    );
  }
}