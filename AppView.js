import React from 'react';
import { connect } from 'react-redux';
import { View } from 'react-native';
import nativeFirebase from 'react-native-firebase';
import Global from './src/components/Global';
import FlashMessage, { showMessage } from 'react-native-flash-message';
import Router from './src/Router.js';

class AppView extends React.Component {
  constructor(props) {
    super(props);
  }

  componentWillMount() {
    this.createNotificationListeners();
  }

  async createNotificationListeners() {
    this.notificationListener = nativeFirebase.notifications().onNotification((notification) => {
      const { title, body, data } = notification;
      if (data) {
        const type = data.type;
        this.checkNotification(title, body, type);
      }
    });

    this.notificationOpenedListener = nativeFirebase.notifications().onNotificationOpened((notificationOpen) => {
      const { title, body, data } = notificationOpen.notification;
      if (data) {
        const type = data.type;
        this.checkNotification(title, body, type);
      }
    });

    const notificationOpen = await nativeFirebase.notifications().getInitialNotification();
    if (notificationOpen) {
      const { title, body, data } = notificationOpen.notification;
      if (data) {
        const type = data.type;
        this.checkNotification(title, body, type);
      }
    }

    this.messageListener = nativeFirebase.messaging().onMessage((message) => {
      //process data message
      alert(JSON.stringify(message));
    });
  }

  checkNotification = (title, body, type) => {
    const { nowPage } = Global.saveData;
    if (nowPage !== type) {
      showMessage({
        message: title,
        description: body,
        type: "default",
        icon: "info"
      });
    }
  }

  render() {
    return (
      <View style={{ flex: 1 }}>
        <Router />
        <FlashMessage position="top" />
      </View>
    );
  }
}

const mapStateToProps = (state) => {
  const { unreadFlag } = state
  return { unreadFlag }
};

export default connect(mapStateToProps)(AppView);