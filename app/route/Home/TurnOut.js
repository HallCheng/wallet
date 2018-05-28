import React from 'react';
import { connect } from 'react-redux'
import { NativeModules, StatusBar, BackHandler, DeviceEventEmitter, InteractionManager, Clipboard, ListView, StyleSheet, Image, ScrollView, View, RefreshControl, Text, TextInput, Platform, Dimensions, Modal, TouchableHighlight, } from 'react-native';
import { TabViewAnimated, TabBar, SceneMap } from 'react-native-tab-view';
import store from 'react-native-simple-store';
import UColor from '../../utils/Colors'
import Button from '../../components/Button'
import UImage from '../../utils/Img'
const maxHeight = Dimensions.get('window').height;
import { EasyDialog } from "../../components/Dialog"
import { EasyToast } from '../../components/Toast';

import { Eos } from "react-native-eosjs";

var AES = require("crypto-js/aes");
var CryptoJS = require("crypto-js");

@connect(({ wallet }) => ({ ...wallet }))
class TurnOut extends React.Component {
    static navigationOptions = ({ navigation }) => {
        const params = navigation.state.params || {};
        return {
            // headerTitle: '转出' + params.coins.name,
            headerTitle: '转出EOS',
            headerStyle: {
                backgroundColor: "#586888",
                paddingTop: 20,
            },
        };
    };

    //组件加载完成
    componentDidMount() {
        const c = this.props.navigation;
        this.props.dispatch({
            type: 'wallet/getDefaultWallet', callback: (data) => {
                if (data != null && data.defaultWallet.account != null) {
                    this.getBalance(data);
                } else {
                    EasyToast.show('获取账号信息失败');
                }
            }
        });
        var params = this.props.navigation.state.params.coins;
        this.setState({
            toAccount: params.toaccount,
            amount: params.amount == null ? '' : params.amount,
            name: params.name,
        })
    }

    getBalance(data) {
        this.props.dispatch({
            type: 'wallet/getBalance', payload: { contract: "eosio.token", account: data.defaultWallet.account, symbol: 'EOS' }, callback: (data) => {
                if (data.code == '0') {
                    if (data.data == "") {
                        this.setState({ balance: '0.0000' })
                    } else {
                        this.setState({ balance: data.data })
                    }
                } else {
                    EasyToast.show('获取余额失败：' + data.msg);
                }
            }
        })
    }

