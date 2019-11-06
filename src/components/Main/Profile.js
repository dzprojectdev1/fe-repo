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
  Image
} from "react-native";

import heart from '../../assets/images/heart.png';
import Global from '../Global';

import { SERVER_URL, GCS_BUCKET } from '../../config/constants';

class Profile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      id: '',
      name: '',
      datas: [],
      isLoading: true,
      noData: false,
      otherData: props.navigation.state.params.data,
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
      list_items.push({
        index: i,
        otherId: data[i].other_user_id,
        imageUrl: GCS_BUCKET + value[0] + '-screenshot',
        videoUrl: null,
        name: 'NAME',
        time: 'TIME'
      });
    }
    this.setState({
      datas: list_items,
      noData: false,
      isLoading: false
    });
  }
  // getTumbnails = async (data) => {

  //   var list_items = [];
  //   for (var i = 0; i < data.length; i++) {
  //     var value = Object.values(data[i]);
  //     var url = `${SERVER_URL}/api/storage/videoLink?fileId=${value[0]}-screenshot`;
  //     var vurl = `${SERVER_URL}/api/storage/videoLink?fileId=${value[0]}`;
  //     await fetch(url, {
  //       method: 'GET',
  //       headers: {
  //         'Content-Type': 'application/json',
  //         'Authorization': Global.saveData.token
  //       }
  //     }).then((response) => response.json())
  //       .then((responseJson) => {
  //         list_items.push({
  //           index: i,
  //           otherId: data[i].other_user_id,
  //           imageUrl: responseJson.url,
  //           videoUrl: vurl,
  //           name: 'NAME',
  //           time: 'TIME'
  //         });
  //       }).catch((error) => {
  //         return
  //       });
  //   }
  //   this.setState({
  //     datas: list_items,
  //     noData: false,
  //     isLoading: false
  //   });
  // }
  showUserVideo(index, url, otherId, datas) {
    // fetch(url, {
    //   method: 'GET',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': Global.saveData.token
    //   }
    // }).then((response) => response.json())
    //   .then((responseJson) => {
    //     this.props.navigation.navigate("ProfileDetail", { url: responseJson.url, otherId: otherId })
    //   })
    //   .catch((error) => {
    //     alert("There is error, please try again!");
    //     return
    //   });
    this.props.navigation.navigate("ProfileDetail", { index: index, url: url, otherId: otherId, datas: datas })
  }
  onBack() {
    // if (Global.saveData.prevpage === "ChatDetail" || Global.saveData.prevpage === "Browse" ) {
    //   this.props.navigation.pop();
    // }
    // else {
    //   Global.saveData.prePage = "Profile"
    //   this.props.navigation.replace(Global.saveData.prevpage);
    // }
    // this.props.navigation.pop();
    if (Global.saveData.prevpage == "ChatDetail") {
      this.props.navigation.replace(Global.saveData.prevpage, {
        data: {
          imageUrl: this.state.otherData.imageUrl,
          data: { 
            other_user_id: this.state.otherData.id, 
            name: this.state.otherData.name, 
            description: this.state.otherData.description,
            match_id: this.state.otherData.matchId,
          }
        }
      });
    } else if (Global.saveData.prevpage == "Browse") {
      this.props.navigation.replace(Global.saveData.prevpage, {
        data: {
          imageUrl: this.state.otherData.imageUrl,
          isMatched: this.state.otherData.isMatched, 
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
        mid: -1,
        country_name: this.state.otherData.country_name,
        ethnicity_name: this.state.otherData.ethnicity_name,
        language_name: this.state.otherData.language_name,
      });
    } else {
      this.props.navigation.pop();
    }
  }

  render() {
    return (
      <View style={styles.contentContainer}>
        <StatusBar translucent={true} backgroundColor='transparent' barStyle='dark-content' />
        <View style={{ height: 40, marginTop: Platform.select({ 'ios': '20%', 'android': '20%' }), flexDirection: 'row' }}>
          <TouchableOpacity style={{ width: 40, height: 40, marginLeft: 10, justifyContent: 'center', alignItems: 'center' }}
            onPress={() => this.onBack()} >
            <Icon type="Ionicons" name="ios-arrow-back" style={{ color: '#B64F54' }} />
          </TouchableOpacity>
          <View style={{ width: DEVICE_WIDTH - 100, height: 40, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 16 }}>{this.state.name}</Text>
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
          </View>
        </View>
        <ScrollView style={{ marginTop: 15 }} removeClippedSubviews={true}>
          {this.state.otherData.description && (
            <View style={{
              justifyContent: 'center',
              alignSelf: "center",
              alignItems: 'center',
              marginTop: 10,
              marginBottom: 10,
              padding: 10
            }}>
              <Text style={{ fontSize: 16, alignContent: 'center' }}>
                {this.state.otherData.description}
              </Text>
            </View>
          )}
          {this.state.isLoading && (
            <View style={{
              flex: 1, justifyContent: 'center', alignSelf: 'center', margin: 40
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
                fontSize: 20,
                marginTop: 50
              }}>{'This user does not have any'}</Text>
              <Text style={{
                fontSize: 20,
              }}>{' profile pictures.'}</Text>
              <Image source={heart} style={{width: 150, height: 150, marginTop: 100}}></Image>
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
                  <TouchableOpacity style={{ width: DEVICE_WIDTH / 2 - 10, marginTop: 10, marginLeft: 5, marginRight: 5, }} onPress={() => this.showUserVideo(index, rowData.imageUrl, rowData.otherId, this.state.datas)}>
                    <ImageBackground source={{ uri: rowData.imageUrl }} resizeMethod="resize" style={{ width: DEVICE_WIDTH / 2 - 20, height: (DEVICE_WIDTH / 2 - 20) * 1.5, marginTop: 3, marginLeft: 5, backgroundColor: '#5A5A5A' }}>
                    </ImageBackground>
                  </TouchableOpacity>
                );
              }}
              keyExtractor={(item, index) => index}
            />)}
          <View style={{ height: 50 }} />
        </ScrollView>
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
export default Profile;
