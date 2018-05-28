import React from 'react';
import { connect } from 'react-redux'
import { Dimensions, DeviceEventEmitter, InteractionManager, ListView, StyleSheet, View, RefreshControl, Text, ScrollView, Image, Platform, StatusBar, TextInput } from 'react-native';
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

@connect(({ login }) => ({ ...login }))
class Set extends React.Component {

    static navigationOptions = {
        title: '备份助记词'
    };

    constructor(props) {
        super(props);
        this.state = {
            password: "",
        }
    }

    toBackup = (data) => {
        this.props.navigation.goBack();
        const { navigate } = this.props.navigation;
        navigate('BackupWords', data);
    }

    decryptWords = () => {
        const view =
            <View style={{ flexDirection: 'row' }}>
                <TextInput autoFocus={true} onChangeText={(password) => this.setState({ password })} returnKeyType="go" selectionColor="#65CAFF"
                    secureTextEntry={true}
                    keyboardType="ascii-capable" style={{ color: '#65CAFF', marginLeft: 10, width: 120, height: 45, fontSize: 15, backgroundColor: '#EFEFEF' }}
                    placeholderTextColor="#8696B0" placeholder="请输入密码" underlineColorAndroid="transparent" maxLength={8} />
            </View>

        EasyDialog.show("密码", view, "备份", "取消", () => {

            if (this.state.password == "") {
                EasyToast.show('请输入密码');
                return;
            }
            var _words = this.props.navigation.state.params.words;
            var bytes_words = CryptoJS.AES.decrypt(_words.toString(), this.state.password + this.props.navigation.state.params.salt);
            var plaintext_words = bytes_words.toString(CryptoJS.enc.Utf8);

            var words_active = this.props.navigation.state.params.words_active;
            var bytes_words = CryptoJS.AES.decrypt(words_active.toString(), this.state.password + this.props.navigation.state.params.salt);
            var plaintext_words_active = bytes_words.toString(CryptoJS.enc.Utf8);

            if (plaintext_words.indexOf('eostoken') != -1) {
                plaintext_words = plaintext_words.substr(9, plaintext_words.length);
                var wordsArr = plaintext_words.split(',');

                plaintext_words_active = plaintext_words_active.substr(9, plaintext_words_active.length);
                var wordsArr_active = plaintext_words_active.split(',');

                this.toBackup({ words_owner: wordsArr, words_active: wordsArr_active });
            } else {
                // alert('密码错误');
                EasyToast.show('密码错误');
            }
            EasyDialog.dismis();
        }, () => { EasyDialog.dismis() });
    }

    render() {
        return <View style={styles.container}>

            <ScrollView style={styles.scrollView}>
                <View>
                    <Text style={styles.welcome} style={{ color: '#FFFFFF', fontSize: 15, marginTop: 15, marginLeft: 10 }}>柚子粉，请立即备份钱包！</Text>
                    <Text style={styles.welcome} style={{ color: '#8696B0', marginTop: 5, marginLeft: 10, marginBottom: 25 }}>区块链钱包不同于传统网站账户，它是基于密码学的去中心化账户系统。</Text>
                    <Text style={styles.welcome} style={{ color: '#8696B0', marginTop: 5, marginLeft: 10, marginBottom: 25 }}>你必须自己保管好钱包的私钥和交易密码，任何意外发生将会导致资产丢失。</Text>
                    <Text style={styles.welcome} style={{ color: '#8696B0', marginTop: 5, marginLeft: 10, marginBottom: 25 }}>我们建议先做双重备份，再打入小额测试，最 后开始愉快使用。</Text>
                    <Text style={styles.welcome} style={{ color: '#8696B0', marginTop: 5, marginLeft: 10, marginBottom: 25 }}>丢失钱包或忘记密码时，可帮助恢复 钱包。</Text>
                    <Button onPress={() => this.decryptWords()}>
                        <View style={{ height: 45, backgroundColor: '#65CAFF', justifyContent: 'center', alignItems: 'center', margin: 20, borderRadius: 5 }}>
                            {/* <Text style={{fontSize:15,color:'#fff'}}>{this.props.loginUser?"退出":"登陆"}</Text> */}
                            <Text style={{ fontSize: 15, color: '#fff' }}>开始备份</Text>
                        </View>
                    </Button>
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

});

export default Set;
