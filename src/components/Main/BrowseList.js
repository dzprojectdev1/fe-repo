import React, { Component } from "react";
import {
    Footer,
    Button,
    FooterTab,
    Text,
} from "native-base";
import {
    AsyncStorage,
    ActivityIndicator,
    BackHandler,
    Image,
    ScrollView,
    Platform,
    Dimensions,
    // TextInput,
    View,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    StatusBar,
    Alert,
    ImageBackground, 
} from "react-native";
import { Badge } from 'react-native-elements'
import { connect } from 'react-redux';
import { SERVER_URL, GCS_BUCKET } from '../../config/constants';
// import OnlyGImage from '../../assets/images/OnlyGImage.png';
import hiddenMan from '../../assets/images/hidden_man.png';
import b_browse from '../../assets/images/browse.png';
import b_filters from '../../assets/images/filters.png';
import b_incoming from '../../assets/images/incoming.png';
import b_match from '../../assets/images/match.png';
import b_chat from '../../assets/images/chat.png';
import b_myvideo from '../../assets/images/myvideo.png';
import diamond from '../../assets/images/red_diamond_trans.png';
import bg from '../../assets/images/bg.jpg';
import yellow_star from '../../assets/images/yellow_star.png';
import Global from '../Global';

class BrowserList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            discoveredList: [],
            pageNum: 0,
            countPerPage: 10,
            isLoading: true,
            isRefreshing: false,
            noUser: false,
            coinCount: Global.saveData.coin_count,
            fanCount: Global.saveData.fan_count,
            visible: false,
        };
    }

    static navigationOptions = {
        header: null
    };

    componentWillMount() {
        Global.saveData.nowPage = 'BrowseList';
        Global.saveData.prePage = 'BrowseList';
        BackHandler.addEventListener('hardwareBackPress', this.backPressed);
    }

    componentDidMount() {
        this.fetchUsers();

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
                Global.saveData.fan_count = responseJson.data.fan_count;
                this.setState({
                    coinCount: Global.saveData.coin_count,
                    fanCount: Global.saveData.fan_count,
                });
              }
            })
            .catch((error) => {
              return
            });
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.backPressed);
    }

    backPressed = () => {
        Alert.alert(
            '',
            'Do you want to exit the app?',
            [
                { text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
                { text: 'Yes', onPress: () => BackHandler.exitApp() },
            ],
            { cancelable: false });
        return true;
    }

    onSearch = (searchKey) => {

    }

    fetchUsers = () => {
        AsyncStorage.getItem('filterData', (err, result) => {
            const { countPerPage, pageNum } = this.state;
            var details = {
                count: countPerPage,
                offset: pageNum * countPerPage
            };
            if (result !== null) {
                let filterStore = JSON.parse(result);
                details = {
                    count: countPerPage,
                    offset: pageNum * countPerPage,
                    gender: filterStore.gender,
                    lessAge: filterStore.toAge,
                    greaterAge: filterStore.fromAge,
                };
                if (filterStore.distance) {
                    details.distance = filterStore.distance;
                }
                if (filterStore.city_index) {
                    details.ethnicityId = filterStore.city_index;
                }
                if (filterStore.language_index) {
                    details.languageId = filterStore.language_index;
                }
                if (filterStore.country_index) {
                    details.countryId = filterStore.country_index;
                }
            };
            var formBody = [];
            for (var property in details) {
                var encodedKey = encodeURIComponent(property);
                var encodedValue = encodeURIComponent(details[property]);
                formBody.push(encodedKey + "=" + encodedValue);
            }
            formBody = formBody.join("&");
            fetch(`${SERVER_URL}/api/match/getAllDiscovers`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': Global.saveData.token
                },
                body: formBody,
            }).then((response) => response.json())
                .then((responseJson) => {
                    if (!responseJson.error) {
                        if (responseJson.data) {
                            let newData = responseJson.data;
                            this.getUserAvatar(newData);
                        } else {
                            this.setState({
                                noUser: true,
                                isLoading: false
                            });
                        }
                    }
                })
                .catch((error) => {
                    this.setState({ isLoading: false, error: 'Something just went wrong.' });
                    return
                });
        });
    }

    onRefresh() {
        this.setState({ isRefreshing: true, pageNum: 0 }); // true isRefreshing flag for enable pull to refresh indicator 
        AsyncStorage.getItem('filterData', (err, result) => {
            const { countPerPage, pageNum } = this.state;
            var details = {
                count: countPerPage,
                offset: 0
            };
            if (result !== null) {
                let filterStore = JSON.parse(result);
                details = {
                    count: countPerPage,
                    offset: 0,
                    gender: filterStore.gender,
                    lessAge: filterStore.toAge,
                    greaterAge: filterStore.fromAge,
                };
                if (filterStore.distance) {
                    details.distance = filterStore.distance;
                }
                if (filterStore.city_index) {
                    details.ethnicityId = filterStore.city_index;
                }
                if (filterStore.language_index) {
                    details.languageId = filterStore.language_index;
                }
                if (filterStore.country_index) {
                    details.countryId = filterStore.country_index;
                }
            };
            var formBody = [];
            for (var property in details) {
                var encodedKey = encodeURIComponent(property);
                var encodedValue = encodeURIComponent(details[property]);
                formBody.push(encodedKey + "=" + encodedValue);
            }
            formBody = formBody.join("&");
            fetch(`${SERVER_URL}/api/match/getAllDiscovers`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': Global.saveData.token
                },
                body: formBody,
            }).then((response) => response.json())
                .then((responseJson) => {
                    if (!responseJson.error) {
                        if (responseJson.data) {
                            let newData = responseJson.data;
                            let that = this;
                            this.setState({ discoveredList: [], isRefreshing: true }, function () {
                                that.getUserAvatar(newData);
                            });
                        } else {
                            this.setState({
                                noUser: true,
                                isLoading: false,
                                isRefreshing: false
                            });
                        }
                    }
                })
                .catch((error) => {
                    this.setState({ isRefreshing: false, error: 'Something just went wrong.' })
                    return
                });
        });
    }

    getUserAvatar = async (data) => {
        let listData = [];
        for (var i = 0; i < data.length; i++) {
            if (data[i].cdn_id && data[i].content_type == 1) {
                listData.push({
                    index: i,
                    imageUrl: GCS_BUCKET + data[i].cdn_id + '-screenshot',
                    videoUrl: null,
                    detail: data[i]
                });
            } else if (data[i].cdn_id && data[i].content_type == 2) {

                var v_url = `${SERVER_URL}/api/storage/videoLink?fileId=` + data[i].cdn_id;
                await fetch(v_url, {
                    method: 'GET',
                    headers: { 
                        'Content-Type':'application/json',
                        'Authorization':Global.saveData.token
                    }
                }).then((response) => response.json())
                    .then((responseJson) => {
                        listData.push({
                            index: i,
                            imageUrl: null,
                            videoUrl: responseJson.url,
                            detail: data[i]
                        });
                    })
                    .catch((error) => {
                        alert("There is error, please try again!")
                        return
                });
            } else {
                listData.push({
                    index: i,
                    imageUrl: null,
                    videoUrl: null,
                    detail: data[i]
                });
            }
        }
        let oldData = this.state.discoveredList;
        let updatedList = oldData.concat(listData);
        this.setState({
            discoveredList: updatedList,
            noUser: false,
            isLoading: false,
            isRefreshing: false
        });
    }

    renderSeparator = () => {
        return (
            <View
                style={{
                    // justifyContent: 'center',
                    // alignSelf: 'center',
                    // height: 1,
                    // width: '90%',
                    // backgroundColor: '#CED0CE',
                }}
            />
        );
    };

    _renderLoadMore() {
        if (!this.state.isLoading) return null;
        return (
            <ActivityIndicator style={{ color: '#000' }} />
        );
    }

    _onScroll(event) {
        if (this.state.isLoading) {
            return;
        }
        let y = event.nativeEvent.contentOffset.y;
        let height = event.nativeEvent.layoutMeasurement.height;
        let contentHeight = event.nativeEvent.contentSize.height;
        if (y + height >= contentHeight - 20) {
            let that = this;
            if (!this.state.noUser) {
                this.setState({
                    isLoading: true,
                    pageNum: this.state.pageNum + 1
                }, function () {
                    that.fetchUsers();
                });
            }
        }
    }

    onEndReached = () => {
        // this._renderLoadMore();
    }

    gotoDetail = (item) => {
        this.props.navigation.replace("Browse", { data: item });
    }

    gotoShop = () => {
        this.setState({
            visible: false
        })
        this.props.navigation.navigate('screenGpay01');
    }

    gotoMainMenu = (menu) => {
        this.updateLastLoggedInDate();
        this.props.navigation.replace(menu);
    }

    updateLastLoggedInDate = () => {
        fetch(`${SERVER_URL}/api/match/updateLastLoggedInDate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': Global.saveData.token
            },
        }).then((response) => response.json())
            .then((responseJson) => {
                if (!responseJson.error) {
                    return
                }
            })
            .catch((error) => {
                return
            });
    }

    gotoMyFans = () => {
        this.props.navigation.replace("MyFans");
    }

    render() {
        return (
            <ImageBackground source={bg} style={{width: '100%', height: '100%'}}>
            {/* <View style={styles.contentContainer}> */}
                <StatusBar translucent={true} backgroundColor='transparent' barStyle='dark-content' />
                <View style={{ flexDirection: 'row', marginTop: 40, alignItems: 'center', justifyContent: 'space-between' }}>
                    <View style={{width: 100, flexDirection: 'row',}}>
                        <TouchableOpacity style={{ width: 80, height: 40 }}
                            onPress={() => this.gotoShop()}>
                            <View style={{ flexDirection: 'row' }}>
                                <Image source={diamond} style={{ width: 25, height: 25, marginLeft: 15, marginTop: 10 }} />
                                <Text style={{ marginLeft: 10, color: '#000', fontSize: 12, fontWeight: 'bold', marginTop: 15 }}>{this.state.coinCount}</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity style={{ width: 50, height: 40 }}
                            onPress={() => this.gotoMyFans()}>
                            <View style={{ flexDirection: 'row' }}>
                                <Image source={yellow_star} style={{ width: 20, height: 20, marginLeft: 15, marginTop: 12 }} />
                                <Text style={{ marginLeft: 7, color: '#000', fontSize: 12, fontWeight: 'bold', marginTop: 14 }}>{this.state.fanCount}</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                    <Text style={{ justifyContent: 'center', marginLeft: -50 }}>{"BROWSE"}</Text>
                    <TouchableOpacity style={{ width: 25, height: 25, borderWidth: 1.5, borderRadius: 7, borderColor: '#B64F54', alignItems: 'center', justifyContent: "flex-end", marginRight: 15 }}
                        onPress={() => this.props.navigation.navigate("Filter")}>
                        <Image source={b_filters} style={{ width: 20, height: 20 }} />
                    </TouchableOpacity>
                </View>
                {this.state.discoveredList.length === 0 && !this.state.isLoading && !this.state.isRefreshing && (
                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                        <Text> Sorry, we cannot find anyone you want!</Text>
                        <Text> Please edit your match condition on here.</Text>
                        <TouchableOpacity style={{ borderRadius: 5, backgroundColor: '#B64F54', alignItems: 'center', justifyContent: 'center', padding: 10, marginTop: 10 }}
                            onPress={() => this.props.navigation.navigate("Filter")}>
                            <Text style={{ color: '#fff' }}>Edit Condition</Text>
                        </TouchableOpacity>
                    </View>
                )}
                <ScrollView style={{ marginTop: 15, backgroundColor: '#FFF', }} removeClippedSubviews={true}
                    refreshControl={
                        <RefreshControl
                            refreshing={this.state.isRefreshing}
                            onRefresh={this.onRefresh.bind(this)}
                        />
                    }
                    scrollEventThrottle={50}
                    onScroll={this._onScroll.bind(this)}>
                    {(this.state.discoveredList.length !== 0) && (
                        <FlatList
                            data={this.state.discoveredList}
                            extraData={this.state}
                            renderItem={({ item }) => (
                                <TouchableOpacity style={{ width: DEVICE_WIDTH - 10, flexDirection: 'row' }} onPress={() => this.gotoDetail(item)}>
                                    <View style={{
                                        flex: 1,
                                        flexDirection: 'row',
                                        paddingLeft: 15,
                                        paddingRight: 15,
                                        alignItems: 'center'
                                    }}>
                                        <Image source={item.imageUrl ? { uri: item.imageUrl } : hiddenMan}
                                            style={{
                                                height: 60,
                                                width: 60,
                                                borderRadius: 30,
                                            }} />
                                        <View style={{
                                            flex: 1,
                                            flexDirection: 'column',
                                            borderBottomColor: '#e8e8e8',
                                            borderBottomWidth: 0.5,
                                            padding: 15,
                                        }}>
                                            <View style={{
                                                flex: 1,
                                                flexDirection: 'row',
                                                justifyContent: 'flex-start'
                                            }}>
                                                <Text style={{
                                                    fontSize: 16,
                                                    alignItems: 'center',
                                                    color: '#000',
                                                    fontWeight: 'bold',
                                                    marginRight: 10
                                                }}>
                                                    {item.detail.name}
                                                </Text>
                                                <Image source={diamond} style={{ width: 15, height: 15, marginTop: 5, }} />
                                                <Text style={{
                                                    fontSize: 14,
                                                    alignItems: 'center',
                                                    color: '#000',
                                                    fontWeight: 'normal',
                                                    marginRight: 10,
                                                    marginTop: 2,
                                                }}>
                                                    {item.detail.coin_count}
                                                </Text>
                                                <Image source={yellow_star} style={{ width: 15, height: 15, marginTop: 4, }} />
                                                <Text style={{
                                                    fontSize: 14,
                                                    alignItems: 'center',
                                                    color: '#000',
                                                    fontWeight: 'normal',
                                                    marginRight: 10,
                                                    marginTop: 2,
                                                }}>
                                                    {item.detail.fan_count}
                                                </Text>
                                                <Image source={diamond} style={{ width: 15, height: 15, marginTop: 5, }} />
                                                <Text style={{
                                                    fontSize: 14,
                                                    alignItems: 'center',
                                                    color: '#000',
                                                    fontWeight: 'normal',
                                                    marginRight: 10,
                                                    marginTop: 2,
                                                }}>
                                                    {item.detail.coin_per_message + '/msg'}
                                                </Text>
                                            </View>
                                            <Text style={{
                                                fontSize: 12,
                                                color: '#7d7d7d',
                                            }}>
                                                {(item.detail.gender === 1 ? 'Male , ' : 'Female , ') + (item.detail.age + ' years old, ') + ((parseInt(item.detail.distance) != 0 ? parseInt(item.detail.distance) : 'unknown') + ' miles away ')}
                                            </Text>
                                            <Text style={{
                                                fontSize: 12,
                                                color: '#7d7d7d',
                                            }}>
                                                {(item.detail.language_name + ', ' + item.detail.country_name + ', ' + item.detail.ethnicity_name)}
                                            </Text>
                                            <View style={{
                                                flex: 1,
                                                flexDirection: 'row',
                                                justifyContent: 'space-between'
                                            }}>
                                                <Text style={{
                                                    justifyContent: 'flex-start',
                                                    fontSize: 13,
                                                    fontStyle: 'italic',
                                                    alignItems: 'center',
                                                    color: '#7d7d7d',
                                                    width: '80%',
                                                    flexWrap: 'nowrap',
                                                }} ellipsizeMode={'tail'} numberOfLines={1}>
                                                    {item.detail.description ? item.detail.description : 'No Introduction'}
                                                </Text>
                                                <View>
                                                    <Text style={{
                                                        justifyContent: 'flex-end',
                                                        fontSize: 12,
                                                        alignItems: 'center',
                                                        color: '#7d7d7d',
                                                    }}>
                                                        {item.detail.last_loggedin_date}
                                                    </Text>
                                                </View>
                                            </View>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            )}
                            keyExtractor={(item, index) => index.toString()}
                            ItemSeparatorComponent={this.renderSeparator}
                            // ListFooterComponent={this.renderFooter.bind(this)}
                            onEndReachedThreshold={2.5}
                            onEndReached={this.onEndReached}
                        />)}
                    {this._renderLoadMore()}
                    <View style={{ height: 50 }} />
                </ScrollView>

                {/* <View style={styles.inputwrapper}> */}
                {/* <TextInput
                        style={{ marginLeft: 10, fontSize: 16, width: DEVICE_WIDTH - 60, color: '#000', overflow: 'hidden'}}
                        value={this.state.searchText}
                        placeholder={"search"}
                        onChangeText={text => this.onSearch(text)}
                        placeholderTextColor="#808080"
                        underlineColorAndroid="transparent"
                    /> */}
                {/* <View></View> */}
                {/* <TouchableOpacity style={{ width: 35, height: 35, borderWidth: 1.5, borderRadius: 7, borderColor: '#B64F54', alignItems: 'center', justifyContent: 'center', marginRight: 15 }}
                        onPress={() => this.props.navigation.replace("Filter")}>
                        <Image source={b_filters} style={{ width: 25, height: 25 }} />
                    </TouchableOpacity> */}
                {/* </View> */}
                <Footer style={{height: Platform.select({ 'android': 50, 'ios': 50 }) }}>
                    <FooterTab>
                        <Button badge style={{ backgroundColor: '#222F3F', borderRadius: 0, }} transparent >
                            <Image source={b_browse} style={{ width: 25, height: 25, tintColor: '#B64F54' }} />
                            <Text style={{ color: '#B64F54', fontSize: 6, fontWeight: 'bold', marginTop: 3}}>{"BROWSE"}</Text>
                        </Button>
                        <Button badge style={{ backgroundColor: '#222F3F', borderRadius: 0, margin: 0, padding: 0 }} transparent onPress={() => this.gotoMainMenu("Income") }>
                            <Image source={b_incoming} style={{ width: 25, height: 25 }} />
                            <Text style={{ color: '#fff', fontSize: 6, fontWeight: 'bold', marginTop: 3}}>{"INCOMING"}</Text>
                        </Button>
                        <Button badge style={{ backgroundColor: '#222F3F', borderRadius: 0, }} transparent onPress={() => this.gotoMainMenu("Match") }>
                            <Image source={b_match} style={{ width: 25, height: 25 }} />
                            <Text style={{ color: '#fff', fontSize: 6, fontWeight: 'bold', marginTop:3 }}>{"MATCH"}</Text>
                        </Button>
                        <Button badge style={{ backgroundColor: '#222F3F', borderRadius: 0, }} transparent onPress={() => this.gotoMainMenu("Chat") }>
                            {this.props.unreadFlag && (<View style={styles.badgeIcon}><Text style={{color: '#fff', textAlign: 'center', fontSize: 10, }}>{'N'}</Text></View>)}
                            <Image source={b_chat} style={{ width: 25, height: 25 }} />
                            <Text style={{ color: '#fff', fontSize: 6, fontWeight: 'bold', marginTop: 3 }}>{"CHAT"}</Text>
                        </Button>
                        <Button badge style={{ backgroundColor: '#222F3F', borderRadius: 0, }} transparent onPress={() => this.gotoMainMenu("MyVideo") }>
                            <Image source={b_myvideo} style={{ width: 25, height: 25 }} />
                            <Text style={{ color: '#fff', fontSize: 6, fontWeight: 'bold', marginTop: 3 }}>{"PROFILE"}</Text>
                        </Button>
                        {/* <Button badge style={{ backgroundColor: '#222F3F', borderRadius: 0, }} transparent onPress={() => this.gotoMainMenu("VoiceCall") }>
                            <Image source={b_incoming} style={{ width: 25, height: 25 }} />
                            <Text style={{ color: '#fff', fontSize: 6, fontWeight: 'bold', marginTop: 3 }}>{"VOICE"}</Text>
                        </Button> */}
                    </FooterTab>
                </Footer>
            {/* </View> */}
            </ImageBackground>
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
    inputwrapper: {
        backgroundColor: '#fff',
        flexDirection: 'row',
        justifyContent: 'space-between',
        height: 40,
        marginLeft: 10,
        width: DEVICE_WIDTH - 10,
        // borderRadius: 30,
        // borderWidth: 1,
        // borderColor: '#f00',
        fontSize: 18,
        color: '#000',
    },
    badgeIcon: {
        position: 'absolute',
        zIndex: 1000,
        top: -5,
        right: 15,
        width: 20,
        height: 20,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#B64F54'
    }
});

const mapStateToProps = (state) => {
    const { unreadFlag } = state.reducer
    return { unreadFlag }
};

export default connect(mapStateToProps)(BrowserList);
