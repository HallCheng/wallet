import React from 'react';
import { connect } from 'react-redux'
import { Dimensions, Image, ScrollView, DeviceEventEmitter, InteractionManager, ListView, StyleSheet, View, RefreshControl, Text, TextInput } from 'react-native';
import { TabViewAnimated, TabBar, SceneMap } from 'react-native-tab-view';
import Swiper from 'react-native-swiper';
import store from 'react-native-simple-store';
import UColor from '../../utils/Colors'
import Button from '../../components/Button'
import moment from 'moment';
import UImage from '../../utils/Img';
import { EasyLoading } from '../../components/Loading';
import { EasyToast } from '../../components/Toast';
import { kapimg } from '../../utils/Api'
import { EasyDialog } from '../../components/Dialog'
var ScreenWidth = Dimensions.get('window').width;
var tick = 60;

@connect(({ login }) => ({ ...login }))
class Login extends React.Component {

  static navigationOptions = {
    title: '登陆',
    // headerStyle:{
    //     backgroundColor:"#586888",
    //     elevation: 0,
    //     shadowOpacity: 0
    // }
  };

  constructor(props) {
    super(props);
    this.state = {
      index: 0,
      capture: '获取短信验证码',
      routes: [{ key: '1', title: '登陆' }, { key: '2', title: '注册' }],
      phone: "",
      password: "",
      code: "",
      invite: "",
      loginPhone: "",
      loginPwd: "",
      img: kapimg,
      kcode: "",
      lcode: "",
    };
  }

  //组件加载完成
  componentDidMount() {

  }

  //切换tab
  _handleIndexChange = index => {
    this.setState({ index });
  };

  focusNextField = (nextField) => {
    this.refs[nextField].focus();
  };


  refreshLcode = () => {
    EasyDialog.dismis();
    this.loginKcaptrue();
  }

  loginKcaptrue = () => {
    if (this.state.loginPhone == "") {
      EasyToast.show('请输入手机号');
      return;
    }
    if (this.state.loginPwd == "") {
      EasyToast.show('请输入密码');
      return;
    }
    let img = kapimg + this.state.loginPhone + "?v=" + Math.ceil(Math.random() * 100000);

    const view = <View style={{ flexDirection: 'row' }}><Button onPress={() => { this.refreshLcode() }}><Image onError={(e) => { this.loaderror() }} style={{ width: 100, height: 45 }} source={{ uri: img }} /></Button><TextInput autoFocus={true} onChangeText={(lcode) => this.setState({ lcode })} returnKeyType="go" selectionColor="#65CAFF" keyboardType="ascii-capable" style={{ color: '#65CAFF', marginLeft: 10, width: 120, height: 45, fontSize: 15, backgroundColor: '#EFEFEF' }} placeholderTextColor="#8696B0" placeholder="请输入计算结果" underlineColorAndroid="transparent" maxLength={8} /></View>

    EasyDialog.show("计算结果", view, "登陆", "取消", () => {

      if (this.state.lcode == "") {
        EasyToast.show('请输入计算结果');
        return;
      }
      EasyDialog.dismis();

      this.loginSubmit();

    }, () => { EasyDialog.dismis() });
  }

  clearFoucs = () => {
    this._lphone.blur();
    this._lpass.blur();
    this._rpass.blur();
    this._rrpass.blur();
    this._rphone.blur();
    this._rcode.blur();
  }

  loginSubmit = () => {
    if (this.state.loginPhone == "") {
      EasyToast.show('请输入手机号');
      return;
    }
    if (this.state.loginPwd == "") {
      EasyToast.show('请输入密码');
      return;
    }

    EasyLoading.show('登陆中...');

    this.props.dispatch({
      type: 'login/login', payload: { phone: this.state.loginPhone, password: this.state.loginPwd, code: this.state.lcode }, callback: (data) => {
        if (data.code == 0) {
          EasyToast.show("登陆成功");
          this.props.navigation.goBack();
        } else {
          EasyToast.show(data.msg);
        }
        EasyLoading.dismis();
      }
    })
  }

