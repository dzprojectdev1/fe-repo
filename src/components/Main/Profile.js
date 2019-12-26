import React, { Component } from "react";
import {
  Icon,
  Text,
} from "native-base";
import {
  ActivityIndicator,
  ImageBackground,
  ScrollView,
  Platform,
  Dimensions,
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar, 
  Image,
  Modal,
  Alert,
  TextInput,
  Keyboard,
} from "react-native";
import Dialog, { DialogFooter, DialogButton, DialogContent, SlideAnimation } from 'react-native-popup-dialog';
import FlashMessage, { showMessage } from 'react-native-flash-message';

import search_photo from '../../assets/images/search_photo.png';
import bg from '../../assets/images/bg.jpg';
import ban_user from '../../assets/images/ban_user.png';
import ban_user_red from '../../assets/images/ban_user_red.png';
import diamond from '../../assets/images/red_diamond_trans.png';
import yellow_star from '../../assets/images/yellow_star.png';
import yellow_star_black from '../../assets/images/yellow_star_black.png';
import line_star from '../../assets/images/line_star.png';
import shooting_star from '../../assets/images/shooting_star.png';
import crown from '../../assets/images/crown.png';
import hiddenMan from '../../assets/images/hidden_man.png';
import admirable from '../../assets/images/admirable_icon.png';
import collapse from '../../assets/images/collapse.png';
import expand from '../../assets/images/expand.png';
import video_player from '../../assets/images/video_player.png';
import Global from '../Global';

import { SERVER_URL, GCS_BUCKET } from '../../config/constants';

