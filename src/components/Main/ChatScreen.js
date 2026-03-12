import React from 'react';
import {
    Icon
} from "native-base";
import {
    View,
    TextInput,
    Text,
    StyleSheet,
    TouchableHighlight,
    Keyboard,
    FlatList,
    ScrollView,
    Image,
    BackHandler,
    TouchableOpacity,
    Alert,
    Dimensions,
    Platform,
    Modal,
} from 'react-native';

import QB from '../stubs/quickblox-stub';
import Menu, { MenuItem, MenuDivider } from 'react-native-material-menu';
import Dialog, { DialogFooter, DialogButton, DialogContent, SlideAnimation } from 'react-native-popup-dialog';
import firebase from 'firebase';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { changeReadFlag, updateQuickBlox } from '../../../Action';
import Global from '../Global';

import hiddenMan from '../../assets/images/hidden_man.png';
import call_ring from '../../assets/images/call_ring_accept.png';
import call_video from '../../assets/images/call_video.png';
import diamond from '../../assets/images/red_diamond_trans.png';
import shooting_star from '../../assets/images/shooting_star.png';
import yellow_star from '../../assets/images/yellow_star.png';
import ban_black from '../../assets/images/ban_black.png';
import notification_black from '../../assets/images/notification_black.png';

import { SERVER_URL } from '../../config/constants';


const DEVICE_WIDTH = Dimensions.get('window').width;
// const DEVICE_HEIGHT = Dimensions.get('window').height;

class ChatScreen extends React.Component {
    static navigationOptions = {
        header: null
    };
    constructor(props) {
        super(props);
        this.state = {
            other: {
                userId: props.navigation.state.params.data.data.other_user_id,
                name: props.navigation.state.params.data.data.name,
                imgUrl: props.navigation.state.params.data.imageUrl,
                description: props.navigation.state.params.data.data.description,
                coin_count: props.navigation.state.params.data.data.coin_count,
                fan_count: props.navigation.state.params.data.data.fan_count,
            },
            oppoentData: null,
            matchId: props.navigation.state.params.data.data.match_id,
            textMessage: '',
            messageList: [],
            coinCount: Global.saveData.coin_count,
            visible: false,
            fanUserVisible: false,
            noFanUserVisible: false,
            errorMsg: false,
            msgError: '',
            sendDiamondsCount: 0,
            fanMessage: '',
            is_fan: false,
            dialogStyle: {},
            statusByMatchId: 0,
            msgCoinPerMessage: 0,
        }
    }

    _menu = null;

