import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { View } from 'react-native';
import nativeFirebase from 'react-native-firebase';
import firebase from 'firebase';
import Global from './src/components/Global';
import FlashMessage, { showMessage } from 'react-native-flash-message';
import Router from './src/Router.js';
import { changeReadFlag } from './Action'

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
        // const type = data.type;
        this.checkNotification(title, body, data);
      }
    });

    this.notificationOpenedListener = nativeFirebase.notifications().onNotificationOpened((notificationOpen) => {
      const { title, body, data } = notificationOpen.notification;
      if (data) {
        // const type = data.type;
        this.checkNotification(title, body, data);
      }
    });

    const notificationOpen = await nativeFirebase.notifications().getInitialNotification();
    if (notificationOpen) {
      const { title, body, data } = notificationOpen.notification;
      if (data) {
        // const type = data.type;
        this.checkNotification(title, body, data);
      }
    }

    this.messageListener = nativeFirebase.messaging().onMessage((message) => {
      //process data message
      alert(JSON.stringify(message));
    });
  }

  checkNotification = (title, body, data) => {
    const { nowPage } = Global.saveData;
    if (nowPage !== data.type) {
      if (data.type === 'ChatDetail') {
        let senders = [];
        let senderId = data.sender;
        if (this.props.senders && this.props.senders.length) {
          senders = this.props.senders;
          let isExist = this.props.senders.filter(item => item === senderId);
          if (!isExist) {
            senders.push(senderId)
          }
        } else {
          senders.push(senderId)
        }       
        this.updateUnreadFirebase(senders);
        let newPayload = {
          unreadFlag: true,
          senders: senders
        }
        this.props.changeReadFlag(newPayload);
      }
      showMessage({
        message: title,
        description: body,
        type: "success",
        icon: "info"
      });
    }
  }

  updateUnreadFirebase = (senderIdArr) => {
    // let msgId = nativeFirebase.database().ref('dz-chat-unread').child(Global.saveData.u_id).push().key;
    let updates = {};
    updates[Global.saveData.u_id] = senderIdArr.toString();
    firebase.database().ref().child('dz-chat-unread').update(updates);
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
  const { unreadFlag, senders } = state.reducer
  return { unreadFlag, senders }
};

const mapDispatchToProps = dispatch => (
  bindActionCreators({
    changeReadFlag,
  }, dispatch)
);

export default connect(mapStateToProps, mapDispatchToProps)(AppView);