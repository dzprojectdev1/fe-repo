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
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar
} from "react-native";
import OnlyGImage from '../../assets/images/OnlyGImage.png';
import hiddenMan from '../../assets/images/hidden_man.png';
import b_browse from '../../assets/images/browse.png';
import b_incoming from '../../assets/images/incoming.png';
import b_match from '../../assets/images/match.png';
import b_chat from '../../assets/images/chat.png';
import b_age from '../../assets/images/age.png';
import b_myvideo from '../../assets/images/myvideo.png';
import b_name from '../../assets/images/name.png';
import diamond from '../../assets/images/red_diamond_trans.png';
import Global from '../Global';

import { SERVER_URL } from '../../config/constants';

class Match extends Component {
  constructor(props) {
    super(props);
    this.state = {
      datas: [],
      alertMsg: '',      
      coinCount: Global.saveData.coin_count,
      visible: false,
    };
  }

  static navigationOptions = {
    header: null
  };
  // async componentWillMount() {
  //   await this.getHeartUsers();
  // }
  componentDidMount() {
    Global.saveData.nowPage = 'Match';
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
      if (data[i].cdn_id) {
        var url = `${SERVER_URL}/api/storage/videoLink?fileId=${data[i].cdn_id}-screenshot`;
        var vurl = `${SERVER_URL}/api/storage/videoLink?fileId=${data[i].cdn_id}`;
        await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': Global.saveData.token
          }
        }).then((response) => response.json())
          .then((responseJson) => {
            if (responseJson.url) {
              list_items.push({
                index: i,
                mid: data[i].id,
                otherId: data[i].other_user_id,
                imageUrl: responseJson.url,
                name: data[i].name,
                time: 'TIME',
                age: data[i].age,
                gender: data[i].gender,
                distance: data[i].distance,
                description: data[i].description
              });
            }
          }).catch((error) => {
            return
          });
      } else {
        list_items.push({
          index: i,
          mid: data[i].id,
          otherId: data[i].other_user_id,
          imageUrl: null,
          name: data[i].name,
          time: 'TIME',
          age: data[i].age,
          gender: data[i].gender,
          distance: data[i].distance,
          description: data[i].description
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

  showUserVideo(url, mid, otherId, name, imgurl, age, distance, gender, description) {
    // fetch(url, {
    //   method: 'GET',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': Global.saveData.token
    //   }
    // }).then((response) => response.json())
    //   .then((responseJson) => {
    //     Global.saveData.isMatchVideo = true;
    //     this.props.navigation.navigate("IncomeDetail", { url: responseJson.url, mid: mid, otherId: otherId, imageUrl: imgurl, name: name, age: age, distance: distance });
    //   }).catch((error) => {
    //     alert("There is error, please try again!");
    //     return
    //   });
    Global.saveData.isMatchVideo = true;
    this.props.navigation.navigate("IncomeDetail",
      { url: null, mid: mid, otherId: otherId, imageUrl: imgurl, name: name, age: age, distance: distance, gender: gender, description: description }
    );
  }

  //////////////////////////////////////////////////
  gotoGpay() {
    this.props.navigation.navigate("screenGpay01");
  }
  //////////////////////////////////////////////////
  gotoShop = () => {
    this.setState({
      visible: false
    })
    this.props.navigation.navigate('screenGpay01');
  }
  render() {
    return (
      <View style={styles.contentContainer}>
        <StatusBar translucent={true} backgroundColor='transparent' barStyle='dark-content' />
        <View style={{ marginTop: 40, alignItems: 'center', flexDirection: 'row' }}>
          <TouchableOpacity style={{ width: 60, height: 40}}
              onPress={() => this.gotoShop()}>
              <View style={{ flexDirection: 'row' }}>
                  <Image source={diamond} style={{ width: 25, height: 25, marginLeft: 15, marginTop: 10 }} />
                  <Text style={{ marginLeft: 10, color: '#000', fontSize: 12, fontWeight: 'bold', marginTop: 15 }}>{this.state.coinCount}</Text>
              </View>
          </TouchableOpacity>
          <Text style={{ justifyContent: 'center', marginLeft: DEVICE_WIDTH * 0.3 }}>{"MATCH"}</Text>
        </View>
        {this.state.datas.length === 0 ? (<View style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <Text style={{ fontSize: 20, textAlignVertical: 'center' }}> {this.state.alertMsg} </Text>
        </View>) : (<ScrollView style={{ marginTop: 15 }} removeClippedSubviews={true}>
          <FlatList
            numColumns={2}
            style={{ flex: 0 }}
            removeClippedSubviews={true}
            data={this.state.datas}
            initialNumToRender={this.state.datas.length}
            renderItem={({ item: rowData }) => {
              return (
                <TouchableOpacity style={{ width: DEVICE_WIDTH / 2 - 10, marginTop: 10, marginLeft: 5, marginRight: 5, }} onPress={() => this.showUserVideo(rowData.videoUrl, rowData.mid, rowData.otherId, rowData.name, rowData.imageUrl, rowData.age, rowData.distance, rowData.gender, rowData.description)}>
                  <Image source={rowData.imageUrl ? { uri: rowData.imageUrl } : hiddenMan} resizeMethod="resize" style={{ width: DEVICE_WIDTH / 2 - 20, height: (DEVICE_WIDTH / 2 - 20), marginTop: 3, marginLeft: 5, backgroundColor: '#5A5A5A' }} />
                  <View style={{ flexDirection: 'row', marginTop: 10, width: (DEVICE_WIDTH / 2 - 10) * 0.6, justifyContent: 'space-between' }}>
                    <Image source={b_name} style={{ width: 10, marginTop: 4, marginLeft: 2, height: 10, tintColor: '#B64F54' }} />
                    <Text style={{ fontSize: 12, marginLeft: 5, fontWeight: 'bold', color: '#B64F54' }}>{rowData.age + ""}</Text>
                    <Text style={{ fontSize: 12, marginLeft: 5, fontWeight: 'bold', color: '#B64F54' }}>{rowData.gender === 1 ? 'M' : 'F'}</Text>
                    <Text style={{ fontSize: 12, marginLeft: 5, fontWeight: 'bold', color: '#B64F54' }} ellipsizeMode="tail" numberOfLines={1}>{rowData.name}</Text>
                  </View>
                </TouchableOpacity>
              );
            }}
            keyExtractor={(item, index) => index}
          />
          <View style={{ height: 50 }} />
        </ScrollView>)}
        <Footer style={{ backgroundColor: '#222F3F', borderTopColor: '#222F3F', height: Platform.select({ 'android': 50, 'ios': 30 }) }}>
          <FooterTab>
            <Button style={{ backgroundColor: '#222F3F', borderRadius: 0 }} transparent onPress={() => this.props.navigation.navigate("BrowseList")}>
              <Image source={b_browse} style={{ width: 25, height: 25, }} />
              <Text style={{ color: '#fff', fontSize: 6, fontWeight: 'bold', marginTop: 3 }}>{"BROWSE"}</Text>
            </Button>
            <Button style={{ backgroundColor: '#222F3F', borderRadius: 0 }} transparent onPress={() => this.props.navigation.navigate("Income")}>
              <Image source={b_incoming} style={{ width: 25, height: 25 }} />
              <Text style={{ color: '#fff', fontSize: 6, fontWeight: 'bold', marginTop: 3 }}>{"INCOMING"}</Text>
            </Button>
            <Button style={{ backgroundColor: '#222F3F', borderRadius: 0 }} transparent onPress={() => { }}>
              <Image source={b_match} style={{ width: 25, height: 25, tintColor: '#B64F54' }} />
              <Text style={{ color: '#B64F54', fontSize: 6, fontWeight: 'bold', marginTop: 3 }}>{"MATCH"}</Text>
            </Button>
            <Button style={{ backgroundColor: '#222F3F', borderRadius: 0 }} transparent onPress={() => this.props.navigation.navigate("Chat")}>
              <Image source={b_chat} style={{ width: 25, height: 25 }} />
              <Text style={{ color: '#fff', fontSize: 6, fontWeight: 'bold', marginTop: 3 }}>{"CHAT"}</Text>
            </Button>
            <Button style={{ backgroundColor: '#222F3F', borderRadius: 0 }} transparent onPress={() => this.props.navigation.navigate("MyVideo")}>
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
});
export default Match;
