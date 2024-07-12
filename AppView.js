import React, {Component} from 'react';
import {
  Dimensions,
  Image,
  ImageBackground,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
// import QB from 'quickblox-react-native-sdk';
// import WebRTCView from 'quickblox-react-native-sdk/RTCView';
import FlashMessage, {showMessage} from 'react-native-flash-message';
import Router from './src/Router.js';
import {changeReadFlag, updateCallEvent} from './Action';
import {
  ACCEPT,
  CALL,
  CALL_END,
  FIREBASE_DB_UNREAD,
  HANG_UP,
  NOT_ANSWER,
  PEER_CONNECTION_STATE_CHANGED,
  RECEIVED_VIDEO_TRACK,
  REJECT,
  SESSION_TYPE,
} from './src/config/constants';
import Sound from 'react-native-sound';
import userIcon from './src/assets/images/hidden_man.png';
import hiddenMan from './src/assets/images/hidden_man.png';
import bg from './src/assets/images/back_1.jpeg';
import call_end_reject from './src/assets/images/call_end_reject.png';
import call_ring_accept from './src/assets/images/call_ring_accept.png';
import messaging from '@react-native-firebase/messaging';
import database from '@react-native-firebase/database';
import {isQBOn} from './src/config';
import auth from '@react-native-firebase/auth';
import Global from './src/components/Global';

Sound.setCategory('Playback');
const whoosh = new Sound(
  'happy_birthday_by_music_box.mp3',
  Sound.MAIN_BUNDLE,
  error => {
    if (error) {
      console.log('failed to load the sound', error);
      return;
    }
    // loaded successfully
    console.log(
      'duration in seconds: ' +
        whoosh.getDuration() +
        'number of channels: ' +
        whoosh.getNumberOfChannels(),
    );
  },
);

class AppView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: '',
      videoModalVisible: false,
      voiceModalVisible: false,
      callStatusStr: 'INCOMING CALL',
      showTimer: false,
      callEvent: {},
      callerName: '. . .',
      hours: 0,
      minutes: 0,
      seconds: 0,
      intervalId: 0,
    };
  }

  async componentDidMount() {
    await this.createNotificationListeners();

    /** Sam's */
    // const appSettings = {
    //   appId: '79653',
    //   authKey: 'RBAjOFhyAPvYeZH',
    //   authSecret: '8bFeJzqmDgcs8dz',
    //   accountKey: '2qbJaHzhR7UNy89_8xwU',
    // };
    await auth().signInWithEmailAndPassword(
      'admin@dorry.ai',
      'dorry.ai#&T^%^%#UIUG',
    );
    const appSettings = {
      appId: '103472',
      authKey: 'ak_BpmaurRacApwSu2',
      authSecret: 'as_PAdvB-vC7sbO98e',
      accountKey: 'ack_D6drzYsggFopAMseCz_J',
    };
    if (isQBOn()) {
      // QB.settings
      //   .init(appSettings)
      //   .then(() => {
      //     const emitter = Platform.select({
      //       android: DeviceEventEmitter,
      //       ios: new NativeEventEmitter(QB.webrtc),
      //     });
      //
      //     Object.keys(QB.webrtc.EVENT_TYPE).forEach(key => {
      //       emitter.addListener(QB.webrtc.EVENT_TYPE[key], this.eventHandler);
      //     });
      //   })
      //   .catch(e => {
      //     console.error('QB.settings :- ', e);
      //   });
      // const emitter = Platform.select({
      //   android: DeviceEventEmitter,
      //   ios: new NativeEventEmitter(QB.webrtc),
      // });
      //
      // Object.keys(QB.webrtc.EVENT_TYPE).forEach(key => {
      //   emitter.addListener(QB.webrtc.EVENT_TYPE[key], this.eventHandler);
      // });
    }
  }

  eventHandler = event => {
    const {type, payload} = event;
    if (type === CALL) {
      whoosh.setNumberOfLoops(-1);
      whoosh.setVolume(1);
      whoosh.play(success => {
        if (success) {
          // eslint-disable-next-line no-alert
          alert('successfully finished playing');
        } else {
          console.log('playback failed due to audio decoding errors');
        }
      });
    } else {
      whoosh.stop();
    }
    this.setState(
      {
        callEvent: event,
      },
      () => {
        switch (type) {
          case CALL: //receiver event
            this.setState({
              callStatusStr:
                payload.session.type === SESSION_TYPE.AUDIO
                  ? 'Incoming Audio Call'
                  : 'Incoming Video Call',
              callerName: payload.userInfo
                ? payload.userInfo.callerName
                : 'UNKNOWN',
              showTimer: false,
            });
            this.setModalVisible(payload.session.type, true);
            break;
          case CALL_END: //receiver
            this.props.updateCallEvent(event);
            this.callEnded();
            break;
          case ACCEPT: //caller
            this.props.updateCallEvent(event);
            break;
          case HANG_UP:
            this.callEnded();
            break;
          case REJECT: //caller
            this.props.updateCallEvent(event);
            break;
          case NOT_ANSWER: //caller
            this.props.updateCallEvent(event);
            this.callEnded();
            break;
          case PEER_CONNECTION_STATE_CHANGED: //both
            break;
          case RECEIVED_VIDEO_TRACK:
            break;
          default:
            break;
        }
      },
    );
  };

  callAccpet = () => {
    const {callEvent} = this.state;
    const userInfo = {
      // custom data can be passed using this object
      // only [string]: string type supported
    };
    if (isQBOn()) {
      QB.webrtc
        .accept({sessionId: callEvent.payload.session.id, userInfo})
        .then(session => {
          /* handle session */
          this.setState({
            showTimer: true,
            callStatusStr: 'CALL STARTED',
          });
          this.timeCounter();
        })
        .catch(e => {
          /* handle error */
          console.log('error ', e);
        });
    }
  };

  callAccepted = () => {
    alert('call started');
  };

  callEnd = () => {
    const {callEvent} = this.state;
    const userInfo = {
      // custom data can be passed using this object
      // only [string]: string type supported
    };
    if (isQBOn()) {
      QB.webrtc
        .hangUp({sessionId: callEvent.payload.session.id, userInfo})
        .then(session => {
          /* handle session */
          this.callEnded();
        })
        .catch(e => {
          /* handle error */
          console.log('error ', e);
        });
    }
  };

  callEnded = () => {
    clearInterval(this.state.intervalId);
    this.setState({
      showTimer: false,
      videoModalVisible: false,
      voiceModalVisible: false,
      callStatusStr: 'CALL ENDED',
      hours: 0,
      minutes: 0,
      seconds: 0,
    });
  };

  callReject = () => {
    const userInfo = {
      // custom data can be passed using this object
      // only [string]: string type supported
    };
    const {callEvent} = this.state;
    if (isQBOn()) {
      QB.webrtc
        .reject({sessionId: callEvent.payload.session.id, userInfo})
        .then(session => {
          /* handle session */
          clearInterval(this.state.intervalId);
          this.setState({
            showTimer: false,
            voiceModalVisible: false,
            videoModalVisible: false,
            callStatusStr: 'DECLINED',
            hours: 0,
            minutes: 0,
            seconds: 0,
          });
        })
        .catch(e => {
          /* handle error */
          console.log('error ', e);
        });
    }
  };

  timeCounter = () => {
    var intervalId = setInterval(this.timer, 1000);
    this.setState({intervalId: intervalId});
  };

  timer = () => {
    var {hours, minutes, seconds} = this.state;
    var currentSeconds = seconds + 1;
    var currentHours;
    var currentMinutes;
    if (currentSeconds === 60) {
      currentSeconds = 0;
      currentMinutes = minutes + 1;
      if (currentMinutes === 60) {
        currentMinutes = 0;
        currentHours = hours + 1;
      }
      currentHours = hours;
      this.setState({
        hours: currentHours,
        minutes: currentMinutes,
        seconds: currentSeconds,
      });
    } else {
      this.setState({
        hours: hours,
        minutes: minutes,
        seconds: currentSeconds,
      });
    }
  };

  async createNotificationListeners() {
    messaging().onMessage(async remoteMessage => {
      const {notification, data} = remoteMessage;
      const {title, body} = notification;
      //this.checkNotification(title, body, data);
    });

    // Background message handler (when app is in background or killed)
    messaging().setBackgroundMessageHandler(async remoteMessage => {
      const {notification, data} = remoteMessage;
      const {title, body} = notification;
      //this.checkNotification(title, body, data);
    });

    // Notification opened handler (when app is in background and opened by tapping the notification)
    messaging().onNotificationOpenedApp(remoteMessage => {
      const {notification, data} = remoteMessage;
      const {title, body} = notification;
      //this.checkNotification(title, body, data);
    });

    // Initial notification handler (when app is opened from a quit state by tapping the notification)
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          const {notification, data} = remoteMessage;
          const {title, body} = notification;
          //this.checkNotification(title, body, data);
        }
      });

    // this.notificationListener = nativeFirebase
    //   .notifications()
    //   .onNotification(notification => {
    //     const {title, body, data} = notification;
    //     if (data) {
    //       // const type = data.type;
    //       this.checkNotification(title, body, data);
    //     }
    //   });
    //
    // this.notificationOpenedListener = nativeFirebase
    //   .notifications()
    //   .onNotificationOpened(notificationOpen => {
    //     const {title, body, data} = notificationOpen.notification;
    //     // const type = data.type;
    //     this.checkNotification(title, body, data);
    //   });
    //
    // const notificationOpen = await nativeFirebase
    //   .notifications()
    //   .getInitialNotification();
    // if (notificationOpen) {
    //   const {title, body, data} = notificationOpen.notification;
    //   if (data) {
    //     // const type = data.type;
    //     this.checkNotification(title, body, data);
    //   }
    // }

    this.messageListener = messaging().onMessage(message => {});
  }

  checkNotification = (title, body, data) => {
    const {nowPage} = Global.saveData;
    let senderImg;
    if (nowPage !== data.type) {
      if (data.type === 'ChatDetail') {
        let senders = [];
        let senderId = data.senderId;
        if (this.props.senders && this.props.senders.length) {
          senders = this.props.senders;
          let isExist = senders.filter(item => item === senderId);
          if (isExist == '') {
            senders.push(senderId);
          }
        } else {
          senders.push(senderId);
        }
        this.updateUnreadFirebase(senders);
        let newPayload = {
          unreadFlag: true,
          senders: senders,
        };
        this.props.changeReadFlag(newPayload);

        if (data.senderImg) {
          senderImg = data.senderImg;
        }
      }
      let notiObj = {
        title: data.senderName ? data.senderName : title,
        message: body,
        image: senderImg,
      };
      this.setState(
        {
          data: notiObj,
        },
        function () {
          // showMessage({
          //   message: title,
          //   description: body,
          //   type: "success",
          //   // icon: "info"
          // });
          showMessage({
            type: 'success',
            backgroundColor: '#B64F54',
          });
        },
      );
    }
  };

  updateUnreadFirebase = async senderIdArr => {
    // let msgId = nativeFirebase.database().ref('dz-chat-unread').child(Global.saveData.u_id).push().key;
    let updates = {};
    updates[Global.saveData.u_id] = senderIdArr.toString();

    database()
      .ref()
      .child(FIREBASE_DB_UNREAD)
      .update(updates)
      .then(() => console.log('Data updated.'));
  };

  setModalVisible = (sessionType, status) => {
    if (sessionType === SESSION_TYPE.AUDIO) {
      this.setState({
        voiceModalVisible: status,
      });
    } else if (sessionType === SESSION_TYPE.VIDEO) {
      this.setState({
        videoModalVisible: status,
      });
    }
  };

  render() {
    const {state} = this;
    return (
      <View style={{flex: 1}}>
        <Router />
        <View>
          <Modal
            animationType="fade"
            animated
            transparent={false}
            visible={this.state.voiceModalVisible}
            onRequestClose={() => {
              alert('Modal has been closed.');
            }}>
            <ImageBackground source={bg} style={styles.contentContainer}>
              <View style={{justifyContent: 'center', alignItems: 'center'}}>
                <Image source={hiddenMan} style={styles.avatarOtherUser} />
                <Text style={styles.userName}>{this.state.callerName}</Text>
                <View style={styles.dialling}>
                  <Text
                    style={{
                      fontSize: 16,
                      color: '#FFF',
                    }}>
                    {this.state.callStatusStr}
                  </Text>
                  {this.state.showTimer && (
                    <Text
                      style={{
                        fontSize: 16,
                        color: '#FFF',
                      }}>
                      {(this.state.hours < 10
                        ? '0' + this.state.hours
                        : this.state.hours) +
                        ':' +
                        (this.state.minutes < 10
                          ? '0' + this.state.minutes
                          : this.state.minutes) +
                        ':' +
                        (this.state.seconds < 10
                          ? '0' + this.state.seconds
                          : this.state.seconds)}
                    </Text>
                  )}
                </View>
                {this.state.callStatusStr !== 'CALL STARTED' && (
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      width: DEVICE_WIDTH * 0.5,
                      marginTop: DEVICE_HEIGHT * 0.1,
                    }}>
                    <TouchableOpacity
                      style={{width: 60}}
                      onPress={() => this.callReject()}>
                      <Image
                        source={call_end_reject}
                        style={styles.call_end_rejct_button}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={{width: 60}}
                      onPress={() => this.callAccpet()}>
                      <Image
                        source={call_ring_accept}
                        style={styles.call_end_rejct_button}
                      />
                    </TouchableOpacity>
                  </View>
                )}
                {this.state.callStatusStr === 'CALL STARTED' && (
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'center',
                      alignItems: 'center',
                      width: DEVICE_WIDTH * 0.5,
                      marginTop: DEVICE_HEIGHT * 0.1,
                    }}>
                    <TouchableOpacity
                      style={{width: 60}}
                      onPress={() => this.callEnd()}>
                      <Image
                        source={call_end_reject}
                        style={styles.call_end_rejct_button}
                      />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </ImageBackground>
          </Modal>
          <Modal
            animationType="fade"
            animated
            transparent={false}
            visible={this.state.videoModalVisible}
            onRequestClose={() => {
              alert('Modal has been closed.');
            }}>
            <ImageBackground source={bg} style={styles.contentContainer}>
              {!state.showTimer && (
                <View style={{justifyContent: 'center', alignItems: 'center'}}>
                  <Image source={hiddenMan} style={styles.avatarOtherUser} />
                  <Text style={styles.userName}>{this.state.callerName}</Text>
                  {this.state.callStatusStr !== 'CALL STARTED' && (
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        width: DEVICE_WIDTH * 0.5,
                        marginTop: DEVICE_HEIGHT * 0.1,
                      }}>
                      <TouchableOpacity
                        style={{width: 60}}
                        onPress={() => this.callReject()}>
                        <Image
                          source={call_end_reject}
                          style={styles.call_end_rejct_button}
                        />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={{width: 60}}
                        onPress={() => this.callAccpet()}>
                        <Image
                          source={call_ring_accept}
                          style={styles.call_end_rejct_button}
                        />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              )}
              {state.showTimer && state.callEvent.payload.session && (
                <View
                  style={{
                    width: DEVICE_WIDTH,
                    height: DEVICE_HEIGHT * 0.7,
                    borderWidth: 3,
                    borderColor: '#FFF',
                    padding: 3,
                    zIndex: -1,
                  }}>
                  {/*<WebRTCView // opponent video*/}
                  {/*  sessionId={state.callEvent.payload.session.id}*/}
                  {/*  // add styles as necessary*/}
                  {/*  style={{width: '100%', height: '100%'}}*/}
                  {/*  userId={state.callEvent.payload.session.otherId} // your user's Id for local video or occupantId for remote*/}
                  {/*/>*/}
                </View>
              )}
              {state.showTimer && state.callEvent.payload.session && (
                <View
                  style={{
                    backgroundColor: '#FFF',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    width: DEVICE_WIDTH,
                    height: DEVICE_HEIGHT * 0.3,
                    borderWidth: 3,
                    borderColor: '#FFF',
                    padding: 3,
                    zIndex: 1,
                  }}>
                  {/*<WebRTCView*/}
                  {/*  sessionId={state.callEvent.payload.session.id}*/}
                  {/*  style={styles.myvideo} // add styles as necessary*/}
                  {/*  userId={state.callEvent.payload.session.opponentsIds[0]} // your user's Id for local video or occupantId for remote*/}
                  {/*/>*/}
                  <TouchableOpacity
                    style={{width: 60, height: 60}}
                    onPress={() => this.callEnd()}>
                    <Image
                      source={call_end_reject}
                      style={styles.call_end_rejct_button}
                    />
                  </TouchableOpacity>
                </View>
              )}
            </ImageBackground>
          </Modal>
        </View>
        <FlashMessage
          position="top"
          style={{backgroundColor: '#B64F54'}}
          renderCustomContent={() => (
            <NotificationView data={this.state.data} />
          )}
        />
      </View>
    );
  }
}

