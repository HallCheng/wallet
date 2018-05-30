import React from 'react';
import { connect } from 'react-redux'
import { DeviceEventEmitter, ListView, StyleSheet, Image, View, Text, Platform, Modal, Animated, TouchableOpacity, Easing, Clipboard } from 'react-native';
import { TabViewAnimated, TabBar, SceneMap } from 'react-native-tab-view';
import store from 'react-native-simple-store';
import UColor from '../../utils/Colors'
import Button from '../../components/Button'
import Echarts from 'native-echarts'
import UImage from '../../utils/Img'
import QRCode from 'react-native-qrcode-svg';
var Dimensions = require('Dimensions')
var ScreenWidth = Dimensions.get('window').width;
const maxHeight = Dimensions.get('window').height;
import { EasyToast } from "../../components/Toast"
import { EasyDialog } from "../../components/Dialog"
import { EasyLoading } from '../../components/Loading';
import { Eos } from "react-native-eosjs";

@connect(({ wallet }) => ({ ...wallet }))
class Home extends React.Component {

  static navigationOptions = {
    title: '钱包',
    header: null
  };

  constructor(props) {
    super(props);
    this.state = {
      status: 'rgba(255, 255, 255,0)',
      dataSource: new ListView.DataSource({ rowHasChanged: (row1, row2) => row1 !== row2 }),
      fadeAnim: new Animated.Value(15),  //设置初始值
      modal: false,
      balance: 0,
      account: 'xxxx',
      show: false,
    };
  }

  componentDidMount() {
    //加载地址数据
    this.props.dispatch({ type: 'wallet/info', payload: { address: "1111" } });
    Animated.timing(
      this.state.fadeAnim,  //初始值
      {
        toValue: 22,            //结束值
        duration: 2000,        //动画时间
        easing: Easing.linear,
      },
    ).start();               //开始
    DeviceEventEmitter.addListener('wallet_info', (data) => {
      this.getBalance();
    });
    DeviceEventEmitter.addListener('updateDefaultWallet', (data) => {
      this.props.dispatch({ type: 'wallet/info', payload: { address: "1111" } });
      this.getBalance();
    });
  }

  getBalance() {
    if (this.props.defaultWallet != null && this.props.defaultWallet.name != null) {
      this.props.dispatch({
        type: 'wallet/getBalance', payload: { contract: "eosio.token", account: this.props.defaultWallet.name, symbol: 'EOS' }, callback: (data) => {
          if (data.code == '0') {
            if (data.data == "") {
              this.setState({
                balance: '0.0000 EOS',
                account: this.props.defaultWallet.name
              })
            } else {
              account: this.props.defaultWallet.name,
                this.setState({ balance: data.data })
            }
          } else {
            EasyToast.show('获取余额失败：' + data.msg);
          }
        }
      })
    } else {
      this.setState({ balance: '0.0000 EOS', account: 'xxxx' })
      // this.props.defaultWallet.name = 'xxxx';
      //   EasyDialog.show("温馨提示", "您还没有创建钱包", "创建一个", "取消", () => {
      //   this.createWallet();
      //   EasyDialog.dismis()
      // }, () => { EasyDialog.dismis() });
    }
  }

  onRequestClose() {
    this.setState({
      modal: false
    });
  }

  onPress(action) {
    EasyDialog.show("温馨提示", "部分功能将于6月份EOS上线主网后开通，敬请期待！", "知道了", null, () => { EasyDialog.dismis() });
  }

  scan() {
    if (this.props.defaultWallet != null && this.props.defaultWallet.name != null) {
      const { navigate } = this.props.navigation;
      navigate('BarCode', {});
    } else {
      EasyDialog.show("温馨提示", "您还没有创建钱包", "创建一个", "取消", () => {
        this.createWallet();
        EasyDialog.dismis()
      }, () => { EasyDialog.dismis() });
    }
  }

  qr() {
    if (this.props.defaultWallet != null && this.props.defaultWallet.name != null) {
      this._setModalVisible();
    } else {
      EasyDialog.show("温馨提示", "您还没有创建钱包", "创建一个", "取消", () => {
        this.createWallet();
        EasyDialog.dismis()
      }, () => { EasyDialog.dismis() });
    }

  }

