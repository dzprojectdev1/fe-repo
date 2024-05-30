import React, {Component} from 'react';
import {Button} from 'native-base';
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
  Alert,
  Text,
} from 'react-native';
import {connect} from 'react-redux';
import {Badge} from 'react-native-elements';
import Icon from 'react-native-vector-icons/MaterialIcons';
// import ImagePicker from 'react-native-image-picker';
import * as ImagePicker from 'react-native-image-picker';
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
import yellow_star from '../../assets/images/yellow_star.png';
import yellow_heart_black from '../../assets/images/yellow_heart_black.png';
import yellow_star_black from '../../assets/images/yellow_star_black.png';
import dollar_sign from '../../assets/images/dollar_sign.png';
import video_add from '../../assets/images/video_add.png';
import video_player from '../../assets/images/video_player.png';
import Global from '../Global';

import {
  SERVER_URL,
  GCS_BUCKET,
  VIDEO_UPLOAD,
  BUCKET,
  GOOGLE_ACCESS_ID,
} from '../../config/constants';
import {uploadPhoto} from '../../util/upload';
import {uploadVideo} from '../../util/uploadVideo';
import Dialog, {
  DialogFooter,
  DialogButton,
  DialogContent,
  SlideAnimation,
} from 'react-native-popup-dialog';
import FlashMessage, {showMessage} from 'react-native-flash-message';
const includeExtra = true;

