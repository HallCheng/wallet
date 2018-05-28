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
import { EasyDialog } from '../../components/Dialog'
import { kapimg } from '../../utils/Api'
import Constants from '../../utils/Constants'
var ScreenWidth = Dimensions.get('window').width;
var tick = 60;

@connect(({ login }) => ({ ...login }))
class FetchPoint extends React.Component {

  static navigationOptions = {
    title: '用户积分'
  };

  state = {
    phone: "",
    password: "",
    code: "",
    img: kapimg,
    kcode: "",
    currentPoint: 0
  }

  constructor(props) {
    super(props);

  }

  componentDidMount() {
    this.props.dispatch({
      type: "login/fetchPoint", payload: { uid: Constants.uid }, callback: function (data) {
        if (data.code == 403) {
          this.props.dispatch({
            type: 'login/logout', payload: {}, callback: () => {
              this.props.navigation.goBack();
            }
          });
        }
      }
    });
    const { dispatch } = this.props;

    this.props.dispatch({ type: 'login/fetchPoint', payload: { uid: Constants.uid } });
    // dispatch({ type: 'login/fetchPoint'});
    //   DeviceEventEmitter.addListener('coinSlefChange', (tab) => {
    //     dispatch({type:'sticker/list',payload:{type:0}});
    //  });
  }

  signIn = () => {
    const { dispatch } = this.props;
    this.props.dispatch({
      type: 'login/signin', payload: { name: this.state.phone }, callback: (data) => {
        if (data.code == 0) {
          EasyToast.show("签到成功");
          this.props.dispatch({ type: 'login/fetchPoint', payload: { uid: Constants.uid } });
          // this.props.navigation.goBack();
        } else {
          EasyToast.show(data.msg);
        }
        EasyLoading.dismis();
      }
    })
  }

  render() {
    return <View style={styles.container}>
      <ScrollView keyboardShouldPersistTaps="always">
        <View>
          <View style={{ backgroundColor: '#43536D', flex: 1, flexDirection: 'column', }}>
            <Text style={{ fontSize: 12, color: '#8696B0', margin: 5, fontSize: 14 }}> 温馨提示：连续签到将获得额外积分哦~</Text>
            <Image source={UImage.point_full} style={{ width: 320, height: 25, justifyContent: 'center', alignSelf: 'center' }} />
            <View style={{ flexDirection: "row", margin: 10 }}>
              <Text style={{ fontSize: 14, color: '#8696B0', marginTop: 2 }}>当前累计积分:</Text>
              <Text style={{ fontSize: 16, color: '#FFFFFF', marginLeft: 2, paddingBottom: 2 }}>{this.props.pointInfo.signin + this.props.pointInfo.share + this.props.pointInfo.interact + this.props.pointInfo.store + this.props.pointInfo.turnin + this.props.pointInfo.turnout}</Text>
            </View>
            <View style={{ flexDirection: "row", }}>
              <Text style={{ textAlign: "center", fontSize: 16, color: '#FFFFFF', alignSelf: 'center', width: '35%', fontSize: 16 }}>{this.props.pointInfo.signin}</Text>
              <Text style={{ textAlign: "center", fontSize: 16, color: '#FFFFFF', alignSelf: 'center', width: '30%', fontSize: 16 }}>{this.props.pointInfo.share}</Text>
              <Text style={{ textAlign: "center", fontSize: 16, color: '#FFFFFF', alignSelf: 'center', width: '35%', fontSize: 16 }}>{this.props.pointInfo.interact}</Text>
            </View>
            <View style={{ flexDirection: "row" }}>
              <Text style={{ textAlign: "center", fontSize: 14, color: '#8696B0', width: '35%' }}>签到累计</Text>
              <Text style={{ textAlign: "center", fontSize: 14, color: '#8696B0', width: '30%' }}>分享资讯</Text>
              <Text style={{ textAlign: "center", fontSize: 14, color: '#8696B0', width: '35%' }}>资讯互动</Text>
            </View>
            <View style={{ flexDirection: "row", marginTop: 10 }}>
              <Text style={{ textAlign: "center", fontSize: 16, color: '#FFFFFF', alignSelf: 'center', width: '35%' }}>{this.props.pointInfo.store}</Text>
              <Text style={{ textAlign: "center", fontSize: 16, color: '#FFFFFF', alignSelf: 'center', width: '30%' }}>{this.props.pointInfo.turnin}</Text>
              <Text style={{ textAlign: "center", fontSize: 16, color: '#FFFFFF', alignSelf: 'center', width: '35%' }}>{this.props.pointInfo.turnout}</Text>
            </View>
            <View style={{ flexDirection: "row", marginBottom: 20 }}>
              <Text style={{ textAlign: "center", fontSize: 14, color: '#8696B0', width: '35%' }}>资产存储</Text>
              <Text style={{ textAlign: "center", fontSize: 14, color: '#8696B0', width: '30%' }}>转入累计</Text>
              <Text style={{ textAlign: "center", fontSize: 14, color: '#8696B0', width: '35%' }}>转出累计</Text>
            </View>
          </View>
          <Button onPress={() => this.signIn()}>
            <View style={{ height: 45, backgroundColor: '#65CAFF', justifyContent: 'center', alignItems: 'center', margin: 20, borderRadius: 5 }}>
              <Text style={{ fontSize: 15, color: '#fff' }}>立即签到</Text>
            </View>
          </Button>
          <Text style={{ fontSize: 14, color: '#8696B0', marginLeft: 20 }}>积分细则：</Text>
          <Text style={{ fontSize: 14, color: '#8696B0', marginLeft: 10 }}>1.签到每日可获得积分+1，连续签到可额外增加积分；</Text>
          <Text style={{ fontSize: 14, color: '#8696B0', marginLeft: 10 }}>2.分享资讯到朋友圈或微信好友每日可获得积分+1；</Text>
          <Text style={{ fontSize: 14, color: '#8696B0', marginLeft: 10 }}>3.资讯浏览评点每日可获得积分+1；</Text>
          <Text style={{ fontSize: 14, color: '#8696B0', marginLeft: 10 }}>4.转入资产成功，每笔可获得积分+5;</Text>
          <Text style={{ fontSize: 14, color: '#8696B0', marginLeft: 10 }}>5.转出资产成功，每笔可获得积分+2；</Text>
          <Text style={{ fontSize: 14, color: '#8696B0', marginLeft: 10 }}>6.定存EOS币，每日可获得2%比例的积分；</Text>
          <Text style={{ fontSize: 14, color: '#8696B0', marginLeft: 10, marginRight:10, }}>7.积分可兑换官方礼品和提高用户权益，官方将会在后续开发积分价值体系，让拥有更多积分的用户享受官方VIP服务，敬请期待。</Text>
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
  }
});

export default FetchPoint;
