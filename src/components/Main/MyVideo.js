import React, { Component } from "react";
import {
  Footer,
  Button,
  FooterTab,
  Icon,
  Text
} from "native-base";
import {
  ActivityIndicator,
  ImageBackground,
  BackHandler,
  Image,
  ScrollView,
  Platform,
  Dimensions,
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  Alert
} from "react-native";
import { connect } from 'react-redux';
import { Badge } from 'react-native-elements'
import ImagePicker from 'react-native-image-picker';
// import OnlyGImage from '../../assets/images/OnlyGImage.png';
import b_browse from '../../assets/images/browse.png';
import b_incoming from '../../assets/images/incoming.png';
import b_match from '../../assets/images/match.png';
import b_chat from '../../assets/images/chat.png';
import b_myvideo from '../../assets/images/myvideo.png';
import b_delete from '../../assets/images/delete.png';
import diamond from '../../assets/images/red_diamond_trans.png';
import bg from '../../assets/images/bg.jpg';
import upload from '../../assets/images/upload_photos.png';
import crown from '../../assets/images/crown.png';
import hiddenMan from '../../assets/images/hidden_man.png';
import admirable from '../../assets/images/admirable_icon.png';
import collapse from '../../assets/images/collapse.png';
import expand from '../../assets/images/expand.png';
import Global from '../Global';

import { SERVER_URL, GCS_BUCKET } from '../../config/constants';
import { uploadPhoto } from '../../util/upload';
import Dialog, { DialogFooter, DialogButton, DialogContent, SlideAnimation } from 'react-native-popup-dialog';