  regSubmit = () => {
    if (this.state.phone == "") {
      EasyToast.show('请输入手机号');
      return;
    }
    if (this.state.code == "") {
      EasyToast.show('请输入验证码');
      return;
    }
    if (this.state.password == "") {
      EasyToast.show('请输入密码');
      return;
    }
    if (this.state.phone.length != 11) {
      EasyToast.show('请输入11位手机号');
      return;
    }

    EasyLoading.show('注册中...');
    this.props.dispatch({
      type: 'login/register', payload: { phone: this.state.phone, password: this.state.password, code: this.state.code, invite: this.state.invite }, callback: (data) => {
        EasyLoading.dismis();
        if (data.code == 0) {
          EasyToast.show("注册成功");
          this.props.navigation.goBack();
        } else {
          EasyToast.show(data.msg);
        }
      }
    })
  }

  refresh = () => {
    EasyDialog.dismis();
    this.kcaptrue();
  }

  loaderror = () => {
    EasyToast.show('操作过于频繁，为保障用户安全，请一小时后尝试');
  }

  kcaptrue = () => {
    if (this.state.phone == "") {
      EasyToast.show('请输入手机号');
      return;
    }
    if (this.state.phone.length != 11) {
      EasyToast.show('请输入11位手机号');
      return;
    }
    if (this.state.capture != "获取短信验证码") {
      return;
    }
    let img = kapimg + this.state.phone + "?v=" + Math.ceil(Math.random() * 100000);

    const view = <View style={{ flexDirection: 'row' }}><Button onPress={() => { this.refresh() }}><Image onError={(e) => { this.loaderror() }} style={{ width: 100, height: 45 }} source={{ uri: img }} /></Button><TextInput autoFocus={true} onChangeText={(kcode) => this.setState({ kcode })} returnKeyType="go" selectionColor="#65CAFF" keyboardType="ascii-capable" style={{ color: '#65CAFF', marginLeft: 10, width: 120, height: 45, fontSize: 15, backgroundColor: '#EFEFEF' }} placeholderTextColor="#8696B0" placeholder="请输入计算结果" underlineColorAndroid="transparent" maxLength={8} /></View>

    EasyDialog.show("计算结果", view, "获取", "取消", () => {
      if (this.state.kcode == "") {
        EasyToast.show('请输入计算结果');
        return;
      }

      this.getCapture();
    }, () => { EasyDialog.dismis() });
  }

  getCapture = () => {
    if (this.state.phone == "") {
      EasyToast.show('请输入手机号');
      return;
    }
    if (this.state.phone.length != 11) {
      EasyToast.show('请输入11位手机号');
    }
    if (this.state.kcode == "") {
      EasyToast.show('请输入验证码');
      return;
    }
    if (this.state.capture != "获取短信验证码") {
      return;
    }

    var th = this;
    EasyLoading.show('获取中...');
    this.props.dispatch({
      type: 'login/getCapture', payload: { phone: this.state.phone, code: this.state.kcode }, callback: (data) => {
        EasyLoading.dismis();
        if (data.code == 0) {
          EasyToast.show("验证码已发送，请注意查收");
          th.setState({ capture: "60s" })
          th.doTick();
          EasyDialog.dismis();
        } else {
          EasyToast.show(data.msg);
          if (data.code != 505) {
            EasyDialog.dismis();
          }
        }
      }
    });
  }


  doTick = () => {
    var th = this;
    setTimeout(function () {
      if (tick == 0) {
        tick = 60;
        th.setState({ capture: "获取短信验证码" })
      } else {
        tick--;
        th.setState({ capture: tick + "s" })
        th.doTick();
      }
    }, 1000);
  }

  prot = () => {
    const { navigate } = this.props.navigation;
    navigate('Web', { title: "注册协议", url: "http://static.eostoken.im/html/reg.html" });
  }