  _setModalVisible() {
    let isShow = this.state.show;
    this.setState({
      show: !isShow,
    });
  }

  copy = () => {
    let address;
    if (this.props.defaultWallet != null && this.props.defaultWallet.account != null) {
      address = this.props.defaultWallet.account;
    } else {
      address = this.state.account;
    }
    Clipboard.setString(address);
    EasyToast.show("复制成功");
  }

  createWallet() {
    const { navigate } = this.props.navigation;
    navigate('CreateWallet', {});
    this.setState({
      modal: false
    });
  }

  walletDetail() {
    // EasyDialog.show("温馨提示", "部分功能将于6月份EOS上线主网后开通，敬请期待！", "知道了", null, () => { EasyDialog.dismis() });
    const { navigate } = this.props.navigation;
    navigate('WalletManage', {});
  }

  changeWallet(data) {
    this.setState({
      modal: false
    });
    const { dispatch } = this.props;
    this.props.dispatch({ type: 'wallet/changeWallet', payload: { data } });
    this.props.dispatch({ type: 'wallet/info', payload: { address: "1111" } });
  }

  coinInfo(coinType) {
    if (this.props.defaultWallet == null || this.props.defaultWallet.account == null) {
      //todo 创建钱包引导
      EasyDialog.show("温馨提示", "您还没有创建钱包", "创建一个", "取消", () => {
        // EasyToast.show('创建钱包');
        this.createWallet();
        EasyDialog.dismis()
      }, () => { EasyDialog.dismis() });
      return;
    }
    const { navigate } = this.props.navigation;
    navigate('Info', { coinType, balance: this.state.balance, account: this.props.defaultWallet.name });
  }

