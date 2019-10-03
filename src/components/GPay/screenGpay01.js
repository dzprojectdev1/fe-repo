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
    'android.test.purchased',
    'android.test.canceled',
    'android.test.item_unavailable'
  ],
});

let purchaseUpdateSubscription;
let purchaseErrorSubscription;

import goback from '../../assets/images/BackOther.png';
import diamond from '../../assets/images/diamond.png';
import Global from '../Global';

class screenGpay01 extends Component {

  constructor(props) {
    super(props);
    this.state = {
      productList: [],
      receipt: '',
      availableItemsMessage: '',
    };

    this.getItems();
  }

  static navigationOptions = {
    header: null
  };
  
  async componentDidMount() {
    try {
      const result = await RNIap.initConnection();
      await RNIap.consumeAllItemsAndroid();
      console.log('result', result);
    } catch (err) {
      console.warn(err.code, err.message);
    }

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
    Alert.alert('Receipt', this.state.receipt);
  };
  
  getItems = async () => {
    try {
      const products = await RNIap.getProducts(itemSkus);
      console.log('Products', products);
      this.setState({ productList: products });
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
      RNIap.requestPurchase(sku);
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
    this.props.navigation.navigate("MyVideo");
    return true;
  }
  
 
  goBack() {
    this.props.navigation.navigate("MyVideo");
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
          <Text style={{ color: '#000', fontSize: 15, fontWeight: 'bold', marginLeft: 20, textAlign:'left', justifyContent:'center' }}>{"Gem shop"}</Text>
        </View>
        <Content>
          <View style={{justifyContent:'center', alignItems: 'center'}}>
            <View style={styles.list_item_spread} >
              <Text style={{ color: '#000', fontSize: 17, justifyContent: 'center', alignItems: 'center' }}>{"My gem"}</Text>
              <Text style={{ color: '#45b8d6', fontSize: 14, justifyContent:'center', alignItems: 'center' }}>{ Global.saveData.coin_count }</Text>
            </View>
              
            {productList.map((product, i) => {
              return (
                <TouchableOpacity style={styles.list_item_normal} 
                  onPress={() => this.requestPurchase(product.productId)}
                  // onPress={() => this.requestSubscription(product.productId)}
                  // onPress={() => this.buyItem(product.productId)}
                  // onPress={() => this.buySubscribeItem(product.productId)}
                >
                  <View style={{flexDirection: 'row', paddingTop: 18}}>
                    <Image source={diamond} style={{ width: 17, height: 15}} />
                    <Text style={{ color: '#000', fontSize: 12, marginLeft: 10 }}>{product.title + "(" + product.productId + ")"}</Text>
                    <View style={{flex:1, alignItems:"flex-end"}}>
                      <Text style={{color: '#000', fontSize: 12, textAlign:'right', paddingRight:10}}>{product.localizedPrice}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
                );
              })}
          </View>
        </Content>
      </View>
    );
  }
}

const DEVICE_WIDTH = Dimensions.get('window').width;
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
  }
});
export default screenGpay01;
