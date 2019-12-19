import React, { Component } from "react";
import {
  Footer,
  Button,
  FooterTab,
  Icon,
  Text
} from "native-base";
import {
  ImageBackground,
  BackHandler,
  Image,
  Platform,
  Dimensions,
  ScrollView,
  View,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  TextInput,
  Alert,
  FlatList,
  Modal,
} from "react-native";
import { Dropdown } from 'react-native-material-dropdown';
import Dialog, { DialogFooter, DialogButton, DialogContent, SlideAnimation } from 'react-native-popup-dialog';
import { connect } from 'react-redux';
import b_browse from '../../assets/images/browse.png';
import b_incoming from '../../assets/images/incoming.png';
import b_match from '../../assets/images/match.png';
import b_chat from '../../assets/images/chat.png';
import b_myvideo from '../../assets/images/myvideo.png';
import diamond from '../../assets/images/red_diamond_trans.png';
import bg from '../../assets/images/bg.jpg';
import yellow_star from '../../assets/images/yellow_star.png';
import amazon from '../../assets/images/amazon.png';
import paypal from '../../assets/images/paypal.png';
import Global from '../Global';

import { SERVER_URL, GCS_BUCKET } from '../../config/constants';
import FlashMessage, { showMessage } from 'react-native-flash-message';
import FastImage from "react-native-fast-image";

class ExchangeDiamonds extends Component {
  constructor(props) {
    super(props);
    this.state = {
      datas: [],
      isLoading: true,
      noData: false,
      coinCount: Global.saveData.coin_count,
      fanCount: Global.saveData.fan_count,
      visible: false,
      showTip: false,
      errorMsg: false,
      msgError: '',
      amountData: [],
      amount: '',
      email: '',
      typeData: [],
      type: '',
      coin_per_message: Global.saveData.coin_per_message,
      showConfirmEmail: false,
      confirmEmail: '',
      sendAmount: 0,
    };
  }

  static navigationOptions = {
    header: null
  };

  componentDidMount() {
    Global.saveData.nowPage = 'ExchangeDiamonds';

    this.getExchageHistory();

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

  getExchageHistory = () => {
    fetch(`${SERVER_URL}/api/transaction/getExchangeHistory`, {
      method: 'POST',
      headers: {
          'Content-type': 'application/x-www-form-urlencoded',
          'Authorization': Global.saveData.token
      }
    }).then((response) => response.json())
      .then((responseJson) => {
        if (!responseJson.error) {
          if (responseJson.data) {
            this.setState({
              datas: responseJson.data,
            });
          }
        }
      })
      .catch((error) => {
        return
      });
  }

  componentWillMount() {
    BackHandler.addEventListener('hardwareBackPress', this.backPressed);
    this.get_amount();
    this.get_type();
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.backPressed);
  }

  backPressed = () => {
    this.props.navigation.replace("ProfileSetting");
    return true;
  }

