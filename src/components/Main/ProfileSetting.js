import React, { Component } from "react";
import {
  Text,
  Icon,
} from "native-base"
import {
  Dimensions,
  TextInput,
  ScrollView,
  View,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Alert,
  AsyncStorage,
  Linking
} from "react-native";
import { Dropdown } from 'react-native-material-dropdown';
import { Button } from 'react-native-elements';
import Global from '../Global';

import { SERVER_URL } from '../../config/constants';

class ProfileSetting extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: '',
      languageData: [],
      language: '',
      cityData: [],
      city: '',
      country: '',
      countryData: [],
      isLoading: false,
      disabled: true,
      account_status: true,
    };

    this.changeAccountStatus();
  }

  changeAccountStatus() {
    if (Global.saveData.account_status == 1) {
      this.setState({
        account_status: true
      })
    } else if (Global.saveData.account_status == 2) {
      this.setState({
        account_status: false
      })
    }
  }

  static navigationOptions = {
    header: null
  };
  componentWillMount() {
    this.getDetailData();
    this.get_ethnicity();
    this.get_country();
    this.get_language();
  }
  componentDidMount() {
    Global.saveData.nowPage = 'ProfileSetting';    
  }
  getDetailData = async () => {
    fetch(`${SERVER_URL}/api/user/getMyDetailInfo`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': Global.saveData.token
      }
    }).then((response) => response.json())
      .then((responseJson) => {
        if (!responseJson.error) {
          var data = responseJson.data;
          this.setState({
            name: data.name ? data.name : '',
            description: data.description ? data.description : ''
          })
        }
      })
      .catch((error) => {
        alert(JSON.stringify(error))
        return
      });
  }
  get_ethnicity = async () => {
    await fetch(`${SERVER_URL}/api/ethnicity/all`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': Global.saveData.token
      }
    }).then((response) => response.json())
      .then((responseJson) => {
        if (!responseJson.error) {
          var data = responseJson.data;
          var itmes = [];
          for (var i = 0; i < data.length; i++) {
            itmes.push({ value: data[i].ethnicity_name })
          }
          this.setState({ city: Global.saveData.u_city, cityData: itmes })
        }
      })
      .catch((error) => {
        alert(JSON.stringify(error))
        return
      });
  }
  get_country = async () => {
    await fetch(`${SERVER_URL}/api/country/all`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': Global.saveData.token
      }
    }).then((response) => response.json())
      .then((responseJson) => {
        // alert(JSON.stringify(responseJson))
        if (!responseJson.error) {
          var data = responseJson.data;
          var itmes = [];
          for (var i = 0; i < data.length; i++) {
            itmes.push({ value: data[i].country_name })
          }
          this.setState({ country: Global.saveData.u_country, countryData: itmes })
        }
      })
      .catch((error) => {
        alert(JSON.stringify(error))
        return
      });
  }

  get_language = async () => {
    await fetch(`${SERVER_URL}/api/language/all`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': Global.saveData.token
      }
    }).then((response) => response.json())
      .then((responseJson) => {
        //  alert(JSON.stringify(responseJson))
        if (!responseJson.error) {
          var data = responseJson.data;
          var itmes = [];
          for (var i = 0; i < data.length; i++) {
            itmes.push({ value: data[i].language_name })
          }
          this.setState({ language: Global.saveData.u_language, languageData: itmes })
        }
      })
      .catch((error) => {
        alert(JSON.stringify(error))
        return
      });
  }
  onBack() {
    this.props.navigation.pop()
  }
  gotoTermofService() {
    this.props.navigation.navigate("TermsPolicy")
  }
  onUpdate() {
    if (this.state.name === '') {
      Alert.alert("The name field is not inputed")
      return
    }
    this.setState({
      isLoading: true
    });
    var lanD = this.state.languageData
    var lanindex = 1;
    for (var i = 0; i < lanD.length; i++) {
      if (lanD[i].value == this.state.language) {
        lanindex = i + 1
        break;
      }
    }

    var cityD = this.state.cityData
    var cityindex = 1;
    for (var i = 0; i < cityD.length; i++) {
      if (cityD[i].value == this.state.city) {
        cityindex = i + 1
        break;
      }
    }

    var countryD = this.state.countryData
    var coutryindex = 1;
    for (var i = 0; i < countryD.length; i++) {
      if (countryD[i].value == this.state.country) {
        coutryindex = i + 1
        break;
      }
    }
    var details = {
      'name': this.state.name,
      'description': this.state.description,
      'languageId': lanindex,
      'ethnicityId': cityindex,
      'countryId': coutryindex
    };
    var formBody = [];
    for (var property in details) {
      var encodedKey = encodeURIComponent(property);
      var encodedValue = encodeURIComponent(details[property]);
      formBody.push(encodedKey + "=" + encodedValue);
    }
    formBody = formBody.join("&");
    fetch(`${SERVER_URL}/api/user/updateSetting`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': Global.saveData.token
      },
      body: formBody,
    }).then((response) => response.json())
      .then((responseJson) => {
        
        if (!responseJson.error) {
          this.setState({
            isLoading: false,
            disabled: true
          });
          Global.saveData.u_name = this.state.name
          Global.saveData.u_city = this.state.city
          Global.saveData.u_country = this.state.country
          Global.saveData.u_language = this.state.language
          alert(responseJson.message);
        }
        else {
          this.setState({
            isLoading: false,
            disabled: false
          });
          alert(responseJson.message);

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

  onDeactivateAccount() {
    Alert.alert(
      '',
      'Are you sure you want to deactivate your account? You can activate your account later',
      [
        { text: 'Cancel', backgroundColor: '#FCDD80', onPress: () => () => console.log('Cancel Pressed'), style: 'cancel' },
        { text: 'Confirm', backgroundColor: '#FCDD80', onPress: () => this.deactivateAccount() },
      ],
      { cancelable: false });
  }
  deactivateAccount() {
    fetch(`${SERVER_URL}/api/user/deactivateAccount`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': Global.saveData.token
      }
    }).then((response) => response.json())
      .then((responseJson) => {
        if (!responseJson.error) {
          Alert.alert(
            '',
            'Your account is deactivated',
            [
              { text: 'Activate', backgroundColor: '#FCDD80', onPress: () => this.activateAccount() },
            ],
            { cancelable: false });
          this.setState({
            account_status: false
          })
          Global.saveData.account_status = 2;
        }
      })
      .catch((error) => {
        alert(JSON.stringify(error))
        return
      });
  }

  activateAccount() {
    fetch(`${SERVER_URL}/api/user/activateAccount`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': Global.saveData.token
      }
    }).then((response) => response.json())
      .then((responseJson) => {
        if (!responseJson.error) {
          Alert.alert('Your account is activated');
          this.setState({
            account_status: true
          })
          Global.saveData.account_status = 1;
        }
      })
      .catch((error) => {
        alert(JSON.stringify(error))
        return
      });
  }

  onCloseAccout() {
    Alert.alert(
      '',
      'Are you sure you want to close your account permanently? You cannot activate your account again',
      [
        { text: 'Cancel', backgroundColor: '#FCDD80', onPress: () => () => console.log('Cancel Pressed'), style: 'cancel' },
        { text: 'Confirm', backgroundColor: '#FCDD80', onPress: () => this.closeAccout() },
      ],
      { cancelable: false });
  }
  closeAccout() {
    fetch(`${SERVER_URL}/api/user/closeAccount`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': Global.saveData.token
      }
    }).then((response) => response.json())
      .then((responseJson) => {
        if (!responseJson.error) {

          var resultData = responseJson.data;

          let alert_str = 'Your account is closed. Please send an email to admin@dazzleddate.com if this was done in error. Please include the following information in your email ';
          alert_str += 'User ID : ' + resultData.user_id +' Confirmation Code ' + resultData.confirmation_code;
          alert_str += ' In your email, please describe in details why this was done in error';

          Alert.alert(
            '',
            alert_str,
            [],
            { cancelable: false });
        }
        else {
          Alert.alert(responseJson.message)
        }
      })
      .catch((error) => {
        alert(JSON.stringify(error))
        return
      });
  }

  goOut() {
    this.clearGlobal();
    this.props.navigation.navigate("FirstScreen");
  }

  removeItemValue = async () => {
    try {
      await AsyncStorage.removeItem('globalData');
      return true;
    }
    catch (exception) {
      return false;
    }
  }
  // onLogout() {
  //   Alert.alert(
  //     '',
  //     'Are you sure you want to log out?',
  //     [
  //       { text: 'Logout', backgroundColor: '#FCDD80', onPress: () => this.logout() },
  //       { text: 'Cancel', backgroundColor: '#FCDD80', onPress: () => () => console.log('Cancel Pressed'), style: 'cancel' },
  //     ],
  //     { cancelable: false });
  // }
  // logout = () => {
  //   this.removeItemValue().then((result) => {
  //     if (result === true) {
  //       this.clearGlobal();
  //       Alert.alert(
  //         '',
  //         'You have been logged out successfully',
  //         [
  //           { text: 'Ok', backgroundColor: '#FCDD80', onPress: () => () => console.log('Ok Pressed') },
  //         ],
  //         { cancelable: true });
  //       this.props.navigation.navigate("FirstScreen");
  //     }
  //   });
  // }
  clearGlobal = () => {
    Global.saveData.u_id = '';
    Global.saveData.u_name = '';
    Global.saveData.u_age = '';
    Global.saveData.u_gender = '';
    Global.saveData.u_email = '';
    Global.saveData.u_language = '';
    Global.saveData.u_city = '';
    Global.saveData.u_country = '';
    Global.saveData.u_ins_id = '';
    Global.saveData.u_ins_comp = '';
    Global.saveData.u_phone = '';
    Global.saveData.u_type = '';
    Global.saveData.u_completedNum = 0;
    Global.saveData.u_pendingNum = 0;
    Global.saveData.u_totalNum = 0;
    Global.saveData.token = null;
    Global.saveData.gusetPost = false;
    Global.saveData.newUser = true;
    Global.saveData.isFilter = false;
    Global.saveData.removedFilter = false;
    Global.saveData.filterData = null;
    Global.saveData.isMatchVideo = false;
    Global.saveData.prevpage = "";
  }
  render() {
    return (
      <View style={styles.contentContainer}>
        <StatusBar backgroundColor='#fff' barStyle='dark-content' />
        <View style={{ marginTop: 40, flexDirection: 'row', height: 40 }}>
          <TouchableOpacity style={{ height: 40, width: 40, marginLeft: 10, alignItems: 'center', }}
            onPress={() => this.onBack()}>
            <Icon type="Ionicons" name="ios-arrow-back" />
          </TouchableOpacity>
          <View style={{ width: DEVICE_WIDTH - 80, height: 40, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontWeight: 'bold' }}>{"ACCOUNT SETTING"}</Text>
          </View>
        </View>
        <ScrollView>
          <View style={{ width: DEVICE_WIDTH * 0.8, marginLeft: DEVICE_WIDTH * 0.1, marginTop: 50 }}>
            <TextInput
              style={{ backgroundColor: 'transparent', width: DEVICE_WIDTH * 0.8, height: 40, paddingLeft: 2, color: '#000' }}
              selectionColor="#009788"
              value={this.state.name}
              placeholder="Name"
              placeholderTextColor="#808080"
              onChangeText={name => this.setState({ name, disabled: false })}
              autoCapitalize="none"
              underlineColorAndroid="transparent"
            />
            <View style={{ height: 1, width: DEVICE_WIDTH * 0.8, backgroundColor: '#808080' }} />
          </View>
          <View style={{ width: DEVICE_WIDTH * 0.8, marginLeft: DEVICE_WIDTH * 0.1, marginTop: 10 }}>
            <TextInput
              style={{ backgroundColor: 'transparent', width: DEVICE_WIDTH * 0.8, paddingLeft: 2, color: '#000' }}
              selectionColor="#009788"
              value={this.state.description}
              placeholder="Introduction (Max length is 255)"
              multiline
              maxLength={255}
              placeholderTextColor="#808080"
              onChangeText={intro => this.setState({ description: intro, disabled: false })}
              autoCapitalize="sentences"
              underlineColorAndroid="transparent"
            />
            <View style={{ height: 1, width: DEVICE_WIDTH * 0.8, backgroundColor: '#808080' }} />
          </View>
          <View style={{ width: DEVICE_WIDTH * 0.8, marginLeft: DEVICE_WIDTH * 0.1, marginTop: 15 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ color: '#808080', fontSize: 12 }}>{"LANGUAGE"}</Text>
            </View>
            <View>
              <Dropdown
                containerStyle={{ width: "100%", marginTop: -15 }}
                label=' '
                pickerStyle={{ marginTop: -50, }}
                style={{ color: '#808080', fontSize: 10 }}
                inputContainerStyle={{ borderBottomColor: '#808080', }}
                baseColor="#DE5859"//indicator color
                textColor="#000"
                data={this.state.languageData}
                onChangeText={(language) => this.setState({ language, disabled: false })}
                value={this.state.language}
                dropdownPosition={-4}
              />
            </View>
          </View>
          <View style={{ width: DEVICE_WIDTH * 0.8, marginLeft: DEVICE_WIDTH * 0.1, marginTop: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ color: '#808080', fontSize: 12 }}>{"ETHNICITY"}</Text>
            </View>
            <View>
              <Dropdown
                containerStyle={{ width: "100%", marginTop: -15 }}
                label=' '
                style={{ color: '#808080', fontSize: 10 }}
                inputContainerStyle={{ borderBottomColor: '#808080', }}
                baseColor="#DE5859"//indicator color
                textColor="#000"
                data={this.state.cityData}
                onChangeText={(city) => this.setState({ city, disabled: false })}
                value={this.state.city}
                dropdownPosition={-4}
              />
            </View>
          </View>
          <View style={{ width: DEVICE_WIDTH * 0.8, marginLeft: DEVICE_WIDTH * 0.1, marginTop: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ color: '#808080', fontSize: 12 }}>{"COUNTRY"}</Text>
            </View>
            <View>
              <Dropdown
                containerStyle={{ width: "100%", marginTop: -15 }}
                label=' '
                pickerStyle={{ marginTop: -50, }}
                style={{ color: '#808080', fontSize: 10 }}
                inputContainerStyle={{ borderBottomColor: '#808080', }}
                baseColor="#DE5859"//indicator color
                textColor="#000"
                data={this.state.countryData}
                onChangeText={(country) => this.setState({ country, disabled: false })}
                value={this.state.country}
                dropdownPosition={-4}
              />
            </View>
          </View>
          <View style={{ width: DEVICE_WIDTH * 0.8, marginLeft: DEVICE_WIDTH * 0.1, marginTop: 10, flexDirection: 'row', justifyContent: 'center' }} >
            {/* <View /> */}
            {/* <TouchableOpacity style={{ width: 180, height: 30, backgroundColor: '#DE5859', alignItems: 'center', justifyContent: 'center', borderRadius: 5 }}
              onPress={() => this.onUpdate()}>
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>{"Update"}</Text>
            </TouchableOpacity> */}
            <Button
              title="Save Changes"
              buttonStyle={{ backgroundColor: '#DE5859', alignItems: 'center', justifyContent: 'center', borderRadius: 5, padding: 10 }}
              loading={this.state.isLoading}
              onPress={() => this.onUpdate()}
              disabled={this.state.disabled}
            />
          </View>
          <TouchableOpacity style={{ width: DEVICE_WIDTH * 0.8, marginLeft: DEVICE_WIDTH * 0.1, marginTop: 30, }}>
            <Text style={{ fontSize: 16, fontWeight: 'bold' }}>
              <Text style={{ fontSize: 16, fontWeight: 'bold' }} onPress={ ()=>{ Linking.openURL('https://dazzleddate.com/terms_and_conditions.html')}}>{"Term and Conditions / "}</Text>
              <Text style={{ fontSize: 16, fontWeight: 'bold' }} onPress={ ()=>{ Linking.openURL('https://dazzleddate.com/privacy_policy.html')}}>{"Privacy Policy"}</Text>
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={{ width: DEVICE_WIDTH * 0.8, marginLeft: DEVICE_WIDTH * 0.1, marginTop: 15, }}
            onPress={() =>  this.onDeactivateAccount() }>
            <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{ "Deactivate My Account" }</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{ width: DEVICE_WIDTH * 0.8, marginLeft: DEVICE_WIDTH * 0.1, marginTop: 15, }}
            onPress={() => this.onCloseAccout()}>
            <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{"Close My Account"}</Text>
          </TouchableOpacity>
          {/* <TouchableOpacity style={{ width: DEVICE_WIDTH * 0.8, marginLeft: DEVICE_WIDTH * 0.1, marginTop: 15, }}
            onPress={() => this.onLogout()}>
            <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{"Log Out"}</Text>
          </TouchableOpacity> */}
          <View style={{  width: DEVICE_WIDTH * 0.8, marginLeft: DEVICE_WIDTH * 0.1, marginTop: 15, marginBottom: 20, }}>            
            <Text>For support, please contact us  at admin@dazzleddate.com for any issues, questions or feedback.</Text>
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
  },
  instructions: {
    textAlign: 'center',
    color: '#3333ff',
    marginBottom: 5,
  },
});
export default ProfileSetting;
