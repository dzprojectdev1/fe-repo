import React, { Component } from "react";
import {
  Text, Content,
} from "native-base";

import { 
  Alert,
  Platform,
  Image,
  Dimensions,
  View, 
  StyleSheet, 
  TouchableOpacity, 
  StatusBar,
  BackHandler
} from "react-native";

import RNIap, {
  acknowledgePurchaseAndroid,
  purchaseErrorListener,
  purchaseUpdatedListener,
} from 'react-native-iap';
  
const itemSkus = Platform.select({
  android: [
    '100_diamonds',
    '250_diamonds',
    '750_diamonds',
    '2500_diamonds',
    '7500_diamonds',
    '1_day_pass',
    '3_day_pass',
    '7_day_pass'
  ],
});

const valProductId = ['100_diamonds', '250_diamonds', '750_diamonds', '2500_diamonds', '7500_diamonds', '1_day_pass', '3_day_pass', '7_day_pass'];
const diamondCount = [100, 250, 750, 2500, 7500, 0, 0, 0];
const diamondPrice = [0.99, 1.99, 4.99, 9.99, 24.99, 4.99, 11.99, 14.99];

let purchaseUpdateSubscription;
let purchaseErrorSubscription;

import goback from '../../assets/images/BackOther.png';
import diamond_trans from '../../assets/images/red_diamond_trans.png';
import vip_diamond_trans from '../../assets/images/vip_diamond_trans.png';
import pass_day from '../../assets/images/pass_day.png';
import Global from '../Global';
import { SERVER_URL } from '../../config/constants'

class screenGpay01 extends Component {

  constructor(props) {
    super(props);
    this.state = {
      productList: [],
      productListPass: [],
      receipt: '',
      availableItemsMessage: '',
      gemNumber: Global.saveData.coin_count,
      free_button_condition: true, 
      isLoading: true,
      remainTimeStamp: 0,
      displayRemainTime: false,
      intervalId: 0,
      remainDays: 0,
      remainHours: 0,
      remainMinutes: 0,
      remainSeconds: 0,
    };
  }

  static navigationOptions = {
    header: null
  };

  componentWillMount() {
    Global.saveData.nowPage = 'screenGapy01';
    BackHandler.addEventListener('hardwareBackPress', this.backPressed);
  }
  
  async componentDidMount() {
    try {
      const result = await RNIap.initConnection();
      await RNIap.consumeAllItemsAndroid();
      console.log('result', result);
    } catch (err) {
      console.warn(err.code, err.message);
    }

    this.getItems();

    purchaseUpdateSubscription = purchaseUpdatedListener(async (purchase) => {
      console.log('purchaseUpdatedListener', purchase);
      if (
        purchase.purchaseStateAndroid === 1 &&
        !purchase.isAcknowledgedAndroid
      ) {
        try {
          const ackResult = await acknowledgePurchaseAndroid(
            purchase.purchaseToken,
          );
          console.log('ackResult', ackResult);
        } catch (ackErr) {
          console.warn('ackErr', ackErr);
        }
      }
      this.setState({ receipt: purchase.transactionReceipt }, () =>
        this.goNext(),
      );
    });

    purchaseErrorSubscription = purchaseErrorListener((error) => {
      console.log('purchaseErrorListener', error);
      Alert.alert('purchase error', JSON.stringify(error));
    });

    // Verify validation for unlimited instant chat permission
    var userId = Global.saveData.u_id;
    fetch(`${SERVER_URL}/api/transaction/validatePass/${userId}`, {
      method: 'POST',
      headers: {
        'Content-type': 'application/x-www-form-urlencoded',
        'Authorization': Global.saveData.token
      }
    }).then((response) => response.json())
    .then((responseJSON) => {      
      if (responseJSON.error === false) {

        // display remain time for unlimited instant chat
        if (responseJSON.data.validation) {
          this.setState({
            remainTimeStamp: responseJSON.data.remain_timestamp,
          })
          this.timeCounter();
        }
      }
    }).catch((error) => {
      alert(error);
    })
  }