class Profile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      id: '',
      name: '',
      datas: [],
      fanUsers: [],
      mutualUsers: [],
      fanUsersCount: 0,
      mutualUsersCount: 0,
      isLoading: true,
      noData: false,
      otherData: props.navigation.state.params.data,
      coin_count: props.navigation.state.params.data.coin_count,
      fan_count: props.navigation.state.params.data.fan_count,
      coin_per_message: props.navigation.state.params.data.coin_per_message,
      fullImage: false,
      flash_ban: false,
      fanUserVisible: false,
      noFanUserVisible: false,
      errorMsg: false,
      msgError: '',
      sendDiamondsCount: 0,
      fanMessage: '',
      showTip: false,
      otherSelectedUserName: '',
      showFanUsers: false,
      showMutualUsers: false,
      dialogStyle: {},
    };
  }

  static navigationOptions = {
    header: null
  };
  componentDidMount() {
    Global.saveData.nowPage = 'Profile';
    var otherid = this.state.otherData.id;
    var othername = this.state.otherData.name;

    this.setState({ id: otherid, name: othername });
    this.getVideos(otherid);
    
    this.getBiggestFanUsers();

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

  getBiggestFanUsers = () => {
    var details = {
      'otherId': this.state.otherData.id,
    };
    var formBody = [];
    for (var property in details) {
      var encodedKey = encodeURIComponent(property);
      var encodedValue = encodeURIComponent(details[property]);
      formBody.push(encodedKey + "=" + encodedValue);
    }
    formBody = formBody.join("&");
    fetch(`${SERVER_URL}/api/fan/getBiggestFanUsers`, {
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
            fanUsers: responseJson.data.fanUsers,
            mutualUsers: responseJson.data.mutualUsers,
            fanUsersCount: responseJson.data.fanUsers.length,
            mutualUsersCount: responseJson.data.mutualUsers.length,
          })
        }
      })
      .catch((error) => {
        // alert(JSON.stringify(error));
        return
      });
  }

  getVideos(otherid) {
    fetch(`${SERVER_URL}/api/video/othervideo/${otherid}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': Global.saveData.token
      }
    }).then((response) => response.json())
      .then((responseJson) => {
        if (!responseJson.error) {
          if (responseJson.data.length) {
            this.getTumbnails(responseJson.data)
          } else {
            this.setState({
              noData: true,
              isLoading: false
            });
          }
        }
      })
      .catch((error) => {
        this.setState({
          noData: false,
          isLoading: false
        });
        return
      });
  }

  getTumbnails = async (data) => {

    var list_items = [];
    for (var i = 0; i < data.length; i++) {
      var value = Object.values(data[i]);
      if (data[i].cdn_id && data[i].content_type == 1) {
        list_items.push({
          index: i,
          otherId: data[i].other_user_id,
          imageUrl: GCS_BUCKET + value[0] + '-screenshot',
          videoUrl: null,
          content_type: 1,
          name: 'NAME',
          time: 'TIME'
        });
      } else if (data[i].cdn_id && data[i].content_type == 2) {

        var v_url = `${SERVER_URL}/api/storage/videoLink?fileId=` + data[i].cdn_id;
        await fetch(v_url, {
            method: 'GET',
            headers: { 
                'Content-Type':'application/json',
                'Authorization':Global.saveData.token
            }
        }).then((response) => response.json())
            .then((responseJson) => {
              list_items.push({
                index: i,
                otherId: data[i].other_user_id,
                imageUrl: data[i].cdn_id_128,
                videoUrl: responseJson.url,
                content_type: 2,
                name: 'NAME',
                time: 'TIME'
              });
            })
            .catch((error) => {
                alert("There is error, please try again!")
                return
        });
      } else {
        list_items.push({
          index: i,
          otherId: data[i].other_user_id,
          imageUrl: null,
          videoUrl: null,
          content_type: 0,
          name: 'NAME',
          time: 'TIME'
        });
      }
    }
    this.setState({
      datas: list_items,
      noData: false,
      isLoading: false
    });
  }

  showUserVideo(index, url, otherId, datas) {
    this.props.navigation.navigate("ProfileDetail", { index: index, url: url, otherId: otherId, datas: datas })
  }

  onBack() {
    if (Global.saveData.prevpage == "ChatDetail") {
      this.props.navigation.replace(Global.saveData.prevpage, {
        data: {
          imageUrl: this.state.otherData.imageUrl,
          data: { 
            other_user_id: this.state.otherData.id, 
            name: this.state.otherData.name, 
            description: this.state.otherData.description,
            match_id: this.state.otherData.matchId,
            coin_count: this.state.coin_count,
            fan_count: this.state.fan_count,
            coin_per_message: this.state.coin_per_message,
          }
        }
      });
    } else if (Global.saveData.prevpage == "Browse" || Global.saveData.prevpage == "Profile") {
      this.props.navigation.replace('Browse', {
        data: {
          imageUrl: this.state.otherData.imageUrl,
          isMatched: this.state.otherData.isMatched, 
          videoUrl: this.state.otherData.videoUrl,
          detail: { 
            id: this.state.otherData.id, 
            name: this.state.otherData.name, 
            description: this.state.otherData.description,
            age: this.state.otherData.age,
            distance: this.state.otherData.distance,
            gender: this.state.otherData.gender,
            last_loggedin_date: this.state.otherData.last_loggedin_date,
            country_name: this.state.otherData.country_name,
            ethnicity_name: this.state.otherData.ethnicity_name,
            language_name: this.state.otherData.language_name,
            coin_count: this.state.coin_count,
            fan_count: this.state.fan_count,
            coin_per_message: this.state.coin_per_message,
          }
        }
      });
    } else if (Global.saveData.prevpage == "IncomeDetail") {
      this.props.navigation.replace(Global.saveData.prevpage, {
        url: null,
        imageUrl: this.state.otherData.imageUrl,
        isMatched: this.state.otherData.isMatched, 
        otherId: this.state.otherData.id, 
        name: this.state.otherData.name, 
        description: this.state.otherData.description,
        age: this.state.otherData.age,
        distance: this.state.otherData.distance,
        gender: this.state.otherData.gender,
        last_loggedin_date: this.state.otherData.last_loggedin_date,
        mid: this.state.otherData.mid,
        country_name: this.state.otherData.country_name,
        ethnicity_name: this.state.otherData.ethnicity_name,
        language_name: this.state.otherData.language_name,
        coin_count: this.state.coin_count,
        fan_count: this.state.fan_count,
        coin_per_message: this.state.coin_per_message,
        videoUrl: this.state.otherData.videoUrl,
        content_type: this.state.otherData.content_type,
      });
    } else if (Global.saveData.prevpage == "MyVideo") {
      this.props.navigation.replace(Global.saveData.prevpage);
    } else {
      this.props.navigation.pop();
    }
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
      flash_ban: true,
    });
    var details = {
      'otherId': this.state.otherData.id,
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
        this.setState({
          flash_ban: false,
        });
        if (!responseJson.error) {
          this.props.navigation.replace("BrowseList");
        }
      })
      .catch((error) => {
        this.setState({
          flash_ban: false,
        });
        return
      });
  }

  becomeFan = () => {
    var details = {
      'otherId': this.state.otherData.id
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
            msgError: 'This field should be a number.',
        })
    }
    else
    {
        if (value > Global.saveData.coin_count) {
            this.setState({
                errorMsg: true,
                sendDiamondsCount: value,
                msgError: 'You only have ' + Global.saveData.coin_count + ' diamonds available to send.',
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
            'Invalid input',
            'You must input a valid number of diamonds to send.',
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
                'Insufficient diamonds',
                'You only have ' + Global.saveData.coin_count + ' diamonds available. You need more diamonds.',
                [
                    { text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
                    { text: 'Buy Diamonds', onPress: () => this.gotoShop(), style: 'cancel' },
                ],
                { cancelable: false }
            );
        } else if (sendDiamondsCount == 0 || sendDiamondsCount == '') {
            Alert.alert(
                'Invalid input',
                'You must send one or more diamonds.',
                [
                    { text: 'Ok', onPress: () => console.log('Ok Pressed'), style: 'cancel' },
                ],
                { cancelable: false }
            );
        } else {
            var details = {
                'userName': Global.saveData.u_name,
                'otherId': this.state.otherData.id,
                'otherUserName': this.state.otherData.name,
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
                        coin_count: parseInt(this.state.coin_count) + parseInt(sendDiamondsCount),
                        fan_count: responseJson.data.other_fan_count,
                      })
                      this.getBiggestFanUsers();
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

  gotoBrowsDetail = row => {
    Global.saveData.prevpage = "Profile";

    if (Global.saveData.u_id == row.userId) {
      this.props.navigation.replace('MyVideo');
    } else {
      fetch(`${SERVER_URL}/api/match/getOtherUserData/${row.userId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': Global.saveData.token
          }
        }).then((response) => response.json())
          .then((responseJson) => {
            if (!responseJson.error) {
              let newData = responseJson.data;
              if (row.contentType == 2) {
                var v_url = `${SERVER_URL}/api/storage/videoLink?fileId=` + row.imgUrl;
                fetch(v_url, {
                    method: 'GET',
                    headers: { 
                        'Content-Type':'application/json',
                        'Authorization':Global.saveData.token
                    }
                }).then((response) => response.json())
                    .then((responseJson) => {
                        this.props.navigation.replace("Browse", { 
                          data: {
                            imageUrl: (row.imgUrl !== '' && row.imgUrl !== null) ? GCS_BUCKET + row.imgUrl + '-screenshot': null,
                            videoUrl: responseJson.url,
                            content_type: row.contentType,
                            detail: newData,
                          }
                        });
                    })
                    .catch((error) => {
                        alert("There is error, please try again!")
                        return
                });
              } else {
                this.props.navigation.replace("Browse", { 
                  data: {
                    imageUrl: (row.imgUrl !== '' && row.imgUrl !== null) ? GCS_BUCKET + row.imgUrl + '-screenshot': null,
                    videoUrl: null,
                    content_type: row.contentType,
                    detail: newData,
                  }
                });
              }
            }
          }).catch((error) => {
            console.log('error_go_to_browseDetail ', error);
            return
          });
    }
  }

  showTip = row => {
    this.setState({
      otherSelectedUserName: row.name,
      showTip: true,
    })
  }

  showFanUsersList = () => {
    if (this.state.fanUsersCount > 0 && this.state.mutualUsersCount > 0) {
      this.setState({
        showFanUsers: !this.state.showFanUsers,
        showMutualUsers: !this.state.showMutualUsers,
      })
    } else if (this.state.fanUsersCount > 0 && this.state.mutualUsersCount <= 0) {
      this.setState({
        showFanUsers: !this.state.showFanUsers,
      })
    } else if (this.state.fanUsersCount <= 0 && this.state.mutualUsersCount > 0) {
      this.setState({
        showMutualUsers: !this.state.showMutualUsers,
      })
    } else {
      this.refs.fmLocalInstance.showMessage({
        message: "This user does not have any fan.",
        type: "info",
      });
    }
  }

  render() {
    return (
      <ImageBackground source={bg} style={{width: '100%', height: '100%'}}>
        <Modal
          transparent={false}
          visible={this.state.fullImage}
          onRequestClose={() => {
            Alert.alert('Modal has been closed.');
          }}>
          <View style={{width: DEVICE_WIDTH, height: DEVICE_HEIGHT}}>
            <TouchableOpacity 
              onPress={() => this.setState({fullImage: false})} >
                <Image source={{ uri: this.state.otherData.imageUrl}} style={{width: DEVICE_WIDTH, height: DEVICE_HEIGHT}}>
                </Image>
            </TouchableOpacity>
          </View>
        </Modal>
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
                        {`Write a fan message to ${this.state.otherData.name} (public and optional)`}
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
                        {`Become a fan of ${this.state.otherData.name} by sending diamonds!`}
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
                        {`Write a fan message to ${this.state.otherData.name} (public and optional)`}
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

        <Dialog
          visible={this.state.showTip}
          dialogAnimation={new SlideAnimation({
            slideFrom: 'top',
          })}
        >
            <View style={styles.screenOverlay}>
                <View style={styles.dialogPrompt}>
                    <View style={{ alignItems: 'center', justifyContent: 'center', flexDirection: 'row', }}>
                      <Image source={admirable} style={{width: 25, height: 25, marginTop: 20, marginRight: 10, }} />
                      <Text style={{marginTop: 20, }}>{'mutual'}</Text>
                    </View>
                    <Text style={[styles.bodyFont, ]}>
                        {`This icons means that the number of diamonds sent from ${this.state.otherData.name} to ${this.state.otherSelectedUserName} is greater than the number of diamonds sent from ${this.state.otherSelectedUserName} to ${this.state.otherData.name}. Therefore, ${this.state.otherSelectedUserName} is not a fan of ${this.state.otherData.name}.`}
                    </Text>
                    <Text style={[styles.bodyFont, ]}>
                        {`Users cannot become fans mutually. In order for ${this.state.otherSelectedUserName} to become a fan of ${this.state.otherData.name}, the number of diamonds sent from ${this.state.otherSelectedUserName} to ${this.state.otherData.name} must be greater than the amount of diamonds ${this.state.otherSelectedUserName} received from ${this.state.otherData.name}`}
                    </Text>
                    <View style={styles.buttonsOuterView}>
                        <View style={styles.buttonsInnerView}>
                            <TouchableOpacity
                                style={[
                                    styles.button,
                                ]}
                                onPress={ () =>
                                    this.setState({
                                      showTip: !this.state.showTip
                                    })
                                }>
                                <Text
                                    style={[
                                        styles.submitButtonText,
                                    ]}>
                                    {'Ok'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>
        </Dialog>

        <StatusBar translucent={true} backgroundColor='transparent' barStyle='dark-content' />
        {this.state.flash_ban ? (
          <View>
            <Image source={ban_user} style={{width: 300, height: 300, zIndex: 100, position: 'absolute', left: parseInt(DEVICE_WIDTH /2) - 150, top: parseInt(DEVICE_HEIGHT /2) - 150,}} />
          </View>
        ): null}
        <View style={{ height: this.state.otherData.imageUrl? 220: 140, marginTop: Platform.select({ 'ios': '10%', 'android': '10%' }), marginBottom: 5, flexDirection: 'row', }}>
          <TouchableOpacity style={{ width: 40, height: 40, marginLeft: 10, justifyContent: 'center', alignItems: 'center' }}
            onPress={() => this.onBack()} >
            <Icon type="Ionicons" name="ios-arrow-back" style={{ color: '#B64F54' }} />
          </TouchableOpacity>
          <View style={{ width: DEVICE_WIDTH - 90, height: this.state.otherData.imageUrl? 220: 140, alignItems: 'center', justifyContent: 'center' }}>
            {this.state.otherData.imageUrl && (
              <View style={{flexDirection: 'row'}}>
                <TouchableOpacity style={{ width: 120, height: 120, marginLeft: 90, }}
                onPress={() => this.showUserVideo(0, this.state.otherData.imageUrl, this.state.otherData.id, this.state.datas)} >
                  <Image source={{ uri: this.state.otherData.imageUrl}} style={{width: 120, height: 120, borderRadius: 60,}}>
                  </Image>
                </TouchableOpacity>
                <TouchableOpacity style={{ marginLeft: 20, width: 60, height: 50, borderWidth: 1.5, borderRadius: 7, borderColor: '#B64F54', alignItems: 'center', justifyContent: 'center', marginTop: 40, }}
                  onPress={() => this.becomeFan()}>
                  <Image source={yellow_star} style={{ width: 35, height: 35 }} />
                </TouchableOpacity>
              </View>
            )}
            {!this.state.otherData.imageUrl && (
              <View style={{flexDirection: 'row'}}>
                <TouchableOpacity style={{ width: 60, height: 50, borderWidth: 1.5, borderRadius: 7, borderColor: '#B64F54', alignItems: 'center', justifyContent: 'center' }}
                  onPress={() => this.becomeFan()}>
                  <Image source={yellow_star} style={{ width: 35, height: 35 }} />
                </TouchableOpacity>
              </View>
            )}
            <View style={{
              flex: 3,
              height: 20,
              flexDirection: 'row',
              justifyContent: 'space-around'
            }}>
              {/* <Text style={{ fontSize: 16, }}>{((this.state.name).length > 6) ? (((this.state.name).substring(0, 6)) + '...') : this.state.name}</Text> */}
              <Text style={{ fontSize: 16, }}>{this.state.name}</Text>
              <Image source={diamond} style={{ width: 20, height: 20, marginTop: 3, marginLeft: 10, }} />
              <Text style={{ fontSize: 14, marginTop: 3, }}>{this.state.coin_count}</Text>
              <Image source={yellow_star} style={{ width: 17, height: 17, marginTop: 4, marginLeft: 10, }} />
              <Text style={{ fontSize: 14, marginTop: 3, }}>{this.state.fan_count}</Text>
            </View>
            <Text style={{
                fontSize: 12,
                color: '#7d7d7d',
            }}>
                {(this.state.otherData.age + ' years old, ') + (this.state.otherData.gender === 1 ? 'Male, ' : 'Female, ') + (((parseInt(this.state.otherData.distance) != 0)? parseInt(this.state.otherData.distance): 'unknown') + ' miles away, ')}
            </Text>
            <Text style={{
                fontSize: 12,
                color: '#7d7d7d',
            }}>
                {( this.state.otherData.country_name + ', ' + this.state.otherData.ethnicity_name + ', speaks ' + this.state.otherData.language_name + ', ')}
            </Text>
            <Text style={{
                fontSize: 12,
                color: '#7d7d7d',
            }}>
                {('active ' + this.state.otherData.last_loggedin_date)}
            </Text>
            <View style={{flexDirection: 'row', justifyContent: 'center'}}>
              <Image source={diamond} style={{width: 15, height: 15, marginTop: 2, marginRight: 3,}} />
              <Text style={{fontSize: 12, color: '#7d7d7d'}}>{`${this.state.coin_per_message} per message`}</Text>
            </View>
          </View>
          { (Global.saveData.is_admin === 1) && (
            <TouchableOpacity style={{ width: 30, height: 40, marginRight: 10, alignItems: 'center', justifyContent: 'center' }}
              onPress={this.banUser}>
              <Image source={ban_user_red} style={{ width: 25, height: 25 }} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity style={{flexDirection: 'row', justifyContent: 'center', backgroundColor: '#FFF', width: DEVICE_WIDTH, height: 40, marginTop: 10, paddingTop: 10, }}
          onPress={() => this.showFanUsersList() }
        >
          <Image source={yellow_star_black} style={{width: 20, height: 20, marginRight: 15, }} />
          <Text style={{fontSize: 16, marginRight: 20, color: '#7d7d7d' }}>{`Biggest Fans for ${this.state.otherData.name} (${this.state.fanUsersCount})`}</Text>
          <Image source={this.state.showFanUsers? collapse: expand} style={{ width: 15, height: 15, marginTop: 3, }} />
        </TouchableOpacity>        
        <ScrollView style={{ backgroundColor: '#FFF', marginTop: 1, }} removeClippedSubviews={true}>
          {(this.state.fanUsersCount != 0) && this.state.showFanUsers && (
            <FlatList
              numColumns={1}
              style={{ flex: 0, marginTop:10, }}
              removeClippedSubviews={true}
              data={this.state.fanUsers}
              initialNumToRender={this.state.fanUsersCount}
              renderItem={({ item: rowData, index }) => {
                return (
                    <TouchableOpacity style={styles.listItem} onPress={() => this.gotoBrowsDetail(rowData)}>
                      <View style={{ width: 50, height: 50, alignItems: 'center', justifyContent: 'center', paddingTop: (index == 0)? 25: 10, }}>
                        <Text style={{fontSize: 16, color: '#000'}}>{(index + 1) + '.'}</Text>
                      </View>
                      <View style={styles.listItemUser}>
                        <View style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'row'}}>
                          <View style={{ width: 30, height: 50, alignItems: 'center', justifyContent: 'center' }}>
                            {(index == 0) && <Image source={crown} style={{ width: 30, height: 20, marginBottom: -5 }}></Image>}
                            <Image source={rowData.imgUrl ? { uri: GCS_BUCKET + rowData.imgUrl + '-screenshot' } : hiddenMan} resizeMode="cover" style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: '#5A5A5A' }} />
                          </View>
                          <View style={styles.listItemName}>
                            <View style={{ width: DEVICE_WIDTH - 150, height: 40, marginLeft: 5, justifyContent: 'center', alignItems: 'center' }}>
                              <View style={{ width: DEVICE_WIDTH - 150, flexDirection: 'row', justifyContent: 'space-between', display: 'flex' }}>
                                <View style={{ paddingTop: (index == 0)? 25: 15, }}>
                                  <Text numberOfLines={1} style={{ color: '#808080' }}>{ rowData.name}</Text>
                                </View>
                                <View style={{
                                    flexDirection: 'row',
                                    paddingTop: (index == 0)? 25: 15, 
                                }}>
                                  <Image source={diamond} style={{ width: 15, height: 15, marginTop: 5, marginLeft: 5, marginRight: 5, }} />
                                  <Text numberOfLines={1} style={{ color: '#808080', marginTop: 3, fontSize: 12, }}>{rowData.diamonds}</Text>
                                </View>
                              </View>
                            </View>
                          </View>
                        </View>
                        {(rowData.fanMessage != '') && <View style={styles.fanMessage}>
                          <Text style={{ color: '#808080', marginTop: 3, fontSize: 16, flexWrap: 'wrap', width: DEVICE_WIDTH - 100, }}>{rowData.name + ' says "' + rowData.fanMessage + '"'}</Text>
                        </View>}
                      </View>
                    </TouchableOpacity>
                );
              }}
              keyExtractor={(item, index) => index}
            />)}
            {(this.state.mutualUsersCount != 0) && this.state.showMutualUsers && (
            <FlatList
              numColumns={1}
              style={{ flex: 0, marginTop: 5, }}
              removeClippedSubviews={true}
              data={this.state.mutualUsers}
              initialNumToRender={this.state.mutualUsersCount}
              renderItem={({ item: rowData, index }) => {
                return (
                  <TouchableOpacity style={styles.listItemMutual} onPress={() => this.gotoBrowsDetail(rowData)}>
                    <View style={{ width: 50, height: 50, alignItems: 'center', justifyContent: 'center', paddingTop: (index == 0)? 25: 10, }}>
                      <Text style={{fontSize: 16, color: '#000'}}>{(parseInt(index) + parseInt(this.state.fanUsersCount) + 1) + '.'}</Text>
                    </View>
                    <View style={styles.listItemUser}>
                      <View style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'row'}}>
                        <View style={{ width: 30, height: 50, alignItems: 'center', justifyContent: 'center' }}>
                          <Image source={rowData.imgUrl ? { uri: GCS_BUCKET + rowData.imgUrl + '-screenshot' } : hiddenMan} resizeMode="cover" style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: '#5A5A5A' }} />
                        </View>
                        <View style={styles.listItemName}>
                          <View style={{ width: DEVICE_WIDTH - 150, height: 40, marginLeft: 5, justifyContent: 'center', alignItems: 'center' }}>
                            <View style={{ width: DEVICE_WIDTH - 150, flexDirection: 'row', justifyContent: 'space-between', display: 'flex' }}>
                              <View style={{ paddingTop: (index == 0)? 25: 15, }}>
                                <Text numberOfLines={1} style={{ color: '#808080' }}>{ rowData.name}</Text>
                              </View>
                              <View style={{
                                  flexDirection: 'row',
                                  paddingTop: (index == 0)? 25: 15, 
                              }}>
                                {(rowData.diamonds > 0) && (
                                  <View style={{flexDirection: 'row'}}>
                                    <Image source={ diamond} style={{ width: 15, height: 15, marginTop: 5, marginLeft: 5, marginRight: 5 }} />
                                    <Text numberOfLines={1} style={{ color: '#808080', marginTop: 3, fontSize: 12, }}>{ rowData.diamonds }</Text>
                                  </View>
                                )}
                                {(rowData.diamonds <= 0) && (
                                  <View style={{flexDirection: 'row'}}>
                                    <TouchableOpacity style={{width: 20, height: 20, marginRight: 5, }} onPress={() => this.showTip(rowData)}>
                                      <Image source={ admirable } style={{ width: 15, height: 15, marginTop: 5, marginLeft: 5, }} />
                                    </TouchableOpacity>
                                    <Text numberOfLines={1} style={{ color: '#808080', marginTop: 3, fontSize: 12, }}>{'mutual'}</Text>
                                  </View>
                                )}
                              </View>
                            </View>
                          </View>
                        </View>
                      </View>
                      {(rowData.fanMessage != '') && <View style={styles.fanMessage}>
                        <Text style={{ color: '#808080', marginTop: 3, fontSize: 16, flexWrap: 'wrap', width: DEVICE_WIDTH - 100, }}>{rowData.name + ' says "' + rowData.fanMessage + '"'}</Text>
                      </View>}
                    </View>
                  </TouchableOpacity>
                );
              }}
              keyExtractor={(item, index) => index}
            />)}
          <View style={{ height: 10 }} />
          {this.state.otherData.description && (
            <View style={{
              justifyContent: 'center',
              alignSelf: "center",
              alignItems: 'center',
              marginTop: 10,
              marginBottom: 10,
              padding: 10,
              marginLeft: 20,
              marginRight: 20,
            }}>
              <Text style={{ fontSize: 16, alignContent: 'center' }}>
                {this.state.otherData.description}
              </Text>
            </View>
          )}
          {this.state.isLoading && (
            <View style={{
              flex: 1, justifyContent: 'center', alignSelf: 'center',
            }}>
              <ActivityIndicator style={{ color: '#DE5859' }} />
            </View>
          )}
          {this.state.noData && !this.state.isLoading && (
            <View style={{
              flex: 1, 
              alignItems: 'center',
            }}>
              <Text style={{
                fontSize: 16,
                marginTop: 20,
                color: '#f17f76',
              }}>{'This user does not have any'}</Text>
              <Text style={{
                fontSize: 16,
                color: '#f17f76',
              }}>{' profile pictures.'}</Text>
              <Image source={search_photo} style={{width: 200, height: 200, marginTop: 40}}></Image>
            </View>
          )}
          {(this.state.datas.length != 0) && (
            <FlatList
              numColumns={2}
              style={{ flex: 0 }}
              removeClippedSubviews={true}
              data={this.state.datas}
              initialNumToRender={this.state.datas.length}
              renderItem={({ item: rowData, index }) => {
                return (
                  <TouchableOpacity style={{ width: DEVICE_WIDTH / 2, }} onPress={() => this.showUserVideo(index, rowData.imageUrl, rowData.otherId, this.state.datas)}>
                    <ImageBackground source={{ uri: rowData.imageUrl }} resizeMethod="resize" style={{ width: DEVICE_WIDTH / 2, height: (DEVICE_WIDTH / 2) * 1.5, backgroundColor: '#5A5A5A' }}>
                      {rowData.content_type == 2 && (<Image source={video_player} style={{ position: 'absolute', width: 30, height: 30, top: (DEVICE_WIDTH / 4) * 1.5 - 15, left: DEVICE_WIDTH / 4 -15, }} />)}
                    </ImageBackground>
                  </TouchableOpacity>
                );
              }}
              keyExtractor={(item, index) => index}
            />)}
          <View style={{ height: 50 }} />
        </ScrollView>
        <FlashMessage ref="fmLocalInstance" position="bottom" animated={true} autoHide={true} />
      </ImageBackground>
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
  listItemUser: {
    flexDirection: 'column', 
    borderBottomColor: '#e8e8e8',
    borderBottomWidth: 0.5,
    paddingBottom: 10,
  },
  listItem: {
    width: DEVICE_WIDTH - 25, 
    flexDirection: 'row', 
    marginTop: 7, 
    marginBottom: 7, 
    marginLeft: 5, 
    marginRight: 5,
    paddingLeft: 10,
  },
  listItemMutual: {
    width: DEVICE_WIDTH - 25, 
    flexDirection: 'row', 
    marginBottom: 7, 
    marginLeft: 5, 
    marginRight: 5,
    paddingLeft: 10,
  },
  listItemName: {    
    marginLeft: 10,
    paddingBottom: 20,
    flexDirection: 'row', 
  },
  fanMessage: {
    marginTop: 10,
  },
  requiredSent: {
    textAlign: 'center',
    color: 'red',    
    fontSize: 12,
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
export default Profile;
