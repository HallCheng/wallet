import React from 'react';
import { connect } from 'react-redux'
import {Dimensions,DeviceEventEmitter,InteractionManager,ListView,StyleSheet,View,RefreshControl,Text,ScrollView,Image,Platform,StatusBar,TextInput} from 'react-native';
import {TabViewAnimated, TabBar, SceneMap} from 'react-native-tab-view';
import UColor from '../../utils/Colors'
import Button from  '../../components/Button'
import Item from '../../components/Item'
import Icon from 'react-native-vector-icons/Ionicons'
import UImage from '../../utils/Img'
import { EasyLoading } from '../../components/Loading';
import { EasyToast } from '../../components/Toast';
import { EasyDialog } from '../../components/Dialog'
import {kapimg} from '../../utils/Api'
var ScreenWidth = Dimensions.get('window').width;
var tick=60;

@connect(({login}) => ({...login}))
class Forget extends React.Component {

  static navigationOptions = {
    title: '忘记密码'
  };

  state = {
    phone:"",
    password:"",
    code:"",
    capture:'获取短信验证码',
    img:kapimg,
    kcode:"",
  }

  constructor(props) {
    super(props);
  }

  regSubmit = () =>{
    if(this.state.phone==""){
      EasyToast.show('请输入手机号');
      return;
    }
    if(this.state.code==""){
      EasyToast.show('请输入验证码');
      return;
    }
    if(this.state.password==""){
      EasyToast.show('请输入密码');
      return;
    }
    if(this.state.phone.length!=11){
      EasyToast.show('请输入11位手机号');
      return;
    }
    EasyLoading.show('修改中...');
    this.props.dispatch({type:'login/changePwd',payload:{phone:this.state.phone,password:this.state.password,code:this.state.code},callback:(data)=>{
      EasyLoading.dismis();
      if(data.code==0){
        EasyToast.show("修改成功");
        this.props.navigation.goBack();
      }else{
        EasyToast.show(data.msg);
      }
    }})
  }


  refresh = () =>{
    EasyDialog.dismis();
    this.kcaptrue();
  }

  loaderror = () =>{
    EasyToast.show('操作过于频繁，为保障用户安全，请一小时后尝试');
  }

  kcaptrue = () =>{
    if(this.state.phone==""){
      EasyToast.show('请输入手机号');
      return;
    }
    if(this.state.phone.length!=11){
      EasyToast.show('请输入11位手机号');
      return;
    }
    if(this.state.capture!="获取短信验证码"){
      return;
    }
    let img = kapimg+this.state.phone+"?v="+Math.ceil(Math.random()*100000);

    const view = <View style={{flexDirection:'row'}}><Button onPress={()=>{this.refresh()}}><Image onError={(e)=>{this.loaderror()}} style={{width:100,height:45}} source={{uri:img}} /></Button><TextInput autoFocus={true} onChangeText={(kcode) => this.setState({kcode})} returnKeyType="go" selectionColor="#65CAFF" keyboardType="ascii-capable" style={{color:'#65CAFF',marginLeft:10,width:120,height:45,fontSize:15,backgroundColor:'#EFEFEF'}} placeholderTextColor="#8696B0" placeholder="请输入计算结果" underlineColorAndroid="transparent" maxLength={8}/></View>
    
    EasyDialog.show("计算结果",view,"获取","取消",()=>{
      
      if(this.state.kcode==""){
        EasyToast.show('请输入计算结果');
        return;
      }

      this.getCapture();

    },()=>{EasyDialog.dismis()});
  }

  getCapture = () =>{
    if(this.state.phone==""){
      EasyToast.show('请输入手机号');
      return;
    }
    if(this.state.phone.length!=11){
      EasyToast.show('请输入11位手机号');
      return;
    }
    if(this.state.kcode==""){
      EasyToast.show('请输入验证码');
      return;
    }
    if(this.state.capture!="获取短信验证码"){
      return;
    }
  
    var th = this;

    EasyLoading.show('获取中...');
    this.props.dispatch({type:'login/getCapture',payload:{phone:this.state.phone,code:this.state.kcode},callback:(data)=>{
        EasyLoading.dismis();
        if(data.code==0){
          EasyToast.show("验证码已发送，请注意查收");
          th.setState({capture:"60s"})
          th.doTick();
          EasyDialog.dismis();
        }else{
          EasyToast.show(data.msg);
          if(data.code!=505){
            EasyDialog.dismis();
          }
        }
    }});
  }