  timer = () => {
    var newCount = this.state.remainTimeStamp - 1;
    if(newCount >= 0) { 

        let days    = Math.floor(newCount / 86400);
        let hours   = Math.floor((newCount - (days * 86400)) / 3600);
        let minutes = Math.floor((newCount - (days * 86400) - (hours * 3600)) / 60);
        let seconds = newCount - (days * 86400) - (hours * 3600) - (minutes * 60);
        
        this.setState({ 
          remainTimeStamp: newCount,
          displayRemainTime: true,
          remainDays: days,
          remainHours: hours,
          remainMinutes: minutes,
          remainSeconds: seconds,
        });
    } else {
        clearInterval(this.state.intervalId);
        this.setState({
          displayRemainTime: false
        })
    }
 }

 timeCounter = () => {
  var intervalId = setInterval(this.timer, 1000);
  // store intervalId in the state so it can be accessed later:
  this.setState({intervalId: intervalId});
 }

  componentWillMount() {
    BackHandler.addEventListener('hardwareBackPress', this.backPressed);
  }

  componentWillUnmount() {
    if (purchaseUpdateSubscription) {
      purchaseUpdateSubscription.remove();
      purchaseUpdateSubscription = null;
    }
    if (purchaseErrorSubscription) {
      purchaseErrorSubscription.remove();
      purchaseErrorSubscription = null;
    }
    BackHandler.removeEventListener('hardwareBackPress', this.backPressed);

    clearInterval(this.state.intervalId);
  }
  
  goNext = () => {

    var responseReceipt   = this.state.receipt;
    var responseProductId = JSON.parse(responseReceipt).productId;
    var responseOrderId   = JSON.parse(responseReceipt).orderId;

    responseOrderId = '' + responseOrderId;

    if (responseOrderId.indexOf('GPA.') == -1) {
      Alert.alert(
        'Purchase Error',
        'Please retry with invalide Payment information',
        [
          {text: 'OK', onPress: () => console.log('OK Pressed')},
        ],
        {cancelable: false},
      );
      return
    }

    var productIdIndex = 0;

    valProductId.forEach(function (productId, index) {
      if (productId == responseProductId) {
        productIdIndex = index;
      }
    });

    var days = 0;

    var formBody = [];
    formBody.push('user_id' +     "=" + Global.saveData.u_id);
    formBody.push('coin_number' + "=" + diamondCount[productIdIndex]);
    formBody.push('coin_price' +  "=" + diamondPrice[productIdIndex]);
    formBody.push('currency=USD');

    if (responseProductId.indexOf('_diamonds') != -1 ) {
      formBody.push('dist=diamond');
      formBody.push('days=0');
    } else if (responseProductId.indexOf('_pass') != -1 ) {
      formBody.push('dist=pass');

      days = responseProductId.slice(0, 1);
      formBody.push('days=' + days);
    }

    formBody.push('package_name' +      "=" + JSON.parse(responseReceipt).packageName);
    formBody.push('acknowledge' +       "=" + JSON.parse(responseReceipt).acknowledge);
    formBody.push('order_id' +          "=" + JSON.parse(responseReceipt).orderId);
    formBody.push('product_id' +        "=" + JSON.parse(responseReceipt).productId);
    formBody.push('developer_payload' + "=" + JSON.parse(responseReceipt).developerPayload);
    formBody.push('purchase_time' +     "=" + JSON.parse(responseReceipt).purchaseTime);
    formBody.push('purchase_state' +    "=" + JSON.parse(responseReceipt).purchaseState);
    formBody.push('purchase_token' +    "=" + JSON.parse(responseReceipt).purchaseToken);
    
    formBody = formBody.join("&");
    
    fetch(`${SERVER_URL}/api/transaction/putCoin`, {
      method: 'POST',
      headers: {
        'Content-type': 'application/x-www-form-urlencoded'
      },
      body: formBody
    }).then((response) => response.json())
    .then((responseJSON) => {
      
      if (responseJSON.error === false) {

        // display remain time for unlimited instant chat
        if (responseJSON.data.validation) {
          Alert.alert(
            'Success!',
            responseJSON.message,
            [
              {text: 'OK', onPress: () => console.log('OK Pressed')},
            ],
            {cancelable: false},
          );

          this.setState({
            remainTimeStamp: responseJSON.data.remain_timestamp,
            gemNumber: responseJSON.data.coin_count,
          });          

          Global.saveData.coin_count = responseJSON.data.coin_count;

          clearInterval(this.state.intervalId);
          this.timeCounter();
        } else {
          Alert.alert(
            'Success!',
            " " + diamondCount[productIdIndex] + " diamonds were added to your account.",
            [
              {text: 'OK', onPress: () => console.log('OK Pressed')},
            ],
            {cancelable: false},
          );

          Global.saveData.coin_count = responseJSON.data.coin_count;

          this.setState({
            gemNumber: responseJSON.data.coin_count
          })
        }
      }
    }).catch((error) => {
      alert(error);
    })
  };
  
