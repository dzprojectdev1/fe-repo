import React, { Component } from "react";
import {
    Text, Content, 
} from "native-base"
import {   Image, ImageBackground, Platform,Dimensions,TextInput, View,StyleSheet,TouchableOpacity, StatusBar, Alert, Linking} from "react-native";
import store from 'react-native-simple-store';
import logo from '../../assets/images/logo.png';
import slogo from '../../assets/images/second_bg.png';
import Global from '../Global';
class EmailConfirm extends Component {
  constructor(props)
  {
    super(props);
    this.state = {
      email:'',
      code:'',
      gotCode:'',
    };
  }
 
static navigationOptions = {
  header : null
};
componentDidMount() {
  this.sendCode()
}
sendCode()
{ 
    fetch('http://138.197.203.178:8080/api/user/sendConfirmEmail', {
        method: 'POST',
        headers: {        
          'Content-Type':'application/x-www-form-urlencoded',
          'Authorization':Global.token     
        }
      }).then((response) => response.json())
          .then((responseJson) => {
            //alert(JSON.stringify(responseJson))
            if(!responseJson.error)
            {
             // this.props.navigation.navigate("EmailConfirm");
            }
            else
            {
              Alert.alert(responseJson.message)  
            }
          })
          .catch((error) => {
           //alert(JSON.stringify(error))
            return
         });
}
onConfirm()
{
    var details = {
        'confirmCode':this.state.code
    };
    
    var formBody = [];
    for (var property in details) {
      var encodedKey = encodeURIComponent(property);
      var encodedValue = encodeURIComponent(details[property]);
      formBody.push(encodedKey + "=" + encodedValue);
    }
    formBody = formBody.join("&");
  
    fetch('http://138.197.203.178:8080/api/user/emailVerify', {
          method: 'POST',
          headers: {        
            'Content-Type':'application/x-www-form-urlencoded'     
          },
          body:formBody,
        }).then((response) => response.json())
            .then((responseJson) => {
               // alert(JSON.stringify(responseJson))
                if(!responseJson.error)
                {            
                 this.props.navigation.replace("Record");
                }
            })
            .catch((error) => {
              alert(JSON.stringify(error))
              return
      });
}
  render() {
    
    var {navigate} = this.props.navigation; 
    return (
       <View style={styles.contentContainer}>
          <StatusBar backgroundColor='#fff' barStyle='dark-content'/>
          <ImageBackground source={slogo} style={{width:DEVICE_WIDTH, height:150,marginTop:Platform.select({'android':0, 'ios':30}), alignItems:'center', justifyContent:'center'}}>
             <Image source={logo} style={{width:205, height:83, tintColor:'#DE5859'}}/>
          </ImageBackground>
          <Content>
          <View style={{width:DEVICE_WIDTH, alignItems:'center', justifyContent:'center', marginTop:50}}>
            <Text style={{color:'#000', fontSize:16,fontWeight:'bold'}}>{"Please enter your confirmation code"}</Text>
            <Text style={{color:'#000', fontSize:16,fontWeight:'bold'}}>{"We sent to your email"}</Text>
          </View>
          <View style={{width:DEVICE_WIDTH*0.6,marginLeft:DEVICE_WIDTH*0.2, marginTop:50}}>
            <View>
               <TextInput                            
                       style={{backgroundColor:'transparent', width:DEVICE_WIDTH*0.6, height:40, paddingLeft:10, color:'#000', borderWidth:1, borderColor:'#000'}}
                       selectionColor="#009788"
                       keyboardType="number-pad"
                       onChangeText={code => this.setState({ code })}
                       autoCapitalize="none"
                       underlineColorAndroid="transparent"
                  />
            </View>          
          </View>
        
          <View style={{width:DEVICE_WIDTH, height:40, alignItems:'center', justifyContent:'center', marginTop:50}}>
            <TouchableOpacity style={{width:DEVICE_WIDTH*0.7, height:40, borderRadius:25,backgroundColor:'#DE5859', alignItems:'center', justifyContent:'center'}}
             onPress={()=>this.onConfirm()}
            >
               <Text style={{color:'#fff', fontSize:16, fontWeight:'bold'}}>{"CONFIRM"}</Text>
            </TouchableOpacity>
          </View>

          <View style={{justifyContent:'center', alignItems:'center', marginTop:30}}>
            <Text style={{color:'#000', fontSize:12,}}>{"Didn't get an Email?"}</Text>
            <TouchableOpacity onPress={()=>this.sendCode()}>
               <Text style={{color:'#DE5859', fontSize:14, fontWeight:'bold',marginTop:15}}>{"Send email again"}</Text>   
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
   contentContainer:{
    width:'100%',
    height:'100%',
    backgroundColor:'#fff',
   }, 
  });
export default EmailConfirm;