  doTick = () =>{
    var th = this;
    setTimeout(function(){
      if(tick==0){
        tick=60;
        th.setState({capture:"获取短信验证码"})
      }else{
        tick--;
        th.setState({capture:tick+"s"})
        th.doTick();
      }
    },1000);
  }

  clearFoucs = () =>{
    this._rpass.blur();
    this._rphone.blur();
    this._rcode.blur();
  }

  render() {
    return <View style={styles.container}>
     <ScrollView keyboardShouldPersistTaps="always">
      <View>
      <View style={{backgroundColor:'#43536D',flex: 1,flexDirection: 'column',}}>
        <View style={{padding:20,height:80,backgroundColor:'#586888'}} >
            <Text style={{fontSize:12,color:'#8696B0'}}> 手机号</Text>
            <TextInput ref={(ref) => this._rphone = ref}  value={this.state.phone} returnKeyType="next" selectionColor="#65CAFF" style={{color:'#8696B0',fontSize:15,height:40,paddingLeft:2}} placeholderTextColor="#8696B0" placeholder="输入手机号" underlineColorAndroid="transparent" keyboardType="phone-pad" maxLength={11}
            onChangeText={(phone) => this.setState({phone})}
            />
        </View>
        <View style={{height:0.5,backgroundColor:'#43536D'}}></View>
        <View style={{flexDirection:'row',backgroundColor:'#586888'}}>
            <View style={{padding:20,height:80,width:200}} >
                <Text style={{fontSize:12,color:'#8696B0'}}> 验证码</Text>
                <TextInput  value={this.state.code} ref={(ref) => this._rcode = ref}  returnKeyType="next" selectionColor="#65CAFF" style={{color:'#8696B0',fontSize:15,height:40,paddingLeft:2}} placeholderTextColor="#8696B0" placeholder="输入验证码" underlineColorAndroid="transparent" keyboardType="phone-pad" maxLength={6}
                 onChangeText={(code) => this.setState({code})}
                />
            </View>
            <View style={{flex:1,flexDirection:"row",alignSelf:'center',justifyContent:"flex-end",marginRight:10}}>
              <Button onPress={() => this.kcaptrue()}>
                <View style={{backgroundColor:'#65CAFF',borderRadius:5,width:100,height:30,justifyContent:'center',alignItems:'center'}}>
                  <Text style={{fontSize:12,color:'#fff'}}>{this.state.capture}</Text>
                </View>
              </Button>
            </View>
        </View>
       
        <View style={{height:0.5,backgroundColor:'#43536D'}}></View>
        <View style={{padding:20,height:80,backgroundColor:'#586888'}} >
            <Text style={{fontSize:12,color:'#8696B0'}}> 密码</Text>
            <TextInput ref={(ref) => this._rpass = ref}  value={this.state.password} returnKeyType="next" selectionColor="#65CAFF" style={{color:'#8696B0',fontSize:15,height:40,paddingLeft:2}} placeholderTextColor="#8696B0" placeholder="输入密码"  underlineColorAndroid="transparent" secureTextEntry={true} maxLength={20}
             onChangeText={(password) => this.setState({password})}
            />
        </View>
      </View>
      <Button onPress={() => this.regSubmit()}>
        <View style={{height:45,backgroundColor:'#65CAFF',justifyContent:'center',alignItems:'center',margin:20,borderRadius:5}}>
          <Text style={{fontSize:15,color:'#fff'}}>修改密码</Text>
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
    flexDirection:'column',
    backgroundColor: UColor.secdColor,
  }
});

export default Forget;