  getItems = async () => {
    try {
      const products = await RNIap.getProducts(itemSkus);
      console.log('Products', products);

      let diamondProducts = [];
      let passProducts = [];
      if (products.length > 0) {

        products.map((product, index) => {
          if (product.productId.indexOf('_diamonds') != -1) {
            diamondProducts.push(product);
          } else if (product.productId.indexOf('_pass') != -1) {
            passProducts.push(product);
          }
        })
        
        if (diamondProducts.length > 0) {
          var prefix = [];
          for (var i = 0; i < diamondProducts.length; i ++ ) {
            let arr = diamondProducts[i].productId.split('_');
            prefix[i] = parseInt(arr[0]);

            for (var j = 0; j < i; j ++) {
              if (prefix[i] < prefix[j]) {
                let swap_value = diamondProducts[i];
                let temp = prefix[i];
                prefix[i] = prefix[j];
                prefix[j] = temp;
                diamondProducts[i] = diamondProducts[j];
                diamondProducts[j] = swap_value;
              }
            }
          }
        }

        this.setState({
          productList: diamondProducts,
          productListPass: passProducts
        })
      }
    } catch (err) {
      console.warn(err.code, err.message);
    }
  };
  
  getAvailablePurchases = async () => {
    try {
      console.info(
        'Get available purchases (non-consumable or unconsumed consumable)',
      );
      const purchases = await RNIap.getAvailablePurchases();
      console.info('Available purchases :: ', purchases);
      if (purchases && purchases.length > 0) {
        this.setState({
          availableItemsMessage: `Got ${purchases.length} items.`,
          receipt: purchases[0].transactionReceipt,
        });
      }
    } catch (err) {
      console.warn(err.code, err.message);
      Alert.alert(err.message);
    }
  };
  
  // Version 3 apis
  requestPurchase = async (sku) => {
    try {
      RNIap.requestPurchase(sku, false);
    } catch (err) {
      console.warn(err.code, err.message);
    }
  };

  requestSubscription = async (sku) => {
    try {
      RNIap.requestSubscription(sku);
    } catch (err) {
      Alert.alert(err.message);
    }
  };

  backPressed = () => {
    this.props.navigation.navigate(Global.saveData.nowPage);
    return true;
  }
  
