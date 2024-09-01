import React from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  BackHandler,
  Dimensions,
  FlatList,
  Image,
  ImageBackground,
  Keyboard,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  ToastAndroid,
  TouchableHighlight,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {Menu, MenuDivider, MenuItem} from 'react-native-material-menu';
import Dialog, {SlideAnimation} from 'react-native-popup-dialog';

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';

import {changeReadFlag, updateQuickBlox} from '../../../Action';
import Global from '../Global';

import hiddenMan from '../../assets/images/hidden_man.png';
import diamond from '../../assets/images/red_diamond_trans.png';
import icClose from '../../assets/images/ic_close.png';
import iconTooltip from '../../assets/images/iconTooltip.png';
import shooting_star from '../../assets/images/shooting_star.png';
import yellow_star from '../../assets/images/yellow_star.png';
import ban_black from '../../assets/images/ban_black.png';
import reset from '../../assets/images/reset.png';
import editIcon from '../../assets/images/editIcon.png';
import notification_black from '../../assets/images/notification_black.png';
import {
  FIREBASE_DB,
  FIREBASE_DB_UNREAD,
  SERVER_URL,
} from '../../config/constants';
import firebase from '@react-native-firebase/app';
import database from '@react-native-firebase/database';
import {colors, em} from '../../commonUI/base';
import bg from '../../assets/images/bg.jpg';
import auth from '@react-native-firebase/auth';
import {replaceEmojis} from '../../util/upload';
import * as Sentry from '@sentry/react-native';
import {GestureHandlerRootView, State} from 'react-native-gesture-handler';
import ImageViewer from 'react-native-image-zoom-viewer';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DEVICE_WIDTH = Dimensions.get('window').width;

class ChatScreen extends React.PureComponent {
  static navigationOptions = {
    header: null,
  };
  _menu = null;

  constructor(props) {
    super(props);

    const template =
      'My name is #name#, who is #age# year old #gender# living in the #country#. #name# speaks #language#.';
    const template1 =
      ' #name#, who is #age# year old #gender# living in the #country#. #name# speaks #language#.';

    const {data} = props.route.params;

    const replacements = {
      name: Global.saveData.u_name,
      age: Global.saveData.u_age,
      gender: Global.saveData.u_gender === 1 ? 'Male' : 'Female',
      country: Global.saveData.u_country,
      description: Global.saveData.u_description,
      language: Global.saveData.u_language,
    };
    const result = this.replacePlaceholders(template, replacements);
    const result1 = this.replacePlaceholders(template1, replacements);
    this.onEndReachedCalledDuringMomentum = true;
    this.state = {
      other: {
        userId: data.data.other_user_id,
        name: data.data.name,
        imgUrl: data.imageUrl,
        description: data.data.description,
        coin_count: data.data.coin_count,
        fan_count: data.data.fan_count,
        ai_friend: data.data.ai_friend,
        chat_type: data.data.chat_type,
        ai_personality: data.data.ai_personality,
        img_message: data.data.img_message,
        creator_user_id: data.data.creator_user_id,
        is_public: data.data.is_public,
        language: data.data.language,
        isTooltipVisible: false,
      },
      opponentData: null,
      matchId: data.data.match_id,
      textMessage: '',
      messageList: [],
      orgAiPersonality: data.data.ai_personality,
      orgAiPersonalities: result1,
      originalAIPersonality: result1,
      tempMessageList: [
        {
          role: 'system',
          content: data.data.ai_personality
            ? data.data.ai_personality
                .replace('#userdata#', result1)
                .replace('undefined', '')
                .trim()
            : '',
        },
        {role: 'user', content: result.replace('undefined', '')},
      ],
      coinCount: Global.saveData.coin_count,
      visible: false,
      fanUserVisible: false,
      noFanUserVisible: false,
      imagLarge: false,
      imagLargeUrl: '',
      errorMsg: false,
      msgError: '',
      sendDiamondsCount: 0,
      fanMessage: '',
      is_fan: false,
      isReset: false,
      dialogStyle: {},
      statusByMatchId: 0,
      msgCoinPerMessage: 0,
      menu: false,
      isLoading: true,
      isInitialRender: false,
      ai_images_data: [],
      ai_image_id: 0,
      ai_image_sent: 0,
      dimensions: {adjustedWidth: 628 / 2.75, adjustedHeight: 1120 / 2.75},
      limit: 10,
      lastFetchedIndex: 0,
      lastKey: null,
      allMessageList: [],
      lastMessageId: 0,
      aiPersonalityImg: {
        id: 0,
        content: '',
        imageLink: '',
      },
      panEnabled: false,
    };
    this.flatListRef = React.createRef();
    this.scrollViewRef = React.createRef();
    this.lastMessageRef = React.createRef();
    this.imageZoomRef = React.createRef();

    this.scale = new Animated.Value(1);
    this.lastScale = 1;
    this.translateX = new Animated.Value(0);
    this.lastTranslateX = 0;
    this.translateY = new Animated.Value(0);
    this.lastTranslateY = 0;

    this.pinchRef = React.createRef();
    this.panRef = React.createRef();

    this.onPinchEvent = Animated.event([{nativeEvent: {scale: this.scale}}], {
      useNativeDriver: true,
    });

    this.onPanEvent = Animated.event(
      [
        {
          nativeEvent: {
            translationX: this.translateX,
            translationY: this.translateY,
          },
        },
      ],
      {useNativeDriver: true},
    );
  }

  handlePinchStateChange = ({nativeEvent}) => {
    if (
      nativeEvent.state === State.END ||
      nativeEvent.state === State.CANCELLED
    ) {
      this.lastScale *= nativeEvent.scale;
      this.scale.setValue(this.lastScale);

      if (this.lastScale > 1) {
        this.setState({panEnabled: true});
      } else {
        this.setState({panEnabled: false});
        this.resetTransform();
      }
    }
  };

  async componentDidUpdate(prevProps) {
    if (prevProps.route.params !== this.props.route.params) {
      await this.initializeState();
    }
  }

  async initializeState() {
    const {data} = this.props.route.params || {};
    if (data) {
      const {
        other_user_id,
        name,
        description,
        coin_count,
        fan_count,
        ai_friend,
        chat_type,
        ai_personality,
        img_message,
        creator_user_id,
        is_public,
        language,
      } = data.data;
      const {isFirstTime, imageUrl} = data;

      this.setState({
        other: {
          userId: other_user_id,
          name: name,
          imgUrl: imageUrl,
          description: description,
          coin_count: coin_count,
          fan_count: fan_count,
          ai_friend: ai_friend,
          chat_type: chat_type,
          ai_personality: ai_personality,
          img_message: img_message,
          creator_user_id: creator_user_id,
          language: language,
          is_public: is_public,
          isTooltipVisible: isFirstTime,
        },
      });
    }
  }

  handlePanStateChange = ({nativeEvent}) => {
    if (
      nativeEvent.state === State.END ||
      nativeEvent.state === State.CANCELLED
    ) {
      this.lastTranslateX += nativeEvent.translationX;
      this.lastTranslateY += nativeEvent.translationY;
      this.translateX.setValue(this.lastTranslateX);
      this.translateY.setValue(this.lastTranslateY);
    }
  };

  resetTransform = () => {
    Animated.parallel([
      Animated.spring(this.scale, {toValue: 1, useNativeDriver: true}),
      Animated.spring(this.translateX, {toValue: 0, useNativeDriver: true}),
      Animated.spring(this.translateY, {toValue: 0, useNativeDriver: true}),
    ]).start();
    this.lastScale = 1;
    this.lastTranslateX = 0;
    this.lastTranslateY = 0;
  };

