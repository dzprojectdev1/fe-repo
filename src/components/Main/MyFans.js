import React, { Component } from "react";
import {
    Text
} from "native-base";

import { 
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
} from "react-native";
import Dialog, { SlideAnimation } from 'react-native-popup-dialog';
import FlashMessage from 'react-native-flash-message';

import goback from '../../assets/images/BackOther.png';
import Global from '../Global';
import diamond from '../../assets/images/red_diamond_trans.png';
import crown from '../../assets/images/crown.png';
import hiddenMan from '../../assets/images/hidden_man.png';
import admirable from '../../assets/images/admirable_icon.png';
import collapse from '../../assets/images/collapse.png';
import expand from '../../assets/images/expand.png';
import yellow_heart_black from '../../assets/images/yellow_heart_black.png';
import yellow_star_black from '../../assets/images/yellow_star_black.png';
import { SERVER_URL, GCS_BUCKET } from '../../config/constants'

class MyFans extends Component {

  constructor(props) {
    super(props);
    this.state = {
        fanUsers: [],
        mutualUsers: [],
        starUsers: [],
        fanUsersCount: 0,
        mutualUsersCount: 0,
        starUsersCount: 0,
        showTip: false,
        otherSelectedUserName: '',
        showFanUsers: false,
        showMutualUsers: false,
        showStarUsers: false,
    };
  }

  static navigationOptions = {
    header: null
  };

  componentWillMount() {
    Global.saveData.nowPage = 'MyFans';
    BackHandler.addEventListener('hardwareBackPress', this.backPressed);
  }
  