const NotificationView = props => {
  return (
    <View style={{flexDirection: 'row', flex: 1}}>
      <Image
        source={
          props.data.image && props.data.image !== ''
            ? {uri: props.data.image}
            : userIcon
        }
        style={{borderRadius: 20, width: 40, height: 40}}
      />
      <View
        style={{
          flexDirection: 'column',
          justifyContent: 'flex-start',
          alignSelf: 'flex-start',
          alignItems: 'flex-start',
          marginLeft: 10,
        }}>
        <Text style={{fontSize: 14, fontWeight: 'bold', color: '#FFF'}}>
          {props.data.title}
        </Text>
        <Text style={{fontSize: 12, fontWeight: '300', color: '#FFF'}}>
          {props.data.message}
        </Text>
      </View>
    </View>
  );
};

const DEVICE_WIDTH = Dimensions.get('window').width;
const DEVICE_HEIGHT = Dimensions.get('window').height;
const styles = StyleSheet.create({
  contentContainer: {
    width: '100%',
    height: '100%',
  },
  avatarOtherUser: {
    marginTop: DEVICE_HEIGHT * 0.15,
    width: DEVICE_WIDTH * 0.4,
    height: DEVICE_WIDTH * 0.4,
    borderRadius: DEVICE_WIDTH * 0.2,
  },
  userName: {
    fontSize: 18,
    color: '#FFF',
    marginTop: 30,
  },
  dialling: {
    fontSize: 16,
    color: '#FFF',
    marginTop: 30,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  call_end_rejct_button: {
    width: 60,
    height: 60,
  },
  smallIcon: {
    marginTop: 15,
    width: 30,
    height: 30,
  },
  video: {
    width: DEVICE_WIDTH,
    height: DEVICE_HEIGHT * 0.7,
    zIndex: 1000,
  },
  myvideo: {
    width: DEVICE_WIDTH * 0.25,
    height: DEVICE_HEIGHT * 0.3,
  },
});

const mapStateToProps = state => {
  const {unreadFlag, senders, callEvent} = state.reducer;
  return {unreadFlag, senders, callEvent};
};

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      changeReadFlag,
      updateCallEvent,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(AppView);
