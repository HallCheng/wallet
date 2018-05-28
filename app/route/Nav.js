import React from 'react';
import { StackNavigator, TabNavigator } from 'react-navigation';
import { CameraRoll, Image, View, BackHandler, Text, Platform, DeviceEventEmitter, BackAndroid, AppState, Linking, Dimensions, ScrollView, Animated, Easing } from 'react-native';
import { redirect } from '../utils/Api'
import UColor from '../utils/Colors'
import UImage from '../utils/Img'
import Home from './Home'
import Coins from './Coins'
import News from './News'
import Settings from './Settings'
import Splash from './Splash'
import Web from '../route/Web'
import Coin from './Coins/Detail'
import Login from './Login'
import Forget from './Login/Forget'
import SignIn from './Login/SignIn'
import Add_assets from './Home/Add_assets'
import Info from './Home/Info'
import Thin from './Home/Thin'
import TurnOut from './Home/TurnOut'
import Share from './ShareInvite'
import CreateWallet from './Wallet/CreateWallet'
import BackupWords from './Wallet/BackupWords'
import BackupNote from './Wallet/BackupNote'
import InputWords from './Wallet/InputWords'
import ImportKey from './Wallet/ImportPrivateKey'
import WalletManage from './Wallet/WalletManage'
import WalletDetail from './Wallet/WalletDetail'
import ModifyPassword from './Wallet/ModifyPassword'
import ExportKeystore from './Wallet/ExportKeystore'
import ExportPrivateKey from './Wallet/ExportPrivateKey'
import BarCode from './Wallet/BarcodeTest'
// import AddressQr from './Wallet/AddressQr'
import { EasyToast } from "../components/Toast"
import { EasyDialog } from "../components/Dialog"
import { EasyAdress } from "../components/Address"
import Upgrade from 'react-native-upgrade-android';
import codePush from 'react-native-code-push'
var DeviceInfo = require('react-native-device-info');
import { connect } from 'react-redux'
import SplashScreen from 'react-native-splash-screen'
import Set from './Settings/Set'
import Boot from './Boot'
import moment from 'moment';
import Button from '../components/Button'
import ViewShot from "react-native-view-shot";
import QRCode from 'react-native-qrcode-svg';
import Constants from '../utils/Constants'
require('moment/locale/zh-cn');
var ScreenWidth = Dimensions.get('window').width;
var ScreenHeight = Dimensions.get('window').height;

var WeChat = require('react-native-wechat');

const TabContainer = TabNavigator(
  {
    Home: { screen: Home },
    Coins: { screen: Coins },
    News: { screen: News },
    Settings: { screen: Settings }
  },
  {
    navigationOptions: ({ navigation }) => ({
      tabBarIcon: ({ focused }) => {
        const { routeName } = navigation.state;
        let iconName;
        switch (routeName) {
          case 'Home':
            iconName = focused ? UImage.tab_1_h : UImage.tab_1
            break;
          case 'Coins':
            iconName = focused ? UImage.tab_2_h : UImage.tab_2
            break;
          case 'News':
            iconName = focused ? UImage.tab_3_h : UImage.tab_3
            break;
          case 'Settings':
            iconName = focused ? UImage.tab_4_h : UImage.tab_4
        }
        return (<Image source={iconName} style={{ width: 20, height: 20, padding: 0 }} />);
      },
    }),
    initialRouteName: "Coins",
    lazy: true,
    tabBarPosition: 'bottom',
    swipeEnabled: false,
    animationEnabled: false,
    tabBarOptions: {
      activeTintColor: UColor.tintColor,
      inactiveTintColor: "#6579a0",
      showIcon: true,
      showLabel: true,
      style: {
        height: 49,
        backgroundColor: UColor.secdColor,
        borderBottomWidth: 0,
      },
      labelStyle: {
        fontSize: 10,
        marginTop: 2
      },
      indicatorStyle: {
        opacity: 0
      },
      tabStyle: {
        padding: 0,
        margin: 0
      }
    }
  }
);

