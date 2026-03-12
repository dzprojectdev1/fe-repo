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
import QB from '../stubs/quickblox-stub';
import WebRTCView from '../stubs/quickblox-rtcview-stub';
import Sound from 'react-native-sound';
import bg from '../../assets/images/back_1.jpeg';
import hiddenMan from '../../assets/images/hidden_man.png';
import call_end_reject from '../../assets/images/call_end_reject.png';
import {
    CALL,
    CALL_END,
    REJECT,
    ACCEPT,
    HANG_UP,
    PEER_CONNECTION_STATE_CHANGED,
    RECEIVED_VIDEO_TRACK, NOT_ANSWER
} from '../../config/constants';
Sound.setCategory('Playback');
const whoosh = new Sound('happy_birthday_by_music_box.mp3', Sound.MAIN_BUNDLE, (error) => {
    if (error) {
        console.log('failed to load the sound', error);
        return;
    }
    // loaded successfully
    console.log('duration in seconds: ' + whoosh.getDuration() + 'number of channels: ' + whoosh.getNumberOfChannels());

});

class VideoCall extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,
            videoSession: {},
            speaker: false,
            callStateStr: 'CALLING',
            opponentAppInfo: props.navigation.state.params.data.opponentAppInfo,
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
    componentWillReceiveProps(nextProps, nextContext) {
        clearInterval(this.state.intervalId);
        if (nextProps.callEvent !== null) {
            const { type, payload } = nextProps.callEvent;
            if (type !== CALL) {
                whoosh.stop();
            }
            const callStatusStr = type === ACCEPT ? 'CALL STARTED' : (type === REJECT ? 'DECLINED' : (type === CALL_END ? 'CALL ENDED' : 'CALLING'))
            this.setState({
                callStateStr: callStatusStr
            });
            if (type === ACCEPT) {
                //call STARTED
                this.timeCounter();
                this.setState({
                    showTimer: true
                })
            } else if (type !== ACCEPT && type !== PEER_CONNECTION_STATE_CHANGED) {
                this.callEndEvent();
            }
        }
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
        whoosh.setNumberOfLoops(-1);
        whoosh.setVolume(1);
        whoosh.play((success) => {
            if (success) {
                console.log('successfully finished playing');
            } else {
                console.log('playback failed due to audio decoding errors');
            }
        });
        const filter = {
            field: QB.users.USERS_FILTER.FIELD.LOGIN,
            operator: QB.users.USERS_FILTER.OPERATOR.IN,
            type: QB.users.USERS_FILTER.TYPE.STRING,
            value: this.state.opponentAppInfo.userId
        };
        QB.users
            .getUsers({ filter: filter })
            .then((result) => {
                // users found
                let allUsers = result.users;
                let otherUserData = allUsers.filter(user => user.login === JSON.stringify(this.state.opponentAppInfo.userId));
                if (otherUserData.length) {
                    const params = {
                        opponentsIds: [otherUserData[0].id],
                        type: QB.webrtc.RTC_SESSION_TYPE.VIDEO,
                        userInfo: {
                            'callerName': this.props.userData.name,
                            'receiverName': this.state.opponentAppInfo.name,
                        }
                    }
                    QB.webrtc
                        .call(params)
                        .then((session) => {
                            /* session created */
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

    callEndEvent = async () => {
        this.setState({
            callStateStr: 'CALL ENDED'
        });
        const userInfo = {
            // custom data can be passed using this object
            // only [string]: string type supported
        }
        await QB.webrtc.hangUp({ sessionId: this.state.videoSession.id, userInfo }).catch((e) => {
            /* handle error */
            alert(JSON.stringify(e.message))
        });
        this.props.navigation.pop();
    }

    render() {
        const { state } = this;
        return (
            <ImageBackground source={bg} style={styles.container}>
                {!state.showTimer && (
                    <View style={{ justifyContent: 'center', alignItems: 'center', }}>
                        <Image source={state.opponentAppInfo.imgUrl ? { uri: state.opponentAppInfo.imgUrl } : hiddenMan} style={styles.avatarOtherUser} />
                        <Text style={styles.userName}>{state.opponentAppInfo.name}</Text>
                        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', width: DEVICE_WIDTH * 0.6, marginTop: DEVICE_HEIGHT * 0.1 }}>
                            <TouchableOpacity style={{ width: 60 }} onPress={this.callEndEvent}>
                                <Image source={call_end_reject} style={styles.call_end_rejct_button} />
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
                {state.showTimer && state.videoSession.opponentsIds && (
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
                            userId={state.videoSession.opponentsIds[0]} // your user's Id for local video or occupantId for remote
                        />
                    </View>
                )}
                {state.showTimer && (
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
            </ImageBackground>
        )
    }
}
const DEVICE_WIDTH = Dimensions.get('window').width;
const DEVICE_HEIGHT = Dimensions.get('window').height;
const styles = StyleSheet.create({
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
        width: DEVICE_WIDTH * 0.25,
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
    const { quickBloxInfo, callEvent, userData } = state.reducer
    return { quickBloxInfo, callEvent, userData }
};
export default connect(mapStateToProps)(VideoCall);