    onPress(action) {
        EasyDialog.show("温馨提示", "部分功能将于6月份EOS上线主网后开通，敬请期待！", "知道了", null, () => { EasyDialog.dismis() });
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

    // 构造函数  
    constructor(props) {
        super(props);
        this.state = {
            show: false,
            toAccount: '',
            amount: '',
            note: '',
            defaultWallet: null,
            balance: 0,
            name: '',
        };
    }

    goPage(coinType) {
        const { navigate } = this.props.navigation;
        navigate('Thin', { coinType });
    }
    inputPwd = () => {

        if (this.state.toAccount == "") {
            EasyToast.show('请输入收款账号');
            return;
        }
        if (this.state.toAccount.length > 12) {
            EasyToast.show('请输入正确的收款账号');
            return;
        }
        if (this.state.amount == "") {
            EasyToast.show('请输入转账数量');
            return;
        }

        // if (this.state.amount > this.state.balance) {
        //     EasyToast.show('转账金额超出账户余额');
        //     return;
        // }

        this._setModalVisible();

        const view =
            <View style={{ flexDirection: 'row' }}>
                <TextInput autoFocus={true} onChangeText={(password) => this.setState({ password })} returnKeyType="go" selectionColor="#65CAFF"
                    secureTextEntry={true}
                    keyboardType="ascii-capable" style={{ color: '#65CAFF', marginLeft: 10, width: 120, height: 45, fontSize: 15, backgroundColor: '#EFEFEF' }}
                    placeholderTextColor="#8696B0" placeholder="请输入密码" underlineColorAndroid="transparent" />
            </View>

        EasyDialog.show("密码", view, "确认", "取消", () => {

            if (this.state.password == "") {
                EasyToast.show('请输入密码');
                return;
            }
            var privateKey = this.props.defaultWallet.activePrivate;
            try {
                var bytes_privateKey = CryptoJS.AES.decrypt(privateKey, this.state.password + this.props.defaultWallet.salt);
                var plaintext_privateKey = bytes_privateKey.toString(CryptoJS.enc.Utf8);

                if (plaintext_privateKey.indexOf('eostoken') != -1) {
                    plaintext_privateKey = plaintext_privateKey.substr(8, plaintext_privateKey.length);
                    Eos.transfer(this.props.defaultWallet.account, this.state.toAccount, this.state.amount + " EOS", "", plaintext_privateKey, false, (r) => {
                        this.props.dispatch({
                            type: 'wallet/pushTransaction', payload: r.data.transaction, callback: (data) => {
                                if (data.code == '0') {
                                    EasyToast.show('交易成功');
                                    DeviceEventEmitter.emit('transaction_success');
                                    this.props.navigation.goBack();
                                } else {
                                    EasyToast.show('交易失败');
                                }
                            }
                        });
                    });
                    //     }
                    // });
                } else {
                    EasyToast.show('密码错误');
                }
            } catch (e) {
                EasyToast.show('密码错误');
            }
            EasyDialog.dismis();
        }, () => { EasyDialog.dismis() });
    }

    chkLast(obj) {
        if (obj.substr((obj.length - 1), 1) == '.') {
            obj = obj.substr(0, (obj.length - 1));
        }
    }

    chkPrice(obj) {
        obj = obj.replace(/[^\d.]/g, "");
        obj = obj.replace(/^\./g, "");
        obj = obj.replace(/\.{2,}/g, ".");
        obj = obj.replace(".", "$#$").replace(/\./g, "").replace("$#$", ".");
        return obj;
    }

    render() {
        const c = this.props.navigation.state.params.coins;
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={{ fontSize: 20, color: '#fff' }}>{this.state.balance + ' ' + this.state.name}</Text>
                    {/* <Text style={{ fontSize: 14, color: '#8696B0', marginTop: 5 }}>≈ {c.value} ￥</Text> */}
                </View>

                <View style={styles.tab2}>
                    <View style={{ backgroundColor: '#43536D', flexDirection: 'column', padding: 20, flex: 1, }}>
                        <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#586888', marginBottom: 10, paddingLeft: 10, }}>
                            <View style={{ height: 40, flex: 1, justifyContent: 'center', }} >
                                <TextInput value={this.state.toAccount}
                                    onChangeText={(toAccount) => this.setState({ toAccount })}
                                    returnKeyType="next" selectionColor="#65CAFF" style={{ color: '#8696B0', fontSize: 15, height: 40, paddingLeft: 2 }}
                                    placeholderTextColor="#8696B0" placeholder="收款人地址" underlineColorAndroid="transparent" />
                            </View>
                        </View>
                        <View style={{ height: 0.5, backgroundColor: '#43536D' }}></View>
                        <View style={{ paddingLeft: 10, height: 40, marginBottom: 10, borderBottomWidth: 1, borderBottomColor: '#586888', justifyContent: 'center', }} >
                            <TextInput value={this.state.amount}
                                onChangeText={(amount) => this.setState({ amount: this.chkPrice(amount) })}
                                returnKeyType="next" selectionColor="#65CAFF" style={{ color: '#8696B0', fontSize: 15, height: 40, paddingLeft: 2 }} placeholderTextColor="#8696B0" placeholder="转账金额" underlineColorAndroid="transparent" keyboardType="numeric" maxLength={10} />
                        </View>
                        <View style={{ height: 0.5, backgroundColor: '#43536D' }}></View>

                        <View style={{ paddingLeft: 10, height: 40, marginBottom: 10, borderBottomWidth: 1, borderBottomColor: '#586888', justifyContent: 'center', }} >
                            <TextInput value={this.state.note}
                                onChangeText={(note) => this.setState({ note })}
                                returnKeyType="next" selectionColor="#65CAFF" style={{ color: '#8696B0', fontSize: 15, height: 40, paddingLeft: 2, }} placeholderTextColor="#8696B0" placeholder="备注" underlineColorAndroid="transparent" maxLength={20} />
                        </View>
                        <View style={{ height: 0.5, backgroundColor: '#43536D' }}></View>
                        <Button onPress={this._rightButtonClick.bind(this)} style={{ height: 85, marginTop: 200, }}>
                            <View style={{ height: 45, backgroundColor: '#65CAFF', justifyContent: 'center', alignItems: 'center', margin: 20, borderRadius: 5 }}>
                                <Text style={{ fontSize: 15, color: '#fff' }}>下一步</Text>
                            </View>
                        </Button>
                    </View>
                </View>

                <View style={styles.pupuo}>
                    <Modal animationType='none' transparent={true} visible={this.state.show} onShow={() => { }} onRequestClose={() => { }} >
                        <View style={styles.modalStyle}>
                            <View style={styles.subView} >
                                <Button style={styles.buttonView} onPress={this._setModalVisible.bind(this)}>
                                    <Text style={{ width: 30, height: 30, marginBottom: 0, color: '#CBCBCB', fontSize: 28, }}>×</Text>
                                </Button>
                                {/* <Text style={styles.titleText}>转出 {c.name}</Text> */}
                                <Text style={styles.contentText}>标签名称：{this.state.note}</Text>
                                <Text style={styles.contentText}>转出地址：{this.state.toAccount}</Text>
                                <Text style={styles.contentText}> 数量：{this.state.amount}</Text>
                                <Button onPress={() => { this.inputPwd() }}>
                                    <View style={{ margin: 10, height: 40, borderRadius: 6, backgroundColor: '#65CAFF', justifyContent: 'center', alignItems: 'center' }}>
                                        <Text style={{ fontSize: 16, color: '#fff' }}>确认转出</Text>
                                    </View>
                                </Button>
                            </View>
                        </View>
                    </Modal>
                </View>
            </View>
        )
    }
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: UColor.secdColor,
        paddingTop: 5,
    },
    header: {
        height: 110,
        justifyContent: "center",
        alignItems: "center",
        margin: 5,
        borderRadius: 5,
        backgroundColor: '#586888',
    },
    row: {
        height: 90,
        backgroundColor: UColor.mainColor,
        flexDirection: "column",
        padding: 10,
        justifyContent: "space-between",
        borderRadius: 5,
        margin: 5,
    },
    top: {
        flex: 1,
        flexDirection: "row",
        alignItems: 'center',
    },
    footer: {
        height: 50,
        flexDirection: 'row',
        position: 'absolute',
        backgroundColor: '#43536D',
        bottom: 0,
        left: 0,
        right: 0,
    },

    pupuo: {
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
        marginBottom: 10,
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    // 内容  
    contentText: {
        marginLeft: 15,
        marginRight: 15,
        lineHeight: 30,
        fontSize: 14,
        textAlign: 'left',

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


})
export default TurnOut;