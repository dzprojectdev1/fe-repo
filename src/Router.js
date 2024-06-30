import * as React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator, TransitionPresets} from '@react-navigation/stack';
import {enableScreens} from 'react-native-screens';
// Import your screens
import FirstScreen from './components/FirstScreen';
import Login from './components/Auths/Login';
import Signup from './components/Auths/Signup';
import Register1 from './components/Auths/Register1';
import Register2 from './components/Auths/Register2';
import EmailConfirm from './components/Auths/EmailConfirm';
import Record from './components/Main/Record';
import BrowseList from './components/Main/BrowseList';
import Browse from './components/Main/Browse';
import Filter from './components/Main/Filter';
import Income from './components/Main/Income';
import IncomeDetail from './components/Main/IncomeDetail';
import Match from './components/Main/Match';
import Chat from './components/Main/Chat';
import MyVideo from './components/Main/MyVideo';
import MyVideoDetail from './components/Main/MyVideoDetail';
import Profile from './components/Main/Profile';
import ProfileDetail from './components/Main/ProfileDetail';
import ProfileSetting from './components/Main/ProfileSetting';
import TermsPolicy from './components/Main/TermsPolicy';
import Report from './components/Main/Report';
import CallIncome from './components/Main/CallIncome';
import CallOutgo from './components/Main/CallOutgo';
import CallIn from './components/Main/CallIn';
import MyFans from './components/Main/MyFans';
import ExchangeDiamonds from './components/Main/ExchangeDiamonds';
import ChatScreen from './components/Main/ChatScreen';
import VideoCall from './components/Main/VideoCall';
import VideoCallIncome from './components/Main/VideoCallIncome';
import VoiceCall from './components/Main/VoiceCall';
import VoiceCallIncome from './components/Main/VoiceCallIncome';
import ScreenGpay01 from './components/GPay/ScreenGpay01';

enableScreens(true);
const Stack = createStackNavigator();

const Router = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="FirstScreen"
        screenOptions={{
          headerShown: false, // This will hide the header
          ...TransitionPresets.FadeFromBottomAndroid, // This can be used to manage transition animations
          transitionSpec: {
            open: {animation: 'timing', config: {duration: 0}},
            close: {animation: 'timing', config: {duration: 0}},
          },
        }}>
        <Stack.Screen name="FirstScreen" component={FirstScreen} />
        <Stack.Screen name="Signup" component={Signup} />
        <Stack.Screen name="Register1" component={Register1} />
        <Stack.Screen name="Register2" component={Register2} />
        <Stack.Screen name="BrowseList" component={BrowseList} />
        <Stack.Screen name="Browse" component={Browse} />
        <Stack.Screen name="MyFans" component={MyFans} />
        <Stack.Screen name="Filter" component={Filter} />
        <Stack.Screen name="Income" component={Income} />
        <Stack.Screen name="Match" component={Match} />
        <Stack.Screen name="Chat" component={Chat} />
        <Stack.Screen name="MyVideo" component={MyVideo} />
        <Stack.Screen name="Profile" component={Profile} />
        <Stack.Screen name="ProfileSetting" component={ProfileSetting} />
        <Stack.Screen name="MyVideoDetail" component={MyVideoDetail} />
        <Stack.Screen name="Report" component={Report} />
        <Stack.Screen name="IncomeDetail" component={IncomeDetail} />
        <Stack.Screen name="ProfileDetail" component={ProfileDetail} />
        <Stack.Screen name="ChatDetail" component={ChatScreen} />
        <Stack.Screen name="Record" component={Record} />
        <Stack.Screen name="TermsPolicy" component={TermsPolicy} />
        <Stack.Screen name="ExchangeDiamonds" component={ExchangeDiamonds} />
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="EmailConfirm" component={EmailConfirm} />

        <Stack.Screen name="CallIncome" component={CallIncome} />
        <Stack.Screen name="CallOutgo" component={CallOutgo} />
        <Stack.Screen name="CallIn" component={CallIn} />
        <Stack.Screen name="VideoCall" component={VideoCall} />
        <Stack.Screen name="VoiceCall" component={VoiceCall} />
        <Stack.Screen name="VideoCallIncome" component={VideoCallIncome} />
        <Stack.Screen name="VoiceCallIncome" component={VoiceCallIncome} />

        <Stack.Screen name="ScreenGpay01" component={ScreenGpay01} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Router;

