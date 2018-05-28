import React from 'react';
import { connect } from 'react-redux'
import { Dimensions, DeviceEventEmitter, InteractionManager, ListView, StyleSheet, View, RefreshControl, Text, ScrollView, Image, Platform, StatusBar, TextInput } from 'react-native';
import UColor from '../../utils/Colors'
import Button from '../../components/Button'
import Item from '../../components/Item'
import Icon from 'react-native-vector-icons/Ionicons'
import UImage from '../../utils/Img'
import { EasyLoading } from '../../components/Loading';
import { EasyToast } from '../../components/Toast';

var AES = require("crypto-js/aes");
var CryptoJS = require("crypto-js");

@connect(({ wallet }) => ({ ...wallet }))
class Set extends React.Component {

    static navigationOptions = {
        title: '更改密码'
    };

    constructor(props) {
        super(props);
        this.state = {
            password: "",
            newPassword: "",
            newRePassword: "",
        }
    }

    updatePassword = () => {

        if (this.setState.password == "") {
            EasyToast.show('请输入旧密码');
            return;
        }
        if (this.setState.newPassword == "") {
            EasyToast.show('请输入新密码');
            return;
        }
        if (this.setState.newRePassword == "") {
            EasyToast.show('请输入确认密码');
            return;
        }
        if (this.setState.newRePassword != this.setState.newPassword) {
            EasyToast.show('两次密码不一致');
            return;
        }
        var wallet = this.props.navigation.state.params;
        try {
            var ownerPrivateKey = wallet.ownerPrivate;
            var bytes_ownerPrivate = CryptoJS.AES.decrypt(ownerPrivateKey.toString(), this.state.password + wallet.salt);
            var plaintext_ownerPrivate = bytes_ownerPrivate.toString(CryptoJS.enc.Utf8);

            if (plaintext_ownerPrivate.indexOf('eostoken') != - 1) {
                // plaintext_ownerPrivate = plaintext_ownerPrivate.substr(8, plaintext_ownerPrivate.length);

                //**************解密********* */
                var activePrivate = "";
                var plaintext_activePrivate = "";
                var _activePrivate = "";

                if (this.props.navigation.state.params.activePrivate != null) {
                    activePrivate = this.props.navigation.state.params.activePrivate;
                    var bytes_activePrivate = CryptoJS.AES.decrypt(activePrivate.toString(), this.state.password + this.props.navigation.state.params.salt);
                    plaintext_activePrivate = bytes_activePrivate.toString(CryptoJS.enc.Utf8);
                    _activePrivate = CryptoJS.AES.encrypt(plaintext_activePrivate, this.state.newPassword + this.props.navigation.state.params.salt);
                }

                var words = "";
                var plaintext_words = "";
                var _words = "";

                if (wallet.words != null) {
                    words = this.props.navigation.state.params.words;
                    var bytes_words = CryptoJS.AES.decrypt(words.toString(), this.state.password + wallet.salt);
                    plaintext_words = bytes_words.toString(CryptoJS.enc.Utf8);
                    _words = CryptoJS.AES.encrypt(plaintext_words, this.state.newPassword + wallet.salt);
                }

                var words_active = "";
                var plaintext_words_active = "";
                var _words_active = "";

                if (wallet.words_active != null) {
                    words_active = this.props.navigation.state.params.words_active;
                    var bytes_words_active = CryptoJS.AES.decrypt(words_active.toString(), this.state.password + wallet.salt);
                    plaintext_words_active = bytes_words_active.toString(CryptoJS.enc.Utf8);
                    _words_active = CryptoJS.AES.encrypt(plaintext_words_active, this.state.newPassword + wallet.salt);
                }
                //**************加密********* */
                var _ownerPrivate = CryptoJS.AES.encrypt(plaintext_ownerPrivate, this.state.newPassword + wallet.salt);

                var _wallet = {
                    name: wallet.name,
                    account: wallet.account,
                    ownerPublic: wallet.ownerPublic,
                    activePublic: wallet.activePublic,
                    ownerPrivate: _ownerPrivate.toString(),
                    activePrivate: _activePrivate.toString(),
                    words: _words.toString(),
                    words_active: _words_active.toString(),
                    salt: wallet.salt,
                    isBackups: wallet.isBackups
                }
                const { dispatch } = this.props;
                this.props.dispatch({ type: 'wallet/modifyPassword', payload: { _wallet } });

                DeviceEventEmitter.addListener('modify_password', (data) => {
                    EasyToast.show('密码修改成功');
                    this.props.navigation.goBack();
                });
            } else {
                EasyToast.show('旧密码不正确');
            }
        } catch (error) {
            EasyToast.show('旧密码不正确');
        }
    }

