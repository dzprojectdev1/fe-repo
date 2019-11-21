import React, { Component } from "react";
import {
  Icon,
  Text,
  Content,
} from "native-base";
import {
  AsyncStorage,
  BackHandler,
  Image,
  ScrollView,
  Dimensions,
  View,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Alert,
  ImageBackground,
} from "react-native";
import hiddenMan from '../../assets/images/hidden_man.png';
import bg from '../../assets/images/back_1.jpeg';
import call_end_reject from '../../assets/images/call_end_reject.png';
import call_ring_accept from '../../assets/images/call_ring_accept.png';
import Global from '../Global';

import { SERVER_URL, GCS_BUCKET } from '../../config/constants';

class CallOutgo extends Component {
  static navigationOptions = {
    header: null
  };

  constructor(props) {
    super(props);
    this.state = {
      other: {
          userId: props.navigation.state.params.data.userId,
          name: props.navigation.state.params.data.name,
          imgUrl: props.navigation.state.params.data.imgUrl,
          description: props.navigation.state.params.data.description,
          matchId: props.navigation.state.params.data.matchId,
      },
    };
  }

  componentWillMount() {
    Global.saveData.nowPage = 'CallIncome';
    BackHandler.addEventListener('hardwareBackPress', this.backPressed);
  }

  componentDidMount() {
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.backPressed);
  }

  gotoChat = () => {
    this.props.navigation.replace('ChatDetail', {
      data: {
        data: {
            other_user_id: this.state.other.userId,
            name: this.state.other.name,
            description: this.state.other.description,
            match_id: this.state.other.matchId,
        },
        imageUrl: this.state.other.imgUrl,
      }
    });
  }

  gotoCallIn = () => {
    this.props.navigation.replace('CallIn', {
      data: {
          userId: this.state.other.userId,
          name: this.state.other.name,
          imgUrl: this.state.other.imgUrl,
          description: this.state.other.description,
          matchId: this.state.matchId,
      },
    });
  }

  render() {
    return (
        <ImageBackground source={bg} style={styles.contentContainer}>
          <View style={{ justifyContent: 'center', alignItems: 'center', }}>
            <Image source={this.state.other.imgUrl ? { uri: this.state.other.imgUrl } : hiddenMan} style={styles.avatarOtherUser} />
            <Text style={styles.userName}>{this.state.other.name}</Text>
            <Text style={styles.dialling}>{'CALLING'}</Text>
            <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: DEVICE_WIDTH * 0.5, marginTop: DEVICE_HEIGHT * 0.3}}>
              <TouchableOpacity style={{width: 60}} onPress={() => this.gotoChat()}>
                  <Image source={call_end_reject} style={styles.call_end_rejct_button} />
              </TouchableOpacity>
              <TouchableOpacity style={{width: 60}} onPress={() => this.gotoCallIn()}>
                  <Image source={call_ring_accept} style={styles.call_end_rejct_button} />
              </TouchableOpacity>
            </View>
          </View>
        </ImageBackground>
    );
  }
}
const DEVICE_WIDTH = Dimensions.get('window').width;
const DEVICE_HEIGHT = Dimensions.get('window').height;
const styles = StyleSheet.create({
  contentContainer: {
    width: '100%',
    height: '100%',
  },
  avatarOtherUser: {
    marginTop: DEVICE_HEIGHT * 0.15,
    width: DEVICE_WIDTH * 0.4,
    height: DEVICE_WIDTH * 0.4,
    borderRadius: DEVICE_WIDTH * 0.2,
  },
  userName: {
    fontSize: 18,
    color: '#FFF',
    marginTop: 30,
  },
  dialling: {
    fontSize: 16,
    color: '#FFF',
    marginTop: 10,
  },
  call_end_rejct_button: {
    width: 60,
    height: 60,
  },
  smallIcon: {
    marginTop: 15, 
    width: 30,
    height: 30,
  }
});
export default CallOutgo;