// import {createStackNavigator} from 'react-navigation';
// //FirstScreen
// import FirstScreen from './components/FirstScreen';
// //Auths
// import Login from './components/Auths/Login';
// import Signup from './components/Auths/Signup';
// import Register1 from './components/Auths/Register1';
// import Register2 from './components/Auths/Register2';
// import EmailConfirm from './components/Auths/EmailConfirm';
// //Main
// import Record from './components/Main/Record';
// import BrowseList from './components/Main/BrowseList';
// import Browse from './components/Main/Browse';
// import Filter from './components/Main/Filter';
// import Income from './components/Main/Income';
// import IncomeDetail from './components/Main/IncomeDetail';
// import Match from './components/Main/Match';
// import Chat from './components/Main/Chat';
// // import ChatDetail from './components/Main/ChatDetail';
// import MyVideo from './components/Main/MyVideo';
// import MyVideoDetail from './components/Main/MyVideoDetail';
// import Profile from './components/Main/Profile';
// import ProfileDetail from './components/Main/ProfileDetail';
// import ProfileSetting from './components/Main/ProfileSetting';
// import TermsPolicy from './components/Main/TermsPolicy';
// import Report from './components/Main/Report';
// import CallIncome from './components/Main/CallIncome';
// import CallOutgo from './components/Main/CallOutgo';
// import CallIn from './components/Main/CallIn';
// import MyFans from './components/Main/MyFans';
// import ExchangeDiamonds from './components/Main/ExchangeDiamonds';
// import ChatScreen from './components/Main/ChatScreen';
// import VideoCall from './components/Main/VideoCall';
// import VideoCallIncome from './components/Main/VideoCallIncome';
// import VoiceCall from './components/Main/VoiceCall';
// import VoiceCallIncome from './components/Main/VoiceCallIncome';
//
// // Google Pay
// import screenGpay01 from './components/GPay/screenGpay01';
//
// export default Router = createStackNavigator(
//   {
//     FirstScreen: {screen: FirstScreen},
//     //Main
//     Income: {screen: Income},
//     IncomeDetail: {screen: IncomeDetail},
//     Match: {screen: Match},
//     BrowseList: {screen: BrowseList},
//     Browse: {screen: Browse},
//     Record: {screen: Record},
//     Filter: {screen: Filter},
//     Chat: {screen: Chat},
//     // ChatDetail: { screen: ChatDetail },
//     ChatDetail: {screen: ChatScreen},
//     MyVideo: {screen: MyVideo},
//     MyVideoDetail: {screen: MyVideoDetail},
//     Report: {screen: Report},
//     Profile: {screen: Profile},
//     ProfileDetail: {screen: ProfileDetail},
//     ProfileSetting: {screen: ProfileSetting},
//     TermsPolicy: {screen: TermsPolicy},
//     MyFans: {screen: MyFans},
//     ExchangeDiamonds: {screen: ExchangeDiamonds},
//     //Auths
//     Login: {screen: Login},
//     Signup: {screen: Signup},
//     Register1: {screen: Register1},
//     Register2: {screen: Register2},
//     EmailConfirm: {screen: EmailConfirm},
//     //Gpay
//     screenGpay01: {screen: screenGpay01},
//     //Calling
//     CallIncome: {screen: CallIncome},
//     CallOutgo: {screen: CallOutgo},
//     CallIn: {screen: CallIn},
//     VideoCall: {screen: VideoCall},
//     VoiceCall: {screen: VoiceCall},
//     VideoCallIncome: {screen: VideoCallIncome},
//     VoiceCallIncome: {screen: VoiceCallIncome},
//   },
//   {
//     initialRouteName: 'FirstScreen',
//     transitionConfig: () => ({
//       transitionSpec: {
//         duration: 0,
//       },
//     }),
//     navigationOptions: {
//       header: null,
//     },
//   },
// );
