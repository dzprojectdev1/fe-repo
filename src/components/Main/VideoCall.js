import React from 'react';
import {
    SafeAreaView,
    View,
    StyleSheet,
    ActivityIndicator,
    BackHandler,
    Dimensions,
    ImageBackground,
    Image,
    Text,
    TouchableOpacity
} from 'react-native';
import { connect } from 'react-redux';
import QB from 'quickblox-react-native-sdk';
import WebRTCView from 'quickblox-react-native-sdk/RTCView';
import Global from '../Global';

// asset images
import hiddenMan from '../../assets/images/hidden_man.png';
import bg from '../../assets/images/back_1.jpeg';
import call_end_reject from '../../assets/images/call_end_reject.png';
import speaker from '../../assets/images/speaker.png';
import speaker_mute from '../../assets/images/speaker_mute.png';
import chat_icon from '../../assets/images/chat.png';

class VideoCall extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,
            videoSession: {},
            speaker: false,
            callStateStr: 'CALLING',
            opponent: props.navigation.state.params.data.opponent,
            hours: 0,
            minutes: 0,
            seconds: 0,
            intervalId: 0,
            showTimer: false
        }
    }

    componentWillMount() {
        this.backHanlder = BackHandler.addEventListener('hardwareBackPress', this.backPressed);
        const { quickBloxInfo } = this.props;
        QB.chat
            .isConnected()
            .then((connected) => { // boolean
                // handle as necessary, i.e.
                // if (connected === false) reconnect()
                if (connected === true) {
                    this.initWebRTC();
                } else {
                    QB.chat
                        .connect({
                            userId: quickBloxInfo.user.id,
                            password: 'quickblox'
                        })
                        .then(() => {
                            // connected successfully
                            this.initWebRTC();
                        }).catch((e) => {
                            // some error occurred
                            alert(JSON.stringify(e.message));
                        });
                }
            }).catch((e) => {
                // handle error
                alert(JSON.stringify(e.message));
            });

    }

    timeCounter = () => {
        var intervalId = setInterval(this.timer, 1000);
        this.setState({ intervalId: intervalId });
    }

    timer = () => {
        var { hours, minutes, seconds } = this.state;
        var currentSeconds = seconds + 1;
        var currentHours;
        var currentMinutes;
        if (currentSeconds === 60) {
            currentSeconds = 0;
            currentMinutes = minutes + 1;
            if (currentMinutes === 60) {
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
    }

    componentWillUnmount() {
        clearInterval(this.state.intervalId);
        this.backHanlder.remove();
    }

    backPressed = () => {
        this.callEndEvent();
    }

    initWebRTC = () => {
        const filter = {
            field: QB.users.USERS_FILTER.FIELD.LOGIN,
            operator: QB.users.USERS_FILTER.OPERATOR.IN,
            type: QB.users.USERS_FILTER.TYPE.STRING,
            value: this.state.opponent.userId
        };
        QB.users
            .getUsers({ filter: filter })
            .then((result) => {
                // users found
                let allUsers = result.users;
                let otherUserData = allUsers.filter(user => user.login === JSON.stringify(this.state.opponent.userId));
                if (otherUserData.length) {
                    const params = {
                        opponentsIds: [otherUserData[0].id],
                        type: QB.webrtc.RTC_SESSION_TYPE.VIDEO,
                        userInfo: {
                            'callerName': Global.saveData.u_name,
                            'receiverName': this.state.opponent.name,
                        }
                    }

                    QB.webrtc
                        .call(params)
                        .then((session) => {
                            /* session created */
                            alert(JSON.stringify(session));
                            this.setState({
                                videoSession: session,
                                isLoading: false
                            });
                        }).catch((e) => {
                            /* handle error */
                            alert(JSON.stringify(e.message))
                        })
                }
            }).catch((e) => {
                // handle error
                alert(JSON.stringify(e.message))
            });
    }

    callEndEvent = () => {
        this.setState({
            callStateStr: 'Call Ended'
        });
        const userInfo = {
            // custom data can be passed using this object
            // only [string]: string type supported
        }

        QB.webrtc
            .hangUp({ sessionId: this.state.videoSession.id, userInfo })
            .then((session) => {
                /* handle session */
                this.props.navigation.pop();
            }).catch((e) => {
                /* handle error */
                alert(JSON.stringify(e.message))
            });

    }

    render() {
        const { state } = this;
        return (
            <View source={bg} style={styles.container}>
                {state.isLoading && (
                    <ActivityIndicator size="large" color="#0000ff" />
                )}
                {!state.isLoading && (
                    <View style={{
                        width: DEVICE_WIDTH,
                        height: DEVICE_HEIGHT * 0.7,
                        borderWidth: 3,
                        borderColor: '#FFF',
                        padding: 3,
                        zIndex: -1
                    }}>
                        <WebRTCView // opponent video
                            sessionId={state.videoSession.id}
                            // add styles as necessary
                            style={{ width: '100%', height: '100%', }}
                            userId={this.props.quickBloxInfo.user.id} // your user's Id for local video or occupantId for remote
                        />
                    </View>
                )}
                {!state.isLoading && (
                    <View style={{
                        backgroundColor: '#FFF',
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        width: DEVICE_WIDTH,
                        height: DEVICE_HEIGHT * 0.3,
                        borderWidth: 3,
                        borderColor: '#FFF',
                        padding: 3,
                        zIndex: 1
                    }}>
                        <TouchableOpacity style={{ width: 60, height: 60 }} onPress={this.callEndEvent}>
                            <Image source={call_end_reject} style={styles.call_end_rejct_button} />
                        </TouchableOpacity>
                        <WebRTCView
                            sessionId={state.videoSession.id}
                            style={styles.myvideo} // add styles as necessary
                            userId={this.props.quickBloxInfo.user.id} // your user's Id for local video or occupantId for remote
                        />
                        <TouchableOpacity style={{ width: 60, height: 60 }} onPress={this.callEndEvent}>
                            <Image source={call_end_reject} style={styles.call_end_rejct_button} />
                        </TouchableOpacity>
                    </View>
                )}
                {/* {state.isLoading && (
                    <View style={{ justifyContent: 'center', alignItems: 'center', }}>
                        <Image source={state.opponent.imgUrl ? { uri: state.opponent.imgUrl } : hiddenMan} style={styles.avatarOtherUser} />
                        <Text style={styles.userName}>{state.opponent.name}</Text>
                        <Text style={styles.dialling}>{state.callStateStr}</Text>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: DEVICE_WIDTH * 0.6, marginTop: DEVICE_HEIGHT * 0.3 }}>
                            <TouchableOpacity style={{ width: 30 }} onPress={() => this.setState({ speaker: !state.speaker })}>
                                <Image source={!state.speaker ? speaker : speaker_mute} style={styles.smallIcon} />
                            </TouchableOpacity>
                            <TouchableOpacity style={{ width: 60 }} onPress={this.callEndEvent}>
                                <Image source={call_end_reject} style={styles.call_end_rejct_button} />
                            </TouchableOpacity>
                            <TouchableOpacity style={{ width: 30 }} onPress={() => { }}>
                                <Image source={chat_icon} style={styles.smallIcon} />
                            </TouchableOpacity>
                        </View>
                    </View>
                )} */}
            </View>
        )
    }
}
const DEVICE_WIDTH = Dimensions.get('window').width;
const DEVICE_HEIGHT = Dimensions.get('window').height;
const styles = StyleSheet.create({
    // container: {
    //     flex: 1,
    //     flexDirection: 'column',
    //     justifyContent: 'center',
    //     backgroundColor: 'white'
    // },
    container: {
        flex: 1,
        backgroundColor: '#313131',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        width: DEVICE_WIDTH,
        height: DEVICE_HEIGHT,
    },
    video: {
        width: DEVICE_WIDTH,
        height: DEVICE_HEIGHT * 0.7,
        zIndex: 1000
    },
    myvideo: {
        width:  DEVICE_WIDTH * 0.25,
        height: DEVICE_HEIGHT * 0.3,
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
        alignItems: 'center',
        justifyContent: 'center'
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

const mapStateToProps = (state) => {
    const { quickBloxInfo } = state.reducer
    return { quickBloxInfo }
};

export default connect(mapStateToProps)(VideoCall);
