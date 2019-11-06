import React, { Component } from "react";
import {
  Icon,
  Text,
  Content,
} from "native-base";
import {
  AsyncStorage,
  BackHandler,
  ActivityIndicator,
  Image,
  ScrollView,
  // Platform,
  Dimensions,
  View,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Alert
} from "react-native";
import { Button } from 'react-native-elements';
import Dialog, { DialogFooter, DialogButton, DialogContent, SlideAnimation } from 'react-native-popup-dialog';
// import Video from 'react-native-video';
// import b_browse from '../../assets/images/browse.png';
// import b_incoming from '../../assets/images/incoming.png';
// import b_match from '../../assets/images/match.png';
import b_chat from '../../assets/images/chat.png';
// import b_myvideo from '../../assets/images/myvideo.png';
// import OnlyGImage from '../../assets/images/OnlyGImage.png';
import b_notification from '../../assets/images/notification.png';
import b_filters from '../../assets/images/filters.png';
import b_name from '../../assets/images/name.png';
import b_age from '../../assets/images/age.png';
import b_distance from '../../assets/images/distance.png';
import b_profile from '../../assets/images/profile.png';
// import no_image from '../../assets/images/no-image.png';
import no_photo from '../../assets/images/no_photo.png';
import diamond from '../../assets/images/red_diamond_trans.png';
// import instant_chat from '../../assets/images/instant_chat.png';
import flash_heart from '../../assets/images/flash_heart.png';
import flash_reject from '../../assets/images/flash_reject.png';
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
      // operatedIDArr: [],
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
  //   this.props.navigation.addListener('didFocus', (playload) => {
  //     if (Global.saveData.isFilter) {
  //       this.getFilterVideos();
  //     }
  //     else {
  //       this.getVideos();
  //     }
  //   });
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
          })
        }
      }
    }).catch((error) => {
      // alert(error);
      return
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
    if (data.cdn_filtered_id) {
      var otherData = {};
      otherData = {
        imageUrl: GCS_BUCKET + data.cdn_filtered_id + '-screenshot',
        detail: data
      };
      this.setState({
        otherData: otherData,
        flash_heart: false,
        flash_reject: false,
      });
    } else {
      var otherData = {
        imageUrl: null,
        detail: data
      };
      this.setState({
        otherData: otherData,
        flash_heart: false,
        flash_reject: false,
      })
    }
  }
  // getDetails = async (data) => {
  //   if (data.cdn_filtered_id) {
  //     var v_url = `${SERVER_URL}/api/storage/videoLink?fileId=${data.cdn_filtered_id}-screenshot`;
  //     fetch(v_url, {
  //       method: 'GET',
  //       headers: {
  //         'Content-Type': 'application/json',
  //         'Authorization': Global.saveData.token
  //       }
  //     }).then((response) => response.json())
  //       .then((responseJson) => {
  //         var otherData = {};
  //         if (responseJson.url) {
  //           otherData = {
  //             imageUrl: responseJson.url,
  //             detail: data
  //           };
  //         } else {
  //           otherData = {
  //             imageUrl: null,
  //             detail: data
  //           };
  //         }
  //         this.setState({
  //           otherData
  //         });
  //       })
  //       .catch((error) => {
  //         alert(JSON.stringify(error));
  //         return
  //       }
  //       );
  //   } else {
  //     var otherData = {
  //       imageUrl: null,
  //       detail: data
  //     };
  //     this.setState({
  //       otherData
  //     })
  //   }
  // }
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
          // let operateArr = this.state.operatedIDArr;
          // let newIdArr = [];
          // newIdArr.push(this.state.otherData.detail.id);
          // operateArr = operateArr.concat(newIdArr);
          // this.setState({
          //   operatedIDArr: operateArr
          // });
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
          // let operateArr = this.state.operatedIDArr;
          // let newIdArr = [];
          // newIdArr.push(this.state.otherData.detail.id);
          // operateArr = operateArr.concat(newIdArr);
          // this.setState({
          //     operatedIDArr: operateArr
          // });
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

  backPressed = () => {
    const { isReplace } = this.state;
    if (isReplace) {
      this.props.navigation.replace("BrowseList", { ids: this.state.operatedIDArr });
    } else {
      this.props.navigation.replace(Global.saveData.prePage);
    }
    // this.props.navigation.navigate("BrowseList", {ids: this.state.operatedIDArr});    
    return true;
  }
  gotoFilter() {
    this.props.navigation.navigate("Filter");
  }
  // gotoIncome() {
  //   this.props.navigation.replace("Income");
  // }
  // gotoMatch() {
  //   this.props.navigation.replace("Match");
  // }
  // gotoChat() {
  //   this.props.navigation.replace("Chat");
  // }
  // gotoMyVideo() {
  //   this.props.navigation.replace("MyVideo");
  // }
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
          age: this.state.otherData.detail.age,
          distance: this.state.otherData.detail.distance,
          gender: this.state.otherData.detail.gender,
          last_loggedin_date: this.state.otherData.detail.last_loggedin_date,
          ethnicity_name: this.state.otherData.detail.ethnicity_name,
          language_name: this.state.otherData.detail.language_name,
          country_name: this.state.otherData.detail.country_name,
          matchId: 0,
        } 
      }
    );
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
        "Send instant messages to "+this.state.otherData.detail.name+" for 50 diamonds. Continue?",
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
                "You need 50 diamonds to start chat with " + this.state.otherData.detail.name + " immediately",
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
        }
      }).catch((error) => {
        // alert(JSON.stringify(error));
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
        match_id: this.state.matchId
      }
    }
    Global.saveData.prevpage = "BrowseList"
    this.props.navigation.navigate("ChatDetail", { data: otherData })
  }

  gotoReport() {
    this.props.navigation.navigate("Report", { otherId: this.state.otherData.detail.id })
  }
  //////////////////////////////////////////////////
  // gotoGpay(){
  //   this.props.navigation.navigate("screenGpay01");
  // }
  //////////////////////////////////////////////////
  // videoError = () => {
  //   alert('Video Loading Error!');
  // }
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
              {/* {(this.state.vUrl != "") && (
                <Video source={{ uri: this.state.vUrl }}   // Can be a URL or a local file.
                  ref={(ref) => {
                    this.player = ref
                  }}
                  resizeMode="cover"
                  ignoreSilentSwitch={null}
                  repeat={true}
                  paused={false}
                  onError={this.videoError}               // Callback when video cannot be loaded
                  style={{ height: DEVICE_HEIGHT, width: DEVICE_WIDTH }}
                />
              )} */}
              {this.state.otherData.imageUrl ? (
                <TouchableOpacity
                  onPress={this.gotoProfile}>
                  <Image
                    source={{ uri: this.state.otherData.imageUrl }}
                    style={{ height: DEVICE_HEIGHT, width: DEVICE_WIDTH }}
                  />
                </TouchableOpacity>
              ) : (
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
                        style={{ justifyContent: 'center', alignSelf: 'center' }}
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
                    <Text style={{ color: '#000', fontSize: 18, marginTop: 20}}>{'You need 1 diamond to send a heart'}</Text>
                  </DialogContent>
                </Dialog>
                <View style={{ width: DEVICE_WIDTH * 0.8, marginLeft: DEVICE_WIDTH * 0.1, flexDirection: 'row', justifyContent: 'space-between' }}>
                  <TouchableOpacity style={{ width: 60, height: 50, borderWidth: 1.5, borderRadius: 7, borderColor: '#B64F54', alignItems: 'center', justifyContent: 'center' }}
                    onPress={() => this.gotoReport()}>
                    <Image source={b_notification} style={{ width: 25, height: 25 }} />
                  </TouchableOpacity>
                  <TouchableOpacity style={{ width: 40, height: 40}}
                    onPress={() => this.gotoShop()}>
                    <View style={{ flexDirection: 'row' }}>
                      <Image source={diamond} style={{ width: 25, height: 25, marginLeft: -15, marginTop: 10 }} />
                      <Text style={{ marginLeft: 10, color: '#fff', fontSize: 12, fontWeight: 'bold', marginTop: 15 }}>{this.state.coinCount}</Text>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity style={{ width: 60, height: 50, borderWidth: 1.5, borderRadius: 7, borderColor: '#B64F54', alignItems: 'center', justifyContent: 'center' }}
                    onPress={() => this.gotoFilter()}>
                    <Image source={b_filters} style={{ width: 25, height: 25 }} />
                  </TouchableOpacity>
                </View>
                <View style={{ width: DEVICE_WIDTH * 0.8, marginLeft: DEVICE_WIDTH * 0.1, marginTop: 20, flexDirection: 'row', justifyContent: 'space-between' }}>
                  <View></View>
                  <TouchableOpacity style={{ width: 60, height: 50, borderWidth: 1.5, borderRadius: 7, borderColor: '#B64F54', alignItems: 'center', justifyContent: 'center' }}
                    onPress={this.gotoProfile}>
                    <Image source={b_profile} style={{ width: 25, height: 25 }} />
                  </TouchableOpacity>
                </View>
              </View>
              <View style={{ position: 'absolute', left: 0, bottom: 40 }}>
                <View style={{ marginLeft: DEVICE_WIDTH * 0.1, marginBottom: 20 }}>
                  <View style={{ flexDirection: 'row' }}>
                    <Image source={b_name} style={{ width: 15, height: 15 }} />
                    <Text style={{ marginLeft: 10, color: '#fff', fontSize: 12, fontWeight: 'bold' }}>{this.state.otherData.detail.name}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', marginTop: 5 }}>
                    <Image source={b_age} style={{ width: 15, height: 15 }} />
                    <Text style={{ marginLeft: 10, color: '#fff', fontSize: 12, fontWeight: 'bold' }}>{this.state.otherData.detail.age + ' years old'}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', marginTop: 5 }}>
                    <Image source={b_distance} style={{ width: 15, height: 15 }} />
                    <Text style={{ marginLeft: 10, color: '#fff', fontSize: 12, fontWeight: 'bold' }}>{((parseInt(this.state.otherData.detail.distance) != 0)? parseInt(this.state.otherData.detail.distance): 'unknown') + ' mile'}</Text>
                  </View>
                  <View style={{ flexDirection: 'column', marginTop: 5 }}>
                    <Text>
                      <Text style={{ marginTop: 5, color: '#fff', fontSize: 12, fontWeight: 'bold' }}>{this.state.otherData.detail.gender === 1 ? 'Male, ' : 'Female, '}</Text>
                      <Text style={{ marginTop: 5, color: '#fff', fontSize: 12, fontWeight: 'bold' }}>{this.state.otherData.detail.ethnicity_name}</Text>
                      <Text style={{ marginTop: 5, color: '#fff', fontSize: 12, fontWeight: 'bold' }}>{', speaks ' + this.state.otherData.detail.language_name}</Text>
                    </Text>
                    <Text style={{ marginTop: 5, color: '#fff', fontSize: 12, fontWeight: 'bold' }}>{this.state.otherData.detail.last_loggedin_date + ', ' + this.state.otherData.detail.country_name}</Text>
                  </View>
                  <View style={{ marginTop: 10, marginRight: 20 }}>
                    <ScrollView contentContainerStyle={{ paddingVertical: 20 }} style={{ maxHeight: DEVICE_HEIGHT * 0.3 }}>
                      <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#fff' }}>{this.state.otherData.detail.description}</Text>
                    </ScrollView>
                  </View>
                </View>
                <View style={{ width: DEVICE_WIDTH * 0.8, marginLeft: DEVICE_WIDTH * 0.1, flexDirection: 'row', justifyContent: 'space-between' }}>
                  {/* <TouchableOpacity style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' }}
                    onPress={() => this.onReject()}>
                    <Icon type="FontAwesome" name={this.state.hateIcon} style={{ color: '#B64F54' }} />
                  </TouchableOpacity> */}
                  <Button
                    icon={
                      <Icon type="FontAwesome" name={this.state.hateIcon} style={{ color: '#B64F54' }} />
                    }
                    buttonStyle={{ width: 60, height: 60, borderRadius: 50, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' }}
                    loading={this.state.isLoading}
                    onPress={() => this.onReject()}
                  // disabled={this.state.disabled}
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
                  // disabled={this.state.disabled}
                  />
                </View>
              </View>
            </Content>
          )}

        {/* <Footer style={{ borderTopColor: '#222F3F', height: Platform.select({ 'android': 50, 'ios': 30 }) }}>
          <FooterTab style={{ backgroundColor: '#222F3F', alignSelf: 'stretch', alignItems: 'center', alignContent: 'space-around', flex: 1, flexDirection: 'row' }}>
            <Button style={{ backgroundColor: '#222F3F', borderRadius: 0,  }} transparent >
              <Image source={b_browse} style={{width : 25, height: 25, tintColor: '#B64F54' }} />
              <Text style={{ color: '#B64F54', fontSize: 6, fontWeight: 'bold', marginTop: 3, width: '100%' }}>{"BROWSE"}</Text>
            </Button>
            <Button style={{ backgroundColor: '#222F3F', borderRadius: 0, margin: 0, padding: 0 }} transparent onPress={() => this.gotoIncome()}>
              <Image source={b_incoming} style={{width : 25, height: 25 }} />
              <Text style={{ color: '#fff', fontSize: 6, fontWeight: 'bold', marginTop: 3, width: '100%' }}>{"INCOMING"}</Text>
            </Button>
            <Button style={{ backgroundColor: '#222F3F', borderRadius: 0,  }} transparent onPress={() => this.gotoMatch()}>
              <Image source={b_match} style={{width : 25, height: 25 }} />
              <Text style={{ color: '#fff', fontSize: 6, fontWeight: 'bold', marginTop: 3, width: '100%' }}>{"MATCH"}</Text>
            </Button>
            <Button style={{ backgroundColor: '#222F3F', borderRadius: 0,  }} transparent onPress={() => this.gotoChat()}>
              <Image source={b_chat} style={{width : 25, height: 25 }} />
              <Text style={{ color: '#fff', fontSize: 6, fontWeight: 'bold', marginTop: 3 }}>{"CHAT"}</Text>
            </Button>
            <Button style={{ backgroundColor: '#222F3F', borderRadius: 0,  }} transparent onPress={() => this.gotoMyVideo()}>
              <Image source={b_myvideo} style={{width : 25, height: 25 }} />
              <Text style={{ color: '#fff', fontSize: 6, fontWeight: 'bold', marginTop: 3 }}>{"PROFILE"}</Text>
            </Button>
            <Button style={{ backgroundColor: '#222F3F', borderRadius: 0,  }} transparent onPress={() => this.gotoGpay()}>
              <Image source={OnlyGImage} style={{width : 25, height: 25 }} />
              <Text style={{ color: '#fff', fontSize: 6, fontWeight: 'bold', marginTop: 3 }}>{"GPAY"}</Text>
            </Button>
          </FooterTab>
        </Footer> */}
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
});
export default Browse;
