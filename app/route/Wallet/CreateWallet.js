import React from 'react';
import { connect } from 'react-redux'
import { Dimensions, DeviceEventEmitter, InteractionManager, ListView, StyleSheet, Clipboard, View, RefreshControl, Text, ScrollView, Image, Platform, StatusBar, TextInput, TouchableHighlight } from 'react-native';
import UColor from '../../utils/Colors'
import Button from '../../components/Button'
import Item from '../../components/Item'
import Icon from 'react-native-vector-icons/Ionicons'
import UImage from '../../utils/Img'
import { EasyLoading } from '../../components/Loading';
import { EasyToast } from '../../components/Toast';
import { Eos } from "react-native-eosjs";
import { english } from '../../utils/english';
// import { CollapsibleText } from '../News/CollapsibleText';

// var eosjs = require('eosjs')

// Eos = require('eosjs');
// var {api, ecc, json, Fcbuffer, format} = Eos.modules;

@connect(({ wallet }) => ({ ...wallet }))
class Set extends React.Component {

  static navigationOptions = {
    title: '创建钱包'
  };

  constructor(props) {
    super(props);
    this.state = {
      walletName: "",
      walletPassword: "",
      reWalletPassword: "",
      passwordNote: "",
      isChecked: this.props.isChecked || false
    }
  }

  importKey() {
    navigate('ImportKey', {});
  }

  createWallet() {
    const { dispatch } = this.props;
    if (this.state.walletName == "") {
      EasyToast.show('请输入钱包名称');
      return;
    }
    if (this.state.walletName.length > 12) {
      EasyToast.show('EOS账户长度不能超过12位');
      return;
    }
    if (this.state.walletPassword == "") {
      EasyToast.show('请输入钱包密码');
      return;
    }
    if (this.state.reWalletPassword == "") {
      EasyToast.show('请输入钱包确认密码');
      return;
    }
    if (this.state.isChecked == false) {
      EasyToast.show('请确认已阅读并同意条款');
      return;
    }

    var arr_owner = [];
    var arr_active = [];
    var words_owner = [];
    var words_active = [];
    var wordsStr_owner = '';
    var wordsStr_active = '';
    for (var i = 0; i < 15; i++) {
      var randomNum = this.getx(arr_owner);
      words_owner.push(english[randomNum]);
    }
    for (var i = 0; i < arr_owner.length; i++) {
      words_owner[i] = english[arr_owner[i]];
      wordsStr_owner = wordsStr_owner + "," + words_owner[i];
    }
    for (var i = 0; i < 15; i++) {
      var randomNum = this.getx(arr_active);
      words_active.push(english[randomNum]);
    }
    for (var i = 0; i < arr_active.length; i++) {
      words_active[i] = english[arr_active[i]];
      wordsStr_active = wordsStr_active + "," + words_active[i];
    }
    const { navigate } = this.props.navigation;
    EasyLoading.show('正在请求');
    Eos.seedPrivateKey(wordsStr_owner, wordsStr_active, (result) => {
      if (result.isSuccess) {
        result.data.words = wordsStr_owner;
        result.data.words_active = wordsStr_active;
        result.password = this.state.walletPassword;
        result.name = this.state.walletName;
        result.account = this.state.walletName;
        // alert('seedPrivateKey: '+JSON.stringify(result));
        this.props.dispatch({
          type: 'wallet/createAccountService', payload: { username: result.account, owner: result.data.ownerPublic, active: result.data.activePublic }, callback: (data) => {
            EasyLoading.dismis();
            // alert(JSON.stringify(data));
            if (data.code == '0') {
              this.props.dispatch({
                type: 'wallet/saveWallet', wallet: result, callback: (data) => {
                  
                  if (data.error != null) {
                    EasyToast.show('生成账号失败：' + data.error);
                  } else {
                    EasyToast.show('生成账号成功：' + data.error);
                  }
                }
              });
            } else {
              EasyToast.show('生成账号失败：' + data.data);
            }

          }
        })
      } else {
      }

    });

    DeviceEventEmitter.addListener('wallet_10', () => {
      EasyToast.show('您不能创建更多钱包账号了');
    });
    DeviceEventEmitter.addListener('wallet_backup', (data) => {
      this.props.navigation.goBack();
      const { navigate } = this.props.navigation;
      navigate('BackupNote', data);
    });
  }


