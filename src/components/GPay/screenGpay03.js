import React, { Component } from "react";
import { Text } from "native-base";
import { 
  Image, 
  ImageBackground, 
  Platform, 
  Dimensions, 
  TextInput, 
  View, 
  StyleSheet, 
  TouchableOpacity, 
  StatusBar, 
  Alert ,
} from "react-native";

import { GooglePay } from 'react-native-google-pay'
import Global from '../Global';
import { SERVER_URL } from '../../config/constants'

const allowedCardNetworks = ['AMEX', 'DISCOVER', 'INTERAC', 'JCB', 'MASTERCARD', 'VISA']
const allowedCardAuthMethods = ['PAN_ONLY', 'CRYPTOGRAM_3DS']

import goback from '../../assets/images/BackOther.png';
import Flag from '../../assets/images/flag.png';
import waterball from '../../assets/images/waterball.png';
import OnlyGImage from '../../assets/images/OnlyGImage.png';
import diamond from '../../assets/images/diamond.png';
import { InputField } from '../../commonUI/components/inputs';
import checkIcon from '../../assets/images/check.png';
import uncheckIcon from '../../assets/images/uncheck.png';

const GempriceListVal = [200, 700, 1200, 2500, 8000, 15000];
const PaypriceListVal = [0.99, 2.49, 4.49, 8.49, 25.99, 42.99];

class screenGpay03 extends Component {

  constructor(props) {
    super(props);
    this.state = {
      email: '',
      password: '',
      remberCheck: false,
    };
  }
  
  componentDidMount() {
    // Set the environment before the payment request
    if (Platform.OS === 'android') {
      GooglePay.setEnvironment(GooglePay.ENVIRONMENT_TEST)
    }
  }

  payWithGooglePay = () => {

    requestData = {
      cardPaymentMethod: {
        tokenizationSpecification: {
          type: 'PAYMENT_GATEWAY',
          gateway: 'example',
          gatewayMerchantId: '09970745442821808404',
        },
        allowedCardNetworks,
        allowedCardAuthMethods,
      },
      transaction: {
        totalPrice: '' + Global.saveData.gem_price,
        totalPriceStatus: 'FINAL',
        currencyCode: 'USD',
      },
      merchantName: 'DazzledDate',
    }

    // Check if Google Pay is available
    GooglePay.isReadyToPay(allowedCardNetworks, allowedCardAuthMethods)
      .then((ready) => {
        if (ready) {
          // Request payment token

          GooglePay.requestPayment(requestData)
            .then(this.handleSuccess)
            .catch(this.handleError)
        }
      })
  }

  payWithStripeGooglePay = () => {

    stripeRequestData = {
      cardPaymentMethod: {
        tokenizationSpecification: {
          type: 'PAYMENT_GATEWAY',
          gateway: 'stripe',
          gatewayMerchantId: '09970745442821808404',
          stripe: {
            publishableKey: 'pk_test_U7NPnxz2NYz97SIXIn4clk7X00RvBL7jHh',
            version: '2018-10-31',
          },
        },
        allowedCardNetworks,
        allowedCardAuthMethods,
      },
      transaction: {
        totalPrice: '' + Global.saveData.gem_price,
        totalPriceStatus: 'FINAL',
        currencyCode: 'USD',
      },
      merchantName: 'DazzledDate',
    }

    // Check if Google Pay is available
    GooglePay.isReadyToPay(allowedCardNetworks, allowedCardAuthMethods)
      .then((ready) => {
        if (ready) {
          // Request payment token
          GooglePay.requestPayment(stripeRequestData)
            .then(this.handleSuccess)
            .catch(this.handleError)
          // this.handleSuccess();
        }
      })
  }

