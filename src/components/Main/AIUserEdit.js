import React from 'react';
import {Text} from 'native-base';
import {
  Alert,
  Dimensions,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import {Button} from 'react-native-elements';
import Global from '../Global';
import {TopBar} from '../../commonUI/components/topbar';
import * as Sentry from '@sentry/react-native';
import {findIllegalWords, SERVER_URL} from '../../config/constants';
import RadioGroup from '../../commonUI/components/radioButton';
import {connect} from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';

class AIUserEdit extends React.PureComponent {
  static navigationOptions = {
    header: null,
  };

  constructor(props) {
    super(props);
    // const {data} = props.route.params;
    // console.log(
    //   '2',
    //   data?.data?.id,
    //   data?.data?.username,
    //   data?.data?.is_public,
    //   data?.data?.description,
    // );

    // const id = data?.id;
    // const username = data?.username;
    // const description = data?.description;
    // const ai_personality = data?.ai_personality;
    // const is_public = data?.is_public;

    this.state = {
      id: 0,
      username: '',
      gender: 1,
      language: 1,
      country: 1,
      ethnicity: 1,
      userBirthData: '1998-01-01',
      lat: 0,
      long: 0,
      deviceId: '',
      matchId: 0,
      fcmId: '',
      is_public: '',
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

  async componentDidMount() {
    this.initializeState();
    Global.saveData.nowPage = 'AIUserEdit';
    // const id = await AsyncStorage.getItem('id');
    // const name = await AsyncStorage.getItem('name');
    // const description = await AsyncStorage.getItem('description');
    // const creator_user_id = await AsyncStorage.getItem('creator_user_id');
    // const is_public = await AsyncStorage.getItem('is_public');
    // const ai_personality = await AsyncStorage.getItem('ai_personality');
    // console.log('componentDidMount', name, id, description);
    // this.setState({
    //   id: parseInt(id),
    //   name: name,
    //   description: description,
    //   creator_user_id: parseInt(creator_user_id),
    //   is_public: parseInt(is_public),
    //   ai_personality: ai_personality,
    // });
  }

  async componentDidUpdate(prevProps) {
    if (prevProps.route.params !== this.props.route.params) {
      this.initializeState();
    }
  }

  async initializeState() {
    const {data} = this.props.route.params || {};
    if (data) {
      const {id, username, description, ai_personality, is_public} = data.data;

      this.setState({
        id: id || '',
        username: username || '',
        description: description || '',
        ai_personality: ai_personality || '',
        is_public: is_public || 0,
      });
    } else {
      const id = await AsyncStorage.getItem('id');
      const name = await AsyncStorage.getItem('name');
      const description = await AsyncStorage.getItem('description');
      const creator_user_id = await AsyncStorage.getItem('creator_user_id');
      const is_public = await AsyncStorage.getItem('is_public');
      const ai_personality = await AsyncStorage.getItem('ai_personality');

      this.setState({
        id: parseInt(id),
        username: name,
        description: description,
        creator_user_id: parseInt(creator_user_id),
        is_public: parseInt(is_public),
        ai_personality: ai_personality,
      });
    }
  }

  componentWillUnmount() {
    this.setState({
      isLoading: false,
      disabled: true,
      id: 0,
      username: '',
      is_public: 0,
      description: '',
      ai_personality: '',
    });
  }

  onBack = () => {
    this.props.navigation.navigate('Chat');
  };

  gotoInstantChat = () => {
    Alert.alert(
      'Success!',
      this.state.message,
      [
        {
          text: 'Okay',
          onPress: () => this.navigateToChat(),
        },
      ],
      {cancelable: false},
    );
  };

  navigateToChat = () => {
    this.props.navigation.navigate('Chat');
  };

  callSave() {
    const details = {
      id: this.state.id,
      username: this.state.username.trim(),
      gender: this.state.gender,
      language: this.state.language,
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
              isLoading: false,
              disabled: true,
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
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: `Please read carefully text and is this text inappropriate, or illegal, or is sexual, or involve minors, or offensive, or discriminates, or contain a specific brand, or is a person who is alive, or is a person who died less than 70 years ago, or violates copyright, or mentions muslim, Muslims, Islam, Mohammed or Allah? Please provide a response "true" if the text matches any conditions provided above and also provide a list of words which matches the condition as array else return "false". Text is ${this.state.username}, ${this.state.ai_personality}, ${this.state.description}`,
          },
        ],
        max_tokens: 512,
        temperature: 0.7,
        top_p: 0.9,
        frequency_penalty: 0.5,
        presence_penalty: 0.6,
        n: 1,
      }),
    })
      .then(response => response.json())
      .then(responseJson => {
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
            'The entered text is not appropriate, please change the text and try again.',
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
      const content = response.message.content;
      const statusMatch = content.match(/Status: (\w+)/);
      const wordsMatch = content.match(/Words: ([\w, ]+)/);

      const status = statusMatch ? statusMatch[1] : null;
      const words = wordsMatch
        ? wordsMatch[1].split(',').map(word => word.trim())
        : [];

      return {
        status: status === 'true',
        words,
      };
    } catch (error) {
      console.error('Error parsing response:', error);
      return null;
    }
  };

  render() {
    return (
      <View style={styles.contentContainer}>
        <TopBar title={'Edit AI Character'} onBack={this.onBack.bind(this)} />

        <ScrollView>
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
              title={'Save'}
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
          {/*<View*/}
          {/*  style={{*/}
          {/*    flexDirection: 'row',*/}
          {/*    alignItems: 'center',*/}
          {/*    justifyContent: 'center',*/}
          {/*    width: DEVICE_WIDTH * 0.8,*/}
          {/*    marginLeft: DEVICE_WIDTH * 0.1,*/}
          {/*    marginTop: 15,*/}
          {/*    marginBottom: 20,*/}
          {/*  }}>*/}
          {/*  <Image*/}
          {/*    source={diamond}*/}
          {/*    style={{width: 18, height: 18, marginTop: 5}}*/}
          {/*  />*/}
          {/*  <Text*/}
          {/*    style={{*/}
          {/*      fontSize: 14,*/}
          {/*      alignItems: 'center',*/}
          {/*      color: '#000',*/}
          {/*      fontWeight: '600',*/}
          {/*      marginRight: 10,*/}
          {/*      marginTop: 2,*/}
          {/*    }}>*/}
          {/*    {' '}*/}
          {/*    200*/}
          {/*  </Text>*/}
          {/*</View>*/}
        </ScrollView>
      </View>
    );
  }
}

const DEVICE_WIDTH = Dimensions.get('window').width;
const styles = StyleSheet.create({
  contentContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: '#fff',
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

export default connect()(AIUserEdit);
// export default AIUserEdit;
