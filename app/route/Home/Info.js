import React from 'react';
import { connect } from 'react-redux'
import { NativeModules, StatusBar, BackHandler, Clipboard, DeviceEventEmitter, InteractionManager, ListView, StyleSheet, Image, ScrollView, View, RefreshControl, Text, TextInput, Platform, Dimensions, Modal, TouchableHighlight, } from 'react-native';
import { TabViewAnimated, TabBar, SceneMap } from 'react-native-tab-view';
import store from 'react-native-simple-store';
import UColor from '../../utils/Colors'
import Button from '../../components/Button'
import Echarts from 'native-echarts'
import UImage from '../../utils/Img'
import QRCode from 'react-native-qrcode-svg';
const maxHeight = Dimensions.get('window').height;
import { EasyDialog } from "../../components/Dialog"
import { EasyToast } from '../../components/Toast';
import { Eos } from "react-native-eosjs";

@connect(({ wallet }) => ({ ...wallet }))
class Info extends React.Component {
    static navigationOptions = ({ navigation }) => {
        const params = navigation.state.params || {};
        return {
            headerTitle: params.coinType.name,
            headerStyle: {
                backgroundColor: "#586888",
                paddingTop: 20,
            },
        };
    };

    componentDidMount() {
        // EasyDialog.show("温馨提示", "部分功能将于6月份EOS上线主网后开通，敬请期待！", "知道了", null, () => { EasyDialog.dismis() });
        //加载地址数据
        const { dispatch } = this.props;
        this.props.dispatch({ type: 'wallet/getDefaultWallet' });

        DeviceEventEmitter.addListener('transfer_result', (result) => {
            // EasyToast.show('交易成功：刷新交易记录');
            // this.props.dispatch({ type: 'wallet/walletList' });
            // if (result.success) {
            //     // this.props.navigation.goBack();
            // } else {
            //     EasyToast.show('交易失败：' + result.result);
            // }
        });
    }

    onPress(action) {
        EasyDialog.show("温馨提示", "部分功能将于6月份EOS上线主网后开通，敬请期待！", "知道了", null, () => { EasyDialog.dismis() });
    }

    _rightButtonClick() {
        // EasyDialog.show("温馨提示", "转入功能正在紧急开发中，敬请期待...", "知道了", null, () => { EasyDialog.dismis() });
        this._setModalVisible();
    }

    // 显示/隐藏 modal  
    _setModalVisible() {
        let isShow = this.state.show;
        this.setState({
            show: !isShow,
        });
    }
    turnOut(coins) {
        const { navigate } = this.props.navigation;
        navigate('TurnOut', { coins, balance: this.state.balance });
    }

    // 构造函数  
    constructor(props) {
        super(props);
        this.state = {
            show: false,
            balance: this.props.navigation.state.params.balance,
        };
        DeviceEventEmitter.addListener('transaction_success', () => {
            this.getBalance();
            DeviceEventEmitter.emit('wallet_info');
        });
    }

    getBalance() {
        Eos.balance("eosio.token", this.props.defaultWallet.name, (r) => {
            try {
                this.setState({ balance: r.data[0] == null ? 0 : r.data[0] })
            } catch (e) { }
        });
    }

    copy = () => {
        let address = this.props.defaultWallet.account;
        Clipboard.setString(address);
        EasyToast.show("复制成功");
    }

