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
class IncomeDetail extends Component {
  constructor(props)
  {
    super(props);
    this.state = {
     paused:false,
     vUrl:'',
     username:'',
     userage:'',
     userimage:'',
     matchId:-1,
     userdistance:'',
     otherId:-1,
     isMatchVideo:false
    };
  }
 
static navigationOptions = {
  header : null
};
componentDidMount() {

 
  this.props.navigation.addListener('didFocus', (playload)=>{
    this.setState({paused:false})
   });
}
componentWillMount()
{
  if(Global.prePage == "Profile")
  {
    this.setState({vUrl:Global.prevUrl, otherId:Global.preOtherId})
    this.setState({isMatchVideo:Global.isMatchVideo,
      username:Global.prename,
      userage: Global.preage,
      userimage:Global.preimage,
      matchId:Global.prematchID,
      userdistance:Global.preuserdistance
    })
  
    Global.prePage == ""
  }
  else
  {
    Global.prevUrl = this.props.navigation.state.params.url;
    Global.preOtherId = this.props.navigation.state.params.otherId;
    Global.prename = this.props.navigation.state.params.name;
    Global.preage = this.props.navigation.state.params.age
    Global.preimage = this.props.navigation.state.params.imageUrl
    Global.prematchID = this.props.navigation.state.params.mid
    Global.preuserdistance =parseInt(this.props.navigation.state.params.distance)

    this.setState({vUrl:this.props.navigation.state.params.url, otherId:this.props.navigation.state.params.otherId})
    this.setState({isMatchVideo:Global.isMatchVideo,
      username:this.props.navigation.state.params.name,
      userage:this.props.navigation.state.params.age,
      userimage:this.props.navigation.state.params.imageUrl,
      matchId:this.props.navigation.state.params.mid,
      userdistance:parseInt(this.props.navigation.state.params.distance)})
  }
  
}
gotoChat()
{
  if(this.state.matchId == -1)
  {
    return;
  }
  this.setState({paused:true})
  var data = {
    data:{
    imageUrl:this.state.userimage,
    name:this.state.username,
    other_user_id:this.state.otherId,
    match_id:this.state.matchId
   }
 }
  this.props.navigation.navigate("ChatDetail",{data:data})
}
onReject()
{
    var details = {
        'otherId':this.state.otherId
    };
    var formBody = [];
    for (var property in details) {
      var encodedKey = encodeURIComponent(property);
      var encodedValue = encodeURIComponent(details[property]);
      formBody.push(encodedKey + "=" + encodedValue);
    }
    formBody = formBody.join("&");
  
    fetch('http://138.197.203.178:8080/api/match/sendHeartReject', {
          method: 'POST',
          headers: {        
            'Content-Type':'application/x-www-form-urlencoded',
            'Authorization':Global.token     
          },
          body:formBody,
        }).then((response) => response.json())
            .then((responseJson) => {
               //  alert(JSON.stringify(responseJson))
                if(!responseJson.error)
                {
                    this.setState({paused:true})
                    this.props.navigation.pop()
                }
            })
            .catch((error) => {
              alert(JSON.stringify(error))
              return
           });
    
}
onMatch()
{
    var details = {
        'otherId':this.state.otherId
    };
    var formBody = [];
    for (var property in details) {
      var encodedKey = encodeURIComponent(property);
      var encodedValue = encodeURIComponent(details[property]);
      formBody.push(encodedKey + "=" + encodedValue);
    }
    formBody = formBody.join("&");
  
    fetch('http://138.197.203.178:8080/api/match/requestMatch', {
          method: 'POST',
          headers: {        
            'Content-Type':'application/x-www-form-urlencoded',
            'Authorization':Global.token  
          },
          body:formBody,
        }).then((response) => response.json())
            .then((responseJson) => {
              //  alert(JSON.stringify(responseJson))
                if(!responseJson.error)
                {
                    this.setState({paused:true})
                    this.setState({isMatchVideo:true, matchId:responseJson.data.receiveResult.insertId})                 
                }
            })
            .catch((error) => {
              alert(JSON.stringify(error))
              return
      });
}
gotoProfile()
{
  this.setState({paused:true})
  if(this.state.otherId != -1)
  {
    Global.prevpage = "IncomeDetail"
    this.props.navigation.replace("Profile", {id:this.state.otherId, name:this.state.username})
  }
}
back()
{
  this.props.navigation.pop()
}
gotoReport()
{
  if(this.state.otherId != -1)
  {
    this.props.navigation.navigate("Report", {id:this.state.otherId})
  }
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
                    <TouchableOpacity style={{width:60, height:50, borderWidth:1.5, borderRadius:7,borderColor:'#B64F54', alignItems:'center', justifyContent:'center'}}
                     onPress={()=>this.gotoProfile()}
                    >
                      <Image source={b_profile} style={{width:30, height:30}}/>
                    </TouchableOpacity>
                </View>
                <View style={{width:DEVICE_WIDTH*0.8, marginLeft:DEVICE_WIDTH*0.1, marginTop:30, justifyContent:'space-between'}}>
                   <TouchableOpacity style={{width:60, height:50, borderWidth:1.5, borderRadius:7,borderColor:'#B64F54', alignItems:'center', justifyContent:'center'}}
                     onPress={()=>this.gotoReport()}
                    >
                        <Image source={b_notification} style={{width:30, height:30}}/>
                    </TouchableOpacity>
                 </View>
           </View>
           <TouchableOpacity style={{position:'absolute', left:0, top:30, width:60, height:60, alignItems:'center', justifyContent:'center'}}
                  onPress={()=>this.back()}
                 >
                    <Icon type="Ionicons" name="ios-arrow-back" style={{color:'#B64F54'}}/>
           </TouchableOpacity>
           {!this.state.isMatchVideo && (
           <View style={{position:'absolute', left:0, bottom:120}}>
               <View style={{width:DEVICE_WIDTH*0.5, marginLeft:DEVICE_WIDTH*0.25, flexDirection:'row', justifyContent:'space-between'}}>
                 <TouchableOpacity style={{width:60, height:60, borderRadius:30, backgroundColor:'#fff', alignItems:'center', justifyContent:'center'}}
                  onPress={()=>this.onReject()}
                 >
                    <Icon type="FontAwesome" name="close" style={{color:'#B64F54'}}/>
                 </TouchableOpacity>
                 <TouchableOpacity style={{width:60, height:60, borderRadius:30, backgroundColor:'#B64F54', alignItems:'center', justifyContent:'center'}}
                  onPress={()=>this.onMatch()}
                 >
                    <Icon type="FontAwesome" name="heart" style={{color:'#fff'}}/>
                 </TouchableOpacity>
               </View>
           </View>)}
           {this.state.isMatchVideo && (
           <View style={{position:'absolute', left:0, bottom:120}}>
             <TouchableOpacity style={{width:DEVICE_WIDTH*0.5,height:40, marginLeft:DEVICE_WIDTH*0.25, alignItems:'center', justifyContent:'center', 
                                       backgroundColor:'#B64F54', borderRadius:DEVICE_WIDTH*0.25}}
                                       onPress={()=>this.gotoChat()}
                                       >
                  <Text style={{color:'#fff', fontSize:16}}>{"Start Chat"}</Text>
             </TouchableOpacity>  
           </View>  
           )}     
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
export default IncomeDetail;
