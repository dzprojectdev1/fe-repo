import React, { Component } from "react";
import {
    Container,
    Contenet,
    Footer,
    Button,
    FooterTab,
    Icon,
    Text,
    Content,    
  } from "native-base";
import {ImageBackground,   Image,  Platform,Dimensions,TextInput, View,StyleSheet,TouchableOpacity, StatusBar, Alert, Linking} from "react-native";

import Video from 'react-native-video';

import b_name from '../../assets/images/name.png';
import b_age from '../../assets/images/age.png';
import b_distance from '../../assets/images/distance.png';
import b_profile from '../../assets/images/profile.png';

import Global from '../Global';

class MyVideoDetail extends Component {
  constructor(props)
  {
    super(props);
    this.state = {
     paused:false,
     vid:-1,
     vUrl:'',
     username:'',
     userage:'',
     userdistance:'',
     otherId:-1,
     primary:-1,
    };
  }
 
static navigationOptions = {
  header : null
};
componentDidMount() {
 this.setState({username:'SANDY', userage:27, userdistance:302})
  this.props.navigation.addListener('didFocus', (playload)=>{
    this.setState({paused:false})
   });
}
componentWillMount()
{
  this.setState({vUrl:this.props.navigation.state.params.url, 
                otherId:this.props.navigation.state.params.otherId, 
                vid:this.props.navigation.state.params.id,
                primary:this.props.navigation.state.params.primary})
}
onReject()
{
    this.props.navigation.pop() 
}
onSetPrimary()
{
  fetch('http://138.197.203.178:8080/api/video/setAsPrimary/' + this.state.vid, {
    method: 'PUT',
    headers: {        
      'Content-Type':'application/json',
      'Authorization':Global.token
    }
 }).then((response) => response.json())
      .then((responseJson) => {
          if(!responseJson.error)
          {
           this.setState({primary:1})
          }
      })
      .catch((error) => {
        alert(JSON.stringify(error))
        return
  });
}
  render() {
    
    var {navigate} = this.props.navigation; 
    const { recording, processing } = this.state;
    return (
       <View style={styles.contentContainer}>
          <StatusBar translucent={true} backgroundColor='transparent' barStyle='dark-content'/> 
          <Content>
            <Video source={{uri:this.state.vUrl}}   // Can be a URL or a local file.
                ref={(ref) => {
                this.player = ref
                }}
                ignoreSilentSwitch={null}  
                resizeMode = "cover"  
                repeat ={true}
                paused={this.state.paused}
                onError={this.videoError}               // Callback when video cannot be loaded
                style={{height:DEVICE_HEIGHT, width:DEVICE_WIDTH}}/>
          </Content>
         
          <TouchableOpacity style={{position:'absolute', left:0, top:30, width:60, height:60, alignItems:'center', justifyContent:'center'}}
                  onPress={()=>this.onReject()}
                 >
                    <Icon type="Ionicons" name="ios-arrow-back" style={{color:'#B64F54'}}/>
           </TouchableOpacity>
          <View style={{position:'absolute', left:0, top:70,}}>
                 <View style={{width:DEVICE_WIDTH*0.8, marginLeft:DEVICE_WIDTH*0.1,marginTop:20, flexDirection:'row', justifyContent:'space-between'}}>
                    <View>
                       <View style={{flexDirection:'row'}}>  
                         <Image source={b_name} style={{width:15, height:15}}/>
                         <Text style={{marginLeft:10, color:'#fff', fontSize:12, fontWeight:'bold'}}>{this.state.username}</Text>                    
                       </View>   
                       <View style={{flexDirection:'row', marginTop:5}}>  
                         <Image source={b_age} style={{width:15, height:15}}/>
                         <Text style={{marginLeft:10, color:'#fff', fontSize:12, fontWeight:'bold'}}>{this.state.userage}</Text>                    
                       </View> 
                       <View style={{flexDirection:'row', marginTop:5}}>  
                         <Image source={b_distance} style={{width:15, height:15}}/>
                         <Text style={{marginLeft:10, color:'#fff', fontSize:12, fontWeight:'bold'}}>{this.state.userdistance}</Text>                    
                       </View>  
                    </View>
                    <TouchableOpacity style={{width:60, height:50, borderWidth:1.5, borderRadius:7,borderColor:'#B64F54', alignItems:'center', justifyContent:'center'}}>
                      <Image source={b_profile} style={{width:30, height:30}}/>
                    </TouchableOpacity>
                </View>                
           </View>
           {(this.state.primary != 1) && (
           <View style={{position:'absolute', left:0, bottom:70,}}>
                 <TouchableOpacity style={{width:DEVICE_WIDTH*0.4, height:40, marginLeft:DEVICE_WIDTH*0.3,marginTop:20, backgroundColor:'#f00', alignItems:'center', justifyContent:'center'}}
                  onPress={()=>this.onSetPrimary()}
                 >
                    <Text style={{color:'#fff', fontSize:15, fontWeight:'bold'}}>{"Set As Primary"}</Text>
                 </TouchableOpacity>
           </View>)}
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
   instructions: {
    textAlign: 'center',
    color: '#3333ff',
    marginBottom: 5,
},
  });
export default MyVideoDetail;