  treatProductTitle = title => {
    let split_title = title.split(' (Random');
    return split_title[0];
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

  gotoFreeDiamonds = () => {
    var user_id = Global.saveData.u_id;

    if (this.state.gemNumber > 300) {
      Alert.alert(
        '',
        "You must spend your diamonds to 300 or less in order to get free diamonds. You can always buy more diamonds at the diamond shop page.",
        [
          {text: 'OK', onPress: () => console.log('OK Pressed')},
        ],
        {cancelable: false},
      );
      return
    }
    
    fetch(`${SERVER_URL}/api/transaction/freeDiamonds/${user_id}`, {
      method: 'POST',
      headers: {
        'Content-type': 'application/x-www-form-urlencoded',
        'Authorization': Global.saveData.token
      }
    }).then((response) => response.json())
    .then((responseJSON) => {
      
      if (responseJSON.error === false) {

        if (responseJSON.data) {

          var responseData = responseJSON.data;

          if (responseData.success == false) {
            Alert.alert(
              '',
              "Please wait " + responseData.hours + " hours " + responseData.minutes + " minutes and " + responseData.seconds + " seconds to unlock 30 free diamonds.",
              [
                {text: 'OK', onPress: () => console.log('OK Pressed')},
              ],
              {cancelable: false},
            );
          } else {
            Alert.alert(
              'Success',
              "30 diamonds were added to your account successfully. Next 30 diamonds will unlock in 24 hours.",
              [
                {text: 'OK', onPress: () => console.log('OK Pressed')},
              ],
              {cancelable: false},
            );
          }

          Global.saveData.coin_count = responseData.coin_count;

          this.setState({
            gemNumber: responseData.coin_count
          })
        }
      }
    }).catch((error) => {
      alert(error);
    })
  }

  render() {
    const { productList, productListPass, receipt, availableItemsMessage } = this.state;
    const receipt100 = receipt.substring(0, 100);

    return (
      <View style={styles.contentContainer}>
       <StatusBar  backgroundColor="transparent" barStyle="dark-content" ></StatusBar>
        <View style = {styles.top_title}>
          <TouchableOpacity onPress={() => this.goBack()}>
            <Image source={goback} style={{ width: 20, height: 20, tintColor: '#000', marginLeft: 25}} />
          </TouchableOpacity>
          <Text style={{ color: '#000', fontSize: 15, fontWeight: 'bold', marginLeft: 20, textAlign:'left', justifyContent:'center' }}>{"Diamond shop"}</Text>
        </View>
        <Content>
          <View style={{justifyContent:'center', alignItems: 'center'}}>
            <View style={{ width: DEVICE_WIDTH * 0.8, height:60, marginLeft: DEVICE_WIDTH * 0.1, flexDirection: 'row' }}>
              <Text style={{ color: '#cc2e48', fontSize: 17, marginTop: 20, marginLeft: DEVICE_WIDTH * 0.1 }}>{"My Diamonds"}</Text>              
              <Image source={diamond_trans} style={{ width: 25, height: 25, marginTop: 22, marginLeft: 10 }} />
              <Text style={{ color: '#cc2e48', fontSize: 17, justifyContent:'center', alignItems: 'center', marginTop: 22, marginLeft: 10 }}>{ this.state.gemNumber }</Text>
            </View>              
            {(productListPass.length > 0)? productListPass.map((product, i) => {
              return (
                <TouchableOpacity style={styles.list_item_normal} 
                  onPress={() => this.requestPurchase(product.productId)}
                >
                  <View style={{flexDirection: 'row', paddingTop: 18}}>
                    <Image source={pass_day} style={{ width: 13, height: 13}} />
                    <Text style={{ color: '#000', fontSize: 12, marginLeft: 10 }}>{this.treatProductTitle(product.title)}</Text>
                    <View style={{flex:1, alignItems:"flex-end"}}>
                      <Text style={{color: '#000', fontSize: 12, textAlign:'right', paddingRight:10}}>{product.localizedPrice}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
                );
              }): <Text></Text>}

            <Text></Text>

            {(productList.length > 0)? productList.map((product, i) => {
              return (
                <TouchableOpacity style={styles.list_item_normal} 
                  onPress={() => this.requestPurchase(product.productId)}
                >
                  <View style={{flexDirection: 'row', paddingTop: 18}}>
                    <Image source={diamond_trans} style={{ width: 17, height: 15}} />
                    <Text style={{ color: '#000', fontSize: 12, marginLeft: 10 }}>{this.treatProductTitle(product.title)}</Text>
                    <View style={{flex:1, alignItems:"flex-end"}}>
                      <Text style={{color: '#000', fontSize: 12, textAlign:'right', paddingRight:10}}>{product.localizedPrice}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
                );
              }): <Text></Text>}

            <Text></Text>

            {this.state.displayRemainTime == true?
            (<View style={styles.list_item_normal_last}>
              <View style={{flexDirection: 'row', paddingTop: 10}}>
                <Image source={vip_diamond_trans} style={{ width: 40, height: 35}} />
                <Text style={{ color: '#000', fontSize: 12, marginLeft: 25, marginTop: 10 }}>{'Unlimited Instant Chat ends in'}</Text>
              </View>
              <View style={{flexDirection: 'row', paddingTop: 18}}>
                <Text style={{ color: '#000', fontSize: 12, marginLeft: 35 }}>
                  <Text style={{ color: '#000', fontSize: 12, marginLeft: 35 }}>{this.state.remainDays != 0? this.state.remainDays + ' days ': ''}</Text>
                  <Text style={{ color: '#000', fontSize: 12, marginLeft: 35 }}>{this.state.remainHours != 0? this.state.remainHours + ' hours ': ''}</Text>
                  <Text style={{ color: '#000', fontSize: 12, marginLeft: 35 }}>{this.state.remainMinutes != 0? this.state.remainMinutes + ' minutes ': ''}</Text>
                  <Text style={{ color: '#000', fontSize: 12, marginLeft: 35 }}>{this.state.remainSeconds != 0? this.state.remainSeconds + ' seconds ': ''}</Text>
                </Text>
              </View>
            </View>): (<View></View>)}
          </View>
          <View style={{justifyContent:'center', alignItems: 'center', marginTop: 20 }} pointerEvents={this.state.free_button_condition ? 'auto': 'none'}>
            <TouchableOpacity onPress={() =>this.gotoFreeDiamonds()}>
                <View style={this.state.free_button_condition? styles.free_diamond_button: styles.free_diamond_button_disabled}>
                  <Text style={{color:'white', fontSize:18, marginLeft: 15}}>{"GET FREE DIAMONDS"}</Text>
                </View>           
            </TouchableOpacity>   
          </View>
        </Content>
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

  top_title: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: 40,
    backgroundColor: '#fff',
  },

  list_item_spread:{
    justifyContent:'center',
    alignItems: 'center',
    width: DEVICE_WIDTH - 30,
    height: 60,
    marginTop: 10,
    backgroundColor: '#fff',
    borderRadius: 5,
  },

  list_item_normal: {
    flexDirection : 'row',
    width: DEVICE_WIDTH - 30,
    height: 50,
    alignItems: 'flex-start',
    marginTop: 2,
    paddingLeft: 10,
    backgroundColor: '#fff',
    borderRadius: 5,
  },

  list_item_normal_last: {
    width: DEVICE_WIDTH - 30,
    height: 100,
    alignItems: 'flex-start',
    marginTop: 2,
    paddingLeft: 10,
    backgroundColor: '#fff',
    borderRadius: 5,
  },

  free_diamond_button: {
    height: 70,
    width: DEVICE_WIDTH * 0.65,
    backgroundColor: '#dd5858',
    color: '#fff',
    borderRadius: 35,
    justifyContent: 'center',
    alignItems:'center',
    flexDirection:'row'
  },

  free_diamond_button_disabled: {
    height: 70,
    width: DEVICE_WIDTH * 0.65,
    backgroundColor: '#daa3a3',
    color: '#fff',
    borderRadius: 35,
    justifyContent: 'center',
    alignItems:'center',
    flexDirection:'row'
  }
});
export default screenGpay01;
