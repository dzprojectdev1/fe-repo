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
import * as Sentry from '@sentry/react-native';
import {findIllegalWords, SERVER_URL} from '../../config/constants';
import RadioGroup from '../../commonUI/components/radioButton';

class GenerateAIUserImage extends Component {
  static navigationOptions = {
    header: null,
  };

  constructor(props) {
    super(props);

    this.state = {
      id: 0,
      is_public: 0,
      user_generation_id: '',
      user_name: '',
      description: '',
      creator_user_id: Global.saveData.u_id,
      coin_for_ai_user_create: 100,
      isLoading: false,
      disabled: true,
      errorMsg: false,
      isValid: false,
      msgError: '',
      message: '',
    };
  }

  gotoShop = () => {
    this.props.navigation.navigate('ScreenGpay01');
  };

  async componentDidMount() {
    Global.saveData.nowPage = 'GenerateAIUserImage';
    const {data} = this.props.route.params || {};

    const {ai_userId, creator_user_id, user_name} = data;
    this.setState({
      id: ai_userId,
      user_name: user_name,
      creator_user_id: creator_user_id,
    });

    if (Global.saveData.coin_count < 100) {
      Alert.alert(
        '',
        "Ops!\n\nYou don't have enough 100 diamonds are required to create a new AI Profile Image...",
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
    this.props.navigation.navigate(Global.saveData.prevpage, {
      data: {isRefresh: true},
    });
  }

  callSave() {
    const details = {
      user_id: this.state.id,
      user_name: this.state.user_name,
      user_generation_id: this.state.user_generation_id,
      user_prompt_text: this.state.description.trim(),
      user_preset_style:
        this.state.is_public === 0
          ? 'DYNAMIC'
          : this.state.is_public === 1
          ? 'GENERAL'
          : 'ANIME',
      coin_per_message: this.state.coin_for_ai_user_create,
      creator_user_id: this.state.creator_user_id,
    };

    let formBody = [];
    for (const property in details) {
      const encodedKey = encodeURIComponent(property);
      const encodedValue = encodeURIComponent(details[property]);
      formBody.push(encodedKey + '=' + encodedValue);
    }
    formBody = formBody.join('&');

    fetch(`${SERVER_URL}/api/user/generateAIUserImage`, {
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
          this.setState({
            isLoading: false,
            disabled: false,
            description: '',
            is_public: 0,
          });
          Global.saveData.coin_count = Global.saveData.coin_count - 100;
          Alert.alert(
            'Success',
            'Image will be ready to view in about 15 - 20 seconds.',
            [
              {
                text: 'Okay',
                onPress: () => setTimeout(() => this.onBack(), 4000),
              },
            ],
            {cancelable: false},
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
    if (this.state.description.trim() === '') {
      Alert.alert('Error', 'The Image Description field is required');
      return false;
    }

    const booleanDescription = findIllegalWords(this.state.description);

    if (booleanDescription) {
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
              "Evaluate the following text based on these criteria:\n- Does it mention any well-known brand names?\n- Does it mention any country's president's name or political person?\n- Does it contain sexual scene or a scene that may lead to sexual activities?\n- Does it contain any movie, cartoon or book character that may violate copyright law?\n- Is the text inappropriate in any way?\n- Does it mention anything illegal?\n- Does it contain sexual content?\n- Does it involve minors?\n- Does it contain any offensive words?\n- Does it discriminate against any group?\n- Does it contain a specific brand name?\n- Does it mention a person who is currently alive?\n- Does it mention a person who died less than 70 years ago?\n- Does it violate copyright laws but be gracious and be lenient to general terms that are commonly used?\n- Does it mention Islam, Muslims, Mohammed, or Allah?\n\nPlease provide a 'true' if the text matches any of these conditions. Also, return a list of matching words in array form. If none of the conditions are met, return 'false'.",
          },
          {
            role: 'user',
            content: `${this.state.description}`,
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
        if (!status) {
          this.setState({
            isLoading: true,
          });
          this.callLeonard();
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

  callLeonard() {
    const modelData = {
      alchemy: true,
      height: 1280,
      modelId:
        this.state.is_public === 0
          ? 'aa77f04e-3eec-4034-9c07-d0f619684628'
          : this.state.is_public === 1
          ? 'e71a1c2f-4f80-4800-934f-2c68979d8cc8'
          : '1e60896f-3c26-4296-8ecc-53e2afecc132',
      num_images: 1,
      presetStyle:
        this.state.is_public === 0
          ? 'DYNAMIC'
          : this.state.is_public === 1
          ? 'GENERAL'
          : 'ANIME',
      prompt: this.state.description,
      width: 720,
      public: false,
    };

    if (this.state.is_public === 0 || this.state.is_public === 1) {
      modelData.photoRealVersion = 'v2';
      modelData.photoReal = true;
    }

    fetch('https://cloud.leonardo.ai/api/rest/v1/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer e60d0535-d13a-4bec-8ab2-131c90478648',
      },
      body: JSON.stringify(modelData),
    })
      .then(response => response.json())
      .then(responseJson => {
        const generationId = responseJson?.sdGenerationJob?.generationId;
        console.log(JSON.stringify(responseJson), generationId);
        this.setState(
          {
            user_generation_id: generationId,
          },
          () => this.callSave(),
        );
      })
      .catch(error => {
        Alert.alert(
          'Error',
          'System is down or text is inappropriate. Please try again',
        );
      });
  }

  parseResponse = response => {
    try {
      const content = response.message.content.trim();

      const status = content.includes('True');

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

  render() {
    return (
      <View style={styles.contentContainer}>
        <TopBar
          title={'Create New AI Profile Image'}
          onBack={this.onBack.bind(this)}
          isRequired={true}
        />

        <ScrollView>
          <View
            style={{
              width: DEVICE_WIDTH,
              marginLeft: DEVICE_WIDTH * 0.1,
              marginTop: 15,
            }}>
            <TextInput
              style={{
                backgroundColor: 'transparent',
                width: DEVICE_WIDTH * 0.8,
                paddingLeft: 2,
                color: '#000',
              }}
              selectionColor="#009788"
              multiline
              value={this.state.description}
              placeholder="Image Description"
              placeholderTextColor="#808080"
              onChangeText={description =>
                this.setState({description, disabled: false})
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
              marginLeft: 25,
              justifyContent: 'flex-start',
              alignItems: 'flex-start',
              marginTop: 15,
            }}>
            <RadioGroup
              radioButtons={[
                {
                  id: 0,
                  label: 'Photo',
                  value: 'Photo',
                },
                {
                  id: 1,
                  label: 'Anime',
                  value: 'Anime',
                },
                {
                  id: 2,
                  label: 'Artistic',
                  value: 'Artistic',
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
              title={'Generate New Image'}
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
              100
            </Text>
          </View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              marginLeft: 10,
              marginTop: 15,
              marginBottom: 20,
            }}>
            <Text
              style={{
                fontSize: 13,
                alignItems: 'center',
                color: 'rgba(128,128,128,0.7)',
                fontWeight: '400',
                marginRight: 10,
                marginTop: 2,
              }}>
              It takes about 20 seconds to generate a new image
            </Text>
          </View>
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
export default GenerateAIUserImage;
