import React from 'react';
import { View, DeviceEventEmitter, NativeEventEmitter, Platform } from 'react-native';
import QB from 'quickblox-react-native-sdk';
const emitter = Platform.select({
    android: DeviceEventEmitter,
    ios: new NativeEventEmitter(QB.webrtc)
});

Object.keys(QB.webrtc.EVENT_TYPE).forEach(key => {
    emitter.addListener(QB.webrtc.EVENT_TYPE[key], this.eventHandler)
});
export default class CommonComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {

        }
    }

    eventHandler = (event) => {
        const { type, payload } = event;
        if (type === '@QB/CALL') {
            alert(JSON.stringify(event));
            //incoming call
            const userInfo = {
                // custom data can be passed using this object
                // only [string]: string type supported
            }
            this.props.navigation.push('VideoCallIncome');
            // QB.webrtc
            //   .accept({ sessionId: payload.session.id, userInfo })
            //   .then((session) => {
            //     /* handle session */
            //     alert(JSON.stringify(session))
            //   }).catch((e) => {
            //     /* handle error */
            //     alert(JSON.stringify(e.message))
            //   })
        }
    }

    render() {
        return (
            <View></View>
        )
    }
}