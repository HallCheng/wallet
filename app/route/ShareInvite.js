
import React from 'react';
import { connect } from 'react-redux'
import { StyleSheet, Dimensions, Modal, Animated, View, Image, ScrollView, Text, Clipboard, ImageBackground, Linking, TextInput } from 'react-native';
import SplashScreen from 'react-native-splash-screen';
import NavigationUtil from '../utils/NavigationUtil';
import UImage from '../utils/Img'
import Button from '../components/Button'
const maxHeight = Dimensions.get('window').height;
const maxWidth = Dimensions.get('window').width;
import { EasyToast } from '../components/Toast';
import { EasyDialog } from '../components/Dialog'
import { EasyLoading } from '../components/Loading'
import QRCode from 'react-native-qrcode-svg';
import Constants from '../utils/Constants'

var WeChat = require('react-native-wechat');

@connect(({ invite, login }) => ({ ...invite, ...login }))
class ShareInvite extends React.Component {

  state = {
    code: "",
    focus: false
  }

  static navigationOptions = {
    title: "邀请注册"
  };

  constructor(props) {
    super(props);
    WeChat.registerApp('wxc5eefa670a40cc46');
  }

  componentDidMount() {
    var th = this;

    this.props.dispatch({
      type: "invite/info", payload: { uid: Constants.uid }, callback: function (data) {
        if (data.code == 403) {
          this.props.dispatch({
            type: 'login/logout', payload: {}, callback: () => {
              this.props.navigation.goBack();
            }
          });
        }
      }
    });
    this.props.dispatch({
      type: "invite/getBind", payload: { uid: Constants.uid }, callback: function (data) {
        if (data.code == "0") {
          if (data.data == "" || data.data == "null" || data.data == null) {
            const view = <TextInput autoFocus={true} onChangeText={(code) => th.setState({ code })} returnKeyType="go" selectionColor="#65CAFF" style={{ color: '#65CAFF', width: maxWidth - 100, fontSize: 15, backgroundColor: '#EFEFEF' }} placeholderTextColor="#8696B0" placeholder="输入邀请码" underlineColorAndroid="transparent" keyboardType="phone-pad" maxLength={8} />
            EasyDialog.show("未绑定，补填邀请码", view, "绑定", "取消", () => {
              th.setState({ focus: true })
              EasyLoading.show("绑定中");
              th.props.dispatch({
                type: "invite/bind", payload: { uid: Constants.uid, code: th.state.code }, callback: function (dt) {
                  EasyLoading.dismis()
                  if (dt.code == "0") {
                    EasyToast.show("绑定成功");
                    EasyDialog.dismis();
                  } else {
                    EasyToast.show(dt.msg);
                  }
                }
              });
            }, () => { EasyDialog.dismis() });
          }
        }
      }
    });
  }

  copy = () => {
    // let msg = "由硬币资本、连接资本领投的全网第一款柚子钱包EosToken上线撒币啦，500,000EOS赠送新用户活动，太爽了~真是拿到手软，用我的邀请链接注册即获得"+(parseFloat(this.props.inviteInfo.regReward)+parseFloat(this.props.inviteInfo.l1Reward))+"EOS。"+this.props.inviteInfo.inviteUrl+"#"+this.props.inviteInfo.code+"（如果微信无法打开，请复制链接到手机浏览器打开,苹果版本已上线）";
    let msg = "由硬币资本、连接资本领投的全网第一款柚子钱包EosToken开放注册了，" + this.props.inviteInfo.inviteUrl + "（请复制链接到手机浏览器打开）（如果微信无法打开，请复制链接到手机浏览器打开,苹果版本已上线）";

    // Clipboard.setString(msg);
    EasyDialog.show("复制成功", msg, "分享给微信好友", "取消", () => {
      //   Linking.openURL('weixin://'); }, () => { EasyDialog.dismis() }
      WeChat.isWXAppInstalled()
        .then((isInstalled) => {
          EasyDialog.dismis();
          if (isInstalled) {
            WeChat.shareToSession({ type: 'text', description: msg })
              .catch((error) => {
                ToastShort(error.message);
              });
          } else {
            ToastShort('没有安装微信软件，请您安装微信之后再试');
          }
        });
    });
  }