class MyVideo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      datas: [],
      isLoading: true,
      noData: false,
      coinCount: Global.saveData.coin_count,
      visible: false,
      fanUsers: [],
      mutualUsers: [],
      fanUsersCount: 0,
      showTip: false,
      otherSelectedUserName: '',
      showFanUsers: false,
      showStarUsers: false,
    };
  }

  static navigationOptions = {
    header: null
  };
  componentDidMount() {
    Global.saveData.nowPage = 'MyVideo';
    this.props.navigation.addListener('didFocus', (playload) => {
      this.getVideos()
    });
    
    this.getBiggestFanUsers();

    fetch(`${SERVER_URL}/api/transaction/getDiamondCount`, {
      method: 'POST',
      headers: {
          'Content-type': 'application/x-www-form-urlencoded',
          'Authorization': Global.saveData.token
      }
    }).then((response) => response.json())
      .then((responseJson) => {
        if (!responseJson.error) {
            Global.saveData.coin_count = responseJson.coin_count;
            this.setState({
              coinCount: Global.saveData.coin_count,
            });
        }
      })
      .catch((error) => {
        return
      });
  }

  getBiggestFanUsers = () => {
    var details = {
      'otherId': Global.saveData.u_id,
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
          })
        }
      })
      .catch((error) => {
        // alert(JSON.stringify(error));
        return
      });
  }

  gotoProfile = row => {
    Global.saveData.prevpage = "MyVideo";
    
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

            this.props.navigation.replace("Profile", { 
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
                matchId: 0,
                imageUrl: (row.imgUrl !== '' && row.imgUrl !== null) ? GCS_BUCKET + row.imgUrl + '-screenshot': null,
                coin_count: newData.coin_count, 
                fan_count: newData.fan_count, 
              }
            });
          }
        }).catch((error) => {
          // alert(JSON.stringify(error));
          return
        });
  }

  showTip = row => {
    this.setState({
      otherSelectedUserName: row.name,
      showTip: true,
    })
  }

  getVideos() {
    fetch(`${SERVER_URL}/api/video/getMyAllVideo`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': Global.saveData.token
      }
    })
      .then(response => response.json())
      .then(responseJson => {
        if (!responseJson.error) {
          if (responseJson.data.length) {
            // this.getThumbnails(responseJson.data);
            this.setState({ datas: responseJson.data, isLoading: false, noData: false });
          } else {
            this.setState({
              noData: true,
              isLoading: false, 
              datas: [],
            });
          }
        }
      })
      .catch((error) => {
        console.log('getVideos() Error', error);
      });
  }
  getThumbnails(videos) {
    const list_items = [];
    Promise.all(
      videos.map((video, idx) => {
        return fetch(
          `${SERVER_URL}/api/storage/videoLink?fileId=${video.cdn_id}-screenshot`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': Global.saveData.token
            }
          }
        )
          .then(response => {
            return response.json()
              .catch(e => {
                console.log(`.json() error:`, e);
                return null;
              });
          })
          .then(signedUrl => {
            if (signedUrl && signedUrl.url) {
              return {
                index: idx,
                id: video.id,
                otherId: video.user_id,
                primary: video.is_primary,
                imageUrl: signedUrl.url,
                videoUrl: `${SERVER_URL}/api/storage/videoLink?fileId=${video.cdn_id}`,
                name: 'NAME',
                time: 'TIME'
              }
            } else {
              return null;
            }
          });
      })
    )
      .then(assets => assets.filter(Boolean))
      .then(assets => {
        this.setState({ datas: assets, isLoading: false, noData: false });
      });
  }
  componentWillMount() {
    BackHandler.addEventListener('hardwareBackPress', this.backPressed);
  }
  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.backPressed);
  }
  backPressed = () => {
    this.props.navigation.replace("Chat");
    return true;
  }
  showUserVideo(url, user_id, id, primary) {
    this.props.navigation.navigate("MyVideoDetail", { url: url, otherId: user_id, id: id, primary })
  }
  addVideo() {

    // More info on all the options is below in the API Reference... just some common use cases shown here
    const options = {
      title: 'Select Picture',
      storageOptions: {
        skipBackup: true,
        path: 'images',
      },
    };

    ImagePicker.showImagePicker(options, (imagePickerResponse) => {
      if (imagePickerResponse.didCancel) {
        console.log('User cancelled image picker');
      } else if (imagePickerResponse.error) {
        console.log('ImagePicker Error: ', imagePickerResponse.error);
      } else if (imagePickerResponse.customButton) {
        console.log('User tapped custom button: ', imagePickerResponse.customButton);
      } else {
        uploadPhoto(imagePickerResponse)
          .then(() => {
            this.getVideos();
          });
      }
    });
  }
  onDeleteVideo(otherid) {
    Alert.alert(
      '',
      'Are you sure you want to delete this photo?',
      [
        { text: 'Delete', backgroundColor: '#FCDD80', onPress: () => this.deleteVideo(otherid) },
        { text: 'Cancel', backgroundColor: '#FCDD80', onPress: () => () => console.log('Cancel Pressed'), style: 'cancel' },
      ],
      { cancelable: false });
  }
  deleteVideo(otherid) {
    fetch(`${SERVER_URL}/api/video/removeMyVideo/${otherid}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': Global.saveData.token
      }
    }).then((response) => response.json())
      .then((responseJson) => {
        if (!responseJson.error) {
          this.getVideos()
        }
      })
      .catch((error) => {
        return
      });
  }
  gotoProfileSetting() {
    this.props.navigation.navigate("ProfileSetting");
  }

  gotoGpay() {
    this.props.navigation.navigate("screenGpay01");
  }
  
  gotoShop = () => {
    this.setState({
      visible: false
    })
    this.props.navigation.navigate('screenGpay01');
  }

  gotoMainMenu = (menu) => {
      this.updateLastLoggedInDate();
      this.props.navigation.replace(menu);
  }

  updateLastLoggedInDate = () => {
      fetch(`${SERVER_URL}/api/match/updateLastLoggedInDate`, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Authorization': Global.saveData.token
          },
      }).then((response) => response.json())
          .then((responseJson) => {
              if (!responseJson.error) {
                  return
              }
          })
          .catch((error) => {
              return
          });
  }
  render() {
    return (
      <ImageBackground source={bg} style={{width: '100%', height: '100%'}}>

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
                        {`This icons means the number of diamonds sent from you to ${this.state.otherSelectedUserName} is greater than the number of diamonds sent from ${this.state.otherSelectedUserName} to you. Currently, ${this.state.otherSelectedUserName} is not a fan of you`}
                    </Text>
                    <Text style={[styles.bodyFont, ]}>
                        {`Users cannot become fans mutually. In order for ${this.state.otherSelectedUserName} to become a fan of you, the number of diamonds sent from ${this.state.otherSelectedUserName} to you must be greater than the amount of diamonds ${this.state.otherSelectedUserName} received from you.`}
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
        <View style={{ marginTop: 40, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', justifyContent: 'space-between', }}>
          <TouchableOpacity style={{ width: 60, height: 40 }}
            onPress={() => this.gotoShop()}>
            <View style={{ flexDirection: 'row' }}>
              <Image source={diamond} style={{ width: 25, height: 25, marginLeft: 15, marginTop: 10 }} />
              <Text style={{ marginLeft: 10, color: '#000', fontSize: 12, fontWeight: 'bold', marginTop: 15 }}>{this.state.coinCount}</Text>
            </View>
          </TouchableOpacity>
          <Text style={{ justifyContent: 'center', marginLeft: -15 }}>{"PROFILE"}</Text>
          <TouchableOpacity style={{ width: 30, height: 40, alignItems: 'center', justifyContent: 'center', marginRight: 10 }}
            onPress={() => this.gotoProfileSetting()}>
            <Icon type="MaterialCommunityIcons" name="menu" style={{ color: "#000", marginTop: 5 }} />
          </TouchableOpacity>
        </View>
        {this.state.isLoading && (
          <View style={{
            flex: 1, justifyContent: 'center', alignSelf: 'center', margin: 40
          }}>
            <ActivityIndicator style={{ color: '#DE5859' }} />
          </View>
        )}
        <TouchableOpacity style={{flexDirection: 'row', justifyContent: 'center', backgroundColor: '#FFF', width: DEVICE_WIDTH, height: 40, marginTop: 10, paddingTop: 10, }}
          onPress={() => this.setState({
            showFanUsers: !this.state.showFanUsers,
          })}
        >
          <Text style={{fontSize: 16, marginRight: 20, }}>{`My Fans`}</Text>
          <Image source={this.state.showFanUsers? collapse: expand} style={{ width: 15, height: 15, marginTop: 3, }} />
        </TouchableOpacity>
        {(this.state.fanUsers.length !== 0) && this.state.showFanUsers && (
        <View style={{ height: 200, marginTop: 1,}}>
          <ScrollView style={{ backgroundColor: '#FFF', }} removeClippedSubviews={true}>
            {(this.state.fanUsers.length != 0) && (
              <FlatList
                numColumns={1}
                style={{ flex: 0, marginTop:10, }}
                removeClippedSubviews={true}
                data={this.state.fanUsers}
                initialNumToRender={this.state.fanUsers.length}
                renderItem={({ item: rowData, index }) => {
                  return (
                      <TouchableOpacity style={styles.listItem} onPress={() => this.gotoProfile(rowData)}>
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
                            <Text style={{ color: '#808080', marginTop: 3, fontSize: 16, }}>{rowData.fanMessage}</Text>
                          </View>}
                        </View>
                      </TouchableOpacity>
                  );
                }}
                keyExtractor={(item, index) => index}
              />)}
            <View style={{ height: 20 }} />
          </ScrollView>
        </View>)}
        <TouchableOpacity style={{flexDirection: 'row', justifyContent: 'center', backgroundColor: '#FFF', width: DEVICE_WIDTH, height: 40, marginTop: 1, paddingTop: 10, }}
          onPress={() => this.setState({
            showStarUsers: !this.state.showStarUsers,
          })}
        >
          <Text style={{fontSize: 16, marginRight: 20, }}>{`My Stars`}</Text>
          <Image source={this.state.showStarUsers? collapse: expand} style={{ width: 15, height: 15, marginTop: 3, }} />
        </TouchableOpacity>
        {(this.state.mutualUsers.length !== 0) && this.state.showStarUsers && (
        <View style={{ height: 200, marginTop: 1,}}>
          <ScrollView style={{ backgroundColor: '#FFF', }} removeClippedSubviews={true}>
            {(this.state.mutualUsers.length != 0) && (
            <FlatList
              numColumns={1}
              style={{ flex: 0, marginTop:10, }}
              removeClippedSubviews={true}
              data={this.state.mutualUsers}
              initialNumToRender={this.state.mutualUsers.length}
              renderItem={({ item: rowData, index }) => {
                return (
                  <TouchableOpacity style={styles.listItemMutual} onPress={() => this.gotoProfile(rowData)}>
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
                        <Text style={{ color: '#808080', marginTop: 3, fontSize: 16, }}>{rowData.fanMessage}</Text>
                      </View>}
                    </View>
                  </TouchableOpacity>
                );
              }}
              keyExtractor={(item, index) => index}
            />)}
            <View style={{ height: 20 }} />
          </ScrollView>
        </View>)}
        {this.state.noData && !this.state.isLoading && (
          <View style={{
            height: 40, justifyContent: 'center', alignSelf: 'center', margin: 45, backgroundColor: '#FFF',
          }}>
            <Text style={{
              margin:0,
              color: '#000',
              fontSize: 16,
              textAlign: "center",
              alignContent: 'center'
            }}>You dont have any photo. {'\n'} Please upload more than one so that others can find you more easily.</Text>
          </View>
        )}
        <ScrollView style={{ marginTop: 1, backgroundColor: '#FFF' }} removeClippedSubviews={true}>
          {(this.state.datas.length == 0) && (
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Image source={upload} style={{width: 160, height: 160, marginTop: 70}}></Image>
            </View>
          )}
          {(this.state.datas.length !== 0) && (
            <FlatList
              numColumns={2}
              style={{ flex: 0 }}
              removeClippedSubviews={true}
              data={this.state.datas}
              initialNumToRender={this.state.datas.length}
              renderItem={({ item: rowData }) => {
                return (
                  <TouchableOpacity style={{ width: DEVICE_WIDTH / 2 - 10, marginTop: 10, marginLeft: 5, marginRight: 5, }}
                    onPress={() => this.showUserVideo(GCS_BUCKET + rowData.cdn_id + '-screenshot', rowData.user_id, rowData.id, rowData.primary)}>
                    {/* <ImageBackground source={{ uri: rowData.imageUrl }} resizeMethod="resize" style={{ width: DEVICE_WIDTH / 2 - 20, height: (DEVICE_WIDTH / 2 - 20) * 1.5, marginTop: 3, marginLeft: 5, backgroundColor: '#5A5A5A' }}> */}
                    <ImageBackground source={{ uri: GCS_BUCKET +  rowData.cdn_id + '-screenshot'}} resizeMethod="resize" style={{ width: DEVICE_WIDTH / 2 - 20, height: (DEVICE_WIDTH / 2 - 20) * 1.5, marginTop: 3, marginLeft: 5, backgroundColor: '#5A5A5A' }}>
                      <View style={{ width: '100%', height: 30, marginTop: (DEVICE_WIDTH / 2 - 20) * 1.5 - 50, flexDirection: 'row' }}>
                        <View style={{ width: DEVICE_WIDTH / 2 - 60, height: 30, alignItems: 'center', justifyContent: 'center' }}>
                          {(rowData.is_primary == 1) && (
                            <View style={{ width: DEVICE_WIDTH, height: 40, alignItems: 'center', justifyContent: 'center', marginTop: 40, marginBottom: 40 }}>
                              <TouchableOpacity style={{ width: 80, height: 30, borderRadius: 25, backgroundColor: '#DE5859', alignItems: 'center', justifyContent: 'center' }}>
                                <Text style={{ fontSize: 14, color: '#fff', fontWeight: 'bold' }}>{"Primary"}</Text>
                              </TouchableOpacity>
                            </View>
                          )}
                        </View>
                        <TouchableOpacity
                          onPress={() => this.onDeleteVideo(rowData.id)}>
                          <Image source={b_delete} style={{ width: 30, height: 30 }} />
                        </TouchableOpacity>
                      </View>
                    </ImageBackground>
                  </TouchableOpacity>
                );
              }}
              keyExtractor={(item, index) => index}
            />)}
          <View style={{ height: 50 }} />
        </ScrollView>
        <TouchableOpacity style={{
          position: 'absolute', right: 15,
          bottom: Platform.select({ 'android': 90, 'ios': 105 }),
          width: 70, height: 70,
          backgroundColor: '#f00', borderRadius: 35,
          alignItems: 'center', justifyContent: 'center'
        }}
          onPress={() => this.addVideo()}>
          <Icon type="FontAwesome" name="plus" style={{ color: '#fff' }} />
        </TouchableOpacity>
        <Footer style={{ height: Platform.select({ 'android': 50, 'ios': 50 }) }}>
          <FooterTab>
            <Button badge style={{ backgroundColor: '#222F3F', borderRadius: 0 }} transparent onPress={() => this.gotoMainMenu("BrowseList")}>
              <Image source={b_browse} style={{ width: 25, height: 25, }} />
              <Text style={{ color: '#fff', fontSize: 6, fontWeight: 'bold', marginTop: 3 }}>{"BROWSE"}</Text>
            </Button>
            <Button badge style={{ backgroundColor: '#222F3F', borderRadius: 0 }} transparent onPress={() => this.gotoMainMenu("Income")}>
              <Image source={b_incoming} style={{ width: 25, height: 25 }} />
              <Text style={{ color: '#fff', fontSize: 6, fontWeight: 'bold', marginTop: 3 }}>{"INCOMING"}</Text>
            </Button>
            <Button badge style={{ backgroundColor: '#222F3F', borderRadius: 0 }} transparent onPress={() => this.gotoMainMenu("Match")}>
              <Image source={b_match} style={{ width: 25, height: 25 }} />
              <Text style={{ color: '#fff', fontSize: 6, fontWeight: 'bold', marginTop: 3 }}>{"MATCH"}</Text>
            </Button>
            <Button badge style={{ backgroundColor: '#222F3F', borderRadius: 0 }} transparent onPress={() => this.gotoMainMenu("Chat")}>
              {this.props.unreadFlag && (<View style={styles.badgeIcon}><Text style={{ color: '#FFF', textAlign: 'center', fontSize: 10, }}>{'N'}</Text></View>)}
              <Image source={b_chat} style={{ width: 25, height: 25 }} />
              <Text style={{ color: '#fff', fontSize: 6, fontWeight: 'bold', marginTop: 3 }}>{"CHAT"}</Text>
            </Button>
            <Button badge style={{ backgroundColor: '#222F3F', borderRadius: 0 }} transparent onPress={() => { }}>
              <Image source={b_myvideo} style={{ width: 25, height: 25, tintColor: '#B64F54' }} />
              <Text style={{ color: '#B64F54', fontSize: 8, fontWeight: 'bold', marginTop: 3 }}>{"PROFILE"}</Text>
            </Button>
          </FooterTab>
        </Footer>
      </ImageBackground>
    );
  }
}
const DEVICE_WIDTH = Dimensions.get('window').width;
// const DEVICE_HEIGHT = Dimensions.get('window').height;
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
  badgeIcon: {
    position: 'absolute',
    zIndex: 1000,
    top: -5,
    right: 15,
    width: 20,
    height: 20,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#B64F54'
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
    width: "100%",
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

const mapStateToProps = (state) => {
  const { unreadFlag } = state.reducer
  return { unreadFlag }
};

export default connect(mapStateToProps)(MyVideo);