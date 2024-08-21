import React, {Component} from 'react';
import {Text} from 'native-base';
import {
  Alert,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import {Button} from 'react-native-elements';
import Global from '../Global';
import {TopBar} from '../../commonUI/components/topbar';
import diamond from '../../assets/images/red_diamond_trans.png';
import DeviceInfo from 'react-native-device-info';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Sentry from '@sentry/react-native';
import {findIllegalWords, SERVER_URL} from '../../config/constants';
import RadioGroup from '../../commonUI/components/radioButton';
import {Dropdown} from 'react-native-material-dropdown';

class AIUser extends Component {
  static navigationOptions = {
    header: null,
  };

  constructor(props) {
    super(props);

    this.state = {
      id: 0,
      username: '',
      gender: 1,
      languageData: [],
      language: 'English',
      country: 1,
      ethnicity: 1,
      userBirthData: '1998-01-01',
      lat: 0,
      long: 0,
      deviceId: '',
      matchId: 0,
      fcmId: '',
      is_public: 1,
      description: '',
      ai_personality: '',
      creator_user_id: Global.saveData.u_id,
      coin_for_ai_user_create: 200,
      isLoading: false,
      disabled: true,
      errorMsg: false,
      isValid: false,
      msgError: '',
      message: '',
      otherData: null,
      coin_per_message: Global.saveData.coin_per_message,
    };
  }

  getdeviceId = async () => {
    let id = await DeviceInfo.getUniqueId();
    return id;
  };

  getfcmId = async () => {
    let id = await AsyncStorage.getItem('fcmToken');
    return id;
  };

  gotoShop = () => {
    this.props.navigation.navigate('ScreenGpay01');
  };

  async componentDidMount() {
    Global.saveData.nowPage = 'AIUser';
    this.setState({
      deviceId: await this.getdeviceId(),
      fcmId: await this.getfcmId(),
    });
    await this.get_language();
    if (Global.saveData.coin_count < 200) {
      Alert.alert(
        '',
        "Ops!\n\nYou don't have enough 200 diamonds are required to create a new AI character...",
        [
          {
            text: 'Cancel',
            onPress: () => this.onBack(),
          },
          {text: 'Buy Diamonds', onPress: () => this.gotoShop()},
        ],
        {cancelable: false},
      );
    }
  }

  onBack() {
    this.props.navigation.navigate('BrowseList');
  }

  get_language = async () => {
    await fetch(`${SERVER_URL}/api/language/all`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: Global.saveData.token,
      },
    })
      .then(response => response.json())
      .then(responseJson => {
        //  alert(JSON.stringify(responseJson))
        if (!responseJson.error) {
          const data = responseJson.data;
          var itmes = [];
          for (var i = 0; i < data.length; i++) {
            itmes.push({value: data[i].language_name});
          }
          console.log(itmes);
          this.setState({
            languageData: itmes,
          });
        }
      })
      .catch(error => {
        console.error(error);
      });
  };

  goToChat() {
    const otherData = {
      imageUrl: this.state.otherData.imageUrl,
      isFirstTime: true,
      data: {
        name: this.state.otherData.name,
        other_user_id: this.state.otherData.id,
        match_id: this.state.matchId,
        coin_count: this.state.otherData.coin_count,
        fan_count: this.state.otherData.fan_count,
        ai_friend: this.state.otherData.ai_friend,
        chat_type: this.state.otherData.chat_type,
        ai_personality: this.state.otherData.ai_personality,
        img_message: this.state.otherData.img_message,
        creator_user_id: this.state.otherData.creator_user_id,
        description: this.state.otherData.description,
        is_public: this.state.otherData.is_public,
        language: this.state.otherData.language,
      },
    };
    setTimeout(() => {
      Global.saveData.prevpage = 'BrowseList';
      this.props.navigation.replace('ChatDetail', {data: otherData});
    }, 100);
  }

  gotoInstantChat = () => {
    const details = {
      otherId: this.state.otherData.id,
    };

    let formBody = [];
    for (const property in details) {
      const encodedKey = encodeURIComponent(property);
      const encodedValue = encodeURIComponent(details[property]);
      formBody.push(encodedKey + '=' + encodedValue);
    }
    formBody = formBody.join('&');
    fetch(`${SERVER_URL}/api/match/requestInstantMatch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: Global.saveData.token,
      },
      body: formBody,
    })
      .then(response => response.json())
      .then(responseJson => {
        if (!responseJson.error) {
          if (responseJson.data.account_status === 1) {
            this.setState(
              {
                isLoading: false,
                disabled: true,
                matchId: responseJson.data.match_id,
              },
              () => this.goToChat(),
            );
            // Alert.alert(
            //   'Success!',
            //   this.state.message,
            //   [
            //     {
            //       text: 'Okay',
            //       onPress: () => this.onBack(),
            //     },
            //     {
            //       text: 'Go to chat',
            //       onPress: () => this.goToChat(),
            //     },
            //   ],
            //   {cancelable: false},
            // );
            // this.goToChat();
          }
        }
      })
      .catch(error => {
        Sentry.captureException(new Error(error));
        console.log(error);
      });
  };

  callSave() {
    var lanD = this.state.languageData;
    var lanindex = 1;
    for (var i = 0; i < lanD.length; i++) {
      if (lanD[i].value == this.state.language) {
        lanindex = i + 1;
        break;
      }
    }

    const details = {
      id: this.state.id,
      username: this.state.username.trim(),
      gender: this.state.gender,
      language: lanindex,
      country: this.state.country,
      ethnicity: this.state.ethnicity,
      birth_date: this.state.userBirthData,
      lat_geo: this.state.lat,
      long_geo: this.state.long,
      device_id: this.state.deviceId,
      fcm_id: this.state.fcmId,
      is_public: this.state.is_public,
      description: this.state.description.trim(),
      ai_personality:
        this.state.ai_personality.trim() +
        '. #currentaction#. You are talking to #userdata#. all conversations are appropriate and legal, does not involve minor and is not sexual.',
      creator_user_id: this.state.creator_user_id,
      coin_for_ai_user_create: this.state.coin_for_ai_user_create,
      coin_per_message: this.state.coin_per_message,
    };

    let formBody = [];
    for (const property in details) {
      const encodedKey = encodeURIComponent(property);
      const encodedValue = encodeURIComponent(details[property]);
      formBody.push(encodedKey + '=' + encodedValue);
    }
    formBody = formBody.join('&');

    fetch(`${SERVER_URL}/api/user/addEditAIUser`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: Global.saveData.token,
      },
      body: formBody,
    })
      .then(response => response.json())
      .then(responseJson => {
        if (!responseJson.error) {
          this.setState(
            {
              otherData: responseJson.user,
              message: responseJson.message,
            },
            () => this.gotoInstantChat(),
          );
        } else {
          this.setState({
            isLoading: false,
            disabled: false,
          });
          alert(responseJson.message);
        }
      })
      .catch(error => {
        Sentry.captureException(new Error(error));
        this.setState({
          isLoading: false,
          disabled: false,
        });
      });
  }

  onUpdate() {
    if (this.state.username.trim() === '') {
      Alert.alert('Error', 'The AI Character Name field is required');
      return false;
    }

    if (this.state.ai_personality.trim() === '') {
      Alert.alert(
        'Error',
        'The AI Character Personality and Description field is required',
      );
      return false;
    }

    if (this.state.description.trim() === '') {
      Alert.alert('Error', 'The Public Profile Description field is required');
      return false;
    }

    const booleanUsername = findIllegalWords(this.state.username);
    const booleanAIPersonality = findIllegalWords(this.state.ai_personality);
    const booleanDescription = findIllegalWords(this.state.description);

    if (booleanUsername || booleanAIPersonality || booleanDescription) {
      Alert.alert(
        'Error',
        'The entered text is not appropriate, please change the text and try again.',
      );
      return false;
    }

    this.checkIsOffenciveWords();
  }

  checkIsOffenciveWords() {
    fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization:
          'Bearer sk-my-service-account-OcVwpHabIqoDlDYTtTLuT3BlbkFJOsnTUJjvEiuTd2sUQyDK',
      },
      body: JSON.stringify({
        model: 'gpt-4', // Updated to a supported model
        messages: [
          {
            role: 'system',
            content:
              "You are an evaluator that checks text against a set of specific conditions. Your task is to return 'true' or 'false' based on the evaluation criteria provided, and list any matching words.",
          },
          {
            role: 'user',
            content:
              "Evaluate the following text based on these criteria:\n- Does it mention any well-known brand names?\n- Does it mention any country's president's name or political person?\n- Does it contain sexual scene or a scene that may lead to sexual activities?\n- Does it contain any movie, cartoon or book character that may violate copyright law?\n- Does it indicate that the user is 18 years or older?\n- Does it contain any words related to community?\n- Is the text inappropriate in any way?\n- Does it mention anything illegal?\n- Does it contain sexual content?\n- Does it involve minors?\n- Does it contain any offensive words?\n- Does it discriminate against any group?\n- Does it contain a specific brand name?\n- Does it mention a person who is currently alive?\n- Does it mention a person who died less than 70 years ago?\n- Does it violate copyright laws?\n- Does it mention Islam, Muslims, Mohammed, or Allah?\n\nPlease provide a 'true' if the text matches any of these conditions. Also, return a list of matching words in array form. If none of the conditions are met, return 'false'.",
          },
          {
            role: 'user',
            content: `${this.state.username}, ${this.state.ai_personality}, ${this.state.description}`,
          },
        ],
        max_tokens: 100,
        temperature: 0,
      }),
    })
      .then(response => response.json())
      .then(responseJson => {
        console.log(JSON.stringify(responseJson));

        const {status, words} = this.parseResponse(responseJson.choices[0]);
        console.log(status, words);
        if (!status) {
          this.setState({
            isLoading: true,
          });
          this.callSave();
        } else {
          Alert.alert(
            'Error',
            `The entered text is not appropriate, please change the text and try again.\n\n${words.join(
              ', ',
            )}`,
          );
        }
      })
      .catch(error => {
        Sentry.captureException(new Error(error));
        console.log(error);
      });
  }

  parseResponse = response => {
    try {
      const content = response.message.content.trim();

      // Extract status ("True" or "False")
      const status = content.includes('True');

      // Extract words from the list in square brackets
      const wordsMatch = content.match(/\[(.*?)\]/);
      const words = wordsMatch
        ? wordsMatch[1].split(',').map(word => word.trim().replace(/['"]/g, ''))
        : [];

      return {
        status,
        words,
      };
    } catch (error) {
      console.error('Error parsing response:', error);
      return {
        status: false, // Safe default
        words: [],
      };
    }
  };

  // parseResponse = response => {
  //   try {
  //     const content = response.message.content;
  //     const statusMatch = content.match(/Status: (\w+)/);
  //     const wordsMatch = content.match(/Words: ([\w, ]+)/);
  //
  //     const status = statusMatch ? statusMatch[1] : null;
  //     const words = wordsMatch
  //       ? wordsMatch[1].split(',').map(word => word.trim())
  //       : [];
  //
  //     return {
  //       status: status === 'true',
  //       words,
  //     };
  //   } catch (error) {
  //     console.error('Error parsing response:', error);
  //     return null;
  //   }
  // };

  render() {
    const buttons = ['Private', 'Public'];
    return (
      <View style={styles.contentContainer}>
        <TopBar
          title={'Create New AI Character'}
          onBack={this.onBack.bind(this)}
        />

        <ScrollView>
          {/*<View*/}
          {/*  style={{*/}
          {/*    width: DEVICE_WIDTH,*/}
          {/*    alignItems: 'center',*/}
          {/*    justifyContent: 'center',*/}
          {/*    marginTop: 25,*/}
          {/*  }}>*/}
          {/*  <ButtonGroup*/}
          {/*    onPress={index => {*/}
          {/*      this.setState({is_public: index});*/}
          {/*    }}*/}
          {/*    selectedIndex={this.state.is_public}*/}
          {/*    buttons={buttons}*/}
          {/*    selectedButtonStyle={{backgroundColor: '#DE5859'}}*/}
          {/*    containerStyle={{*/}
          {/*      height: 40,*/}
          {/*      width: DEVICE_WIDTH * 0.8,*/}
          {/*      borderRadius: 20,*/}
          {/*      borderColor: '#DE5859',*/}
          {/*    }}*/}
          {/*    selectedTextStyle={{color: '#fff', fontSize: 14}}*/}
          {/*    textStyle={{color: '#DE5859', fontSize: 14}}*/}
          {/*  />*/}
          {/*</View>*/}
          <View
            style={{
              width: DEVICE_WIDTH,
              marginLeft: DEVICE_WIDTH * 0.1,
              marginTop: 15,
            }}>
            {/*<View style={{flexDirection: 'row', alignItems: 'center'}}>*/}
            {/*  <Text style={{color: '#808080', fontSize: 12}}>*/}
            {/*    {'AI Character Name'}*/}
            {/*  </Text>*/}
            {/*</View>*/}
            <TextInput
              style={{
                backgroundColor: 'transparent',
                width: DEVICE_WIDTH,
                height: 40,
                paddingLeft: 0,
                color: '#000',
              }}
              selectionColor="#009788"
              value={this.state.username}
              placeholder="AI Character Name"
              placeholderTextColor="#808080"
              onChangeText={username =>
                this.setState({username, disabled: false})
              }
              autoCapitalize="none"
              underlineColorAndroid="transparent"
            />
            <View
              style={{
                height: 1,
                width: DEVICE_WIDTH * 0.8,
                backgroundColor: 'rgba(128,128,128,0.5)',
              }}
            />
            <Text
              style={{
                color: 'darkred',
                fontSize: 9,
                width: DEVICE_WIDTH * 0.8,
                textAlign: 'right',
              }}>
              {'*This field is required'}
            </Text>
          </View>
          <View
            style={{
              width: DEVICE_WIDTH * 0.8,
              marginLeft: DEVICE_WIDTH * 0.1,
              marginTop: 10,
            }}>
            {/*<View>*/}
            {/*  <Text style={{color: '#808080', fontSize: 12}}>*/}
            {/*    {'AI Character Personality and Description'}*/}
            {/*  </Text>*/}
            {/*  <Text style={{color: '#808080', fontSize: 9}}>*/}
            {/*    {'This text is used to generate chat response'}*/}
            {/*  </Text>*/}
            {/*</View>*/}
            <TextInput
              style={{
                backgroundColor: 'transparent',
                width: DEVICE_WIDTH * 0.8,
                paddingLeft: 2,
                color: '#000',
              }}
              selectionColor="#009788"
              value={this.state.ai_personality}
              placeholder="AI Character Personality and Description"
              multiline
              placeholderTextColor="#808080"
              onChangeText={intro =>
                this.setState({ai_personality: intro, disabled: false})
              }
              autoCapitalize="sentences"
              underlineColorAndroid="transparent"
            />
            <View
              style={{
                height: 1,
                width: DEVICE_WIDTH * 0.8,
                backgroundColor: '#808080',
              }}
            />
            <Text
              style={{
                color: 'darkred',
                fontSize: 9,
                width: DEVICE_WIDTH * 0.8,
                textAlign: 'right',
              }}>
              {'*This field is required'}
            </Text>
          </View>
          <View
            style={{
              width: DEVICE_WIDTH * 0.8,
              marginLeft: DEVICE_WIDTH * 0.1,
              marginTop: 10,
            }}>
            {/*<View>*/}
            {/*  <Text style={{color: '#808080', fontSize: 12}}>*/}
            {/*    {'Public Profile Description'}*/}
            {/*  </Text>*/}
            {/*  <Text style={{color: '#808080', fontSize: 9}}>*/}
            {/*    {'What other users will see in profile description'}*/}
            {/*  </Text>*/}
            {/*</View>*/}
            <TextInput
              style={{
                backgroundColor: 'transparent',
                width: DEVICE_WIDTH * 0.8,
                paddingLeft: 2,
                color: '#000',
              }}
              selectionColor="#009788"
              value={this.state.description}
              placeholder="Public Profile Description"
              multiline
              maxLength={255}
              placeholderTextColor="#808080"
              onChangeText={intro =>
                this.setState({description: intro, disabled: false})
              }
              autoCapitalize="sentences"
              underlineColorAndroid="transparent"
            />
            <View
              style={{
                height: 1,
                width: DEVICE_WIDTH * 0.8,
                backgroundColor: '#808080',
              }}
            />
            <Text
              style={{
                color: 'darkred',
                fontSize: 9,
                width: DEVICE_WIDTH * 0.8,
                textAlign: 'right',
              }}>
              {'*This field is required'}
            </Text>
          </View>

          <View
            style={{
              width: DEVICE_WIDTH * 0.8,
              marginLeft: DEVICE_WIDTH * 0.1,
              marginTop: 10,
            }}>
            <Dropdown
              containerStyle={{width: DEVICE_WIDTH * 0.8, marginTop: -15}}
              label=" "
              pickerStyle={{marginTop: -50}}
              style={{
                backgroundColor: 'transparent',
                width: DEVICE_WIDTH * 0.8,
                paddingLeft: 2,
                color: '#000',
              }}
              inputContainerStyle={{borderBottomColor: '#808080'}}
              baseColor="#DE5859" //indicator color
              textColor="#000"
              data={this.state.languageData}
              onChangeText={language =>
                this.setState({language, disabled: false})
              }
              value={this.state.language}
              dropdownPosition={-4}
            />
            <View
              style={{
                height: 1,
                width: DEVICE_WIDTH * 0.8,
                backgroundColor: '#808080',
              }}
            />
          </View>
          {/*{this.state.errorMsg && (*/}
          {/*  <Text style={styles.requiredSent}>* {this.state.msgError} </Text>*/}
          {/*)}*/}
          <View
            style={{
              width: DEVICE_WIDTH * 0.8,
              marginLeft: 25,
              justifyContent: 'flex-start',
              alignItems: 'flex-start',
              marginTop: 15,
            }}>
            <RadioGroup
              radioButtons={[
                {
                  id: 1,
                  label: 'Public',
                  value: 'Public',
                },
                {
                  id: 0,
                  label: 'Private',
                  value: 'Private',
                },
              ]}
              onPress={index => {
                this.setState({is_public: index, disabled: false});
              }}
              selectedId={this.state.is_public}
            />
          </View>
          <View
            style={{
              width: DEVICE_WIDTH * 0.8,
              marginLeft: DEVICE_WIDTH * 0.1,
              marginTop: 20,
              flexDirection: 'row',
              justifyContent: 'center',
            }}>
            <Button
              title={'Create New AI Character'}
              buttonStyle={{
                backgroundColor: '#f00',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 50,
                padding: 10,
                width: DEVICE_WIDTH * 0.75,
              }}
              loading={this.state.isLoading}
              onPress={() => this.onUpdate()}
              disabled={this.state.disabled}
            />
          </View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              width: DEVICE_WIDTH * 0.8,
              marginLeft: DEVICE_WIDTH * 0.1,
              marginTop: 15,
              marginBottom: 20,
            }}>
            <Image
              source={diamond}
              style={{width: 18, height: 18, marginTop: 5}}
            />
            <Text
              style={{
                fontSize: 14,
                alignItems: 'center',
                color: '#000',
                fontWeight: '600',
                marginRight: 10,
                marginTop: 2,
              }}>
              {' '}
              200
            </Text>
          </View>
        </ScrollView>
      </View>
    );
  }
}

const DEVICE_WIDTH = Dimensions.get('window').width;
// const DEVICE_HEIGHT = Dimensions.get('window').height;
const styles = StyleSheet.create({
  contentContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: '#fff',
    // marginTop: 40,
  },
  instructions: {
    textAlign: 'center',
    color: '#3333ff',
    marginBottom: 5,
  },
  requiredSent: {
    textAlign: 'left',
    color: 'red',
    fontSize: 12,
    marginBottom: 15,
  },
  SectionStyle: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderBottomWidth: 0.3,
    borderBottomColor: '#808080',
    height: 40,
    marginTop: 5,
    marginBottom: 15,
  },
});
export default AIUser;