  render() {
    return (
      <View style={styles.container}>
        <ScrollView>
          <View style={styles.container}>
            <ImageBackground style={{ width: '100%', height: 260, justifyContent: "center" }} source={UImage.shareBg} resizeMode="cover">
              <View style={{ flexDirection: "row", justifyContent: "center", marginTop: 60 }}>
                <Image style={{ width: maxWidth / 2 - 30, height: (maxWidth / 2 - 30) * 0.45 }} source={UImage.inb} />
                <Image style={{ width: maxWidth / 2 - 30, height: (maxWidth / 2 - 30) * 0.45, marginLeft: 20 }} source={UImage.link} />
              </View>
              <Text style={{ color: '#fff', width: "100%", textAlign: 'center', fontSize: 18 }}>领投机构：硬币资本，连接资本</Text>

              <View style={{ flexDirection: "row", width: '100%', justifyContent: 'center' }}>
                <Image style={{ justifyContent: 'center' }} source={UImage.logo} />
              </View>
              <Text style={{ color: '#fff', width: "100%", textAlign: 'center', fontSize: 18, marginBottom: 60 }}>EosToken</Text>
              {/* <View style={{ padding: 20 }}>
                <Text style={{ color: '#8999b9', fontSize: 15, marginTop: 20 }}>规则说明：</Text> */}
              {/* <Text style={{color:'#8999b9',fontSize:15,marginTop:5}}>1.新用户通过邀请链接（或邀请码）注册即获得{(parseFloat(this.props.inviteInfo.regReward)+parseFloat(this.props.inviteInfo.l1Reward))}EOS</Text> */}
              {/* <Text style={{ color: '#8999b9', fontSize: 15, marginTop: 5 }}>1.新用户通过邀请链接（或邀请码）注册即获得{(parseFloat(this.props.inviteInfo.regReward) + parseFloat(this.props.inviteInfo.l1Reward))}积分</Text> */}
              {/* <Text style={{color:'#8999b9',fontSize:15,marginTop:2}}>2.每邀请一个好友注册将增加{this.props.inviteInfo.l1Reward}EOS，好友邀请人数也将做为二级奖励，每一个二级好友可获得{this.props.inviteInfo.l2Reward}EOS</Text> */}
              {/* <Text style={{ color: '#8999b9', fontSize: 15, marginTop: 2 }}>2.每邀请一个好友注册将增加{this.props.inviteInfo.l1Reward}积分，好友邀请人数也将做为二级奖励，每一个二级好友可获得{this.props.inviteInfo.l2Reward}积分</Text>
                <Text style={{ color: '#8999b9', fontSize: 15, marginTop: 2 }}>3.获得EosToken积分享有更多权益还有机会兑换EOS；</Text>
              </View> */}
            </ImageBackground>
            <View>
              <Text style={{ marginTop: 15, marginLeft: 65 }}>专注于柚子生态</Text>
              <Text style={{ marginTop: 2, marginLeft: 50 }}>随时随地把握精准行情</Text>
              <View style={{ marginTop: 30, marginLeft: 60, marginBottom: 50, width: 120 }}>
                <QRCode size={120} value={this.props.inviteInfo.inviteUrl + "#" + this.props.inviteInfo.code} />
                <Text style={{ fontSize: 16, color: '#000', marginTop: 15, textAlign: 'center' }}>扫码注册</Text>
              </View>
              {/* <Text style={{ color: '#000', fontSize: 15, marginTop: 20, marginLeft: 20 }}>一级邀请人数：{this.props.inviteInfo.inviteL1Count} 人</Text> */}
              {/* <Text style={{ color: '#000', fontSize: 15, marginTop: 7, marginLeft: 20 }}>二级邀请人数：{this.props.inviteInfo.inviteL2Count} 人</Text> */}
              {/* <Text style={{color:'#000',fontSize:15,marginTop:7,marginLeft:20}}>当前获得奖励：{this.props.inviteInfo.reward} EOS</Text> */}
              {/* <Text style={{ color: '#000', fontSize: 15, marginTop: 7, marginLeft: 20 }}>当前获得奖励：{this.props.inviteInfo.reward} 积分</Text> */}
              {/* <Text style={{ color: '#000', fontSize: 15, marginTop: 7, marginLeft: 20, marginBottom: 10 }}>非链接注册邀请码：{this.props.inviteInfo.code}</Text> */}
            </View>
            <Image source={UImage.phone} style={{ width: 103, height: 274, position: 'absolute', top: 290, left: maxWidth - 120, zIndex: 999 }} />
          </View>
        </ScrollView>
        <Button onPress={() => { this.copy() }}>
          <View style={{ height: 50, backgroundColor: '#65CAFF', justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ fontSize: 16, color: '#fff' }}>复制专属邀请链接</Text>
          </View>
        </Button>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#fff',
  }
});

export default ShareInvite;