const Nav = StackNavigator(
  {
    Splash: {
      screen: Splash
    },
    Home: {
      screen: TabContainer,
      navigationOptions: {
        headerLeft: null,
        headerRight: null,
      }
    },
    Web: {
      screen: Web
    },
    Coin: {
      screen: Coin
    },
    CreateWallet: {
      screen: CreateWallet
    },
    BackupWords: {
      screen: BackupWords
    },
    BackupNote: {
      screen: BackupNote
    },
    ImportKey: {
      screen: ImportKey
    },
    WalletManage: {
      screen: WalletManage
    },
    WalletDetail: {
      screen: WalletDetail
    },
    InputWords: {
      screen: InputWords
    },
    ExportKeystore: {
      screen: ExportKeystore
    },
    ExportPrivateKey: {
      screen: ExportPrivateKey
    },
    ModifyPassword: {
      screen: ModifyPassword
    },
    BarCode: {
      screen : BarCode
    },
    // AddressQr: {
    //   screen : AddressQr
    // },
    Login: {
      screen: Login
    },
    SignIn: {
      screen: SignIn
    },
    Forget: {
      screen: Forget
    },
    Share: {
      screen: Share
    },
    Set: {
      screen: Set
    },
    Add_assets: {
      screen: Add_assets
    },
    Info: {
      screen: Info
    },
    Thin: {
      screen: Thin
    },
    TurnOut: {
      screen: TurnOut
    },
    Boot: {
      screen: Boot
    }
  },
  {
    navigationOptions: () => ({
      gesturesEnabled: true,
      headerTitleStyle: {
        fontWeight: 'normal',
        color: UColor.fontColor,
        fontSize: 18,
        alignSelf: 'center'
      },
      headerBackTitle: null,
      headerBackTitleStyle: {
        color: UColor.fontColor
      },
      headerTintColor: '#fff',
      headerStyle: {
        backgroundColor: UColor.secdColor,
        elevation: 0,
        shadowOpacity: 0,
        borderBottomWidth: 0,
        height: (Platform.OS == 'ios') ? 49 : 72,
        paddingTop: (Platform.OS == 'ios') ? 0 : 18
      },
      headerRight: (
        <View style={{ height: 44, width: 55, justifyContent: 'center', paddingRight: 15 }} />
      ),
      mode: 'card',
      headerMode: 'screen',
      cardStyle: { backgroundColor: "#fff" },
      transitionConfig: (() => ({
        screenInterpolator: CardStackStyleInterpolator.forHorizontal,
      })),
      onTransitionStart: (() => {
        console.log('页面跳转动画开始');
      }),
      onTransitionEnd: (() => {
        console.log('页面跳转动画结束');
      }),
    }),
  }
);

let routeLength = 0;

@connect(({ banner, newsType, common, login }) => ({ ...banner, ...newsType, ...common, ...login }))
class Route extends React.Component {

  state = {
    news: {},
    showShare: false,
    transformY: new Animated.Value(200),
    transformY1: new Animated.Value(-1000)
  }

  constructor(props) {
    super(props)
    //test
    WeChat.registerApp('wxc5eefa670a40cc46');
  }

  doUpgrade = (url, version) => {
    if (Platform.OS !== 'ios') {
      this.setState({ visable: false });
      Upgrade.startDownLoad(url, version, "eostoken");
    } else {
      Linking.openURL(url);
    }
  }

  componentWillMount() {

  }

  componentDidMount() {
    //回到app触发检测更新
    AppState.addEventListener("change", (newState) => {
      newState === "active" && codePush.sync({ installMode: codePush.InstallMode.ON_NEXT_RESUME });
    });
    //加载广告
    this.props.dispatch({ type: 'banner/list', payload: {} });
    //加载资讯类别
    this.props.dispatch({ type: 'newsType/list', payload: {} });
    //关闭欢迎页
    setTimeout(() => {
      SplashScreen.hide();
      //APK更新
      if (Platform.OS !== 'ios') {
        Upgrade.init();
        DeviceEventEmitter.addListener('progress', (e) => {
          if (e.code === '0000') { // 开始下载
            EasyDialog.startProgress();
          } else if (e.code === '0001') {
            EasyDialog.progress(e.fileSize, e.downSize);
          } else if (e.code === '0002') {
            EasyDialog.endProgress();
          }
        });
      }
      //升级
      var th = this;
      this.props.dispatch({
        type: 'common/upgrade', payload: { os: DeviceInfo.getSystemName() }, callback: (data) => {
          if (data.code == 0) {
            if (DeviceInfo.getVersion() != data.data.version) {
              if (data.data.must == 1) {
                EasyDialog.show("版本更新", data.data.intr, "升级", null, () => { this.doUpgrade(data.data.url, data.data.version) })
              } else {
                EasyDialog.show("版本更新", data.data.intr, "升级", "取消", () => { this.doUpgrade(data.data.url, data.data.version) })
              }
            }
          }
        }
      })
    }, 1000);

    BackHandler.addEventListener('hardwareBackPress', this.onBackAndroid);

    DeviceEventEmitter.addListener('share', (news) => {
      this.setState({ news, showShare: true });
      this.state.transformY = new Animated.Value(200);
      this.state.transformY1 = new Animated.Value(-1000);
      setTimeout(() => {
        Animated.parallel([
          Animated.timing(this.state.transformY,
            {
              toValue: 0,
              duration: 300,
              easing: Easing.linear,
            }
          ),
          Animated.timing(this.state.transformY1,
            {
              toValue: 0,
              duration: 300,
              easing: Easing.linear,
            }
          ),
        ]).start();
      }, 300);
    });
  }

