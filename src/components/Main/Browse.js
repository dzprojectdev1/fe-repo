import React, { Component } from "react";
import {
  Icon,
  Text,
  Content,
} from "native-base";
import {
  AsyncStorage,
  BackHandler,
  Image,
  ScrollView,
  Dimensions,
  View,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Alert,
  TextInput,
  Platform,
  Keyboard,
} from "react-native";
import { Button } from 'react-native-elements';
import Dialog, { DialogFooter, DialogButton, DialogContent, SlideAnimation } from 'react-native-popup-dialog';
import Video from 'react-native-video';

import b_chat from '../../assets/images/chat.png';
import b_notification from '../../assets/images/notification.png';
import b_filters from '../../assets/images/filters.png';
import b_name from '../../assets/images/name.png';
import b_age from '../../assets/images/age.png';
import b_distance from '../../assets/images/distance.png';
import b_profile from '../../assets/images/profile.png';
import ban_user from '../../assets/images/ban_user.png';
import no_photo from '../../assets/images/no_photo.png';
import diamond from '../../assets/images/red_diamond_trans.png';
import flash_heart from '../../assets/images/flash_heart.png';
import flash_reject from '../../assets/images/flash_reject.png';
import line_star from '../../assets/images/line_star.png';
import shooting_star from '../../assets/images/shooting_star.png';
import yellow_star from '../../assets/images/yellow_star.png';
import Global from '../Global';

import { SERVER_URL, GCS_BUCKET } from '../../config/constants';

class Browse extends Component {
  constructor(props) {
    super(props);
    this.state = {
      otherData: props.navigation.state.params.data,
      heartIcon: 'heart',
      hateIcon: 'close',
      isLoading: false,
      disabled: false,
      noMoreUsers: false,
      isReplace: false,
      coinCount: Global.saveData.coin_count,
      visible: false,
      matchId: -1,
      unlimitedInstant: false,
      flash_heart: false,
      flash_reject: false,
      flash_ban: false,
      coin_count: props.navigation.state.params.data.detail.coin_count,
      fan_count: props.navigation.state.params.data.detail.fan_count,
      fanUserVisible: false,
      noFanUserVisible: false,
      errorMsg: false,
      msgError: '',
      sendDiamondsCount: 0,
      fanMessage: '',
      dialogStyle: {},
      paused:false,
      isPlayVideo: true,
    };
  }

  static navigationOptions = {
    header: null
  };

  componentWillMount() {
    Global.saveData.nowPage = 'Browse';
    BackHandler.addEventListener('hardwareBackPress', this.backPressed);
  }

  componentDidMount() {
    // Verify validation for unlimited instant chat permission
    var userId = Global.saveData.u_id;
    fetch(`${SERVER_URL}/api/transaction/validatePass/${userId}`, {
      method: 'POST',
      headers: {
        'Content-type': 'application/x-www-form-urlencoded',
        'Authorization': Global.saveData.token
      }
    }).then((response) => response.json())
    .then((responseJSON) => {      
      if (responseJSON.error === false) {

        // display remain time for unlimited instant chat
        if (responseJSON.data.validation) {
          this.setState({
            unlimitedInstant: true,
          });
          Global.saveData.coin_count = responseJSON.data.coin_count;
          this.setState({
            coinCount: Global.saveData.coin_count,
          });
        }
      }
    }).catch((error) => {
      // alert(error);
      return
    })

    Keyboard.addListener('keyboardDidShow', this._keyboardDidShow)
    Keyboard.addListener('keyboardDidHide', this._keyboardDidHide)
  }

  _keyboardDidShow = () => {
    this.setState({
      dialogStyle: {
          top: -1 * (DEVICE_WIDTH / 4),
          borderRadius: 20,
          padding: 10,
          overflow: 'hidden',
      },
    })
  }

