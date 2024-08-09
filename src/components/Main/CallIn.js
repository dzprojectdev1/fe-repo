import React, {Component} from 'react';
import {Text} from 'native-base';
import {
  BackHandler,
  Dimensions,
  Image,
  ImageBackground,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import hiddenMan from '../../assets/images/hidden_man.png';
import bg from '../../assets/images/back_1.jpeg';
import call_end_reject from '../../assets/images/call_end_reject.png';
import dialpad from '../../assets/images/dialpad.png';
import dialpad_mute from '../../assets/images/dialpad_mute.png';
import speaker from '../../assets/images/speaker.png';
import speaker_mute from '../../assets/images/speaker_mute.png';
import Global from '../Global';

class CallIn extends Component {
  static navigationOptions = {
    header: null,
  };

  constructor(props) {
    super(props);
    const {data} = props.route.params;
    this.state = {
      other: {
        userId: data.userId,
        name: data.name,
        imgUrl: data.imgUrl,
        description: data.description,
        matchId: data.matchId,
      },
      hours: 0,
      minutes: 0,
      seconds: 0,
    };
  }

  componentDidMount() {
    Global.saveData.nowPage = 'CallIn';
    BackHandler.addEventListener('hardwareBackPress', this.backPressed);
    this.timeCounter();
  }

  timer = () => {
    const {hours, minutes, seconds} = this.state;
    let currentSeconds = seconds + 1;
    let currentHours;
    let currentMinutes;
    if (currentSeconds == 60) {
      currentSeconds = 0;
      currentMinutes = minutes + 1;

      if (currentMinutes == 60) {
        currentMinutes = 0;
        currentHours = hours + 1;
      }

      currentHours = hours;

      this.setState({
        hours: currentHours,
        minutes: currentMinutes,
        seconds: currentSeconds,
      });
    } else {
      this.setState({
        hours: hours,
        minutes: minutes,
        seconds: currentSeconds,
      });
    }
  };

  timeCounter = () => {
    const intervalId = setInterval(this.timer, 1000);
    // store intervalId in the state so it can be accessed later:
    this.setState({intervalId: intervalId});
  };

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.backPressed);

    clearInterval(this.state.intervalId);
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
        isFirstTime: false,
        imageUrl: this.state.other.imgUrl,
      },
    });
  };

  render() {
    return (
      <ImageBackground source={bg} style={styles.contentContainer}>
        <View style={{justifyContent: 'center', alignItems: 'center'}}>
          <Image
            source={
              this.state.other.imgUrl
                ? {uri: this.state.other.imgUrl}
                : hiddenMan
            }
            style={styles.avatarOtherUser}
          />
          <Text style={styles.userName}>{this.state.other.name}</Text>
          <Text style={styles.dialling}>
            {(this.state.hours < 10
              ? '0' + this.state.hours
              : this.state.hours) +
              ':' +
              (this.state.minutes < 10
                ? '0' + this.state.minutes
                : this.state.minutes) +
              ':' +
              (this.state.seconds < 10
                ? '0' + this.state.seconds
                : this.state.seconds)}
          </Text>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              width: DEVICE_WIDTH * 0.6,
              marginTop: DEVICE_HEIGHT * 0.3,
            }}>
            <TouchableOpacity
              style={{width: 30}}
              onPress={() => this.setState({speaker: !this.state.speaker})}>
              <Image
                source={!this.state.speaker ? speaker : speaker_mute}
                style={styles.smallIcon}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={{width: 60}}
              onPress={() => this.gotoChat()}>
              <Image
                source={call_end_reject}
                style={styles.call_end_rejct_button}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={{width: 30}}
              onPress={() => this.setState({dialpad: !this.state.dialpad})}>
              <Image
                source={!this.state.dialpad ? dialpad : dialpad_mute}
                style={styles.smallIcon}
              />
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
  },
});
export default CallIn;
