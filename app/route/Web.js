import React, { Component } from 'react'
import {
  WebView,
  StyleSheet,
  CameraRoll, Image, View, BackHandler, Text, Platform, DeviceEventEmitter, BackAndroid, AppState, Linking, Dimensions, ScrollView, Animated, Easing
} from 'react-native'
import { connect } from 'react-redux'
import moment from 'moment';
import Button from '../components/Button'
import ViewShot from "react-native-view-shot";
require('moment/locale/zh-cn');
var ScreenWidth = Dimensions.get('window').width;
var ScreenHeight = Dimensions.get('window').height;
const { width } = Dimensions.get('window')
import { EasyToast } from "../components/Toast"
import { EasyDialog } from "../components/Dialog"
import UImage from '../utils/Img'
import UColor from '../utils/Colors'
import QRCode from 'react-native-qrcode-svg';
import { redirect } from '../utils/Api'
import Constants from '../utils/Constants'

var WeChat = require('react-native-wechat');

@connect(({ news }) => ({ ...news }))
export default class Web extends Component {

  static navigationOptions = ({ navigation, navigationOptions }) => {
    return {
      title: navigation.state.params.title,
      headerRight: (navigation.state.params.news && <Button onPress={navigation.state.params.onPress}>
        <View style={{ padding: 15 }}>
          <Image source={UImage.share_i} style={{ width: 22, height: 22 }}></Image>
        </View>
      </Button>
      ),
    }
  }

  share = () => {
    this.props.dispatch({ type: 'news/share', payload: { news: this.state.news } });
    this.setState({ showShare: true });
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
  }

  constructor(props) {
    super(props)
    this.props.navigation.setParams({ onPress: this.share });
    this.state = {
      progress: new Animated.Value(10),
      error: false,
      news: this.props.navigation.state.params.news,
      showShare: false,
      transformY: new Animated.Value(200),
      transformY1: new Animated.Value(-1000)
    }
    let noop = () => { }
    this.__onLoad = this.props.onLoad || noop
    this.__onLoadStart = this.props.onLoadStart || noop
    this.__onError = this.props.onError || noop
    WeChat.registerApp('wxc5eefa670a40cc46');
  }

  shareAction = (e) => {
    var th = this;
    if (e == 1) {
      this.refs.viewShot.capture().then(uri => {
        CameraRoll.saveToCameraRoll(uri);
        EasyToast.show("图片已保存到您的相册,打开QQ并选择图片发送吧");
        setTimeout(() => {
          Linking.openURL('mqqwpa://');
          th.setState({showShare:false});
        }, 2000);
      });
    } else if (e == 2) {
      this.refs.viewShot.capture().then(uri => {
        WeChat.isWXAppInstalled()
          .then((isInstalled) => {
            if (isInstalled) {
              //发送朋友
              WeChat.shareToSession({ type: 'file', description: uri, imageUrl: uri })
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
        CameraRoll.saveToCameraRoll(uri);
        WeChat.isWXAppInstalled()
          .then((isInstalled) => {
            if (isInstalled) {
              //发送朋友圈
              WeChat.shareToTimeline({ type: 'file', description: uri, imageUrl: uri })
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


  _onLoad() {
    Animated.timing(this.state.progress, {
      toValue: width,
      duration: 200
    }).start(() => {
      setTimeout(() => {
        this.state.progress.setValue(0);
      }, 300)
    })
    this.__onLoad()
  }
  _onLoadStart() {
    this.state.progress.setValue(0);
    Animated.timing(this.state.progress, {
      toValue: width * .7,
      duration: 5000
    }).start()
    this.__onLoadStart()
  }
  _onError() {
    setTimeout(() => {
      this.state.progress.setValue(0);
    }, 300)
    this.setState({ error: true })
    this.__onError()
  }
  render() {
    return (
      <View style={{ flex: 1, backgroundColor: UColor.mainColor }}>
        <WebView
          source={{ uri: this.props.navigation.state.params.url }}
          domStorageEnabled={true}
          javaScriptEnabled={true}
          style={[styles.webview_style]}
          onLoad={this._onLoad.bind(this)}
          onLoadStart={this._onLoadStart.bind(this)}
          onError={this._onError.bind(this)}
        >
        </WebView>
        <View style={[styles.infoPage, this.state.error ? styles.showInfo : {}]}>
          <Text style={{ color: UColor.mainColor }}>{"加载失败"}</Text>
        </View>
        <Animated.View style={[styles.progress, { width: this.state.progress }]}></Animated.View>

        {this.state.showShare ? (
          <View style={{ position: 'absolute', zIndex: 100000, top: 0, left: 0, width: ScreenWidth, height: ScreenHeight, backgroundColor: 'rgba(0,0,0,0.8)' }}>
            <Animated.View style={{
              height: ScreenHeight - 250 - (ScreenHeight == 812 ? 20 : 0), transform: [
                { translateX: 0 },
                { translateY: this.state.transformY1 },
              ]
            }}>
              <ScrollView style={{ marginTop: 10 }}>
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
                      <View style={{ backgroundColor: '#F2F2F2', width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignSelf: 'center', paddingVertical: 5 }}>
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
      </View>
    )
  }
}

const styles = StyleSheet.create({
  webview_style: {
    flex: 1,
    backgroundColor: '#fff'
  },
  progress: {
    position: "absolute",
    height: 2,
    left: 0,
    top: 0,
    overflow: "hidden",
    backgroundColor: UColor.tintColor
  },
  infoPage: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
    paddingTop: 50,
    alignItems: "center",
    transform: [
      { translateX: width }
    ],
    backgroundColor: UColor.secdColor
  },
  showInfo: {
    transform: [
      { translateX: 0 }
    ]
  }
})