  forget = () => {
    const { navigate } = this.props.navigation;
    navigate('Forget');
  }

  //渲染页面
  renderScene = ({ route }) => {
    if (route.key == '1') {
      return (<ScrollView keyboardShouldPersistTaps="always">
        <View>
          <View style={{ backgroundColor: '#43536D', flex: 1, flexDirection: 'column', }}>
            <View style={{ padding: 20, height: 80, backgroundColor: '#586888' }} >
              <Text style={{ fontSize: 12, color: '#8696B0' }}> 手机号</Text>
              <TextInput ref={(ref) => this._lphone = ref} autoFocus={false} editable={true} value={this.state.loginPhone} returnKeyType="next" selectionColor="#65CAFF" style={{ color: '#8696B0', fontSize: 15, height: 40, paddingLeft: 2 }} placeholderTextColor="#8696B0" placeholder="输入手机号" underlineColorAndroid="transparent" keyboardType="phone-pad" maxLength={11}
                onChangeText={(loginPhone) => this.setState({ loginPhone })} />
            </View>
            <View style={{ height: 0.5, backgroundColor: '#43536D' }}></View>
            <View style={{ padding: 20, height: 80, backgroundColor: '#586888' }} >
              <Text style={{ fontSize: 12, color: '#8696B0' }}> 密码</Text>
              <TextInput ref={(ref) => this._lpass = ref} autoFocus={false} editable={true} value={this.state.loginPwd} returnKeyType="go" selectionColor="#65CAFF" style={{ color: '#8696B0', fontSize: 15, height: 40, paddingLeft: 2 }} placeholderTextColor="#8696B0" placeholder="输入密码" underlineColorAndroid="transparent" secureTextEntry={true} maxLength={20}
                onSubmitEditing={() => this.loginKcaptrue()}
                onChangeText={(loginPwd) => this.setState({ loginPwd })}
              />
            </View>
          </View>
          <View style={{ flex: 1, flexDirection: "row", justifyContent: 'flex-end', padding: 20 }}>
            <Text style={{ fontSize: 15, color: '#65CAFF' }} onPress={() => this.forget()}>忘记密码</Text>
          </View>
          <Button onPress={() => this.loginKcaptrue()}>
            <View style={{ height: 45, backgroundColor: '#65CAFF', justifyContent: 'center', alignItems: 'center', margin: 20, borderRadius: 5 }}>
              <Text style={{ fontSize: 15, color: '#fff' }}>登陆</Text>
            </View>
          </Button>
        </View>
      </ScrollView>)
    } else {
      return (<ScrollView keyboardShouldPersistTaps="always">
        <View>
          <View style={{ backgroundColor: '#43536D', flex: 1, flexDirection: 'column', }}>
            <View style={{ padding: 20, height: 80, backgroundColor: '#586888' }} >
              <Text style={{ fontSize: 12, color: '#8696B0' }}> 手机号</Text>
              <TextInput ref={(ref) => this._rphone = ref} value={this.state.phone} returnKeyType="next" selectionColor="#65CAFF" style={{ color: '#8696B0', fontSize: 15, height: 40, paddingLeft: 2 }} placeholderTextColor="#8696B0" placeholder="输入手机号" underlineColorAndroid="transparent" keyboardType="phone-pad" maxLength={11}
                onChangeText={(phone) => this.setState({ phone })}
              />
            </View>
            <View style={{ height: 0.5, backgroundColor: '#43536D' }}></View>
            <View style={{ flexDirection: 'row', backgroundColor: '#586888' }}>
              <View style={{ padding: 20, height: 80, width: 200 }} >
                <Text style={{ fontSize: 12, color: '#8696B0' }}> 验证码</Text>
                <TextInput ref={(ref) => this._rcode = ref} value={this.state.code} returnKeyType="next" selectionColor="#65CAFF" style={{ color: '#8696B0', fontSize: 15, height: 40, paddingLeft: 2 }} placeholderTextColor="#8696B0" placeholder="请输入验证码" underlineColorAndroid="transparent" keyboardType="phone-pad" maxLength={6}
                  onChangeText={(code) => this.setState({ code })}
                />
              </View>
              <View style={{ flex: 1, flexDirection: "row", alignSelf: 'center', justifyContent: "flex-end", marginRight: 10 }}>
                <Button onPress={() => this.kcaptrue()}>
                  <View style={{ backgroundColor: '#65CAFF', borderRadius: 5, width: 100, height: 40, justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ fontSize: 12, color: '#fff' }}>{this.state.capture}</Text>
                  </View>
                </Button>
              </View>
            </View>

            <View style={{ height: 0.5, backgroundColor: '#43536D' }}></View>
            <View style={{ padding: 20, height: 80, backgroundColor: '#586888' }} >
              <Text style={{ fontSize: 12, color: '#8696B0' }}> 密码</Text>
              <TextInput ref={(ref) => this._rpass = ref} value={this.state.password} returnKeyType="next" selectionColor="#65CAFF" style={{ color: '#8696B0', fontSize: 15, height: 40, paddingLeft: 2 }} placeholderTextColor="#8696B0" placeholder="输入密码" underlineColorAndroid="transparent" secureTextEntry={true} maxLength={20}
                onChangeText={(password) => this.setState({ password })}
              />
            </View>
            <View style={{ height: 0.5, backgroundColor: '#43536D' }}></View>
            <View style={{ padding: 20, height: 80, backgroundColor: '#586888' }} >
              <Text style={{ fontSize: 12, color: '#8696B0' }}> 邀请码</Text>
              <TextInput ref={(ref) => this._rrpass = ref} value={this.state.invite} returnKeyType="go" selectionColor="#65CAFF" style={{ color: '#8696B0', fontSize: 15, height: 40, paddingLeft: 2 }} placeholderTextColor="#8696B0" placeholder="输入邀请码(非必填)" underlineColorAndroid="transparent" keyboardType="phone-pad" maxLength={8}
                onSubmitEditing={() => this.regSubmit()}
                onChangeText={(invite) => this.setState({ invite })}
              />
            </View>
          </View>
          <Button onPress={() => this.regSubmit()}>
            <View style={{ height: 45, backgroundColor: '#65CAFF', justifyContent: 'center', alignItems: 'center', marginTop: 20, marginHorizontal: 20, borderRadius: 5 }}>
              <Text style={{ fontSize: 15, color: '#fff' }}>注册</Text>
            </View>
          </Button>
          <View style={{ flex: 1, flexDirection: "row", justifyContent: 'center', padding: 10 }}>
            <Text style={{ fontSize: 13, color: '#8696B0', marginTop: 5 }}>注册即表示同意</Text>
            <Text onPress={() => this.prot()} style={{ fontSize: 13, color: '#65CAFF', marginTop: 5 }}>EosToken用户协议</Text>
          </View>
        </View>
      </ScrollView>)
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={{ backgroundColor: '#586888', height: 0 }}></View>
        <TabViewAnimated
          lazy={true}
          navigationState={this.state}
          renderScene={this.renderScene.bind(this)}
          renderHeader={(props) => <TabBar onTabPress={this._handleTabItemPress} labelStyle={{ fontSize: 15, margin: 0, marginBottom: 15, paddingTop: 15, color: '#8696B0' }} indicatorStyle={{ backgroundColor: UColor.tintColor, width: ScreenWidth / 2 }} style={{ backgroundColor: "#586888" }} tabStyle={{ width: ScreenWidth / 2, padding: 0, margin: 0 }} scrollEnabled={true} {...props} />}
          onIndexChange={this._handleIndexChange}
          initialLayout={{ height: 0, width: Dimensions.get('window').width }}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: "#43536D"
  }
});

export default Login;
