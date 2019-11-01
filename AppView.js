import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { View, Image, Text } from 'react-native';
import nativeFirebase from 'react-native-firebase';
import firebase from 'firebase';
import Global from './src/components/Global';
import FlashMessage, { showMessage } from 'react-native-flash-message';
import Router from './src/Router.js';
import { changeReadFlag } from './Action'
import userIcon from './src/assets/images/hidden_man.png';

class AppView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: ''
    }
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
      // const type = data.type;
      this.checkNotification(title, body, data);
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
    let senderImg;
    if (nowPage !== data.type) {
      if (data.type === 'ChatDetail') {
        let senders = [];
        let senderId = data.senderId;
        if (this.props.senders && this.props.senders.length) {
          senders = this.props.senders;
          let isExist = senders.filter(item => item === senderId);
          if (isExist == '') {
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

        if (data.senderImg) {
          senderImg = data.senderImg
        }
      }
      let notiObj = {
        title: data.senderName ? data.senderName : title,
        message: body,
        image: senderImg
      }
      this.setState({
        data: notiObj
      }, function () {
        // showMessage({
        //   message: title,
        //   description: body,
        //   type: "success",
        //   // icon: "info"
        // });
        showMessage({
          type: 'success',
          backgroundColor: '#B64F54'
        });
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
        <FlashMessage position="top" style={{ backgroundColor: '#B64F54' }} renderCustomContent={() => <NotificationView data={this.state.data} />} />
      </View>
    );
  }
}

const NotificationView = (props) => {
  return (
    <View style={{ flexDirection: 'row', flex: 1, }}>
      <Image source={props.data.image && props.data.image !== '' ? { uri: props.data.image } : userIcon} style={{ borderRadius: 20, width: 40, height: 40 }} />
      <View style={{ flexDirection: 'column', justifyContent: 'flex-start', alignSelf: 'flex-start', alignItems: 'flex-start', marginLeft: 10 }}>
        <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#FFF' }} >{props.data.title}</Text>
        <Text style={{ fontSize: 12, fontWeight: '300', color: '#FFF' }}>{props.data.message}</Text>
      </View>
    </View>
  );
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