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
    Alert
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
    }

    // componentWillReceiveProps(nextProps) {
    //     if (nextProps.navigation.state.params.ids){
    //         let operatedIds = nextProps.navigation.state.params.ids;
    //         if (operatedIds.length) {                
    //             let oldData = this.state.discoveredList;
    //             let filterIndexArr = [];
    //             for (var i=0; i < operatedIds.length; i ++) {
    //                 for (var j=0; j < oldData.length; j ++) {
    //                     let item = oldData[j];
    //                     if (item.detail.id === operatedIds[i]) {
    //                         filterIndexArr.push(j);
    //                         break;
    //                     }
    //                 }
    //             }
    //             var filteredNewData = [];
    //             alert(JSON.stringify(filterIndexArr));
    //             for (var i in filterIndexArr) {
    //                 alert(JSON.stringify(i));
    //                 filteredNewData = oldData.filter((item, index) => parseInt(i) !== index)
    //             }
    //             this.setState({
    //                 discoveredList: filteredNewData
    //             });
    //         }
    //     }
    // }

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
                    this.setState({ isLoading: false, error: 'Something just went wrong' });
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
                    this.setState({ isRefreshing: false, error: 'Something just went wrong' })
                    return
                });
        });
    }

    getUserAvatar = async (data) => {
        let listData = [];
        for (var i = 0; i < data.length; i++) {
            if (data[i].cdn_id) {
                listData.push({
                    index: i,
                    imageUrl: GCS_BUCKET + data[i].cdn_id + '-screenshot',
                    // videoUrl: vurl,
                    detail: data[i]
                });
            } else {
                listData.push({
                    index: i,
                    imageUrl: null,
                    // videoUrl: vurl,
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

    // getUserAvatar = async (data) => {
    //     let listData = [];
    //     for (var i = 0; i < data.length; i++) {
    //         if (data[i].cdn_id) {
    //             var url = `${SERVER_URL}/api/storage/videoLink?fileId=${data[i].cdn_id}-screenshot`;
    //             // var vurl = `${SERVER_URL}/api/storage/videoLink?fileId=${data[i].cdn_id}`;
    //             await fetch(url, {
    //                 method: 'GET',
    //                 headers: {
    //                     'Content-Type': 'application/json',
    //                     'Authorization': Global.saveData.token
    //                 }
    //             }).then((response) => response.json())
    //                 .then((responseJson) => {
    //                     listData.push({
    //                         index: i,
    //                         imageUrl: responseJson.url,
    //                         // videoUrl: vurl,
    //                         detail: data[i]
    //                     });
    //                 })
    //                 .catch((error) => {
    //                     alert(JSON.stringify(error))
    //                     return
    //                 });
    //         } else {
    //             listData.push({
    //                 index: i,
    //                 imageUrl: null,
    //                 // videoUrl: vurl,
    //                 detail: data[i]
    //             });
    //         }
    //     }
    //     let oldData = this.state.discoveredList;
    //     let updatedList = oldData.concat(listData);
    //     this.setState({
    //         discoveredList: updatedList,
    //         noUser: false,
    //         isLoading: false,
    //         isRefreshing: false
    //     });
    // }

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

    render() {
        return (
            <View style={styles.contentContainer}>
                <StatusBar translucent={true} backgroundColor='transparent' barStyle='dark-content' />
                <View style={{ flexDirection: 'row', marginTop: 40, alignItems: 'center', justifyContent: 'space-between' }}>
                    <TouchableOpacity style={{ width: 80, height: 40 }}
                        onPress={() => this.gotoShop()}>
                        <View style={{ flexDirection: 'row' }}>
                            <Image source={diamond} style={{ width: 25, height: 25, marginLeft: 15, marginTop: 10 }} />
                            <Text style={{ marginLeft: 10, color: '#000', fontSize: 12, fontWeight: 'bold', marginTop: 15 }}>{this.state.coinCount}</Text>
                        </View>
                    </TouchableOpacity>
                    <Text style={{ justifyContent: 'center', marginLeft: -40 }}>{"BROWSE"}</Text>
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
                <ScrollView style={{ marginTop: 15 }} removeClippedSubviews={true}
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
                                            <Text style={{
                                                fontSize: 16,
                                                alignItems: 'center',
                                                color: '#000',
                                                fontWeight: 'bold',
                                                marginRight: 10
                                            }}>
                                                {item.detail.name}
                                            </Text>
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
                    </FooterTab>
                </Footer>
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