    render() {
        const c = this.props.navigation.state.params.coinType;
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={{ fontSize: 20, color: '#fff' }}>{this.state.balance}</Text>
                    <Text style={{ fontSize: 14, color: '#8696B0', marginTop: 5 }}>≈ {c.value} ￥</Text>
                </View>
                <View style={styles.tab1}>
                    <Text style={{ fontSize: 14, color: '#8696B0', margin: 5 }}>最近交易记录</Text>
                    <Text style={{ fontSize: 14, color: '#8696B0', marginTop: 50, textAlign: "center", }}>交易记录功能正在紧急开发中，敬请期待...</Text>
                    {/* <ScrollView style={{ marginBottom: 45, }}>
                        <View style={styles.row}>
                            <View style={styles.top}>
                                <View style={{ flex: 3, flexDirection: "column", justifyContent: "flex-end", }}>
                                    <Text style={{ fontSize: 14, color: '#8696B0', textAlign: 'left' }}>时间：2018-5-01 15:32</Text>
                                    <Text style={{ fontSize: 14, color: '#8696B0', textAlign: 'left', marginTop: 3 }}>数量：34562.12001</Text>
                                </View>
                                <View style={{ flex: 2, flexDirection: "column", justifyContent: "flex-end", }}>
                                    <Text style={{ fontSize: 14, color: '#8696B0', textAlign: 'left' }}>类型：转出</Text>
                                    <Text style={{ fontSize: 14, color: "#8696B0", textAlign: 'left', marginTop: 3 }}>状态：完成</Text>
                                </View>
                            </View>
                            <View>
                                <Text style={{ fontSize: 14, color: "#8696B0", textAlign: 'left' }}>地址：{this.props.defaultWallet == null ? '' : this.props.defaultWallet.account}</Text>
                            </View>
                        </View>
                    </ScrollView> */}
                </View>

                <View style={styles.footer}>
                    <Button onPress={this._rightButtonClick.bind(this)} style={{ flex: 1 }}>
                        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', marginRight: 1, backgroundColor: UColor.mainColor, }}>
                            <Image source={UImage.shift_to} style={{ width: 30, height: 30 }} />
                            <Text style={{ marginLeft: 20, fontSize: 18, color: UColor.fontColor }}>转入</Text>
                        </View>
                    </Button>
                    <Button onPress={this.turnOut.bind(this, c)} style={{ flex: 1 }}>
                        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', marginLeft: 1, backgroundColor: UColor.mainColor, }}>
                            <Image source={UImage.turn_out} style={{ width: 30, height: 30 }} />
                            <Text style={{ marginLeft: 20, fontSize: 18, color: UColor.fontColor }}>转出</Text>
                        </View>
                    </Button>
                </View>
                <View style={styles.pupuo}>
                    <Modal animationType='slide' transparent={true} visible={this.state.show} onShow={() => { }} onRequestClose={() => { }} >
                        <View style={styles.modalStyle}>
                            <View style={styles.subView} >
                                <Button style={styles.buttonView} onPress={this._setModalVisible.bind(this)}>
                                    <Text style={{ width: 30, height: 30, marginBottom: 0, color: '#CBCBCB', fontSize: 28, }}>×</Text>
                                </Button>
                                <Text style={styles.titleText}>你的{c.name}地址</Text>
                                <Text style={styles.contentText}>{this.props.defaultWallet == null ? '' : this.props.defaultWallet.account}</Text>
                                <Text style={{ color: '#F45353', fontSize: 12, marginLeft: 15, textAlign: 'center', }}>提示：扫码同样可获取地址</Text>
                                <View style={{ margin: 10, alignItems: 'center', justifyContent: 'center', alignItems: 'center', flexDirection: "row", }}>
                                    <View style={{ flex: 1, }} />
                                    {/* <QRCode size={170} style={{ width: 170, }} value={{'contract':'eos','toaccount':this.props.defaultWallet.account,'symbol':'EOS'}} /> */}
                                    <QRCode size={170} style={{ width: 170, }} value={'{\"contract\":\"eos\",\"toaccount\":\"' + this.props.defaultWallet.account + '\",\"symbol\":\"EOS\"}'} />
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
        paddingTop: 10,
        height: 60,
        flexDirection: 'row',
        position: 'absolute',
        backgroundColor: '#43536D',
        bottom: 0,
        left: 0,
        right: 0,
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
        marginLeft: 15,
        fontSize: 12,
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


})
export default Info;