class MyVideo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      datas: [],
      isLoading: true,
      noData: false,
      coinCount: Global.saveData.coin_count,
      fanCount: Global.saveData.fan_count,
      visible: false,
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
      recordedUri: '',
      uploadCredentials: null,
      fileId: '',
    };
  }

  static navigationOptions = {
    header: null,
  };

  componentDidMount() {
    Global.saveData.nowPage = 'MyVideo';
    BackHandler.addEventListener('hardwareBackPress', this.backPressed);
    this.props.navigation.addListener('didFocus', this.getVideos());

    // if (Global.saveData.prevpage == 'Record') {
    //   this.showVideoUploadedMessage();
    // }

    // this.getBiggestFanUsers();
    // this.getStarUsers();

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
  }

  getBiggestFanUsers = () => {
    const details = {
      otherId: Global.saveData.u_id,
    };
    let formBody = [];
    for (const property in details) {
      const encodedKey = encodeURIComponent(property);
      const encodedValue = encodeURIComponent(details[property]);
      formBody.push(encodedKey + '=' + encodedValue);
    }
    formBody = formBody.join('&');
    fetch(`${SERVER_URL}/api/fan/getBiggestFanUsers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: Global.saveData.token,
      },
      body: formBody,
    })
      .then(response => response.json())
      .then(responseJson => {
        if (!responseJson.error) {
          this.setState({
            fanUsers: responseJson.data.fanUsers,
            mutualUsers: responseJson.data.mutualUsers,
            fanUsersCount: responseJson.data.fanUsers.length,
            mutualUsersCount: responseJson.data.mutualUsers.length,
          });
        }
      })
      .catch(error => {
        // alert(JSON.stringify(error));
        return;
      });
  };

  getStarUsers = () => {
    const details = {
      otherId: Global.saveData.u_id,
    };
    let formBody = [];
    for (const property in details) {
      const encodedKey = encodeURIComponent(property);
      const encodedValue = encodeURIComponent(details[property]);
      formBody.push(encodedKey + '=' + encodedValue);
    }
    formBody = formBody.join('&');
    fetch(`${SERVER_URL}/api/fan/getStarUsers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: Global.saveData.token,
      },
      body: formBody,
    })
      .then(response => response.json())
      .then(responseJson => {
        if (!responseJson.error) {
          this.setState({
            starUsers: responseJson.data.starUsers,
            starUsersCount: responseJson.data.starUsers.length,
          });
        }
      })
      .catch(error => {
        // alert(JSON.stringify(error));
        return;
      });
  };

  gotoBrowsDetail = row => {
    Global.saveData.prevpage = 'MyVideo';

    fetch(`${SERVER_URL}/api/match/getOtherUserData/${row.userId}`, {
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

          this.props.navigation.replace('Browse', {
            data: {
              imageUrl:
                row.imgUrl !== '' && row.imgUrl !== null
                  ? GCS_BUCKET + row.imgUrl + '-screenshot'
                  : null,
              detail: newData,
            },
          });
        }
      })
      .catch(error => {
        alert(JSON.stringify(error));
        return;
      });
  };

  showTip = row => {
    this.setState({
      otherSelectedUserName: row.name,
      showTip: true,
    });
  };

  getVideos() {
    fetch(`${SERVER_URL}/api/video/getMyAllVideo`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: Global.saveData.token,
      },
    })
      .then(response => response.json())
      .then(responseJson => {
        if (!responseJson.error) {
          if (responseJson.data.length) {
            // this.getThumbnails(responseJson.data);
            this.setState({
              datas: responseJson.data,
              isLoading: false,
              noData: false,
            });
          } else {
            this.setState({
              noData: true,
              isLoading: false,
              datas: [],
            });
          }
        }
      })
      .catch(error => {
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
              Authorization: Global.saveData.token,
            },
          },
        )
          .then(response => {
            return response.json().catch(e => {
              console.log('.json() error:', e);
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
                time: 'TIME',
              };
            } else {
              return null;
            }
          });
      }),
    )
      .then(assets => assets.filter(Boolean))
      .then(assets => {
        this.setState({datas: assets, isLoading: false, noData: false});
      });
  }

  componentWillUnmount() {
    // BackHandler.removeEventListener('hardwareBackPress', this.backPressed);
  }
  backPressed = () => {
    this.props.navigation.replace('Chat');
    return true;
  };

  showUserVideo(cdn_id, user_id, id, primary, content_type) {
    if (content_type == 2) {
      this.getVideoUrl(cdn_id, user_id, id, primary, content_type);
    } else {
      this.props.navigation.navigate('MyVideoDetail', {
        cdn_id: cdn_id,
        otherId: user_id,
        id: id,
        primary: primary,
        content_type: content_type,
        vUrl: null,
      });
    }
  }

  getVideoUrl = async (cdn_id, user_id, id, primary, content_type) => {
    const v_url = `${SERVER_URL}/api/storage/videoLink?fileId=` + cdn_id;
    await fetch(v_url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: Global.saveData.token,
      },
    })
      .then(response => response.json())
      .then(responseJson => {
        console.log('responseJson.url ', responseJson.url);
        this.props.navigation.navigate('MyVideoDetail', {
          cdn_id: cdn_id,
          otherId: user_id,
          id: id,
          primary: primary,
          content_type: content_type,
          vUrl: responseJson.url,
        });
      })
      .catch(error => {
        console.log('There is error, please try again!');
        return;
      });
  };

  addImage() {
    // More info on all the options is below in the API Reference... just some common use cases shown here
    // const options = {
    //   title: 'Select Picture',
    //   storageOptions: {
    //     skipBackup: true,
    //     path: 'images',
    //   },
    // };
    const options = {
      title: 'Select Picture',
      type: 'library',
      options: {
        selectionLimit: 0,
        mediaType: 'photo',
        includeBase64: false,
        includeExtra,
      },
    };

    ImagePicker.launchImageLibrary(options, imagePickerResponse => {
      if (imagePickerResponse.didCancel) {
        console.log('User cancelled image picker');
      } else if (imagePickerResponse.error) {
        console.log('ImagePicker Error: ', imagePickerResponse.error);
      } else if (imagePickerResponse.customButton) {
        console.log(
          'User tapped custom button: ',
          imagePickerResponse.customButton,
        );
      } else {
        uploadPhoto(imagePickerResponse).then(() => {
          this.getVideos();
        });
      }
    });
    
    // ImagePicker.showImagePicker(options, imagePickerResponse => {
    //   if (imagePickerResponse.didCancel) {
    //     console.log('User cancelled image picker');
    //   } else if (imagePickerResponse.error) {
    //     console.log('ImagePicker Error: ', imagePickerResponse.error);
    //   } else if (imagePickerResponse.customButton) {
    //     console.log(
    //       'User tapped custom button: ',
    //       imagePickerResponse.customButton,
    //     );
    //   } else {
    //     uploadPhoto(imagePickerResponse).then(() => {
    //       this.getVideos();
    //     });
    //   }
    // });
  }

  addVideo() {
    // More info on all the options is below in the API Reference... just some common use cases shown here
    // const options = {
    //   title: 'Select Video',
    //   takePhotoButtonTitle: 'Take Video...',
    //   mediaType: 'video',
    //   storageOptions: {
    //     skipBackup: true,
    //     path: 'images',
    //   },
    // };
    
    const options = {
      title: 'Select Video',
      type: 'library',
      options: {
        selectionLimit: 0,
        mediaType: 'video',
        formatAsMp4: true,
        includeExtra,
      },
    };

    ImagePicker.launchImageLibrary(options, imagePickerResponse => {
      if (imagePickerResponse.didCancel) {
        console.log('User cancelled image picker');
      } else if (imagePickerResponse.error) {
        console.log('ImagePicker Error: ', imagePickerResponse.error);
      } else if (imagePickerResponse.customButton) {
        console.log(
          'User tapped custom button: ',
          imagePickerResponse.customButton,
        );
      } else {
        // uploadPhoto(imagePickerResponse)
        //   .then(() => {
        //     this.getVideos();
        //   });
        console.log('imagePickerResponse ', imagePickerResponse);
        this.setState(
          {
            recordedUri: imagePickerResponse.uri,
          },
          function () {
            this.getUploadCredentials();
          },
        );
      }
    });

    // ImagePicker.showImagePicker(options, imagePickerResponse => {
    //   if (imagePickerResponse.didCancel) {
    //     console.log('User cancelled image picker');
    //   } else if (imagePickerResponse.error) {
    //     console.log('ImagePicker Error: ', imagePickerResponse.error);
    //   } else if (imagePickerResponse.customButton) {
    //     console.log(
    //       'User tapped custom button: ',
    //       imagePickerResponse.customButton,
    //     );
    //   } else {
    //     // uploadPhoto(imagePickerResponse)
    //     //   .then(() => {
    //     //     this.getVideos();
    //     //   });
    //     console.log('imagePickerResponse ', imagePickerResponse);
    //     this.setState(
    //       {
    //         recordedUri: imagePickerResponse.uri,
    //       },
    //       function () {
    //         this.getUploadCredentials();
    //       },
    //     );
    //   }
    // });
    // this.props.navigation.navigate("Record");
  }

  getUploadCredentials() {
    fetch(`${SERVER_URL}/api/storage/uploadCredentials?contentType=2`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: Global.saveData.token,
      },
    })
      .then(response => {
        return response.json();
      })
      .then(uploadCredentials => {
        if (uploadCredentials.message === 'Auth Failed') {
          throw new Error(uploadCredentials.message);
        } else {
          this.setState(
            {
              uploadCredentials,
            },
            function () {
              this.onUpload();
            },
          );
        }
      })
      .catch(error => {
        console.log('error', error);
      });
  }

  onUpload() {
    // this.showVideoUploadedMessage();
    console.log('recordedUri', this.state.recordedUri);
    console.log('uploadCredentials', this.state.uploadCredentials);
    const {policy, fileId} = this.state.uploadCredentials;
    const file = this.state.recordedUri;
    this.setState({
      fileId: fileId,
    });

    console.log('policy', policy);
    console.log('fileId', fileId);

    const formData = new FormData();
    formData.append('GoogleAccessId', GOOGLE_ACCESS_ID);
    formData.append('key', fileId);
    formData.append('bucket', BUCKET);
    formData.append('Content-Type', 'video/mp4');
    formData.append('policy', policy.base64);
    formData.append('signature', policy.signature);
    formData.append('file', {
      name: 'video.mp4',
      type: 'video/mp4',
      uri: this.state.recordedUri,
    });

    console.log('formData', formData);
    console.log('VIDEO_UPLOAD', VIDEO_UPLOAD);

    fetch(VIDEO_UPLOAD, {
      method: 'POST',
      mode: 'no-cors',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
      .then(res => {
        console.log('success', res);

        if (res.ok) {
          this.registerVideo();
        }
      })
      .catch(err => {
        console.log('error', err);
        return;
      });

    Alert.alert(
      '',
      'Video uploading is in progress. It usually take 2 to 10 minutes to upload video depends on the size of the video',
      [{text: 'OK', onPress: () => this.props.navigation.replace('MyVideo')}],
      {cancelable: false},
    );
  }
  /**
   *
   * @param {file data} fileData
   * inserting video data to tbl_video
   */
  registerVideo() {
    const details = {
      cdn_id: this.state.fileId,
    };
    let formBody = [];
    for (const property in details) {
      const encodedKey = encodeURIComponent(property);
      const encodedValue = encodeURIComponent(details[property]);
      formBody.push(encodedKey + '=' + encodedValue);
    }
    formBody = formBody.join('&');
    fetch(`${SERVER_URL}/api/upload/insertVideo`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: Global.saveData.token,
      },
      body: formBody,
    })
      .then(response => response.json())
      .then(responseJson => {
        if (!responseJson.error) {
          console.log('Response ', responseJson);
          // this.props.navigation.replace('MyVideo');
          this.getVideos();
        }
      })
      .catch(error => {
        console.log('Error ', error);
        return;
      });
  }

  onDeleteVideo(otherid) {
    Alert.alert(
      '',
      'Are you sure you want to delete this photo?',
      [
        {
          text: 'Delete',
          backgroundColor: '#FCDD80',
          onPress: () => this.deleteVideo(otherid),
        },
        {
          text: 'Cancel',
          backgroundColor: '#FCDD80',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
      ],
      {cancelable: false},
    );
  }

  deleteVideo(otherid) {
    fetch(`${SERVER_URL}/api/video/removeMyVideo/${otherid}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: Global.saveData.token,
      },
    })
      .then(response => response.json())
      .then(responseJson => {
        if (!responseJson.error) {
          this.getVideos();
        }
      })
      .catch(error => {
        return;
      });
  }

  gotoProfileSetting() {
    Global.saveData.prevpage = 'MyVideo';
    this.props.navigation.navigate('ProfileSetting');
  }

  gotoGpay() {
    Global.saveData.prevpage = 'MyVideo';
    this.props.navigation.navigate('ScreenGpay01');
  }

  gotoShop = () => {
    this.setState({
      visible: false,
    });
    Global.saveData.prevpage = 'MyVideo';
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

  showFanUsersList = () => {
    if (this.state.fanUsers.length > 0 && this.state.mutualUsers.length > 0) {
      this.setState({
        showFanUsers: !this.state.showFanUsers,
        showMutualUsers: !this.state.showMutualUsers,
      });
    } else if (
      this.state.fanUsers.length > 0 &&
      this.state.mutualUsers.length <= 0
    ) {
      this.setState({
        showFanUsers: !this.state.showFanUsers,
      });
    } else if (
      this.state.fanUsers.length <= 0 &&
      this.state.mutualUsers.length > 0
    ) {
      this.setState({
        showMutualUsers: !this.state.showMutualUsers,
      });
    } else {
      this.refs.fmLocalInstance.showMessage({
        message: 'You currently have no fans.',
        type: 'info',
      });
    }
  };

  showStarUsersList = () => {
    if (this.state.starUsers.length > 0) {
      this.setState({
        showStarUsers: !this.state.showStarUsers,
      });
    } else {
      this.refs.fmLocalInstance.showMessage({
        message: 'You currently have no stars.',
        type: 'info',
      });
    }
  };

  showVideoUploadedMessage = () => {
    this.refs.fmLocalInstance.showMessage({
      message:
        'Video is uploading. It will show up in your profile page in 1-10 minutes (depends on the size of the video).',
      type: 'info',
    });
  };

  gotoMyFans = () => {
    Global.saveData.prevpage = 'MyVideo';
    this.props.navigation.replace('MyFans');
  };

  gotoExDiamonds = () => {
    Global.saveData.prevpage = 'MyVideo';
    this.props.navigation.replace('ExchangeDiamonds');
  };

  render() {
    return (
      <ImageBackground source={bg} style={{width: '100%', height: '100%'}}>
        <Dialog
          visible={this.state.showTip}
          dialogAnimation={
            new SlideAnimation({
              slideFrom: 'top',
            })
          }>
          <View style={styles.screenOverlay}>
            <View style={styles.dialogPrompt}>
              <View
                style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'row',
                }}>
                <Image
                  source={admirable}
                  style={{
                    width: 25,
                    height: 25,
                    marginTop: 20,
                    marginRight: 10,
                  }}
                />
                <Text style={{marginTop: 20}}>{'mutual'}</Text>
              </View>
              <Text style={[styles.bodyFont]}>
                {`
                        This icon means that the number of diamonds you sent to ${this.state.otherSelectedUserName} is greater than the number of diamonds ${this.state.otherSelectedUserName} has sent to you.
                        Therefore, ${this.state.otherSelectedUserName} is not your fan.
                      `}
              </Text>
              <Text style={[styles.bodyFont]}>
                {`
                          Users cannot be mutual fans of each other.
                          In order for ${this.state.otherSelectedUserName} to become your fan,
                          the number of diamonds ${this.state.otherSelectedUserName} has sent to you must be greater than the number of diamonds ${this.state.otherSelectedUserName} has received from you.
                        `}
              </Text>
              <View style={styles.buttonsOuterView}>
                <View style={styles.buttonsInnerView}>
                  <TouchableOpacity
                    style={[styles.button]}
                    onPress={() =>
                      this.setState({
                        showTip: !this.state.showTip,
                      })
                    }>
                    <Text style={[styles.submitButtonText]}>{'Ok'}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </Dialog>

        <StatusBar
          translucent={true}
          backgroundColor="transparent"
          barStyle="dark-content"
        />
        <View
          style={{
            marginTop: 40,
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}>
          <View style={{width: 100, flexDirection: 'row'}}>
            <TouchableOpacity
              style={{width: 60, height: 40, marginRight: 15}}
              onPress={() => this.gotoShop()}>
              <View style={{flexDirection: 'row'}}>
                <Image
                  source={diamond}
                  style={{width: 25, height: 25, marginLeft: 15, marginTop: 10}}
                />
                <Text
                  style={{
                    marginLeft: 10,
                    color: '#000',
                    fontSize: 12,
                    fontWeight: 'bold',
                    marginTop: 12,
                  }}>
                  {this.state.coinCount}
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={{width: 80, height: 40}}
              onPress={() => this.gotoMyFans()}>
              <View style={{flexDirection: 'row'}}>
                <Image
                  source={yellow_star}
                  style={{width: 20, height: 20, marginLeft: 15, marginTop: 12}}
                />
                <Text
                  style={{
                    marginLeft: 7,
                    color: '#000',
                    fontSize: 12,
                    fontWeight: 'bold',
                    marginTop: 14,
                  }}>
                  {this.state.fanCount}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
          <Text
            style={{
              fontSize: 12,
              marginTop: 5,
              marginLeft: -60,
              color: '#000',
            }}>
            {'PROFILE'}
          </Text>
          <TouchableOpacity
            style={{
              width: 30,
              height: 40,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 10,
            }}
            onPress={() => this.gotoProfileSetting()}>
            <Icon name="menu" size={30} color="black" style={{color: '#000', marginTop: 5}} />
          </TouchableOpacity>
        </View>
        {this.state.isLoading && (
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignSelf: 'center',
              margin: 40,
            }}>
            <ActivityIndicator style={{color: '#DE5859'}} />
          </View>
        )}
        <ScrollView
          style={{backgroundColor: '#FFF', marginTop: 1}}
          removeClippedSubviews={true}>
          {this.state.noData && !this.state.isLoading && (
            <View
              style={{
                justifyContent: 'center',
                alignSelf: 'center',
                padding: 45,
                backgroundColor: '#FFF',
                width: '100%',
              }}>
              <Text
                style={{
                  margin: 0,
                  color: '#000',
                  fontSize: 16,
                  textAlign: 'center',
                  alignContent: 'center',
                }}>
                You dont have any photo. {'\n'} Please upload more than one so
                that others can find you more easily.
              </Text>
            </View>
          )}
          {this.state.datas.length == 0 && (
            <View style={{flex: 1, alignItems: 'center'}}>
              <Image
                source={upload}
                style={{width: 160, height: 160, marginTop: 70}}
              />
            </View>
          )}
          {this.state.datas.length !== 0 && (
            <FlatList
              numColumns={2}
              style={{flex: 0}}
              removeClippedSubviews={true}
              data={this.state.datas}
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
                    onPress={() =>
                      this.showUserVideo(
                        rowData.cdn_id,
                        rowData.user_id,
                        rowData.id,
                        rowData.primary,
                        rowData.content_type,
                      )
                    }>
                    {/* <ImageBackground source={{ uri: rowData.imageUrl }} resizeMethod="resize" style={{ width: DEVICE_WIDTH / 2 - 20, height: (DEVICE_WIDTH / 2 - 20) * 1.5, marginTop: 3, marginLeft: 5, backgroundColor: '#5A5A5A' }}> */}
                    <ImageBackground
                      source={{
                        uri: GCS_BUCKET + rowData.cdn_id + '-screenshot',
                      }}
                      resizeMethod="resize"
                      style={{
                        width: DEVICE_WIDTH / 2 - 20,
                        height: (DEVICE_WIDTH / 2 - 20) * 1.5,
                        marginTop: 3,
                        marginLeft: 5,
                        backgroundColor: '#5A5A5A',
                      }}>
                      <View
                        style={{
                          width: '100%',
                          height: 30,
                          marginTop: (DEVICE_WIDTH / 2 - 20) * 1.5 - 50,
                          flexDirection: 'row',
                        }}>
                        <View
                          style={{
                            width: DEVICE_WIDTH / 2 - 60,
                            height: 30,
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}>
                          {rowData.is_primary == 1 && (
                            <View
                              style={{
                                width: DEVICE_WIDTH,
                                height: 40,
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginTop: 40,
                                marginBottom: 40,
                              }}>
                              <TouchableOpacity
                                style={{
                                  width: 80,
                                  height: 30,
                                  borderRadius: 25,
                                  backgroundColor: '#DE5859',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}>
                                <Text
                                  style={{
                                    fontSize: 14,
                                    color: '#fff',
                                    fontWeight: 'bold',
                                  }}>
                                  {'Primary'}
                                </Text>
                              </TouchableOpacity>
                            </View>
                          )}
                        </View>
                        <TouchableOpacity
                          onPress={() => this.onDeleteVideo(rowData.id)}>
                          <Image
                            source={b_delete}
                            style={{width: 30, height: 30}}
                          />
                        </TouchableOpacity>
                      </View>
                      {rowData.content_type == 2 && (
                        <Image
                          source={video_player}
                          style={{
                            width: 30,
                            height: 30,
                            position: 'absolute',
                            top: ((DEVICE_WIDTH / 2 - 20) * 1.5) / 2 - 15,
                            left: (DEVICE_WIDTH / 2 - 20) / 2 - 15,
                          }}
                        />
                      )}
                    </ImageBackground>
                  </TouchableOpacity>
                );
              }}
              keyExtractor={(item, index) => index}
            />
          )}
          <View style={{height: 20}} />
        </ScrollView>
        <TouchableOpacity
          style={{
            position: 'absolute',
            left: 15,
            bottom: Platform.select({android: 90, ios: 105}),
            width: 70,
            height: 70,
            borderRadius: 35,
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onPress={() => this.gotoExDiamonds()}>
          <Image source={dollar_sign} style={{width: 90, height: 90}} />
        </TouchableOpacity>
        {/* <TouchableOpacity style={{
          position: 'absolute', right: 100,
          bottom: Platform.select({ 'android': 90, 'ios': 105 }),
          width: 70, height: 70,
          borderRadius: 35,
          alignItems: 'center', justifyContent: 'center'
        }}
          onPress={() => this.addVideo()}>
          <Image source={video_add} style={{width: 85, height: 85, }} />
        </TouchableOpacity> */}
        <TouchableOpacity
          style={{
            position: 'absolute',
            right: 15,
            bottom: Platform.select({android: 90, ios: 105}),
            width: 70,
            height: 70,
            backgroundColor: '#f00',
            borderRadius: 35,
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onPress={() => this.addImage()}>
          <Icon name="add" size={40} style={{color: '#fff'}} />
        </TouchableOpacity>

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
              transparent
              onPress={() => this.gotoMainMenu('BrowseList')}>
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
              transparent
              onPress={() => this.gotoMainMenu('Income')}>
              <Image source={b_incoming} style={{width: 25, height: 25}} />
              <Text
                style={{
                  color: '#fff',
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
              transparent>
              <Image
                source={b_myvideo}
                style={{width: 25, height: 25, tintColor: '#B64F54'}}
              />
              <Text
                style={{
                  color: '#B64F54',
                  fontSize: 6,
                  fontWeight: 'bold',
                  marginTop: 3,
                }}>
                {'PROFILE'}
              </Text>
            </Button>
          </View>
        </View>
        <FlashMessage
          ref="fmLocalInstance"
          position="bottom"
          animated={true}
          autoHide={true}
          style={{marginBottom: 50}}
        />
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
    backgroundColor: '#B64F54',
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
    height: Dimensions.get('window').height,
    backgroundColor: 'black',
    opacity: 0.9,
  },
  dialogPrompt: {
    ...Platform.select({
      ios: {
        opacity: 0.9,
        backgroundColor: 'rgb(222,222,222)',
        borderRadius: 15,
      },
      android: {
        borderRadius: 5,
        backgroundColor: 'white',
      },
    }),
    marginHorizontal: 20,
    marginTop: 150,
    padding: 10,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 16,
    color: 'black',
  },
  bodyFont: {
    fontSize: 16,
    color: 'black',
    marginTop: 20,
  },
  textMessageInput: {
    marginTop: 10,
    height: 80,
    width: '100%',
    paddingHorizontal: 10,
    textAlignVertical: 'top',
    borderWidth: 0.5,
    borderColor: '#000',
    ...Platform.select({
      ios: {
        borderRadius: 15,
        backgroundColor: 'rgba(166, 170, 172, 0.9)',
      },
      android: {
        borderRadius: 10,
        backgroundColor: 'white',
      },
    }),
  },
  textInput: {
    height: 40,
    width: 60,
    paddingHorizontal: 10,
    textAlignVertical: 'bottom',
    ...Platform.select({
      ios: {
        borderRadius: 15,
        backgroundColor: 'rgba(166, 170, 172, 0.9)',
      },
      android: {},
    }),
  },
  buttonsOuterView: {
    flexDirection: 'row',
    ...Platform.select({
      ios: {},
      android: {
        justifyContent: 'flex-end',
      },
    }),
    width: '100%',
  },
  buttonsDivider: {
    ...Platform.select({
      ios: {
        width: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
      },
      android: {
        width: 20,
      },
    }),
  },
  buttonsInnerView: {
    flexDirection: 'row',
    ...Platform.select({
      ios: {
        borderTopWidth: 0.5,
        flex: 1,
      },
      android: {},
    }),
  },
  button: {
    flexDirection: 'column',
    justifyContent: 'center',

    alignItems: 'center',
    ...Platform.select({
      ios: {flex: 1},
      android: {},
    }),
    marginTop: 5,
    padding: 10,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#61bfa9',
  },
  submitButtonText: {
    color: '#61bfa9',
    fontWeight: '600',
    fontSize: 16,
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

const mapStateToProps = state => {
  const {unreadFlag} = state.reducer;
  return {unreadFlag};
};

export default connect(mapStateToProps)(MyVideo);
