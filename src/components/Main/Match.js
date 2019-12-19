import React, { Component } from "react";
import {
  Footer,
  Button,
  FooterTab,
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
  ImageBackground,
} from "react-native";
import { connect } from 'react-redux';
import hiddenMan from '../../assets/images/hidden_man.png';
import b_browse from '../../assets/images/browse.png';
import b_incoming from '../../assets/images/incoming.png';
import b_match from '../../assets/images/match.png';
import b_chat from '../../assets/images/chat.png';
import b_myvideo from '../../assets/images/myvideo.png';
import b_name from '../../assets/images/name.png';
import diamond from '../../assets/images/red_diamond_trans.png';
import search_photo from '../../assets/images/search_photo.png';
import bg from '../../assets/images/bg.jpg';
import yellow_star from '../../assets/images/yellow_star.png';
import Global from '../Global';

import { SERVER_URL, GCS_BUCKET } from '../../config/constants';

class Match extends Component {
  constructor(props) {
    super(props);
    this.state = {
      datas: [],
      alertMsg: 'Loading ...',
      coinCount: Global.saveData.coin_count,
      fanCount: Global.saveData.fan_count,
      visible: false,
    };
  }

  static navigationOptions = {
    header: null
  };
  componentDidMount() {
    Global.saveData.nowPage = 'Match';    

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

    this.getHeartUsers();
  }
  getHeartUsers = async () => {
    await fetch(`${SERVER_URL}/api/match/matches`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': Global.saveData.token
      }
    }).then((response) => response.json())
      .then((responseJson) => {
        if (!responseJson.error) {
          const length = responseJson.data.length;
          if (length === 0) {
            this.setState({
              alertMsg: "There is no match data."
            });
          } else {
            this.getTumbnails(responseJson.data)
          }
        }
      }).catch((error) => {
        return
      });
  }
  getTumbnails = async (data) => {
    var list_items = [];
    for (var i = 0; i < data.length; i++) {
      if (data[i].cdn_id && data[i].content_type == 1) {
        list_items.push({
          index: i,
          mid: data[i].id,
          otherId: data[i].other_user_id,
          imageUrl: GCS_BUCKET + data[i].cdn_id + '-screenshot',
          videoUrl: null,
          name: data[i].name,
          time: 'TIME',
          age: data[i].age,
          gender: data[i].gender,
          distance: data[i].distance,
          description: data[i].description,
          coin_count: data[i].coin_count,
          fan_count: data[i].fan_count,
          content_type: data[i].content_type,
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
                  imageUrl: GCS_BUCKET + data[i].cdn_id + '_128ss',
                  videoUrl: responseJson.url,
                  name: data[i].name,
                  age: data[i].age,
                  gender: data[i].gender,
                  description: data[i].description,
                  distance: data[i].distance,
                  coin_count: data[i].coin_count, 
                  fan_count: data[i].fan_count, 
                  content_type: data[i].content_type,
                });
            })
            .catch((error) => {
                alert("There is error, please try again!")
                return
        });
      } else {
        list_items.push({
          index: i,
          mid: data[i].id,
          otherId: data[i].other_user_id,
          imageUrl: null,
          videoUrl: null,
          name: data[i].name,
          time: 'TIME',
          age: data[i].age,
          gender: data[i].gender,
          distance: data[i].distance,
          description: data[i].description,
          coin_count: data[i].coin_count,
          fan_count: data[i].fan_count,
          content_type: data[i].content_type,
        });
      }

    }
    this.setState({ datas: list_items });
  }
  componentWillMount() {
    BackHandler.addEventListener('hardwareBackPress', this.backPressed);
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.backPressed);
  }

  backPressed = () => {
    this.props.navigation.replace("Income");
    return true;
  }

  showUserVideo(url, mid, otherId, name, imgurl, age, distance, gender, description, videoUrl, content_type) {
    Global.saveData.isMatchVideo = true;

    if (otherId != -1) {

      fetch(`${SERVER_URL}/api/match/getOtherUserData/${otherId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': Global.saveData.token
        }
      }).then((response) => response.json())
        .then((responseJson) => {
          if (!responseJson.error) {

            let newData = responseJson.data;
            this.props.navigation.replace(
              "IncomeDetail",
              {
                url: null,
                mid: mid,
                otherId: otherId,
                imageUrl: imgurl,
                videoUrl: videoUrl,
                content_type: content_type,
                name: name,
                age: age,
                gender: gender,
                distance: newData.distance,
                description: newData.description,
                country_name: newData.country_name,
                ethnicity_name: newData.ethnicity_name,
                language_name: newData.language_name,
                last_loggedin_date: newData.last_loggedin_date,
                coin_count: newData.coin_count,
                fan_count: newData.fan_count,
                coin_per_message: newData.coin_per_message,
              }
            )
          }
        }).catch((error) => {
          alert(JSON.stringify(error));
          return
        });
    }
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

  gotoMyFans = () => {
      this.props.navigation.replace("MyFans");
  }
  render() {
    return (
      <ImageBackground source={bg} style={{width: '100%', height: '100%'}}>
        <StatusBar translucent={true} backgroundColor='transparent' barStyle='dark-content' />
        <View style={{ marginTop: 40, alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', }}>
          <View style={{width: 100, flexDirection: 'row',}}>
            <TouchableOpacity style={{ width: 80, height: 40 }}
              onPress={() => this.gotoShop()}>
              <View style={{ flexDirection: 'row' }}>
                <Image source={diamond} style={{ width: 25, height: 25, marginLeft: 15, marginTop: 10 }} />
                <Text style={{ marginLeft: 10, color: '#000', fontSize: 12, fontWeight: 'bold', marginTop: 15 }}>{this.state.coinCount}</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={{ width: 50, height: 40 }}
              onPress={() => this.gotoMyFans()}>
              <View style={{ flexDirection: 'row' }}>
                <Image source={yellow_star} style={{ width: 20, height: 20, marginLeft: 15, marginTop: 12 }} />
                <Text style={{ marginLeft: 7, color: '#000', fontSize: 12, fontWeight: 'bold', marginTop: 14 }}>{this.state.fanCount}</Text>
              </View>
            </TouchableOpacity>
          </View>
          <View style={{ width: DEVICE_WIDTH - 130, height: 40, alignItems: 'center', justifyContent: 'center', marginLeft: -60, }}>
            <Text>{"MATCH"}</Text>
          </View>
          <View style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}>
            <Text>{''}</Text>
          </View>
        </View>
        {this.state.datas.length === 0 ? (<View style={{
          flex: 1,
          alignItems: 'center'
        }}>
          <Text style={{ fontSize: 16, marginTop: 90, color: '#f17f76' }}> {this.state.alertMsg} </Text>
          <Image source={search_photo} style={{width: 200, height: 200, marginTop: 50}}></Image>
        </View>) : (<ScrollView style={{ marginTop: 15, backgroundColor: '#FFF', }} removeClippedSubviews={true}>
          <FlatList
            numColumns={2}
            style={{ flex: 0 }}
            removeClippedSubviews={true}
            data={this.state.datas}
            initialNumToRender={this.state.datas.length}
            renderItem={({ item: rowData }) => {
              return (
                <TouchableOpacity style={{ width: DEVICE_WIDTH / 2 - 10, marginTop: 10, marginLeft: 5, marginRight: 5, }} onPress={() => this.showUserVideo(rowData.videoUrl, rowData.mid, rowData.otherId, rowData.name, rowData.imageUrl, rowData.age, rowData.distance, rowData.gender, rowData.description, rowData.videoUrl, rowData.content_type)}>
                  <Image source={rowData.imageUrl ? { uri: rowData.imageUrl } : hiddenMan} resizeMethod="resize" style={{ width: DEVICE_WIDTH / 2 - 20, height: (DEVICE_WIDTH / 2 - 20), marginTop: 3, marginLeft: 5, backgroundColor: '#5A5A5A' }} />
                  <View style={{ flexDirection: 'row', marginTop: 10, width: (DEVICE_WIDTH / 2 - 10) * 0.6, justifyContent: 'space-between' }}>
                    <Image source={b_name} style={{ width: 10, marginTop: 4, marginLeft: 2, height: 10, tintColor: '#B64F54' }} />
                    <Text style={{ fontSize: 12, marginLeft: 5, fontWeight: 'bold', color: '#B64F54' }}>{rowData.age + ""}</Text>
                    <Text style={{ fontSize: 12, marginLeft: 5, fontWeight: 'bold', color: '#B64F54' }}>{rowData.gender === 1 ? 'M' : 'F'}</Text>
                    {/* <Text style={{ fontSize: 12, marginLeft: 5, fontWeight: 'bold', color: '#B64F54' }} ellipsizeMode="tail" numberOfLines={1}>{((rowData.name).length > 6) ? (((rowData.name).substring(0, 6)) + '...') : rowData.name}</Text> */}
                    <Text style={{ fontSize: 12, marginLeft: 5, fontWeight: 'bold', color: '#B64F54' }} ellipsizeMode="tail" numberOfLines={1}>{rowData.name}</Text>
                    <Image source={diamond} style={{ width: 15, height: 15, marginTop: 2, marginLeft: 5 }} />
                    <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#B64F54' }} ellipsizeMode="tail" numberOfLines={1}>{rowData.coin_count}</Text>
                    {/* <Image source={yellow_star} style={{ width: 15, height: 15, marginLeft: 5 }} />
                    <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#B64F54' }} ellipsizeMode="tail" numberOfLines={1}>{rowData.fan_count}</Text> */}
                  </View>
                </TouchableOpacity>
              );
            }}
            keyExtractor={(item, index) => index}
          />
          <View style={{ height: 50 }} />
        </ScrollView>)}
        <Footer style={{ backgroundColor: '#222F3F', borderTopColor: '#222F3F', height: Platform.select({ 'android': 50, 'ios': 50 }) }}>
          <FooterTab>
            <Button badge style={{ backgroundColor: '#222F3F', borderRadius: 0 }} transparent onPress={() => this.gotoMainMenu("BrowseList")}>
              <Image source={b_browse} style={{ width: 25, height: 25, }} />
              <Text style={{ color: '#fff', fontSize: 6, fontWeight: 'bold', marginTop: 3 }}>{"BROWSE"}</Text>
            </Button>
            <Button badge style={{ backgroundColor: '#222F3F', borderRadius: 0 }} transparent onPress={() => this.gotoMainMenu("Income")}>
              <Image source={b_incoming} style={{ width: 25, height: 25 }} />
              <Text style={{ color: '#fff', fontSize: 6, fontWeight: 'bold', marginTop: 3 }}>{"INCOMING"}</Text>
            </Button>
            <Button badge style={{ backgroundColor: '#222F3F', borderRadius: 0 }} transparent onPress={() => { }}>
              <Image source={b_match} style={{ width: 25, height: 25, tintColor: '#B64F54' }} />
              <Text style={{ color: '#B64F54', fontSize: 6, fontWeight: 'bold', marginTop: 3 }}>{"MATCH"}</Text>
            </Button>
            <Button badge style={{ backgroundColor: '#222F3F', borderRadius: 0 }} transparent onPress={() => this.gotoMainMenu("Chat")}>
              {this.props.unreadFlag && (<View style={styles.badgeIcon}><Text style={{ color: '#FFF', textAlign: 'center', fontSize: 10, }}>{'N'}</Text></View>)}
              <Image source={b_chat} style={{ width: 25, height: 25 }} />
              <Text style={{ color: '#fff', fontSize: 6, fontWeight: 'bold', marginTop: 3 }}>{"CHAT"}</Text>
            </Button>
            <Button badge style={{ backgroundColor: '#222F3F', borderRadius: 0 }} transparent onPress={() => this.gotoMainMenu("MyVideo")}>
              <Image source={b_myvideo} style={{ width: 25, height: 25 }} />
              <Text style={{ color: '#fff', fontSize: 6, fontWeight: 'bold', marginTop: 3 }}>{"PROFILE"}</Text>
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
  }
});

const mapStateToProps = (state) => {
  const { unreadFlag } = state.reducer
  return { unreadFlag }
};

export default connect(mapStateToProps)(Match);