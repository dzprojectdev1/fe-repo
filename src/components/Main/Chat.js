import React, { Component } from "react";
import {
  Footer,
  Button,
  FooterTab,
  Text,
} from "native-base";
import {
  BackHandler,
  Image,
  ScrollView,
  Platform,
  Dimensions,
  TextInput,
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  Alert
} from "react-native";
import { Badge } from 'react-native-elements';
import FastImage from 'react-native-fast-image';
import shorthash from 'shorthash';
import firebase from 'firebase';
import { connect } from 'react-redux';
import { SERVER_URL, GCS_BUCKET } from '../../config/constants';
// import OnlyGImage from '../../assets/images/OnlyGImage.png';
import hiddenMan from '../../assets/images/hidden_man.png';
import b_browse from '../../assets/images/browse.png';
import b_incoming from '../../assets/images/incoming.png';
import b_match from '../../assets/images/match.png';
import b_chat from '../../assets/images/chat.png';
import b_myvideo from '../../assets/images/myvideo.png';
import diamond from '../../assets/images/red_diamond_trans.png';
import heart from '../../assets/images/heart.png';
import Global from '../Global';

class Chat extends Component {
  constructor(props) {
    super(props);
    this.state = {
      datas: [],
      tmpData: [],
      searchText: '',
      alertMsg: 'Loading ...',
      coinCount: Global.saveData.coin_count,
      visible: false,
    };
  }

  static navigationOptions = {
    header: null
  };

  componentWillMount() {
    Global.saveData.nowPage = 'Chat';
    Global.saveData.prevpage = "Chat";
    BackHandler.addEventListener('hardwareBackPress', this.backPressed);
    this.getChatData();
  }