  render() {
    return (
      <View style={styles.container}>
        <ListView
          initialListSize={1}
          renderSeparator={(sectionID, rowID) => <View key={`${sectionID}-${rowID}`} style={{ height: 0.5, backgroundColor: UColor.secdColor }} />}
          onScroll={(event) => {
            if (event.nativeEvent.contentOffset.y > 280) {
              this.setState({
                status: 'rgba(0, 0, 0,0.3)'
              });
            } else {
              this.setState({
                status: 'rgba(255, 255, 255,0)'
              });
            }
          }
          }
          enableEmptySections={true}
          dataSource={this.state.dataSource.cloneWithRows((this.props.list == null ? [] : this.props.list))}
          renderHeader={() => (
            <View style={styles.header}>
              <Image source={UImage.home_bg} style={styles.homebg} />
              <View style={{ paddingTop: 20 }}>
                <View><Text style={styles.top}>资产</Text></View>
                <View style={styles.topbtn}>
                  <Button onPress={() => this.scan()}>
                    <Image source={UImage.scan} style={styles.imgBtn} />
                  </Button>
                  <Button onPress={() => this.setState({ modal: !this.state.modal })}>
                    <Image source={UImage.wallet} style={styles.imgBtn} />
                  </Button>
                </View>
                <Modal animationType={'none'} transparent={true} onRequestClose={() => { this.onRequestClose() }} visible={this.state.modal}>
                  <TouchableOpacity onPress={() => this.setState({ modal: false })} style={{ flex: 1, justifyContent: 'center', alignItems: 'flex-end' }}>
                    <View style={{ width: ScreenWidth / 2, height: maxHeight, backgroundColor: '#4D607E', alignItems: 'center', paddingTop: 50, }}>
                      <ListView
                        initialListSize={5}
                        style={{ width: '100%', borderBottomWidth: 1, borderBottomColor: '#4D607E', }}
                        renderSeparator={(sectionID, rowID) => <View key={`${sectionID}-${rowID}`} style={{ height: 0.5, backgroundColor: UColor.secdColor }} />}
                        enableEmptySections={true}
                        dataSource={this.state.dataSource.cloneWithRows(this.props.walletList == null ? [] : this.props.walletList)}
                        renderRow={(rowData) => (
                          <Button onPress={this.changeWallet.bind(this, rowData)}>
                            <View style={styles.walletlist} backgroundColor={(this.props.defaultWallet == null || this.props.defaultWallet.name == rowData.account) ? '#586888' : '#4D607E'}>
                              <Text style={{ color: '#EFEFEF', lineHeight: 28, }}>{rowData.name}</Text>
                              <Text style={{ color: '#8594AB', lineHeight: 28, }} numberOfLines={1} ellipsizeMode='middle'>{rowData.account}</Text>
                            </View>
                          </Button>
                        )}
                      />
                      <View style={{ width: '100%', height: maxHeight / 2.5, flexDirection: "column", paddingLeft: 20, paddingTop: 15, alignItems: 'flex-start', borderTopWidth: 1, borderTopColor: '#586888', }}>
                        <Button onPress={() => this.createWallet()} style={{ height: 40, }}>
                          <View style={{ flex: 1, flexDirection: "row", }}>
                            <Image source={UImage.wallet_1} style={{ width: 25, height: 25, }} />
                            <Text style={{ marginLeft: 20, fontSize: 15, color: '#8594AB', }}>创建钱包</Text>
                          </View>
                        </Button>
                        {/* <Button onPress={() => this.walletTest()} style={{ height: 40, }}>
                          <View style={{ flex: 1, flexDirection: "row", }}>
                            <Image source={UImage.wallet_1} style={{ width: 25, height: 25, }} />
                            <Text style={{ marginLeft: 20, fontSize: 15, color: '#8594AB', }}>钱包测试</Text>
                          </View>
                        </Button> */}
                      </View>
                    </View>
                  </TouchableOpacity>
                </Modal>

                <View style={styles.pupuo}>
                  <Modal animationType='slide' transparent={true} visible={this.state.show} onShow={() => { }} onRequestClose={() => { }} >
                    <View style={styles.modalStyle}>
                      <View style={styles.subView} >
                        <Button style={styles.buttonView} onPress={this._setModalVisible.bind(this)}>
                          <Text style={{ width: 30, height: 30, marginBottom: 0, color: '#CBCBCB', fontSize: 28, }}>×</Text>
                        </Button>
                        <Text style={styles.titleText}>收款码</Text>
                        <Text style={styles.contentText}>{((this.props.defaultWallet == null || this.props.defaultWallet.name == null) ? this.state.account : this.props.defaultWallet.name)}</Text>
                        <Text style={{ color: '#F45353', fontSize: 12, textAlign: 'center', }}>提示：扫码同样可获取地址</Text>
                        <View style={{ margin: 10, alignItems: 'center', justifyContent: 'center', alignItems: 'center', flexDirection: "row", }}>
                          <View style={{ flex: 1, }} />
                          <QRCode size={200} style={{ width: 200, }} value={'{\"contract\":\"eos\",\"toaccount\":\"' + ((this.props.defaultWallet == null || this.props.defaultWallet.name == null) ? this.state.account : this.props.defaultWallet.name) + '\",\"symbol\":\"EOS\"}'} />
                          <View style={{ flex: 1, }} />
                        </View>
                        <Button onPress={() => { this.copy() }}>
                          <View style={{ margin: 10, height: 40, borderRadius: 6, backgroundColor: '#65CAFF', justifyContent: 'center', alignItems: 'center' }}>
                            <Text style={{ fontSize: 16, color: '#fff' }}>复制地址</Text>
                          </View>
                        </Button>
                      </View>
                    </View>
                  </Modal>
                </View>
                <View>
                  {
                    this.props.totalOpt != undefined && <Echarts ba option={this.props.totalOpt} height={Platform.OS == 'ios' ? 200 : 215} width={ScreenWidth} />
                  }
                  {
                    this.props.total != undefined && (<View style={styles.totalbg}>
                      <Button>
                        <View style={{ width: 200, height: 200, justifyContent: "center", alignItems: "center" }}>
                          <Text style={{ fontSize: 14, color: '#fff' }}>{(this.props.defaultWallet == null || this.props.defaultWallet.name == null) ? this.state.account : this.props.defaultWallet.name}</Text>
                          <Text style={{ fontSize: 21, color: '#fff', marginTop: 15, marginBottom: 15 }}>{this.state.balance}</Text>
                        </View>
                      </Button>
                    </View>)
                  }
                </View>

                <View style={styles.botbtn}>
                  <Button onPress={() => this.qr()}>
                    <Image source={UImage.qr} style={styles.imgBtn} />
                  </Button>
                  <Button onPress={this.onPress.bind('add', this)}>
                    <Image source={UImage.add} style={styles.imgBtn} />
                  </Button>
                </View>
              </View>
            </View>
          )}
          renderRow={(rowData) => (
            <Button onPress={this.coinInfo.bind(this, rowData)}>
              <View style={styles.row}>
                <View style={styles.left}>
                  <Image source={{ uri: rowData.img }} style={{ width: 25, height: 25 }} />
                  <Text style={{ marginLeft: 20, fontSize: 18, color: UColor.fontColor }}>{rowData.name}</Text>
                </View>
                <View style={styles.right}>
                  <View style={{ flex: 1, flexDirection: "row", justifyContent: "flex-end", alignItems: 'center', }}>
                    <View>
                      <Text style={{ fontSize: 18, color: UColor.fontColor, textAlign: 'right' }}>{this.state.balance}</Text>
                      {/* <Text style={{ fontSize: 12, color: "#8696B0", textAlign: 'right', marginTop: 3 }}>≈ {rowData.value} ￥</Text> */}
                    </View>
                    <View style={{ marginLeft: 15, overflow: 'hidden' }}>
                      <Echarts style={{ overflow: 'hidden' }} option={rowData.opt} height={40} width={40} />
                    </View>
                  </View>
                </View>
              </View>
            </Button>
          )}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: UColor.secdColor,
  },
  header: {
    height: 300,
  },
  row: {
    flex: 1,
    backgroundColor: UColor.mainColor,
    flexDirection: "row",
    padding: 15,
    justifyContent: "space-between",
  },
  left: {
    flex: 1,
    flexDirection: "row",
    alignItems: 'center',
  },
  right: {
    flex: 1,
    flexDirection: "row",
    alignItems: 'center',
    justifyContent: "flex-end"
  },
  top: {
    height: Platform.OS == 'ios' ? 65 : 50,
    textAlign: "center",
    fontSize: 18,
    color: UColor.fontColor,
    paddingTop: Platform.OS == 'ios' ? 24 : 16
  },
  totalbg: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    height: '100%',
    width: "100%",
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 999
  },
  homebg: {
    width: Dimensions.get('window').width,
    height: 300,
    resizeMode: 'cover',
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  topbtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: 'center',
    justifyContent: "space-between",
    width: Dimensions.get('window').width,
    height: 50,
    position: 'absolute',
    left: 0,
    right: 0,
    top: Platform.OS == 'ios' ? 30 : 20,
    bottom: 0,
    flex: 1,
    paddingHorizontal: 20,
  },
  botbtn: {
    width: Dimensions.get('window').width,
    height: 50,
    alignItems: 'center',
    position: 'absolute',
    left: 0,
    right: 0,
    top: 250,
    bottom: 0,
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  imgBtn: {
    width: 28,
    height: 28
  },
  item: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  walletlist: {
    width: '100%',
    paddingLeft: 20,
    paddingRight: 10,
    height: 67,
  },
  pupuo: {
    // flex:1,  
    backgroundColor: '#ECECF0',
  },
  // modal的样式  
  modalStyle: {
    // backgroundColor:'#ccc',  
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
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
  // 标题  
  titleText: {
    marginBottom: 5,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  // 内容  
  contentText: {
    fontSize: 15,
    textAlign: 'center',
  },
  // 按钮  
  buttonView: {
    alignItems: 'flex-end',
  },
  tab1: {
    flex: 1,
  },
  tab2: {
    flex: 1,
    flexDirection: 'column',
  }
});

export default Home;
