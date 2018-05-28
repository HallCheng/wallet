import React from 'react';
import { connect } from 'react-redux'
import { Dimensions, DeviceEventEmitter, InteractionManager, ListView, StyleSheet, View, RefreshControl, Text, ScrollView, Image, Platform, StatusBar } from 'react-native';
import { TabViewAnimated, TabBar, SceneMap } from 'react-native-tab-view';
import UColor from '../../utils/Colors'
import Button from '../../components/Button'
import Item from '../../components/Item'
import Icon from 'react-native-vector-icons/Ionicons'
import UImage from '../../utils/Img'
import { EasyLoading } from '../../components/Loading';
import { EasyToast } from '../../components/Toast';
import { EasyDialog } from '../../components/Dialog';
var DeviceInfo = require('react-native-device-info');

@connect(({ login }) => ({ ...login }))
class Setting extends React.Component {

  static navigationOptions = {
    title: '我的'
  };

  constructor(props) {
    super(props);
    this.config = [
      { first: true, name: "钱包管理", onPress: this.goPage.bind(this, "WalletManage") },
      { name: "系统设置", onPress: this.goPage.bind(this, "set") },
      { name: "邀请注册", onPress: this.goPage.bind(this, "share") },
      { name: "权益股票", onPress: this.goPage.bind(this, "Test") },
      { name: "密钥恢复", onPress: this.goPage.bind(this, "Test") },
      { first: true, disable: true, name: "消息推送", swt: 'off' }
    ];
  }

  goPage(key, data = {}) {
    const { navigate } = this.props.navigation;
    if (key == "share") {
      if (this.props.loginUser) {
        navigate('Share', {});
      } else {
        navigate('Login', {});
        EasyToast.show('请登陆');
      }
    } else if (key == 'WalletManage') {
      // EasyToast.show('测试网络暂不开放');
      navigate('WalletManage', {});
    }else if (key == 'set') {
      navigate('Set', {});
    } else {
      EasyDialog.show("温馨提示", "该功能将于EOS主网上线后开通。", "知道了", null, () => { EasyDialog.dismis() });
    }
  }

  _renderListItem() {
    return this.config.map((item, i) => {
      return (<Item key={i} {...item} />)
    })
  }

  goProfile() {
    if (this.props.loginUser) {
      return;
    }
    const { navigate } = this.props.navigation;
    navigate('Login', {});
  }

  signIn() {
    const { navigate } = this.props.navigation;
    if (this.props.loginUser) {
      navigate('SignIn', {});
    } else {
      navigate('Login', {});
      EasyToast.show('请登陆');
    }
  }

  render() {
    return <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View>
          <Button onPress={this.goProfile.bind(this)}>
            <View style={styles.userHead} >
              <View style={{ flex: 1, flexDirection: "row", alignItems: "center", paddingVertical: 15 }}>
                <Image source={UImage.logo} style={{ width: 42, height: 52 }} />
                <Text style={{ color: UColor.fontColor, fontSize: 17, marginLeft: 15 }}>{(this.props.loginUser) ? this.props.loginUser.nickname : "登陆"}</Text>
              </View>
              <View style={{ flex: 1, flexDirection: "row", alignSelf: 'center', justifyContent: "flex-end" }}>
                {
                  <Button onPress={this.signIn.bind(this)} style={{ borderRadius: 5, paddingVertical: 5, paddingHorizontal: 15 }}>
                    <Image source={UImage.signed} style={{ width: 40, height: 49 }} />
                  </Button>
                }
              </View>
            </View>
          </Button>
          <Button style={{ marginTop: 15 }}>
            <View style={{ flex: 1, flexDirection: "row", paddingHorizontal: 20, backgroundColor: UColor.mainColor, justifyContent: 'space-between' }}>
              <View style={{ flex: 1, flexDirection: "column", paddingVertical: 12 }}>
                <Text style={{ color: '#8696B0', fontSize: 11 }}>EOS资产</Text>
                <Text style={{ color: UColor.fontColor, fontSize: 15, marginTop: 10 }}>{(this.props.loginUser) ? this.props.loginUser.eost : "0"} EOS</Text>
              </View>
              <View style={{ flex: 1, flexDirection: "row", alignSelf: 'center', justifyContent: "flex-end" }}>
                {
                  this.props.loginUser && <Button onPress={() => { EasyDialog.show("温馨提示", "6月份EOS主网上线后将逐步解冻…", "知道了", null, () => { EasyDialog.dismis() }); }} style={{ backgroundColor: '#65CAFF', borderRadius: 5, paddingVertical: 5, paddingHorizontal: 15 }}>
                    <Text style={{ fontSize: 15, color: '#fff' }}>提币</Text>
                  </Button>
                }
              </View>
            </View>
          </Button>
          <View>
            {this._renderListItem()}
          </View>
          <View style={{ flex: 1, marginTop: 15, flexDirection: 'column' }}>
            <Text style={{ fontSize: 10, color: '#8696B0', width: '100%', textAlign: 'center' }}>© 2018 eostoken all rights reserved </Text>
            <Text style={{ fontSize: 10, color: '#8696B0', width: '100%', textAlign: 'center', marginTop: 5 }}>EOS专业版钱包 V{DeviceInfo.getVersion()}(1)</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: UColor.secdColor,
  },
  scrollView: {

  },
  userHead: {
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    paddingHorizontal: 20,
    backgroundColor: UColor.mainColor
  },
  header: {
    borderColor: UColor.secdColor,
    borderWidth: 0.6,
    paddingTop: (Platform.OS == 'ios' ? 33 : 14),
    paddingBottom: 10,
    backgroundColor: UColor.mainColor,
    textAlign: "center",
    fontSize: 18,
    fontWeight: 'normal',
    color: UColor.fontColor
  }
});

export default Setting;