  chkPrice(obj) {
    var reg = /^[a-zA-Z]+$/;
    if (!reg.test(obj)) {
      obj = obj.substr(0, obj.length - 1);
    };
    return obj;
  }

  getRandomWords() {
    var words = '';
    for (var i = 0; i < 15; i++) {
      var randomNum = this.getx(arr_owner);
      words_owner.push(english[randomNum]);
    }
    for (var i = 0; i < arr_owner.length; i++) {
      words_owner[i] = english[arr_owner[i]];
      wordsStr_owner = wordsStr_owner + "," + words_owner[i];
    }
    return words;
  }

  newAccount() {
    // this.props.dispatch({
    //   type: 'wallet/createAccountService', payload: {
    //     username: 'tt', owner: 'EOS7jNzbYDrNbJYAWxRVFtmz1TSeRZK5qpwBCmEwKKn48rqt8orUN',
    //     active: 'EOS5aJxhh7zqcFpnK4Zy3XPGkFGEyVzdNghiVcfYsj4KCeACisuAY'
    //   }, callback: (data) => {
    //     alert(JSON.stringify(data));
    //   }
    // })
    // this.props.dispatch({
    //   type: 'wallet/getBalance', payload: { contract: "eosio.token", account: 'moling', symbol: 'EOS' }, callback: (data) => {
    //     alert(JSON.stringify(data));
    //   }
    // })

  }

  getAccountInfo() {
    Eos.balance("eosio.token", "morning", (r) => {
      try {
        alert('getAccountInfo: ' + JSON.stringify(r));
      } catch (e) {
        alert('getAccountInfo err: ' + JSON.stringify(e));
      }
    });
  }

  transfer() {
    Eos.transfer("tt", "marco", "1.0000 EOS", "", "5JqqwFTALaJPVtSRNhsVFFN5de7d6j239YSVDMeKfNHXYc5F2oP", false, (r) => {
      // Eos.transfer("sbtc1", "alice", "1.0000 EOS", "", "5KU35XDjUmMKCLybK9xyx88ygSsDscUDk7hLGqvqPSUkFxTEFLF", false, (r) => {
      alert(JSON.stringify(r));
      this.props.dispatch({
        type: 'wallet/pushTransaction', payload: r.data.transaction, callback: (data) => {
          alert('pushTransaction :' + JSON.stringify(data));
        }
      });
    });
  }

  // getinfo() {
  //   Eos.getInfo((r) => {
  //     alert('Eos.getInfo' + JSON.stringify(r));
  //   });
  // }

  // createKey() {
  //   Eos.seedPrivateKey((r) => {
  //     alert('Eos.getInfo' + JSON.stringify(r));
  //   });
  // }

  getx(arr) {
    for (var i = 0; i > -1; i++) {
      var flag = true;
      var num = Math.floor(Math.random() * english.length);
      for (var i in arr) {
        if (arr[i] == num) {
          flag = false;
          break;
        }
      }
      if (flag == true) {
        arr.push(num);
        return arr;
      }
    }
  }

  prot = () => {
    const { navigate } = this.props.navigation;
    navigate('Web', { title: "服务及隐私条款", url: "http://static.eostoken.im/html/reg.html" });
  }


  checkClick() {
    this.setState({
      isChecked: !this.state.isChecked
    });
  }