  gotoProfileSetting() {
    this.props.navigation.navigate("ProfileSetting");
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

  get_amount = () => {
    var itmes = [];
    var data = [
      '$5 - 5,000',
      '$15 - 15,000',
      '$25 - 25,000',
      '$50 - 50,000',
    ]
    for (var i = 0; i < 4; i++) {
      itmes.push({ value: data[i] })
    }
    this.setState({ amountData: itmes })
  }

  validationEmail = email => {
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  }

  emailCheck = email => {
    if (this.validationEmail(email)) {
      this.setState({
        email: email,
        errorMsg: false,
        msgError: ''
      })
    } else {
      this.setState({
        email: email,
        errorMsg: true,
        msgError: 'Your email is not valid.'
      })
    }
  }

  emailConfirm = email => {
    if (this.validationEmail(email)) {
      this.setState({
        confirmEmail: email,
        errorMsg: false,
        msgError: ''
      })
    } else {
      this.setState({
        confirmEmail: email,
        errorMsg: true,
        msgError: 'Your email is not valid.'
      })
    }
  }

  get_type = () => {
    var itmes = [];
    var data = [
      'Amazon',
      'Paypal'
    ]
    var icons = [
      amazon,
      paypal
    ]
    for (var i = 0; i < 2; i++) {
      itmes.push({ value: data[i], icon: icons[i] })
    }
    this.setState({ typeData: itmes })
  }

  formValidation = () => {
    if (this.state.amount == '') {
      Alert.alert(
        '',
        'You have to select one of the amount list.',
        [
          { text: 'Ok', backgroundColor: '#FCDD80', onPress: () => console.log('Ok Pressed'), style: 'cancel' },
        ],
        { cancelable: false });
      return
    }
    if (this.state.email == '') {
      Alert.alert(
        '',
        'You have to input email address.',
        [
          { text: 'Ok', backgroundColor: '#FCDD80', onPress: () => console.log('Ok Pressed'), style: 'cancel' },
        ],
        { cancelable: false });
      return
    }
    if (!this.validationEmail(this.state.email)) {
      Alert.alert(
        '',
        'You have to input validate email address.',
        [
          { text: 'Ok', backgroundColor: '#FCDD80', onPress: () => console.log('Ok Pressed'), style: 'cancel' },
        ],
        { cancelable: false });
      return
    }
    if (this.state.type == '') {
      Alert.alert(
        '',
        'You have to select one of the type list.',
        [
          { text: 'Ok', backgroundColor: '#FCDD80', onPress: () => console.log('Ok Pressed'), style: 'cancel' },
        ],
        { cancelable: false });
      return
    }

    var { sendAmount, amount } = this.state;
    switch(amount) {
      case '$5 (': 
      sendAmount = 5;
        break;
        case '$15 (':
          sendAmount = 15;
          break;
          case '$25 (':
            sendAmount = 25;
            break;
            case '$50 (':
              sendAmount = 50;
              break;
    }

    if (this.state.coinCount < sendAmount * 1000) {
      Alert.alert(
        '',
        'You dont have enough diamonds to exchange.',
        [
          { text: 'Ok', backgroundColor: '#FCDD80', onPress: () => () => console.log('Ok Pressed'), style: 'cancel' },
        ],
        { cancelable: false });
      return
    }

    this.setState({
      sendAmount: sendAmount,
      showConfirmEmail: true,
    })
  }

  submit = () => {
    this.setState({
      showConfirmEmail: false,
    })
    if (this.state.email !== this.state.confirmEmail) {
      Alert.alert(
        '',
        'Please confirm your email again.',
        [
          { text: 'Ok', backgroundColor: '#FCDD80', onPress: () => () => console.log('Ok Pressed'), style: 'cancel' },
        ],
        { cancelable: false });
      return
    }

    var details = {
      'amount': this.state.sendAmount,
      'email': this.state.email,
      'type': this.state.type
    };
    var formBody = [];
    for (var property in details) {
      var encodedKey = encodeURIComponent(property);
      var encodedValue = encodeURIComponent(details[property]);
      formBody.push(encodedKey + "=" + encodedValue);
    }
    formBody = formBody.join("&");
    fetch(`${SERVER_URL}/api/transaction/exchangeDiamonds`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': Global.saveData.token
      },
      body: formBody,
    }).then((response) => response.json())
      .then((responseJson) => {
        if (!responseJson.error) {
          if (responseJson.data.exchangeAvailable) {
            if (responseJson.data.coin_count) {
              Global.saveData.coin_count = responseJson.data.coin_count;
            }
            if (responseJson.data.exchangeHistory) {
              Alert.alert(
                '',
                'Your request has been submitted successfully. Please allow 5-7 business days to review your request. Once approved, you will receive your gift card in your email.',
                [
                  // { text: 'Ok', backgroundColor: '#FCDD80', onPress: () => this.setState({
                  //     coinCount: Global.saveData.coin_count,
                  //     datas: responseJson.data.exchangeHistory,
                  //     amount: '',
                  //     email: '',
                  //     type: '',
                  //   })
                  // },
                  { text: 'Ok', backgroundColor: '#FCDD80', onPress: () => this.props.navigation.replace('ExchangeDiamonds') },
                ],
                { cancelable: false });
            }
          } else {
            Alert.alert(
              '',
              responseJson.message,
              [
                { text: 'Ok', backgroundColor: '#FCDD80', onPress: () => console.log('Ok Pressed'), style: 'cancel' },
              ],
              { cancelable: false });
            return
          }
        }
      })
      .catch((error) => {
        // alert(JSON.stringify(error));
        return
      });
  }

  changeDateFormat = param => {
    var monthNames = [
      "Jan", "Feb", "Mar",
      "Apr", "May", "Jun", 
      "Jul", "Aug", "Sep", 
      "Oct", "Nov", "Dec"
    ];

    var date = new Date(param);
  
    var day = date.getDate();
    var monthIndex = date.getMonth();
    var year = date.getFullYear();
    var hours = date.getHours();
    var minutes = date.getMinutes();
  
    return monthNames[monthIndex] + ' ' + day + ' ' + year + ' ' + hours + ':' + minutes;
  }

  render() {
    return (
      <ImageBackground source={bg} style={{width: '100%', height: '100%'}}>
        <StatusBar translucent={true} backgroundColor='transparent' barStyle='dark-content' />
        <Dialog
          visible={this.state.showConfirmEmail}
          dialogAnimation={new SlideAnimation({
            slideFrom: 'top',
          })}
        >
            <View style={styles.screenOverlay}>
                <View style={styles.dialogPrompt}>
                    <View style={{ alignItems: 'center', justifyContent: 'center', flexDirection: 'row', }}>
                      <Text style={{marginTop: 20, }}>{'Confirm Email'}</Text>
                    </View>
                    <TextInput
                        style={styles.textMessageInput}
                        editable
                        onChangeText={(text) => this.emailConfirm(text)}
                    />       
                    { this.state.errorMsg && <Text style={styles.requiredSent}>* {this.state.msgError} </Text> } 
                    <View style={styles.buttonsOuterView}>
                        <View style={styles.buttonsInnerView}>
                            <TouchableOpacity
                                style={[
                                    styles.button, 
                                ]}
                                onPress={ () =>
                                    this.setState({
                                        showConfirmEmail: !this.state.showConfirmEmail
                                    })}>
                                <Text
                                    style={[
                                        styles.cancelButtonText,
                                    ]}>
                                    {'Cancel'}
                                </Text>
                            </TouchableOpacity>
                            <View style={styles.buttonsDivider} />
                            <TouchableOpacity
                                style={[
                                    styles.button,
                                ]}
                                onPress={ () => this.submit()}>
                                <Text
                                    style={[
                                        styles.submitButtonText,
                                    ]}>
                                    {'Confirm'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>
        </Dialog>
        <View style={{ marginTop: 40, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', justifyContent: 'space-between', }}>
          <View style={{width: 100, flexDirection: 'row',}}>
            <TouchableOpacity style={{ width: 60, height: 40, marginRight: 10, }}
              onPress={() => this.gotoShop()}>
              <View style={{ flexDirection: 'row' }}>
                <Image source={diamond} style={{ width: 25, height: 25, marginLeft: 10, marginTop: 10 }} />
                <Text style={{ marginLeft: 5, color: '#000', fontSize: 12, fontWeight: 'bold', marginTop: 14 }}>{this.state.coinCount}</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={{ width: 50, height: 40 }}
              onPress={() => this.gotoMyFans()}>
              <View style={{ flexDirection: 'row' }}>
                <Image source={yellow_star} style={{ width: 20, height: 20, marginLeft: 10, marginTop: 12 }} />
                <Text style={{ marginLeft: 5, color: '#000', fontSize: 12, fontWeight: 'bold', marginTop: 14 }}>{this.state.fanCount}</Text>
              </View>
            </TouchableOpacity>
          </View>
          <Text style={{ justifyContent: 'center', marginLeft: -50, fontSize: 12, marginTop: 5, }}>{"REQUEST GIFT CARDS"}</Text>
          <TouchableOpacity style={{ width: 30, height: 40, alignItems: 'center', justifyContent: 'center', marginRight: 10 }}
            onPress={() => this.gotoProfileSetting()}>
            <Icon type="MaterialCommunityIcons" name="menu" style={{ color: "#000", marginTop: 5 }} />
          </TouchableOpacity>
        </View>
        <View style={{ width: DEVICE_WIDTH, height: '100%', marginTop: 10, backgroundColor: '#FFF' }}>
          <ScrollView style={{ backgroundColor: '#FFF', }} removeClippedSubviews={true}>
            <View style={{ width: DEVICE_WIDTH - 40, marginLeft: 20, marginTop: 40, marginBottom: 20, borderWidth: 0.5, borderColor: '#dfdfdf' }}>
              <View style={{ width: DEVICE_WIDTH - 80, marginLeft: 20, marginTop: 10 }}>
                <View>
                  <Text style={{ color: '#808080', fontSize: 14 }}>{"Amount"}</Text>
                </View>
                <View>
                  {/* <Dropdown
                    containerStyle={{ width: "100%", marginTop: -15 }}
                    label=' '
                    pickerStyle={{ marginTop: -50, }}
                    style={{ color: '#808080', fontSize: 10 }}
                    inputContainerStyle={{ borderBottomColor: '#808080', }}
                    baseColor="#DE5859"//indicator color
                    textColor="#000"
                    data={this.state.amountData}
                    onChangeText={(amount) => this.setState({ amount })}
                    value={this.state.amount}
                    dropdownPosition={-4}
                  /> */}
                  <Dropdown
                        dropdownPosition={0}
                        containerStyle={{
                            marginTop: 10,
                            width: '100%',
                            backgroundColor: '#FFFFFF',
                            borderRadius: 0,
                            borderStyle: 'solid',
                            borderBottomWidth: 1,
                            borderBottomColor: '#EDEDED',
                            height: 40,
                            justifyContent: 'center',
                            paddingBottom: 4
                        }}
                        inputContainerStyle={{
                            borderBottomColor: 'transparent',
                            paddingLeft: 4
                        }}
                        data={this.state.amountData}
                        onChangeText={(amount) => this.setState({amount: amount.props.children[0].props.children[1]})}
                        renderBase={({value}) => {
                            return (
                              <Text>{value}</Text>
                            )
                        }}
                        valueExtractor={({value, icon}) => {
                            var arrVal = value.split(' - ');
                            return (
                                <Text
                                    style={{
                                        textAlign: 'center'
                                    }}>
                                    <Text>  {arrVal[0] + ' ('}</Text>
                                    <Image
                                        style={{
                                            width: 20,
                                            height: 20,
                                        }}
                                        source={diamond} />
                                    <Text>  {arrVal[1] + ')'}</Text>
                                </Text>
                            )
                        }}
                        />
                </View>
              </View>
              <View style={{ width: DEVICE_WIDTH - 80, marginLeft: 20, marginTop: 20 }}>
                <View>
                  <Text style={{ color: '#808080', fontSize: 12 }}>{"Email"}</Text>
                </View>
                <View style={styles.SectionStyle}>
                  <TextInput style={{ width: '100%' }} onChangeText={(value) => this.emailCheck(value)} value={this.state.email} />
                </View>         
                { this.state.errorMsg && <Text style={styles.requiredSent}>* {this.state.msgError} </Text> } 
              </View>
              <View style={{ width: DEVICE_WIDTH - 80, marginLeft: 20, marginTop: 10 }}>
                <View>
                  <Text style={{ color: '#808080', fontSize: 14 }}>{"Type"}</Text>
                </View>
                <View>
                  {/* <Dropdown
                    containerStyle={{ width: "100%", marginTop: -15 }}
                    label=' '
                    pickerStyle={{ marginTop: -25, height: 100, }}
                    style={{ color: '#808080', fontSize: 10 }}
                    inputContainerStyle={{ borderBottomColor: '#808080', }}
                    baseColor="#DE5859"//indicator color
                    textColor="#000"
                    data={this.state.typeData}
                    onChangeText={(type) => this.setState({ type })}
                    value={this.state.type}
                    dropdownPosition={-4}
                  /> */}
                  <Dropdown
                    dropdownPosition={0}
                    containerStyle={{
                        marginTop: 10,
                        width: '100%',
                        backgroundColor: '#FFFFFF',
                        borderRadius: 0,
                        borderStyle: 'solid',
                        borderBottomWidth: 1,
                        borderBottomColor: '#EDEDED',
                        height: 40,
                        justifyContent: 'center',
                        paddingBottom: 4
                    }}
                    inputContainerStyle={{
                        borderBottomColor: 'transparent',
                        paddingLeft: 4
                    }}
                    pickerStyle={{ height: 100, }}
                    data={this.state.typeData}
                    onChangeText={(type) => this.setState({type: type.props.children[1].props.children[1]})}
                    renderBase={({value}) => {
                        return (
                          <Text>  {value}</Text>
                        )
                    }}
                    valueExtractor={({value, icon}) => {
                        return (
                            <Text
                                style={{
                                    textAlign: 'center'
                                }}>
                                <Image
                                    style={{
                                        width: 20,
                                        height: 20,
                                        paddingRight: 10,
                                        paddingTop: 5
                                    }}
                                    source={icon} />
                                <Text>  {value}</Text>
                            </Text>
                        )
                    }}
                  />
                </View>
              </View>
              <View style={{ width: DEVICE_WIDTH - 80, marginLeft: 20, marginTop: 20, marginBottom: 20, flexDirection: 'row', justifyContent: 'center' }} >
                <Button
                  style={{ backgroundColor: '#DE5859', alignItems: 'center', justifyContent: 'center', borderRadius: 5, padding: 10 }}
                  loading={this.state.isLoading}
                  onPress={() => this.formValidation()}
                >
                  <Text style={{ color: '#fff', fontSize: 14, fontWeight: 'bold', marginTop: 3 }}>{"Submit"}</Text>
                </Button>
              </View>
            </View>
            <View>
              <View style={{ flexDirection: 'row', justifyContent: 'center'}}>
                <Text style={{fontSize: 12}}>{'HISTORY'}</Text>
              </View>            
              {(this.state.datas.length) == 0 && (
                <View style={{
                  justifyContent: 'center', alignSelf: 'center', padding: 45, backgroundColor: '#FFF', width: '100%',
                }}>
                  <Text style={{
                    margin:0,
                    color: '#808080',
                    fontSize: 12,
                    textAlign: "center",
                    alignContent: 'center'
                  }}>You dont have any transaction.</Text>
                </View>
              )}
              {(this.state.datas.length !== 0) && (
                <FlatList
                  numColumns={1}
                  style={{ flex: 0 }}
                  removeClippedSubviews={true}
                  data={this.state.datas}
                  initialNumToRender={this.state.datas.length}
                  renderItem={({ item: rowData }) => {
                    return (
                      <View style={{ width: DEVICE_WIDTH - 40, marginLeft: 20, marginTop: 20, marginBottom: 20, borderWidth: 0.5, borderColor: '#dfdfdf', padding: 25, }}>
                        <View style={{flexDirection: 'row', justifyContent: 'flex-start'}}>
                          <Text style={{fontSize: 14, fontWeight: 'bold'}}>{'Amount: '}</Text>
                          <Text style={{fontSize: 14}}>{'$' + rowData.amount}</Text>
                        </View>
                        <View style={{flexDirection: 'row', justifyContent: 'flex-start', width: DEVICE_WIDTH - 200, }}>
                          <Text style={{fontSize: 14, fontWeight: 'bold'}}>{'Email: '}</Text>
                          <Text style={{fontSize: 14}}>{rowData.email_address}</Text>
                        </View>
                        <View style={{flexDirection: 'row', justifyContent: 'flex-start'}}>
                          <Text style={{fontSize: 14, fontWeight: 'bold'}}>{'Type: '}</Text>
                          <Text style={{fontSize: 14}}>{rowData.giftcard_type}</Text>
                        </View>
                        <View style={{flexDirection: 'row', justifyContent: 'flex-start'}}>
                          <Text style={{fontSize: 14, fontWeight: 'bold'}}>{'Status: '}</Text>
                          <Text style={{fontSize: 14, flexWrap: 'wrap'}}>{rowData.status}</Text>
                        </View>
                        <View style={{flexDirection: 'row', justifyContent: 'flex-start', width: DEVICE_WIDTH - 200, }}>
                          <Text style={{fontSize: 14, fontWeight: 'bold'}}>{'Status message: '}</Text>
                          <Text style={{fontSize: 14, flexWrap: 'wrap'}}>{rowData.status_message}</Text>
                        </View>
                        <View style={{flexDirection: 'row', justifyContent: 'flex-start'}}>
                          <Text style={{fontSize: 14, fontWeight: 'bold'}}>{'Submitted Date: '}</Text>
                          <Text style={{fontSize: 14}}>{this.changeDateFormat(rowData.created_date)}</Text>
                        </View>
                      </View>
                    );
                  }}
                  keyExtractor={(item, index) => index}
                />)}
              <View style={{ height: 150 }} />
            </View>
          </ScrollView>
        </View>
        <Footer style={{ height: Platform.select({ 'android': 50, 'ios': 50, }), position: 'absolute', bottom: 0, }}>
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
        <FlashMessage ref="fmLocalInstance" position="bottom" animated={true} autoHide={true} style={{marginBottom: 50,}} />
      </ImageBackground>
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
  requiredSent: {
    textAlign: 'left',
    color: 'red',    
    fontSize: 12,
    marginBottom: 15,
  },
  SectionStyle: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderBottomWidth: 0.5,
    borderBottomColor: '#808080',
    height: 40,
    marginTop: 5,
    marginBottom: 15,
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
    height: 50,
    width: DEVICE_WIDTH * 0.8,
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
        borderRadius: 5,
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
});

const mapStateToProps = (state) => {
  const { unreadFlag } = state.reducer
  return { unreadFlag }
};

export default connect(mapStateToProps)(ExchangeDiamonds);