    render() {
        return <View style={styles.container}>

            {/* <ScrollView style={styles.scrollView}> */}
            <View>
                <View style={{ backgroundColor: '#43536D', marginTop: 30 }}>
                    <View style={{ padding: 20, height: 55, backgroundColor: '#586888' }} >
                        {/* <Text style={{fontSize:12,color:'#8696B0'}}> 手机号</Text> */}
                        <TextInput ref={(ref) => this._lphone = ref} autoFocus={false} editable={true}
                            value={this.state.password} onChangeText={(password) => this.setState({ password })}
                            returnKeyType="next" selectionColor="#65CAFF" style={{ color: '#8696B0', fontSize: 15, height: 40, paddingLeft: 2 }} secureTextEntry={true}
                            placeholderTextColor="#8696B0" placeholder="当前密码" underlineColorAndroid="transparent"
                        />
                    </View>
                    <View style={{ height: 0.5, backgroundColor: '#43536D', flex: 1, flexDirection: 'column' }}></View>
                    <View style={{ padding: 20, height: 55, backgroundColor: '#586888' }} >
                        {/* <Text style={{fontSize:12,color:'#8696B0'}}> 密码</Text> */}
                        <TextInput ref={(ref) => this._lpass = ref} autoFocus={false} editable={true}
                            value={this.state.newPassword} onChangeText={(newPassword) => this.setState({ newPassword })}
                            returnKeyType="go" selectionColor="#65CAFF" style={{ color: '#8696B0', fontSize: 15, height: 40, paddingLeft: 2 }} placeholderTextColor="#8696B0"
                            placeholder="新密码" underlineColorAndroid="transparent" secureTextEntry={true} maxLength={20}
                        // onSubmitEditing={() => this.loginKcaptrue()}
                        // onChangeText={(loginPwd) => this.setState({loginPwd})}
                        />
                    </View>
                    <View style={{ height: 0.5, backgroundColor: '#43536D', flex: 1, flexDirection: 'column', }}></View>
                    <View style={{ padding: 20, height: 55, backgroundColor: '#586888' }} >
                        {/* <Text style={{fontSize:12,color:'#8696B0'}}> 密码</Text> */}
                        <TextInput ref={(ref) => this._lpass = ref} autoFocus={false} editable={true}
                            value={this.state.newRePassword} onChangeText={(newRePassword) => this.setState({ newRePassword })}
                            returnKeyType="go" selectionColor="#65CAFF" style={{ color: '#8696B0', fontSize: 15, height: 40, paddingLeft: 2 }} placeholderTextColor="#8696B0"
                            placeholder="重复密码" underlineColorAndroid="transparent" secureTextEntry={true} maxLength={20}
                        // onSubmitEditing={() => this.loginKcaptrue()}
                        // onChangeText={(loginPwd) => this.setState({loginPwd})}
                        />
                    </View>
                    <View style={{ height: 0.5, backgroundColor: '#43536D', flex: 1, flexDirection: 'column', }}></View>
                    <View style={{ padding: 20, height: 55, backgroundColor: '#586888' }} >
                        {/* <Text style={{fontSize:12,color:'#8696B0'}}> 密码</Text> */}
                        <TextInput ref={(ref) => this._lpass = ref} autoFocus={false} editable={true}
                            // value={this.state.loginPwd} 
                            returnKeyType="go" selectionColor="#65CAFF" style={{ color: '#8696B0', fontSize: 15, height: 40, paddingLeft: 2 }} placeholderTextColor="#8696B0"
                            placeholder="密码提示(可不填)" underlineColorAndroid="transparent" maxLength={20}
                        // onSubmitEditing={() => this.loginKcaptrue()}
                        // onChangeText={(loginPwd) => this.setState({loginPwd})}
                        />
                    </View>
                </View>
                {/* <Text style={styles.welcome} style={{ color: '#8696B0', marginBottom: 10, marginLeft: 10 }}>忘记密码？导入助记词或私钥可重置密码。马上导入</Text> */}
                <Button onPress={() => this.updatePassword()}>
                    <View style={{ height: 45, backgroundColor: '#65CAFF', justifyContent: 'center', alignItems: 'center', margin: 20, borderRadius: 5 }}>
                        <Text style={{ fontSize: 15, color: '#fff' }}>确认</Text>
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
    scrollView: {

    },

});

export default Set;