  handleSuccess = (token) => {
    // Send a token to your payment gateway
    var formBody = [];
    formBody.push('user_id' + "=" + Global.saveData.u_id);
    formBody.push('coin_number' + "=" + Global.saveData.gem_number);
    formBody.push('coin_price' + "=" + Global.saveData.gem_price);
    formBody.push('currency=USD');
    
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
          this.props.navigation.navigate("screenGpay04")
        }
      }
    }).catch((error) => {
      alert(error);
    })
  }

  handleError = (error) =>{
     Alert.alert('Error', `${error.code}\n${error.message}`)
     this.props.navigation.navigate("screenGpay04")
  }
  
  static navigationOptions = {
    header: null
  };

  checkRemember() {
    this.setState({ remberCheck: !this.state.remberCheck })
  }

  onChangeField(emailAddr, fieldValue) {
    
  }

  createView = () =>{
    buttonListArr = [];
 
    for ( let i = 0 ; i < GempriceListVal.length ; i++ )
    {
      if( i == 1 ){
        buttonListArr.push(
          <View style={styles.list_item_normal}>
              <View style={{flexDirection: 'row', paddingTop: 7}}>
                  <Image source={diamond} style={{ width: 17, height: 15 }} />
                  <Text style={{ color: '#000', fontSize: 12, marginLeft: 10 }}>{GempriceListVal[i]+" gems"}</Text>
                  <View style={{flex:1, alignItems:"flex-end"}}>
                    <View style={{flexDirection:'row', justifyContent:'center', alignItems:'center'}}>
                      <Text style={{color: '#fff', fontSize: 12, textAlign:'center', marginRight:10, backgroundColor:'blue', width:45, height:16, borderRadius:10}}>{"Best"}</Text>
                      <Text style={{color: '#000', fontSize: 12, textAlign:'right', paddingRight:10}}>{"$"+PaypriceListVal[i]}</Text>
                    </View>
                  </View>
              </View>
          </View>
        );
      }else{
        buttonListArr.push(
            <View style={styles.list_item_normal}>
                <View style={{flexDirection: 'row', paddingTop: 7}}>
                    <Image source={diamond} style={{ width: 17, height: 15 }} />
                    <Text style={{ color: '#000', fontSize: 12, marginLeft: 10 }}>{GempriceListVal[i]+" gems"}</Text>
                    <View style={{flex:1, alignItems:"flex-end"}}>
                        <Text style={{color: '#000', fontSize: 12, textAlign:'right', paddingRight:10}}>{"$"+PaypriceListVal[i]}</Text>
                    </View>
                </View>
            </View>
        );
      }
    };
    return buttonListArr;
  }
  
 
  goBack() {
    this.props.navigation.goBack("screenGpay02");
  }

  onBuy(){
    this.props.navigation.navigate("screenGpay04");
  }

  render() {
    return (
     <View style={styles.contentContainer}>
       <StatusBar  backgroundColor="transparent" barStyle="dark-content" ></StatusBar>
        <View style = {styles.top_title}>
            <TouchableOpacity style = {{zIndex: 1000}}onPress={() => this.goBack()}>
                <Image source={goback} style={{ width: 20, height: 20, tintColor: '#000', marginLeft: 25}} />
            </TouchableOpacity>
            <Text style={{ color: '#000', fontSize: 15, fontWeight: 'bold', marginLeft: 20, textAlign:'left', justifyContent:'center' }}>{"Gem shop"}</Text>
        </View>
            {/* <View style={{justifyContent:'center', alignItems: 'center', }}>
                <View style={styles.list_item_spread} >
                    <Text style={{ color: '#000', fontSize: 17, justifyContent: 'center', alignItems: 'center' }}>{"My gem"}</Text>
                    <Text style={{ color: '#45b8d6', fontSize: 14, justifyContent:'center', alignItems: 'center' }}>{"30"}</Text>
                </View>
                <View style={styles.list_item_normal}>
                  <View style={{flexDirection: 'row', paddingTop: 7}}>
                      <Image source={Flag} style={{ width: 20, height: 15 }} />
                      <Text style={{ color: '#000', fontSize: 12, marginLeft: 10 }}>{"1-day ticket"}</Text>
                      <View style={{flex:1, alignItems:"flex-end"}}>
                        <View style={{flexDirection:'row', justifyContent:'center', alignItems:'center'}}>
                         <Text style={{color: '#fff', fontSize: 12, textAlign:'center', marginRight:10, backgroundColor:'red', width:35, height:16, borderRadius:10}}>{"Hit"}</Text>
                         <Text style={{color: '#000', fontSize: 12, textAlign:'right', paddingRight:10}}>{"$4.49"}</Text>
                         </View>
                      </View>
                  </View>
                </View>
                <View style={styles.list_item_normal}>
                  <View style={{flexDirection: 'row', paddingTop: 7}}>
                      <Image source={Flag} style={{ width: 20, height: 15 }} />
                      <Text style={{ color: '#000', fontSize: 12, marginLeft: 10 }}>{"1-day ticket"}</Text>
                      <View style={{flex:1, alignItems:"flex-end"}}>
                         <Text style={{color: '#000', fontSize: 12, textAlign:'right', paddingRight:10}}>{"$8.49"}</Text>
                      </View>
                  </View>
                </View>
                {this.createView()}
                <View style={{height: 30, width: '90%', marginTop: 10, borderRadius: 5, backgroundColor: 'green'}}>
                  <Text style={{color:'white', fontSize: 12, textAlign:'center', flexDirection:'row', marginTop: 7}}>{"Get free Gem (once per day)"}</Text>
                </View>
                <View style={{height: 30, width: '90%', marginTop: 5, borderRadius: 5, backgroundColor: 'blue'}}>
                  <Text style={{color:'white', fontSize: 12, textAlign:'center', flexDirection:'row', marginTop: 7}}>{"Free Gem1"}</Text>
                </View><View style={{height: 30, width: '90%', marginTop: 5, borderRadius: 5, backgroundColor: 'red'}}>
                  <Text style={{color:'white', fontSize: 12, textAlign:'center', flexDirection:'row', marginTop: 7}}>{"Free Gem2"}</Text>
                </View><View style={{height: 40, width: '90%', marginTop: 5, borderRadius: 5, backgroundColor: 'pink'}}>
                  <Text style={{color:'white', fontSize: 12, textAlign:'center', flexDirection:'row', marginTop: 11}}>{"Free Gem3"}</Text>
                </View>
            </View> */}
            <View backgroundColor={"#000"} style = {{position: 'absolute', top:0, width:'100%', height:'100%', opacity: 0.7}} ></View>
            <View style={styles.dialog_screen}>
              <View style={{flexDirection:'row', height:50, width: '100%', alignItems:'center'}}>
                <Image source={waterball} style={{ width: 20, height: 20, marginLeft:20 }} />
                <View style={{flexDirection:'column', flex: 3}}>
                    <View style={{flexDirection:'row'}}>
                        <Text style={{ color: '#000', fontSize: 12, marginLeft: 10 }}>{GempriceListVal[this.props.navigation.state.params.CLICK_NUMBER]}</Text>
                        <View style={{flex:1, alignItems:"flex-end"}}>
                            <Text style={{color: '#000', fontSize: 12, textAlign:'right', paddingRight:10}}>{PaypriceListVal[this.props.navigation.state.params.CLICK_NUMBER]}</Text>
                        </View>
                    </View>
                    <View style={{flexDirection:'row'}}>
                    <Text style={{ color: 'gray', fontSize: 8, marginLeft: 10 }}>{"Random chat-make new friends/anonymous chat"}</Text>
                        <View style={{flex:1, alignItems:"flex-end"}}>
                            <Text style={{color: 'gray', fontSize: 7, textAlign:'right', paddingRight:10}}>{"+tax 1"}</Text>
                        </View>
                    </View>
                    <Text style={{ color: 'gray', fontSize: 8, marginLeft: 10 }}>{Global.saveData.u_email}</Text>
                </View>
              </View>
              <View style={{height:20, width: '100%', flexDirection:'row', alignItems:'center'}}>
                <Image source={OnlyGImage} style={{ width: 20, height: 20, marginLeft:15 }} />
                <Text style={{color:'gray', fontSize:8, marginLeft: 5}}>{Global.saveData.u_email}</Text>
              </View>
			      	<InputField name='user_pwd' placeholder='Enter your password' onChangeField={this.onChangeField.bind(this)}  passwordField/>

              <View style={{height:60, width: '100%', justifyContent:'center', flexDirection:'column', alignItems:'flex-start'}}>
              <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop:10, marginLeft:15 }} onPress={() => this.checkRemember()}>
                  {this.state.remberCheck && <Image source={checkIcon} style={{ width: 15, height: 15 }} />}
                  {!this.state.remberCheck && <Image source={uncheckIcon} style={{ width: 15, height: 15 }} />}
                  <Text style={{ color: 'gray', marginLeft: 10, fontSize: 10, }}>{"Remember me on this device"}</Text>
              </TouchableOpacity>
                <View style={{flexDirection:'row'}}>
                    <TouchableOpacity>
                    <Text style={{color:'gray', fontSize:8, marginLeft: 15, borderBottomColor:'gray', borderBottomWidth:1}}>{"Forgot password?"}</Text>                
                    </TouchableOpacity>
                    <TouchableOpacity>
                    <Text style={{color:'gray', fontSize:8, marginLeft: 5, borderBottomColor:'gray', borderBottomWidth:1}}>{"Learn more"}</Text>                
                    </TouchableOpacity>
                 </View>
              </View>
              <TouchableOpacity onPress={()=>this.payWithStripeGooglePay()}>
                <View style={{height:40, width: '100%', flexDirection:'row', backgroundColor:'green', justifyContent: 'center', alignItems:'center'}}>
                  <Text style={{color:'white', fontSize:14, marginLeft: 15}}>{"VERIFY"}</Text>
                </View>           
              </TouchableOpacity>   
          </View>
       </View>
    );
  }

  onCheckRemember() {
    ;
  }
}
const DEVICE_WIDTH = Dimensions.get('window').width;
const DEVICE_HEIGHT = Dimensions.get('window').height;
const styles = StyleSheet.create({
  contentContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: '#eee',
  },
  top_title: {
    marginTop: 25,
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: 40,
    backgroundColor: '#fff',
  },
  list_item_spread:{
    justifyContent:'center',
    alignItems: 'center',
    width: '90%',
    height: 50,
    marginTop: 5,
    backgroundColor: '#fff',
    borderRadius: 5,
  },
  list_item_normal: {
    flexDirection : 'row',
    width: '90%',
    height: 30,
    alignItems: 'flex-start',
    marginTop: 2,
    paddingLeft: 10,
    backgroundColor: '#fff',
    borderRadius: 5,
  },
  dialog_screen: {
    position: 'absolute',
    bottom: 0,
    flexDirection: 'column',
    backgroundColor: 'white',
    width: '84%',
    marginLeft: '8%',
    height:200,
    flex: 1,
  }
});
export default screenGpay03;
