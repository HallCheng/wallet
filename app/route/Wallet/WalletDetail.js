import React from 'react';
import { connect } from 'react-redux'
import { Dimensions, DeviceEventEmitter, InteractionManager, ListView, StyleSheet, View, RefreshControl, Clipboard, Text, ScrollView, Image, Platform, StatusBar, TextInput, Modal } from 'react-native';
import { TabViewAnimated, TabBar, SceneMap } from 'react-native-tab-view';
import UColor from '../../utils/Colors'
import Button from '../../components/Button'
import Item from '../../components/Item'
import Icon from 'react-native-vector-icons/Ionicons'
import UImage from '../../utils/Img'
import { EasyLoading } from '../../components/Loading';
import { EasyToast } from '../../components/Toast';
import { EasyDialog } from '../../components/Dialog';

var AES = require("crypto-js/aes");
var CryptoJS = require("crypto-js");

@connect(({ wallet }) => ({ ...wallet }))
class Set extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const params = navigation.state.params || {};
    return {
      headerTitle: params.data.name,
      headerStyle: {
        backgroundColor: "#586888",
        paddingTop: 20,
      },

    };
  };


  constructor(props) {
    super(props);
    this.config = [
      { first: true, name: "修改密码", onPress: this.goPage.bind(this, "ModifyPassword") },
      { first: true, name: "导出私钥", onPress: this.goPage.bind(this, "ExportPrivateKey") },
    ];
    this.state = {
      password: '',
      show: false,
      txt_owner: '',
      txt_active: ''
    }
    DeviceEventEmitter.addListener('modify_password', () => {
      this.props.navigation.goBack();
    });
  }

  _rightButtonClick() {
    //   console.log('右侧按钮点击了');  
    this._setModalVisible();
  }

  // 显示/隐藏 modal  
  _setModalVisible() {
    let isShow = this.state.show;
    this.setState({
      show: !isShow,
    });
  }

  goPage(key, data = {}) {
    const { navigate, goBack } = this.props.navigation;

    if (key == 'ExportPrivateKey') {
      const view =
        <View style={{ flexDirection: 'row' }}>
          <TextInput autoFocus={true} onChangeText={(password) => this.setState({ password })} returnKeyType="go" selectionColor="#65CAFF"
            secureTextEntry={true}
            keyboardType="ascii-capable" style={{ color: '#65CAFF', marginLeft: 10, width: 120, height: 45, fontSize: 15, backgroundColor: '#EFEFEF' }}
            placeholderTextColor="#8696B0" placeholder="请输入密码" underlineColorAndroid="transparent" />
        </View>

      EasyDialog.show("密码", view, "确定", "取消", () => {

        if (this.state.password == "") {
          EasyToast.show('请输入密码');
          return;
        }

        try {


          var ownerPrivateKey = this.props.navigation.state.params.data.ownerPrivate;
          var bytes_words_owner = CryptoJS.AES.decrypt(ownerPrivateKey.toString(), this.state.password + this.props.navigation.state.params.data.salt);
          var plaintext_words_owner = bytes_words_owner.toString(CryptoJS.enc.Utf8);

          var activePrivateKey = this.props.navigation.state.params.data.activePrivate;
          var bytes_words_active = CryptoJS.AES.decrypt(activePrivateKey.toString(), this.state.password + this.props.navigation.state.params.data.salt);
          var plaintext_words_active = bytes_words_active.toString(CryptoJS.enc.Utf8);

          if (plaintext_words_owner.indexOf('eostoken') != - 1) {
            plaintext_words_active = plaintext_words_active.substr(8, plaintext_words_active.length);
            plaintext_words_owner = plaintext_words_owner.substr(8, plaintext_words_owner.length);

            this.setState({
              txt_active: plaintext_words_active,
              txt_owner: plaintext_words_owner
            });

            this._setModalVisible();
            // alert('解锁成功' + plaintext_words);
            // this.toBackup(wordsArr);
          } else {
            EasyToast.show('您输入的密码不正确');
          }
        } catch (error) {
          EasyToast.show('您输入的密码不正确');
        }
        EasyDialog.dismis();
      }, () => { EasyDialog.dismis() });
    } else if (key == 'ModifyPassword') {
      navigate('ModifyPassword', this.props.navigation.state.params.data);
    } else {
      // EasyDialog.show("温馨提示", "该功能将于EOS主网上线后开通。", "知道了", null, () => { EasyDialog.dismis() });
    }
  }

  importWallet() {
    const { navigate, goBack } = this.props.navigation;
    navigate('ImportKey', this.props.navigation.state.params.data);
  }

  copy() {
    let isShow = this.state.show;
    this.setState({
      show: !isShow,
    });
    Clipboard.setString('OwnerPrivateKey: ' + this.state.txt_owner + 'ActivePrivateKey: ' + this.state.txt_active);
    EasyToast.show("复制成功")
  }

  deleteWallet() {
    const view =
      <View style={{ flexDirection: 'row' }}>
        <TextInput autoFocus={true} onChangeText={(password) => this.setState({ password })} returnKeyType="go" selectionColor="#65CAFF"
          secureTextEntry={true}
          keyboardType="ascii-capable" style={{ color: '#65CAFF', marginLeft: 10, width: 120, height: 45, fontSize: 15, backgroundColor: '#EFEFEF' }}
          placeholderTextColor="#8696B0" placeholder="请输入密码" underlineColorAndroid="transparent" />
      </View>

    EasyDialog.show("密码", view, "确定", "取消", () => {

      if (this.state.password == "") {
        EasyToast.show('请输入密码');
        return;
      }

      try {

        var data = this.props.navigation.state.params.data;
        var ownerPrivateKey = this.props.navigation.state.params.data.ownerPrivate;
        var bytes_words = CryptoJS.AES.decrypt(ownerPrivateKey.toString(), this.state.password + this.props.navigation.state.params.data.salt);
        var plaintext_words = bytes_words.toString(CryptoJS.enc.Utf8);

        if (plaintext_words.indexOf('eostoken') != - 1) {
          plaintext_words = plaintext_words.substr(8, plaintext_words.length);
          const { dispatch } = this.props;
          this.props.dispatch({ type: 'wallet/delWallet', payload: { data } });

          DeviceEventEmitter.addListener('delete_wallet', (tab) => {
            this.props.navigation.goBack();
          });
        } else {
          EasyToast.show('您输入的密码不正确');
        }
      } catch (error) {
        EasyToast.show('您输入的密码不正确');
      }
      EasyDialog.dismis();
    }, () => { EasyDialog.dismis() });
  }

  backupWords() {
    const view =
      <View style={{ flexDirection: 'row' }}>
        <TextInput autoFocus={true} onChangeText={(password) => this.setState({ password })} returnKeyType="go" selectionColor="#65CAFF"
          secureTextEntry={true}
          keyboardType="ascii-capable" style={{ color: '#65CAFF', marginLeft: 10, width: 120, height: 45, fontSize: 15, backgroundColor: '#EFEFEF' }}
          placeholderTextColor="#8696B0" placeholder="请输入密码" underlineColorAndroid="transparent"/>
      </View>

    EasyDialog.show("密码", view, "备份", "取消", () => {

      if (this.state.password == "") {
        EasyToast.show('请输入密码');
        return;
      }

      try {


        var _words = this.props.navigation.state.params.data.words;
        var bytes_words = CryptoJS.AES.decrypt(_words.toString(), this.state.password + this.props.navigation.state.params.data.salt);
        var plaintext_words = bytes_words.toString(CryptoJS.enc.Utf8);

        var words_active = this.props.navigation.state.params.data.words_active;
        var bytes_words = CryptoJS.AES.decrypt(words_active.toString(), this.state.password + this.props.navigation.state.params.data.salt);
        var plaintext_words_active = bytes_words.toString(CryptoJS.enc.Utf8);

        if (plaintext_words.indexOf('eostoken') != -1) {
          plaintext_words = plaintext_words.substr(9, plaintext_words.length);
          var wordsArr = plaintext_words.split(',');

          plaintext_words_active = plaintext_words_active.substr(9, plaintext_words_active.length);
          var wordsArr_active = plaintext_words_active.split(',');

          this.toBackup({ words_owner: wordsArr, words_active: wordsArr_active });
        } else {
          EasyToast.show('您输入的密码不正确');
        }
      } catch (error) {
        EasyToast.show('您输入的密码不正确');
      }
      EasyDialog.dismis();
    }, () => { EasyDialog.dismis() });
  }

  toBackup = (words) => {
    this.props.navigation.goBack();
    const { navigate } = this.props.navigation;
    navigate('BackupWords', { words_owner: words.words_owner, words_active: words.words_active, wallet: this.props.navigation.state.params });
  }

  _renderListItem() {
    return this.config.map((item, i) => {
      return (<Item key={i} {...item} />)
    })
  }


  render() {
    return <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View>
          <View style={{ padding: 20, height: 120, backgroundColor: '#586888', margin: 10, borderRadius: 5, }}>
            <View style={{ justifyContent: 'center', alignItems: 'center', }} >
              {/* <Text style={{ fontSize: 17, color: '#FFFFFF', marginBottom: 5, }}></Text> */}
              <Text style={{ fontSize: 17, color: '#8696B0', marginBottom: 10, }}> {this.props.navigation.state.params.data.account}</Text>
            </View>
            <Text style={{ fontSize: 15, color: '#8696B0' }}>钱包名称：{this.props.navigation.state.params.data.name}</Text>
          </View>

          <View style={{ marginBottom: 50 }}>
            {this._renderListItem()}
          </View>

          <Button onPress={() => this.backupWords()} style={{ flex: 1 }}>
            <View style={{ height: 45, backgroundColor: '#65CAFF', justifyContent: 'center', alignItems: 'center', margin: 20, borderRadius: 5 }}>
              <Text style={{ fontSize: 15, color: '#fff' }}>备份助记词</Text>
            </View>
          </Button>
          <Button onPress={() => this.deleteWallet()} style={{ flex: 1 }}>
            <View style={{ height: 45, backgroundColor: '#65CAFF', justifyContent: 'center', alignItems: 'center', marginLeft: 20, marginRight: 20, borderRadius: 5 }}>
              <Text style={{ fontSize: 15, color: '#fff' }}>删除钱包</Text>
            </View>
          </Button>
        </View>
      </ScrollView>
      <View style={styles.pupuo}>
        <Modal animationType='slide' transparent={true} visible={this.state.show} onShow={() => { }} onRequestClose={() => { }} >
          <View style={styles.modalStyle}>
            <View style={styles.subView} >
              <Button style={{ alignItems: 'flex-end', }} onPress={this._setModalVisible.bind(this)}>
                <Text style={styles.closeText}>×</Text>
              </Button>
              <Text style={styles.titleText}>备份钱包</Text>
              {/* <Text style={styles.noticeText}>安全警告：私钥未经加密，导出存在风险，建议使用助记词和Keystore进行备份。</Text> */}
              <View style={styles.contentText}>
                <Text style={styles.textContent}>OwnerPrivateKey: {this.state.txt_owner}</Text>
              </View>
              <View style={styles.contentText}>
                <Text style={styles.textContent}>ActivePrivateKey: {this.state.txt_active}</Text>
              </View>
              <Button onPress={() => { this.copy() }}>
                <View style={styles.buttonView}>
                  <Text style={styles.buttonText}>复制</Text>
                </View>
              </Button>
            </View>
          </View>
        </Modal>
      </View>
    </View>
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: UColor.secdColor,
  },

  pupuo: {
    backgroundColor: '#ECECF0',
  },
  // modal的样式  
  modalStyle: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  // modal上子View的样式  
  subView: {
    marginLeft: 10,
    marginRight: 10,
    backgroundColor: '#fff',
    alignSelf: 'stretch',
    justifyContent: 'center',
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: '#ccc',
  },
  closeText: {
    width: 30,
    height: 30,
    marginBottom: 0,
    color: '#CBCBCB',
    fontSize: 28,
  },
  // 标题  
  titleText: {
    color: '#000000',
    marginBottom: 5,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  //警告提示  
  noticeText: {
    color: '#F45353',
    fontSize: 14,
    marginLeft: 15,
    marginRight: 15,
    textAlign: 'left',
  },
  // 内容  
  contentText: {
    margin: 20,
    alignItems: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: "row",
  },
  textContent: {
    color: '#999999',
    fontSize: 14,
    textAlign: 'left',
    lineHeight: 25,
  },
  // 按钮  
  buttonView: {
    margin: 10,
    height: 46,
    borderRadius: 6,
    backgroundColor: '#65CAFF',
    justifyContent: 'center',
    alignItems: 'center'
  },
  buttonText: {
    fontSize: 16,
    color: '#fff'
  },

});

export default Set;