  componentDidMount() {
    firebase.database().ref().child('dz-chat-data').child(Global.saveData.u_id + '/')
      .on('value', (value) => {
        this.getChatData();
      });
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.backPressed);
  }

  backPressed = () => {
    this.props.navigation.navigate("Match");
    return true;
  }

  getChatData() {
    fetch(`${SERVER_URL}/api/chat/all`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': Global.saveData.token
      }
    }).then((response) => response.json())
      .then((responseJson) => {
        if (!responseJson.error) {
          this.getTumbnails(responseJson.data);
        }
      }).catch((error) => {
        return
      });
  }
  getTumbnails = (data) => {
    var list_items = [];
    for (var i = 0; i < data.length; i++) {
      let senderId = data[i].other_user_id;
      if (data[i].cdn_id) {
        list_items.push({
          index: i,
          imageUrl: GCS_BUCKET + 'thumb_64_' + data[i].cdn_id + '-screenshot',
          // videoUrl: vurl,
          sent: this.props.senders !== null ? ( this.props.senders.indexOf(JSON.stringify(senderId)) === -1 ? false : true) : false,
          data: data[i]
        });
      } else {
        list_items.push({
          index: i,
          imageUrl: null,
          sent: this.props.senders !== null ? ( this.props.senders.indexOf(JSON.stringify(senderId)) === -1 ? false : true) : false,
          // videoUrl: vurl,
          data: data[i]
        });
      }
    }
    this.setState({
      datas: list_items,
      tmpData: list_items,
      alertMsg: "There is no chat list.",
    });

    console.log(JSON.stringify(this.state.datas));
  }
  // getTumbnails = async (data) => {
  //   var list_items = [];
  //   for (var i = 0; i < data.length; i++) {
  //     let senderId = data[i].other_user_id;
  //     if (data[i].cdn_id) {
  //       var url = `${SERVER_URL}/api/storage/videoLink?fileId=${data[i].cdn_id}-screenshot`;
  //       // var vurl = `${SERVER_URL}/api/storage/videoLink?fileId=${data[i].cdn_id}`;
  //       await fetch(url, {
  //         method: 'GET',
  //         headers: {
  //           'Content-Type': 'application/json',
  //           'Authorization': Global.saveData.token
  //         }
  //       }).then((response) => response.json())
  //         .then((responseJson) => {
  //           list_items.push({
  //             index: i,
  //             imageUrl: responseJson.url,
  //             // videoUrl: vurl,
  //             sent: this.props.senders !== null ? ( this.props.senders.indexOf(JSON.stringify(senderId)) === -1 ? false : true) : false,
  //             data: data[i]
  //           });
  //         })
  //         .catch((error) => {
  //           alert(JSON.stringify(error))
  //           return
  //         });
  //     } else {
  //       list_items.push({
  //         index: i,
  //         imageUrl: null,
  //         sent: this.props.senders !== null ? ( this.props.senders.indexOf(JSON.stringify(senderId)) === -1 ? false : true) : false,
  //         // videoUrl: vurl,
  //         data: data[i]
  //       });
  //     }
  //   }
  //   this.setState({
  //     datas: list_items,
  //     tmpData: list_items,
  //     alertMsg: "There is no chat list.",
  //   });
  // }
  toggle() {
    Alert.alert("The UI is not supported yet")
  }
  onPlus() {
    Alert.alert("The UI is not supported yet")
  }
  onSearch(s_text) {
    var tmpData = this.state.tmpData;
    var list_itmes = [];
    for (var i = 0; i < tmpData.length; i++) {
      var name = tmpData[i].data.name;
      var message_text = tmpData[i].data.message_text;
      if (name.toLowerCase().indexOf(s_text.toLowerCase()) !== -1 || message_text.toLowerCase().indexOf(s_text.toLowerCase()) !== -1) {
        list_itmes.push(tmpData[i]);
      }
    }
    this.setState({ datas: list_itmes, searchText: s_text });
  }
  gotoChat(data) {
    Global.saveData.prevpage = "Chat";
    if (data.data.publish === 2) {
      Alert.alert(
        '',
        "You have been blocked by the user",
        [
          { text: 'OK', onPress: () => console.log('OK Pressed') },
        ],
        { cancelable: false },
      );
    } else {
      this.props.navigation.navigate("ChatDetail", { data: data })
    }
  }
  //////////////////////////////////////////////////
  gotoGpay() {
    this.props.navigation.replace("screenGpay01");
  }
  //////////////////////////////////////////////////
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
      <View style={styles.contentContainer}>
        <StatusBar translucent={true} backgroundColor='transparent' barStyle='dark-content' />
        <View style={{ marginTop: 40, alignItems: 'center', flexDirection: 'row' }}>
          <TouchableOpacity style={{ width: 80, height: 40 }}
            onPress={() => this.gotoShop()}>
            <View style={{ flexDirection: 'row' }}>
              <Image source={diamond} style={{ width: 25, height: 25, marginLeft: 15, marginTop: 10 }} />
              <Text style={{ marginLeft: 10, color: '#000', fontSize: 12, fontWeight: 'bold', marginTop: 15 }}>{this.state.coinCount}</Text>
            </View>
          </TouchableOpacity>
          <Text style={{ justifyContent: 'center', marginLeft: DEVICE_WIDTH * 0.22 }}>{"CHAT"}</Text>
        </View>
        <View style={styles.inputwrapper}>
          {/* <Icon type="Ionicons" name="ios-search" style={{color:"#808080", marginTop:5}}/> */}
          <TextInput
            style={{ marginLeft: 10, fontSize: 16, width: DEVICE_WIDTH - 40, color: '#000', overflow: 'hidden' }}
            value={this.state.searchText}
            placeholder={"search message"}
            onChangeText={text => this.onSearch(text)}
            placeholderTextColor="#808080"
            underlineColorAndroid="transparent"
          />
        </View>
        {this.state.datas.length === 0 ? (<View style={{
            flex: 1,
            alignItems: 'center'
        }}>
            <Text style={{ fontSize: 20, marginTop: 120 }}> {this.state.alertMsg} </Text>
            <Image source={heart} style={{width: 150, height: 150, marginTop: 50}}></Image>
        </View>) : (<ScrollView style={{ marginTop: 15 }} removeClippedSubviews={true}>
          {(this.state.datas.length != 0) && (
            <FlatList
              numColumns={1}
              style={{ flex: 0 }}
              removeClippedSubviews={true}
              data={this.state.datas}
              initialNumToRender={this.state.datas.length}
              renderItem={({ item: rowData }) => {
                return (
                  <TouchableOpacity style={styles.listItem} onPress={() => this.gotoChat(rowData)}>
                    <View style={{ width: 50, height: 50, alignItems: 'center', justifyContent: 'center' }}>
                      <Image source={rowData.imageUrl && (rowData.data.publish == 1) ? { uri: rowData.imageUrl } : hiddenMan} resizeMode="cover" style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: '#5A5A5A' }} />
                      {/* <FastImage 
                        source={rowData.imageUrl && (rowData.data.publish == 1) ? { uri: rowData.imageUrl, headers: { Authorization: shorthash.unique(rowData.imageUrl) }, priority: FastImage.priority.high, } : hiddenMan} 
                        resizeMode="cover" 
                        style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: '#5A5A5A' }} /> */}
                    </View>
                    <View style={styles.listItemName}>
                      <View style={{ width: DEVICE_WIDTH - 200, height: 40, marginLeft: 5, justifyContent: 'center', alignItems: 'center' }}>
                        <View style={{ width: DEVICE_WIDTH - 200 }}>
                          <Text numberOfLines={1} style={{ color: '#808080' }}>{(rowData.data.publish == 1) ? rowData.data.name: 'Unavailable user'}</Text>
                          <Text numberOfLines={1} style={{ fontSize: 12, color: '#808080' }}>{(rowData.data.publish == 1) ? rowData.data.message_text: ''}</Text>
                        </View>
                      </View>
                      <View style={{ flexDirection: 'column', width: 100, height: 40, marginLeft: 5, alignItems: 'center', justifyContent: 'center' }}>
                        {rowData.sent && (<View style={{ backgroundColor: '#B64F54', borderRadius: 15, width: 20, height: 20,  alignItems: 'center', justifyContent: 'center', }}><Text style={{color: '#FFF', fontSize: 10}}>{'N'}</Text></View>)}
                        <Text numberOfLines={1} style={{ fontSize: 12, color: '#808080' }}>{rowData.data.time_ago}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              }}
              keyExtractor={(item, index) => index}
            />)}
          <View style={{ height: 50 }} />
        </ScrollView>)}
        <Footer style={{ height: Platform.select({ 'android': 50, 'ios': 50 }) }}>
          <FooterTab>
            <Button style={{ backgroundColor: '#222F3F', borderRadius: 0 }} transparent onPress={() => this.gotoMainMenu("BrowseList")}>
              <Image source={b_browse} style={{ width: 25, height: 25, }} />
              <Text style={{ color: '#fff', fontSize: 6, fontWeight: 'bold', marginTop: 3 }}>{"BROWSE"}</Text>
            </Button>
            <Button style={{ backgroundColor: '#222F3F', borderRadius: 0 }} transparent onPress={() => this.gotoMainMenu("Income")}>
              <Image source={b_incoming} style={{ width: 25, height: 25 }} />
              <Text style={{ color: '#fff', fontSize: 6, fontWeight: 'bold', marginTop: 3 }}>{"INCOMING"}</Text>
            </Button>
            <Button style={{ backgroundColor: '#222F3F', borderRadius: 0 }} transparent onPress={() => this.gotoMainMenu("Match")}>
              <Image source={b_match} style={{ width: 25, height: 25 }} />
              <Text style={{ color: '#fff', fontSize: 6, fontWeight: 'bold', marginTop: 3 }}>{"MATCH"}</Text>
            </Button>
            <Button style={{ backgroundColor: '#222F3F', borderRadius: 0 }} transparent >
              {this.props.unreadFlag && (<View style={styles.badgeIcon}><Text style={{color: '#FFF', textAlign: 'center', fontSize: 10, }}>{'N'}</Text></View>)}
              <Image source={b_chat} style={{ width: 25, height: 25, tintColor: '#B64F54' }} />
              <Text style={{ color: '#B64F54', fontSize: 6, fontWeight: 'bold', marginTop: 3 }}>{"CHAT"}</Text>
            </Button>
            <Button style={{ backgroundColor: '#222F3F', borderRadius: 0 }} transparent onPress={() => this.gotoMainMenu("MyVideo")}>
              <Image source={b_myvideo} style={{ width: 25, height: 25 }} />
              <Text style={{ color: '#fff', fontSize: 6, fontWeight: 'bold', marginTop: 3 }}>{"PROFILE"}</Text>
            </Button>
            {/* <Button style={{ backgroundColor: '#222F3F', borderRadius: 0 }} transparent onPress={() => this.gotoGpay()}>
              <Image source={OnlyGImage} style={{ width: 25, height: 25 }} />
              <Text style={{ color: '#fff', fontSize: 6, fontWeight: 'bold', marginTop: 3 }}>{"GPAY"}</Text>
            </Button> */}
          </FooterTab>
        </Footer>
      </View>
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
  inputwrapper: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    height: 40,
    marginLeft: 10,
    marginTop: 10,
    paddingLeft: 15,
    width: DEVICE_WIDTH - 20,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#f00',
    fontSize: 18,
    color: '#000',
  },
  badgeIcon: {
    position:'absolute',
    zIndex: 1000,
    top:-5,
    right:15,
    width:20,
    height:20,
    borderRadius:15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#B64F54'
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
  listItemName: {    
    marginLeft: 10,
    paddingBottom: 20,
    flexDirection: 'row', 
    borderBottomColor: '#e8e8e8',
    borderBottomWidth: 0.5,
  }
});

const mapStateToProps = (state) => {
  const { unreadFlag, senders } = state.reducer
  return { unreadFlag, senders }
};

export default connect(mapStateToProps)(Chat);