import React, { Component } from "react";
import {
  Icon,
  Text,
  Content,
} from "native-base";
import {
  BackHandler,
  Image,
  Dimensions,
  View,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Alert,
  TextInput,
  Platform,
  Keyboard,
} from "react-native";
import Dialog, { DialogFooter, DialogButton, DialogContent, SlideAnimation } from 'react-native-popup-dialog';
import Video from 'react-native-video';

import b_notification from '../../assets/images/notification.png';
import b_name from '../../assets/images/name.png';
import b_age from '../../assets/images/age.png';
import b_distance from '../../assets/images/distance.png';
import b_profile from '../../assets/images/profile.png';
import no_photo from '../../assets/images/no_photo.png';
import diamond from '../../assets/images/red_diamond_trans.png';
import yellow_star from '../../assets/images/yellow_star.png';
import line_star from '../../assets/images/line_star.png';
import shooting_star from '../../assets/images/shooting_star.png';
import accept from '../../assets/images/accept.png';
import Global from '../Global';

import { SERVER_URL } from '../../config/constants';

class IncomeDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      paused: false,
      vUrl: '',
      username: '',
      userage: '',
      userimage: '',
      matchId: -1,
      userdistance: '',
      description: '',
      otherId: -1,
      coin_count: 0,
      fan_count: 0,
      coin_per_message: 0,
      isMatchVideo: false,
      privatedPaused: false,
      isOperating: false,
      coinCount: Global.saveData.coin_count,
      visible: false,
      age: 0,
      gender: 0,
      distance: 0,
      country_name: '',
      ethnicity_name: '',
      language_name: '',
      last_loggedin_date: '',
      fanUserVisible: false,
      noFanUserVisible: false,
      errorMsg: false,
      msgError: '',
      sendDiamondsCount: 0,
      fanMessage: '',
      content_type: 0,
    };
  }

  static navigationOptions = {
    header: null
  };

  componentWillMount() {
    Global.saveData.nowPage = 'IncomeDetail';
    BackHandler.addEventListener('hardwareBackPress', this.back);
    if (Global.saveData.prePage == "Profile") {
      Global.saveData.prePage = "";
      this.setState({
        vUrl: Global.saveData.prevUrl,
        otherId: Global.saveData.preOtherId,
        isMatchVideo: Global.saveData.isMatchVideo,
        username: Global.saveData.prename,
        userage: Global.saveData.preage,
        userimage: Global.saveData.preimage,
        matchId: Global.saveData.prematchID,
        userdistance: Global.saveData.preuserdistance
      });
    } else {
      Global.saveData.prevUrl = this.props.navigation.state.params.url;
      Global.saveData.preOtherId = this.props.navigation.state.params.otherId;
      Global.saveData.prename = this.props.navigation.state.params.name;
      Global.saveData.preage = this.props.navigation.state.params.age;
      Global.saveData.preimage = this.props.navigation.state.params.imageUrl;
      Global.saveData.prematchID = this.props.navigation.state.params.mid;
      Global.saveData.preuserdistance = parseInt(this.props.navigation.state.params.distance);

      this.setState({
        vUrl: this.props.navigation.state.params.videoUrl,
        otherId: this.props.navigation.state.params.otherId,
        isMatchVideo: Global.saveData.isMatchVideo,
        username: this.props.navigation.state.params.name,
        userage: this.props.navigation.state.params.age,
        userimage: this.props.navigation.state.params.imageUrl,
        matchId: this.props.navigation.state.params.mid,
        userdistance: parseInt(this.props.navigation.state.params.distance),
        description: this.props.navigation.state.params.description,
        coin_count: this.props.navigation.state.params.coin_count,
        fan_count: this.props.navigation.state.params.fan_count,
        coin_per_message: this.props.navigation.state.params.coin_per_message,
        content_type: this.props.navigation.state.params.content_type,
      });
    }
  }
  componentDidMount() {
    this.props.navigation.addListener('didFocus', (playload) => {
      this.setState({ paused: false, privatedPaused: false });
    });

    fetch(`${SERVER_URL}/api/transaction/getDiamondCount`, {
      method: 'POST',
      headers: {
          'Content-type': 'application/x-www-form-urlencoded',
          'Authorization': Global.saveData.token
      }
    }).then((response) => response.json())
      .then((responseJson) => {
        if (!responseJson.error) {
            Global.saveData.coin_count = responseJson.data.coin_count;
            this.setState({
              coinCount: Global.saveData.coin_count,
            });
        }
      })
      .catch((error) => {
        return
      });

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
    BackHandler.removeEventListener('hardwareBackPress', this.back);
  }
  gotoChat() {
    if (this.state.matchId == -1) {
      return;
    }
    this.setState({ paused: true, privatedPaused: true });
    var otherData = {
      imageUrl: this.state.userimage,
      data: {
        name: this.state.username,
        other_user_id: this.state.otherId,
        match_id: this.state.matchId,
        coin_count: this.state.coin_count,
        fan_count: this.state.fan_count,
        coin_per_message: this.state.coin_per_message,
      }
    }
    Global.saveData.prevpage = "IncomeDetail"
    this.props.navigation.navigate("ChatDetail", { data: otherData })
  }
  onReject() {
    this.setState({
      isOperating: true
    });
    var details = {
      'otherId': this.state.otherId
    };
    var formBody = [];
    for (var property in details) {
      var encodedKey = encodeURIComponent(property);
      var encodedValue = encodeURIComponent(details[property]);
      formBody.push(encodedKey + "=" + encodedValue);
    }
    formBody = formBody.join("&");
    fetch(`${SERVER_URL}/api/match/sendHeartReject`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': Global.saveData.token
      },
      body: formBody,
    }).then((response) => response.json())
      .then((responseJson) => {
        if (!responseJson.error) {
          this.setState({
            paused: true
          });
          this.props.navigation.replace("Income");
        }
      })
      .catch((error) => {
        return
      });
    this.setState({ isOperating: false });
  }
  onMatch() {
    this.setState({
      paused: true,
      isOperating: true
    });
    var details = {
      'otherId': this.state.otherId
    };
    var formBody = [];
    for (var property in details) {
      var encodedKey = encodeURIComponent(property);
      var encodedValue = encodeURIComponent(details[property]);
      formBody.push(encodedKey + "=" + encodedValue);
    }
    formBody = formBody.join("&");
    fetch(`${SERVER_URL}/api/match/requestMatch`, {
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
            this.setState({
              matchId: responseJson.data.match_id,
              isMatchVideo: true,
              privatedPaused: false
            });
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
        }
      }).catch((error) => {
        alert(JSON.stringify(error));
        return
      });
    this.setState({ isOperating: false });
  }
  getMatchedVideo = (cdnId, matchId) => {
    fetch("http://138.197.203.178:8080/api/storage/videoLink?fileId=" + cdnId + "-thumbnail", {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': Global.saveData.token
      }
    }).then((t_response) => t_response.json())
      .then((t_responseJson) => {
        if (t_responseJson.url) {
          Global.saveData.prevUrl = t_responseJson.url;
          this.setState({
            vUrl: null,
            userimage: t_responseJson.url,
            matchId: matchId,
            isMatchVideo: true,
            privatedPaused: false
          });
        }
      }).catch((error) => {
        alert(JSON.stringify(error));
        return
      });
  }
  gotoProfile() {
    this.setState({ paused: true });
    if (this.state.otherId != -1) {
      Global.saveData.prevpage = "IncomeDetail";
      Global.saveData.isMatchVideo = this.state.isMatchVideo;

      fetch(`${SERVER_URL}/api/match/getOtherUserData/${this.state.otherId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': Global.saveData.token
        }
      }).then((response) => response.json())
        .then((responseJson) => {
          if (!responseJson.error) {
            let newData = responseJson.data;

            this.setState({
              age: newData.age,
              gender: newData.gender,
              distance: newData.distance,
              country_name: newData.country_name,
              ethnicity_name: newData.ethnicity_name,
              language_name: newData.language_name,
              last_loggedin_date: newData.last_loggedin_date,
              coin_count: newData.coin_count,
              fan_count: newData.fan_count,
              coin_per_message: newData.coin_per_message,
            });
            
            this.props.navigation.replace("Profile", { 
              data: {
                id: this.state.otherId, 
                name: this.state.username, 
                isMatched: this.state.isMatchVideo, 
                description: this.state.description,
                mid: this.state.matchId,
                age: this.state.age,
                gender: this.state.gender,
                distance: this.state.distance,
                country_name: this.state.country_name,
                ethnicity_name: this.state.ethnicity_name,
                language_name: this.state.language_name,
                last_loggedin_date: this.state.last_loggedin_date,
                imageUrl: this.state.userimage,
                coin_count: this.state.coin_count,
                fan_count: this.state.fan_count,
                coin_per_message: this.state.coin_per_message,
                videoUrl: this.state.vUrl,
                content_type: this.state.content_type,
              }
            });
          }
        }).catch((error) => {
          return
        });
    }
  }
  back = () => {
    if (this.state.isMatchVideo === true) {
      this.props.navigation.replace("Match");
    } else {
      this.props.navigation.replace("Income");
    }
  }
  gotoShop = () => {
    this.setState({
      visible: false
    })
    if (this.state.isMatchVideo === true) {
      Global.saveData.nowPage = "Match";
    } else {
      Global.saveData.nowPage = "Income";
    }
    this.props.navigation.navigate('screenGpay01');
  }
  gotoReport() {
    if (this.state.otherId != -1) {
      this.props.navigation.navigate("Report", { otherId: this.state.otherId });
    }
  }

  becomeFan = () => {
    var details = {
      'otherId': this.state.otherId
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
            'You must input only number.',
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
                'You only have ' + Global.saveData.coin_count + ' diamonds available. You need more diamonds.',
                [
                    { text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
                    { text: 'Buy Diamonds', onPress: () => this.gotoShop(), style: 'cancel' },
                ],
                { cancelable: false }
            );
        } else if (sendDiamondsCount == 0 || sendDiamondsCount == '') {
            Alert.alert(
                'Warning',
                'At least one diamond must be sent.',
                [
                    { text: 'Ok', onPress: () => console.log('Ok Pressed'), style: 'cancel' },
                ],
                { cancelable: false }
            );
        } else {
            var details = {
                'userName': Global.saveData.u_name,
                'otherId': this.state.otherId,
                'otherUserName': this.state.username,
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
                        {`Write a fan message to ${this.state.username} (public and optional)`}
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
                        {`Become a fan of ${this.state.username} by sending diamonds!`}
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
                        {`Write a fan message to ${this.state.username} (public and optional)`}
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

        <Content>
          {(this.state.vUrl != null) && (
            <TouchableOpacity
              onPress={() => this.gotoProfile()}>
              <Video source={{uri:this.state.vUrl}}   // Can be a URL or a local file.
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
          {!this.state.isMatchVideo && this.state.vUrl == null && (
            this.state.userimage ? (              
              <TouchableOpacity
                onPress={() => this.gotoProfile()}>
                <Image
                  source={{ uri: this.state.userimage }}
                  style={{ height: DEVICE_HEIGHT, width: DEVICE_WIDTH }}
                />
              </TouchableOpacity>
            ) : (             
              <TouchableOpacity
                onPress={() => this.gotoProfile()}>
                <View style={{
                  flex: 1,
                  backgroundColor: '#989392',
                  height: DEVICE_HEIGHT,
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Image
                    source={no_photo}
                    style={{ justifyContent: 'center', alignSelf: 'center', width: 200, height: 183,  }}
                  />
                </View>
              </TouchableOpacity>
            )
          )}
          {this.state.isMatchVideo && (
            this.state.userimage ? (            
              <TouchableOpacity
                onPress={() => this.gotoProfile()}>
                <Image
                  source={{ uri: this.state.userimage }}
                  style={{ height: DEVICE_HEIGHT, width: DEVICE_WIDTH }}
                />
              </TouchableOpacity>
            ) : (          
              <TouchableOpacity
                onPress={() => this.gotoProfile()}>
                <View style={{
                  flex: 1,
                  backgroundColor: '#989392',
                  height: DEVICE_HEIGHT,
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Image
                    source={no_photo}
                    style={{ justifyContent: 'center', alignSelf: 'center', width: 200, height: 183,  }}
                  />
                </View>
              </TouchableOpacity>
            )
          )}
        </Content>
        <View style={{ position: 'absolute', left: 0, top: 30 }}>
          <TouchableOpacity style={{ width: 60, height: 60, alignItems: 'center', justifyContent: 'center' }}
            onPress={() => this.back()}>
            <Icon type="Ionicons" name="ios-arrow-back" style={{ color: '#B64F54' }} />
          </TouchableOpacity>
        </View>
        <View style={{ position: 'absolute', left: 20, top: 40 }}>
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
              <Image source={ b_notification} style={{ width: 25, height: 25 }} />
            </TouchableOpacity>
            {/* <TouchableOpacity style={{ width: 40, height: 40}}
              onPress={() => this.gotoShop()}>
              <View style={{ flexDirection: 'row' }}>
                <Image source={diamond} style={{ width: 25, height: 25, marginLeft: -15, marginTop: 10 }} />
                <Text style={{ marginLeft: 10, color:'#fff', fontSize: 12, fontWeight: 'bold', marginTop: 15 }}>{this.state.coinCount}</Text>
              </View>
            </TouchableOpacity> */}
            <TouchableOpacity style={{ width: 60, height: 50, borderWidth: 1.5, borderRadius: 7, borderColor: '#B64F54', alignItems: 'center', justifyContent: 'center' }}
              onPress={() => this.gotoProfile()}>
              <Image source={b_profile} style={{ width: 30, height: 30 }} />
            </TouchableOpacity>
          </View>
          <View style={{ width: DEVICE_WIDTH * 0.8, marginLeft: DEVICE_WIDTH * 0.1, marginTop: 20, flexDirection: 'row', justifyContent: 'space-between' }}>
            <View></View>
            <TouchableOpacity style={{ width: 60, height: 50, borderWidth: 1.5, borderRadius: 7, borderColor: '#B64F54', alignItems: 'center', justifyContent: 'center' }}
              onPress={() => this.becomeFan()}>
              <Image source={yellow_star} style={{ width: 35, height: 35 }} />
            </TouchableOpacity>
          </View>
        </View>
        <View style={{ position: 'absolute', left: 0, bottom: 40 }}>
          <View style={{ marginLeft: DEVICE_WIDTH * 0.1, marginBottom: 20, flexDirection:'column' }}>
            <View style={{ flexDirection: 'row' }}>
              <Image source={b_name} style={{ width: 15, height: 15 }} />
              <Text style={{ marginLeft: 10, color:'#fff', fontSize: 12, fontWeight: 'bold' }}>{this.state.username}</Text>
              <Image source={diamond} style={{ marginLeft: 10, width: 15, height: 15, marginTop: 2, }} />
              <Text style={{ color:'#fff', fontSize: 12, fontWeight: 'bold' }}>{this.state.coin_count}</Text>
              <Image source={yellow_star} style={{ marginLeft: 10, width: 15, height: 15, }} />
              <Text style={{ color:'#fff', fontSize: 12, fontWeight: 'bold' }}>{this.state.fan_count}</Text>
            </View>
            <View style={{ flexDirection: 'row', marginTop: 5 }}>
              <Image source={b_age} style={{ width: 15, height: 16 }} />
              <Text style={{ marginLeft: 10, color:'#fff', fontSize: 12, fontWeight: 'bold' }}>{this.state.userage + ' years old'}</Text>
            </View>
            <View style={{ flexDirection: 'row', marginTop: 5 }}>
              <Image source={b_distance} style={{ width: 15, height: 15 }} />
              <Text style={{ marginLeft: 10, color:'#fff', fontSize: 12, fontWeight: 'bold' }}>{((this.state.userdistance != 0)? this.state.userdistance: 'unknown') + ' mile'}</Text>
            </View>
            <View style={{ flexDirection: 'row', marginTop: 5 }}>
              <Image source={diamond} style={{ width: 15, height: 15, marginTop: 3, }} />
              <Text style={{ marginLeft: 10, color:'#fff', fontSize: 12, fontWeight: 'bold' }}>{this.state.coin_per_message + ' per message'}</Text>
            </View>
            <View style={{ flexDirection: 'column', marginTop: 5 }}>
              <Text>
                <Text style={{ marginTop: 5, color:'#fff', fontSize: 12, fontWeight: 'bold' }}>{this.props.navigation.state.params.gender === 1 ? 'Male, ' : 'Female, '}</Text>
                <Text style={{ marginTop: 5, color:'#fff', fontSize: 12, fontWeight: 'bold' }}>{this.props.navigation.state.params.ethnicity_name}</Text>
                <Text style={{ marginTop: 5, color:'#fff', fontSize: 12, fontWeight: 'bold' }}>{', speaks ' + this.props.navigation.state.params.language_name}</Text>
              </Text>
              <Text style={{ marginTop: 5, color:'#fff', fontSize: 12, fontWeight: 'bold' }}>{this.props.navigation.state.params.last_loggedin_date + ', ' + this.props.navigation.state.params.country_name}</Text>
            </View>
            <View style={{ marginTop: 10 }}>
              <ScrollView contentContainerStyle={{ paddingVertical: 20 }} style={{ maxHeight: DEVICE_HEIGHT * 0.3 }}>
                <Text style={{ fontSize: 12, fontWeight: 'bold', color:'#fff' }}>{this.state.description}</Text>
              </ScrollView>
            </View>
            <View style={{ width: DEVICE_WIDTH * 0.5, marginLeft: DEVICE_WIDTH * 0.15, flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
              {!this.state.isMatchVideo && (
                <View style={{ width: DEVICE_WIDTH * 0.5, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <TouchableOpacity style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' }}
                    onPress={() => this.onReject()}>
                    <Icon type="FontAwesome" name="close" style={{ color: '#B64F54' }} />
                  </TouchableOpacity>
                  <TouchableOpacity style={{ width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center' }}
                    onPress={() => this.onMatch()}>
                    {/* <Icon type="FontAwesome" name="heart" style={{ color: '#fff' }} /> */}
                    <Image source={accept} style={{width: 62, height: 62}} />
                  </TouchableOpacity>
                </View>)}
              {this.state.isMatchVideo && (
                <View style={{width:'100%', height:40, justifyContent:'center', alignItems:'center', }}>
                  <TouchableOpacity
                    style={{
                      width: DEVICE_WIDTH * 0.5,
                      height: 40,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: '#B64F54',
                      borderRadius: DEVICE_WIDTH * 0.25
                    }}
                    onPress={() => this.gotoChat()}>
                    <Text style={{ color: '#fff', fontSize: 16 }}>{"Start Chat!"}</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </View>
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
export default IncomeDetail;
