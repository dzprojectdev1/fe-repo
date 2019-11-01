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
  // ActivityIndicator
} from "react-native";
import Dialog, { DialogFooter, DialogButton, DialogContent, SlideAnimation } from 'react-native-popup-dialog';

// import Video from 'react-native-video';
import b_notification from '../../assets/images/notification.png';
import no_image from '../../assets/images/no-image.png';
import b_name from '../../assets/images/name.png';
import b_age from '../../assets/images/age.png';
import b_distance from '../../assets/images/distance.png';
import b_profile from '../../assets/images/profile.png';
import no_photo from '../../assets/images/no_photo.png';
import diamond from '../../assets/images/red_diamond_trans.png';
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
        vUrl: this.props.navigation.state.params.url,
        otherId: this.props.navigation.state.params.otherId,
        isMatchVideo: Global.saveData.isMatchVideo,
        username: this.props.navigation.state.params.name,
        userage: this.props.navigation.state.params.age,
        userimage: this.props.navigation.state.params.imageUrl,
        matchId: this.props.navigation.state.params.mid,
        userdistance: parseInt(this.props.navigation.state.params.distance),
        description: this.props.navigation.state.params.description
      });
    }
  }
  componentDidMount() {
    this.props.navigation.addListener('didFocus', (playload) => {
      this.setState({ paused: false, privatedPaused: false });
    });
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
        match_id: this.state.matchId
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
          // if (responseJson.data.cdn_id.length) {
          //   this.getMatchedVideo(responseJson.data.cdn_id[0].cdn_id, responseJson.data.match_id);
          // } else {
          //   this.setState({
          //     vUrl: null,
          //     userimage: null,
          //     matchId: responseJson.data.match_id,
          //     isMatchVideo: true,
          //     privatedPaused: false
          //   });
          // }
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
    // fetch(`${SERVER_URL}/api/storage/videoLink?fileId=${cdnId}`, {
    //   method: 'GET',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': Global.saveData.token
    //   }
    // }).then((response) => response.json())
    //   .then((responseJson) => {
    //     if (responseJson.url) {
    //       fetch("http://138.197.203.178:8080/api/storage/videoLink?fileId=" + cdnId + "-thumbnail", {
    //         method: 'GET',
    //         headers: {
    //           'Content-Type': 'application/json',
    //           'Authorization': Global.saveData.token
    //         }
    //       }).then((t_response) => t_response.json())
    //         .then((t_responseJson) => {
    //           if (t_responseJson.url) {
    //             Global.saveData.prevUrl = responseJson.url;
    //             this.setState({
    //               vUrl: responseJson.url,
    //               userimage: t_responseJson.url,
    //               matchId: matchId,
    //               isMatchVideo: true,
    //               privatedPaused: false
    //             });
    //           }
    //         }).catch((error) => {
    //           alert("There is error, please try again!");
    //           return
    //         });
    //     }
    //   }).catch((error) => {
    //     alert("There is error, please try again!");
    //     return
    //   });
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
            });

            this.props.navigation.replace("Profile", { 
              data: {
                id: this.state.otherId, 
                name: this.state.username, 
                isMatched: this.state.isMatchVideo, 
                description: this.state.description,
                age: this.state.age,
                gender: this.state.gender,
                distance: this.state.distance,
                country_name: this.state.country_name,
                ethnicity_name: this.state.ethnicity_name,
                language_name: this.state.language_name,
                last_loggedin_date: this.state.last_loggedin_date,
                imageUrl: this.state.userimage,
              }
            });
          }
        }).catch((error) => {
          alert(JSON.stringify(error));
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
  render() {
    return (
      <View style={styles.contentContainer}>
        <StatusBar translucent={true} backgroundColor='transparent' barStyle='dark-content' />
        <Content>
          {!this.state.isMatchVideo && (
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
                    style={{ justifyContent: 'center', alignSelf: 'center' }}
                  />
                </View>
              </TouchableOpacity>
            )
          )}
          {this.state.isMatchVideo && (
            // <Video source={{ uri: this.state.vUrl }}   // Can be a URL or a local file.
            //   ref={(ref) => {
            //     this.cdnPlayer = ref
            //   }}
            //   ignoreSilentSwitch={null}
            //   resizeMode="cover"
            //   repeat={true}
            //   paused={this.state.privatedPaused}
            //   onError={this.videoError}              // Callback when video cannot be loaded
            //   style={{ height: DEVICE_HEIGHT, width: DEVICE_WIDTH }}
            // />
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
                    style={{ justifyContent: 'center', alignSelf: 'center' }}
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
              <Text style={{ color: '#000', fontSize: 18, marginTop: 20}}>{'You need 1 diamond to send a heart'}</Text>
            </DialogContent>
          </Dialog>
          {/* <TouchableOpacity style={{ width: 60, height: 60, marginBottom: 20, alignItems: 'center', justifyContent: 'center' }}
            onPress={() => this.back()}>
            <Icon type="Ionicons" name="ios-arrow-back" style={{ color: '#B64F54' }} />
          </TouchableOpacity> */}
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
              onPress={() => this.gotoProfile()}>
              <Image source={b_profile} style={{ width: 30, height: 30 }} />
            </TouchableOpacity>
          </View>
          {/* <View style={{ width: DEVICE_WIDTH * 0.8, marginLeft: DEVICE_WIDTH * 0.1, marginTop: 20, flexDirection: 'row', justifyContent: 'space-between' }}>
            <View></View>
            <TouchableOpacity style={{ width: 60, height: 50, borderWidth: 1.5, borderRadius: 7, borderColor: '#B64F54', alignItems: 'center', justifyContent: 'center' }}
              onPress={this.gotoProfile}>
              <Image source={b_profile} style={{ width: 25, height: 25 }} />
            </TouchableOpacity>
          </View> */}
        </View>
        <View style={{ position: 'absolute', left: 0, bottom: 40 }}>
          <View style={{ marginLeft: DEVICE_WIDTH * 0.1, marginBottom: 20 }}>
            <View style={{ flexDirection: 'row' }}>
              <Image source={b_name} style={{ width: 15, height: 15 }} />
              <Text style={{ marginLeft: 10, color: '#fff', fontSize: 12, fontWeight: 'bold' }}>{this.state.username}</Text>
            </View>
            <View style={{ flexDirection: 'row', marginTop: 5 }}>
              <Image source={b_age} style={{ width: 15, height: 15 }} />
              <Text style={{ marginLeft: 10, color: '#fff', fontSize: 12, fontWeight: 'bold' }}>{this.state.userage + ' years old'}</Text>
            </View>
            <View style={{ flexDirection: 'row', marginTop: 5 }}>
              <Image source={b_distance} style={{ width: 15, height: 15 }} />
              <Text style={{ marginLeft: 10, color: '#fff', fontSize: 12, fontWeight: 'bold' }}>{((this.state.userdistance != 0)? this.state.userdistance: 'unknown') + ' mile'}</Text>
            </View>
            <View style={{ flexDirection: 'column', marginTop: 5 }}>
              <Text>
                <Text style={{ marginTop: 5, color: '#fff', fontSize: 12, fontWeight: 'bold' }}>{this.props.navigation.state.params.gender === 1 ? 'Male, ' : 'Female, '}</Text>
                <Text style={{ marginTop: 5, color: '#fff', fontSize: 12, fontWeight: 'bold' }}>{this.props.navigation.state.params.ethnicity_name}</Text>
                <Text style={{ marginTop: 5, color: '#fff', fontSize: 12, fontWeight: 'bold' }}>{', speaks ' + this.props.navigation.state.params.language_name}</Text>
              </Text>
              <Text style={{ marginTop: 5, color: '#fff', fontSize: 12, fontWeight: 'bold' }}>{this.props.navigation.state.params.last_loggedin_date + ', ' + this.props.navigation.state.params.country_name}</Text>
            </View>
            <View style={{ marginTop: 10 }}>
              <ScrollView contentContainerStyle={{ paddingVertical: 20 }} style={{ maxHeight: DEVICE_HEIGHT * 0.3 }}>
                <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#fff' }}>{this.state.description}</Text>
              </ScrollView>
            </View>
            <View style={{ width: DEVICE_WIDTH * 0.5, marginLeft: DEVICE_WIDTH * 0.15, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', alignSelf: 'center' }}>
              {!this.state.isMatchVideo && (
                <View style={{ width: DEVICE_WIDTH * 0.5, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <TouchableOpacity style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' }}
                    onPress={() => this.onReject()}>
                    <Icon type="FontAwesome" name="close" style={{ color: '#B64F54' }} />
                  </TouchableOpacity>
                  <TouchableOpacity style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: '#B64F54', alignItems: 'center', justifyContent: 'center' }}
                    onPress={() => this.onMatch()}>
                    <Icon type="FontAwesome" name="heart" style={{ color: '#fff' }} />
                  </TouchableOpacity>
                </View>)}
              {this.state.isMatchVideo && (
                <View>
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
        {/* <View style={{ position: 'absolute', left: 0, top: 50, }}> */}
        {/* <TouchableOpacity style={{ width: 60, height: 60, marginBottom: 20, alignItems: 'center', justifyContent: 'center' }}
            onPress={() => this.back()}>
            <Icon type="Ionicons" name="ios-arrow-back" style={{ color: '#B64F54' }} />
          </TouchableOpacity> */}
        {/* <View style={{ width: DEVICE_WIDTH * 0.8, marginLeft: DEVICE_WIDTH * 0.1, flexDirection: 'row', justifyContent: 'space-between' }}>
            <TouchableOpacity style={{ width: 60, height: 50, borderWidth: 1.5, borderRadius: 7, borderColor: '#B64F54', alignItems: 'center', justifyContent: 'center' }}
              onPress={() => this.gotoReport()}>
              <Image source={b_notification} style={{ width: 30, height: 30 }} />
            </TouchableOpacity>
            <TouchableOpacity style={{ width: 60, height: 50, borderWidth: 1.5, borderRadius: 7, borderColor: '#B64F54', alignItems: 'center', justifyContent: 'center' }}
              onPress={() => this.gotoProfile()}>
              <Image source={b_profile} style={{ width: 30, height: 30 }} />
            </TouchableOpacity>
          </View>
          <View style={{ width: DEVICE_WIDTH * 0.8, marginLeft: DEVICE_WIDTH * 0.1, marginTop: 20, flexDirection: 'row', justifyContent: 'space-between' }}>
            <View>
              <View style={{ flexDirection: 'row' }}>
                <Image source={b_name} style={{ width: 15, height: 15 }} />
                <Text style={{ marginLeft: 10, color: '#fff', fontSize: 12, fontWeight: 'bold' }}>{this.state.username}</Text>
              </View>
              <View style={{ flexDirection: 'row', marginTop: 5 }}>
                <Image source={b_age} style={{ width: 15, height: 15 }} />
                <Text style={{ marginLeft: 10, color: '#fff', fontSize: 12, fontWeight: 'bold' }}>{this.state.userage + ' years old'}</Text>
              </View>
              <View style={{ flexDirection: 'row', marginTop: 5 }}>
                <Image source={b_distance} style={{ width: 15, height: 15 }} />
                <Text style={{ marginLeft: 10, color: '#fff', fontSize: 12, fontWeight: 'bold' }}>{this.state.userdistance + ' mile'}</Text>
              </View>
            </View>
          </View>
        </View> */}
        {/* {!this.state.isMatchVideo && (
          <View style={{ position: 'absolute', left: 0, bottom: 120 }}>
            <View style={{ width: DEVICE_WIDTH * 0.5, marginLeft: DEVICE_WIDTH * 0.25, flexDirection: 'row', justifyContent: 'space-between' }}>
              <TouchableOpacity style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' }}
                onPress={() => this.onReject()}>
                <Icon type="FontAwesome" name="close" style={{ color: '#B64F54' }} />
              </TouchableOpacity>
              <TouchableOpacity style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: '#B64F54', alignItems: 'center', justifyContent: 'center' }}
                onPress={() => this.onMatch()}>
                <Icon type="FontAwesome" name="heart" style={{ color: '#fff' }} />
              </TouchableOpacity>
            </View>
          </View>)}
        {this.state.isMatchVideo && (
          <View style={{ position: 'absolute', left: 0, bottom: 120 }}>
            <TouchableOpacity
              style={{
                width: DEVICE_WIDTH * 0.5,
                height: 40,
                marginLeft: DEVICE_WIDTH * 0.25,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#B64F54',
                borderRadius: DEVICE_WIDTH * 0.25
              }}
              onPress={() => this.gotoChat()}>
              <Text style={{ color: '#fff', fontSize: 16 }}>{"Start Chat!"}</Text>
            </TouchableOpacity>
          </View>
        )} */}
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
export default IncomeDetail;
