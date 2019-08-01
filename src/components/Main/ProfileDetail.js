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
import { RNCamera } from 'react-native-camera';
import Video from 'react-native-video';
import logo from '../../assets/images/logo.png';
import b_browse from '../../assets/images/browse.png';
import b_incoming from '../../assets/images/incoming.png';
import b_match from '../../assets/images/match.png';
import b_chat from '../../assets/images/chat.png';
import b_myvideo from '../../assets/images/myvideo.png';

import b_notification from '../../assets/images/notification.png';
import b_filters from '../../assets/images/filters.png';

import b_name from '../../assets/images/name.png';
import b_age from '../../assets/images/age.png';
import b_distance from '../../assets/images/distance.png';
import b_profile from '../../assets/images/profile.png';

import Global from '../Global';
import Income from "./Income";
class ProfileDetail extends Component {
  constructor(props)
  {
    super(props);
    this.state = {
     paused:false,
     vUrl:'',
     username:'',
     userage:'',
     userdistance:'',
     otherId:-1,
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
  this.setState({vUrl:this.props.navigation.state.params.url, otherId:this.props.navigation.state.params.otherId})
}

onReject()
{

    this.props.navigation.pop()
    
}
  render() {
    
    var {navigate} = this.props.navigation; 
    const { recording, processing } = this.state;
    return (
       <View style={styles.contentContainer}>
          <StatusBar translucent={true} backgroundColor='transparent' barStyle='dark-content'/> 
          <Content>
            {(this.state.vUrl != "") && (
            <Video source={{uri:this.state.vUrl}}   // Can be a URL or a local file.
                ref={(ref) => {
                this.player = ref
                }}
                ignoreSilentSwitch={null}  
                resizeMode = "cover"  
                repeat ={true}
                paused={this.state.paused}
                onError={this.videoError}               // Callback when video cannot be loaded
                style={{height:DEVICE_HEIGHT, width:DEVICE_WIDTH}}/>)}
          </Content>
             
                 <TouchableOpacity style={{position:'absolute', left:0, top:30, width:60, height:60, alignItems:'center', justifyContent:'center'}}
                  onPress={()=>this.onReject()}
                 >
                    <Icon type="Ionicons" name="ios-arrow-back" style={{color:'#B64F54'}}/>
                 </TouchableOpacity>
               
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
export default ProfileDetail;
