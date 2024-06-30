import React, {PureComponent} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableHighlight,
  Image,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import Global from '../Global';
import {em} from '../../commonUI/base';

const DEVICE_WIDTH = Dimensions.get('window').width;

class ChatMessage extends PureComponent {
  constructor(props) {
    super(props);
    this.isLastMessage = this.props.index === this.props.messageList.length - 1;
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

  render() {
    const {
      item,
      index,
      lastMessageRef,
      onLastMessageLayout,
      gotoProfilePage,
      hiddenMan,
      adjustedWidth,
      adjustedHeight,
      userId,
      imgUrl,
    } = this.props;

    return (
      <View
        key={index}
        ref={this.isLastMessage ? lastMessageRef : null}
        onLayout={this.isLastMessage ? onLastMessageLayout : null}
        style={{
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}>
        <View
          style={{
            flexDirection: 'column',
            justifyContent: 'space-between',
            alignSelf:
              item.from === Global.saveData.u_id ? 'flex-end' : 'flex-start',
            margin: 10,
            marginLeft: 15,
            maxWidth: '70%',
          }}>
          <Text
            style={{
              padding: 3,
              fontSize: 12,
              color: '#000',
              alignSelf: 'flex-end',
            }}>
            {this.formatAMPM(item.time)}
          </Text>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              backgroundColor:
                item.from === Global.saveData.u_id ? '#D5d5d5' : '#B64F54',
              borderRadius: 20,
              padding: 8,
              paddingLeft:
                item.from === Global.saveData.u_id
                  ? 10
                  : item?.user_image_url !== '' && item?.user_image_url != null
                  ? 10.5
                  : 30,
              shadowColor: '#efefef',
              shadowOpacity: 0.8,
              shadowRadius: 2,
              shadowOffset: {
                height: 1,
                width: 1,
              },
            }}
            elevation={5}>
            {item.from === userId && (
              <TouchableOpacity
                style={styles.avatarBtn}
                onPress={this.props.gotoProfilePage.bind()}>
                <Image
                  style={styles.avatar}
                  source={imgUrl ? {uri: imgUrl} : hiddenMan}
                />
              </TouchableOpacity>
            )}
            <View>
              {item?.user_image_url !== '' && item?.user_image_url != null ? (
                <TouchableOpacity
                  onPress={() => {
                    this.props.setLargeImage(item?.user_image_url);
                  }}>
                  <Image
                    style={{
                      width: adjustedWidth,
                      height: adjustedHeight,
                      borderRadius: 10,
                    }}
                    resizeMode="contain"
                    source={{uri: item?.user_image_url}}
                  />
                </TouchableOpacity>
              ) : (
                <></>
              )}
              <Text
                style={{
                  padding: 7,
                  fontSize: 15,
                  color: item.from === Global.saveData.u_id ? '#000' : '#FFF',
                }}>
                {item.message}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
    backgroundColor: 'white',
  },
  menuIcon: {
    position: 'absolute',
    right: 15,
    top: 70 * em,
    height: 74 * em,
    width: 75 * em,
    alignItems: 'flex-end',
    justifyContent: 'center',
    zIndex: 1,
  },
  input: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    width: '80%',
    marginBottom: 10,
    borderRadius: 20,
  },
  inputBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 5,
  },
  sendButton: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 25,
    height: 50,
    width: 50,
    backgroundColor: '#B64F54',
    marginLeft: 10,
    zIndex: 10,
  },
  textBox: {
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#8C807F',
    flex: 1,
    fontSize: 15,
    paddingHorizontal: 8,
    paddingRight: 8,
  },
  chatbox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftContainer: {
    flex: 5,
    flexDirection: 'row',
    justifyContent: 'flex-start',
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
    top: -22.5,
    zIndex: 2,
  },
  avatar: {
    width: 45,
    height: 45,
    borderRadius: 400,
  },
  avatarOtherUser: {
    marginTop: 10,
    marginRight: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    flexWrap: 'wrap-reverse',
  },
  avatarOtherUserBtn: {},
  requiredSent: {
    textAlign: 'center',
    color: 'red',
    fontSize: 12,
    marginBottom: 5,
  },
  ringIcon: {
    width: 36,
    height: 36,
    marginLeft: 10,
    marginTop: 0,
  },
  ringIconTouch: {
    width: 50,
    height: 50,
    marginLeft: 10,
    marginTop: 5,
  },
  screenOverlay: {
    height: Dimensions.get('window').height,
    backgroundColor: 'black',
    opacity: 0.9,
  },
  dialogPrompt: {
    marginHorizontal: 20,
    marginTop: 150,
    padding: 10,
    ...Platform.select({
      ios: {
        opacity: 0.9,
        backgroundColor: 'rgb(222,222,222)',
        borderRadius: 15,
      },
      android: {
        borderRadius: 5,
        backgroundColor: 'white',
      },
    }),
  },
  title: {
    fontWeight: 'bold',
    fontSize: 16,
    color: 'black',
  },
  bodyFont: {
    fontSize: 16,
    color: 'black',
    marginTop: 20,
  },
  textMessageInput: {
    marginTop: 10,
    height: 80,
    width: DEVICE_WIDTH * 0.8,
    paddingHorizontal: 10,
    textAlignVertical: 'top',
    borderWidth: 0.5,
    borderColor: '#000',
    ...Platform.select({
      ios: {
        borderRadius: 15,
        backgroundColor: 'rgba(166, 170, 172, 0.9)',
      },
      android: {
        borderRadius: 10,
        backgroundColor: 'white',
      },
    }),
  },
  textInput: {
    height: 40,
    width: 60,
    paddingHorizontal: 10,
    textAlignVertical: 'bottom',
    ...Platform.select({
      ios: {
        borderRadius: 15,
        backgroundColor: 'rgba(166, 170, 172, 0.9)',
      },
      android: {},
    }),
  },
  buttonsOuterView: {
    flexDirection: 'row',
    width: '100%',
    ...Platform.select({
      ios: {},
      android: {
        justifyContent: 'flex-end',
      },
    }),
  },
  buttonsDivider: {
    ...Platform.select({
      ios: {
        width: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
      },
      android: {
        width: 20,
      },
    }),
  },
  buttonsInnerView: {
    flexDirection: 'row',
    ...Platform.select({
      ios: {
        borderTopWidth: 0.5,
        flex: 1,
      },
      android: {},
    }),
  },
  button: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 5,
    padding: 10,
    ...Platform.select({
      ios: {flex: 1},
      android: {},
    }),
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#61bfa9',
  },
  submitButtonText: {
    color: '#61bfa9',
    fontWeight: '600',
    fontSize: 16,
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

export default React.memo(ChatMessage);
