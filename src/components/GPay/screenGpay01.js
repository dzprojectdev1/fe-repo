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
    '300_diamonds',
    '500_diamonds'
  ],
  // android: [
  //   'android.test.purchased',
  //   'android.test.canceled',
  //   'android.test.item_unavailable'
  // ],
});

const valProductId = ['100_diamonds', '300_diamonds', '500_diamonds'];
// const valProductId = ['android.test.purchased', 'android.test.canceled', 'android.test.item_unavailable'];
const GempriceListVal = [200, 700, 1200, 2500, 8000, 15000];
const PaypriceListVal = [0.99, 2.49, 4.49, 8.49, 25.99, 42.99];

let purchaseUpdateSubscription;
let purchaseErrorSubscription;

import goback from '../../assets/images/BackOther.png';
import diamond from '../../assets/images/diamond.png';
import diamond_trans from '../../assets/images/red_diamond_trans.png';
import Global from '../Global';
import { SERVER_URL } from '../../config/constants'

class screenGpay01 extends Component {

  constructor(props) {
    super(props);
    this.state = {
      productList: [],
      receipt: '',
      availableItemsMessage: '',
      gemNumber: Global.saveData.coin_count,
      free_button_condition: true, 
      isLoading: true,
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
  }

  gotoScreen02(Num) {
    this.state.number = Num;
    this.props.navigation.navigate("screenGpay02", {CLICK_NUMBER: this.state.number} );
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
  }
  
  goNext = () => {

    var responseReceipt = this.state.receipt;

    var productIdIndex = 0;
    valProductId.forEach(function (productId, index) {
      if (productId == JSON.parse(responseReceipt).productId) {
        productIdIndex = index;
      }
    });

    var formBody = [];
    formBody.push('user_id' +     "=" + Global.saveData.u_id);
    formBody.push('coin_number' + "=" + GempriceListVal[productIdIndex]);
    formBody.push('coin_price' +  "=" + PaypriceListVal[productIdIndex]);
    formBody.push('currency=USD');

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

        if (responseJSON.coin_count) {

          Global.saveData.coin_count = responseJSON.coin_count;

          this.setState({
            gemNumber: responseJSON.coin_count
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
      if (products.length > 0) {
        this.setState({ 
          productList: products,
          isLoading: false,
        });
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
  
  // Deprecated apis
  buyItem = async (sku) => {
    console.info('buyItem', sku);
    // const purchase = await RNIap.buyProduct(sku);
    // const products = await RNIap.buySubscription(sku);
    // const purchase = await RNIap.buyProductWithoutFinishTransaction(sku);
    try {
      const purchase = await RNIap.buyProduct(sku);
      // console.log('purchase', purchase);
      // await RNIap.consumePurchaseAndroid(purchase.purchaseToken);
      this.setState({ receipt: purchase.transactionReceipt }, () =>
        this.goNext(),
      );
    } catch (err) {
      console.warn(err.code, err.message);
      const subscription = RNIap.addAdditionalSuccessPurchaseListenerIOS(
        async (purchase) => {
          this.setState({ receipt: purchase.transactionReceipt }, () =>
            this.goNext(),
          );
          subscription.remove();
        },
      );
    }
  };
  
  buySubscribeItem = async (sku) => {
    try {
      console.log('buySubscribeItem: ' + sku);
      const purchase = await RNIap.buySubscription(sku);
      console.info(purchase);
      this.setState({ receipt: purchase.transactionReceipt }, () =>
        this.goNext(),
      );
    } catch (err) {
      console.warn(err.code, err.message);
      Alert.alert(err.message);
    }
  };

  backPressed = () => {
    this.props.navigation.navigate(Global.saveData.nowPage);
    return true;
  }  
 
  goBack() {
    if (Global.saveData.nowPage == 'Browse' || Global.saveData.nowPage == 'BrowseList') {
      this.props.navigation.replace("BrowseList");
    } else if (Global.saveData.nowPage == 'Match') {
      this.props.navigation.replace("Match");
    } else if (Global.saveData.nowPage == 'Chat') {
      this.props.navigation.replace("Chat");
    } else if (Global.saveData.nowPage == 'MyVideo') {
      this.props.navigation.replace("MyVideo");
    } else if (Global.saveData.nowPage == 'Income') {
      this.props.navigation.replace("Income");
    } else {
      this.props.navigation.navigate(Global.saveData.nowPage);
    }
  }

  gotoFreeDiamonds = () => {
    var user_id = Global.saveData.u_id;
    
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
              "Please wait " + responseData.hours+" hours "+responseData.minutes+" minutes and "+responseData.seconds+" seconds to unlock 50 free diamonds",
              [
                {text: 'OK', onPress: () => console.log('OK Pressed')},
              ],
              {cancelable: false},
            );

            // this.setState({
            //   free_button_condition: false
            // })
          } else {
            Alert.alert(
              'Success',
              "50 diamonds were added to your account successfully. Next 50 diamonds will unlock in 24 hours",
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
    const { productList, receipt, availableItemsMessage } = this.state;
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
            {/* <View style={styles.list_item_spread} > */}
            <View style={{ width: DEVICE_WIDTH * 0.8, height:60, marginLeft: DEVICE_WIDTH * 0.1, flexDirection: 'row' }}>
              <Text style={{ color: '#cc2e48', fontSize: 17, marginTop: 20, marginLeft: DEVICE_WIDTH * 0.1 }}>{"My Diamonds"}</Text>              
              <Image source={diamond_trans} style={{ width: 25, height: 25, marginTop: 22, marginLeft: 10 }} />
              <Text style={{ color: '#cc2e48', fontSize: 17, justifyContent:'center', alignItems: 'center', marginTop: 22, marginLeft: 10 }}>{ this.state.gemNumber }</Text>
            </View>
            
            {(productList.length > 0)? productList.map((product, i) => {
              return (
                <TouchableOpacity style={styles.list_item_normal} 
                  onPress={() => this.requestPurchase(product.productId)}
                >
                  <View style={{flexDirection: 'row', paddingTop: 18}}>
                    <Image source={diamond_trans} style={{ width: 17, height: 15}} />
                    <Text style={{ color: '#000', fontSize: 12, marginLeft: 10 }}>{product.description}</Text>
                    <View style={{flex:1, alignItems:"flex-end"}}>
                      <Text style={{color: '#000', fontSize: 12, textAlign:'right', paddingRight:10}}>{product.localizedPrice}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
                );
              }): <Text></Text>}
          </View>
          <View style={{justifyContent:'center', alignItems: 'center', marginTop: 30 }} pointerEvents={this.state.free_button_condition ? 'auto': 'none'}>
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