  _keyboardDidHide = () => {
    this.setState({
      dialogStyle: {
          borderRadius: 20,
          padding: 10,
          overflow: 'hidden',
      },
    })
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.backPressed);
  }

  getVideos() {
    fetch(`${SERVER_URL}/api/match/discover`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': Global.saveData.token
      }
    }).then((response) => response.json())
      .then((responseJson) => {
        if (!responseJson.error) {
          if (responseJson.data) {
            this.setState({
              noMoreUsers: false
            });
            this.getDetails(responseJson.data);
          } else {
            this.setState({
              noMoreUsers: true
            })
          }
        }
      })
      .catch((error) => {
        return
      });
  }
  getFilterVideos() {
    AsyncStorage.getItem('filterData', (err, result) => {
      var details = {};
      if (result !== null) {
        let filterStore = JSON.parse(result);
        details = {
          gender: filterStore.gender,
          lessAge: filterStore.toAge,
          greaterAge: filterStore.fromAge
        };
        if (filterStore.distance) {
          details.distance = filterStore.distance;
        }
        if (filterStore.city_index) {
          details.ethnicityId = filterStore.city_index;
        }
        if (filterStore.language_index) {
          details.languageId = filterStore.language_index;
        }
        if (filterStore.country_index) {
          details.countryId = filterStore.country_index;
        }
      };
      var formBody = [];
      for (var property in details) {
        var encodedKey = encodeURIComponent(property);
        var encodedValue = encodeURIComponent(details[property]);
        formBody.push(encodedKey + "=" + encodedValue);
      }
      formBody = formBody.join("&");
      fetch(`${SERVER_URL}/api/match/discover`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': Global.saveData.token
        },
        body: formBody,
      }).then((response) => response.json())
        .then((responseJson) => {
          if (!responseJson.error) {
            if (responseJson.data) {
              this.setState({
                noMoreUsers: false
              });
              this.getDetails(responseJson.data);
            } else {
              this.setState({
                noMoreUsers: true
              });
            }
          }
        }).catch((error) => {
          return
        }
        );
    });
  }
  getDetails = async (data) => {
    if (data.cdn_filtered_id && data.content_type == 1) {
      var otherData = {};
      otherData = {
        imageUrl: GCS_BUCKET + data.cdn_filtered_id + '-screenshot',
        videoUrl: null,
        content_type: data.content_type,
        detail: data
      };
      this.setState({
        otherData: otherData,
        coin_count: data.coin_count,
        fan_count: data.fan_count,
        flash_heart: false,
        flash_reject: false,
        flash_ban: false,
      });
    } else if (data.cdn_filtered_id && data.content_type == 2) {
      var otherData = {};
      var v_url = `${SERVER_URL}/api/storage/videoLink?fileId=` + data.cdn_filtered_id;
      await fetch(v_url, {
          method: 'GET',
          headers: { 
              'Content-Type':'application/json',
              'Authorization':Global.saveData.token
          }
      }).then((response) => response.json())
          .then((responseJson) => { 
              otherData = {
                imageUrl: GCS_BUCKET + data.cdn_filtered_id + '_128ss',
                videoUrl: responseJson.url,
                content_type: data.content_type,
                detail: data
              };
          })
          .catch((error) => {
              alert("There is error, please try again!")
              return
      });
      this.setState({
        otherData: otherData,
        coin_count: data.coin_count,
        fan_count: data.fan_count,
        flash_heart: false,
        flash_reject: false,
        flash_ban: false,
      });
    } else {
      var otherData = {
        imageUrl: null,
        videoUrl: null,
        content_type: null,
        detail: data
      };
      this.setState({
        otherData: otherData,
        coin_count: data.coin_count,
        fan_count: data.fan_count,
        flash_heart: false,
        flash_reject: false,
        flash_ban: false,
      })
    }
  }
  onReject() {
    this.setState({
      isLoading: true,
      disabled: false,
      flash_reject: true,
    });
    var details = {
      'otherId': this.state.otherData.detail.id
    };
    var formBody = [];
    for (var property in details) {
      var encodedKey = encodeURIComponent(property);
      var encodedValue = encodeURIComponent(details[property]);
      formBody.push(encodedKey + "=" + encodedValue);
    }
    formBody = formBody.join("&");
    fetch(`${SERVER_URL}/api/match/dislike`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': Global.saveData.token
      },
      body: formBody,
    }).then((response) => response.json())
      .then((responseJson) => {
        if (!responseJson.error) {
          this.getFilterVideos();
        }
        this.setState({
          isLoading: false,
          disabled: false,
          isReplace: true
        });
      })
      .catch((error) => {
        this.setState({
          isLoading: false,
          disabled: false
        });
        return
      });
  }
  onHeart() {
    this.setState({
      isLoading: true,
      disabled: true,
      flash_heart: true,
    });

    var details = {
      'otherId': this.state.otherData.detail.id
    };
    var formBody = [];
    for (var property in details) {
      var encodedKey = encodeURIComponent(property);
      var encodedValue = encodeURIComponent(details[property]);
      formBody.push(encodedKey + "=" + encodedValue);
    }
    formBody = formBody.join("&");
    fetch(`${SERVER_URL}/api/match/like`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': Global.saveData.token
      },
      body: formBody,
    }).then((response) => response.json())
      .then((responseJson) => {
        if (!responseJson.error) {
          if (responseJson.data.account_status == 1) {
            if (responseJson.data.coin_count == '0') {
      
              Global.saveData.coin_count = responseJson.data.coin_count;

              this.setState({
                visible: true,
                isLoading: false,
                disabled: false
              })
            } else {
      
              Global.saveData.coin_count = responseJson.data.coin_count;
              
              this.getFilterVideos();
    
              this.setState({
                coinCount: responseJson.data.coin_count,
                isLoading: false,
                disabled: false
              });
            }
          } else {
            Alert.alert(
              '',
              responseJson.message,
              [
                {text: 'OK', onPress: () => console.log('OK Pressed')},
              ],
              {cancelable: false},
            );
          }
        } else {
          Alert.alert(
            '',
            responseJson.message,
            [
              {text: 'OK', onPress: () => console.log('OK Pressed')},
            ],
            {cancelable: false},
          );
          this.setState({
            isLoading: false,
            disabled: false,
            isReplace: true,
            flash_heart: false,
          });
        }
        this.setState({
          isLoading: false,
          disabled: false,
          isReplace: true
        });
      })
      .catch((error) => {
        this.setState({
          isLoading: false,
          disabled: false,
          flash_heart: false
        });
        return
      });
  }

  backPressed = () => {
    const { isReplace } = this.state;
    if (isReplace) {
      this.props.navigation.replace("BrowseList", { ids: this.state.operatedIDArr });
    } else {
      this.props.navigation.replace(Global.saveData.prePage);
    }
    return true;
  }
  gotoFilter() {
    this.props.navigation.navigate("Filter");
  }
  gotoProfile = () => {
    Global.saveData.prevpage = "Browse";
    this.props.navigation.replace("Profile",
      {
        data: {
          id: this.state.otherData.detail.id, 
          name: this.state.otherData.detail.name, 
          isMatched: false, 
          description: this.state.otherData.detail.description,
          imageUrl: this.state.otherData.imageUrl,
          videoUrl: this.state.otherData.videoUrl,
          age: this.state.otherData.detail.age,
          distance: this.state.otherData.detail.distance,
          gender: this.state.otherData.detail.gender,
          last_loggedin_date: this.state.otherData.detail.last_loggedin_date,
          ethnicity_name: this.state.otherData.detail.ethnicity_name,
          language_name: this.state.otherData.detail.language_name,
          country_name: this.state.otherData.detail.country_name,
          coin_count: this.state.coin_count,
          fan_count: this.state.fan_count,
          coin_per_message: this.state.otherData.detail.coin_per_message,
          matchId: 0,
        } 
      }
    );
  }
  banUser = () => {
    Alert.alert(
      '',
      "Are you sure you want to ban this user?",
      [
        {text: 'Cancel', onPress: () => console.log('Cancel Pressed')},
        {text: 'Yes', onPress: () => this.banUserRequest()},
      ],
      {cancelable: false},
    );
  }
  banUserRequest = () => {
    this.setState({
      isLoading: true,
      disabled: false,
      flash_ban: true,
    });
    var details = {
      'otherId': this.state.otherData.detail.id
    };
    var formBody = [];
    for (var property in details) {
      var encodedKey = encodeURIComponent(property);
      var encodedValue = encodeURIComponent(details[property]);
      formBody.push(encodedKey + "=" + encodedValue);
    }
    formBody = formBody.join("&");
    fetch(`${SERVER_URL}/api/user/banUser`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': Global.saveData.token
      },
      body: formBody,
    }).then((response) => response.json())
      .then((responseJson) => {
        if (!responseJson.error) {
          this.getFilterVideos();
        }
        this.setState({
          isLoading: false,
          disabled: false,
          isReplace: true
        });
      })
      .catch((error) => {
        this.setState({
          isLoading: false,
          disabled: false
        });
        return
      });
  }
  gotoShop = () => {
    this.setState({
      visible: false
    })
    this.props.navigation.navigate('screenGpay01');
  }
  instantChat = () => {
    if (this.state.unlimitedInstant) {
      this.gotoInstantChat();
    } else {
      Alert.alert(
        '',
        "Send instant messages to " + this.state.otherData.detail.name + " for 50 diamonds. Continue?",
        [
          {text: 'Cancel', onPress: () => console.log('Cancel Pressed')},
          {text: 'OK', onPress: () => this.gotoInstantChat()},
        ],
        {cancelable: false},
      );
    }
  }
  gotoInstantChat = () => {
    var details = {
      'otherId': this.state.otherData.detail.id
    };
    var formBody = [];
    for (var property in details) {
      var encodedKey = encodeURIComponent(property);
      var encodedValue = encodeURIComponent(details[property]);
      formBody.push(encodedKey + "=" + encodedValue);
    }
    formBody = formBody.join("&");
    fetch(`${SERVER_URL}/api/match/requestInstantMatch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': Global.saveData.token
      },
      body: formBody,
    }).then((response) => response.json())
      .then((responseJson) => {
        if (!responseJson.error) {

          if (responseJson.data.account_status == 1) {
            if (!responseJson.data.ability) {
              Alert.alert(
                '',
                "50 diamonds are required to start a chat with " + this.state.otherData.detail.name + " immediately.",
                [
                  {text: 'Cancel', onPress: () => console.log('Cancel Pressed')},
                  {text: 'Buy Diamonds', onPress: () => this.gotoShop()},
                ],
                {cancelable: false},
              );
            } else {
              this.setState({
                matchId: responseJson.data.match_id,
                coinCount: responseJson.data.coin_count
              });

              Global.saveData.coin_count = responseJson.data.coin_count;
    
              this.gotoChat();
            }
          } else {
            Alert.alert(
              '',
              responseJson.message,
              [],
              {cancelable: false},
            );
          }
        } else {
          Alert.alert(
            '',
            responseJson.message,
            [
              {text: 'OK', onPress: () => console.log('OK Pressed')},
            ],
            {cancelable: false},
          );
          this.setState({
            isLoading: false,
            disabled: false,
          });
        }
      }).catch((error) => {
        return
      });
  }
  
  gotoChat() {
    if (this.state.matchId == -1) {
      return;
    }
    var otherData = {
      imageUrl: this.state.otherData.imageUrl,
      data: {
        name: this.state.otherData.detail.name,
        other_user_id: this.state.otherData.detail.id,
        match_id: this.state.matchId, 
        coin_count: this.state.coin_count,
        fan_count: this.state.fan_count,
      }
    }
    Global.saveData.prevpage = "BrowseList"
    this.props.navigation.replace("ChatDetail", { data: otherData })
  }

  gotoReport() {
    this.props.navigation.navigate("Report", { otherId: this.state.otherData.detail.id })
  }

  becomeFan = () => {
    var details = {
      'otherId': this.state.otherData.detail.id
    };
    var formBody = [];
    for (var property in details) {
      var encodedKey = encodeURIComponent(property);
      var encodedValue = encodeURIComponent(details[property]);
      formBody.push(encodedKey + "=" + encodedValue);
    }
    formBody = formBody.join("&");
    fetch(`${SERVER_URL}/api/fan/checkFanOtherUser`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': Global.saveData.token
      },
      body: formBody,
    }).then((response) => response.json())
      .then((responseJson) => {
        if (!responseJson.error) {          
          if (responseJson.is_fan) {
            this.setState({
              fanUserVisible: true,
              noFanUserVisible: false,
            })
          } else {
            this.setState({
              fanUserVisible: false,
              noFanUserVisible: true,
            })
          }
        }
      }).catch((error) => {
        return
      });
  }

  checkCount = value => {
    if(isNaN(value))
    {
        this.setState({
            errorMsg: true,
            sendDiamondsCount: value,
            msgError: 'This field should be number.',
        })
    }
    else
    {
        if (value > Global.saveData.coin_count) {
            this.setState({
                errorMsg: true,
                sendDiamondsCount: value,
                msgError: 'You can send only ' + Global.saveData.coin_count + ' diamonds.',
            })
        } else {
            this.setState({
                errorMsg: false,
                sendDiamondsCount: value,
            })
        }
    }
  }
  
  sendDiamonds = () => {
    let { sendDiamondsCount, fanMessage } = this.state;
    if(isNaN(sendDiamondsCount))
    {
        Alert.alert(
            'Warning',
            'You must input a number.',
            [
                { text: 'Ok', onPress: () => console.log('Ok Pressed'), style: 'cancel' },
            ],
            { cancelable: false }
        );
    }
    else
    {
        if (sendDiamondsCount > Global.saveData.coin_count) {
            Alert.alert(
                'Warning',
                'You only have ' + Global.saveData.coin_count + ' diamonds.',
                [
                    { text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
                    { text: 'Buy Diamonds', onPress: () => this.gotoShop(), style: 'cancel' },
                ],
                { cancelable: false }
            );
        } else if (sendDiamondsCount == 0 || sendDiamondsCount == '') {
            Alert.alert(
                'Warning',
                'You must input a quantity of diamonds to send.',
                [
                    { text: 'Ok', onPress: () => console.log('Ok Pressed'), style: 'cancel' },
                ],
                { cancelable: false }
            );
        } else {
            var details = {
                'userName': Global.saveData.u_name,
                'otherId': this.state.otherData.detail.id,
                'otherUserName': this.state.otherData.detail.name,
                'amount': sendDiamondsCount,
                'fanMessage': fanMessage,
            };
            var formBody = [];
            for (var property in details) {
                var encodedKey = encodeURIComponent(property);
                var encodedValue = encodeURIComponent(details[property]);
                formBody.push(encodedKey + "=" + encodedValue);
            }
            formBody = formBody.join("&");
            fetch(`${SERVER_URL}/api/fan/sendDiamonds`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': Global.saveData.token
                },
                body: formBody,
            }).then((response) => response.json())
            .then((responseJson) => {
                if (!responseJson.error) {
                  if (responseJson.data.account_status == 1) {
                    if (responseJson.data.sending_available) {
                      Global.saveData.coin_count = responseJson.data.coin_count;
                      this.setState({
                        coinCount: Global.saveData.coin_count,
                        coin_count: parseInt(this.state.coin_count) + parseInt(sendDiamondsCount),
                        fan_count: responseJson.data.other_fan_count,
                      })
                    } else {
                      Alert.alert(
                          '',
                          'You cannot send diamonds.',
                          [
                              { text: 'OK', onPress: () => this.props.navigation.replace("BrowseList") },
                          ],
                          { cancelable: false },
                      );
                    }
                  } else {
                    Alert.alert(
                        '',
                        responseJson.message,
                        [],
                        { cancelable: false },
                    );
                  }
                }
            })
            .catch((error) => {
                this.setState({
                    isLoading: false,
                    disabled: false
                });
                return
            });
        }
    }
  } 

  render() {
    return (
      <View style={styles.contentContainer}>
        <StatusBar translucent={true} backgroundColor='transparent' barStyle='dark-content' />
        {this.state.flash_heart ? (
          <View>
            <Image source={flash_heart} style={{width: 300, height: 300, zIndex: 100, position: 'absolute', left: parseInt(DEVICE_WIDTH /2) - 150, top: parseInt(DEVICE_HEIGHT /2) - 150,}} />
          </View>
        ): null}
        
        {this.state.flash_reject ? (
          <View>
            <Image source={flash_reject} style={{width: 300, height: 300, zIndex: 100, position: 'absolute', left: parseInt(DEVICE_WIDTH /2) - 150, top: parseInt(DEVICE_HEIGHT /2) - 150,}} />
          </View>
        ): null}

        {this.state.flash_ban ? (
          <View>
            <Image source={ban_user} style={{width: 300, height: 300, zIndex: 100, position: 'absolute', left: parseInt(DEVICE_WIDTH /2) - 150, top: parseInt(DEVICE_HEIGHT /2) - 150,}} />
          </View>
        ): null}

        <Dialog
          visible={this.state.fanUserVisible}
          dialogAnimation={new SlideAnimation({
            slideFrom: 'top',
          })}
        >
            <View style={styles.screenOverlay}>
                <View style={styles.dialogPrompt}>
                    <Text style={[styles.bodyFont, ]}>
                        {`You have ${Global.saveData.coin_count} diamonds`}
                    </Text>
                    <View style={{ flexDirection: 'row', }}>
                      <Text style={[styles.bodyFont, ]}>
                          {`Send `}
                      </Text>
                      <View style={styles.SectionStyle}>
                        <Image source={diamond} style={{width: 25, height: 25, }} />
                        <TextInput
                            placeholder={``}
                            style={styles.textInput}
                            onChangeText={(value) => this.checkCount(value)}
                        />
                      </View>
                      <Text style={[styles.bodyFont, ]}>
                          {` Diamonds`}
                      </Text>
                    </View>                    
                    { this.state.errorMsg && <Text style={styles.requiredSent}>* {this.state.msgError} </Text> }
                    <Text style={{fontSize: 16, }}>
                        {`Write a fan message to ${this.state.otherData.detail.name} (public and optional)`}
                    </Text>
                    <TextInput
                        multiline={true}
                        numberOfLines={5}
                        style={styles.textMessageInput}
                        editable
                        onChangeText={(text) => this.setState({
                          fanMessage: text,
                        })}
                    />
                    <View style={styles.buttonsOuterView}>
                        <View style={styles.buttonsInnerView}>
                            <TouchableOpacity
                                style={[
                                    styles.button, 
                                ]}
                                onPress={ () =>
                                    this.setState({
                                        fanUserVisible: !this.state.fanUserVisible
                                    })}>
                                <Text
                                    style={[
                                        styles.cancelButtonText,
                                    ]}>
                                    {'Cancel'}
                                </Text>
                            </TouchableOpacity>
                            <View style={styles.buttonsDivider} />
                            <TouchableOpacity
                                style={[
                                    styles.button,
                                ]}
                                onPress={ () =>
                                    this.setState({
                                      fanUserVisible: !this.state.fanUserVisible
                                    }, function() {
                                        this.sendDiamonds();
                                    })
                                }>
                                <Text
                                    style={[
                                        styles.submitButtonText,
                                    ]}>
                                    {'Send'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>
        </Dialog>

        <Dialog
          visible={this.state.noFanUserVisible}
          dialogStyle={this.state.dialogStyle}
          dialogAnimation={new SlideAnimation({
            slideFrom: 'top',
          })}
        >
            <View style={styles.screenOverlay}>
                <View style={styles.dialogPrompt}>
                    <Text style={[styles.title, ]}>
                        {`Become a fan of ${this.state.otherData.detail.name} by sending diamonds!`}
                    </Text>
                    <View style={{ alignItems: 'center', justifyContent: 'center', }}>
                      <Image source={shooting_star} style={{width: 130, height: 130, marginTop: 20, }} />
                    </View>
                    <Text style={[styles.bodyFont, ]}>
                        {`You have ${Global.saveData.coin_count} diamonds`}
                    </Text>
                    <View style={{ flexDirection: 'row', }}>
                      <Text style={[styles.bodyFont, ]}>
                          {`Send `}
                      </Text>
                      <View style={styles.SectionStyle}>
                        <Image source={diamond} style={{width: 25, height: 25, }} />
                        <TextInput
                            placeholder={``}
                            style={styles.textInput}
                            onChangeText={(value) => this.checkCount(value)}
                        />
                      </View>
                      <Text style={[styles.bodyFont, ]}>
                          {` Diamonds`}
                      </Text>
                    </View>                    
                    { this.state.errorMsg && <Text style={styles.requiredSent}>* {this.state.msgError} </Text> }
                    <Text style={{fontSize: 16, }}>
                        {`Write a fan message to ${this.state.otherData.detail.name} (public and optional)`}
                    </Text>
                    <TextInput
                        multiline={true}
                        numberOfLines={5}
                        style={styles.textMessageInput}
                        editable
                        onChangeText={(text) => this.setState({
                          fanMessage: text,
                        })}
                    />
                    <View style={styles.buttonsOuterView}>
                        <View style={styles.buttonsInnerView}>
                            <TouchableOpacity
                                style={[
                                    styles.button, 
                                ]}
                                onPress={ () =>
                                    this.setState({
                                        noFanUserVisible: !this.state.noFanUserVisible
                                    })}>
                                <Text
                                    style={[
                                        styles.cancelButtonText,
                                    ]}>
                                    {'Cancel'}
                                </Text>
                            </TouchableOpacity>
                            <View style={styles.buttonsDivider} />
                            <TouchableOpacity
                                style={[
                                    styles.button,
                                ]}
                                onPress={ () =>
                                    this.setState({
                                      noFanUserVisible: !this.state.noFanUserVisible
                                    }, function() {
                                        this.sendDiamonds();
                                    })
                                }>
                                <Text
                                    style={[
                                        styles.submitButtonText,
                                    ]}>
                                    {'Send'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>
        </Dialog>

        {this.state.noMoreUsers ?
          (<Content>
            <View>
              <View style={{ alignSelf: 'flex-end', marginTop: '10%', marginRight: '5%', position: 'absolute', }}>
                <TouchableOpacity style={{ width: 60, height: 50, borderWidth: 1.5, borderRadius: 7, borderColor: '#B64F54', alignItems: 'center', justifyContent: 'center' }}
                  onPress={() => this.gotoFilter()}>
                  <Image source={b_filters} style={{ width: 25, height: 25 }} />
                </TouchableOpacity>
              </View>
              <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: '50%', paddingBottom: '50%' }}>
                <Text style={{ fontSize: 20, }}>{"Sorry, there are no more users!"}</Text>
              </View>
            </View>
          </Content>) : (
            <Content>
              {(this.state.otherData.videoUrl != null) && (
                <TouchableOpacity
                  onPress={this.gotoProfile}>
                  <Video source={{uri:this.state.otherData.videoUrl}}   // Can be a URL or a local file.
                      ref={(ref) => {
                        this.player = ref
                      }}
                      resizeMode = "cover"
                      ignoreSilentSwitch={null}
                      repeat ={true}
                      // paused={this.state.isPlayVideo} // option to play video automatically or manually
                      // onError={this.videoError}       // Callback when video cannot be loaded
                      style={{height:DEVICE_HEIGHT, width:DEVICE_WIDTH}}/>
                </TouchableOpacity>
              )}
              {this.state.otherData.imageUrl && this.state.otherData.videoUrl == null && (
                <TouchableOpacity
                  onPress={this.gotoProfile}>
                  <Image
                    source={{ uri: this.state.otherData.imageUrl }}
                    style={{ height: DEVICE_HEIGHT, width: DEVICE_WIDTH }}
                  />
                </TouchableOpacity>
              )}
              {this.state.otherData.imageUrl == null && this.state.otherData.videoUrl == null && (
                <TouchableOpacity
                  onPress={this.gotoProfile}>
                  <View style={{
                    flex: 1,
                    backgroundColor: '#989392',
                    height: DEVICE_HEIGHT,
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                      <Image
                        source={no_photo}
                        style={{ justifyContent: 'center', alignSelf: 'center', width: 200, height: 183, }}
                      />
                  </View>
                </TouchableOpacity>
              )}
              <View style={{ position: 'absolute', left: 0, top: 30 }}>
                <TouchableOpacity style={{ width: 30, height: 60, alignItems: 'center', justifyContent: 'center' }}
                  onPress={this.backPressed}>
                  <Icon type="Ionicons" name="ios-arrow-back" style={{ color: '#B64F54' }} />
                </TouchableOpacity>
              </View>
              <View style={{ position: 'absolute', left: 20, top: 40, }}>
                <Dialog
                  visible={this.state.visible}
                  dialogAnimation={new SlideAnimation({
                    slideFrom: 'bottom',
                  })}
                  footer={
                    <DialogFooter>
                      <DialogButton
                        text="Cancel"
                        onPress={() => {this.setState({visible: false})}}
                        textStyle={{color: '#000', fontSize: 14, fontWeight: 'thin'}}
                      />
                      <DialogButton
                        text="Buy Diamonds"
                        onPress={() => this.gotoShop()}
                        textStyle={{color: '#000', fontSize: 14, fontWeight: 'thin'}}
                      />
                    </DialogFooter>
                  }
                >
                  <DialogContent>
                    <Text style={{ color: '#000', fontSize: 18, marginTop: 20}}>{'You need 1 diamond to send a heart.'}</Text>
                  </DialogContent>
                </Dialog>
                <View style={{ width: DEVICE_WIDTH * 0.8, marginLeft: DEVICE_WIDTH * 0.1, flexDirection: 'row', justifyContent: 'space-between' }}>
                  <TouchableOpacity style={{ width: 60, height: 50, borderWidth: 1.5, borderRadius: 7, borderColor: '#B64F54', alignItems: 'center', justifyContent: 'center' }}
                    onPress={() => this.gotoReport()}>
                    <Image source={ b_notification } style={{ width: 25, height: 25 }} />
                  </TouchableOpacity>
                  {/* <TouchableOpacity style={{ width: 40, height: 40}}
                    onPress={() => this.gotoShop()}>
                    <View style={{ flexDirection: 'row' }}>
                      <Image source={diamond} style={{ width: 25, height: 25, marginLeft: -15, marginTop: 10 }} />
                      <Text style={{ marginLeft: 10, color: '#fff', fontSize: 12, fontWeight: 'bold', marginTop: 15 }}>{this.state.coinCount}</Text>
                    </View>
                  </TouchableOpacity> */}
                  <TouchableOpacity style={{ width: 60, height: 50, borderWidth: 1.5, borderRadius: 7, borderColor: '#B64F54', alignItems: 'center', justifyContent: 'center' }}
                    onPress={() => this.gotoFilter()}>
                    <Image source={ b_filters } style={{ width: 25, height: 25 }} />
                  </TouchableOpacity>
                </View>
                <View style={{ width: DEVICE_WIDTH * 0.8, marginLeft: DEVICE_WIDTH * 0.1, marginTop: 20, flexDirection: 'row', justifyContent: 'space-between' }}>
                  <View></View>
                  <TouchableOpacity style={{ width: 60, height: 50, borderWidth: 1.5, borderRadius: 7, borderColor: '#B64F54', alignItems: 'center', justifyContent: 'center' }}
                    onPress={() => this.becomeFan()}>
                    <Image source={yellow_star} style={{ width: 35, height: 35 }} />
                  </TouchableOpacity>
                </View>
                { (Global.saveData.is_admin === 1) && (
                <View style={{ width: DEVICE_WIDTH * 0.8, marginLeft: DEVICE_WIDTH * 0.1, marginTop: 20, flexDirection: 'row', justifyContent: 'space-between' }}>
                  <View></View>
                  <TouchableOpacity style={{ width: 60, height: 50, borderWidth: 1.5, borderRadius: 7, borderColor: '#B64F54', alignItems: 'center', justifyContent: 'center' }}
                    onPress={this.banUser}>
                    <Image source={ban_user} style={{ width: 25, height: 25 }} />
                  </TouchableOpacity>
                </View>
                )}
              </View>
              <View style={{ position: 'absolute', left: 0, bottom: 40 }}>
                <View style={{ marginLeft: DEVICE_WIDTH * 0.1, marginBottom: 20 }}>
                  <View style={{ flexDirection: 'row' }}>
                    <Image source={b_name} style={{ width: 15, height: 15 }} />
                    <Text style={{ marginLeft: 10, color:'#fff', fontSize: 12, fontWeight: 'bold', }}>{this.state.otherData.detail.name}</Text>
                    <Image source={diamond} style={{ marginLeft: 10, width: 15, height: 15, marginTop: 2, }} />
                    <Text style={{ color:'#fff', fontSize: 12, fontWeight: 'bold' }}>{this.state.coin_count}</Text>
                    <Image source={yellow_star} style={{ marginLeft: 10, width: 15, height: 15, marginTop: 2, }} />
                    <Text style={{ color:'#fff', fontSize: 12, fontWeight: 'bold', marginTop: 2, }}>{this.state.fan_count}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', marginTop: 5 }}>
                    <Image source={b_age} style={{ width: 15, height: 16 }} />
                    <Text style={{ marginLeft: 10, color:'#fff', fontSize: 12, fontWeight: 'bold' }}>{this.state.otherData.detail.age + ' years old'}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', marginTop: 5 }}>
                    <Image source={diamond} style={{ width: 15, height: 15, marginTop: 3, }} />
                    <Text style={{ marginLeft: 10, color:'#fff', fontSize: 12, fontWeight: 'bold' }}>{this.state.otherData.detail.coin_per_message + ' per message'}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', marginTop: 5 }}>
                    <Image source={b_distance} style={{ width: 15, height: 15 }} />
                    <Text style={{ marginLeft: 10, color:'#fff', fontSize: 12, fontWeight: 'bold' }}>{((parseInt(this.state.otherData.detail.distance) != 0)? parseInt(this.state.otherData.detail.distance): 'unknown') + ' mile'}</Text>
                  </View>
                  <View style={{ flexDirection: 'column', marginTop: 5 }}>
                    <Text>
                      <Text style={{ marginTop: 5, color:'#fff', fontSize: 12, fontWeight: 'bold' }}>{this.state.otherData.detail.gender === 1 ? 'Male, ' : 'Female, '}</Text>
                      <Text style={{ marginTop: 5, color:'#fff', fontSize: 12, fontWeight: 'bold' }}>{this.state.otherData.detail.ethnicity_name}</Text>
                      <Text style={{ marginTop: 5, color:'#fff', fontSize: 12, fontWeight: 'bold' }}>{', speaks ' + this.state.otherData.detail.language_name}</Text>
                    </Text>
                    <Text style={{ marginTop: 5, color:'#fff', fontSize: 12, fontWeight: 'bold' }}>{this.state.otherData.detail.last_loggedin_date + ', ' + this.state.otherData.detail.country_name}</Text>
                  </View>
                  <View style={{ marginTop: 10, marginRight: 20 }}>
                    <ScrollView contentContainerStyle={{ paddingVertical: 20 }} style={{ maxHeight: DEVICE_HEIGHT * 0.3 }}>
                      <Text style={{ fontSize: 12, fontWeight: 'bold', color:'#fff'}}>{this.state.otherData.detail.description}</Text>
                    </ScrollView>
                  </View>
                </View>
                <View style={{ width: DEVICE_WIDTH * 0.8, marginLeft: DEVICE_WIDTH * 0.1, flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Button
                    icon={
                      <Icon type="FontAwesome" name={this.state.hateIcon} style={{ color: '#B64F54' }} />
                    }
                    buttonStyle={{ width: 60, height: 60, borderRadius: 50, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' }}
                    loading={this.state.isLoading}
                    onPress={() => this.onReject()}
                  />
                  <TouchableOpacity 
                    style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: '#cc2e48', alignItems: 'center', justifyContent: 'center' }}
                    onPress={() => this.instantChat()}
                    >
                    <Image source={b_chat} style={{width : 30, height: 30 }} />
                  </TouchableOpacity>
                  <Button
                    icon={
                      <Icon type="FontAwesome" name={this.state.heartIcon} style={{ color: '#fff' }} />
                    }
                    buttonStyle={{ width: 60, height: 60, borderRadius: 50, backgroundColor: '#B64F54', alignItems: 'center', justifyContent: 'center' }}
                    loading={this.state.isLoading}
                    onPress={() => this.onHeart()}
                  />
                </View>
              </View>
            </Content>
          )}
      </View>
    );
  }
}
const DEVICE_WIDTH = Dimensions.get('window').width;
const DEVICE_HEIGHT = Dimensions.get('window').height;
const styles = StyleSheet.create({
  contentContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: '#fff',
  },
  instructions: {
    textAlign: 'center',
    color: '#3333ff',
    marginBottom: 5,
  },
  requiredSent: {
    textAlign: 'center',
    color: 'red',    
    fontSize: 12,
    marginBottom: 5,
  },
  ringIcon: {
      width: 40,
      height: 40,
      marginLeft: 10,
      marginTop: 5,
  },
  ringIconTouch: {
      width: 40,
      height: 40,
      marginLeft: 10,
      marginTop: 5,
      height: 45,
  },
  screenOverlay: {
    height: Dimensions.get("window").height,
    backgroundColor: "black",
    opacity: 0.9
  },
  dialogPrompt: {
    ...Platform.select({
      ios: {
        opacity: 0.9,
        backgroundColor: "rgb(222,222,222)",
        borderRadius: 15
      },
      android: {
        borderRadius: 5,
        backgroundColor: "white"
      }
    }),
    marginHorizontal: 20,
    marginTop: 150,
    padding: 10,
  },
  title: {
    fontWeight: "bold",
    fontSize: 16,
    color: "black"
  },
  bodyFont: {
    fontSize: 16,
    color: "black",
    marginTop: 20, 
  },
  textMessageInput: {
    marginTop: 10,
    height: 80,
    width: DEVICE_WIDTH * 0.8,
    paddingHorizontal: 10,
    textAlignVertical: "top",
    borderWidth: 0.5,
    borderColor: '#000',
    ...Platform.select({
      ios: {
        borderRadius: 15,
        backgroundColor: "rgba(166, 170, 172, 0.9)"
      },
      android: {
        borderRadius: 10,
        backgroundColor: "white",
      }
    })
  },
  textInput: {
    height: 40,
    width: 60,
    paddingHorizontal: 10,
    textAlignVertical: "bottom",
    ...Platform.select({
      ios: {
        borderRadius: 15,
        backgroundColor: "rgba(166, 170, 172, 0.9)"
      },
      android: {}
    })
  },
  buttonsOuterView: {
    flexDirection: "row",
    ...Platform.select({
      ios: {},
      android: {
        justifyContent: "flex-end"
      }
    }),
    width: "100%"
  },
  buttonsDivider: {
    ...Platform.select({
      ios: {
        width: 1,
        backgroundColor: "rgba(0,0,0,0.5)"
      },
      android: {
        width: 20
      }
    })
  },
  buttonsInnerView: {
    flexDirection: "row",
    ...Platform.select({
      ios: {
        borderTopWidth: 0.5,
        flex: 1
      },
      android: {}
    })
  },
  button: {
    flexDirection: "column",
    justifyContent: "center",

    alignItems: "center",
    ...Platform.select({
      ios: { flex: 1 },
      android: {}
    }),
    marginTop: 5,
    padding: 10
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#61bfa9"
  },
  submitButtonText: {
    color: "#61bfa9",
    fontWeight: "600",
    fontSize: 16
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
export default Browse;
