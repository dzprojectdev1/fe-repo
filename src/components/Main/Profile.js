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
import {ImageBackground,   Image,  ScrollView, Platform,Dimensions,TextInput, View,StyleSheet,FlatList, TouchableOpacity, StatusBar, Alert, Linking} from "react-native";

import b_browse from '../../assets/images/browse.png';
import b_incoming from '../../assets/images/incoming.png';
import b_match from '../../assets/images/match.png';
import b_chat from '../../assets/images/chat.png';
import b_myvideo from '../../assets/images/myvideo.png';
import b_delete from '../../assets/images/delete.png';
import b_time from '../../assets/images/time.png';
import Global from '../Global';

class Profile extends Component {
  constructor(props)
  {
    super(props);
    this.state = {
        id:'',
        name:'',
        datas:[]
    };
  }
 
static navigationOptions = {
  header : null
};
componentDidMount() {
    this.props.navigation.addListener('didFocus', (playload)=>{
    });

   var otherid = this.props.navigation.state.params.id;

   var othername = this.props.navigation.state.params.name;

   this.setState({id:otherid, name:othername});
   this.getVideos(otherid);
}
getVideos(otherid) {
  fetch("http://138.197.203.178:8080/api/video/othervideo/" + otherid, {
      method: 'GET',
      headers: {        
        'Content-Type':'application/json',
        'Authorization':Global.token
      }
  }).then((response) => response.json())
        .then((responseJson) => {
            if(!responseJson.error)
            {
              this.getTumbnails(responseJson.data)
            }
        })
        .catch((error) => {
          alert(JSON.stringify(error))
          return
  });
}
   getTumbnails=async (data) =>
   {
     var list_items = [];
     for(var i=0;i<data.length;i++)
     {
       var url = "http://138.197.203.178:8080/api/storage/videoLink?fileId=" + data[i].cdn_filtered_id + "-thumbnail"
       var vurl = "http://138.197.203.178:8080/api/storage/videoLink?fileId=" + data[i].cdn_filtered_id
       await fetch(url, {
           method: 'GET',
           headers: {        
             'Content-Type':'application/json',
             'Authorization':Global.token
           }
        }).then((response) => response.json())
             .then((responseJson) => {
                // alert(JSON.stringify(responseJson))       
                 list_items.push({index:i, otherId:data[i].other_user_id, imageUrl:responseJson.url, videoUrl:vurl, name:'NAME', time:'TIME'})
             })
             .catch((error) => {
               alert(JSON.stringify(error))
               return
       });
     }
     this.setState({datas:list_items})
   }
   showUserVideo(url, otherId)
   {
     fetch(url, {
       method: 'GET',
       headers: {        
         'Content-Type':'application/json',
         'Authorization':Global.token
       }
      }).then((response) => response.json())
         .then((responseJson) => {
            // alert(JSON.stringify(responseJson))
            console.log(responseJson.url)
            this.props.navigation.navigate("ProfileDetail",{url:responseJson.url, otherId:otherId})
         })
         .catch((error) => {
           alert("There is error, please try again!")
           return
      });
   }
  onBack()
  {
    if(Global.prevpage == "ChatDetail")
    {
      this.props.navigation.pop()
    }
    else
    {
      Global.prePage = "Profile"
      this.props.navigation.replace(Global.prevpage)
      
    }
  }

  render() {
    return (
       <View style={styles.contentContainer}>
          <StatusBar translucent={true} backgroundColor='transparent' barStyle='dark-content'/>          
          <View style={{height:40, marginTop:Platform.select({'ios':'10%', 'android':'10%'}), flexDirection:'row'}}>
            <TouchableOpacity style={{width:40, height:40, marginLeft:10, justifyContent:'center', alignItems:'center'}}
             onPress={()=>this.onBack()} >
              <Icon type="Ionicons" name="ios-arrow-back" style={{color:'#B64F54'}}/>
            </TouchableOpacity>
            <View style={{width:DEVICE_WIDTH-100, alignItems:'center', justifyContent:'center'}}>
              <Text style={{fontSize:16}}>{this.state.name}</Text>
            </View>
          </View>  
          <ScrollView style={{marginTop:15}} removeClippedSubviews={true}>
                {(this.state.datas.length != 0) && (
                 <FlatList
                    numColumns={2}
                    style={{ flex: 0 }}
                    removeClippedSubviews={true}
                    data={this.state.datas}
                    initialNumToRender={this.state.datas.length}
                    renderItem={({ item: rowData }) => {                              
                          return (
                              <TouchableOpacity style={{width:DEVICE_WIDTH/2 - 10, marginTop:10, marginLeft:5, marginRight:5,}}  onPress={()=>this.showUserVideo(rowData.videoUrl, rowData.otherId)}>
                                  <ImageBackground source={{uri:rowData.imageUrl}} resizeMethod="resize" style={{width:DEVICE_WIDTH/2 - 20, height:(DEVICE_WIDTH/2 - 20)*1.5, marginTop:3,marginLeft:5, backgroundColor:'#5A5A5A'}}>
                                    {/* <TouchableOpacity style={{marginTop:(DEVICE_WIDTH/2-20)*1.5 - 50, marginLeft:DEVICE_WIDTH/2 - 70}} 
                                    onPress={()=>this.onDeleteVideo()}
                                    >
                                      <Image source={b_delete} style={{width:40, height:40}}/>
                                    </TouchableOpacity> */}
                                  </ImageBackground>    
                              </TouchableOpacity>
                            );
                        
                      }}
                    keyExtractor={(item, index) => index}
                 />)}
                 {/* {(this.state.datas.length == 0) && (
                   <View style={{alignItems:'center', justifyContent:'center'}}>
                      <Text>{"There are no the videos for this user"}</Text>
                   </View>
                 )} */}
             <View style={{height:50}}/>    
          </ScrollView> 
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
export default Profile;