    componentWillMount() {
        Global.saveData.nowPage = 'ChatDetail';
        firebase.database().ref().child('dz-chat-data').child(Global.saveData.u_id).child(this.state.other.userId)
            .on('child_added', (value) => {
                this.setState((prevState) => {
                    return {
                        messageList: [...prevState.messageList, value.val()]
                    }
                });
                if (this.scrollView) {
                    this.scrollView.scrollToEnd({ animated: true });
                }
            });
        this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this.keyboardDidShow.bind(this));
        this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this.keyboardDidHide.bind(this));
        this.backHanlder = BackHandler.addEventListener('hardwareBackPress', this.backPressed);
        // this.getMessageData();
        this.getStatusByMatchId();
    }

    getStatusByMatchId = () => {
        var details = {
            'matchId': this.state.matchId,
        };
        var formBody = [];
        for (var property in details) {
            var encodedKey = encodeURIComponent(property);
            var encodedValue = encodeURIComponent(details[property]);
            formBody.push(encodedKey + "=" + encodedValue);
        }
        formBody = formBody.join("&");
        fetch(`${SERVER_URL}/api/match/getStatusByMatchId`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': Global.saveData.token
            },
            body: formBody,
        }).then((response) => response.json())
            .then((responseJson) => {
                if (!responseJson.error) {
                    this.setState({
                        statusByMatchId: responseJson.data.status,
                        msgCoinPerMessage: responseJson.data.coin_per_message,
                    })
                }
            })
            .catch((error) => {
                return
            });
    }

    componentDidMount() {
        this._mounted = true;
        if (this._mounted && this.scrollView) {
            this.scrollView.scrollToEnd({ animated: true });
        }

        fetch(`${SERVER_URL}/api/transaction/getDiamondCount`, {
            method: 'POST',
            headers: {
                'Content-type': 'application/x-www-form-urlencoded',
                'Authorization': Global.saveData.token
            }
        }).then((response) => response.json())
            .then((responseJson) => {
                if (!responseJson.error) {
                    Global.saveData.coin_count = responseJson.data.coin_count;
                    this.setState({
                        coinCount: Global.saveData.coin_count,
                    });
                }
            })
            .catch((error) => {
                return
            });

        this.checkUnReadMessage();
        this.checkFanUser();

        Keyboard.addListener('keyboardDidShow', this._keyboardDidShow)
        Keyboard.addListener('keyboardDidHide', this._keyboardDidHide)
    }

    _keyboardDidShow = () => {
        this.setState({
            dialogStyle: {
                top: -1 * (DEVICE_WIDTH / 4),
                borderRadius: 20,
                padding: 10,
                overflow: 'hidden',
            },
        })
    }

    _keyboardDidHide = () => {
        this.setState({
            dialogStyle: {
                borderRadius: 20,
                padding: 10,
                overflow: 'hidden',
            },
        })
    }

    checkUnReadMessage = () => {
        firebase.database().ref().child('dz-chat-unread').child(Global.saveData.u_id + '/')
            .once('value', (value) => {
                let senderIdArr = value.toJSON();
                let newPayload = {};
                let updates = {};
                if (senderIdArr) {
                    senderIdArr = senderIdArr.split(',');
                    let index = senderIdArr.indexOf(this.state.other.userId.toString());
                    if (index !== -1) {
                        senderIdArr.splice(index, 1)
                    }
                    newPayload = {
                        unreadFlag: true,
                        senders: senderIdArr
                    }
                    if (senderIdArr.length) {
                        newPayload.unreadFlag = true;
                        updates[Global.saveData.u_id] = senderIdArr.toString();
                        firebase.database().ref().child('dz-chat-unread').update(updates);
                    } else {
                        newPayload.unreadFlag = false;
                        firebase.database().ref().child('dz-chat-unread').child(Global.saveData.u_id + '/').remove();
                    }

                    this.props.changeReadFlag(newPayload);
                }
            });
    }

    componentWillUnmount() {
        this._mounted = false;
        // firebase.database().ref().child(Global.saveData.u_id).child(this.state.other.userId).remove();
        // firebase.database().ref().child(this.state.other.userId).child(Global.saveData.u_id).remove();
        this.keyboardDidShowListener.remove();
        this.keyboardDidHideListener.remove();
        this.backHanlder.remove();
    }

    backPressed = () => {
        if (Global.saveData.prevpage == "Chat" || Global.saveData.prevpage == "ChatDetail" || Global.saveData.prevpage == "IncomeDetail") {
            this.props.navigation.replace("Chat");
        } else if (Global.saveData.prevpage == "BrowseList") {
            this.props.navigation.replace("BrowseList");
        } else if (Global.saveData.prevpage == "Browse") {
            this.props.navigation.replace("BrowseList");
        } else {
            this.props.navigation.pop();
        }
        return true;
    }

    keyboardDidShow(e) {
        if (this._mounted && this.scrollView) {
            this.scrollView.scrollToEnd({ animated: true });
        }
    }

    keyboardDidHide(e) {
        if (this._mounted && this.scrollView) {
            this.scrollView.scrollToEnd({ animated: true });
        }
    }

    setMenuRef = ref => {
        this._menu = ref;
    };

    hideMenu = () => {
        this._menu.hide();
    };

    showMenu = () => {
        this.checkFanUser();
        this._menu.show();
    };

    handleChange = key => val => {
        this.setState({
            [key]: val
        });
    }

    setBlock = () => {
        this.hideMenu();
        Alert.alert(
            'Are you sure you want to block this user?',
            'Your chat history with this user will disappear from your chat list.',
            [
                { text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
                { text: 'Confirm', onPress: () => this.requestBlock() },
            ],
            { cancelable: false }
        );
    }

    requestBlock = () => {
        var details = {
            'otherId': this.state.other.userId
        };
        var formBody = [];
        for (var property in details) {
            var encodedKey = encodeURIComponent(property);
            var encodedValue = encodeURIComponent(details[property]);
            formBody.push(encodedKey + "=" + encodedValue);
        }
        formBody = formBody.join("&");

        fetch(`${SERVER_URL}/api/match/block`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': Global.saveData.token
            },
            body: formBody,
        }).then((response) => response.json())
            .then((responseJson) => {
                if (responseJson.error === false) {
                    firebase.database().ref().child('dz-chat-data').child(Global.saveData.u_id).child(this.state.other.userId).remove();
                    firebase.database().ref().child('dz-chat-data').child(this.state.other.userId).child(Global.saveData.u_id).remove();
                    this.props.navigation.replace("Chat");
                }
            }).catch((error) => {
                return
            });
    }

    setReport = () => {
        this.hideMenu();
        this.props.navigation.navigate("Report", { otherId: this.state.other.userId });
    }

    getMessageData = async () => {
        const { matchId } = this.state;
        await fetch(`${SERVER_URL}/api/chat/getChatWithMatchId/${matchId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': Global.saveData.token
            }
        }).then((response) => response.json())
            .then((responseJson) => {
                if (!responseJson.error) {
                    const msgData = responseJson.data.content;
                    var convertedList = [];
                    if (msgData.length) {
                        msgData.map((item) => {
                            var convertedData = {
                                from: parseInt(item.message_type) === 1 ? Global.saveData.u_id : this.state.other.userId,
                                message: item.message_text,
                                time: item.created_date
                            };
                            convertedList.push(convertedData);
                        });
                        this.setState({
                            messageList: convertedList
                        });
                    }
                }
            }).catch((error) => {
                return
            });
    }

    formatAMPM(time) {
        var date = new Date(time);
        var hours = date.getHours();
        var minutes = date.getMinutes();
        var ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        minutes = minutes < 10 ? '0' + minutes : minutes;
        var strTime = hours + ':' + minutes + ' ' + ampm;
        return strTime;
    }

    setChatDate(item) {
        var date = new Date(item.time);
        var now = new Date();
        var nowYear = now.getFullYear();
        var nowMonth = now.getMonth() + 1;
        var nowDate = now.getDate();
        var dateYear = date.getFullYear();
        var dateMonth = date.getMonth() + 1;
        var dateDate = date.getDate();
        if (nowYear === dateYear && nowMonth === dateMonth) {
            if (nowDate === dateDate) {
                return 'Today';
            } else if (nowDate === dateDate + 1) {
                return 'Yesterday';
            }
        }
        return date.toDateString();
    }

    sendMessage = async () => {
        if (this.state.textMessage.length > 0) {
            this.createNewMessage();
        }
    }

    createNewMessage = () => {
        const { textMessage, matchId } = this.state;

        this.setState({ textMessage: '' });

        var details = {
            'matchId': matchId,
            'messageText': textMessage
        };
        var formBody = [];
        for (var property in details) {
            var encodedKey = encodeURIComponent(property);
            var encodedValue = encodeURIComponent(details[property]);
            formBody.push(encodedKey + "=" + encodedValue);
        }
        formBody = formBody.join("&");
        fetch(`${SERVER_URL}/api/chat/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': Global.saveData.token
            },
            body: formBody,
        }).then((response) => response.json())
            .then((responseJson) => {
                if (responseJson.data.account_status == 1) {

                    if (responseJson.data.sending_available) {

                        let msgId = firebase.database().ref().child("dz-chat-data").child(Global.saveData.u_id).child(this.state.other.userId).push().key;
                        let updates = {};
                        let senderMessage = {
                            message: textMessage,
                            time: firebase.database.ServerValue.TIMESTAMP,
                            from: Global.saveData.u_id,
                            read: true
                        };
                        updates[Global.saveData.u_id + '/' + this.state.other.userId + '/' + msgId] = senderMessage;
                        let receiverMessage = {
                            message: textMessage,
                            time: firebase.database.ServerValue.TIMESTAMP,
                            from: Global.saveData.u_id,
                            read: false
                        };
                        updates[this.state.other.userId + '/' + Global.saveData.u_id + '/' + msgId] = receiverMessage;
                        firebase.database().ref().child('dz-chat-data').update(updates);

                        if (this.scrollView) {
                            this.scrollView.scrollToEnd({ animated: true });
                        }
                    } else {
                        if (!responseJson.data.diamonds_enough) {
                            Alert.alert(
                                '',
                                responseJson.message,
                                [
                                    { text: 'Cancel', onPress: () => console.log('Cancel Pressed') },
                                    { text: 'Buy Diamonds', onPress: () => this.gotoShop() },
                                ],
                                { cancelable: false },
                            );
                        } else {
                            Alert.alert(
                                '',
                                'You cannot send a message to this uer.',
                                [
                                    { text: 'OK', onPress: () => this.props.navigation.replace("Chat") },
                                ],
                                { cancelable: false },
                            );
                        }
                    }
                } else {
                    Alert.alert(
                        '',
                        responseJson.message,
                        [],
                        { cancelable: false },
                    );
                }
            })
            .catch((error) => {
                // alert(JSON.stringify(error))
                return
            });
    }

    gotoProfilePage = () => {
        Global.saveData.prevpage = "ChatDetail";

        fetch(`${SERVER_URL}/api/match/getOtherUserData/${this.state.other.userId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': Global.saveData.token
            }
        }).then((response) => response.json())
            .then((responseJson) => {
                if (!responseJson.error) {
                    let newData = responseJson.data;

                    this.props.navigation.navigate("Profile", {
                        data: {
                            id: newData.id,
                            name: newData.name,
                            description: newData.description,
                            age: newData.age,
                            gender: newData.gender,
                            distance: newData.distance,
                            country_name: newData.country_name,
                            ethnicity_name: newData.ethnicity_name,
                            language_name: newData.language_name,
                            last_loggedin_date: newData.last_loggedin_date,
                            matchId: this.state.matchId,
                            imageUrl: this.state.other.imgUrl,
                            coin_count: newData.coin_count,
                            fan_count: newData.fan_count,
                            coin_per_message: newData.coin_per_message,
                        }
                    });
                }
            }).catch((error) => {
                //   alert(JSON.stringify(error));
                return
            });
    }
    gotoShop = () => {
        this.setState({
            visible: false
        })
        this.props.navigation.navigate('screenGpay01');
    }

    checkFanUser = () => {
        var details = {
            'otherId': this.state.other.userId
        };
        var formBody = [];
        for (var property in details) {
            var encodedKey = encodeURIComponent(property);
            var encodedValue = encodeURIComponent(details[property]);
            formBody.push(encodedKey + "=" + encodedValue);
        }
        formBody = formBody.join("&");
        fetch(`${SERVER_URL}/api/fan/checkFanOtherUser`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': Global.saveData.token
            },
            body: formBody,
        }).then((response) => response.json())
            .then((responseJson) => {
                if (!responseJson.error) {
                    if (responseJson.is_fan) {
                        this.setState({
                            is_fan: true,
                        })
                    }
                }
            }).catch((error) => {
                return
            });
    }

    showSendDiamondsModal = () => {
        this.hideMenu();
        var details = {
            'otherId': this.state.other.userId
        };
        var formBody = [];
        for (var property in details) {
            var encodedKey = encodeURIComponent(property);
            var encodedValue = encodeURIComponent(details[property]);
            formBody.push(encodedKey + "=" + encodedValue);
        }
        formBody = formBody.join("&");
        fetch(`${SERVER_URL}/api/fan/checkFanOtherUser`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': Global.saveData.token
            },
            body: formBody,
        }).then((response) => response.json())
            .then((responseJson) => {
                if (!responseJson.error) {
                    if (responseJson.is_fan) {
                        this.setState({
                            fanUserVisible: true,
                            noFanUserVisible: false,
                        })
                    } else {
                        this.setState({
                            fanUserVisible: false,
                            noFanUserVisible: true,
                        })
                    }
                }
            }).catch((error) => {
                return
            });
    }

    sendDiamonds = () => {
        let { sendDiamondsCount, fanMessage } = this.state;
        if (isNaN(sendDiamondsCount)) {
            Alert.alert(
                'Invalid input',
                'You must input a valid number of diamonds to send.',
                [
                    { text: 'Ok', onPress: () => console.log('Ok Pressed'), style: 'cancel' },
                ],
                { cancelable: false }
            );
        }
        else {
            if (sendDiamondsCount > Global.saveData.coin_count) {
                Alert.alert(
                    'Insufficient diamonds',
                    'You only have ' + Global.saveData.coin_count + ' diamonds available. More diamonds are needed.',
                    [
                        { text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
                        { text: 'Buy Diamonds', onPress: () => this.gotoShop(), style: 'cancel' },
                    ],
                    { cancelable: false }
                );
            } else if (sendDiamondsCount == 0 || sendDiamondsCount == '') {
                Alert.alert(
                    'Invalid count',
                    'You must send 1 or more diamonds.',
                    [
                        { text: 'Ok', onPress: () => console.log('Ok Pressed'), style: 'cancel' },
                    ],
                    { cancelable: false }
                );
            } else {
                var details = {
                    'userName': Global.saveData.u_name,
                    'otherId': this.state.other.userId,
                    'otherUserName': this.state.other.name,
                    'amount': sendDiamondsCount,
                    'fanMessage': fanMessage,
                };
                var formBody = [];
                for (var property in details) {
                    var encodedKey = encodeURIComponent(property);
                    var encodedValue = encodeURIComponent(details[property]);
                    formBody.push(encodedKey + "=" + encodedValue);
                }
                formBody = formBody.join("&");
                fetch(`${SERVER_URL}/api/fan/sendDiamonds`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Authorization': Global.saveData.token
                    },
                    body: formBody,
                }).then((response) => response.json())
                    .then((responseJson) => {
                        if (!responseJson.error) {
                            if (responseJson.data.account_status == 1) {
                                if (responseJson.data.sending_available) {
                                    Global.saveData.coin_count = responseJson.data.coin_count;
                                    this.setState({
                                        other: {
                                            userId: this.state.other.userId,
                                            name: this.state.other.name,
                                            imgUrl: this.state.other.imgUrl,
                                            description: this.state.other.description,
                                            coin_count: parseInt(this.state.other.coin_count) + parseInt(sendDiamondsCount),
                                            fan_count: responseJson.data.other_fan_count,
                                        }
                                    })
                                } else {
                                    Alert.alert(
                                        '',
                                        'You cannot send diamonds.',
                                        [
                                            { text: 'OK', onPress: () => this.props.navigation.replace("BrowseList") },
                                        ],
                                        { cancelable: false },
                                    );
                                }
                            } else {
                                Alert.alert(
                                    '',
                                    responseJson.message,
                                    [],
                                    { cancelable: false },
                                );
                            }
                        }
                    })
                    .catch((error) => {
                        this.setState({
                            isLoading: false,
                            disabled: false
                        });
                        return
                    });
            }
        }
    }

    checkCount = value => {
        if (isNaN(value)) {
            this.setState({
                msgErrorNumber: true,
                sendDiamondsCount: value,
                msgError: 'This field should be number.',
            })
        }
        else {
            if (value > Global.saveData.coin_count) {
                this.setState({
                    msgErrorNumber: true,
                    sendDiamondsCount: value,
                    msgError: 'You only have ' + Global.saveData.coin_count + ' diamonds available.',
                })
            } else {
                this.setState({
                    msgErrorNumber: false,
                    sendDiamondsCount: value,
                })
            }
        }
    }

    ringCall = () => {
        var details = {
            'userName': Global.saveData.u_name,
            'otherId': this.state.other.userId,
            'otherUserName': this.state.other.name,
            'callType': 1
        };
        var formBody = [];
        for (var property in details) {
            var encodedKey = encodeURIComponent(property);
            var encodedValue = encodeURIComponent(details[property]);
            formBody.push(encodedKey + "=" + encodedValue);
        }
        formBody = formBody.join("&");

        fetch(`${SERVER_URL}/api/call/initiate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': Global.saveData.token
            },
            body: formBody,
        }).then((response) => response.json())
            .then((responseJson) => {
                if (responseJson.error === false) {
                    if (responseJson.data) {
                        if (responseJson.data.call_available) {
                            this.props.navigation.push('VoiceCall', {
                                data: {
                                    opponentAppInfo: this.state.other,
                                },
                            });
                        } else {
                            Alert.alert(
                                responseJson.message,
                                'You have to receive one message at least to call ' + this.state.other.name,
                                [
                                    { text: 'Ok', onPress: () => console.log('Ok pressed.') },
                                ],
                                { cancelable: false }
                            );
                        }
                    }
                }
            }).catch((error) => {
                return
            });
    }

    ringVideo = () => {
        var details = {
            'userName': Global.saveData.u_name,
            'otherId': this.state.other.userId,
            'otherUserName': this.state.other.name,
            'callType': 2
        };
        var formBody = [];
        for (var property in details) {
            var encodedKey = encodeURIComponent(property);
            var encodedValue = encodeURIComponent(details[property]);
            formBody.push(encodedKey + "=" + encodedValue);
        }
        formBody = formBody.join("&");

        fetch(`${SERVER_URL}/api/call/initiate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': Global.saveData.token
            },
            body: formBody,
        }).then((response) => response.json())
            .then((responseJson) => {
                if (responseJson.error === false) {
                    if (responseJson.data) {
                        if (responseJson.data.call_available) {
                            this.props.navigation.push('VideoCall', {
                                data: {
                                    opponentAppInfo: this.state.other,
                                },
                            });
                        } else {
                            Alert.alert(
                                responseJson.message,
                                'You have to receive one message at least to video call ' + this.state.other.name,
                                [
                                    { text: 'Ok', onPress: () => console.log('Ok pressed.') },
                                ],
                                { cancelable: false }
                            );
                        }
                    }
                }
            }).catch((error) => {
                return
            });
    }

    renderRow = ({ item }) => {
        return (
            <View style={{
                flexDirection: 'column',
                justifyContent: 'space-between'
            }}>
                {/* <View style={{alignSelf: 'center', paddingLeft: 10, paddingRight: 10}}>
                    <Text style={{color: '#000', fontSize: 14}}>{this.setChatDate(item)}</Text>
                </View> */}
                <View style={{
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    alignSelf: item.from === Global.saveData.u_id ? 'flex-end' : 'flex-start',
                    margin: 10,
                    marginLeft: 15,
                    maxWidth: '70%'
                }}>
                    <Text style={{
                        padding: 3,
                        fontSize: 12,
                        color: '#000',
                        alignSelf: 'flex-end',
                    }}>
                        {this.formatAMPM(item.time)}
                    </Text>
                    <View style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        backgroundColor: item.from === Global.saveData.u_id ? '#FFF' : '#B64F54',
                        borderRadius: 20,
                        padding: 8,
                        paddingLeft: item.from === Global.saveData.u_id ? 10 : 35,
                        shadowColor: "#efefef",
                        shadowOpacity: 0.8,
                        shadowRadius: 2,
                        shadowOffset: {
                            height: 1,
                            width: 1
                        }
                    }} elevation={5}>
                        {item.from === this.state.other.userId && (
                            <TouchableHighlight style={styles.avatarBtn} onPress={() => this.gotoProfilePage()}>
                                <Image
                                    style={styles.avatar}
                                    source={this.state.other.imgUrl ? { uri: this.state.other.imgUrl } : hiddenMan}
                                />
                            </TouchableHighlight>
                        )}
                        <View>
                            <Text style={{ padding: 7, fontSize: 15, color: item.from === Global.saveData.u_id ? '#000' : '#FFF', }}>
                                {item.message}
                            </Text>
                        </View>
                    </View>
                </View>
            </View>
        )
    }

    render() {
        return (
            <View style={styles.outer}>
                <Dialog
                    visible={this.state.fanUserVisible}
                    dialogAnimation={new SlideAnimation({
                        slideFrom: 'top',
                    })}
                >
                    <View style={styles.screenOverlay}>
                        <View style={styles.dialogPrompt}>
                            <Text style={[styles.bodyFont,]}>
                                {`You have ${Global.saveData.coin_count} diamonds`}
                            </Text>
                            <View style={{ flexDirection: 'row', }}>
                                <Text style={[styles.bodyFont,]}>
                                    {`Send `}
                                </Text>
                                <View style={styles.SectionStyle}>
                                    <Image source={diamond} style={{ width: 25, height: 25, }} />
                                    <TextInput
                                        placeholder={``}
                                        style={styles.textInput}
                                        onChangeText={(value) => this.checkCount(value)}
                                    />
                                </View>
                                <Text style={[styles.bodyFont,]}>
                                    {` Diamonds`}
                                </Text>
                            </View>
                            {this.state.errorMsg && <Text style={styles.requiredSent}>* {this.state.msgError} </Text>}
                            <Text style={{ fontSize: 16, }}>
                                {`Write a fan message to ${this.state.other.name} (public and optional)`}
                            </Text>
                            <TextInput
                                multiline={true}
                                numberOfLines={5}
                                style={styles.textMessageInput}
                                editable
                                onChangeText={(text) => this.setState({
                                    fanMessage: text,
                                })}
                            />
                            <View style={styles.buttonsOuterView}>
                                <View style={styles.buttonsInnerView}>
                                    <TouchableOpacity
                                        style={[
                                            styles.button,
                                        ]}
                                        onPress={() =>
                                            this.setState({
                                                fanUserVisible: !this.state.fanUserVisible
                                            }, function () {
                                                this.hideMenu();
                                            })
                                        }>
                                        <Text
                                            style={[
                                                styles.cancelButtonText,
                                            ]}>
                                            {'Cancel'}
                                        </Text>
                                    </TouchableOpacity>
                                    <View style={styles.buttonsDivider} />
                                    <TouchableOpacity
                                        style={[
                                            styles.button,
                                        ]}
                                        onPress={() =>
                                            this.setState({
                                                fanUserVisible: !this.state.fanUserVisible
                                            }, function () {
                                                this.hideMenu();
                                                this.sendDiamonds();
                                            })
                                        }>
                                        <Text
                                            style={[
                                                styles.submitButtonText,
                                            ]}>
                                            {'Send'}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </View>
                </Dialog>

                <Dialog
                    visible={this.state.noFanUserVisible}
                    dialogStyle={this.state.dialogStyle}
                    dialogAnimation={new SlideAnimation({
                        slideFrom: 'top',
                    })}
                >
                    <View style={styles.screenOverlay}>
                        <View style={styles.dialogPrompt}>
                            <Text style={[styles.title,]}>
                                {`Become a fan of ${this.state.other.name} by sending diamonds!`}
                            </Text>
                            <View style={{ alignItems: 'center', justifyContent: 'center', }}>
                                <Image source={shooting_star} style={{ width: 130, height: 130, marginTop: 20, }} />
                            </View>
                            <Text style={[styles.bodyFont,]}>
                                {`You have ${Global.saveData.coin_count} diamonds`}
                            </Text>
                            <View style={{ flexDirection: 'row', }}>
                                <Text style={[styles.bodyFont,]}>
                                    {`Send `}
                                </Text>
                                <View style={styles.SectionStyle}>
                                    <Image source={diamond} style={{ width: 25, height: 25, }} />
                                    <TextInput
                                        placeholder={``}
                                        style={styles.textInput}
                                        onChangeText={(value) => this.checkCount(value)}
                                    />
                                </View>
                                <Text style={[styles.bodyFont,]}>
                                    {` Diamonds`}
                                </Text>
                            </View>
                            {this.state.errorMsg && <Text style={styles.requiredSent}>* {this.state.msgError} </Text>}
                            <Text style={{ fontSize: 16, }}>
                                {`Write a fan message to ${this.state.other.name} (public and optional)`}
                            </Text>
                            <TextInput
                                multiline={true}
                                numberOfLines={5}
                                style={styles.textMessageInput}
                                editable
                                onChangeText={(text) => this.setState({
                                    fanMessage: text,
                                })}
                            />
                            <View style={styles.buttonsOuterView}>
                                <View style={styles.buttonsInnerView}>
                                    <TouchableOpacity
                                        style={[
                                            styles.button,
                                        ]}
                                        onPress={() =>
                                            this.setState({
                                                noFanUserVisible: !this.state.noFanUserVisible
                                            }, function () {
                                                this.hideMenu();
                                            })
                                        }>
                                        <Text
                                            style={[
                                                styles.cancelButtonText,
                                            ]}>
                                            {'Cancel'}
                                        </Text>
                                    </TouchableOpacity>
                                    <View style={styles.buttonsDivider} />
                                    <TouchableOpacity
                                        style={[
                                            styles.button,
                                        ]}
                                        onPress={() =>
                                            this.setState({
                                                noFanUserVisible: !this.state.noFanUserVisible
                                            }, function () {
                                                this.hideMenu();
                                                this.sendDiamonds();
                                            })
                                        }>
                                        <Text
                                            style={[
                                                styles.submitButtonText,
                                            ]}>
                                            {'Send'}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </View>
                </Dialog>

                <View style={{ width: DEVICE_WIDTH, height: 60, flexDirection: 'row', justifyContent: 'space-between', marginTop: Platform.select({ 'android': 10, 'ios': 40, }), alignItems: 'center' }}>
                    <TouchableOpacity style={{ alignItems: 'center', justifyContent: 'center', width: 40, height: 60, zIndex: 1000, marginLeft: 10 }}
                        onPress={this.backPressed}>
                        <Icon type="Ionicons" name="ios-arrow-back" />
                    </TouchableOpacity>
                    <View style={{ alignItems: 'flex-start', justifyContent: 'flex-start', width: DEVICE_WIDTH - 100, flexDirection: 'row' }}>
                        <TouchableOpacity style={styles.avatarOtherUserBtn} onPress={() => this.gotoProfilePage()}>
                            <View style={{ flexDirection: 'row', flex: 1, flexDirection: 'row', flexWrap: 'wrap', }}>
                                <Image
                                    style={styles.avatarOtherUser}
                                    source={this.state.other.imgUrl ? { uri: this.state.other.imgUrl } : hiddenMan}
                                />
                                <Text style={{ textAlign: 'center', fontWeight: 'bold', fontSize: 16, marginLeft: 5, marginTop: 10 }}>{((this.state.other.name).length > 6) ? (((this.state.other.name).substring(0, 6))) : this.state.other.name}</Text>
                                <Image source={diamond} style={{ width: 20, height: 20, marginLeft: 15, marginTop: 12 }} />
                                <Text style={{ marginLeft: 1, fontSize: 14, fontWeight: 'bold', marginTop: 12 }}>{this.state.other.coin_count}</Text>
                                {/* <Image source={yellow_star} style={{ width: 20, height: 20, marginLeft: 15, marginTop: 12 }} /> */}
                                {/* <Text style={{ marginLeft: 1, fontSize: 14, fontWeight: 'bold', marginTop: 12 }}>{this.state.other.fan_count}</Text> */}
                            </View>
                        </TouchableOpacity>
                        <View style={{ flexDirection: 'row' }}>
                            <TouchableOpacity style={styles.ringIconTouch} onPress={() => this.ringCall()}>
                                <Image
                                    style={styles.ringIcon}
                                    source={call_ring}
                                />
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.ringIconTouch, { marginLeft: 20 }]} onPress={() => this.ringVideo()}>
                                <Image
                                    style={styles.ringIcon}
                                    source={call_video}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={styles.menuIcon}>
                        <Menu
                            ref={this.setMenuRef}
                            button={<TouchableOpacity style={{ width: 40, marginLeft: 10, }} onPress={this.showMenu}>
                                <Icon type="MaterialCommunityIcons" name="dots-horizontal" />
                            </TouchableOpacity>}>
                            <MenuItem onPress={this.setBlock}>
                                <Image source={ban_black} style={{ width: 20, height: 20, marginRight: 30, }} />
                                {'   Leave Chat Room'}
                            </MenuItem>
                            <MenuDivider />
                            <MenuItem onPress={this.setReport}>
                                <Image source={notification_black} style={{ width: 20, height: 20, marginRight: 30, }} />
                                {'   Report & Leave Chat Room'}
                            </MenuItem>
                            <MenuDivider />
                            <MenuItem onPress={this.showSendDiamondsModal}>
                                <Image source={yellow_star} style={{ width: 20, height: 20, marginRight: 30, }} />
                                {this.state.is_fan ? '   Send Diamonds' : '   Become A Fan'}
                            </MenuItem>
                        </Menu>
                    </View>
                </View>
                <View style={{ width: DEVICE_WIDTH, height: 60, flexDirection: 'row', justifyContent: 'center', marginTop: 20, alignItems: 'center' }}>
                    {(this.state.statusByMatchId == 6) && (
                        <View style={{ justifyContent: 'center', borderColor: '#d9d9d9', borderWidth: 0.5, padding: 20, }}>
                            <Text>
                                {`Everytime you receive a message from ${this.state.other.name}, `}
                            </Text>
                            <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                                <Text>
                                    {`you will receive `}
                                </Text>
                                <Image source={diamond} style={{ width: 15, height: 15, marginTop: 3, marginRight: 2 }}></Image>
                                <Text>
                                    {`${this.state.msgCoinPerMessage} from ${this.state.other.name}`}
                                </Text>
                            </View>
                        </View>
                    )}
                    {(this.state.statusByMatchId == 7) && (
                        <View style={{ justifyContent: 'center', borderColor: '#d9d9d9', borderWidth: 0.5, padding: 20, }}>
                            <Text>
                                {`Everytime you send a message to ${this.state.other.name}, `}
                            </Text>
                            <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                                <Text>
                                    {`you will send `}
                                </Text>
                                <Image source={diamond} style={{ width: 15, height: 15, marginTop: 3, marginRight: 2 }}></Image>
                                <Text>
                                    {`${this.state.msgCoinPerMessage} to ${this.state.other.name}`}
                                </Text>
                            </View>
                        </View>
                    )}
                </View>
                <ScrollView style={{ marginTop: 15 }} ref={(ref) => { this.scrollView = ref }}
                    onContentSizeChange={(contentWidth, contentHeight) => {
                        this.scrollView.scrollToEnd({ animated: true });
                    }}>
                    <FlatList
                        style={{ padding: 10 }}
                        data={this.state.messageList}
                        renderItem={this.renderRow}
                        keyExtractor={(item, index) => index.toString()}
                    />
                </ScrollView>
                <View style={styles.inputBar}>
                    <TextInput
                        multiline
                        style={styles.textBox}
                        value={this.state.textMessage}
                        onChangeText={this.handleChange('textMessage')}
                    />
                    <TouchableHighlight style={styles.sendButton} onPress={this.sendMessage}>
                        <Icon type="Ionicons" name="ios-send" style={{ color: 'white' }} />
                    </TouchableHighlight>
                </View>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    outer: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'space-between',
        backgroundColor: 'white'
    },
    menuIcon: {
        justifyContent: 'center',
        marginRight: 10,
        height: 45,
        width: 65,
    },
    input: {
        padding: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        width: '80%',
        marginBottom: 10,
        borderRadius: 20
    },
    inputBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        paddingVertical: 5,
    },
    sendButton: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingLeft: 15,
        paddingTop: 5,
        paddingBottom: 5,
        marginLeft: -35,
        paddingRight: 15,
        borderRadius: 400,
        height: 50,
        backgroundColor: '#B64F54'
    },
    textBox: {
        borderRadius: 25,
        borderWidth: 1,
        borderColor: '#8C807F',
        flex: 1,
        fontSize: 15,
        paddingHorizontal: 8,
        paddingRight: 30
    },
    chatbox: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    leftContainer: {
        flex: 5,
        flexDirection: 'row',
        justifyContent: 'flex-start'
    },
    rightContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    avatarBtn: {
        position: 'absolute',
        width: 45,
        height: 45,
        borderRadius: 22.5,
        left: -15,
        top: 1,
    },
    avatar: {
        width: 45,
        height: 45,
        borderRadius: 400
    },
    avatarOtherUser: {
        marginTop: 10,
        marginRight: 10,
        width: 30,
        height: 30,
        borderRadius: 15,
        flexWrap: 'wrap-reverse',
    },
    // avatarOtherUser: {
    //     marginTop: 10,
    //     width: 40,
    //     height: 40,
    //     borderRadius: 20,
    //     flexWrap: 'wrap-reverse',
    // },
    avatarOtherUserBtn: {
        maxWidth: DEVICE_WIDTH - 115,
        height: 45,
    },
    // avatarOtherUserBtn: {
    //     flexDirection: 'row',
    //     flex: 2,
    //     maxWidth: 100,
    //     height: 40,
    // },
    requiredSent: {
        textAlign: 'center',
        color: 'red',
        fontSize: 12,
        marginBottom: 5,
    },
    ringIcon: {
        width: 50,
        height: 50,
        marginLeft: 10,
        marginTop: 5,
    },
    ringIconTouch: {
        width: 50,
        height: 50,
        marginLeft: 10,
        marginTop: 5,
    },
    screenOverlay: {
        height: Dimensions.get("window").height,
        backgroundColor: "black",
        opacity: 0.9
    },
    dialogPrompt: {
        ...Platform.select({
            ios: {
                opacity: 0.9,
                backgroundColor: "rgb(222,222,222)",
                borderRadius: 15
            },
            android: {
                borderRadius: 5,
                backgroundColor: "white"
            }
        }),
        marginHorizontal: 20,
        marginTop: 150,
        padding: 10,
    },
    title: {
        fontWeight: "bold",
        fontSize: 16,
        color: "black"
    },
    bodyFont: {
        fontSize: 16,
        color: "black",
        marginTop: 20,
    },
    textMessageInput: {
        marginTop: 10,
        height: 80,
        width: DEVICE_WIDTH * 0.8,
        paddingHorizontal: 10,
        textAlignVertical: "top",
        borderWidth: 0.5,
        borderColor: '#000',
        ...Platform.select({
            ios: {
                borderRadius: 15,
                backgroundColor: "rgba(166, 170, 172, 0.9)"
            },
            android: {
                borderRadius: 10,
                backgroundColor: "white",
            }
        })
    },
    textInput: {
        height: 40,
        width: 60,
        paddingHorizontal: 10,
        textAlignVertical: "bottom",
        ...Platform.select({
            ios: {
                borderRadius: 15,
                backgroundColor: "rgba(166, 170, 172, 0.9)"
            },
            android: {}
        })
    },
    buttonsOuterView: {
        flexDirection: "row",
        ...Platform.select({
            ios: {},
            android: {
                justifyContent: "flex-end"
            }
        }),
        width: "100%"
    },
    buttonsDivider: {
        ...Platform.select({
            ios: {
                width: 1,
                backgroundColor: "rgba(0,0,0,0.5)"
            },
            android: {
                width: 20
            }
        })
    },
    buttonsInnerView: {
        flexDirection: "row",
        ...Platform.select({
            ios: {
                borderTopWidth: 0.5,
                flex: 1
            },
            android: {}
        })
    },
    button: {
        flexDirection: "column",
        justifyContent: "center",

        alignItems: "center",
        ...Platform.select({
            ios: { flex: 1 },
            android: {}
        }),
        marginTop: 5,
        padding: 10
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#61bfa9"
    },
    submitButtonText: {
        color: "#61bfa9",
        fontWeight: "600",
        fontSize: 16
    },
    SectionStyle: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderWidth: 0.5,
        borderColor: '#000',
        height: 40,
        borderRadius: 5,
        margin: 10,
    },
});

const mapStateToProps = (state) => {
    const { unreadFlag, senders, userData, fcmID } = state.reducer
    return { unreadFlag, senders, userData, fcmID }
};

const mapDispatchToProps = dispatch => (
    bindActionCreators({
        changeReadFlag,
        updateQuickBlox
    }, dispatch)
);

export default connect(mapStateToProps, mapDispatchToProps)(ChatScreen);