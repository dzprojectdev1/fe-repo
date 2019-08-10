import React, { Component } from "react";
import {
  Text,
  Content
} from "native-base"
import { ImageBackground, Image, Platform, Dimensions, View, StyleSheet, TouchableOpacity, StatusBar } from "react-native";
import logo from '../../assets/images/logo.png';
import slogo from '../../assets/images/second_bg.png';
import { Dropdown } from 'react-native-material-dropdown';
import Global from '../Global';
class Register2 extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: '',
      email: '',
      password: '',
      fullname: '',
      birthday: '',
      gender: '',
      languageData: [],
      language: '',
      cityData: [],
      city: '',
      country: '',
      countryData: []
    };
  }

  static navigationOptions = {
    header: null
  };
  componentDidMount() {
    this.setState({
      name: this.props.navigation.state.params.name,
      email: this.props.navigation.state.params.email,
      password: this.props.navigation.state.params.password,
      fullname: this.props.navigation.state.params.fullname,
      birthday: this.props.navigation.state.params.birthday,
      gender: this.props.navigation.state.params.gender
    });
    this.get_ethnicity()
    this.get_country()
    this.get_language()
  }
  get_ethnicity() {
    fetch('http://138.197.203.178:8080/api/ethnicity/all', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    }).then((response) => response.json())
      .then((responseJson) => {
        //alert(JSON.stringify(responseJson))
        if (!responseJson.error) {
          var data = responseJson.data;
          var itmes = [];
          for (var i = 0; i < data.length; i++) {
            itmes.push({ value: data[i].ethnicity_name })
          }
          this.setState({ city: data[0].ethnicity_name, cityData: itmes })
        }
      })
      .catch((error) => {
        alert(JSON.stringify(error))
        return
      });
  }
  get_country() {
    fetch('http://138.197.203.178:8080/api/country/all', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
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
          this.setState({ country: data[0].country_name, countryData: itmes })
        }
      })
      .catch((error) => {
        alert(JSON.stringify(error))
        return
      });
  }

  get_language() {
    fetch('http://138.197.203.178:8080/api/language/all', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
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
          this.setState({ language: data[0].language_name, languageData: itmes })
        }
      })
      .catch((error) => {
        alert(JSON.stringify(error))
        return
      });
  }
  componentWillMount() {

  }
  onRegister() {
    var details = {
      'useremail': this.state.email,
      'userpassword': this.state.password,
      'usergender': this.state.gender,
      'userlanguage': 1,
      'country': 1,
      'ethnicity': 3,
      'birth_date': this.state.birthday,
      'username': this.state.name
    };

    var formBody = [];
    for (var property in details) {
      var encodedKey = encodeURIComponent(property);
      var encodedValue = encodeURIComponent(details[property]);
      formBody.push(encodedKey + "=" + encodedValue);
    }
    formBody = formBody.join("&");

    fetch('http://138.197.203.178:8080/api/user/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formBody,
    }).then((response) => response.json())
      .then((responseJson) => {
        if (!responseJson.error) {
          this.onLogin()
        }
      })
      .catch((error) => {
        return
      });
  }
  onLogin() {
    var details = {
      'useremail': this.state.email,
      'userpassword': this.state.password
    };

    var formBody = [];
    for (var property in details) {
      var encodedKey = encodeURIComponent(property);
      var encodedValue = encodeURIComponent(details[property]);
      formBody.push(encodedKey + "=" + encodedValue);
    }
    formBody = formBody.join("&");

    fetch('http://138.197.203.178:8080/api/user/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formBody,
    }).then((response) => response.json())
      .then((responseJson) => {
        if (!responseJson.error) {
          Global.token = responseJson.data.token;
          Global.u_id = responseJson.data.id
          Global.u_name = responseJson.data.name
          Global.u_age = responseJson.data.age
          Global.u_gender = responseJson.data.gender
          Global.u_email = responseJson.data.email
          Global.u_language = responseJson.data.language
          Global.u_city = responseJson.data.ethnicity
          Global.u_country = responseJson.data.country
          Global.newUser = false;
          this.props.navigation.navigate("EmailConfirm");
        }
      })
      .catch((error) => {
        alert(JSON.stringify(error))
        return
      });
  }
  render() {
    return (
      <View style={styles.contentContainer}>
        <StatusBar backgroundColor='#fff' barStyle='dark-content' />
        <ImageBackground source={slogo} style={{ width: DEVICE_WIDTH, height: 150, marginTop: Platform.select({ 'android': 0, 'ios': 30 }), alignItems: 'center', justifyContent: 'center' }}>
          <Image source={logo} style={{ width: 205, height: 83, tintColor: '#DE5859' }} />
        </ImageBackground>
        <Content>
          <View style={{ width: DEVICE_WIDTH * 0.8, marginLeft: DEVICE_WIDTH * 0.1, marginTop: 50 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ color: '#808080', fontSize: 12 }}>{"LANGUAGE"}</Text>
            </View>
            <View>
              <Dropdown
                containerStyle={{ width: "100%", marginTop: -15 }}
                label=' '
                style={{ color: 'black' }}
                inputContainerStyle={{ borderBottomColor: '#808080', }}
                baseColor="#DE5859"//indicator color
                textColor="#000"
                data={this.state.languageData}
                onChangeText={(language) => this.setState({ language })}
                value={this.state.language}
                dropdownPosition={-4}
              />
            </View>
          </View>

          <View style={{ width: DEVICE_WIDTH * 0.8, marginLeft: DEVICE_WIDTH * 0.1, marginTop: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ color: '#808080', fontSize: 12 }}>{"Ethnicity"}</Text>
            </View>
            <View>
              <Dropdown
                containerStyle={{ width: "100%", marginTop: -15 }}
                label=' '
                style={{ color: 'black' }}
                inputContainerStyle={{ borderBottomColor: '#808080', }}
                baseColor="#DE5859"//indicator color
                textColor="#000"
                data={this.state.cityData}
                onChangeText={(city) => this.setState({ city })}
                value={this.state.city}
                dropdownPosition={-4}
              />
            </View>
          </View>

          <View style={{ width: DEVICE_WIDTH * 0.8, marginLeft: DEVICE_WIDTH * 0.1, marginTop: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ color: '#808080', fontSize: 12 }}>{"COUNTRY"}</Text>
            </View>
            <View>
              <Dropdown
                containerStyle={{ width: "100%", marginTop: -15 }}
                label=' '
                style={{ color: 'black' }}
                inputContainerStyle={{ borderBottomColor: '#808080', }}
                baseColor="#DE5859"//indicator color
                textColor="#000"
                data={this.state.countryData}
                onChangeText={(country) => this.setState({ country })}
                value={this.state.country}
                dropdownPosition={-4}
              />
            </View>
          </View>
          <View style={{ width: DEVICE_WIDTH * 0.8, marginLeft: DEVICE_WIDTH * 0.1, alignItems: 'center', justifyContent: 'center', marginTop: 30 }}>
            <Text style={{ color: '#808080', fontSize: 12, textAlign: 'center' }}>{"BY GETTING SIGNING UP YOU ARE AFREE TO"}</Text>
            <Text style={{ color: '#808080', fontSize: 12, textAlign: 'center', marginTop: 10 }}>{"OUR TERMS OF SERVICE AND PRIVACY POLICY"}</Text>
          </View>
          <View style={{ width: DEVICE_WIDTH, height: 50, alignItems: 'center', justifyContent: 'center', marginTop: 30 }}>
            <TouchableOpacity style={{ width: DEVICE_WIDTH * 0.8, height: 40, borderRadius: 20, backgroundColor: '#DE5859', alignItems: 'center', justifyContent: 'center' }}
              onPress={() => this.onRegister()}
            >
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>{"REGISTER"}</Text>
            </TouchableOpacity>
          </View>
          <View style={{ height: 100 }} />
        </Content>
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
export default Register2;
