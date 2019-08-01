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
import {ImageBackground, BackHandler ,  Image,  ScrollView, Platform,Dimensions,TextInput, View,StyleSheet,FlatList, TouchableOpacity, StatusBar, Alert, Linking} from "react-native";

import b_browse from '../../assets/images/browse.png';
import b_incoming from '../../assets/images/incoming.png';
import b_match from '../../assets/images/match.png';
import b_chat from '../../assets/images/chat.png';
import b_myvideo from '../../assets/images/myvideo.png';
import b_name from '../../assets/images/name.png';
import b_time from '../../assets/images/time.png';
import Global from '../Global';
class Chat extends Component {
  constructor(props)
  {
    super(props);
    this.state = {
        datas:[],
        tmpData:[],
        searchText:''
    };
  }
 
static navigationOptions = {
  header : null
};
componentDidMount() {
    this.props.navigation.addListener('didFocus', (playload)=>{
      // this.getHeartUsers()
    });
   // this.getHeartUsers()
 }

componentWillUnmount() {
  BackHandler.removeEventListener('hardwareBackPress', this.backPressed);
}   
   componentWillMount()
   {
    BackHandler.addEventListener('hardwareBackPress', this.backPressed);
    this.getChatData()
   }
   backPressed = () => {
    Alert.alert(
      '',
      'Do you want to exit the app?',
      [
        {text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
        {text: 'Yes', onPress: () => BackHandler.exitApp()},
      ],
      { cancelable: false });
      return true;
  }
   getChatData()
   {   
      fetch("http://138.197.203.178:8080/api/chat/all", {
          method: 'GET',
          headers: {        
            'Content-Type':'application/json',
            'Authorization':Global.token
          }
      }).then((response) => response.json())
            .then((responseJson) => {  
               // alert(JSON.stringify(responseJson))            
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
                 list_items.push({index:i, imageUrl:responseJson.url, videoUrl:vurl,data:data[i]})
             })
             .catch((error) => {
               alert(JSON.stringify(error))
               return
       });
     }
     this.setState({datas:list_items, tmpData:list_items})
   }
  toggle()
  {
    Alert.alert("The UI is not supported yet")
  }
  onPlus()
  {
    Alert.alert("The UI is not supported yet")
  }
  onSearch(s_text)
  {
   var tmpData = this.state.tmpData
   var list_itmes =[]
   for(var i=0;i<tmpData.length;i++)
   {
     var name = tmpData[i].data.name
     var message_text = tmpData[i].data.message_text
     if(name.indexOf(s_text) != -1)
     {
       list_itmes.push(tmpData[i])
     }
     else
     {
      if(message_text.indexOf(s_text) != -1)
      {
        list_itmes.push(tmpData[i])
      }
     }
   }
   this.setState({datas:list_itmes, searchText:s_text})
  }
  gotoChat(data)
  {
    this.props.navigation.navigate("ChatDetail", {data:data})    
  }
  render() {
    
    var {navigate} = this.props.navigation; 

    return (
       <View style={styles.contentContainer}>
          <StatusBar translucent={true} backgroundColor='transparent' barStyle='dark-content'/> 
          <View style={{marginTop:40, flexDirection:'row', height:40}}>
                  {/* <TouchableOpacity style={{height:40, width:40, marginLeft:10, alignItems:'center',}}
                   onPress={()=>this.toggle()}
                  >
                    <Icon type="MaterialCommunityIcons" name="menu" style={{color:"#000", marginTop:5}}/>                   
                  </TouchableOpacity> */}
                  <View style={{width:DEVICE_WIDTH, height:40, alignItems:'center', justifyContent:'center'}}>
                      <Text style={{}}>{"CHAT"}</Text>
                  </View>
                  {/* <TouchableOpacity style={{height:40, width:40, marginLeft:10, alignItems:'center', justifyContent:'center',}}
                   onPress={()=>this.onPlus()}
                  >
                      <Icon type="MaterialCommunityIcons" name="plus" style={{color:'#000'}} />
                  </TouchableOpacity> */}
          </View>
         <View  style={styles.inputwrapper}>
                      {/* <Icon type="Ionicons" name="ios-search" style={{color:"#808080", marginTop:5}}/> */}
                      <TextInput     
                      style={{marginLeft:10, fontSize:16,width:DEVICE_WIDTH - 40, color:'#000',overflow:'hidden'}}    
                      value={this.state.searchText}                 
                      placeholder={"search message"}
                      onChangeText={text => this.onSearch(text)}
                      placeholderTextColor="#808080"
                      underlineColorAndroid="transparent"
                      />
          </View>

          <ScrollView style={{marginTop:15}} removeClippedSubviews={true}>
                {(this.state.datas.length != 0) && (
                 <FlatList
                            numColumns={1}
                            style={{ flex: 0 }}
                            removeClippedSubviews={true}
                            data={this.state.datas}
                            initialNumToRender={this.state.datas.length}
                            renderItem={({ item: rowData }) => {                              
                                  return (
                                     <TouchableOpacity style={{width:DEVICE_WIDTH - 10,flexDirection:'row', marginTop:10, marginLeft:5, marginRight:5,}}  onPress={()=>this.gotoChat(rowData)}>
                                         <View style={{width:40, height:40, alignItems:'center', justifyContent:'center'}}>
                                           <Image source={{uri:rowData.imageUrl}} resizeMode="cover" style={{width:40, height:40, borderRadius:20, backgroundColor:'#5A5A5A'}}/>
                                         </View>
                                         <View style={{width:DEVICE_WIDTH - 170, height:40, marginLeft:5, justifyContent:'center', alignItems:'center'}}>
                                           <View style={{width:DEVICE_WIDTH - 170}}>
                                             <Text numberOfLines={1} style={{color:'#808080'}}>{rowData.data.name}</Text>
                                             <Text numberOfLines={1} style={{fontSize:12, color:'#808080'}}>{rowData.data.message_text}</Text>
                                           </View>
                                         </View>
                                         <View style={{width:100, height:40, marginLeft:5, alignItems:'center', justifyContent:'center'}}>
                                           {/* {(rowData.new>0) && (
                                             <TouchableOpacity style={{width:20, height:20, backgroundColor:'#f00', borderRadius:10, alignItems:'center', justifyContent:'center'}}> 
                                                 <Text style={{fontSize:12, color:'#fff'}}>{"" + rowData.new}</Text>                                               
                                             </TouchableOpacity>
                                           )} */}
                                           <Text numberOfLines={1} style={{fontSize:12, color:'#808080'}}>{rowData.data.time_ago}</Text>
                                         </View>  
                                     </TouchableOpacity>      
                                    );
                              }}
                            keyExtractor={(item, index) => index}
                 />)}
             <View style={{height:50}}/>    
          </ScrollView>
          <Footer style={{backgroundColor:'#222F3F', borderTopColor:'#222F3F', height:Platform.select({'android':50, 'ios':30})}}>
                    <FooterTab>
                        <Button style={{backgroundColor:'#222F3F'}}  transparent onPress={()=>this.props.navigation.navigate("Browse")}>
                            <Image source={b_browse} style={{width:25, height:25,}}/>
                            <Text style={{color: '#fff', fontSize:6, fontWeight:'bold', marginTop:3}}>{"BROWSE"}</Text>
                        </Button>
                        <Button style={{backgroundColor:'#222F3F'}}  transparent onPress={()=>this.props.navigation.navigate("Income")}>
                            <Image source={b_incoming} style={{width:25, height:25}}/>
                            <Text style={{color: '#fff', fontSize:6, fontWeight:'bold', marginTop:3}}>{"INCOMING"}</Text>
                        </Button>
                        <Button style={{backgroundColor:'#222F3F'}}  transparent onPress={()=>this.props.navigation.navigate("Match")}>
                            <Image source={b_match} style={{width:25, height:25}}/>
                            <Text style={{color: '#fff', fontSize:6, fontWeight:'bold', marginTop:3}}>{"MATCH"}</Text>
                        </Button>
                        <Button style={{backgroundColor:'#222F3F'}}  transparent >
                            <Image source={b_chat} style={{width:25, height:25,tintColor:'#B64F54'}}/>
                            <Text style={{color: '#B64F54', fontSize:6, fontWeight:'bold', marginTop:3}}>{"CHAT"}</Text>
                        </Button>
                        <Button style={{backgroundColor:'#222F3F'}}  transparent onPress={()=>this.props.navigation.navigate("MyVideo")}>
                            <Image source={b_myvideo} style={{width:25, height:25}}/>
                            <Text style={{color: '#fff', fontSize:6, fontWeight:'bold', marginTop:3}}>{"MY VIDEO"}</Text>
                        </Button>                   
                    </FooterTab>
          </Footer>    
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
inputwrapper: {
  backgroundColor: '#fff',
  flexDirection:'row',
  height: 40,
  marginLeft:10,
  marginTop:10,
  paddingLeft: 15,
  width:DEVICE_WIDTH - 20,
  borderRadius:30,
  borderWidth:1,
  borderColor:'#f00',
  fontSize:18,
  color: '#000',
},
  });
export default Chat;
