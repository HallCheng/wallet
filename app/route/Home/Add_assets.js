import React from 'react';
import { connect } from 'react-redux'
import {NativeModules,StatusBar,BackHandler,DeviceEventEmitter,InteractionManager,ListView,StyleSheet,Image,ScrollView,View,RefreshControl,Text, TextInput,Platform,Dimensions,Modal,TouchableHighlight,Switch} from 'react-native';
import {TabViewAnimated, TabBar, SceneMap} from 'react-native-tab-view';
import store from 'react-native-simple-store';
import UColor from '../../utils/Colors'
import Button from  '../../components/Button'
import Item from '../../components/Item'
import Echarts from 'native-echarts'
import UImage from '../../utils/Img'
import QRCode from 'react-native-qrcode-svg';
const maxHeight = Dimensions.get('window').height;
import { EasyDialog } from "../../components/Dialog"


@connect(({wallet}) => ({...wallet}))
class Add_assets extends React.Component {
    static navigationOptions = ({ navigation }) => {
    
        const params = navigation.state.params || {};
       
        return {          
          headerTitle:'添加资产',
          headerStyle:{
                    backgroundColor:"#586888",
                    paddingTop:20,
                },
                trueSwitchIsOn: true,                
        };
      };

  onPress(action){
    EasyDialog.show("温馨提示","部分功能将于6月份EOS上线主网后开通，敬请期待！","知道了",null,()=>{EasyDialog.dismis()});
  }

  _rightButtonClick() {  
    this._setModalVisible();  
  }  

   // 显示/隐藏 modal  
   _setModalVisible() {  
    let isShow = this.state.show;  
    this.setState({  
      show:!isShow,  
    });  
  }  

  // 构造函数  
  constructor(props) { 
    super(props);
    this.state = {show:false,value: false,};
    this.config = [
        { first: true, disable: true, avatar:UImage.add, name: "EOS", swt: 'off' },
        { disable: true, avatar:UImage.add, name: "DEW", swt: 'off' },
        { disable: true, avatar:UImage.add, name: "XIN", swt: 'off' },
        { disable: true, avatar:UImage.add, name: "BIG", swt: 'off'},
        { disable: true, avatar:UImage.add, name: "UIP", swt: 'off' },
      ];  
  }

  _renderListItem() {
    return this.config.map((item, i) => {
      return (<Item key={i} {...item} />)
    })
  }

  copy = () => {
    // let msg = "由硬币资本、连接资本领投的全网第一款柚子钱包EosToken上线撒币啦，500,000EOS赠送新用户活动，太爽了~真是拿到手软，用我的邀请链接注册即获得"+(parseFloat(this.props.inviteInfo.regReward)+parseFloat(this.props.inviteInfo.l1Reward))+"EOS。"+this.props.inviteInfo.inviteUrl+"#"+this.props.inviteInfo.code+"（如果微信无法打开，请复制链接到手机浏览器打开,苹果版本已上线）";
    let msg = "由硬币资本、连接资本领投的全网第一款柚子钱包EosToken开放注册了，" + this.props.inviteInfo.inviteUrl + "（请复制链接到手机浏览器打开）（如果微信无法打开，请复制链接到手机浏览器打开,苹果版本已上线）";

    Clipboard.setString(msg);
    EasyDialog.show("复制成功", msg, "打开微信粘贴", "取消", () => { Linking.openURL('weixin://'); }, () => { EasyDialog.dismis() });
  }

    render() {
        const c = this.props.navigation.state.params.coinType;
        return (
            <View style={styles.container}>
                <View>
                   {this._renderListItem()}
                </View>          
            </View>
        )
    }
}
const styles = StyleSheet.create({
    container: {
      flex: 1,
      flexDirection:'column',
      backgroundColor: UColor.secdColor,
      paddingTop:5,
    },
    row: {
      height:80,
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
    top:{
      flex:2,
      flexDirection:"column",
    },
    footer:{
      paddingTop:5,
      height:60,    
      flexDirection:'row',  
      position:'absolute',
      backgroundColor:'#43536D',
      bottom: 0,
      left: 0,
      right: 0,
    },

    pupuo:{  
      backgroundColor: '#ECECF0',  
    },  
    // modal的样式  
    modalStyle: {  
      // backgroundColor:'#ccc',  
      alignItems: 'center',  
      justifyContent:'center',  
      flex:1,  
    },  
    // modal上子View的样式  
    subView:{  
      marginLeft:10,  
      marginRight:10,  
      backgroundColor:'#fff',  
      alignSelf: 'stretch',  
      justifyContent:'center',  
      borderRadius: 10,  
      borderWidth: 0.5,  
      borderColor:'#ccc',  
    },  
    // 标题  
    titleText:{   
      marginBottom:5,  
      fontSize:18,  
      fontWeight:'bold',  
      textAlign:'center',  
    },  
    // 内容  
    contentText:{  
      marginLeft:15,  
      fontSize:12,  
      textAlign:'left',  
    },  
    // 按钮  
    buttonView:{  
      alignItems: 'flex-end', 
    },  
    tab1:{
      flex:1,
    },
    tab2:{
      flex:1,
      flexDirection: 'column',
    } 
})
export default Add_assets;