  componentDidMount() {
    this.props.navigation.addListener('didFocus', (playload) => {
    });
    
    this.getBiggestFanUsers();
    this.getStarUsers();

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
          Global.saveData.fan_count = responseJson.data.fan_count;
          this.setState({
              coinCount: Global.saveData.coin_count,
              fanCount: Global.saveData.fan_count,
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
            mutualUsersCount: responseJson.data.mutualUsers.length,
          })
        }
      })
      .catch((error) => {
        // alert(JSON.stringify(error));
        return
      });
  }

  getStarUsers = () => {
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
    fetch(`${SERVER_URL}/api/fan/getStarUsers`, {
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
            starUsers: responseJson.data.starUsers,
            starUsersCount: responseJson.data.starUsers.length,
          })
        }
      })
      .catch((error) => {
        // alert(JSON.stringify(error));
        return
      });
  }

  gotoBrowsDetail = row => {
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

          this.props.navigation.replace("Browse", { 
            data: {
              imageUrl: (row.imgUrl !== '' && row.imgUrl !== null) ? GCS_BUCKET + row.imgUrl + '-screenshot': null,
              detail: newData,
            }
          });
        }
      }).catch((error) => {
        alert(JSON.stringify(error));
        return
      });
  }

  showTip = row => {
    this.setState({
      otherSelectedUserName: row.name,
      showTip: true,
    })
  }

  componentWillMount() {
    BackHandler.addEventListener('hardwareBackPress', this.backPressed);
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.backPressed);
  }

  backPressed = () => {
    this.props.navigation.navigate(Global.saveData.nowPage);
    return true;
  }
 
  goBack() {
    if (Global.saveData.nowPage == 'Browse' || Global.saveData.nowPage == 'BrowseList') {
      this.props.navigation.replace("BrowseList");
    } else if (Global.saveData.nowPage == 'Match') {
      this.props.navigation.replace("Match");
    } else if (Global.saveData.nowPage == 'Chat' || Global.saveData.nowPage == 'ChatDetail' || Global.saveData.nowPage == 'ChatScreen') {
      this.props.navigation.replace("Chat");
    } else if (Global.saveData.nowPage == 'MyVideo') {
      this.props.navigation.replace("MyVideo");
    } else if (Global.saveData.nowPage == 'Income') {
      this.props.navigation.replace("Income");
    } else if (Global.saveData.nowPage == 'ProfileSetting') {
      this.props.navigation.replace("MyVideo");
    } else {
      this.props.navigation.navigate(Global.saveData.nowPage);
    }
  }

  showFanUsersList = () => {
    if (this.state.fanUsers.length > 0 && this.state.mutualUsers.length > 0) {
      this.setState({
        showFanUsers: !this.state.showFanUsers,
        showMutualUsers: !this.state.showMutualUsers,
      })
    } else if (this.state.fanUsers.length > 0 && this.state.mutualUsers.length <= 0) {
      this.setState({
        showFanUsers: !this.state.showFanUsers,
      })
    } else if (this.state.fanUsers.length <= 0 && this.state.mutualUsers.length > 0) {
      this.setState({
        showMutualUsers: !this.state.showMutualUsers,
      })
    } else {
      this.refs.fmLocalInstance.showMessage({
        message: "You currently have no fans.",
        type: "info",
      });
    }
  }

  showStarUsersList = () => {
    if (this.state.starUsers.length > 0) {
      this.setState({
        showStarUsers: !this.state.showStarUsers,
      })
    } else {
      this.refs.fmLocalInstance.showMessage({
        message: "You currently have no stars.",
        type: "info",
      });
    }
  }

  render() {
    return (
      <View style={styles.contentContainer}>
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
                        {`
                          This icon means that the number of diamonds you sent to ${this.state.otherSelectedUserName} is greater than the number of diamonds ${this.state.otherSelectedUserName} has sent to you.
                          Therefore, ${this.state.otherSelectedUserName} is not your fan.
                        `}
                    </Text>
                    <Text style={[styles.bodyFont, ]}>
                        {`
                          Users cannot be mutual fans of each other.
                          In order for ${this.state.otherSelectedUserName} to become your fan,
                          the number of diamonds ${this.state.otherSelectedUserName} has sent to you must be greater than the number of diamonds ${this.state.otherSelectedUserName} has received from you.
                        `}
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
        <StatusBar  backgroundColor="transparent" barStyle="dark-content" ></StatusBar>
        <View style = {{alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', height: 40, backgroundColor: '#fff', }}>
            <TouchableOpacity onPress={() => this.goBack()}>
            <Image source={goback} style={{ width: 20, height: 20, tintColor: '#000', marginLeft: 25}} />
            </TouchableOpacity>
            <View style={{ width: DEVICE_WIDTH - 130, height: 40, alignItems: 'center', justifyContent: 'center', marginLeft: -60, }}>
            <Text style={{ color: '#000', fontSize: 15, fontWeight: 'bold', marginLeft: 20, textAlign:'left', justifyContent:'center' }}>{"Stars and Fans"}</Text>
            </View>
            <View style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}>
            <Text>{''}</Text>
            </View>
        </View>
        <ScrollView style={{ backgroundColor: '#FFF', marginTop: 1, }} removeClippedSubviews={true}>
          <TouchableOpacity style={{flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#FFF', width: DEVICE_WIDTH, height: 40, paddingTop: 10, borderBottomWidth: 1, borderBottomColor: '#f7f7f7' }}
            onPress={() => this.showFanUsersList()}
          >
            <View style={{flexDirection: 'row', marginLeft: 20, width: 200, }}>
              <Image source={yellow_star_black} style={{width: 20, height: 20, marginRight: 15, }} />
              <Text style={{fontSize: 16, marginRight: 20, }}>{`My Fans (${this.state.fanUsersCount})`}</Text>
            </View>
            <Image source={this.state.showFanUsers? collapse: expand} style={{ width: 15, height: 15, marginTop: 3, marginRight: 20, }} />
          </TouchableOpacity>
            {(this.state.fanUsers.length != 0) && (this.state.showFanUsers) && (
              <FlatList
                numColumns={1}
                style={{ flex: 0, marginTop:10, }}
                removeClippedSubviews={true}
                data={this.state.fanUsers}
                initialNumToRender={this.state.fanUsers.length}
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
            {(this.state.mutualUsers.length != 0) && (this.state.showMutualUsers) && (
              <FlatList
                numColumns={1}
                style={{ flex: 0, marginTop:10, }}
                removeClippedSubviews={true}
                data={this.state.mutualUsers}
                initialNumToRender={this.state.mutualUsers.length}
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
          
          <TouchableOpacity style={{flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#FFF', width: DEVICE_WIDTH, height: 40, paddingTop: 10, borderBottomWidth: 1, borderBottomColor: '#f7f7f7' }}
            onPress={() => this.showStarUsersList() }
          >
            <View style={{flexDirection: 'row', marginLeft: 20, width: 200, }}>
              <Image source={yellow_heart_black} style={{width: 18, height: 18, marginRight: 17, }} />
              <Text style={{fontSize: 16, marginRight: 20, }}>{`My Stars (${this.state.starUsersCount})`}</Text>
            </View>
            <Image source={this.state.showStarUsers? collapse: expand} style={{ width: 15, height: 15, marginTop: 3, marginRight: 20, }} />
          </TouchableOpacity>
            {(this.state.starUsers.length != 0) && (this.state.showStarUsers) && (
            <FlatList
              numColumns={1}
              style={{ flex: 0, marginTop:10, }}
              removeClippedSubviews={true}
              data={this.state.starUsers}
              initialNumToRender={this.state.starUsers.length}
              renderItem={({ item: rowData, index }) => {
                return (
                  <TouchableOpacity style={styles.listItemMutual} onPress={() => this.gotoBrowsDetail(rowData)}>
                    <View style={{ width: 50, height: 50, alignItems: 'center', justifyContent: 'center', paddingTop: (index == 0)? 25: 10, }}>
                      <Text style={{fontSize: 16, color: '#000'}}>{(parseInt(index) + 1) + '.'}</Text>
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
                        <Text style={{ color: '#808080', marginTop: 3, fontSize: 16, flexWrap: 'wrap', width: DEVICE_WIDTH - 100, }}>{'My fan message "' + rowData.fanMessage + '"'}</Text>
                      </View>}
                    </View>
                  </TouchableOpacity>
                );
              }}
              keyExtractor={(item, index) => index}
            />)}
          <View style={{ height: 20 }} />
        </ScrollView>
        <FlashMessage ref="fmLocalInstance" position="bottom" animated={true} autoHide={true} style={{marginBottom: 50,}} />
      </View>
    );
  }
}

const DEVICE_WIDTH = Dimensions.get('window').width;
const DEVICE_HEIGHT = Dimensions.get('window').height;
const styles = StyleSheet.create({

  contentContainer: {
    marginTop: 25,
    width: '100%',
    height: '100%',
    backgroundColor: '#eee',
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
export default MyFans;