  render() {
    return <View style={styles.container}>
      {/* <ScrollView style={styles.scrollView}> */}
      <View>
        <Text style={styles.welcome} style={{ color: '#8696B0', marginTop: 10, marginLeft: 10 }}>重要声明:</Text>
        <Text style={styles.welcome} style={{ color: '#8696B0', marginTop: 10, marginLeft: 10 }}>密码用于保护私钥和交易授权，强度非常重要</Text>
        <Text style={styles.welcome} style={{ color: '#8696B0', marginBottom: 10, marginLeft: 10 }}>EosToken不存储密码，也无法帮您找回，请务必牢记</Text>
        <View style={{ backgroundColor: '#43536D' }}>
          <View style={{ padding: 20, height: 55, backgroundColor: '#586888' }} >
            <TextInput returnKeyType="next" selectionColor="#65CAFF"
              style={{ color: '#8696B0', fontSize: 15, height: 40, paddingLeft: 2 }} placeholderTextColor="#8696B0" placeholder="钱包名称"
              underlineColorAndroid="transparent" keyboardType="default"
              // onChangeText={(walletName) => this.setState({ walletName })}
              value={this.state.walletName}
              onChangeText={(walletName) => this.setState({ walletName: this.chkPrice(walletName) })}
            />
          </View>
          <View style={{ height: 0.5, backgroundColor: '#43536D', flex: 1, flexDirection: 'column' }}></View>
          <View style={{ padding: 20, height: 55, backgroundColor: '#586888' }} >
            <TextInput ref={(ref) => this._lpass = ref} autoFocus={false} editable={true}
              returnKeyType="go" selectionColor="#65CAFF" style={{ color: '#8696B0', fontSize: 15, height: 40, paddingLeft: 2 }} placeholderTextColor="#8696B0"
              placeholder="密码" underlineColorAndroid="transparent" secureTextEntry={true} maxLength={20}
              onChangeText={(walletPassword) => this.setState({ walletPassword })}
            />
          </View>
          <View style={{ height: 0.5, backgroundColor: '#43536D', flex: 1, flexDirection: 'column', }}></View>
          <View style={{ padding: 20, height: 55, backgroundColor: '#586888' }} >
            <TextInput ref={(ref) => this._lpass = ref} autoFocus={false} editable={true}
              returnKeyType="go" selectionColor="#65CAFF" style={{ color: '#8696B0', fontSize: 15, height: 40, paddingLeft: 2 }} placeholderTextColor="#8696B0"
              placeholder="重复密码" underlineColorAndroid="transparent" secureTextEntry={true} maxLength={20}
              onChangeText={(reWalletPassword) => this.setState({ reWalletPassword })}
            />
          </View>
          <View style={{ height: 0.5, backgroundColor: '#43536D', flex: 1, flexDirection: 'column', }}></View>
          <View style={{ padding: 20, height: 55, backgroundColor: '#586888' }} >
            <TextInput ref={(ref) => this._lpass = ref} autoFocus={false} editable={true}
              value={this.state.passwordNote}
              returnKeyType="go" selectionColor="#65CAFF" style={{ color: '#8696B0', fontSize: 15, height: 40, paddingLeft: 2 }} placeholderTextColor="#8696B0"
              placeholder="密码提示(可不填)" underlineColorAndroid="transparent" secureTextEntry={true} maxLength={20}
              onChangeText={(passwordNote) => this.setState({ passwordNote })}
            />
          </View>
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 20, }}>
          <TouchableHighlight underlayColor={'transparent'} onPress={() => this.checkClick()}>
            <Image source={this.state.isChecked ? UImage.aab1 : UImage.aab2} style={{ width: 20, height: 20, }} />
          </TouchableHighlight>
          <Text style={styles.welcome} style={{ fontSize: 15, color: '#8696B0', marginLeft: 10 }}>我已经仔细阅读并同意</Text>
          <Text onPress={() => this.prot()} style={{ fontSize: 15, color: '#65CAFF', marginLeft: 5 }}>服务及隐私条款</Text>
        </View>
        <Button onPress={() => this.createWallet()}>
          <View style={{ height: 45, backgroundColor: '#65CAFF', justifyContent: 'center', alignItems: 'center', margin: 20, borderRadius: 5 }}>
            <Text style={{ fontSize: 15, color: '#fff' }}>创建钱包</Text>
          </View>
        </Button>
      </View>
      {/* </ScrollView> */}
    </View>
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: UColor.secdColor,
  },

});

export default Set;