  replacePlaceholders = (template, replacements) => {
    return template.replace(/#(\w+)#/g, (match, p1) => {
      return replacements[p1] || match;
    });
  };

  aiPersonalityChanged = textMessage => {
    const {img_message} = this.state.other;
    const {ai_images_data, ai_image_sent, tempMessageList, ai_image_id} =
      this.state;

    tempMessageList.push({
      role: 'user',
      content: textMessage,
    });

    if (
      ai_image_sent == img_message &&
      ai_images_data != undefined &&
      ai_images_data?.length > 0
    ) {
      const filteredArray = ai_images_data.find(
        item => ai_image_id === 0 || item.id > ai_image_id,
      );

      this.setState({
        aiPersonalityImg: {
          id: filteredArray.id,
          content: filteredArray.user_current_action,
          imageLink: filteredArray.user_image_url,
        },
      });

      tempMessageList[0].content = this.getCurrentAction(
        filteredArray.user_current_action,
      );
      tempMessageList[0].role = 'system';
    }
  };

  getCurrentAction = current_action => {
    return this.state.orgAiPersonality
      .replace('#userdata#', this.state.originalAIPersonality)
      .replace('#currentaction#', current_action)
      .replace('undefined', '')
      .trim();
  };

  getUserImagesData = () => {
    const userId = this.state.other.userId;
    fetch(`${SERVER_URL}/api/chat/getChatAIImageUrl/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: Global.saveData.token,
      },
    })
      .then(response => response.json())
      .then(responseJson => {
        if (!responseJson.error) {
          this.setState({
            ai_images_data: responseJson.data,
          });
        }
      })
      .catch(error => {
        Sentry.captureException(new Error(error));
      });
  };

  getUserImageLastData = () => {
    const userId = this.state.other.userId;
    const details = {
      user_sent: userId,
      user_received: Global.saveData.u_id,
    };
    let formBody = [];
    for (const property in details) {
      const encodedKey = encodeURIComponent(property);
      const encodedValue = encodeURIComponent(details[property]);
      formBody.push(encodedKey + '=' + encodedValue);
    }
    formBody = formBody.join('&');
    fetch(`${SERVER_URL}/api/chat/getChatAIImageUrlId/${userId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: Global.saveData.token,
      },
      body: formBody,
    })
      .then(response => response.json())
      .then(responseJson => {
        if (!responseJson.error) {
          if (responseJson.data === undefined && responseJson.content === '') {
            this.setState({
              ai_image_id: 0,
            });
          } else if (responseJson.data) {
            this.setState({
              ai_image_id: responseJson.data[0].image_id,
            });
            let tdata = '';
            if (
              this.state.ai_images_data !== undefined &&
              this.state.ai_images_data.length > 0
            ) {
              tdata = this.state.ai_images_data.find(
                item => item.id === responseJson.data[0].image_id,
              );
            }
            this.state.tempMessageList[0].content = this.getCurrentAction(
              tdata.user_current_action,
            );
          }
        }
      })
      .catch(error => {
        Sentry.captureException(new Error(error));
      });
  };

  getStatusByMatchId = () => {
    const details = {
      matchId: this.state.matchId,
    };
    let formBody = [];
    for (const property in details) {
      const encodedKey = encodeURIComponent(property);
      const encodedValue = encodeURIComponent(details[property]);
      formBody.push(encodedKey + '=' + encodedValue);
    }
    formBody = formBody.join('&');
    fetch(`${SERVER_URL}/api/match/getStatusByMatchId`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: Global.saveData.token,
      },
      body: formBody,
    })
      .then(response => response.json())
      .then(responseJson => {
        if (!responseJson.error) {
          this.setState({
            statusByMatchId: responseJson.data.status,
            msgCoinPerMessage: responseJson.data.coin_per_message,
          });
        }
      })
      .catch(error => {
        Sentry.captureException(new Error(error));
      });
  };

  async componentDidMount() {
    this.setState({
      menu: false,
      messageList: [],
      allMessageList: [],
    });

    this._mounted = true;
    if (!auth().currentUser) {
      await auth().signInWithEmailAndPassword(
        'admin@dorry.ai',
        'dorry.ai#&T^%^%#UIUG',
      );
    }

    this.getInitialRecords();
    Global.saveData.nowPage = 'ChatDetail';

    fetch(`${SERVER_URL}/api/transaction/getDiamondCount`, {
      method: 'POST',
      headers: {
        'Content-type': 'application/x-www-form-urlencoded',
        Authorization: Global.saveData.token,
      },
    })
      .then(response => response.json())
      .then(responseJson => {
        if (!responseJson.error) {
          Global.saveData.coin_count = responseJson.data.coin_count;
          this.setState({
            coinCount: Global.saveData.coin_count,
          });
        }
      })
      .catch(error => {
        Sentry.captureException(new Error(error));
      });

    this.keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      this.keyboardDidShow.bind(this),
    );
    this.keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      this.keyboardDidHide.bind(this),
    );
    this.backHanlder = BackHandler.addEventListener(
      'hardwareBackPress',
      this.backPressed,
    );
    this.getStatusByMatchId();

    this.checkUnReadMessage();
    this.checkFanUser();
    await this.initializeState();

    Keyboard.addListener('keyboardDidShow', this._keyboardDidShow);
    Keyboard.addListener('keyboardDidHide', this._keyboardDidHide);

    if (
      this.state.other.ai_friend === 1 &&
      this.state.other.ai_personality !== '' &&
      this.state.other.ai_personality !== null
    ) {
      this.getUserImagesData();
      this.getUserImageLastData();
    }
  }

  getInitialRecords() {
    const u_id = Global.saveData.u_id;
    const {userId, ai_friend, ai_personality} = this.state.other;

    database()
      .ref()
      .child(FIREBASE_DB)
      .child(u_id.toString())
      .child(userId.toString())
      .orderByChild('time')
      .limitToLast(10)
      .once('value', snapshot => {
        if (snapshot.exists()) {
          let messages = snapshot.val() ? Object.values(snapshot.val()) : [];

          messages.sort((a, b) => a.time - b.time);
          if (ai_friend === 1) {
            this.setState(
              {
                messageList: messages,
              },
              () => {
                this.getAllChatData();
              },
            );

            const lastMessageTime =
              messages.length > 0 ? messages[messages.length - 1].time : 0;
            this.registerChildAddedListener(lastMessageTime);

            if (messages.length === 0) {
              this.setState({isLoading: false});
            }
          }
          if (ai_friend === 0 && ai_personality == null) {
            this.setState({messageList: messages, isLoading: false});
          }
        } else {
          this.setState({isLoading: false});
          this.registerChildAddedListener(0);
        }
      })
      .catch(error => {
        Sentry.captureException(new Error(error));
        this.setState({isLoading: false});
      });
  }

  getAllChatData() {
    const u_id = Global.saveData.u_id;
    const {userId, ai_friend, ai_personality} = this.state.other;
    const {tempMessageList} = this.state;

    database()
      .ref()
      .child(FIREBASE_DB)
      .child(u_id.toString())
      .child(userId.toString())
      .once('value', snapshot => {
        if (snapshot.exists()) {
          let messages = snapshot.val() ? Object.values(snapshot.val()) : [];
          messages.sort((a, b) => a.time - b.time);
          if (ai_friend === 1) {
            this.setState(
              {
                allMessageList: messages,
              },
              () => {
                this.loadInitialMessages();
              },
            );

            let temp = tempMessageList.slice();
            messages.forEach(message => {
              if (message?.user_image_url) {
                const tempMessage = this.getCurrentAction(
                  message?.user_current_action,
                );
                temp.push({
                  role: 'assistant',
                  content: tempMessage,
                });
              }
              if (message?.resetError) {
                temp = [
                  {
                    role: 'system',
                    content: this.getCurrentAction(''),
                  },
                ];
              }
              temp.push({
                role: message.from === u_id ? 'user' : 'assistant',
                content: message.message.trim(),
              });
            });
            this.setState({tempMessageList: temp});
          }
          if (ai_friend === 0 && ai_personality == null) {
            this.setState({messageList: messages, isLoading: false});
          }
          // Register child_added listener after initial load
          // const lastMessageTime =
          //   messages.length > 0 ? messages[messages.length - 1].time : 0;
          // this.registerChildAddedListener(lastMessageTime);
        } else {
          this.setState({isLoading: false});
        }
      })
      .catch(error => {
        Sentry.captureException(new Error(error));
        // this.setState({isLoading: false});
      });
  }

  // Function to register the child_added listener starting from the last fetched message time
  registerChildAddedListener(lastMessageTime) {
    const u_id = Global.saveData.u_id;
    const {userId, ai_friend, ai_personality} = this.state.other;
    const {isLoading} = this.state;
    database()
      .ref()
      .child(FIREBASE_DB)
      .child(u_id.toString())
      .child(userId.toString())
      .orderByChild('time')
      .startAt(lastMessageTime + 1)
      .on('child_added', value => {
        // if (!isLoading) {
        const newMessage = value.val();
        if (ai_friend === 1) {
          let conversationHistory = {
            role: newMessage.from === u_id ? 'user' : 'assistant',
            content: newMessage.message.trim(),
          };
          this.setState(prevState => ({
            allMessageList: [...prevState.allMessageList, newMessage],
            messageList: [...prevState.messageList, newMessage],
            tempMessageList: [
              ...prevState.tempMessageList,
              conversationHistory,
            ],
          }));
        }
        if (ai_friend === 0 && ai_personality == null) {
          this.setState(prevState => ({
            messageList: [...prevState.messageList, newMessage],
          }));
        }
        this.scrollToBottom();
        // }
      });
  }

  loadInitialMessages = () => {
    const {limit, allMessageList} = this.state;
    const lastMessages = allMessageList.slice(-limit);
    this.setState({
      // messageList: lastMessages,
      lastFetchedIndex: allMessageList.length - limit,
    });
  };

  loadMoreMessages = () => {
    const {lastFetchedIndex, limit, allMessageList, messageList} = this.state;
    if (this.state.isLoading || lastFetchedIndex <= 0) {
      return;
    }

    this.setState({isLoading: true}, () => {
      const newLastFetchedIndex = Math.max(lastFetchedIndex - limit, 0);
      const moreMessages = allMessageList.slice(
        newLastFetchedIndex,
        lastFetchedIndex,
      );
      this.setState(prevState => ({
        messageList: [...moreMessages, ...prevState.messageList],
        lastFetchedIndex: newLastFetchedIndex,
        isLoading: false,
      }));
    });
  };

  handleScroll = ({nativeEvent}) => {
    const {contentOffset, layoutMeasurement, contentSize} = nativeEvent;
    const threshold = 20;
    if (contentOffset.y <= threshold) {
      if (!this.onEndReachedCalledDuringMomentum) {
        this.loadMoreMessages();
        this.onEndReachedCalledDuringMomentum = true;
      }
    }
  };

  scrollToBottom = () => {
    if (this.flatListRef.current && this.state.messageList.length > 0) {
      setTimeout(() => {
        this.flatListRef.current.scrollToEnd({animated: true});
      }, 75);
    }
    // if (this.scrollView && this.state.messageList.length > 0) {
    //   setTimeout(() => {
    //     this.scrollView.scrollToEnd({animated: true});
    //   }, 50);
    // }
  };

  onLastMessageLayout = () => {
    if (this.state.isLoading && this.state.messageList.length > 0) {
      this.scrollToBottom();
      this.setState({isLoading: false}); // Stop loading and scroll to bottom
    }
    if (this.state.isLoading && this.state.messageList.length === 0) {
      this.setState({isLoading: false});
    }
  };

  _keyboardDidShow = () => {
    this.setState({
      dialogStyle: {
        top: -1 * (DEVICE_WIDTH / 4),
        borderRadius: 20,
        padding: 10,
        overflow: 'hidden',
      },
    });
  };

  _keyboardDidHide = () => {
    this.setState({
      dialogStyle: {
        borderRadius: 20,
        padding: 10,
        overflow: 'hidden',
      },
    });
  };

  checkUnReadMessage = () => {
    const u_id = Global.saveData.u_id;
    database()
      .ref()
      .child(FIREBASE_DB_UNREAD)
      .child(u_id.toString() + '/')
      .once('value', value => {
        let senderIdArr = value.toJSON();
        let newPayload = {};
        let updates = {};
        if (senderIdArr) {
          senderIdArr = senderIdArr.split(',');
          let index = senderIdArr.indexOf(this.state.other.userId.toString());
          if (index !== -1) {
            senderIdArr.splice(index, 1);
          }
          newPayload = {
            unreadFlag: true,
            senders: senderIdArr,
          };
          if (senderIdArr.length) {
            newPayload.unreadFlag = true;
            updates[Global.saveData.u_id] = senderIdArr.toString();
            database().ref().child(FIREBASE_DB_UNREAD).update(updates);
          } else {
            newPayload.unreadFlag = false;
            database()
              .ref()
              .child(FIREBASE_DB_UNREAD)
              .child(u_id.toString() + '/')
              .remove();
          }

          this.props.changeReadFlag(newPayload);
        }
      });
  };

  componentWillUnmount() {
    this.setState({
      menu: false,
    });
    this._mounted = false;
    const u_id = Global.saveData.u_id;
    const userId = this.state.other.userId;
    database()
      .ref()
      .child(FIREBASE_DB)
      .child(u_id.toString())
      .child(userId.toString())
      .off('child_added');
    this.keyboardDidShowListener.remove();
    this.keyboardDidHideListener.remove();
    this.backHanlder.remove();
  }

  backPressed = () => {
    if (this.state.imagLarge) {
      this.setState({
        imagLarge: false,
      });
    } else {
      this.setState({
        menu: false,
        messageList: [],
        lastKey: null,
      });

      if (
        Global.saveData.prevpage == 'Chat' ||
        Global.saveData.prevpage == 'ChatDetail' ||
        Global.saveData.prevpage == 'IncomeDetail'
      ) {
        this.props.navigation.replace('Chat');
      } else if (Global.saveData.prevpage == 'BrowseList') {
        this.props.navigation.replace('BrowseList');
      } else if (Global.saveData.prevpage == 'Browse') {
        this.props.navigation.replace('BrowseList');
      } else {
        this.props.navigation.pop();
      }
    }
    return true;
  };

  keyboardDidShow(e) {
    // if (this._mounted && this.scrollView) {
    //   this.scrollToBottom();
    // }
    if (this._mounted && this.flatListRef.current) {
      this.scrollToBottom();
    }
  }

  keyboardDidHide(e) {
    if (this._mounted && this.flatListRef.current) {
      this.scrollToBottom();
    }
    // if (this._mounted && this.scrollView) {
    //   this.scrollToBottom();
    // }
  }

  hideMenu = () => {
    if (this._menu != null) {
      this._menu.hide();
    }
  };

  handleChange = key => val => {
    this.setState({
      [key]: val,
    });
  };

  setBlock = () => {
    this.hideMenu();
    Alert.alert(
      'Are you sure you want to block this user?',
      'Your chat history with this user will disappear from your chat list.',
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        {text: 'Confirm', onPress: () => this.requestBlock()},
      ],
      {cancelable: false},
    );
  };

  requestBlock = () => {
    const details = {
      otherId: this.state.other.userId,
    };
    let formBody = [];
    for (const property in details) {
      const encodedKey = encodeURIComponent(property);
      const encodedValue = encodeURIComponent(details[property]);
      formBody.push(encodedKey + '=' + encodedValue);
    }
    formBody = formBody.join('&');

    fetch(`${SERVER_URL}/api/match/block`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: Global.saveData.token,
      },
      body: formBody,
    })
      .then(response => response.json())
      .then(responseJson => {
        if (responseJson.error === false) {
          const u_id = Global.saveData.u_id;
          const userId = this.state.other.userId;
          database()
            .ref()
            .child(FIREBASE_DB)
            .child(u_id.toString())
            .child(userId.toString())
            .remove();
          database()
            .ref()
            .child(FIREBASE_DB)
            .child(userId.toString())
            .child(u_id.toString())
            .remove();
          this.props.navigation.replace('Chat');
        }
      })
      .catch(error => {
        Sentry.captureException(new Error(error));
      });
  };

  setReport = () => {
    this.hideMenu();
    this.props.navigation.navigate('Report', {
      otherId: this.state.other.userId,
    });
  };

  formatAMPM(time) {
    var date = new Date(time);
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0' + minutes : minutes;
    var strTime = hours + ':' + minutes + ' ' + ampm;
    return strTime;
  }

  sendMessage = async () => {
    if (this.state.textMessage.length > 0) {
      this.createNewMessage();
    }
  };

  updateChatImageHistory = (chat_id, id, tempcontent) => {
    const {userId, name} = this.state.other;

    const details = {
      ai_user_id: userId,
      ai_user_name: name,
      real_user_id: Global.saveData.u_id,
      real_user_name: Global.saveData.u_name,
      chat_id: chat_id,
      image_id: id,
      user_current_action: tempcontent,
    };

    let formBody = [];
    for (const property in details) {
      const encodedKey = encodeURIComponent(property);
      const encodedValue = encodeURIComponent(details[property]);
      formBody.push(encodedKey + '=' + encodedValue);
    }
    formBody = formBody.join('&');
    fetch(`${SERVER_URL}/api/chat/chatHistoryUpdate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: Global.saveData.token,
      },
      body: formBody,
    })
      .then(response => response.json())
      .then(responseJson => {
        if (!responseJson.error) {
          this.setState({ai_image_id: id});
        }
      })
      .catch(error => {
        Sentry.captureException(new Error(error));
      });
  };

  callbackChat = textMessage => {
    this.aiPersonalityChanged(textMessage);
    fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization:
          'Bearer sk-my-service-account-OcVwpHabIqoDlDYTtTLuT3BlbkFJOsnTUJjvEiuTd2sUQyDK',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: this.state.tempMessageList,
        max_tokens: 512,
        temperature: 0.7,
        top_p: 0.9,
        frequency_penalty: 0.5,
        presence_penalty: 0.6,
        n: 1,
      }),
    })
      .then(response => response.json())
      .then(responseJson => {
        // console.log('callbackChat', JSON.stringify(responseJson));
        const messageOfChat = responseJson.choices[0].message.content.trim();
        const aiCharacteristics = this.getCurrentAction('');
        const parts = aiCharacteristics.split(/[\.\?\!]\s/);
        if (!parts.some(part => messageOfChat.includes(part.trim()))) {
          this.processAIResponse(messageOfChat);
        } else {
          this.resetError(false, textMessage);
        }
      })
      .catch(error => {
        Sentry.captureException(new Error(error));
        console.log(error);
      });
  };

  callBackDeepInfraChat = textMessage => {
    this.aiPersonalityChanged(textMessage);
    this.state.tempMessageList[0].content.replace('ChatGPT', '');
    // Authorization: 'Bearer Ixg4lU3AELIubf2UutGa5ApFkf6WhrH8',
    // Bearer 6oBs98aRVw7IgL3NBNpQgm1twv7xvFPL
    fetch('https://api.deepinfra.com/v1/openai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer Ixg4lU3AELIubf2UutGa5ApFkf6WhrH8',
      },
      body: JSON.stringify({
        model: 'meta-llama/Meta-Llama-3-8B-Instruct',
        messages: this.state.tempMessageList,
        max_tokens: 512,
        temperature: 0.7,
        top_p: 0.9,
        top_k: 0,
        frequency_penalty: 0,
        presence_penalty: 0,
        n: 1,
        response_format: {type: 'json_object'},
        tool_choice: 'auto',
      }),
    })
      .then(response => response.json())
      .then(responseJson => {
        const messageOfChat = replaceEmojis(
          responseJson.choices[0].message.content.trim(),
        );
        const aiCharacteristics = this.getCurrentAction('');
        const parts = aiCharacteristics.split(/[\.\?\!]\s/);
        if (
          !parts.some(part => messageOfChat.includes(part.trim())) ||
          this.state.other.creator_user_id
        ) {
          this.processAIResponse(messageOfChat);
        } else {
          this.resetError(false, textMessage);
          this.setState({isReset: true});
        }
      })
      .catch(error => {
        Sentry.captureException(new Error(error));
        console.log(error);
      });
  };

  processAIResponse = responseData => {
    const {matchId, ai_image_sent} = this.state;
    const {img_message, userId} = this.state.other;
    const {imageLink, content, id} = this.state.aiPersonalityImg;
    const u_id = Global.saveData.u_id;

    // console.log(
    //   `matchId: ${matchId} \n ai_image_sent: ${ai_image_sent} \n img_message: ${img_message} \n imageLink: ${imageLink} \n content: ${content} \n id: ${id} \n message: ${responseData}`,
    // );

    const details = {
      matchId: matchId,
      messageText: responseData.trim(),
      user_image_url: ai_image_sent == img_message ? imageLink : '',
      user_current_action: ai_image_sent == img_message ? content : '',
      is_auto_chat: true,
    };
    let formBody = [];
    for (const property in details) {
      const encodedKey = encodeURIComponent(property);
      const encodedValue = encodeURIComponent(details[property]);
      formBody.push(encodedKey + '=' + encodedValue);
    }
    formBody = formBody.join('&');
    fetch(`${SERVER_URL}/api/chat/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: Global.saveData.token,
      },
      body: formBody,
    })
      .then(response => response.json())
      .then(responseJson => {
        if (responseJson.data.account_status == 1) {
          if (ai_image_sent == img_message) {
            this.updateChatImageHistory(
              responseJson.data.sendResult.insertId,
              id,
              content,
            );
          }

          let msgId = database()
            .ref()
            .child(FIREBASE_DB)
            .child(userId.toString())
            .child(u_id.toString())
            .push().key;
          let updates = {};
          updates[userId + '/' + u_id + '/' + msgId] = {
            message: responseData.trim(),
            time: firebase.database.ServerValue.TIMESTAMP,
            from: userId,
            user_image_id: ai_image_sent == img_message ? id : null,
            user_image_url: ai_image_sent == img_message ? imageLink : null,
            user_current_action: ai_image_sent == img_message ? content : null,
            read: true,
          };
          updates[u_id + '/' + userId + '/' + msgId] = {
            message: responseData.trim(),
            time: firebase.database.ServerValue.TIMESTAMP,
            from: userId,
            user_image_id: ai_image_sent == img_message ? id : null,
            user_image_url: ai_image_sent == img_message ? imageLink : null,
            user_current_action: ai_image_sent == img_message ? content : null,
            read: false,
          };
          database()
            .ref()
            .child(FIREBASE_DB)
            .update(updates)
            .then(() => {
              if (ai_image_sent == img_message) {
                this.setState({ai_image_sent: 0});
              }
            });
          this.scrollToBottom();
        } else {
          Alert.alert('', responseJson.message, [], {cancelable: false});
        }
      })
      .catch(error => {
        Sentry.captureException(new Error(error));
      });
  };

  createNewMessage = () => {
    const {textMessage, matchId, ai_image_sent} = this.state;
    const {ai_friend, ai_personality, userId, chat_type} = this.state.other;

    this.setState({textMessage: ''});
    if (ai_friend === 1 && ai_personality !== '' && ai_personality !== null) {
      this.setState(prevState => {
        return {
          ai_image_sent:
            prevState.ai_image_sent >= ai_image_sent
              ? prevState.ai_image_sent + 1
              : 0,
        };
      });
    }

    const details = {
      matchId: matchId,
      messageText: textMessage,
      is_auto_chat: false,
    };
    let formBody = [];
    for (const property in details) {
      const encodedKey = encodeURIComponent(property);
      const encodedValue = encodeURIComponent(details[property]);
      formBody.push(encodedKey + '=' + encodedValue);
    }
    formBody = formBody.join('&');
    fetch(`${SERVER_URL}/api/chat/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: Global.saveData.token,
      },
      body: formBody,
    })
      .then(response => response.json())
      .then(responseJson => {
        if (responseJson.data.account_status == 1) {
          if (responseJson.data.sending_available) {
            const u_id = Global.saveData.u_id;
            let msgId = database()
              .ref()
              .child(FIREBASE_DB)
              .child(u_id.toString())
              .child(userId.toString())
              .push().key;
            let updates = {};
            let senderMessage = {
              message: textMessage,
              time: firebase.database.ServerValue.TIMESTAMP,
              from: Global.saveData.u_id,
              read: true,
            };
            updates[Global.saveData.u_id + '/' + userId + '/' + msgId] =
              senderMessage;
            let receiverMessage = {
              message: textMessage,
              time: firebase.database.ServerValue.TIMESTAMP,
              from: Global.saveData.u_id,
              read: false,
            };
            updates[userId + '/' + Global.saveData.u_id + '/' + msgId] =
              receiverMessage;
            database().ref().child(FIREBASE_DB).update(updates);

            this.scrollToBottom();
            if (
              ai_friend === 1 &&
              ai_personality != null &&
              ai_personality !== ''
            ) {
              if (chat_type == 1) {
                this.callbackChat(textMessage);
              } else if (chat_type == 2) {
                this.callBackDeepInfraChat(textMessage);
              }
            }
          } else {
            if (!responseJson.data.diamonds_enough) {
              Alert.alert(
                '',
                responseJson.message,
                [
                  {
                    text: 'Cancel',
                    onPress: () => console.log('Cancel Pressed'),
                  },
                  {text: 'Buy Diamonds', onPress: () => this.gotoShop()},
                ],
                {cancelable: false},
              );
            } else {
              Alert.alert(
                '',
                'You cannot send a message to this uer.',
                [
                  {
                    text: 'OK',
                    onPress: () => this.props.navigation.replace('Chat'),
                  },
                ],
                {cancelable: false},
              );
            }
          }
        } else {
          Alert.alert('', responseJson.message, [], {cancelable: false});
        }
      })
      .catch(error => {
        Sentry.captureException(new Error(error));
      });
  };

  editAIuserProfilePic = async () => {
    const {userId, name, creator_user_id} = this.state.other;

    const data = {
      data: {
        id: userId,
        username: name,
        creator_user_id: creator_user_id,
      },
    };
    this.setState(
      {
        menu: false,
      },
      () => {
        this.props.navigation.replace('MyVideo', {data: data});
      },
    );
  };

  editAIuser = async () => {
    const {
      userId,
      name,
      ai_personality,
      description,
      creator_user_id,
      is_public,
      language,
      fan_count,
    } = this.state.other;
    await AsyncStorage.setItem('id', userId.toString());
    await AsyncStorage.setItem('name', name);
    await AsyncStorage.setItem('description', description);
    await AsyncStorage.setItem('creator_user_id', creator_user_id.toString());
    await AsyncStorage.setItem('is_public', is_public.toString());
    await AsyncStorage.setItem('language', language.toString());
    await AsyncStorage.setItem('fancount', fan_count.toString());
    await AsyncStorage.setItem(
      'ai_personality',
      ai_personality
        .replace(
          'all conversations are appropriate and legal, does not involve minor and is not sexual.',
          '',
        )
        .replace('. #currentaction#.', '')
        .replace('You are talking to #userdata#.', '')
        .trim(),
    );

    const data = {
      data: {
        id: userId,
        username: name,
        description: description,
        ai_personality: ai_personality
          .replace(
            'all conversations are appropriate and legal, does not involve minor and is not sexual.',
            '',
          )
          .replace('. #currentaction#.', '')
          .replace('You are talking to #userdata#.', '')
          .trim(),
        creator_user_id: creator_user_id,
        is_public: is_public,
        language: language,
        fan_count: fan_count,
      },
    };
    this.props.navigation.replace('AIUserEdit', {data: data});
  };

  resetError = (isToast = true, lastUserMessage = null) => {
    const serverTime = firebase.database.ServerValue.TIMESTAMP;
    const u_id = Global.saveData.u_id;
    const {userId, chat_type} = this.state.other;
    console.log(lastUserMessage);
    database()
      .ref(FIREBASE_DB)
      .child(u_id.toString())
      .child(userId.toString())
      .orderByChild('time')
      .limitToLast(1)
      .once('value')
      .then(snapshot => {
        const lastMessageData = snapshot.val();
        const lastMessageKey = Object.keys(lastMessageData)[0];
        database()
          .ref(FIREBASE_DB)
          .child(u_id.toString())
          .child(userId.toString())
          .child(lastMessageKey)
          .update({
            resetError: serverTime,
          })
          .then(() => {
            this.setState({
              lastMessageId: serverTime,
            });
            const temp = this.getCurrentAction('');
            this.state.tempMessageList = [
              {
                role: 'system',
                content: temp,
              },
            ];
            if (!isToast && lastUserMessage != null && !this.state.isReset) {
              if (chat_type == 1) {
                this.callbackChat(lastUserMessage);
              } else if (chat_type == 2) {
                this.callBackDeepInfraChat(lastUserMessage);
              }
            }
            if (isToast) {
              ToastAndroid.showWithGravity(
                'Error reset. Please start again',
                ToastAndroid.LONG,
                ToastAndroid.CENTER,
              );
            }
          })
          .catch(error => {
            Sentry.captureException(new Error(error));
            console.error('Error updating last message: ', error);
          });
      })
      .catch(error => {
        Sentry.captureException(new Error(error));
        console.error('Error fetching last message: ', error);
      });
  };

  gotoProfilePage = () => {
    Global.saveData.prevpage = 'ChatDetail';

    fetch(
      `${SERVER_URL}/api/match/getOtherUserData/${this.state.other.userId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: Global.saveData.token,
        },
      },
    )
      .then(response => response.json())
      .then(responseJson => {
        if (!responseJson.error) {
          let newData = responseJson.data;

          this.props.navigation.navigate('Profile', {
            data: {
              id: newData.id,
              name: newData.name,
              description: newData.description,
              age: newData.age,
              gender: newData.gender,
              distance: newData.distance,
              country_name: newData.country_name,
              ethnicity_name: newData.ethnicity_name,
              language_name: newData.language_name,
              last_loggedin_date: newData.last_loggedin_date,
              matchId: this.state.matchId,
              imageUrl: this.state.other.imgUrl,
              coin_count: newData.coin_count,
              fan_count: newData.fan_count,
              coin_per_message: newData.coin_per_message,
              ai_friend: this.state.other.ai_friend,
              chat_type: this.state.other.chat_type,
              ai_personality: this.state.other.ai_personality,
              creator_user_id: this.state.other.creator_user_id,
              is_public: this.state.other.is_public,
              language: this.state.other.language,
            },
          });
        }
      })
      .catch(error => {
        Sentry.captureException(new Error(error));
      });
  };

  renderRow = React.memo(({item, index}) => {
    const isLastMessage = index === this.state.messageList.length - 1;
    return (
      <View
        key={`${index}_0${index}`}
        ref={isLastMessage ? this.lastMessageRef : null}
        onLayout={isLastMessage ? this.onLastMessageLayout : null}
        style={{
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}>
        <View
          style={{
            flexDirection: 'column',
            justifyContent: 'space-between',
            alignSelf:
              item.from === Global.saveData.u_id ? 'flex-end' : 'flex-start',
            margin: 10,
            marginLeft: 15,
            maxWidth: '70%',
          }}>
          <Text
            style={{
              padding: 3,
              fontSize: 12,
              color: '#000',
              alignSelf: 'flex-end',
            }}>
            {this.formatAMPM(item.time)}
          </Text>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              backgroundColor:
                item.from === Global.saveData.u_id ? '#D5d5d5' : '#B64F54',
              borderRadius: 20,
              padding: 8,
              paddingLeft:
                item.from === Global.saveData.u_id
                  ? 10
                  : item?.user_image_url !== '' && item?.user_image_url != null
                  ? 10.5
                  : 30,
              shadowColor: '#efefef',
              shadowOpacity: 0.8,
              shadowRadius: 2,
              shadowOffset: {
                height: 1,
                width: 1,
              },
            }}
            elevation={5}>
            {item.from === this.state.other.userId && (
              <TouchableHighlight
                style={styles.avatarBtn}
                onPress={() => this.gotoProfilePage()}>
                <Image
                  style={styles.avatar}
                  source={
                    this.state.other.imgUrl
                      ? {uri: this.state.other.imgUrl}
                      : hiddenMan
                  }
                />
              </TouchableHighlight>
            )}
            <View>
              {item?.user_image_url !== '' && item?.user_image_url != null ? (
                <TouchableOpacity
                  onPress={() => {
                    this.setState({
                      imagLargeUrl: item?.user_image_url,
                    });
                    this.setState({
                      imagLarge: true,
                    });
                  }}>
                  <Image
                    style={{
                      width: this.state.dimensions?.adjustedWidth,
                      height: this.state.dimensions?.adjustedHeight,
                      borderRadius: 10,
                    }}
                    resizeMode="contain"
                    source={{uri: item?.user_image_url}}
                  />
                </TouchableOpacity>
              ) : (
                <></>
              )}
              <Text
                style={{
                  padding: 7,
                  fontSize: 15,
                  color: item.from === Global.saveData.u_id ? '#000' : '#FFF',
                }}>
                {item.message}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  });

  firstTime = () => {
    this.setState({
      other: {
        isTooltipVisible: false,
      },
    });
  };

  gotoShop = () => {
    this.setState({
      visible: false,
    });
    this.props.navigation.navigate('ScreenGpay01');
  };

  checkFanUser = () => {
    var details = {
      otherId: this.state.other.userId,
    };
    var formBody = [];
    for (var property in details) {
      var encodedKey = encodeURIComponent(property);
      var encodedValue = encodeURIComponent(details[property]);
      formBody.push(encodedKey + '=' + encodedValue);
    }
    formBody = formBody.join('&');
    fetch(`${SERVER_URL}/api/fan/checkFanOtherUser`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: Global.saveData.token,
      },
      body: formBody,
    })
      .then(response => response.json())
      .then(responseJson => {
        if (!responseJson.error) {
          if (responseJson.is_fan) {
            this.setState({
              is_fan: true,
            });
          }
        }
      })
      .catch(error => {
        Sentry.captureException(new Error(error));
      });
  };

  showSendDiamondsModal = () => {
    this.setState({
      menu: false,
    });
    var details = {
      otherId: this.state.other.userId,
    };
    var formBody = [];
    for (var property in details) {
      var encodedKey = encodeURIComponent(property);
      var encodedValue = encodeURIComponent(details[property]);
      formBody.push(encodedKey + '=' + encodedValue);
    }
    formBody = formBody.join('&');
    fetch(`${SERVER_URL}/api/fan/checkFanOtherUser`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: Global.saveData.token,
      },
      body: formBody,
    })
      .then(response => response.json())
      .then(responseJson => {
        if (!responseJson.error) {
          if (responseJson.is_fan) {
            this.setState({
              fanUserVisible: true,
              noFanUserVisible: false,
            });
          } else {
            this.setState({
              fanUserVisible: false,
              noFanUserVisible: true,
            });
          }
        }
      })
      .catch(error => {
        Sentry.captureException(new Error(error));
      });
  };

  sendDiamonds = () => {
    let {sendDiamondsCount, fanMessage} = this.state;
    if (isNaN(sendDiamondsCount)) {
      Alert.alert(
        'Invalid input',
        'You must input a valid number of diamonds to send.',
        [
          {
            text: 'Ok',
            onPress: () => console.log('Ok Pressed'),
            style: 'cancel',
          },
        ],
        {cancelable: false},
      );
    } else {
      if (sendDiamondsCount > Global.saveData.coin_count) {
        Alert.alert(
          'Insufficient diamonds',
          'You only have ' +
            Global.saveData.coin_count +
            ' diamonds available. More diamonds are needed.',
          [
            {
              text: 'Cancel',
              onPress: () => console.log('Cancel Pressed'),
              style: 'cancel',
            },
            {
              text: 'Buy Diamonds',
              onPress: () => this.gotoShop(),
              style: 'cancel',
            },
          ],
          {cancelable: false},
        );
      } else if (sendDiamondsCount == 0 || sendDiamondsCount == '') {
        Alert.alert(
          'Invalid count',
          'You must send 1 or more diamonds.',
          [
            {
              text: 'Ok',
              onPress: () => console.log('Ok Pressed'),
              style: 'cancel',
            },
          ],
          {cancelable: false},
        );
      } else {
        var details = {
          userName: Global.saveData.u_name,
          otherId: this.state.other.userId,
          otherUserName: this.state.other.name,
          amount: sendDiamondsCount,
          fanMessage: fanMessage,
        };
        var formBody = [];
        for (var property in details) {
          var encodedKey = encodeURIComponent(property);
          var encodedValue = encodeURIComponent(details[property]);
          formBody.push(encodedKey + '=' + encodedValue);
        }
        formBody = formBody.join('&');
        fetch(`${SERVER_URL}/api/fan/sendDiamonds`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: Global.saveData.token,
          },
          body: formBody,
        })
          .then(response => response.json())
          .then(responseJson => {
            if (!responseJson.error) {
              if (responseJson.data.account_status == 1) {
                if (responseJson.data.sending_available) {
                  Global.saveData.coin_count = responseJson.data.coin_count;
                  this.setState({
                    other: {
                      userId: this.state.other.userId,
                      name: this.state.other.name,
                      imgUrl: this.state.other.imgUrl,
                      description: this.state.other.description,
                      coin_count:
                        parseInt(this.state.other.coin_count) +
                        parseInt(sendDiamondsCount),
                      fan_count: responseJson.data.other_fan_count,
                    },
                  });
                } else {
                  Alert.alert(
                    '',
                    'You cannot send diamonds.',
                    [
                      {
                        text: 'OK',
                        onPress: () =>
                          this.props.navigation.replace('BrowseList'),
                      },
                    ],
                    {cancelable: false},
                  );
                }
              } else {
                Alert.alert('', responseJson.message, [], {cancelable: false});
              }
            }
          })
          .catch(error => {
            Sentry.captureException(new Error(error));
            this.setState({
              isLoading: false,
              disabled: false,
            });
          });
      }
    }
  };

  checkCount = value => {
    if (isNaN(value)) {
      this.setState({
        msgErrorNumber: true,
        sendDiamondsCount: value,
        msgError: 'This field should be number.',
      });
    } else {
      if (value > Global.saveData.coin_count) {
        this.setState({
          msgErrorNumber: true,
          sendDiamondsCount: value,
          msgError:
            'You only have ' +
            Global.saveData.coin_count +
            ' diamonds available.',
        });
      } else {
        this.setState({
          msgErrorNumber: false,
          sendDiamondsCount: value,
        });
      }
    }
  };

  handleMomentumScrollBegin = () => {
    this.onEndReachedCalledDuringMomentum = false;
  };

  setLargeImage = imageUrl => {
    this.setState({
      imagLarge: true,
      imagLargeUrl: imageUrl,
    });
  };

  render() {
    return (
      <View style={styles.outer}>
        <StatusBar
          backgroundColor="transparent"
          barStyle="light-content"
          translucent={true}
        />
        <Dialog
          visible={this.state.fanUserVisible}
          dialogAnimation={
            new SlideAnimation({
              slideFrom: 'top',
            })
          }>
          <View style={styles.screenOverlay}>
            <View style={styles.dialogPrompt}>
              <Text style={[styles.bodyFont, {color: '#000'}]}>
                {`You have ${Global.saveData.coin_count} diamonds`}
              </Text>
              <View style={{flexDirection: 'row'}}>
                <Text style={[styles.bodyFont, {color: '#000'}]}>
                  {'Send '}
                </Text>
                <View style={styles.SectionStyle}>
                  <Image source={diamond} style={{width: 25, height: 25}} />
                  <TextInput
                    placeholder={''}
                    style={[styles.textInput, {color: '#000'}]}
                    onChangeText={value => this.checkCount(value)}
                  />
                </View>
                <Text style={[styles.bodyFont, {color: '#000'}]}>
                  {' Diamonds'}
                </Text>
              </View>
              {this.state.errorMsg && (
                <Text style={[styles.requiredSent, {color: '#000'}]}>
                  * {this.state.msgError}{' '}
                </Text>
              )}
              <Text style={{fontSize: 16, color: '#000'}}>
                {`Write a fan message to ${this.state.other.name} (public and optional)`}
              </Text>
              <TextInput
                multiline={true}
                numberOfLines={5}
                style={[styles.textMessageInput, {color: '#000'}]}
                editable
                onChangeText={text =>
                  this.setState({
                    fanMessage: text,
                  })
                }
              />
              <View style={styles.buttonsOuterView}>
                <View style={styles.buttonsInnerView}>
                  <TouchableOpacity
                    style={[styles.button]}
                    onPress={() =>
                      this.setState(
                        {
                          fanUserVisible: !this.state.fanUserVisible,
                        },
                        function () {
                          this.hideMenu();
                        },
                      )
                    }>
                    <Text style={[styles.cancelButtonText, {color: '#000'}]}>
                      {'Cancel'}
                    </Text>
                  </TouchableOpacity>
                  <View style={styles.buttonsDivider} />
                  <TouchableOpacity
                    style={[styles.button]}
                    onPress={() =>
                      this.setState(
                        {
                          fanUserVisible: !this.state.fanUserVisible,
                        },
                        function () {
                          this.hideMenu();
                          this.sendDiamonds();
                        },
                      )
                    }>
                    <Text style={[styles.submitButtonText, {color: '#000'}]}>
                      {'Send'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </Dialog>

        <Dialog
          visible={this.state.other.isTooltipVisible}
          dialogAnimation={
            new SlideAnimation({
              slideFrom: 'top',
            })
          }>
          <View
            style={{
              height: 330,
              backgroundColor: '#fff',
              padding: 20,
              margin: 20,
            }}>
            <View>
              <Text style={{fontSize: 16, color: '#000', marginBottom: 25}}>
                To edit the AI character’s settings, click on the three-dot menu
                button in top-right corner.
              </Text>
              <View
                style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Image
                  style={{
                    width: 200,
                    height: 150,
                    borderRadius: 10,
                  }}
                  source={iconTooltip}
                />
              </View>
              <TouchableOpacity
                style={[
                  styles.button,
                  {
                    justifyContent: 'flex-end',
                    alignItems: 'flex-end',
                    marginTop: 25,
                  },
                ]}
                onPress={() => {
                  this.setState(prevState => ({
                    other: {
                      ...prevState.other,
                      isTooltipVisible: false,
                    },
                  }));
                }}>
                <Text style={[styles.submitButtonText, {color: '#000'}]}>
                  {'OK'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Dialog>

        <Dialog
          visible={this.state.imagLarge}
          dialogAnimation={
            new SlideAnimation({
              slideFrom: 'top',
            })
          }>
          <View style={[styles.screenOverlay]}>
            <View style={{position: 'absolute', zIndex: 9, right: 40, top: 60}}>
              <TouchableOpacity
                onPress={() => {
                  this.setState({
                    imagLarge: false,
                  });
                }}>
                <Image style={{width: 24, height: 24}} source={icClose} />
              </TouchableOpacity>
            </View>
            <GestureHandlerRootView>
              <View
                style={[
                  styles.dialogPrompt,
                  {
                    backgroundColor: 'black',
                    opacity: 0.9,
                    marginTop: 50,
                    width: Dimensions.get('window').width - 20,
                    height: Dimensions.get('window').height - 75,
                  },
                ]}>
                {/*<PanGestureHandler*/}
                {/*  onGestureEvent={this.onPanEvent}*/}
                {/*  onHandlerStateChange={this.handlePanStateChange}*/}
                {/*  ref={this.panRef}*/}
                {/*  simultaneousHandlers={[this.pinchRef]}*/}
                {/*  enabled={this.state.panEnabled}*/}
                {/*  failOffsetX={[-1000, 1000]}*/}
                {/*  shouldCancelWhenOutside>*/}
                {/*  <Animated.View style={{flex: 1}}>*/}
                {/*    <PinchGestureHandler*/}
                {/*      ref={this.pinchRef}*/}
                {/*      onGestureEvent={this.onPinchEvent}*/}
                {/*      onHandlerStateChange={this.handlePinchStateChange}*/}
                {/*      simultaneousHandlers={[this.panRef]}>*/}
                {/*      <Animated.Image*/}
                {/*        source={{uri: this.state.imagLargeUrl}}*/}
                {/*        style={{*/}
                {/*          width: Dimensions.get('window').width - 20,*/}
                {/*          height: Dimensions.get('window').height - 75,*/}
                {/*          transform: [*/}
                {/*            {scale: this.scale},*/}
                {/*            {translateX: this.translateX},*/}
                {/*            {translateY: this.translateY},*/}
                {/*          ],*/}
                {/*        }}*/}
                {/*        resizeMode="contain"*/}
                {/*      />*/}
                {/*    </PinchGestureHandler>*/}
                {/*  </Animated.View>*/}
                {/*</PanGestureHandler>*/}
                <ImageViewer
                  imageUrls={[
                    {
                      url: this.state.imagLargeUrl,
                    },
                  ]}
                  width={Dimensions.get('window').width - 20}
                  height={Dimensions.get('window').height - 75}
                  renderIndicator={() => {}}
                  renderImage={({source}) => (
                    <Image
                      source={source}
                      style={{
                        width: Dimensions.get('window').width - 20,
                        height: Dimensions.get('window').height - 75,
                      }}
                    />
                  )}
                />
                {/*<Image*/}
                {/*  style={{*/}
                {/*    width: Dimensions.get('window').width - 20,*/}
                {/*    height: Dimensions.get('window').height - 75,*/}
                {/*    borderRadius: 10,*/}
                {/*    resizeMode: 'cover',*/}
                {/*  }}*/}
                {/*  source={{uri: this.state.imagLargeUrl}}*/}
                {/*/>*/}
              </View>
            </GestureHandlerRootView>
          </View>
        </Dialog>

        <Dialog
          visible={this.state.noFanUserVisible}
          dialogStyle={this.state.dialogStyle}
          dialogAnimation={
            new SlideAnimation({
              slideFrom: 'top',
            })
          }>
          <View style={styles.screenOverlay}>
            <View style={styles.dialogPrompt}>
              <Text style={[styles.title, {color: '#000'}]}>
                {`Become a fan of ${this.state.other.name} by sending diamonds!`}
              </Text>
              <View style={{alignItems: 'center', justifyContent: 'center'}}>
                <Image
                  source={shooting_star}
                  style={{width: 130, height: 130, marginTop: 20}}
                />
              </View>
              <Text style={[styles.bodyFont, {color: '#000'}]}>
                {`You have ${Global.saveData.coin_count} diamonds`}
              </Text>
              <View style={{flexDirection: 'row'}}>
                <Text style={[styles.bodyFont, {color: '#000'}]}>
                  {'Send '}
                </Text>
                <View style={styles.SectionStyle}>
                  <Image source={diamond} style={{width: 25, height: 25}} />
                  <TextInput
                    placeholder={''}
                    style={[styles.textInput, {color: '#000'}]}
                    onChangeText={value => this.checkCount(value)}
                  />
                </View>
                <Text style={[styles.bodyFont, {color: '#000'}]}>
                  {' Diamonds'}
                </Text>
              </View>
              {this.state.errorMsg && (
                <Text style={[styles.requiredSent, {color: '#000'}]}>
                  * {this.state.msgError}{' '}
                </Text>
              )}
              <Text style={{fontSize: 16, color: '#000'}}>
                {`Write a fan message to ${this.state.other.name} (public and optional)`}
              </Text>
              <TextInput
                multiline={true}
                numberOfLines={5}
                style={[styles.textMessageInput, {color: '#000'}]}
                editable
                onChangeText={text =>
                  this.setState({
                    fanMessage: text,
                  })
                }
              />
              <View style={styles.buttonsOuterView}>
                <View style={styles.buttonsInnerView}>
                  <TouchableOpacity
                    style={[styles.button]}
                    onPress={() =>
                      this.setState(
                        {
                          noFanUserVisible: !this.state.noFanUserVisible,
                        },
                        function () {
                          this.hideMenu();
                        },
                      )
                    }>
                    <Text style={[styles.cancelButtonText, {color: '#000'}]}>
                      {'Cancel'}
                    </Text>
                  </TouchableOpacity>
                  <View style={styles.buttonsDivider} />
                  <TouchableOpacity
                    style={[styles.button]}
                    onPress={() =>
                      this.setState(
                        {
                          noFanUserVisible: !this.state.noFanUserVisible,
                        },
                        function () {
                          this.hideMenu();
                          this.sendDiamonds();
                        },
                      )
                    }>
                    <Text style={[styles.submitButtonText, {color: '#000'}]}>
                      {'Send'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </Dialog>

        <ImageBackground
          source={bg}
          style={{
            width: '100%',
            height: 150 * em,
            position: 'relative',
            justifyContent: 'flex-start',
          }}>
          <View
            style={{
              position: 'absolute',
              left: 20 * em,
              top: 70 * em,
              alignSelf: 'center',
              zIndex: 2,
            }}>
            <TouchableHighlight
              style={{
                height: 75 * em,
                width: 75 * em,
                borderRadius: 5, // Make it circular for better touch area
                backgroundColor: 'transparent', // Background color should be transparent
                justifyContent: 'center',
                alignItems: 'center',
              }}
              underlayColor="rgba(0,0,0,0.2)" // Slight darkening effect when pressed
              onPress={this.backPressed}>
              <Icon
                name="keyboard-arrow-left"
                size={36}
                color={colors.inputLabel}
              />
            </TouchableHighlight>
          </View>
          <View
            style={{
              position: 'absolute',
              left: 65,
              top: 70 * em,
              width: '100%',
              alignItems: 'flex-start',
              justifyContent: 'center',
              zIndex: 0,
            }}>
            <TouchableOpacity
              style={styles.avatarOtherUserBtn}
              onPress={() => this.gotoProfilePage()}>
              <View
                style={{
                  flexDirection: 'row',
                  flex: 1,
                  flexWrap: 'wrap',
                  alignItems: 'center',
                }}>
                <Image
                  style={styles.avatarOtherUser}
                  source={
                    this.state.other.imgUrl
                      ? {uri: this.state.other.imgUrl}
                      : hiddenMan
                  }
                />
                <Text
                  style={{
                    textAlign: 'center',
                    fontWeight: 'bold',
                    fontSize: 16,
                    marginLeft: 5,
                    marginTop: 10,
                    color: '#000',
                  }}>
                  {/*{this.state.other.name.length > 6*/}
                  {/*  ? this.state.other.name.substring(0, 6)*/}
                  {/*  : this.state.other.name}*/}
                  {this.state.other.name}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
          <View style={styles.menuIcon}>
            <Menu
              visible={this.state.menu}
              anchor={
                <TouchableOpacity
                  onPress={() => {
                    this.setState({
                      menu: true,
                    });
                  }}>
                  <Text>
                    <Icon name="more-vert" size={30} color="black" />
                  </Text>
                </TouchableOpacity>
              }
              onRequestClose={() => {
                this.setState({
                  menu: false,
                });
              }}>
              {Global.saveData.is_admin === 1 && (
                <>
                  <MenuItem onPress={this.setBlock}>
                    <Image
                      source={ban_black}
                      style={{width: 20, height: 20, marginRight: 30}}
                    />
                    <Text style={{color: '#000'}}>{'   Leave Chat Room'}</Text>
                  </MenuItem>
                  <MenuDivider />
                  <MenuItem onPress={this.setReport}>
                    <Image
                      source={notification_black}
                      style={{width: 20, height: 20, marginRight: 30}}
                    />
                    <Text style={{color: '#000'}}>
                      {'   Report & Leave Chat Room'}
                    </Text>
                  </MenuItem>
                  <MenuDivider />
                  <MenuItem onPress={this.showSendDiamondsModal}>
                    <Image
                      source={yellow_star}
                      style={{width: 20, height: 20, marginRight: 30}}
                    />
                    <Text style={{color: '#000'}}>
                      {this.state.is_fan
                        ? '   Send Diamonds'
                        : '   Become A Fan'}
                    </Text>
                  </MenuItem>
                </>
              )}
              {Global.saveData.u_id == this.state.other.creator_user_id && (
                <>
                  <MenuItem onPress={() => this.editAIuser()}>
                    <Image
                      source={editIcon}
                      style={{width: 20, height: 20, marginRight: 30}}
                    />
                    <Text style={{color: '#000'}}>{'   Edit AI Settings'}</Text>
                  </MenuItem>
                  <MenuItem onPress={() => this.editAIuserProfilePic()}>
                    <Image
                      source={editIcon}
                      style={{width: 20, height: 20, marginRight: 30}}
                    />
                    <Text style={{color: '#000'}}>
                      {'   Edit AI Profile Pictures'}
                    </Text>
                  </MenuItem>
                </>
              )}
              <MenuItem onPress={this.resetError}>
                <Image
                  source={reset}
                  style={{width: 20, height: 20, marginRight: 30}}
                />
                <Text style={{color: '#000'}}>{'   Reset Error'}</Text>
              </MenuItem>
            </Menu>
          </View>
        </ImageBackground>
        {/*{this.state.other.ai_personality != '' &&*/}
        {/*  this.state.other.ai_personality != null && (*/}
        {/*    <View*/}
        {/*      style={{*/}
        {/*        justifyContent: 'center',*/}
        {/*        borderColor: '#d9d9d9',*/}
        {/*        borderWidth: 0.5,*/}
        {/*        padding: 10,*/}
        {/*      }}>*/}
        {/*      <Text style={{color: '#000', fontSize: 8}}>*/}
        {/*        {this.state.tempMessageList[0].content}*/}
        {/*      </Text>*/}
        {/*    </View>*/}
        {/*  )}*/}
        {/*<ScrollView*/}
        {/*  style={{flex: 1, marginHorizontal: 10}}*/}
        {/*  ref={ref => {*/}
        {/*    this.scrollView = ref;*/}
        {/*  }}*/}
        {/*  nestedScrollEnabled={true}*/}
        {/*  onScroll={this.handleScroll}*/}
        {/*  onMomentumScrollBegin={() => {*/}
        {/*    this.onEndReachedCalledDuringMomentum = false;*/}
        {/*  }}*/}
        {/*  onMomentumScrollEnd={() => {*/}
        {/*    this.onEndReachedCalledDuringMomentum = true;*/}
        {/*  }}>*/}
        {/*  {this.state.messageList.length > 0 &&*/}
        {/*    this.state.messageList.map((item, index) => {*/}
        {/*      return <this.renderRow key={index} item={item} index={index} />;*/}
        {/*    })}*/}
        {/*</ScrollView>*/}
        {/*<ScrollView*/}
        {/*  style={{flex: 1, marginHorizontal: 10}}*/}
        {/*  ref={ref => {*/}
        {/*    this.scrollView = ref;*/}
        {/*  }}*/}
        {/*  nestedScrollEnabled={true}*/}
        {/*  onScroll={({nativeEvent}) => {*/}
        {/*    if (nativeEvent.contentOffset.y === 0) {*/}
        {/*      this.handleScroll();*/}
        {/*    }*/}
        {/*  }}>*/}
        {/*  {this.state.messageList.length > 0 &&*/}
        {/*    this.state.messageList.map((item, index) => {*/}
        {/*      return this.renderRow({item, index});*/}
        {/*    })}*/}
        <View style={{flex: 1}}>
          <FlatList
            ref={this.flatListRef}
            style={{padding: 10}}
            data={this.state.other.ai_friend == 0 ? [] : this.state.messageList}
            renderItem={({item, index}) => (
              <this.renderRow key={index} item={item} index={index} />
            )}
            keyExtractor={(item, index) => `${item.time}-${index}`}
            onScroll={this.handleScroll}
            initialNumToRender={10}
            onMomentumScrollBegin={this.handleMomentumScrollBegin}
            ListEmptyComponent={
              <View
                style={{
                  height: Dimensions.get('window').height - 150,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Text>
                  Start a conversation and have fun! Please keep in mind that
                  you are talking to an AI language model
                </Text>
              </View>
            }
            ListHeaderComponent={() =>
              this.state.isLoading && <ActivityIndicator />
            }
            onEndReachedThreshold={0.5}
            onEndReached={() => {}}
          />
        </View>
        {/*</ScrollView>*/}
        <View style={styles.inputBar}>
          <TextInput
            multiline
            style={[styles.textBox, {color: '#000'}]}
            value={this.state.textMessage}
            onChangeText={this.handleChange('textMessage')}
          />
          {this.state.other.ai_friend == 1 && (
            <TouchableHighlight
              style={styles.sendButton}
              onPress={this.sendMessage}>
              <Icon name="send" size={24} color="white" />
            </TouchableHighlight>
          )}
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
    backgroundColor: 'white',
  },
  menuIcon: {
    position: 'absolute',
    right: 15,
    top: 70 * em,
    height: 74 * em,
    width: 75 * em,
    alignItems: 'flex-end',
    justifyContent: 'center',
    zIndex: 1,
  },
  input: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    width: '80%',
    marginBottom: 10,
    borderRadius: 20,
  },
  inputBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 5,
  },
  sendButton: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 25,
    height: 50,
    width: 50,
    backgroundColor: '#B64F54',
    marginLeft: 10,
    zIndex: 10,
  },
  textBox: {
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#8C807F',
    flex: 1,
    fontSize: 15,
    paddingHorizontal: 8,
    paddingRight: 8,
  },
  chatbox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftContainer: {
    flex: 5,
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  rightContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  avatarBtn: {
    position: 'absolute',
    width: 45,
    height: 45,
    borderRadius: 22.5,
    left: -15,
    top: -22.5,
    zIndex: 2,
  },
  avatar: {
    width: 45,
    height: 45,
    borderRadius: 400,
  },
  avatarOtherUser: {
    marginTop: 10,
    marginRight: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    flexWrap: 'wrap-reverse',
  },
  avatarOtherUserBtn: {},
  requiredSent: {
    textAlign: 'center',
    color: 'red',
    fontSize: 12,
    marginBottom: 5,
  },
  ringIcon: {
    width: 36,
    height: 36,
    marginLeft: 10,
    marginTop: 0,
  },
  ringIconTouch: {
    width: 50,
    height: 50,
    marginLeft: 10,
    marginTop: 5,
  },
  screenOverlay: {
    height: Dimensions.get('window').height + 50,
    backgroundColor: 'black',
    opacity: 0.9,
  },
  dialogPrompt: {
    ...Platform.select({
      ios: {
        opacity: 0.9,
        backgroundColor: 'rgb(222,222,222)',
        borderRadius: 15,
      },
      android: {
        borderRadius: 5,
        backgroundColor: 'white',
      },
    }),
    marginHorizontal: 20,
    marginTop: 150,
    padding: 10,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 16,
    color: 'black',
  },
  bodyFont: {
    fontSize: 16,
    color: 'black',
    marginTop: 20,
  },
  textMessageInput: {
    marginTop: 10,
    height: 80,
    width: DEVICE_WIDTH * 0.8,
    paddingHorizontal: 10,
    textAlignVertical: 'top',
    borderWidth: 0.5,
    borderColor: '#000',
    ...Platform.select({
      ios: {
        borderRadius: 15,
        backgroundColor: 'rgba(166, 170, 172, 0.9)',
      },
      android: {
        borderRadius: 10,
        backgroundColor: 'white',
      },
    }),
  },
  textInput: {
    height: 40,
    width: 60,
    paddingHorizontal: 10,
    textAlignVertical: 'bottom',
    ...Platform.select({
      ios: {
        borderRadius: 15,
        backgroundColor: 'rgba(166, 170, 172, 0.9)',
      },
      android: {},
    }),
  },
  buttonsOuterView: {
    flexDirection: 'row',
    ...Platform.select({
      ios: {},
      android: {
        justifyContent: 'flex-end',
      },
    }),
    width: '100%',
  },
  buttonsDivider: {
    ...Platform.select({
      ios: {
        width: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
      },
      android: {
        width: 20,
      },
    }),
  },
  buttonsInnerView: {
    flexDirection: 'row',
    ...Platform.select({
      ios: {
        borderTopWidth: 0.5,
        flex: 1,
      },
      android: {},
    }),
  },
  button: {
    flexDirection: 'column',
    justifyContent: 'center',

    alignItems: 'center',
    ...Platform.select({
      ios: {flex: 1},
      android: {},
    }),
    marginTop: 5,
    padding: 10,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#61bfa9',
  },
  submitButtonText: {
    color: '#61bfa9',
    fontWeight: '600',
    fontSize: 16,
  },
  SectionStyle: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 0.5,
    borderColor: '#000',
    height: 40,
    borderRadius: 5,
    margin: 10,
  },
});

const mapStateToProps = state => {
  const {unreadFlag, senders, userData, fcmID} = state.reducer;
  return {unreadFlag, senders, userData, fcmID};
};

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      changeReadFlag,
      updateQuickBlox,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(ChatScreen);

//
// import React from 'react';
// import {
//   View,
//   TextInput,
//   Text,
//   StyleSheet,
//   TouchableHighlight,
//   Keyboard,
//   FlatList,
//   ScrollView,
//   Image,
//   BackHandler,
//   TouchableOpacity,
//   Alert,
//   Dimensions,
//   Platform,
//   ImageBackground,
//   StatusBar,
//   ActivityIndicator,
//   ToastAndroid,
// } from 'react-native';
// import Icon from 'react-native-vector-icons/MaterialIcons';
// import {Menu, MenuItem, MenuDivider} from 'react-native-material-menu';
// import Dialog, {
//   DialogFooter,
//   DialogButton,
//   DialogContent,
//   SlideAnimation,
// } from 'react-native-popup-dialog';
//
// import {connect} from 'react-redux';
// import {bindActionCreators} from 'redux';
//
// import {changeReadFlag, updateQuickBlox} from '../../../Action';
// import Global from '../Global';
//
// import hiddenMan from '../../assets/images/hidden_man.png';
// import call_ring from '../../assets/images/call_ring_accept.png';
// import call_video from '../../assets/images/call_video.png';
// import diamond from '../../assets/images/red_diamond_trans.png';
// import icClose from '../../assets/images/ic_close.png';
// import shooting_star from '../../assets/images/shooting_star.png';
// import yellow_star from '../../assets/images/yellow_star.png';
// import ban_black from '../../assets/images/ban_black.png';
// import reset from '../../assets/images/reset.png';
// import notification_black from '../../assets/images/notification_black.png';
//
// import {
//   SERVER_URL,
//   FIREBASE_DB,
//   FIREBASE_DB_UNREAD,
// } from '../../config/constants';
// import firebase from '@react-native-firebase/app';
// import database from '@react-native-firebase/database';
// import {colors, em} from '../../commonUI/base';
// import bg from '../../assets/images/bg.jpg';
// import auth from '@react-native-firebase/auth';
// import {replaceEmojis} from '../../util/upload';
// import * as Sentry from '@sentry/react-native';
// import ChatMessage from './ChatScreenRender';
// import messaging from '@react-native-firebase/messaging';
//
// const DEVICE_WIDTH = Dimensions.get('window').width;
//
// class ChatScreen extends React.PureComponent {
//   static navigationOptions = {
//     header: null,
//   };
//
//   replacePlaceholders = (template, replacements) => {
//     return template.replace(/#(\w+)#/g, (match, p1) => {
//       return replacements[p1] || match;
//     });
//   };
//
//   constructor(props) {
//     super(props);
//
//     const template =
//         'My name is #name#, who is #age# year old #gender# living in the #country#. #description#. #name# speaks #language#.';
//     const template1 =
//         ' #name#, who is #age# year old #gender# living in the #country#. #description#. #name# speaks #language#.';
//
//     const {data} = props.route.params;
//     const replacements = {
//       name: Global.saveData.u_name,
//       age: Global.saveData.u_age,
//       gender: Global.saveData.u_gender === 1 ? 'Male' : 'Female',
//       country: Global.saveData.u_country,
//       description: Global.saveData.u_description,
//       language: Global.saveData.u_language,
//     };
//     const result = this.replacePlaceholders(template, replacements);
//     const result1 = this.replacePlaceholders(template1, replacements);
//     this.onEndReachedCalledDuringMomentum = true;
//     this.state = {
//       other: {
//         userId: data.data.other_user_id,
//         name: data.data.name,
//         imgUrl: data.imageUrl,
//         description: data.data.description,
//         coin_count: data.data.coin_count,
//         fan_count: data.data.fan_count,
//         ai_friend: data.data.ai_friend,
//         chat_type: data.data.chat_type,
//         ai_personality: data.data.ai_personality,
//         img_message: data.data.img_message,
//       },
//       opponentData: null,
//       matchId: data.data.match_id,
//       textMessage: '',
//       messageList: [],
//       orgAiPersonality: data.data.ai_personality,
//       orgAiPersonalities: result1,
//       tempMessageList: [
//         {
//           role: 'system',
//           content: data.data.ai_personality
//               ? data.data.ai_personality
//                   .replace('#userdata#', result1)
//                   .trim()
//                   .replace('undefined', '')
//                   .trim()
//               : '',
//         },
//         {role: 'user', content: result.replace('undefined', '')},
//       ],
//       coinCount: Global.saveData.coin_count,
//       visible: false,
//       fanUserVisible: false,
//       noFanUserVisible: false,
//       imagLarge: false,
//       imagLargeUrl: '',
//       errorMsg: false,
//       msgError: '',
//       sendDiamondsCount: 0,
//       fanMessage: '',
//       is_fan: false,
//       dialogStyle: {},
//       statusByMatchId: 0,
//       msgCoinPerMessage: 0,
//       menu: false,
//       isLoading: true,
//       isInitialRender: false,
//       ai_images_data: [],
//       ai_image_id: 0,
//       ai_image_sent: 0,
//       dimensions: {adjustedWidth: 628 / 2.75, adjustedHeight: 1120 / 2.75},
//       limit: 10,
//       lastFetchedIndex: 0,
//       lastKey: null,
//       allMessageList: [],
//       lastMessageId: 0,
//     };
//     this.flatListRef = React.createRef();
//     this.scrollViewRef = React.createRef();
//     this.lastMessageRef = React.createRef();
//   }
//
//   _menu = null;
//
//   // componentWillMount() {
//   //   Global.saveData.nowPage = 'ChatDetail';
//   //   const u_id = Global.saveData.u_id;
//   //   const userId = this.state.other.userId;
//   //
//   //   // database()
//   //   //   .ref()
//   //   //   .child('dz-chat-data')
//   //   //   .child(u_id.toString())
//   //   //   .child(userId.toString())
//   //   //   .on('child_added', value => {
//   //   //     if (this.state.other.ai_friend === 1) {
//   //   //       let conversationHistory = {
//   //   //         role: value.val().from === u_id ? 'user' : 'assistant',
//   //   //         content: value.val().message,
//   //   //       };
//   //   //
//   //   //       this.setState(prevState => {
//   //   //         return {
//   //   //           messageList: [...prevState.messageList, value.val()],
//   //   //         };
//   //   //       });
//   //   //       this.setState(prevState => {
//   //   //         return {
//   //   //           tempMessageList: [
//   //   //             ...prevState.tempMessageList,
//   //   //             conversationHistory,
//   //   //           ],
//   //   //         };
//   //   //       });
//   //   //     }
//   //   //     if (
//   //   //       this.state.other.ai_friend === 0 &&
//   //   //       this.state.other.ai_personality == null
//   //   //     ) {
//   //   //       this.setState(prevState => {
//   //   //         return {
//   //   //           messageList: [...prevState.messageList, value.val()],
//   //   //         };
//   //   //       });
//   //   //     }
//   //   //     // if (this.scrollView) {
//   //   //     //   setTimeout(() => {
//   //   //     //     this.scrollView.scrollToEnd({animated: true});
//   //   //     //   }, 200);
//   //   //     // }
//   //   //   });
//   //   this.keyboardDidShowListener = Keyboard.addListener(
//   //     'keyboardDidShow',
//   //     this.keyboardDidShow.bind(this),
//   //   );
//   //   this.keyboardDidHideListener = Keyboard.addListener(
//   //     'keyboardDidHide',
//   //     this.keyboardDidHide.bind(this),
//   //   );
//   //   this.backHanlder = BackHandler.addEventListener(
//   //     'hardwareBackPress',
//   //     this.backPressed,
//   //   );
//   //   // this.getMessageData();
//   //   this.getStatusByMatchId();
//   // }
//
//   getUserImagesData = () => {
//     const userId = this.state.other.userId;
//     fetch(`${SERVER_URL}/api/chat/getChatAIImageUrl/${userId}`, {
//       method: 'GET',
//       headers: {
//         'Content-Type': 'application/x-www-form-urlencoded',
//         Authorization: Global.saveData.token,
//       },
//     })
//         .then(response => response.json())
//         .then(responseJson => {
//           if (!responseJson.error) {
//             this.setState({
//               ai_images_data: responseJson.data,
//             });
//           }
//         })
//         .catch(error => {
//           Sentry.captureException(new Error(error));
//           return;
//         });
//   };
//
//   getUserImageLastData = () => {
//     const userId = this.state.other.userId;
//     const details = {
//       user_sent: userId,
//       user_received: Global.saveData.u_id,
//     };
//     let formBody = [];
//     for (const property in details) {
//       const encodedKey = encodeURIComponent(property);
//       const encodedValue = encodeURIComponent(details[property]);
//       formBody.push(encodedKey + '=' + encodedValue);
//     }
//     formBody = formBody.join('&');
//     fetch(`${SERVER_URL}/api/chat/getChatAIImageUrlId/${userId}`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/x-www-form-urlencoded',
//         Authorization: Global.saveData.token,
//       },
//       body: formBody,
//     })
//         .then(response => response.json())
//         .then(responseJson => {
//           if (!responseJson.error) {
//             if (responseJson.data === undefined && responseJson.content === '') {
//               this.setState({
//                 ai_image_id: 0,
//               });
//             } else if (responseJson.data) {
//               this.setState({
//                 ai_image_id: responseJson.data[0].image_id,
//               });
//               let tdata = '';
//               if (
//                   this.state.ai_images_data != undefined &&
//                   this.state.ai_images_data.length > 0
//               ) {
//                 tdata = this.state.ai_images_data.find(
//                     item => (item.id = responseJson.data[0].image_id),
//                 );
//               }
//               const temp = this.state.orgAiPersonality
//                   .replace('#userdata#', this.state.orgAiPersonalities)
//                   .replace('#currentaction#', tdata.user_current_action);
//               this.state.tempMessageList[0].content = temp;
//             }
//           }
//         })
//         .catch(error => {
//           Sentry.captureException(new Error(error));
//           return;
//         });
//   };
//
//   getStatusByMatchId = () => {
//     var details = {
//       matchId: this.state.matchId,
//     };
//     var formBody = [];
//     for (var property in details) {
//       var encodedKey = encodeURIComponent(property);
//       var encodedValue = encodeURIComponent(details[property]);
//       formBody.push(encodedKey + '=' + encodedValue);
//     }
//     formBody = formBody.join('&');
//     fetch(`${SERVER_URL}/api/match/getStatusByMatchId`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/x-www-form-urlencoded',
//         Authorization: Global.saveData.token,
//       },
//       body: formBody,
//     })
//         .then(response => response.json())
//         .then(responseJson => {
//           if (!responseJson.error) {
//             this.setState({
//               statusByMatchId: responseJson.data.status,
//               msgCoinPerMessage: responseJson.data.coin_per_message,
//             });
//           }
//         })
//         .catch(error => {
//           Sentry.captureException(new Error(error));
//           return;
//         });
//   };
//
//   async componentDidMount() {
//     this.setState({
//       menu: false,
//     });
//     this._mounted = true;
//     if (!auth().currentUser) {
//       console.log('is not login');
//       await auth().signInWithEmailAndPassword(
//           'admin@dorry.ai',
//           'dorry.ai#&T^%^%#UIUG',
//       );
//     }
//
//     this.getInitialRecords();
//     // this.getMessageData();
//     Global.saveData.nowPage = 'ChatDetail';
//     // const u_id = Global.saveData.u_id;
//     // const userId = this.state.other.userId;
//
//     // auth()
//     //   .signInWithEmailAndPassword('admin@dorry.ai', 'dorry.ai#&T^%^%#UIUG')
//     //   .then(res => {
//     //     this.chatRef = database()
//     //       .ref()
//     //       .child('dz-chat-data')
//     //       .child(u_id.toString())
//     //       .child(userId.toString());
//     //
//     //     this.chatRef
//     //       .once('value', snapshot => {
//     //         let messages = snapshot.val() ? Object.values(snapshot.val()) : [];
//     //         messages.sort((a, b) => a.time - b.time);
//     //         if (this.state.other.ai_friend === 1) {
//     //           this.setState(
//     //             {
//     //               allMessageList: messages,
//     //             },
//     //             () => {
//     //               this.loadInitialMessages();
//     //             },
//     //           );
//     //
//     //           let temp = this.state.tempMessageList.slice();
//     //           messages.forEach(message => {
//     //             if (message?.user_image_url) {
//     //               const tempMessage = this.state.orgAiPersonality
//     //                 .replace('#userdata#', this.state.orgAiPersonalities)
//     //                 .replace('#currentaction#', message?.user_current_action)
//     //                 .replace('undefined', '');
//     //               temp.push({
//     //                 role: 'assistant',
//     //                 content: tempMessage.trim(),
//     //               });
//     //             }
//     //             temp.push({
//     //               role: message.from === u_id ? 'user' : 'assistant',
//     //               content: message.message.trim(),
//     //             });
//     //           });
//     //           // if (messages.length === 0) {
//     //           //   this.setState({isLoading: false});
//     //           // }
//     //           this.setState({tempMessageList: temp});
//     //         }
//     //         if (
//     //           this.state.other.ai_friend === 0 &&
//     //           this.state.other.ai_personality == null
//     //         ) {
//     //           this.setState({messageList: messages, isLoading: false});
//     //         }
//     //         // Register child_added listener after initial load
//     //         const lastMessageTime =
//     //           messages.length > 0 ? messages[messages.length - 1].time : 0;
//     //         this.registerChildAddedListener(lastMessageTime);
//     //       })
//     //       .catch(error => {
//     //         Alert.alert('3', JSON.stringify(error));
//     //         if (error instanceof Error) {
//     //           CrashReporting.reportError(error);
//     //         }
//     //         Instabug.setReproStepsConfig({
//     //           bug: ReproStepsMode.enabled,
//     //           crash: ReproStepsMode.enabled,
//     //         });
//     //         console.error(
//     //           'componentDidMount || Once Value || Error fetching messages: ',
//     //           error,
//     //         );
//     //         // this.setState({isLoading: false});
//     //       });
//     //
//     //     // console.log('Registering child_added listener');
//     //     //
//     //     // this.chatRef.on('child_added', value => {
//     //     //   console.log('New message added', value);
//     //     //   if (!this.state.isLoading) {
//     //     //     const newMessage = value.val();
//     //     //     if (this.state.other.ai_friend === 1) {
//     //     //       let conversationHistory = {
//     //     //         role: newMessage.from === u_id ? 'user' : 'assistant',
//     //     //         content: newMessage.message,
//     //     //       };
//     //     //       this.setState(prevState => ({
//     //     //         allMessageList: [...prevState.allMessageList, newMessage],
//     //     //         messageList: [...prevState.messageList, newMessage],
//     //     //         tempMessageList: [
//     //     //           ...prevState.tempMessageList,
//     //     //           conversationHistory,
//     //     //         ],
//     //     //       }));
//     //     //     }
//     //     //     if (
//     //     //       this.state.other.ai_friend === 0 &&
//     //     //       this.state.other.ai_personality == null
//     //     //     ) {
//     //     //       this.setState(prevState => ({
//     //     //         messageList: [...prevState.messageList, newMessage],
//     //     //       }));
//     //     //     }
//     //     //     if (this.flatListRef.current) {
//     //     //       this.scrollToBottom();
//     //     //     }
//     //     //   }
//     //     // });
//     //   })
//     //   .catch(error => {
//     //     Alert.alert('2', JSON.stringify(error));
//     //     if (error instanceof Error) {
//     //       CrashReporting.reportError(error);
//     //     }
//     //     Instabug.setReproStepsConfig({
//     //       bug: ReproStepsMode.enabled,
//     //       crash: ReproStepsMode.enabled,
//     //     });
//     //     console.error(
//     //       'componentDidMount || signInWithEmailAndPassword => ',
//     //       error,
//     //     );
//     //   });
//     fetch(`${SERVER_URL}/api/transaction/getDiamondCount`, {
//       method: 'POST',
//       headers: {
//         'Content-type': 'application/x-www-form-urlencoded',
//         Authorization: Global.saveData.token,
//       },
//     })
//         .then(response => response.json())
//         .then(responseJson => {
//           if (!responseJson.error) {
//             Global.saveData.coin_count = responseJson.data.coin_count;
//             this.setState({
//               coinCount: Global.saveData.coin_count,
//             });
//           }
//         })
//         .catch(error => {
//           Sentry.captureException(new Error(error));
//           return;
//         });
//
//     this.keyboardDidShowListener = Keyboard.addListener(
//         'keyboardDidShow',
//         this.keyboardDidShow.bind(this),
//     );
//     this.keyboardDidHideListener = Keyboard.addListener(
//         'keyboardDidHide',
//         this.keyboardDidHide.bind(this),
//     );
//     this.backHanlder = BackHandler.addEventListener(
//         'hardwareBackPress',
//         this.backPressed,
//     );
//     // this.getMessageData();
//     this.getStatusByMatchId();
//
//     this.checkUnReadMessage();
//     this.checkFanUser();
//
//     Keyboard.addListener('keyboardDidShow', this._keyboardDidShow);
//     Keyboard.addListener('keyboardDidHide', this._keyboardDidHide);
//
//     if (
//         this.state.other.ai_friend === 1 &&
//         this.state.other.ai_personality !== '' &&
//         this.state.other.ai_personality !== null
//     ) {
//       this.getUserImagesData();
//       this.getUserImageLastData();
//     }
//   }
//
//   getInitialRecords() {
//     const u_id = Global.saveData.u_id;
//     const userId = this.state.other.userId;
//
//     database()
//         .ref()
//         .child(FIREBASE_DB)
//         .child(u_id.toString())
//         .child(userId.toString())
//         .orderByChild('time')
//         .limitToLast(10)
//         .once('value', snapshot => {
//           if (snapshot.exists()) {
//             let messages = snapshot.val() ? Object.values(snapshot.val()) : [];
//
//             messages.sort((a, b) => a.time - b.time);
//             if (this.state.other.ai_friend === 1) {
//               this.setState(
//                   {
//                     messageList: messages,
//                   },
//                   () => {
//                     this.getAllChatData();
//                   },
//               );
//
//               if (messages.length === 0) {
//                 this.setState({isLoading: false});
//               }
//             }
//             if (
//                 this.state.other.ai_friend === 0 &&
//                 this.state.other.ai_personality == null
//             ) {
//               this.setState({messageList: messages, isLoading: false});
//             }
//           } else {
//             this.setState({isLoading: false});
//             this.registerChildAddedListener(0);
//           }
//         })
//         .catch(error => {
//           Sentry.captureException(new Error(error));
//           this.setState({isLoading: false});
//         });
//   }
//
//   getAllChatData() {
//     const u_id = Global.saveData.u_id;
//     const userId = this.state.other.userId;
//
//     database()
//         .ref()
//         .child(FIREBASE_DB)
//         .child(u_id.toString())
//         .child(userId.toString())
//         .once('value', snapshot => {
//           if (snapshot.exists()) {
//             let messages = snapshot.val() ? Object.values(snapshot.val()) : [];
//             messages.sort((a, b) => a.time - b.time);
//             if (this.state.other.ai_friend === 1) {
//               this.setState(
//                   {
//                     allMessageList: messages,
//                   },
//                   () => {
//                     this.loadInitialMessages();
//                   },
//               );
//
//               let temp = this.state.tempMessageList.slice();
//               messages.forEach(message => {
//                 if (message?.user_image_url) {
//                   const tempMessage = this.state.orgAiPersonality
//                       .replace('#userdata#', this.state.orgAiPersonalities)
//                       .replace('#currentaction#', message?.user_current_action)
//                       .trim()
//                       .replace('undefined', '')
//                       .trim();
//                   temp.push({
//                     role: 'assistant',
//                     content: tempMessage.trim(),
//                   });
//                 }
//                 if (message?.resetError) {
//                   temp = [
//                     {
//                       role: 'system',
//                       content: this.state.orgAiPersonality.replace(
//                           '#userdata#',
//                           this.state.orgAiPersonalities,
//                       ),
//                     },
//                   ];
//                 }
//                 temp.push({
//                   role: message.from === u_id ? 'user' : 'assistant',
//                   content: message.message.trim(),
//                 });
//               });
//               this.setState({tempMessageList: temp});
//             }
//             if (
//                 this.state.other.ai_friend === 0 &&
//                 this.state.other.ai_personality == null
//             ) {
//               this.setState({messageList: messages, isLoading: false});
//             }
//             // Register child_added listener after initial load
//             const lastMessageTime =
//                 messages.length > 0 ? messages[messages.length - 1].time : 0;
//             this.registerChildAddedListener(lastMessageTime);
//           } else {
//             this.setState({isLoading: false});
//           }
//         })
//         .catch(error => {
//           Sentry.captureException(new Error(error));
//           // this.setState({isLoading: false});
//         });
//   }
//
//   // Function to register the child_added listener starting from the last fetched message time
//   registerChildAddedListener(lastMessageTime) {
//     const u_id = Global.saveData.u_id;
//     const userId = this.state.other.userId;
//     database()
//         .ref()
//         .child(FIREBASE_DB)
//         .child(u_id.toString())
//         .child(userId.toString())
//         .orderByChild('time')
//         .startAt(lastMessageTime + 1)
//         .on('child_added', value => {
//           if (!this.state.isLoading) {
//             const newMessage = value.val();
//             if (this.state.other.ai_friend === 1) {
//               let conversationHistory = {
//                 role: newMessage.from === u_id ? 'user' : 'assistant',
//                 content: newMessage.message.trim(),
//               };
//               this.setState(prevState => ({
//                 allMessageList: [...prevState.allMessageList, newMessage],
//                 messageList: [...prevState.messageList, newMessage],
//                 tempMessageList: [
//                   ...prevState.tempMessageList,
//                   conversationHistory,
//                 ],
//               }));
//             }
//             if (
//                 this.state.other.ai_friend === 0 &&
//                 this.state.other.ai_personality == null
//             ) {
//               this.setState(prevState => ({
//                 messageList: [...prevState.messageList, newMessage],
//               }));
//             }
//             if (this.flatListRef.current) {
//               this.scrollToBottom();
//             }
//           }
//         });
//   }
//
//   loadInitialMessages = () => {
//     const {limit, allMessageList} = this.state;
//     const lastMessages = allMessageList.slice(-limit);
//     this.setState({
//       // messageList: lastMessages,
//       lastFetchedIndex: allMessageList.length - limit,
//     });
//   };
//
//   loadMoreMessages = () => {
//     const {lastFetchedIndex, limit, allMessageList, messageList} = this.state;
//     if (this.state.isLoading || lastFetchedIndex <= 0) {
//       return;
//     }
//
//     this.setState({isLoading: true}, () => {
//       const newLastFetchedIndex = Math.max(lastFetchedIndex - limit, 0);
//       const moreMessages = allMessageList.slice(
//           newLastFetchedIndex,
//           lastFetchedIndex,
//       );
//       this.setState(prevState => ({
//         messageList: [...moreMessages, ...prevState.messageList],
//         lastFetchedIndex: newLastFetchedIndex,
//         isLoading: false,
//       }));
//     });
//   };
//
//   handleScroll = ({nativeEvent}) => {
//     const {contentOffset, layoutMeasurement, contentSize} = nativeEvent;
//     const threshold = 20;
//     if (contentOffset.y <= threshold) {
//       if (!this.onEndReachedCalledDuringMomentum) {
//         this.loadMoreMessages();
//         this.onEndReachedCalledDuringMomentum = true;
//       }
//     }
//   };
//
//   scrollToBottom = () => {
//     // if (this.scrollView) {
//     // this.scrollView.scrollToEnd({animated: true});
//     // }
//
//     // if (this.flatListRef.current && this.state.messageList.length > 0) {
//     //   setTimeout(() => {
//     //     this.flatListRef.current.scrollToEnd({animated: true});
//     //   }, 75);
//     // }
//     if (this.scrollView.current && this.state.messageList.length > 0) {
//       setTimeout(() => {
//         console.log('called');
//         this.scrollView.scrollToEnd({animated: true});
//         // this.scrollView.current.scrollToEnd({animated: true});
//       }, 75);
//     }
//   };
//
//   onLastMessageLayout = () => {
//     if (this.state.isLoading && this.state.messageList.length > 0) {
//       this.scrollToBottom();
//       this.setState({isLoading: false}); // Stop loading and scroll to bottom
//     }
//     if (this.state.isLoading && this.state.messageList.length == 0) {
//       this.setState({isLoading: false});
//     }
//   };
//
//   _keyboardDidShow = () => {
//     this.setState({
//       dialogStyle: {
//         top: -1 * (DEVICE_WIDTH / 4),
//         borderRadius: 20,
//         padding: 10,
//         overflow: 'hidden',
//       },
//     });
//   };
//
//   _keyboardDidHide = () => {
//     this.setState({
//       dialogStyle: {
//         borderRadius: 20,
//         padding: 10,
//         overflow: 'hidden',
//       },
//     });
//   };
//
//   checkUnReadMessage = () => {
//     const u_id = Global.saveData.u_id;
//     const userId = this.state.other.userId;
//
//     database()
//         .ref()
//         .child(FIREBASE_DB_UNREAD)
//         .child(u_id.toString() + '/')
//         .once('value', value => {
//           let senderIdArr = value.toJSON();
//           let newPayload = {};
//           let updates = {};
//           if (senderIdArr) {
//             senderIdArr = senderIdArr.split(',');
//             let index = senderIdArr.indexOf(this.state.other.userId.toString());
//             if (index !== -1) {
//               senderIdArr.splice(index, 1);
//             }
//             newPayload = {
//               unreadFlag: true,
//               senders: senderIdArr,
//             };
//             if (senderIdArr.length) {
//               newPayload.unreadFlag = true;
//               updates[Global.saveData.u_id] = senderIdArr.toString();
//               database().ref().child(FIREBASE_DB_UNREAD).update(updates);
//             } else {
//               newPayload.unreadFlag = false;
//               database()
//                   .ref()
//                   .child(FIREBASE_DB_UNREAD)
//                   .child(u_id.toString() + '/')
//                   .remove();
//             }
//
//             this.props.changeReadFlag(newPayload);
//           }
//         });
//   };
//
//   componentWillUnmount() {
//     this.setState({
//       menu: false,
//     });
//     this._mounted = false;
//     const u_id = Global.saveData.u_id;
//     const userId = this.state.other.userId;
//     database()
//         .ref()
//         .child(FIREBASE_DB)
//         .child(u_id.toString())
//         .child(userId.toString())
//         .off('child_added');
//     //auth().signOut();
//     // firebase.database().ref().child(Global.saveData.u_id).child(this.state.other.userId).remove();
//     // firebase.database().ref().child(this.state.other.userId).child(Global.saveData.u_id).remove();
//     this.keyboardDidShowListener.remove();
//     this.keyboardDidHideListener.remove();
//     this.backHanlder.remove();
//   }
//
//   backPressed = () => {
//     this.setState({
//       menu: false,
//       messageList: [],
//       lastKey: null,
//     });
//
//     if (
//         Global.saveData.prevpage == 'Chat' ||
//         Global.saveData.prevpage == 'ChatDetail' ||
//         Global.saveData.prevpage == 'IncomeDetail'
//     ) {
//       this.props.navigation.replace('Chat');
//     } else if (Global.saveData.prevpage == 'BrowseList') {
//       this.props.navigation.replace('BrowseList');
//     } else if (Global.saveData.prevpage == 'Browse') {
//       this.props.navigation.replace('BrowseList');
//     } else {
//       this.props.navigation.pop();
//     }
//     return true;
//   };
//
//   keyboardDidShow(e) {
//     // if (this._mounted && this.scrollView) {
//     //   this.scrollView.scrollToEnd({animated: true});
//     // }
//     if (this._mounted && this.flatListRef.current) {
//       // setTimeout(() => {
//       //   this.flatListRef.current.scrollToEnd({animated: true});
//       // }, 10);
//       this.scrollToBottom();
//     }
//   }
//
//   keyboardDidHide(e) {
//     if (this._mounted && this.flatListRef.current) {
//       // setTimeout(() => {
//       //   this.flatListRef.current.scrollToEnd({animated: true});
//       // }, 10);
//       this.scrollToBottom();
//     }
//     // if (this._mounted && this.scrollView) {
//     //   this.scrollView.scrollToEnd({animated: true});
//     // }
//   }
//
//   setMenuRef = ref => {
//     this._menu = ref;
//   };
//
//   hideMenu = () => {
//     if (this._menu != null) {
//       this._menu.hide();
//     }
//     // this.setState({
//     //   menu: false,
//     // });
//   };
//
//   showMenu = () => {
//     this.checkFanUser();
//     this._menu.show();
//     // this.setState({
//     //   menu: true,
//     // });
//   };
//
//   handleChange = key => val => {
//     this.setState({
//       [key]: val,
//     });
//   };
//
//   setBlock = () => {
//     this.hideMenu();
//     Alert.alert(
//         'Are you sure you want to block this user?',
//         'Your chat history with this user will disappear from your chat list.',
//         [
//           {
//             text: 'Cancel',
//             onPress: () => console.log('Cancel Pressed'),
//             style: 'cancel',
//           },
//           {text: 'Confirm', onPress: () => this.requestBlock()},
//         ],
//         {cancelable: false},
//     );
//   };
//
//   requestBlock = () => {
//     var details = {
//       otherId: this.state.other.userId,
//     };
//     var formBody = [];
//     for (var property in details) {
//       var encodedKey = encodeURIComponent(property);
//       var encodedValue = encodeURIComponent(details[property]);
//       formBody.push(encodedKey + '=' + encodedValue);
//     }
//     formBody = formBody.join('&');
//
//     fetch(`${SERVER_URL}/api/match/block`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/x-www-form-urlencoded',
//         Authorization: Global.saveData.token,
//       },
//       body: formBody,
//     })
//         .then(response => response.json())
//         .then(responseJson => {
//           if (responseJson.error === false) {
//             const u_id = Global.saveData.u_id;
//             const userId = this.state.other.userId;
//             database()
//                 .ref()
//                 .child(FIREBASE_DB)
//                 .child(u_id.toString())
//                 .child(userId.toString())
//                 .remove();
//             database()
//                 .ref()
//                 .child(FIREBASE_DB)
//                 .child(userId.toString())
//                 .child(u_id.toString())
//                 .remove();
//             this.props.navigation.replace('Chat');
//           }
//         })
//         .catch(error => {
//           Sentry.captureException(new Error(error));
//           return;
//         });
//   };
//
//   setReport = () => {
//     this.hideMenu();
//     this.props.navigation.navigate('Report', {
//       otherId: this.state.other.userId,
//     });
//   };
//
//   getMessageData = async () => {
//     const {matchId} = this.state;
//     await fetch(`${SERVER_URL}/api/chat/getChatWithMatchId/${matchId}`, {
//       method: 'GET',
//       headers: {
//         'Content-Type': 'application/json',
//         Authorization: Global.saveData.token,
//       },
//     })
//         .then(response => response.json())
//         .then(responseJson => {
//           if (!responseJson.error) {
//             const msgData = responseJson.data.content;
//             console.log(msgData);
//             var convertedList = [];
//             if (msgData.length) {
//               msgData.map(item => {
//                 var convertedData = {
//                   from:
//                       Global.saveData.u_id !== parseInt(item.user_sent)
//                           ? this.state.other.userId
//                           : Global.saveData.u_id,
//                   message: item.message_text,
//                   time: item.created_date,
//                 };
//                 convertedList.push(convertedData);
//               });
//               this.setState({
//                 messageList: convertedList,
//               });
//             }
//           }
//         })
//         .catch(error => {
//           Sentry.captureException(new Error(error));
//           return;
//         });
//   };
//
//   formatAMPM(time) {
//     var date = new Date(time);
//     var hours = date.getHours();
//     var minutes = date.getMinutes();
//     var ampm = hours >= 12 ? 'PM' : 'AM';
//     hours = hours % 12;
//     hours = hours ? hours : 12; // the hour '0' should be '12'
//     minutes = minutes < 10 ? '0' + minutes : minutes;
//     var strTime = hours + ':' + minutes + ' ' + ampm;
//     return strTime;
//   }
//
//   setChatDate(item) {
//     var date = new Date(item.time);
//     var now = new Date();
//     var nowYear = now.getFullYear();
//     var nowMonth = now.getMonth() + 1;
//     var nowDate = now.getDate();
//     var dateYear = date.getFullYear();
//     var dateMonth = date.getMonth() + 1;
//     var dateDate = date.getDate();
//     if (nowYear === dateYear && nowMonth === dateMonth) {
//       if (nowDate === dateDate) {
//         return 'Today';
//       } else if (nowDate === dateDate + 1) {
//         return 'Yesterday';
//       }
//     }
//     return date.toDateString();
//   }
//
//   sendMessage = async () => {
//     if (this.state.textMessage.length > 0) {
//       this.createNewMessage();
//     }
//   };
//
//   updateChatImageHistory = (chat_id, id, tempcontent) => {
//     const details = {
//       ai_user_id: this.state.other.userId,
//       ai_user_name: this.state.other.name,
//       real_user_id: Global.saveData.u_id,
//       real_user_name: Global.saveData.u_name,
//       chat_id: chat_id,
//       image_id: id,
//       user_current_action: tempcontent,
//     };
//
//     let formBody = [];
//     for (const property in details) {
//       const encodedKey = encodeURIComponent(property);
//       const encodedValue = encodeURIComponent(details[property]);
//       formBody.push(encodedKey + '=' + encodedValue);
//     }
//     formBody = formBody.join('&');
//     fetch(`${SERVER_URL}/api/chat/chatHistoryUpdate`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/x-www-form-urlencoded',
//         Authorization: Global.saveData.token,
//       },
//       body: formBody,
//     })
//         .then(response => response.json())
//         .then(responseJson => {
//           if (!responseJson.error) {
//             this.setState(prevState => {
//               return {
//                 ai_image_id: id,
//               };
//             });
//           }
//         })
//         .catch(error => {
//           Sentry.captureException(new Error(error));
//           // alert(JSON.stringify(error))
//           return;
//         });
//   };
//
//   callbackChat = textMessage => {
//     const {matchId} = this.state;
//     let img = '';
//     let tempcontent = '';
//     let imgid = 0;
//
//     if (
//         this.state.ai_image_sent == this.state.other.img_message &&
//         this.state.ai_images_data != undefined &&
//         this.state.ai_images_data.length > 0
//     ) {
//       const filteredArray =
//           this.state.ai_image_id === 0
//               ? this.state.ai_images_data[0]
//               : this.state.ai_images_data.find(
//                   item => item.id > this.state.ai_image_id,
//               );
//
//       img = filteredArray.user_image_url;
//       tempcontent = filteredArray.user_current_action;
//       imgid = filteredArray.id;
//
//       const temp = this.state.orgAiPersonality
//           .replace('#userdata#', this.state.orgAiPersonalities)
//           .replace('#currentaction#', tempcontent);
//       this.state.tempMessageList[0].content = temp;
//       // this.state.tempMessageList.push({
//       //   role: 'assistant',
//       //   content: temp,
//       // });
//     }
//     this.state.tempMessageList.push({
//       role: 'user',
//       content: textMessage,
//     });
//
//     fetch('https://api.openai.com/v1/chat/completions', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         Authorization:
//             'Bearer sk-my-service-account-OcVwpHabIqoDlDYTtTLuT3BlbkFJOsnTUJjvEiuTd2sUQyDK',
//       },
//       body: JSON.stringify({
//         model: 'gpt-3.5-turbo',
//         messages: this.state.tempMessageList,
//         max_tokens: 512,
//         temperature: 0.7,
//         top_p: 0.9,
//         frequency_penalty: 0.5,
//         presence_penalty: 0.6,
//         n: 1,
//         stop: ['\n'],
//       }),
//     })
//         .then(response => response.json())
//         .then(responseJson => {
//           //Alert.alert('Output', JSON.stringify(responseJson));
//           const messageOfChat = responseJson.choices[0].message.content.trim();
//           const details = {
//             matchId: matchId,
//             messageText: responseJson.choices[0].message.content.trim(),
//             user_image_url:
//                 this.state.ai_image_sent == this.state.other.img_message ? img : '',
//             user_current_action:
//                 this.state.ai_image_sent == this.state.other.img_message
//                     ? tempcontent
//                     : '',
//             is_auto_chat: true,
//           };
//           let formBody = [];
//           for (const property in details) {
//             const encodedKey = encodeURIComponent(property);
//             const encodedValue = encodeURIComponent(details[property]);
//             formBody.push(encodedKey + '=' + encodedValue);
//           }
//           formBody = formBody.join('&');
//           fetch(`${SERVER_URL}/api/chat/create`, {
//             method: 'POST',
//             headers: {
//               'Content-Type': 'application/x-www-form-urlencoded',
//               Authorization: Global.saveData.token,
//             },
//             body: formBody,
//           })
//               .then(response => response.json())
//               .then(responseJson => {
//                 if (responseJson.data.account_status == 1) {
//                   if (this.state.ai_image_sent == this.state.other.img_message) {
//                     this.updateChatImageHistory(
//                         responseJson.data.sendResult.insertId,
//                         imgid,
//                         tempcontent,
//                     );
//                   }
//                   const u_id = this.state.other.userId;
//                   const userId = Global.saveData.u_id;
//                   const imgid1 = imgid;
//                   const img1 = img;
//                   const tempcontent1 = tempcontent;
//
//                   let msgId = database()
//                       .ref()
//                       .child(FIREBASE_DB)
//                       .child(u_id.toString())
//                       .child(userId.toString())
//                       .push().key;
//                   let updates = {};
//                   let senderMessage = {
//                     message: messageOfChat,
//                     time: firebase.database.ServerValue.TIMESTAMP,
//                     from: u_id,
//                     user_image_id:
//                         this.state.ai_image_sent == this.state.other.img_message
//                             ? imgid1
//                             : null,
//                     user_image_url:
//                         this.state.ai_image_sent == this.state.other.img_message
//                             ? img1
//                             : null,
//                     user_current_action:
//                         this.state.ai_image_sent == this.state.other.img_message
//                             ? tempcontent1
//                             : null,
//                     read: true,
//                   };
//                   updates[
//                   this.state.other.userId +
//                   '/' +
//                   Global.saveData.u_id +
//                   '/' +
//                   msgId
//                       ] = senderMessage;
//                   let receiverMessage = {
//                     message: messageOfChat,
//                     time: firebase.database.ServerValue.TIMESTAMP,
//                     from: u_id,
//                     user_image_id:
//                         this.state.ai_image_sent == this.state.other.img_message
//                             ? imgid
//                             : null,
//                     user_image_url:
//                         this.state.ai_image_sent == this.state.other.img_message
//                             ? img
//                             : null,
//                     user_current_action:
//                         this.state.ai_image_sent == this.state.other.img_message
//                             ? tempcontent
//                             : null,
//                     read: false,
//                   };
//                   updates[
//                   Global.saveData.u_id +
//                   '/' +
//                   this.state.other.userId +
//                   '/' +
//                   msgId
//                       ] = receiverMessage;
//                   database()
//                       .ref()
//                       .child(FIREBASE_DB)
//                       .update(updates)
//                       .then(() => {
//                         if (
//                             this.state.ai_image_sent == this.state.other.img_message
//                         ) {
//                           this.setState(prevState => {
//                             return {
//                               ai_image_sent: 0,
//                             };
//                           });
//                         }
//                       });
//                   if (this.flatListRef.current) {
//                     this.scrollToBottom();
//                   }
//                 } else {
//                   Alert.alert('', responseJson.message, [], {cancelable: false});
//                 }
//               })
//               .catch(error => {
//                 Sentry.captureException(new Error(error));
//                 return;
//               });
//         })
//         .catch(error => {
//           Sentry.captureException(new Error(error));
//           console.log(error);
//           return;
//         });
//   };
//
//   callBackDeepInfraChat = textMessage => {
//     const {matchId} = this.state;
//     let img = '';
//     let tempcontent = '';
//     let imgid = 0;
//
//     if (
//         this.state.ai_image_sent == this.state.other.img_message &&
//         this.state.ai_images_data != undefined &&
//         this.state.ai_images_data.length > 0
//     ) {
//       const filteredArray =
//           this.state.ai_image_id === 0
//               ? this.state.ai_images_data[0]
//               : this.state.ai_images_data.find(
//                   item => item.id > this.state.ai_image_id,
//               );
//
//       img = filteredArray.user_image_url;
//       tempcontent = filteredArray.user_current_action;
//       imgid = filteredArray.id;
//       const temp = this.state.orgAiPersonality
//           .replace('#userdata#', this.state.orgAiPersonalities)
//           .replace('#currentaction#', tempcontent);
//       this.state.tempMessageList[0].content = temp;
//       // this.state.tempMessageList.push({
//       //   role: 'assistant',
//       //   content: temp,
//       // });
//     }
//
//     this.state.tempMessageList.push({
//       role: 'user',
//       content: textMessage,
//     });
//     console.log(this.state.tempMessageList.length);
//
//     this.state.tempMessageList[0].content.replace('ChatGPT', '');
//
//     // Authorization: 'Bearer Ixg4lU3AELIubf2UutGa5ApFkf6WhrH8',
//     // Bearer 6oBs98aRVw7IgL3NBNpQgm1twv7xvFPL
//     fetch('https://api.deepinfra.com/v1/openai/chat/completions', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         Authorization: 'Bearer Ixg4lU3AELIubf2UutGa5ApFkf6WhrH8',
//       },
//       body: JSON.stringify({
//         model: 'meta-llama/Meta-Llama-3-8B-Instruct',
//         messages: this.state.tempMessageList,
//         max_tokens: 512,
//         temperature: 0.7,
//         top_p: 0.9,
//         top_k: 0,
//         frequency_penalty: 0,
//         presence_penalty: 0,
//         n: 1,
//         stop: ['\n'],
//         response_format: {type: 'json_object'},
//         tool_choice: 'auto',
//       }),
//     })
//         .then(response => response.json())
//         .then(responseJson => {
//           console.log(JSON.stringify(responseJson));
//           const messageOfChat = replaceEmojis(
//               responseJson.choices[0].message.content.trim(),
//           );
//           const details = {
//             matchId: matchId,
//             messageText: responseJson.choices[0].message.content.trim(),
//             user_image_url:
//                 this.state.ai_image_sent == this.state.other.img_message ? img : '',
//             user_current_action:
//                 this.state.ai_image_sent == this.state.other.img_message
//                     ? tempcontent
//                     : '',
//             is_auto_chat: true,
//           };
//           let formBody = [];
//           for (const property in details) {
//             const encodedKey = encodeURIComponent(property);
//             const encodedValue = encodeURIComponent(details[property]);
//             formBody.push(encodedKey + '=' + encodedValue);
//           }
//           formBody = formBody.join('&');
//           fetch(`${SERVER_URL}/api/chat/create`, {
//             method: 'POST',
//             headers: {
//               'Content-Type': 'application/x-www-form-urlencoded',
//               Authorization: Global.saveData.token,
//             },
//             body: formBody,
//           })
//               .then(response => response.json())
//               .then(responseJson => {
//                 if (responseJson.data.account_status == 1) {
//                   if (this.state.ai_image_sent == this.state.other.img_message) {
//                     this.updateChatImageHistory(
//                         responseJson.data.sendResult.insertId,
//                         imgid,
//                         tempcontent,
//                     );
//                   }
//                   const u_id = this.state.other.userId;
//                   const userId = Global.saveData.u_id;
//                   const imgid1 = imgid;
//                   const img1 = img;
//                   const tempcontent1 = tempcontent;
//                   let msgId = database()
//                       .ref()
//                       .child(FIREBASE_DB)
//                       .child(u_id.toString())
//                       .child(userId.toString())
//                       .push().key;
//                   let updates = {};
//                   let senderMessage = {
//                     message: messageOfChat,
//                     time: firebase.database.ServerValue.TIMESTAMP,
//                     from: u_id,
//                     user_image_id:
//                         this.state.ai_image_sent == this.state.other.img_message
//                             ? imgid1
//                             : null,
//                     user_image_url:
//                         this.state.ai_image_sent == this.state.other.img_message
//                             ? img1
//                             : null,
//                     user_current_action:
//                         this.state.ai_image_sent == this.state.other.img_message
//                             ? tempcontent1
//                             : null,
//                     read: true,
//                   };
//                   updates[
//                   this.state.other.userId +
//                   '/' +
//                   Global.saveData.u_id +
//                   '/' +
//                   msgId
//                       ] = senderMessage;
//                   let receiverMessage = {
//                     message: messageOfChat,
//                     time: firebase.database.ServerValue.TIMESTAMP,
//                     from: u_id,
//                     user_image_id:
//                         this.state.ai_image_sent == this.state.other.img_message
//                             ? imgid
//                             : null,
//                     user_image_url:
//                         this.state.ai_image_sent == this.state.other.img_message
//                             ? img
//                             : null,
//                     user_current_action:
//                         this.state.ai_image_sent == this.state.other.img_message
//                             ? tempcontent
//                             : null,
//                     read: false,
//                   };
//                   updates[
//                   Global.saveData.u_id +
//                   '/' +
//                   this.state.other.userId +
//                   '/' +
//                   msgId
//                       ] = receiverMessage;
//                   database()
//                       .ref()
//                       .child(FIREBASE_DB)
//                       .update(updates)
//                       .then(() => {
//                         if (
//                             this.state.ai_image_sent == this.state.other.img_message
//                         ) {
//                           this.setState(prevState => {
//                             return {
//                               ai_image_sent: 0,
//                             };
//                           });
//                         }
//                       });
//                   if (this.flatListRef.current) {
//                     this.scrollToBottom();
//                   }
//                 } else {
//                   Alert.alert('', responseJson.message, [], {cancelable: false});
//                 }
//               })
//               .catch(error => {
//                 Sentry.captureException(new Error(error));
//                 return;
//               });
//         })
//         .catch(error => {
//           Sentry.captureException(new Error(error));
//           console.log(error);
//           return;
//         });
//   };
//
//   createNewMessage = () => {
//     const {textMessage, matchId} = this.state;
//
//     this.setState({textMessage: ''});
//     if (
//         this.state.other.ai_friend === 1 &&
//         this.state.other.ai_personality !== '' &&
//         this.state.other.ai_personality !== null
//     ) {
//       this.setState(prevState => {
//         return {
//           ai_image_sent:
//               prevState.ai_image_sent >= this.state.ai_image_sent
//                   ? prevState.ai_image_sent + 1
//                   : 0,
//         };
//       });
//     }
//
//     var details = {
//       matchId: matchId,
//       messageText: textMessage,
//       is_auto_chat: false,
//     };
//     var formBody = [];
//     for (var property in details) {
//       var encodedKey = encodeURIComponent(property);
//       var encodedValue = encodeURIComponent(details[property]);
//       formBody.push(encodedKey + '=' + encodedValue);
//     }
//     formBody = formBody.join('&');
//     fetch(`${SERVER_URL}/api/chat/create`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/x-www-form-urlencoded',
//         Authorization: Global.saveData.token,
//       },
//       body: formBody,
//     })
//         .then(response => response.json())
//         .then(responseJson => {
//           if (responseJson.data.account_status == 1) {
//             if (responseJson.data.sending_available) {
//               const u_id = Global.saveData.u_id;
//               const userId = this.state.other.userId;
//               let msgId = database()
//                   .ref()
//                   .child(FIREBASE_DB)
//                   .child(u_id.toString())
//                   .child(userId.toString())
//                   .push().key;
//               let updates = {};
//               let senderMessage = {
//                 message: textMessage,
//                 time: firebase.database.ServerValue.TIMESTAMP,
//                 from: Global.saveData.u_id,
//                 read: true,
//               };
//               updates[
//               Global.saveData.u_id + '/' + this.state.other.userId + '/' + msgId
//                   ] = senderMessage;
//               let receiverMessage = {
//                 message: textMessage,
//                 time: firebase.database.ServerValue.TIMESTAMP,
//                 from: Global.saveData.u_id,
//                 read: false,
//               };
//               updates[
//               this.state.other.userId + '/' + Global.saveData.u_id + '/' + msgId
//                   ] = receiverMessage;
//               database().ref().child(FIREBASE_DB).update(updates);
//
//               if (this.flatListRef.current) {
//                 this.scrollToBottom();
//               }
//               if (
//                   this.state.other.ai_friend === 1 &&
//                   this.state.other.ai_personality != null &&
//                   this.state.other.ai_personality !== ''
//               ) {
//                 if (this.state.other.chat_type == 1) {
//                   this.callbackChat(textMessage);
//                 } else if (this.state.other.chat_type == 2) {
//                   this.callBackDeepInfraChat(textMessage);
//                 }
//               }
//               // if (
//               //   this.state.other.ai_friend === 1 &&
//               //   this.state.other.ai_personality != null &&
//               //   this.state.other.ai_personality !== ''
//               // ) {
//               //   setTimeout(() => {
//               //     if (this.state.other.chat_type == 1) {
//               //       this.callbackChat();
//               //     } else if (this.state.other.chat_type == 2) {
//               //       this.callBackDeepInfraChat();
//               //     }
//               //   }, 70);
//               // }
//             } else {
//               if (!responseJson.data.diamonds_enough) {
//                 Alert.alert(
//                     '',
//                     responseJson.message,
//                     [
//                       {
//                         text: 'Cancel',
//                         onPress: () => console.log('Cancel Pressed'),
//                       },
//                       {text: 'Buy Diamonds', onPress: () => this.gotoShop()},
//                     ],
//                     {cancelable: false},
//                 );
//               } else {
//                 Alert.alert(
//                     '',
//                     'You cannot send a message to this uer.',
//                     [
//                       {
//                         text: 'OK',
//                         onPress: () => this.props.navigation.replace('Chat'),
//                       },
//                     ],
//                     {cancelable: false},
//                 );
//               }
//             }
//           } else {
//             Alert.alert('', responseJson.message, [], {cancelable: false});
//           }
//         })
//         .catch(error => {
//           Sentry.captureException(new Error(error));
//           return;
//         });
//   };
//
//   resetError = () => {
//     const serverTime = firebase.database.ServerValue.TIMESTAMP;
//     const u_id = Global.saveData.u_id;
//     const userId = this.state.other.userId;
//
//     database()
//         .ref(FIREBASE_DB)
//         .child(u_id.toString())
//         .child(userId.toString())
//         .orderByChild('time')
//         .limitToLast(1)
//         .once('value')
//         .then(snapshot => {
//           const lastMessageData = snapshot.val();
//           const lastMessageKey = Object.keys(lastMessageData)[0];
//           const lastMessage = lastMessageData[lastMessageKey];
//
//           database()
//               .ref(FIREBASE_DB)
//               .child(u_id.toString())
//               .child(userId.toString())
//               .child(lastMessageKey)
//               .update({
//                 resetError: serverTime,
//               })
//               .then(() => {
//                 this.setState({
//                   lastMessageId: serverTime,
//                 });
//                 const temp = this.state.orgAiPersonality.replace(
//                     '#userdata#',
//                     this.state.orgAiPersonalities,
//                 );
//                 this.state.tempMessageList = [
//                   {
//                     role: 'system',
//                     content: temp,
//                   },
//                 ];
//                 ToastAndroid.showWithGravity(
//                     'Error reset. Please start again',
//                     ToastAndroid.LONG,
//                     ToastAndroid.CENTER,
//                 );
//                 console.log('Last message updated successfully');
//               })
//               .catch(error => {
//                 Sentry.captureException(new Error(error));
//                 console.error('Error updating last message: ', error);
//               });
//         })
//         .catch(error => {
//           Sentry.captureException(new Error(error));
//           console.error('Error fetching last message: ', error);
//         });
//   };
//
//   gotoProfilePage = () => {
//     Global.saveData.prevpage = 'ChatDetail';
//
//     fetch(
//         `${SERVER_URL}/api/match/getOtherUserData/${this.state.other.userId}`,
//         {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/x-www-form-urlencoded',
//             Authorization: Global.saveData.token,
//           },
//         },
//     )
//         .then(response => response.json())
//         .then(responseJson => {
//           if (!responseJson.error) {
//             let newData = responseJson.data;
//
//             this.props.navigation.navigate('Profile', {
//               data: {
//                 id: newData.id,
//                 name: newData.name,
//                 description: newData.description,
//                 age: newData.age,
//                 gender: newData.gender,
//                 distance: newData.distance,
//                 country_name: newData.country_name,
//                 ethnicity_name: newData.ethnicity_name,
//                 language_name: newData.language_name,
//                 last_loggedin_date: newData.last_loggedin_date,
//                 matchId: this.state.matchId,
//                 imageUrl: this.state.other.imgUrl,
//                 coin_count: newData.coin_count,
//                 fan_count: newData.fan_count,
//                 coin_per_message: newData.coin_per_message,
//                 ai_friend: this.state.other.ai_friend,
//                 chat_type: this.state.other.chat_type,
//                 ai_personality: this.state.other.ai_personality,
//               },
//             });
//           }
//         })
//         .catch(error => {
//           Sentry.captureException(new Error(error));
//           return;
//         });
//   };
//
//   gotoShop = () => {
//     this.setState({
//       visible: false,
//     });
//     this.props.navigation.navigate('ScreenGpay01');
//   };
//
//   checkFanUser = () => {
//     var details = {
//       otherId: this.state.other.userId,
//     };
//     var formBody = [];
//     for (var property in details) {
//       var encodedKey = encodeURIComponent(property);
//       var encodedValue = encodeURIComponent(details[property]);
//       formBody.push(encodedKey + '=' + encodedValue);
//     }
//     formBody = formBody.join('&');
//     fetch(`${SERVER_URL}/api/fan/checkFanOtherUser`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/x-www-form-urlencoded',
//         Authorization: Global.saveData.token,
//       },
//       body: formBody,
//     })
//         .then(response => response.json())
//         .then(responseJson => {
//           if (!responseJson.error) {
//             if (responseJson.is_fan) {
//               this.setState({
//                 is_fan: true,
//               });
//             }
//           }
//         })
//         .catch(error => {
//           Sentry.captureException(new Error(error));
//           return;
//         });
//   };
//
//   showSendDiamondsModal = () => {
//     this.setState({
//       menu: false,
//     });
//     var details = {
//       otherId: this.state.other.userId,
//     };
//     var formBody = [];
//     for (var property in details) {
//       var encodedKey = encodeURIComponent(property);
//       var encodedValue = encodeURIComponent(details[property]);
//       formBody.push(encodedKey + '=' + encodedValue);
//     }
//     formBody = formBody.join('&');
//     fetch(`${SERVER_URL}/api/fan/checkFanOtherUser`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/x-www-form-urlencoded',
//         Authorization: Global.saveData.token,
//       },
//       body: formBody,
//     })
//         .then(response => response.json())
//         .then(responseJson => {
//           if (!responseJson.error) {
//             if (responseJson.is_fan) {
//               this.setState({
//                 fanUserVisible: true,
//                 noFanUserVisible: false,
//               });
//             } else {
//               this.setState({
//                 fanUserVisible: false,
//                 noFanUserVisible: true,
//               });
//             }
//           }
//         })
//         .catch(error => {
//           Sentry.captureException(new Error(error));
//           return;
//         });
//   };
//
//   sendDiamonds = () => {
//     let {sendDiamondsCount, fanMessage} = this.state;
//     if (isNaN(sendDiamondsCount)) {
//       Alert.alert(
//           'Invalid input',
//           'You must input a valid number of diamonds to send.',
//           [
//             {
//               text: 'Ok',
//               onPress: () => console.log('Ok Pressed'),
//               style: 'cancel',
//             },
//           ],
//           {cancelable: false},
//       );
//     } else {
//       if (sendDiamondsCount > Global.saveData.coin_count) {
//         Alert.alert(
//             'Insufficient diamonds',
//             'You only have ' +
//             Global.saveData.coin_count +
//             ' diamonds available. More diamonds are needed.',
//             [
//               {
//                 text: 'Cancel',
//                 onPress: () => console.log('Cancel Pressed'),
//                 style: 'cancel',
//               },
//               {
//                 text: 'Buy Diamonds',
//                 onPress: () => this.gotoShop(),
//                 style: 'cancel',
//               },
//             ],
//             {cancelable: false},
//         );
//       } else if (sendDiamondsCount == 0 || sendDiamondsCount == '') {
//         Alert.alert(
//             'Invalid count',
//             'You must send 1 or more diamonds.',
//             [
//               {
//                 text: 'Ok',
//                 onPress: () => console.log('Ok Pressed'),
//                 style: 'cancel',
//               },
//             ],
//             {cancelable: false},
//         );
//       } else {
//         var details = {
//           userName: Global.saveData.u_name,
//           otherId: this.state.other.userId,
//           otherUserName: this.state.other.name,
//           amount: sendDiamondsCount,
//           fanMessage: fanMessage,
//         };
//         var formBody = [];
//         for (var property in details) {
//           var encodedKey = encodeURIComponent(property);
//           var encodedValue = encodeURIComponent(details[property]);
//           formBody.push(encodedKey + '=' + encodedValue);
//         }
//         formBody = formBody.join('&');
//         fetch(`${SERVER_URL}/api/fan/sendDiamonds`, {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/x-www-form-urlencoded',
//             Authorization: Global.saveData.token,
//           },
//           body: formBody,
//         })
//             .then(response => response.json())
//             .then(responseJson => {
//               if (!responseJson.error) {
//                 if (responseJson.data.account_status == 1) {
//                   if (responseJson.data.sending_available) {
//                     Global.saveData.coin_count = responseJson.data.coin_count;
//                     this.setState({
//                       other: {
//                         userId: this.state.other.userId,
//                         name: this.state.other.name,
//                         imgUrl: this.state.other.imgUrl,
//                         description: this.state.other.description,
//                         coin_count:
//                             parseInt(this.state.other.coin_count) +
//                             parseInt(sendDiamondsCount),
//                         fan_count: responseJson.data.other_fan_count,
//                       },
//                     });
//                   } else {
//                     Alert.alert(
//                         '',
//                         'You cannot send diamonds.',
//                         [
//                           {
//                             text: 'OK',
//                             onPress: () =>
//                                 this.props.navigation.replace('BrowseList'),
//                           },
//                         ],
//                         {cancelable: false},
//                     );
//                   }
//                 } else {
//                   Alert.alert('', responseJson.message, [], {cancelable: false});
//                 }
//               }
//             })
//             .catch(error => {
//               Sentry.captureException(new Error(error));
//               this.setState({
//                 isLoading: false,
//                 disabled: false,
//               });
//               return;
//             });
//       }
//     }
//   };
//
//   checkCount = value => {
//     if (isNaN(value)) {
//       this.setState({
//         msgErrorNumber: true,
//         sendDiamondsCount: value,
//         msgError: 'This field should be number.',
//       });
//     } else {
//       if (value > Global.saveData.coin_count) {
//         this.setState({
//           msgErrorNumber: true,
//           sendDiamondsCount: value,
//           msgError:
//               'You only have ' +
//               Global.saveData.coin_count +
//               ' diamonds available.',
//         });
//       } else {
//         this.setState({
//           msgErrorNumber: false,
//           sendDiamondsCount: value,
//         });
//       }
//     }
//   };
//
//   ringCall = () => {
//     var details = {
//       userName: Global.saveData.u_name,
//       otherId: this.state.other.userId,
//       otherUserName: this.state.other.name,
//       callType: 1,
//     };
//     var formBody = [];
//     for (var property in details) {
//       var encodedKey = encodeURIComponent(property);
//       var encodedValue = encodeURIComponent(details[property]);
//       formBody.push(encodedKey + '=' + encodedValue);
//     }
//     formBody = formBody.join('&');
//
//     fetch(`${SERVER_URL}/api/call/initiate`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/x-www-form-urlencoded',
//         Authorization: Global.saveData.token,
//       },
//       body: formBody,
//     })
//         .then(response => response.json())
//         .then(responseJson => {
//           if (responseJson.error === false) {
//             if (responseJson.data) {
//               if (responseJson.data.call_available) {
//                 this.props.navigation.push('VoiceCall', {
//                   data: {
//                     opponentAppInfo: this.state.other,
//                   },
//                 });
//               } else {
//                 Alert.alert(
//                     responseJson.message,
//                     'You have to receive one message at least to call ' +
//                     this.state.other.name,
//                     [{text: 'Ok', onPress: () => console.log('Ok pressed.')}],
//                     {cancelable: false},
//                 );
//               }
//             }
//           }
//         })
//         .catch(error => {
//           return;
//         });
//   };
//
//   ringVideo = () => {
//     var details = {
//       userName: Global.saveData.u_name,
//       otherId: this.state.other.userId,
//       otherUserName: this.state.other.name,
//       callType: 2,
//     };
//     var formBody = [];
//     for (var property in details) {
//       var encodedKey = encodeURIComponent(property);
//       var encodedValue = encodeURIComponent(details[property]);
//       formBody.push(encodedKey + '=' + encodedValue);
//     }
//     formBody = formBody.join('&');
//
//     fetch(`${SERVER_URL}/api/call/initiate`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/x-www-form-urlencoded',
//         Authorization: Global.saveData.token,
//       },
//       body: formBody,
//     })
//         .then(response => response.json())
//         .then(responseJson => {
//           if (responseJson.error === false) {
//             if (responseJson.data) {
//               if (responseJson.data.call_available) {
//                 this.props.navigation.push('VideoCall', {
//                   data: {
//                     opponentAppInfo: this.state.other,
//                   },
//                 });
//               } else {
//                 Alert.alert(
//                     responseJson.message,
//                     'You have to receive one message at least to video call ' +
//                     this.state.other.name,
//                     [{text: 'Ok', onPress: () => console.log('Ok pressed.')}],
//                     {cancelable: false},
//                 );
//               }
//             }
//           }
//         })
//         .catch(error => {
//           return;
//         });
//   };
//
//   handleMomentumScrollBegin = () => {
//     this.onEndReachedCalledDuringMomentum = false;
//   };
//
//   renderRow = (item, index) => {
//     const isLastMessage = index === this.state.messageList.length - 1;
//     return (
//         <>
//           {/*{item?.user_image_url != '' && item?.user_image_url != null && (*/}
//           {/*  <View*/}
//           {/*    key={`${index}_0${index}`}*/}
//           {/*    style={{*/}
//           {/*      flexDirection: 'column',*/}
//           {/*      justifyContent: 'space-between',*/}
//           {/*    }}>*/}
//           {/*    /!* <View style={{alignSelf: 'center', paddingLeft: 10, paddingRight: 10}}>*/}
//           {/*            <Text style={{color: '#000', fontSize: 14}}>{this.setChatDate(item)}</Text>*/}
//           {/*        </View> *!/*/}
//           {/*    <View*/}
//           {/*      style={{*/}
//           {/*        flexDirection: 'column',*/}
//           {/*        justifyContent: 'space-between',*/}
//           {/*        alignSelf:*/}
//           {/*          item.from === Global.saveData.u_id*/}
//           {/*            ? 'flex-end'*/}
//           {/*            : 'flex-start',*/}
//           {/*        margin: 10,*/}
//           {/*        marginLeft: 15,*/}
//           {/*        maxWidth: '70%',*/}
//           {/*      }}>*/}
//           {/*      <Text*/}
//           {/*        style={{*/}
//           {/*          padding: 3,*/}
//           {/*          fontSize: 12,*/}
//           {/*          color: '#000',*/}
//           {/*          alignSelf: 'flex-end',*/}
//           {/*        }}>*/}
//           {/*        {this.formatAMPM(item.time)}*/}
//           {/*      </Text>*/}
//           {/*      <View*/}
//           {/*        style={{*/}
//           {/*          flexDirection: 'row',*/}
//           {/*          justifyContent: 'space-between',*/}
//           {/*          backgroundColor:*/}
//           {/*            item.from === Global.saveData.u_id ? '#D5d5d5' : '#B64F54',*/}
//           {/*          borderRadius: 20,*/}
//           {/*          padding: 8,*/}
//           {/*          paddingLeft: item.from === Global.saveData.u_id ? 10 : 5,*/}
//           {/*          shadowColor: '#efefef',*/}
//           {/*          shadowOpacity: 0.8,*/}
//           {/*          shadowRadius: 2,*/}
//           {/*          shadowOffset: {*/}
//           {/*            height: 1,*/}
//           {/*            width: 1,*/}
//           {/*          },*/}
//           {/*        }}*/}
//           {/*        elevation={5}>*/}
//           {/*        {item.from === this.state.other.userId && (*/}
//           {/*          <TouchableHighlight*/}
//           {/*            style={styles.avatarBtn}*/}
//           {/*            onPress={() => this.gotoProfilePage()}>*/}
//           {/*            <Image*/}
//           {/*              style={styles.avatar}*/}
//           {/*              source={*/}
//           {/*                this.state.other.imgUrl*/}
//           {/*                  ? {uri: this.state.other.imgUrl}*/}
//           {/*                  : hiddenMan*/}
//           {/*              }*/}
//           {/*            />*/}
//           {/*          </TouchableHighlight>*/}
//           {/*        )}*/}
//           {/*        <View>*/}
//           {/*          <TouchableOpacity*/}
//           {/*            onPress={() => {*/}
//           {/*              this.setState({*/}
//           {/*                imagLargeUrl: item?.user_image_url,*/}
//           {/*              });*/}
//           {/*              this.setState({*/}
//           {/*                imagLarge: true,*/}
//           {/*              });*/}
//           {/*            }}>*/}
//           {/*            <Image*/}
//           {/*              style={{*/}
//           {/*                width: this.state.dimensions?.adjustedWidth,*/}
//           {/*                height: this.state.dimensions?.adjustedHeight,*/}
//           {/*                borderRadius: 10,*/}
//           {/*              }}*/}
//           {/*              resizeMode="contain"*/}
//           {/*              source={{uri: item?.user_image_url}}*/}
//           {/*            />*/}
//           {/*          </TouchableOpacity>*/}
//           {/*        </View>*/}
//           {/*      </View>*/}
//           {/*    </View>*/}
//           {/*  </View>*/}
//           {/*)}*/}
//           <View
//               key={`${index}_0${index}`}
//               ref={isLastMessage ? this.lastMessageRef : null}
//               onLayout={isLastMessage ? this.onLastMessageLayout : null}
//               style={{
//                 flexDirection: 'column',
//                 justifyContent: 'space-between',
//               }}>
//             <View
//                 style={{
//                   flexDirection: 'column',
//                   justifyContent: 'space-between',
//                   alignSelf:
//                       item.from === Global.saveData.u_id ? 'flex-end' : 'flex-start',
//                   margin: 10,
//                   marginLeft: 15,
//                   maxWidth: '70%',
//                 }}>
//               <Text
//                   style={{
//                     padding: 3,
//                     fontSize: 12,
//                     color: '#000',
//                     alignSelf: 'flex-end',
//                   }}>
//                 {this.formatAMPM(item.time)}
//               </Text>
//               <View
//                   style={{
//                     flexDirection: 'row',
//                     justifyContent: 'space-between',
//                     backgroundColor:
//                         item.from === Global.saveData.u_id ? '#D5d5d5' : '#B64F54',
//                     borderRadius: 20,
//                     padding: 8,
//                     paddingLeft:
//                         item.from === Global.saveData.u_id
//                             ? 10
//                             : item?.user_image_url !== '' &&
//                             item?.user_image_url != null
//                                 ? 10.5
//                                 : 30,
//                     shadowColor: '#efefef',
//                     shadowOpacity: 0.8,
//                     shadowRadius: 2,
//                     shadowOffset: {
//                       height: 1,
//                       width: 1,
//                     },
//                   }}
//                   elevation={5}>
//                 {item.from === this.state.other.userId && (
//                     <TouchableHighlight
//                         style={styles.avatarBtn}
//                         onPress={() => this.gotoProfilePage()}>
//                       <Image
//                           style={styles.avatar}
//                           source={
//                             this.state.other.imgUrl
//                                 ? {uri: this.state.other.imgUrl}
//                                 : hiddenMan
//                           }
//                       />
//                     </TouchableHighlight>
//                 )}
//                 <View>
//                   {item?.user_image_url !== '' && item?.user_image_url != null ? (
//                       <TouchableOpacity
//                           onPress={() => {
//                             this.setState({
//                               imagLargeUrl: item?.user_image_url,
//                             });
//                             this.setState({
//                               imagLarge: true,
//                             });
//                           }}>
//                         <Image
//                             style={{
//                               width: this.state.dimensions?.adjustedWidth,
//                               height: this.state.dimensions?.adjustedHeight,
//                               borderRadius: 10,
//                             }}
//                             resizeMode="contain"
//                             source={{uri: item?.user_image_url}}
//                         />
//                       </TouchableOpacity>
//                   ) : (
//                       <></>
//                   )}
//                   <Text
//                       style={{
//                         padding: 7,
//                         fontSize: 15,
//                         color: item.from === Global.saveData.u_id ? '#000' : '#FFF',
//                       }}>
//                     {item.message}
//                   </Text>
//                 </View>
//               </View>
//             </View>
//           </View>
//         </>
//     );
//   };
//
//   setLargeImage = imageUrl => {
//     this.setState({
//       imagLarge: true,
//       imagLargeUrl: imageUrl,
//     });
//   };
//
//   render() {
//     return (
//         <View style={styles.outer}>
//           <StatusBar
//               backgroundColor="transparent"
//               barStyle="light-content"
//               translucent={true}
//           />
//           <Dialog
//               visible={this.state.fanUserVisible}
//               dialogAnimation={
//                 new SlideAnimation({
//                   slideFrom: 'top',
//                 })
//               }>
//             <View style={styles.screenOverlay}>
//               <View style={styles.dialogPrompt}>
//                 <Text style={[styles.bodyFont, {color: '#000'}]}>
//                   {`You have ${Global.saveData.coin_count} diamonds`}
//                 </Text>
//                 <View style={{flexDirection: 'row'}}>
//                   <Text style={[styles.bodyFont, {color: '#000'}]}>
//                     {'Send '}
//                   </Text>
//                   <View style={styles.SectionStyle}>
//                     <Image source={diamond} style={{width: 25, height: 25}} />
//                     <TextInput
//                         placeholder={''}
//                         style={[styles.textInput, {color: '#000'}]}
//                         onChangeText={value => this.checkCount(value)}
//                     />
//                   </View>
//                   <Text style={[styles.bodyFont, {color: '#000'}]}>
//                     {' Diamonds'}
//                   </Text>
//                 </View>
//                 {this.state.errorMsg && (
//                     <Text style={[styles.requiredSent, {color: '#000'}]}>
//                       * {this.state.msgError}{' '}
//                     </Text>
//                 )}
//                 <Text style={{fontSize: 16, color: '#000'}}>
//                   {`Write a fan message to ${this.state.other.name} (public and optional)`}
//                 </Text>
//                 <TextInput
//                     multiline={true}
//                     numberOfLines={5}
//                     style={[styles.textMessageInput, {color: '#000'}]}
//                     editable
//                     onChangeText={text =>
//                         this.setState({
//                           fanMessage: text,
//                         })
//                     }
//                 />
//                 <View style={styles.buttonsOuterView}>
//                   <View style={styles.buttonsInnerView}>
//                     <TouchableOpacity
//                         style={[styles.button]}
//                         onPress={() =>
//                             this.setState(
//                                 {
//                                   fanUserVisible: !this.state.fanUserVisible,
//                                 },
//                                 function () {
//                                   this.hideMenu();
//                                 },
//                             )
//                         }>
//                       <Text style={[styles.cancelButtonText, {color: '#000'}]}>
//                         {'Cancel'}
//                       </Text>
//                     </TouchableOpacity>
//                     <View style={styles.buttonsDivider} />
//                     <TouchableOpacity
//                         style={[styles.button]}
//                         onPress={() =>
//                             this.setState(
//                                 {
//                                   fanUserVisible: !this.state.fanUserVisible,
//                                 },
//                                 function () {
//                                   this.hideMenu();
//                                   this.sendDiamonds();
//                                 },
//                             )
//                         }>
//                       <Text style={[styles.submitButtonText, {color: '#000'}]}>
//                         {'Send'}
//                       </Text>
//                     </TouchableOpacity>
//                   </View>
//                 </View>
//               </View>
//             </View>
//           </Dialog>
//
//           <Dialog
//               visible={this.state.imagLarge}
//               dialogAnimation={
//                 new SlideAnimation({
//                   slideFrom: 'top',
//                 })
//               }>
//             <View style={[styles.screenOverlay]}>
//               <View style={{position: 'absolute', right: 30, top: 20}}>
//                 <TouchableOpacity
//                     onPress={() => {
//                       this.setState({
//                         imagLarge: false,
//                       });
//                     }}>
//                   <Image style={{width: 24, height: 24}} source={icClose} />
//                 </TouchableOpacity>
//               </View>
//               <View
//                   style={[
//                     styles.dialogPrompt,
//                     {backgroundColor: '#000', marginTop: 50},
//                   ]}>
//                 <Image
//                     style={{
//                       width: Dimensions.get('window').width - 20,
//                       height: Dimensions.get('window').height - 75,
//                       borderRadius: 10,
//                       resizeMode: 'cover',
//                     }}
//                     source={{uri: this.state.imagLargeUrl}}
//                 />
//               </View>
//             </View>
//           </Dialog>
//
//           <Dialog
//               visible={this.state.noFanUserVisible}
//               dialogStyle={this.state.dialogStyle}
//               dialogAnimation={
//                 new SlideAnimation({
//                   slideFrom: 'top',
//                 })
//               }>
//             <View style={styles.screenOverlay}>
//               <View style={styles.dialogPrompt}>
//                 <Text style={[styles.title, {color: '#000'}]}>
//                   {`Become a fan of ${this.state.other.name} by sending diamonds!`}
//                 </Text>
//                 <View style={{alignItems: 'center', justifyContent: 'center'}}>
//                   <Image
//                       source={shooting_star}
//                       style={{width: 130, height: 130, marginTop: 20}}
//                   />
//                 </View>
//                 <Text style={[styles.bodyFont, {color: '#000'}]}>
//                   {`You have ${Global.saveData.coin_count} diamonds`}
//                 </Text>
//                 <View style={{flexDirection: 'row'}}>
//                   <Text style={[styles.bodyFont, {color: '#000'}]}>
//                     {'Send '}
//                   </Text>
//                   <View style={styles.SectionStyle}>
//                     <Image source={diamond} style={{width: 25, height: 25}} />
//                     <TextInput
//                         placeholder={''}
//                         style={[styles.textInput, {color: '#000'}]}
//                         onChangeText={value => this.checkCount(value)}
//                     />
//                   </View>
//                   <Text style={[styles.bodyFont, {color: '#000'}]}>
//                     {' Diamonds'}
//                   </Text>
//                 </View>
//                 {this.state.errorMsg && (
//                     <Text style={[styles.requiredSent, {color: '#000'}]}>
//                       * {this.state.msgError}{' '}
//                     </Text>
//                 )}
//                 <Text style={{fontSize: 16, color: '#000'}}>
//                   {`Write a fan message to ${this.state.other.name} (public and optional)`}
//                 </Text>
//                 <TextInput
//                     multiline={true}
//                     numberOfLines={5}
//                     style={[styles.textMessageInput, {color: '#000'}]}
//                     editable
//                     onChangeText={text =>
//                         this.setState({
//                           fanMessage: text,
//                         })
//                     }
//                 />
//                 <View style={styles.buttonsOuterView}>
//                   <View style={styles.buttonsInnerView}>
//                     <TouchableOpacity
//                         style={[styles.button]}
//                         onPress={() =>
//                             this.setState(
//                                 {
//                                   noFanUserVisible: !this.state.noFanUserVisible,
//                                 },
//                                 function () {
//                                   this.hideMenu();
//                                 },
//                             )
//                         }>
//                       <Text style={[styles.cancelButtonText, {color: '#000'}]}>
//                         {'Cancel'}
//                       </Text>
//                     </TouchableOpacity>
//                     <View style={styles.buttonsDivider} />
//                     <TouchableOpacity
//                         style={[styles.button]}
//                         onPress={() =>
//                             this.setState(
//                                 {
//                                   noFanUserVisible: !this.state.noFanUserVisible,
//                                 },
//                                 function () {
//                                   this.hideMenu();
//                                   this.sendDiamonds();
//                                 },
//                             )
//                         }>
//                       <Text style={[styles.submitButtonText, {color: '#000'}]}>
//                         {'Send'}
//                       </Text>
//                     </TouchableOpacity>
//                   </View>
//                 </View>
//               </View>
//             </View>
//           </Dialog>
//
//           <ImageBackground
//               source={bg}
//               style={{
//                 width: '100%',
//                 height: 150 * em,
//                 position: 'relative',
//                 justifyContent: 'flex-start',
//               }}>
//             <View
//                 style={{
//                   position: 'absolute',
//                   left: 20 * em,
//                   top: 70 * em,
//                   alignSelf: 'center',
//                   zIndex: 2,
//                 }}>
//               <TouchableHighlight
//                   style={{
//                     height: 75 * em,
//                     width: 75 * em,
//                     borderRadius: 5, // Make it circular for better touch area
//                     backgroundColor: 'transparent', // Background color should be transparent
//                     justifyContent: 'center',
//                     alignItems: 'center',
//                   }}
//                   underlayColor="rgba(0,0,0,0.2)" // Slight darkening effect when pressed
//                   onPress={this.backPressed}>
//                 <Icon
//                     name="keyboard-arrow-left"
//                     size={36}
//                     color={colors.inputLabel}
//                 />
//               </TouchableHighlight>
//             </View>
//             <View
//                 style={{
//                   position: 'absolute',
//                   left: 65,
//                   top: 70 * em,
//                   width: '100%',
//                   alignItems: 'flex-start',
//                   justifyContent: 'center',
//                   zIndex: 0,
//                 }}>
//               <TouchableOpacity
//                   style={styles.avatarOtherUserBtn}
//                   onPress={() => this.gotoProfilePage()}>
//                 <View
//                     style={{
//                       flexDirection: 'row',
//                       flex: 1,
//                       flexWrap: 'wrap',
//                       alignItems: 'center',
//                     }}>
//                   <Image
//                       style={styles.avatarOtherUser}
//                       source={
//                         this.state.other.imgUrl
//                             ? {uri: this.state.other.imgUrl}
//                             : hiddenMan
//                       }
//                   />
//                   <Text
//                       style={{
//                         textAlign: 'center',
//                         fontWeight: 'bold',
//                         fontSize: 16,
//                         marginLeft: 5,
//                         marginTop: 10,
//                         color: '#000',
//                       }}>
//                     {/*{this.state.other.name.length > 6*/}
//                     {/*  ? this.state.other.name.substring(0, 6)*/}
//                     {/*  : this.state.other.name}*/}
//                     {this.state.other.name}
//                   </Text>
//                 </View>
//               </TouchableOpacity>
//             </View>
//             <View style={styles.menuIcon}>
//               <Menu
//                   visible={this.state.menu}
//                   anchor={
//                     <TouchableOpacity
//                         onPress={() => {
//                           this.setState({
//                             menu: true,
//                           });
//                         }}>
//                       <Text>
//                         <Icon name="more-vert" size={30} color="black" />
//                       </Text>
//                     </TouchableOpacity>
//                   }
//                   onRequestClose={() => {
//                     this.setState({
//                       menu: false,
//                     });
//                   }}>
//                 {Global.saveData.is_admin === 1 && (
//                     <>
//                       <MenuItem onPress={this.setBlock}>
//                         <Image
//                             source={ban_black}
//                             style={{width: 20, height: 20, marginRight: 30}}
//                         />
//                         <Text style={{color: '#000'}}>{'   Leave Chat Room'}</Text>
//                       </MenuItem>
//                       <MenuDivider />
//                       <MenuItem onPress={this.setReport}>
//                         <Image
//                             source={notification_black}
//                             style={{width: 20, height: 20, marginRight: 30}}
//                         />
//                         <Text style={{color: '#000'}}>
//                           {'   Report & Leave Chat Room'}
//                         </Text>
//                       </MenuItem>
//                       <MenuDivider />
//                       <MenuItem onPress={this.showSendDiamondsModal}>
//                         <Image
//                             source={yellow_star}
//                             style={{width: 20, height: 20, marginRight: 30}}
//                         />
//                         <Text style={{color: '#000'}}>
//                           {this.state.is_fan
//                               ? '   Send Diamonds'
//                               : '   Become A Fan'}
//                         </Text>
//                       </MenuItem>
//                     </>
//                 )}
//                 <MenuItem onPress={this.resetError}>
//                   <Image
//                       source={reset}
//                       style={{width: 20, height: 20, marginRight: 30}}
//                   />
//                   <Text style={{color: '#000'}}>{'   Reset Error'}</Text>
//                 </MenuItem>
//               </Menu>
//             </View>
//           </ImageBackground>
//
//           {/*<View*/}
//           {/*  style={{*/}
//           {/*    width: DEVICE_WIDTH,*/}
//           {/*    height: 60,*/}
//           {/*    flexDirection: 'row',*/}
//           {/*    justifyContent: 'flex-start',*/}
//           {/*    marginTop: Platform.select({android: 10, ios: 40}),*/}
//           {/*    alignItems: 'center',*/}
//           {/*  }}>*/}
//           {/*  <TouchableOpacity*/}
//           {/*    style={{*/}
//           {/*      alignItems: 'center',*/}
//           {/*      justifyContent: 'center',*/}
//           {/*      width: 40,*/}
//           {/*      height: 60,*/}
//           {/*      zIndex: 1000,*/}
//           {/*      marginLeft: 10,*/}
//           {/*    }}*/}
//           {/*    onPress={this.backPressed}>*/}
//           {/*    <Icon*/}
//           {/*      name="keyboard-arrow-left"*/}
//           {/*      size={36}*/}
//           {/*      color={colors.inputLabel}*/}
//           {/*    />*/}
//           {/*  </TouchableOpacity>*/}
//           {/*  <View*/}
//           {/*    style={{*/}
//           {/*      alignItems: 'flex-start',*/}
//           {/*      justifyContent: 'space-between',*/}
//           {/*      width: DEVICE_WIDTH - 80,*/}
//           {/*      flexDirection: 'row',*/}
//           {/*      marginLeft: 10,*/}
//           {/*    }}>*/}
//           {/*    <TouchableOpacity*/}
//           {/*      style={styles.avatarOtherUserBtn}*/}
//           {/*      onPress={() => this.gotoProfilePage()}>*/}
//           {/*      <View*/}
//           {/*        style={{*/}
//           {/*          flexDirection: 'row',*/}
//           {/*          flex: 1,*/}
//           {/*          flexWrap: 'wrap',*/}
//           {/*        }}>*/}
//           {/*        <Image*/}
//           {/*          style={styles.avatarOtherUser}*/}
//           {/*          source={*/}
//           {/*            this.state.other.imgUrl*/}
//           {/*              ? {uri: this.state.other.imgUrl}*/}
//           {/*              : hiddenMan*/}
//           {/*          }*/}
//           {/*        />*/}
//           {/*        <Text*/}
//           {/*          style={{*/}
//           {/*            textAlign: 'center',*/}
//           {/*            fontWeight: 'bold',*/}
//           {/*            fontSize: 16,*/}
//           {/*            marginLeft: 5,*/}
//           {/*            marginTop: 10,*/}
//           {/*            color: '#000',*/}
//           {/*          }}>*/}
//           {/*          {this.state.other.name.length > 6*/}
//           {/*            ? this.state.other.name.substring(0, 6)*/}
//           {/*            : this.state.other.name}*/}
//           {/*        </Text>*/}
//           {/*<Image*/}
//           {/*  source={diamond}*/}
//           {/*  style={{width: 20, height: 20, marginLeft: 15, marginTop: 12}}*/}
//           {/*/>*/}
//           {/*<Text*/}
//           {/*  style={{*/}
//           {/*    marginLeft: 1,*/}
//           {/*    fontSize: 14,*/}
//           {/*    fontWeight: 'bold',*/}
//           {/*    marginTop: 12,*/}
//           {/*    color: '#000',*/}
//           {/*  }}>*/}
//           {/*  {this.state.other.coin_count}*/}
//           {/*</Text>*/}
//           {/* <Image source={yellow_star} style={{ width: 20, height: 20, marginLeft: 15, marginTop: 12 }} /> */}
//           {/* <Text style={{ marginLeft: 1, fontSize: 14, fontWeight: 'bold', marginTop: 12 }}>{this.state.other.fan_count}</Text> */}
//           {/*  </View>*/}
//           {/*</TouchableOpacity>*/}
//           {/*<View style={styles.menuIcon}>*/}
//           {/*  <Menu*/}
//           {/*    visible={this.state.menu}*/}
//           {/*    anchor={*/}
//           {/*      <TouchableOpacity*/}
//           {/*        onPress={() => {*/}
//           {/*          this.setState({*/}
//           {/*            menu: true,*/}
//           {/*          });*/}
//           {/*        }}>*/}
//           {/*        <Text>*/}
//           {/*          <Icon name="more-vert" size={30} color="black" />*/}
//           {/*        </Text>*/}
//           {/*      </TouchableOpacity>*/}
//           {/*    }*/}
//           {/*    onRequestClose={() => {*/}
//           {/*      this.setState({*/}
//           {/*        menu: false,*/}
//           {/*      });*/}
//           {/*    }}>*/}
//           {/*    <MenuItem onPress={this.setBlock}>*/}
//           {/*      <Image*/}
//           {/*        source={ban_black}*/}
//           {/*        style={{width: 20, height: 20, marginRight: 30}}*/}
//           {/*      />*/}
//           {/*      <Text style={{color: '#000'}}>{'   Leave Chat Room'}</Text>*/}
//           {/*    </MenuItem>*/}
//           {/*    <MenuDivider />*/}
//           {/*    <MenuItem onPress={this.setReport}>*/}
//           {/*      <Image*/}
//           {/*        source={notification_black}*/}
//           {/*        style={{width: 20, height: 20, marginRight: 30}}*/}
//           {/*      />*/}
//           {/*      <Text style={{color: '#000'}}>*/}
//           {/*        {'   Report & Leave Chat Room'}*/}
//           {/*      </Text>*/}
//           {/*    </MenuItem>*/}
//           {/*    <MenuDivider />*/}
//           {/*    <MenuItem onPress={this.showSendDiamondsModal}>*/}
//           {/*      <Image*/}
//           {/*        source={yellow_star}*/}
//           {/*        style={{width: 20, height: 20, marginRight: 30}}*/}
//           {/*      />*/}
//           {/*      <Text style={{color: '#000'}}>*/}
//           {/*        {this.state.is_fan ? '   Send Diamonds' : '   Become A Fan'}*/}
//           {/*      </Text>*/}
//           {/*    </MenuItem>*/}
//           {/*  </Menu>*/}
//           {/*</View>*/}
//           {/*<View style={{flexDirection: 'row'}}>*/}
//           {/*<TouchableOpacity*/}
//           {/*  style={styles.ringIconTouch}*/}
//           {/*  onPress={() => this.ringCall()}>*/}
//           {/*  <Image style={styles.ringIcon} source={call_ring} />*/}
//           {/*</TouchableOpacity>*/}
//           {/*<TouchableOpacity*/}
//           {/*  style={[styles.ringIconTouch, {marginLeft: 5}]}*/}
//           {/*  onPress={() => this.ringVideo()}>*/}
//           {/*  <Image style={styles.ringIcon} source={call_video} />*/}
//           {/*</TouchableOpacity>*/}
//           {/*</View>*/}
//           {/*  </View>*/}
//           {/*</View>*/}
//           {/*<View*/}
//           {/*  style={{*/}
//           {/*    width: DEVICE_WIDTH,*/}
//           {/*    height: 60,*/}
//           {/*    flexDirection: 'row',*/}
//           {/*    justifyContent: 'center',*/}
//           {/*    marginTop: 20,*/}
//           {/*    alignItems: 'center',*/}
//           {/*  }}>*/}
//           {/*{this.state.statusByMatchId == 6 && (*/}
//           {/*  <View*/}
//           {/*    style={{*/}
//           {/*      justifyContent: 'center',*/}
//           {/*      borderColor: '#d9d9d9',*/}
//           {/*      borderWidth: 0.5,*/}
//           {/*      padding: 20,*/}
//           {/*    }}>*/}
//           {/*    <Text style={{color: '#000'}}>*/}
//           {/*      {`Everytime you receive a message from ${this.state.other.name}, `}*/}
//           {/*    </Text>*/}
//           {/*    <View style={{flexDirection: 'row', justifyContent: 'center'}}>*/}
//           {/*      <Text style={{color: '#000'}}>{'you will receive '}</Text>*/}
//           {/*      <Image*/}
//           {/*        source={diamond}*/}
//           {/*        style={{*/}
//           {/*          width: 15,*/}
//           {/*          height: 15,*/}
//           {/*          marginTop: 3,*/}
//           {/*          marginRight: 2,*/}
//           {/*        }}*/}
//           {/*      />*/}
//           {/*      <Text style={{color: '#000'}}>*/}
//           {/*        {`${this.state.msgCoinPerMessage} from ${this.state.other.name}`}*/}
//           {/*      </Text>*/}
//           {/*    </View>*/}
//           {/*  </View>*/}
//           {/*)}*/}
//           {/*{this.state.statusByMatchId == 7 && (*/}
//           {/*  <View*/}
//           {/*    style={{*/}
//           {/*      justifyContent: 'center',*/}
//           {/*      borderColor: '#d9d9d9',*/}
//           {/*      borderWidth: 0.5,*/}
//           {/*      padding: 20,*/}
//           {/*    }}>*/}
//           {/*    <Text style={{color: '#000'}}>*/}
//           {/*      {`Everytime you send a message to ${this.state.other.name}, `}*/}
//           {/*    </Text>*/}
//           {/*    <View style={{flexDirection: 'row', justifyContent: 'center'}}>*/}
//           {/*      <Text style={{color: '#000'}}>{'you will send '}</Text>*/}
//           {/*      <Image*/}
//           {/*        source={diamond}*/}
//           {/*        style={{*/}
//           {/*          width: 15,*/}
//           {/*          height: 15,*/}
//           {/*          marginTop: 3,*/}
//           {/*          marginRight: 2,*/}
//           {/*        }}*/}
//           {/*      />*/}
//           {/*      <Text style={{color: '#000'}}>*/}
//           {/*        {`${this.state.msgCoinPerMessage} to ${this.state.other.name}`}*/}
//           {/*      </Text>*/}
//           {/*    </View>*/}
//           {/*  </View>*/}
//           {/*)}*/}
//           {/*</View>*/}
//
//           {/*{this.state.isLoading && (*/}
//           {/*  <View*/}
//           {/*    style={{*/}
//           {/*      backgroundColor: 'rgba(0,0,0,0.25)',*/}
//           {/*      justifyContent: 'center',*/}
//           {/*      alignItems: 'center',*/}
//           {/*      height: '100%',*/}
//           {/*      width: '100%',*/}
//           {/*    }}>*/}
//           {/*    <Text style={{color: '#FFF'}}>*/}
//           {/*      {'Please wait while loading chat...'}*/}
//           {/*    </Text>*/}
//           {/*  </View>*/}
//           {/*)}*/}
//
//           {this.state.other.ai_personality != '' &&
//               this.state.other.ai_personality != null && (
//                   <View
//                       style={{
//                         justifyContent: 'center',
//                         borderColor: '#d9d9d9',
//                         borderWidth: 0.5,
//                         padding: 10,
//                       }}>
//                     <Text style={{color: '#000', fontSize: 8}}>
//                       {this.state.tempMessageList[0].content}
//                     </Text>
//                   </View>
//               )}
//           <ScrollView
//               style={{flex: 1, marginHorizontal: 10}}
//               ref={ref => {
//                 this.scrollView = ref;
//               }}
//               nestedScrollEnabled={true}
//               onScroll={({nativeEvent}) => {
//                 if (nativeEvent.contentOffset.y === 0) {
//                   this.handleScroll();
//                 }
//               }}
//               // onContentSizeChange={(contentWidth, contentHeight) => {
//               //   if (this.scrollView) {
//               //     setTimeout(() => {
//               //       this.scrollView.scrollToEnd({animated: true});
//               //     }, 200);
//               //   }
//               //   // this.scrollView.scrollToEnd({animated: true});
//               // }}
//           >
//             {this.state.messageList.length > 0 &&
//                 this.state.messageList.map((item, index) => {
//                   return this.renderRow(item, index);
//                 })}
//             {/*<View style={{flex: 1}}>*/}
//             {/*  <FlatList*/}
//             {/*    ref={this.flatListRef}*/}
//             {/*    style={{padding: 10}}*/}
//             {/*    data={this.state.other.ai_friend == 0 ? [] : this.state.messageList}*/}
//             {/*    renderItem={({item, index}) => (*/}
//             {/*      <ChatMessage*/}
//             {/*        item={item}*/}
//             {/*        messageList={this.state.messageList}*/}
//             {/*        index={index}*/}
//             {/*        adjustedHeight={this.state.dimensions?.adjustedHeight}*/}
//             {/*        adjustedWidth={this.state.dimensions?.adjustedWidth}*/}
//             {/*        gotoProfilePage={this.gotoProfilePage}*/}
//             {/*        setLargeImage={this.setLargeImage}*/}
//             {/*        hiddenMan={hiddenMan}*/}
//             {/*        lastMessageRef={this.lastMessageRef}*/}
//             {/*        onLastMessageLayout={this.onLastMessageLayout}*/}
//             {/*        userId={this.state.other.userId}*/}
//             {/*        imgUrl={this.state.other.imgUrl}*/}
//             {/*      />*/}
//             {/*    )}*/}
//             {/*    keyExtractor={(item, index) => `${item.time}-${index}`}*/}
//             {/*    onScroll={this.handleScroll}*/}
//             {/*    initialNumToRender={10}*/}
//             {/*    onMomentumScrollBegin={this.handleMomentumScrollBegin}*/}
//             {/*    ListEmptyComponent={*/}
//             {/*      <View*/}
//             {/*        style={{*/}
//             {/*          height: Dimensions.get('window').height - 150,*/}
//             {/*          alignItems: 'center',*/}
//             {/*          justifyContent: 'center',*/}
//             {/*        }}>*/}
//             {/*        <Text>No chat history available</Text>*/}
//             {/*      </View>*/}
//             {/*    }*/}
//             {/*    ListHeaderComponent={() =>*/}
//             {/*      this.state.isLoading && <ActivityIndicator />*/}
//             {/*    }*/}
//             {/*    onEndReachedThreshold={0.5}*/}
//             {/*    onEndReached={() => {}}*/}
//             {/*  />*/}
//             {/*</View>*/}
//           </ScrollView>
//           <View style={styles.inputBar}>
//             <TextInput
//                 multiline
//                 style={[styles.textBox, {color: '#000'}]}
//                 value={this.state.textMessage}
//                 onChangeText={this.handleChange('textMessage')}
//             />
//             {this.state.other.ai_friend == 1 && (
//                 <TouchableHighlight
//                     style={styles.sendButton}
//                     onPress={this.sendMessage}>
//                   <Icon name="send" size={24} color="white" />
//                 </TouchableHighlight>
//             )}
//           </View>
//         </View>
//     );
//   }
// }
//
// const styles = StyleSheet.create({
//   outer: {
//     flex: 1,
//     flexDirection: 'column',
//     justifyContent: 'space-between',
//     backgroundColor: 'white',
//   },
//   menuIcon: {
//     position: 'absolute',
//     right: 15,
//     top: 70 * em,
//     height: 74 * em,
//     width: 75 * em,
//     alignItems: 'flex-end',
//     justifyContent: 'center',
//     zIndex: 1,
//     // position: 'absolute',
//     // right: 15,
//     // justifyContent: 'flex-end',
//     // alignItems: 'center',
//     // marginTop: 40,
//     // height: 40,
//     // width: 40,
//   },
//   input: {
//     padding: 10,
//     borderWidth: 1,
//     borderColor: '#ccc',
//     width: '80%',
//     marginBottom: 10,
//     borderRadius: 20,
//   },
//   inputBar: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingHorizontal: 15,
//     paddingVertical: 5,
//   },
//   sendButton: {
//     // position: 'absolute',
//     // justifyContent: 'center',
//     // alignItems: 'center',
//     // paddingLeft: 15,
//     // right: 15,
//     // paddingRight: 15,
//     // borderRadius: 400,
//     // height: 50,
//     // width: 50,
//     // top: 5,
//     // bottom: 0,
//     // backgroundColor: '#B64F54',
//     justifyContent: 'center',
//     alignItems: 'center',
//     borderRadius: 25,
//     height: 50,
//     width: 50,
//     backgroundColor: '#B64F54',
//     marginLeft: 10,
//     zIndex: 10,
//   },
//   textBox: {
//     // borderRadius: 25,
//     // borderWidth: 1,
//     // borderColor: '#8C807F',
//     // flex: 1,
//     // fontSize: 15,
//     // paddingHorizontal: 8,
//     // paddingRight: 50,
//     borderRadius: 25,
//     borderWidth: 1,
//     borderColor: '#8C807F',
//     flex: 1,
//     fontSize: 15,
//     paddingHorizontal: 8,
//     paddingRight: 8,
//   },
//   chatbox: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   leftContainer: {
//     flex: 5,
//     flexDirection: 'row',
//     justifyContent: 'flex-start',
//   },
//   rightContainer: {
//     flex: 1,
//     flexDirection: 'row',
//     justifyContent: 'flex-end',
//   },
//   avatarBtn: {
//     position: 'absolute',
//     width: 45,
//     height: 45,
//     borderRadius: 22.5,
//     left: -15,
//     top: -22.5,
//     zIndex: 2,
//   },
//   avatar: {
//     width: 45,
//     height: 45,
//     borderRadius: 400,
//   },
//   avatarOtherUser: {
//     marginTop: 10,
//     marginRight: 10,
//     width: 30,
//     height: 30,
//     borderRadius: 15,
//     flexWrap: 'wrap-reverse',
//   },
//   // avatarOtherUser: {
//   //     marginTop: 10,
//   //     width: 40,
//   //     height: 40,
//   //     borderRadius: 20,
//   //     flexWrap: 'wrap-reverse',
//   // },
//   avatarOtherUserBtn: {
//     // maxWidth: DEVICE_WIDTH - 115,
//     // height: 45,
//     // alignItems: 'center',
//   },
//   // avatarOtherUserBtn: {
//   //     flexDirection: 'row',
//   //     flex: 2,
//   //     maxWidth: 100,
//   //     height: 40,
//   // },
//   requiredSent: {
//     textAlign: 'center',
//     color: 'red',
//     fontSize: 12,
//     marginBottom: 5,
//   },
//   ringIcon: {
//     width: 36,
//     height: 36,
//     marginLeft: 10,
//     marginTop: 0,
//   },
//   ringIconTouch: {
//     width: 50,
//     height: 50,
//     marginLeft: 10,
//     marginTop: 5,
//   },
//   screenOverlay: {
//     height: Dimensions.get('window').height,
//     backgroundColor: 'black',
//     opacity: 0.9,
//   },
//   dialogPrompt: {
//     ...Platform.select({
//       ios: {
//         opacity: 0.9,
//         backgroundColor: 'rgb(222,222,222)',
//         borderRadius: 15,
//       },
//       android: {
//         borderRadius: 5,
//         backgroundColor: 'white',
//       },
//     }),
//     marginHorizontal: 20,
//     marginTop: 150,
//     padding: 10,
//   },
//   title: {
//     fontWeight: 'bold',
//     fontSize: 16,
//     color: 'black',
//   },
//   bodyFont: {
//     fontSize: 16,
//     color: 'black',
//     marginTop: 20,
//   },
//   textMessageInput: {
//     marginTop: 10,
//     height: 80,
//     width: DEVICE_WIDTH * 0.8,
//     paddingHorizontal: 10,
//     textAlignVertical: 'top',
//     borderWidth: 0.5,
//     borderColor: '#000',
//     ...Platform.select({
//       ios: {
//         borderRadius: 15,
//         backgroundColor: 'rgba(166, 170, 172, 0.9)',
//       },
//       android: {
//         borderRadius: 10,
//         backgroundColor: 'white',
//       },
//     }),
//   },
//   textInput: {
//     height: 40,
//     width: 60,
//     paddingHorizontal: 10,
//     textAlignVertical: 'bottom',
//     ...Platform.select({
//       ios: {
//         borderRadius: 15,
//         backgroundColor: 'rgba(166, 170, 172, 0.9)',
//       },
//       android: {},
//     }),
//   },
//   buttonsOuterView: {
//     flexDirection: 'row',
//     ...Platform.select({
//       ios: {},
//       android: {
//         justifyContent: 'flex-end',
//       },
//     }),
//     width: '100%',
//   },
//   buttonsDivider: {
//     ...Platform.select({
//       ios: {
//         width: 1,
//         backgroundColor: 'rgba(0,0,0,0.5)',
//       },
//       android: {
//         width: 20,
//       },
//     }),
//   },
//   buttonsInnerView: {
//     flexDirection: 'row',
//     ...Platform.select({
//       ios: {
//         borderTopWidth: 0.5,
//         flex: 1,
//       },
//       android: {},
//     }),
//   },
//   button: {
//     flexDirection: 'column',
//     justifyContent: 'center',
//
//     alignItems: 'center',
//     ...Platform.select({
//       ios: {flex: 1},
//       android: {},
//     }),
//     marginTop: 5,
//     padding: 10,
//   },
//   cancelButtonText: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#61bfa9',
//   },
//   submitButtonText: {
//     color: '#61bfa9',
//     fontWeight: '600',
//     fontSize: 16,
//   },
//   SectionStyle: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#fff',
//     borderWidth: 0.5,
//     borderColor: '#000',
//     height: 40,
//     borderRadius: 5,
//     margin: 10,
//   },
// });
//
// const mapStateToProps = state => {
//   const {unreadFlag, senders, userData, fcmID} = state.reducer;
//   return {unreadFlag, senders, userData, fcmID};
// };
//
// const mapDispatchToProps = dispatch =>
//     bindActionCreators(
//         {
//           changeReadFlag,
//           updateQuickBlox,
//         },
//         dispatch,
//     );
//
// export default connect(mapStateToProps, mapDispatchToProps)(ChatScreen);