  shareAction = (e) => {
    var th = this;
    if (e == 1) {
      this.refs.viewShot.capture().then(uri => {
        CameraRoll.saveToCameraRoll(uri);
        EasyToast.show("图片已保存到您的相册,打开QQ并选择图片发送吧");
        setTimeout(() => {
          Linking.openURL('mqqwpa://');
          th.setState({ showShare: false });
        }, 2000);
      });
    } else if (e == 2) {
      this.refs.viewShot.capture().then(uri => {
        WeChat.isWXAppInstalled()
          .then((isInstalled) => {
            th.setState({ showShare: false });
            if (isInstalled) {
              WeChat.shareToSession({ type: 'imageFile', description: uri, imageUrl: uri })
                .catch((error) => {
                  ToastShort(error.message);
                });
            } else {
              ToastShort('没有安装微信软件，请您安装微信之后再试');
            }
          });
      });
    } else if (e == 3) {
      this.refs.viewShot.capture().then(uri => {
        WeChat.isWXAppInstalled()
          .then((isInstalled) => {
            th.setState({ showShare: false });
            if (isInstalled) {
              WeChat.shareToTimeline({ type: 'imageFile', description: uri, imageUrl: uri })
                .catch((error) => {
                  ToastShort(error.message);
                });
            } else {
              ToastShort('没有安装微信软件，请您安装微信之后再试');
            }
          });
      });
    }

  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.onBackAndroid);
  }

  onBackAndroid = () => {
    if (routeLength == 1) {
      if (this.lastBackPressed && this.lastBackPressed + 2000 >= Date.now()) {
        return false;
      }
      this.lastBackPressed = Date.now();
      EasyToast.show('再按一次退出应用');
      return true;
    } else {
      return false;
    }
  };

  switchRoute = (prevNav, nav, action) => {
    //切换到个人中心，更新用户信息
    if (action && action.routeName && action.routeName == "Settings") {
      if (this.props.loginUser) {
        this.props.dispatch({ type: "login/info", payload: { uid: this.props.loginUser.uid, token: this.props.token } });
      }
    }
    if (action && action.routeName) {
      DeviceEventEmitter.emit('changeTab', action.routeName);
    }
    routeLength = nav.routes.length;
  }

  render() {

    return (<View style={{ flex: 1 }}>
      <Eosjs />
      <Nav ref="nav" onNavigationStateChange={(prevNav, nav, action) => { this.switchRoute(prevNav, nav, action) }} />
      {this.state.showShare ? (
        <View style={{ position: 'absolute', zIndex: 100000, top: 0, left: 0, width: ScreenWidth, height: ScreenHeight, backgroundColor: 'rgba(0,0,0,0.8)' }}>
          <Animated.View style={{
            height: ScreenHeight - 180, transform: [
              { translateX: 0 },
              { translateY: this.state.transformY1 },
            ]
          }}>
            <ScrollView style={{ marginTop: 50 }}>
              <View style={{ flexDirection: 'column', justifyContent: 'center' }}>
                <ViewShot ref="viewShot" style={{ left: 20, width: ScreenWidth - 40 }} options={{ format: "jpg", quality: 0.9 }}>
                  <View style={{ backgroundColor: "#fff", width: '100%', height: '100%' }}>
                    <Image source={UImage.share_banner} resizeMode="cover" style={{ width: '100%', height: (ScreenWidth - 40) * 0.32 }} />
                    <View style={{ padding: 20 }}>
                      <Text style={{ color: '#000', fontSize: 24, marginTop: 5 }}>{this.state.news.title}</Text>
                      <Text style={{ color: '#000', fontSize: 15, marginTop: 15 }}>{this.state.news.content}......</Text>
                      <View style={{ flexDirection: "row", width: '100%', justifyContent: "space-between" }}>
                        <Text style={{ color: '#000', fontSize: 15, marginTop: 15, marginTop: 15 }}>来源:{this.state.news.source}</Text>
                        <Text style={{ color: '#000', fontSize: 15, marginTop: 15, marginTop: 15 }}>{moment(this.state.news.createdate).fromNow()}</Text>
                      </View>

                    </View>
                    <View style={{ backgroundColor: '#F2F2F2', width: '100%', paddingVertical: 5, flexDirection: 'row', justifyContent: 'space-between', alignSelf: 'center' }}>
                      <View style={{ width: ScreenWidth - 40 - (ScreenWidth - 40) * 0.319, justifyContent: 'center', alignSelf: 'center' }}>
                        <Text style={{ color: '#85a7cd', fontSize: 16, textAlign: 'center', width: '100%', marginTop: 5 }}>E-Token钱包</Text>
                        <Text style={{ color: '#85a7cd', fontSize: 16, textAlign: 'center', width: '100%', marginTop: 5 }}>专注于柚子生态</Text>
                        <Text style={{ color: '#fff', fontSize: 16, textAlign: 'center', padding: 5, backgroundColor: '#306eb1', margin: 10 }}>识别二维码 查看完整的资讯</Text>
                      </View>
                      <View style={{ width: (ScreenWidth - 40) * 0.319, justifyContent: 'center', alignSelf: 'center' }}>
                        <QRCode size={(ScreenWidth - 40) * 0.319 - 20} value={redirect + (Constants.loginUser ? Constants.loginUser.uid : "nuid") + "/" + (Constants.token ? Constants.token.substr(0, 4) : "ntk") + "/" + this.state.news.id} />
                      </View>
                    </View>
                  </View>
                </ViewShot>
              </View>
            </ScrollView>
          </Animated.View>
          <View style={{ height: 170, marginTop: 10 }}>
            <Animated.View style={{
              height: 170, flex: 1, backgroundColor: '#e7e7e7', transform: [
                { translateX: 0 },
                { translateY: this.state.transformY },
              ]
            }}>

              <View style={{ height: 125 }}>
                <Text style={{ color: '#000', marginTop: 10, width: "100%", textAlign: "center" }}>分享到</Text>
                <View style={{ flexDirection: "row" }}>
                  <Button onPress={() => { this.shareAction(1) }} style={{ width: '33%', justifyContent: 'center' }}>
                    <View style={{ alignSelf: 'center', width: '100%', padding: 10 }}>
                      <Image source={UImage.share_qq} style={{ width: 50, height: 50, alignSelf: 'center', margin: 5 }} />
                      <Text style={{ color: "#666666", fontSize: 11, textAlign: 'center' }}>QQ</Text>
                    </View>
                  </Button>
                  <Button onPress={() => { this.shareAction(2) }} style={{ width: '33%', justifyContent: 'center' }}>
                    <View style={{ alignSelf: 'center', width: '100%', padding: 10 }}>
                      <Image source={UImage.share_wx} style={{ width: 50, height: 50, alignSelf: 'center', margin: 5 }} />
                      <Text style={{ color: "#666666", fontSize: 11, textAlign: 'center' }}>微信</Text>
                    </View>
                  </Button>
                  <Button onPress={() => { this.shareAction(3) }} style={{ width: '33%' }}>
                    <View style={{ alignSelf: 'center', width: '100%', padding: 10 }}>
                      <Image source={UImage.share_pyq} style={{ width: 50, height: 50, alignSelf: 'center', margin: 5 }} />
                      <Text style={{ color: "#666666", fontSize: 11, textAlign: 'center' }}>朋友圈</Text>
                    </View>
                  </Button>
                </View>
              </View>
              <Button onPress={() => { this.setState({ showShare: false }) }}>
                <View style={{ height: 45, backgroundColor: "#fff", flexDirection: "row" }}>
                  <Text style={{ color: '#000', fontSize: 15, width: "100%", textAlign: "center", alignSelf: 'center' }}>取消</Text>
                </View>
              </Button>
            </Animated.View>
          </View>
        </View>
      ) : null
      }
    </View>)
  }
}

export default Route;
