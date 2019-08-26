import React from 'react';
import Router from './src/Router';
import * as firebase from 'firebase';
import '@firebase/messaging';
export default class App extends React.Component {
  constructor(props) {
    super(props);
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

  render() {
    return (
      <Router />
    );
  }
}