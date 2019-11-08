import React, { Component } from "react";
import {
  Text
} from "native-base"
import {
  ImageBackground,
  BackHandler,
  Image,
  Platform,
  Dimensions,
  ScrollView,
  View,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  AsyncStorage,
} from "react-native";
import logo from '../../assets/images/logo.png';
import slogo from '../../assets/images/second_bg.png';
import { Dropdown } from 'react-native-material-dropdown';
import { ButtonGroup } from 'react-native-elements';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import Global from '../Global';

import { SERVER_URL } from '../../config/constants';

class Filter extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedIndex: 0,
      fromage: 0,
      toage: 0,
      gender: 1,
      languageData: [],
      language: 'All',
      cityData: [],
      city: 'All',
      country: 'All',
      countryData: [],
      multiSliderValue: [18, 100],
      sliderOneValue: [2000],
      disable: true
    };
    this.updateIndex = this.updateIndex.bind(this)
  }

  static navigationOptions = {
    header: null
  };

  componentWillMount() {
    this.backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      this.onBack(); // works best when the goBack is async
      return true;
    });
    Global.saveData.nowPage = 'Filter';
    AsyncStorage.getItem('filterData', (err, result) => {
      if (result !== null) {
        let filterStore = JSON.parse(result);
        let sliderOneValue = [];
        let multiSliderValue = [];
        sliderOneValue.push(filterStore.distance ? filterStore.distance : 2000);
        multiSliderValue.push(filterStore.fromAge, filterStore.toAge);
        // alert(JSON.stringify(multiSliderValue));
        this.setState({
          selectedIndex: filterStore.gender - 1,
          multiSliderValue,
          sliderOneValue
        });
        this.getAllAssetData().then(() => {
          this.setState({
            city: this.state.cityData[filterStore.city_arr].value,
            country: this.state.countryData[filterStore.country_arr].value,
            language: this.state.languageData[filterStore.language_arr].value,
          });
        });
        // this.get_ethnicity().then(() => {
        //   this.setState({
        //     city: this.state.cityData[filterStore.city_index].value,
        //   })
        // });
        // this.get_country().then(() => {
        //   this.setState({
        //     country: this.state.countryData[filterStore.country_index].value
        //   })
        // });
        // this.get_language().then(() => {
        //   this.setState({
        //     language: this.state.languageData[filterStore.language_index].value,
        //   });
        // });
      } else {
        this.getAllAssetData();
        // this.get_ethnicity();
        // this.get_country();
        // this.get_language();
      };
    });
    this.setState({
      disable: false
    })
  }
  componentWillUnmount() {
    this.backHandler.remove();
  }

  getAllAssetData = async () => {
    await fetch(`${SERVER_URL}/api/user/getAllAssetData`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    }).then((response) => response.json())
      .then((responseJson) => {
        if (!responseJson.error) {
          let data = responseJson.data;
          
          let countries = data.country;
          let ethnicities = data.ethnicity;
          let languagies = data.language;

          let ethnicityData = [{ value: 'All' }];
          let countryData = [{ value: 'All' }];
          let languageData = [{ value: 'All' }];
          for (var i = 0; i < ethnicities.length; i++) {
            ethnicityData.push({ value: ethnicities[i].ethnicity_name, id: ethnicities[i].id });
          }
          this.setState({ cityData: ethnicityData,  });
          for (var i = 0; i < countries.length; i++) {
            countryData.push({ value: countries[i].country_name, id: countries[i].id });
          }
          this.setState({ countryData: countryData });
          for (var i = 0; i < languagies.length; i++) {
            languageData.push({ value: languagies[i].language_name, id: languagies[i].id });
          }
          this.setState({ languageData: languageData })
        }
      })
      .catch((error) => {
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
          var itmes = [{ value: 'All' }];
          for (var i = 0; i < data.length; i++) {
            itmes.push({ value: data[i].ethnicity_name, id: data[i].id });
          }
          this.setState({ cityData: itmes });
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
          var itmes = [{ value: 'All' }];
          for (var i = 0; i < data.length; i++) {
            itmes.push({ value: data[i].country_name, id: data[i].id })
          }
          this.setState({ countryData: itmes })
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
          var itmes = [{ value: 'All' }];
          for (var i = 0; i < data.length; i++) {
            itmes.push({ value: data[i].language_name, id: data[i].id })
          }
          this.setState({ languageData: itmes })
        }
      })
      .catch((error) => {
        alert(JSON.stringify(error))
        return
      });
  }

  enableScroll = () => this.setState({ scrollEnabled: true });
  disableScroll = () => this.setState({ scrollEnabled: false });
  updateIndex(selectedIndex) {
    this.setState({ selectedIndex })
  }

  multiSliderValuesChange = values => {
    this.setState({
      multiSliderValue: values,
    });
  };
  nonCollidingMultiSliderValuesChange = values => {
    this.setState({
      nonCollidingMultiSliderValue: values,
    });
  };
  sliderOneValuesChangeStart = () => {
    this.setState({
      sliderOneChanging: true,
    });
  };

  sliderOneValuesChange = values => {
    let newValues = [0];
    newValues[0] = values[0];
    this.setState({
      sliderOneValue: newValues,
    });
  };

  sliderOneValuesChangeFinish = () => {
    this.setState({
      sliderOneChanging: false,
    });
  };
  onApply() {
    let lanD = this.state.languageData
    let lanindex = 0;
    let lanArrIdx = 0;
    for (var i = 0; i < lanD.length; i++) {
      if (lanD[i].value === this.state.language && lanD[i].id) {
        lanindex = lanD[i].id;
        lanArrIdx = i;
        break;
      }
    }

    let cityD = this.state.cityData
    let cityindex = 0;
    let cityArrIdx = 0;
    for (var i = 0; i < cityD.length; i++) {
      if (cityD[i].value === this.state.city && cityD[i].id) {
        cityindex = cityD[i].id;
        cityArrIdx = i;
        break;
      }
    }

    let countryD = this.state.countryData
    let countryIndex = 0;
    let countryArrIdx = 0;
    for (var i = 0; i < countryD.length; i++) {
      if (countryD[i].value === this.state.country && countryD[i].id) {
        countryIndex = countryD[i].id,
        countryArrIdx = i;
        break;
      }
    }

    let filterData = {
      gender: this.state.selectedIndex + 1,
      fromAge: this.state.multiSliderValue[0],
      toAge: this.state.multiSliderValue[1],
      distance: (this.state.sliderOneValue[0] === 2000 || this.state.sliderOneValue[0] === 1999) ? null : this.state.sliderOneValue[0],
      language_index: lanindex,
      city_index: cityindex,
      country_index: countryIndex,
      language_arr: lanArrIdx,
      city_arr: cityArrIdx,
      country_arr: countryArrIdx
    };
    let that = this;
    this._storeData(filterData).then(() => {
      that.onBack();
    });
  }

  _storeData = async (data) => {
    try {
      await AsyncStorage.setItem('filterData', JSON.stringify(data));
    } catch (error) {
      // Error saving data
    }
  };

  onBack() {
    this.props.navigation.replace('BrowseList');
  }

  _storeClearData = async () => {
    try {
      await AsyncStorage.removeItem('filterData');
    } catch (error) {
      // Error saving data
    }
  }

  removeAllFilters() {
    let that = this;
    this._storeClearData().then(() => {
      that.onBack();
    });
  }
  render() {
    const buttons = ['MALE', 'FEMALE']
    return (
      <View style={styles.contentContainer}>
        <StatusBar backgroundColor='#fff' barStyle='dark-content' />
        <ImageBackground source={slogo} style={{ width: DEVICE_WIDTH, height: 150, marginTop: Platform.select({ 'android': 0, 'ios': 30 }), alignItems: 'center', justifyContent: 'center' }}>
          <Image source={logo} style={{ width: 205, height: 83, tintColor: '#DE5859' }} />
        </ImageBackground>
        <ScrollView scrollEnabled={this.state.scrollEnabled}>
          <View style={{ width: DEVICE_WIDTH, alignItems: 'center', justifyContent: 'center', marginTop: 50 }}>
            <Text style={{ fontWeight: 'bold', fontSize: 13 }}>{"MATCH OPTIONS"}</Text>
          </View>
          <View style={{ width: DEVICE_WIDTH * 0.8, marginLeft: DEVICE_WIDTH * 0.1, marginTop: 30 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ color: '#808080', fontSize: 12 }}>{"GENDER"}</Text>
            </View>
          </View>
          <View style={{ width: DEVICE_WIDTH, alignItems: 'center', justifyContent: 'center', marginTop: 5 }}>
            <ButtonGroup
              onPress={this.updateIndex}
              selectedIndex={this.state.selectedIndex}
              buttons={buttons}
              selectedButtonStyle={{ backgroundColor: '#DE5859', }}
              containerStyle={{ height: 40, width: DEVICE_WIDTH * 0.8, borderRadius: 20, borderColor: '#DE5859' }}
              selectedTextStyle={{ color: '#fff', fontSize: 14, }}
              textStyle={{ color: '#DE5859', fontSize: 14, }}
            />
          </View>
          <View style={{ width: DEVICE_WIDTH * 0.8, marginLeft: DEVICE_WIDTH * 0.1, marginTop: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={{ color: '#808080', fontSize: 12 }}>{"AGE"}</Text>
              <Text style={{ color: '#808080', fontSize: 12 }}>{this.state.multiSliderValue[0] + " - " + this.state.multiSliderValue[1]}</Text>
            </View>
            <View>
              <MultiSlider
                values={[
                  this.state.multiSliderValue[0],
                  this.state.multiSliderValue[1],
                ]}
                selectedStyle={{ backgroundColor: '#DE5859' }}
                trackStyle={{
                  height: 1,
                }}
                customMarker={() => {
                  return (<TouchableOpacity style={{ width: 20, height: 20, opacity: 0.7, borderRadius: 10, backgroundColor: '#DE5859', alignItems: 'center', justifyContent: 'center' }}>
                    <TouchableOpacity style={{ width: 5, height: 5, backgroundColor: '#f00', borderRadius: 2 }} />
                  </TouchableOpacity>)
                }}
                sliderLength={DEVICE_WIDTH * 0.8}
                onValuesChange={this.multiSliderValuesChange}
                min={18}
                max={100}
                step={1}
                allowOverlap
                snapped
              />
            </View>
          </View>
          <View style={{ width: DEVICE_WIDTH * 0.8, marginLeft: DEVICE_WIDTH * 0.1, marginTop: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={{ color: '#808080', fontSize: 12 }}>{"DISTANCE"}</Text>
              {(this.state.sliderOneValue[0] !== 2000 && this.state.sliderOneValue[0] !== 1999) &&
                <Text style={{ color: '#808080', fontSize: 12 }}>{"" + this.state.sliderOneValue + " mile"}</Text>}
              {(this.state.sliderOneValue[0] === 2000 || this.state.sliderOneValue[0] === 1999) &&
                <Text style={{ color: '#808080', fontSize: 12 }}>{"NO LIMIT"}</Text>}
            </View>
            <View>
              <MultiSlider
                values={this.state.sliderOneValue}
                sliderLength={DEVICE_WIDTH * 0.8}
                selectedStyle={{ backgroundColor: '#DE5859' }}
                trackStyle={{
                  height: 1,
                }}
                customMarker={() => {
                  return (<TouchableOpacity style={{ width: 20, height: 20, opacity: 0.7, borderRadius: 10, backgroundColor: '#DE5859', alignItems: 'center', justifyContent: 'center' }}>
                    <TouchableOpacity style={{ width: 5, height: 5, backgroundColor: '#f00', borderRadius: 1 }} />
                  </TouchableOpacity>
                  )
                }}
                min={0}
                max={2000}
                onValuesChangeStart={this.sliderOneValuesChangeStart}
                onValuesChange={this.sliderOneValuesChange}
                onValuesChangeFinish={this.sliderOneValuesChangeFinish}
              />
            </View>
          </View>
          <View style={{ width: DEVICE_WIDTH * 0.8, marginLeft: DEVICE_WIDTH * 0.1, marginTop: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ color: '#808080', fontSize: 12 }}>{"LANGUAGE"}</Text>
            </View>
            <View>
              <Dropdown
                containerStyle={{ width: "100%", marginTop: -15 }}
                label=' '
                style={{ color: '#808080', fontSize: 10 }}
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
                onChangeText={(city) => this.setState({ city })}
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
                onChangeText={(country) => this.setState({ country })}
                value={this.state.country}
                dropdownPosition={-4}
              />
            </View>
          </View>
          {/* <View style={{width:DEVICE_WIDTH*0.8,marginLeft:DEVICE_WIDTH*0.1, marginTop:10, flexDirection:'row', justifyContent:'space-between'}}>
             <View/>
             <TouchableOpacity style={{width:180, height:30, backgroundColor:'#DE5859', alignItems:'center', justifyContent:'center', borderRadius:5}}
              onPress={()=>this.removeAllFilters()}
             >
               <Text style={{color:'#fff'}}>{"Remove All Filters"}</Text>
             </TouchableOpacity>
          </View> */}
          <View style={{ width: DEVICE_WIDTH * 0.8, marginLeft: DEVICE_WIDTH * 0.1, height: 40, alignItems: 'center', justifyContent: 'center', marginTop: 20 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: 280 }}>              
              <TouchableOpacity style={{ width:80, height:40, alignItems:'center', justifyContent:'center', borderRadius:5}}
                onPress={()=>this.removeAllFilters()}
              >
                <Text style={{ color:'#DE5859', fontSize: 12, fontWeight: 'bold' }}>{"Clear All"}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{ width: 80, height: 40, borderRadius: 5, borderColor: '#DE5859', borderWidth: 1, alignItems: 'center', justifyContent: 'center' }}
                onPress={() => this.props.navigation.pop()}
              >
                <Text style={{ color: '#808080', fontSize: 12, fontWeight: 'bold' }}>{"CANCEL"}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{ width: 80, height: 40, borderRadius: 5, backgroundColor: '#DE5859', alignItems: 'center', justifyContent: 'center' }}
                onPress={() => this.onApply()} disabled={this.state.disable}
              >
                <Text style={{ color: '#fff', fontSize: 12, fontWeight: 'bold' }}>{"APPLY"}</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={{ height: 100 }} />
        </ScrollView>
      </View>
    );
  }
}
const DEVICE_WIDTH = Dimensions.get('window').width;
const DEVICE_HEIGHT = Dimensions.get('window').height;
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
export default Filter;
