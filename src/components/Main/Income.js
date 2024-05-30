import React, {Component} from 'react';
import {Button} from 'native-base';
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
  Text,
} from 'react-native';
import {connect} from 'react-redux';
import b_browse from '../../assets/images/browse.png';
import b_incoming from '../../assets/images/incoming.png';
import b_match from '../../assets/images/match.png';
import b_chat from '../../assets/images/chat.png';
import b_myvideo from '../../assets/images/myvideo.png';
import b_name from '../../assets/images/name.png';
import hiddenMan from '../../assets/images/hidden_man.png';
import diamond from '../../assets/images/red_diamond_trans.png';
import search_photo from '../../assets/images/search_photo.png';
import bg from '../../assets/images/bg.jpg';
import yellow_star from '../../assets/images/yellow_star.png';
import Global from '../Global';

import {SERVER_URL, GCS_BUCKET} from '../../config/constants';

class Income extends Component {
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
    header: null,
  };

  componentDidMount() {
    Global.saveData.nowPage = 'Income';
    BackHandler.addEventListener('hardwareBackPress', this.backPressed);
    this.props.navigation.addListener('didFocus', this.getHeartUsers());

    fetch(`${SERVER_URL}/api/transaction/getDiamondCount`, {
      method: 'POST',
      headers: {
        'Content-type': 'application/x-www-form-urlencoded',
        Authorization: Global.saveData.token,
      },
    })
      .then(response => response.json())
      .then(responseJson => {
        if (!responseJson.error) {
          Global.saveData.coin_count = responseJson.data.coin_count;
          Global.saveData.fan_count = responseJson.data.fan_count;
          this.setState({
            coinCount: Global.saveData.coin_count,
            fanCount: Global.saveData.fan_count,
          });
        }
      })
      .catch(error => {
        return;
      });
    // this.getHeartUsers();
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.backPressed);
  }

  backPressed = () => {
    this.props.navigation.replace('BrowseList');
    return true;
  };

  getHeartUsers = () => {
    fetch(`${SERVER_URL}/api/match/getReceivedHearts`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: Global.saveData.token,
      },
    })
      .then(response => response.json())
      .then(responseJson => {
        console.log(responseJson);
        if (!responseJson.error) {
          this.getTumbnails(responseJson.data);
        } else if (responseJson.detail) {
          this.setState({
            alertMsg: 'Network Connection Confused.',
          });
        } else {
          this.setState({
            alertMsg: 'There are no incoming hearts.',
          });
        }
      })
      .catch(error => {
        return;
      });
  };

  getTumbnails = async data => {
    const list_items = [];
    for (let i = 0; i < data.length; i++) {
      if (data[i].cdn_filtered_id && data[i].content_type == 1) {
        list_items.push({
          index: i,
          otherId: data[i].other_user_id,
          imageUrl: GCS_BUCKET + data[i].cdn_filtered_id + '-screenshot',
          videoUrl: null,
          name: data[i].name,
          age: data[i].age,
          gender: data[i].gender,
          description: data[i].description,
          distance: data[i].distance,
          coin_count: data[i].coin_count,
          fan_count: data[i].fan_count,
          content_type: data[i].content_type,
        });
      } else if (data[i].cdn_filtered_id && data[i].content_type == 2) {
        const v_url =
          `${SERVER_URL}/api/storage/videoLink?fileId=` +
          data[i].cdn_filtered_id;
        await fetch(v_url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: Global.saveData.token,
          },
        })
          .then(response => response.json())
          .then(responseJson => {
            list_items.push({
              index: i,
              otherId: data[i].other_user_id,
              imageUrl: GCS_BUCKET + data[i].cdn_filtered_id + '_128ss',
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
          .catch(error => {
            alert('There is error, please try again!');
            return;
          });
      } else {
        list_items.push({
          index: i,
          otherId: data[i].other_user_id,
          imageUrl: null,
          videoUrl: null,
          name: data[i].name,
          age: data[i].age,
          gender: data[i].gender,
          description: data[i].description,
          distance: data[i].distance,
          coin_count: data[i].coin_count,
          fan_count: data[i].fan_count,
          content_type: data[i].content_type,
        });
      }
    }
    this.setState({datas: list_items});
  };

  showUserVideo(data) {
    Global.saveData.isMatchVideo = false;
    if (data.otherId != -1) {
      fetch(`${SERVER_URL}/api/match/getOtherUserData/${data.otherId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: Global.saveData.token,
        },
      })
        .then(response => response.json())
        .then(responseJson => {
          if (!responseJson.error) {
            let newData = responseJson.data;
            this.props.navigation.replace('IncomeDetail', {
              url: null,
              mid: -1,
              otherId: data.otherId,
              imageUrl: data.imageUrl,
              videoUrl: data.videoUrl,
              content_type: data.content_type,
              name: data.name,
              age: data.age,
              gender: data.gender,
              distance: newData.distance,
              description: newData.description,
              country_name: newData.country_name,
              ethnicity_name: newData.ethnicity_name,
              language_name: newData.language_name,
              last_loggedin_date: newData.last_loggedin_date,
              coin_count: newData.coin_count,
              fan_count: newData.fan_count,
              coin_per_message: newData.coin_per_message,
            });
          }
        })
        .catch(error => {
          alert(JSON.stringify(error));
          return;
        });
    }
  }

  gotoGpay() {
    Global.saveData.prevpage = 'Income';
    this.props.navigation.replace('ScreenGpay01');
  }

  gotoShop = () => {
    this.setState({
      visible: false,
    });
    Global.saveData.prevpage = 'Income';
    this.props.navigation.navigate('ScreenGpay01');
  };

  gotoMainMenu = menu => {
    this.updateLastLoggedInDate();
    this.props.navigation.replace(menu);
  };

  updateLastLoggedInDate = () => {
    fetch(`${SERVER_URL}/api/match/updateLastLoggedInDate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: Global.saveData.token,
      },
    })
      .then(response => response.json())
      .then(responseJson => {
        if (!responseJson.error) {
          return;
        }
      })
      .catch(error => {
        return;
      });
  };

  gotoMyFans = () => {
    console.log('inside');
    Global.saveData.prevpage = 'Income';
    this.props.navigation.replace('MyFans');
  };

  render() {
    return (
      <ImageBackground source={bg} style={{width: '100%', height: '100%'}}>
        <StatusBar
          translucent={true}
          backgroundColor="transparent"
          barStyle="dark-content"
        />
        <View
          style={{
            marginTop: 40,
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}>
          <View style={{width: 140, flexDirection: 'row'}}>
            <TouchableOpacity
              style={{width: 70, height: 40}}
              onPress={() => this.gotoShop()}>
              <View style={{flexDirection: 'row'}}>
                <Image
                  source={diamond}
                  style={{width: 25, height: 25, marginLeft: 10, marginTop: 10}}
                />
                <Text
                  style={{
                    marginLeft: 2,
                    color: '#000',
                    fontSize: 12,
                    fontWeight: 'bold',
                    marginTop: 10,
                  }}>
                  {this.state.coinCount}
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={{width: 70, height: 40}}
              onPress={() => this.gotoMyFans()}>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Image
                  source={yellow_star}
                  style={{width: 20, height: 20, marginLeft: 15, marginTop: 10}}
                />
                <Text
                  style={{
                    marginLeft: 7,
                    color: '#000',
                    fontSize: 12,
                    fontWeight: 'bold',
                    marginTop: 12,
                  }}>
                  {this.state.fanCount}
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          <Text
            style={{
              fontSize: 12,
              marginTop: 12,
              color: '#000',
              width: DEVICE_WIDTH - 130,
              height: 30,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            {'INCOMING HEARTS'}
          </Text>
          <View
            style={{
              width: 40,
              height: 40,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Text>{''}</Text>
          </View>
        </View>
        {this.state.datas.length === 0 ? (
          <View style={{flex: 1, alignItems: 'center'}}>
            <Text style={{fontSize: 16, marginTop: 90, color: '#f17f76'}}>
              {this.state.alertMsg}
            </Text>
            <Image
              source={search_photo}
              style={{width: 200, height: 200, marginTop: 50}}
            />
          </View>
        ) : (
          <ScrollView
            style={{marginTop: 15, backgroundColor: '#FFF'}}
            removeClippedSubviews={true}>
            <FlatList
              numColumns={2}
              style={{flex: 0}}
              data={this.state.datas}
              removeClippedSubviews={true}
              initialNumToRender={this.state.datas.length}
              renderItem={({item: rowData}) => {
                return (
                  <TouchableOpacity
                    style={{
                      width: DEVICE_WIDTH / 2 - 10,
                      marginTop: 10,
                      marginLeft: 5,
                      marginRight: 5,
                    }}
                    onPress={() => this.showUserVideo(rowData)}>
                    <Image
                      source={
                        rowData.imageUrl !== null
                          ? {uri: rowData.imageUrl}
                          : hiddenMan
                      }
                      resizeMethod="resize"
                      style={{
                        width: DEVICE_WIDTH / 2 - 20,
                        height: DEVICE_WIDTH / 2 - 20,
                        marginTop: 3,
                        marginLeft: 5,
                        backgroundColor: '#5A5A5A',
                      }}
                    />
                    <View
                      style={{
                        flexDirection: 'row',
                        marginTop: 10,
                        width: (DEVICE_WIDTH / 2 - 10) * 0.6,
                        justifyContent: 'space-between',
                      }}>
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'flex-start',
                          alignItems: 'flex-start',
                          marginLeft: 5,
                        }}>
                        <Image
                          source={b_name}
                          style={{
                            width: 10,
                            height: 10,
                            marginTop: 4,
                            tintColor: '#B64F54',
                          }}
                        />
                        <Text
                          style={{
                            fontSize: 12,
                            marginLeft: 5,
                            fontWeight: 'bold',
                            color: '#B64F54',
                          }}>
                          {rowData.age + ''}
                        </Text>
                        <Text
                          style={{
                            fontSize: 12,
                            marginLeft: 5,
                            fontWeight: 'bold',
                            color: '#B64F54',
                          }}>
                          {rowData.gender === 1 ? 'M' : 'F'}
                        </Text>
                        <Text
                          style={{
                            fontSize: 12,
                            marginLeft: 5,
                            fontWeight: 'bold',
                            color: '#B64F54',
                          }}
                          ellipsizeMode="tail"
                          numberOfLines={1}>
                          {rowData.name}
                        </Text>
                        <Image
                          source={diamond}
                          style={{
                            width: 15,
                            height: 15,
                            marginTop: 2,
                            marginLeft: 5,
                          }}
                        />
                        <Text
                          style={{
                            fontSize: 12,
                            fontWeight: 'bold',
                            color: '#B64F54',
                          }}
                          ellipsizeMode="tail"
                          numberOfLines={1}>
                          {rowData.coin_count}
                        </Text>
                        {/* <Image source={yellow_star} style={{ width: 15, height: 15, marginLeft: 5, }} />
                        <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#B64F54' }} ellipsizeMode="tail" numberOfLines={1}>{rowData.fan_count}</Text> */}
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              }}
              keyExtractor={(item, index) => index}
            />
            <View style={{height: 50}} />
          </ScrollView>
        )}

        <View
          style={{
            height: Platform.select({android: 50, ios: 50}),
            borderTopColor: '#222F3F',
            backgroundColor: '#222F3F',
          }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
            <Button
              badge
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 5,
                position: 'relative',
                backgroundColor: '#222F3F',
              }}
              onPress={() => this.gotoMainMenu('BrowseList')}
              transparent>
              <Image source={b_browse} style={{width: 25, height: 25}} />
              <Text
                style={{
                  color: '#fff',
                  fontSize: 6,
                  fontWeight: 'bold',
                  marginTop: 3,
                }}>
                {'BROWSE'}
              </Text>
            </Button>
            <Button
              badge
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 5,
                position: 'relative',
                backgroundColor: '#222F3F',
                borderRadius: 0,
                margin: 0,
                padding: 0,
              }}
              transparent>
              <Image
                source={b_incoming}
                style={{width: 25, height: 25, tintColor: '#B64F54'}}
              />
              <Text
                style={{
                  color: '#B64F54',
                  fontSize: 6,
                  fontWeight: 'bold',
                  marginTop: 3,
                }}>
                {'INCOMING'}
              </Text>
            </Button>
            <Button
              badge
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 5,
                position: 'relative',
                backgroundColor: '#222F3F',
                borderRadius: 0,
              }}
              transparent
              onPress={() => this.gotoMainMenu('Match')}>
              <Image source={b_match} style={{width: 25, height: 25}} />
              <Text
                style={{
                  color: '#fff',
                  fontSize: 6,
                  fontWeight: 'bold',
                  marginTop: 3,
                }}>
                {'MATCH'}
              </Text>
            </Button>
            <Button
              badge
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 5,
                position: 'relative',
                backgroundColor: '#222F3F',
                borderRadius: 0,
              }}
              transparent
              onPress={() => this.gotoMainMenu('Chat')}>
              {this.props.unreadFlag && (
                <View style={styles.badgeIcon}>
                  <Text
                    style={{color: '#fff', textAlign: 'center', fontSize: 10}}>
                    {'N'}
                  </Text>
                </View>
              )}
              <Image source={b_chat} style={{width: 25, height: 25}} />
              <Text
                style={{
                  color: '#fff',
                  fontSize: 6,
                  fontWeight: 'bold',
                  marginTop: 3,
                }}>
                {'CHAT'}
              </Text>
            </Button>
            <Button
              badge
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 5,
                position: 'relative',
                backgroundColor: '#222F3F',
                borderRadius: 0,
              }}
              transparent
              onPress={() => this.gotoMainMenu('MyVideo')}>
              <Image source={b_myvideo} style={{width: 25, height: 25}} />
              <Text
                style={{
                  color: '#fff',
                  fontSize: 6,
                  fontWeight: 'bold',
                  marginTop: 3,
                }}>
                {'PROFILE'}
              </Text>
            </Button>
          </View>
        </View>
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
    flexDirection: 'column',
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
    backgroundColor: '#B64F54',
  },
});

const mapStateToProps = state => {
  const {unreadFlag} = state.reducer;
  return {unreadFlag};
};

export default connect(mapStateToProps)(Income);
