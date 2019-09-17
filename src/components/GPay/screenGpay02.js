import React, { Component } from "react";
import {
  Text, Content,
} from "native-base"
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
import nativeFirebase from 'react-native-firebase';
import store from 'react-native-simple-store';
import logo from '../../assets/images/logo.png';
import slogo from '../../assets/images/second_bg.png';
import goback from '../../assets/images/BackOther.png';
import Flag from '../../assets/images/flag.png';
import waterball from '../../assets/images/waterball.png';
import Gpayimage from '../../assets/images/Gpayimage.png';

import diamond from '../../assets/images/diamond.png';
import SelectEmailImage from '../../assets/images/forward.png';
import Flower from '../../assets/images/flower.png';
import passswordIcon from '../../assets/images/passwordIcon.png';
import checkIcon from '../../assets/images/check.png';
import uncheckIcon from '../../assets/images/uncheck.png';
import Global from '../Global';

import {SERVER_URL} from '../../config/constants';

const GempriceListVal = [200, 700, 1200, 2500, 8000, 15000];
const PaypriceListVal = [0.99, 2.49, 4.49, 8.49, 25.99, 42.99];

class screenGpay02 extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      password: '',
      remberCheck: false,
      number: '',
    };
  }

  static navigationOptions = {
    header: null
  };
 
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
    this.props.navigation.goBack();
  }
  onBuy(){
    this.state.number = this.props.navigation.state.params.CLICK_NUMBER;
    this.props.navigation.navigate("screenGpay03", {CLICK_NUMBER: this.state.number});
  }
  render() {
    return (
     <View style={styles.contentContainer}>
       <StatusBar  backgroundColor="transparent" barStyle="dark-content" ></StatusBar>
        <View style = {styles.top_title}>
            <TouchableOpacity style={{zIndex:5000}} onPress={() => this.goBack()}>
                <Image source={goback} style={{ width: 20, height: 20, tintColor: '#000', marginLeft: 25}} />
            </TouchableOpacity>
            <Text style={{ color: '#000', fontSize: 15, fontWeight: 'bold', marginLeft: 20, textAlign:'left', justifyContent:'center' }}>{"Gem shop"}</Text>
        </View>
            <View style={{justifyContent:'center', alignItems: 'center', }}>
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
                </View><View style={{height: 40, width:'90%', marginTop: 5, borderRadius: 5, backgroundColor: 'pink'}}>
                  <Text style={{color:'white', fontSize: 12, textAlign:'center', flexDirection:'row', marginTop: 11}}>{"Free Gem3"}</Text>
                </View>
            </View>
            <View backgroundColor={"#000"} style = {{position: 'absolute', top:0, width:'100%', height:'100%', opacity: 0.7}} ></View>
            <View style={styles.dialog_screen}>
              <View style={{height:30, width:'100%', borderBottomWidth: 1 , borderBottomColor:'gray', flexDirection:'row', alignItems:'center'}}>
                <Text style={{color:'gray', fontSize:14, marginLeft: 15, paddingBottom:0}}>{"Google Pay"}</Text>
              </View>
              <View style={{flexDirection:'row', height:50, width: '100%', borderBottomWidth: 1 , borderBottomColor:'gray', alignItems:'center'}}>
                <Image source={waterball} style={{ width: 20, height: 20, marginLeft:20 }} />
                <View style={{flexDirection:'column', flex: 2}}>
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
                </View>
              </View>
              <View style={{height:40, width:'100%', borderBottomWidth: 1 , borderBottomColor:'gray', flexDirection:'row', alignItems:'center'}}>
                <Image source={Gpayimage} style={{ width: 30, height: 11, marginLeft:15 }} />
                <Text style={{color:'#000', fontSize:8, marginLeft: 5}}>{"PayPal: sm840817@hotmail.com"}</Text>
                <TouchableOpacity style={{flex:1, alignItems:"flex-end"}} onPress = {()=>this.goBack()}>
                  <Text style={{color: 'gray', fontSize: 14, textAlign:'right', paddingRight:10}}>{">"}</Text>
                </TouchableOpacity>
              </View>
              <View style={{height:40, width: '100%', justifyContent:'center', flexDirection:'column', alignItems:'flex-start'}}>
                <View style={{flexDirection:'row'}}>
                <Text style={{color:'gray', fontSize:6, marginLeft: 15}}>{"By tapping"}</Text>
                <Text style={{color:'gray', fontSize:6}}>{" ' "}</Text>
                <Text style={{color:'gray', fontSize:6}}>{"Buy"}</Text>
                <Text style={{color:'gray', fontSize:6}}>{"'"}</Text>
                <Text style={{color:'gray', fontSize:6}}>{" you accept the following terms of service:"}</Text>
                <TouchableOpacity>
                  <Text style={{color:'gray', fontSize:6, borderBottomColor:'gray', borderBottomWidth:1}}>{" Terms of Service - Android(US),"}</Text>
                </TouchableOpacity>
                </View>
                <TouchableOpacity>
                  <Text style={{color:'gray', fontSize:6, marginLeft: 15, borderBottomColor:'gray', borderBottomWidth:1}}>{"Privacy Notice"}</Text>                
                 </TouchableOpacity>
              </View>
              <TouchableOpacity onPress={() =>this.onBuy()}>
                <View style={{height:40, width: '100%', flexDirection:'row', backgroundColor:'green', justifyContent: 'center', alignItems:'center'}}>
                  <Text style={{color:'white', fontSize:14, marginLeft: 15}}>{"BUY"}</Text>
                </View>           
              </TouchableOpacity>   
          </View>
       </View>
    );
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
export default screenGpay02;
