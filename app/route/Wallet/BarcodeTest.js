/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */
import React, { Component } from 'react';
import {
    Platform,
    StyleSheet,
    Text,
    View,
    Alert
} from 'react-native';
import Barcode from 'react-native-smart-barcode'

import { EasyToast } from '../../components/Toast';

import PropTypes from 'prop-types'

export default class App extends React.Component {

    static navigationOptions = ({ navigation }) => {

    }

    //构造方法
    constructor(props) {
        super(props);
        this.state = {
            viewAppear: false,
        };
    }
    componentDidMount() {
        //启动定时器
        this.timer = setTimeout(
            () => this.setState({ viewAppear: true }),
            250
        );
    }
    //组件销毁生命周期
    componentWillUnmount() {
        //清楚定时器
        this.timer && clearTimeout(this.timer);
    }

    _onBarCodeRead = (e) => {
        // console.log(`e.nativeEvent.data.type = ${e.nativeEvent.data.type}, e.nativeEvent.data.code = ${e.nativeEvent.data.code}`)
        this._stopScan();
        try {
            var coins = JSON.parse(e.nativeEvent.data.code);
            if (coins.toaccount != null) {
                const { navigate } = this.props.navigation;
                coins.name = coins.symbol;
                this.props.navigation.goBack();
                navigate('TurnOut', { coins: coins });
            } else {
                EasyToast.show('无效的二维码');
            }
        } catch (error) {
            EasyToast.show('无效的二维码');
        }
        // Alert.alert("二维码", e.nativeEvent.data.code, [
        //     {text: '确认', onPress: () => this._startScan()},
        // ])
    };

    _startScan = (e) => {
        this._barCode.startScan()
    };

    _stopScan = (e) => {
        this._barCode.stopScan()
    }
    render() {
        return (
            <View style={{ flex: 1 }}>
                {this.state.viewAppear ?
                    <Barcode style={{ flex: 1, }} ref={component => this._barCode = component}
                        onBarCodeRead={this._onBarCodeRead} />
                    : null
                }
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5FCFF',
    },
    welcome: {
        fontSize: 20,
        textAlign: 'center',
        margin: 10,
    },
    instructions: {
        textAlign: 'center',
        color: '#333333',
        marginBottom: 5,
    },
});