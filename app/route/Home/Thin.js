/**
 * Created by zhuang.haipeng on 2017/9/12.
 */
import React from 'react';
import { connect } from 'react-redux'
import {NativeModules,StatusBar,BackHandler,DeviceEventEmitter,InteractionManager,ListView,StyleSheet,Image,ScrollView,View,RefreshControl,Text, TextInput,Platform,Dimensions,Modal,TouchableHighlight,TouchableOpacity,} from 'react-native';
import {TabViewAnimated, TabBar, SceneMap} from 'react-native-tab-view';
import store from 'react-native-simple-store';
import UColor from '../../utils/Colors'
import Button from  '../../components/Button'
import Echarts from 'native-echarts'
import UImage from '../../utils/Img'
const maxHeight = Dimensions.get('window').height;
const {width, height} = Dimensions.get('window');
import { EasyDialog } from "../../components/Dialog";
import { EasyToast } from '../../components/Toast';

@connect(({contracts}) => ({...contracts}))
class Thin extends React.Component {
    static navigationOptions = {
        title: 'EOS地址薄',  
        headerStyle:{
            backgroundColor:"#586888",
            paddingTop:20,
        }    
      };
 // 构造函数  
  constructor(props) {
        super(props);
        const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
        this.state = {
            show:false,
            dataSource: ds.cloneWithRows([]),
            isEdit: false,
            isChecked: false,
            isAllSelect: false,
            isShowBottom: false,
            selectMap: new Map(),
            labelname:'',
            address:''
            // preIndex: 0 // 声明点击上一个按钮的索引  **** 单选逻辑 ****
        };
    }

    newlyAddedClick() {  
        //   console.log('右侧按钮点击了');  
        this._setModalVisible();  
      }  
    
       // 显示/隐藏 modal  
    _setModalVisible() { 
        this.state.labelname = ''; 
        this.state.address = '';
        let isShow = this.state.show;  
        this.setState({  
          show:!isShow,  
        });  
      }  
   

    componentDidMount() {
        // this.setState({
        //     dataSource: this.state.dataSource.cloneWithRows(collectionArray)
        // })
        const { dispatch } = this.props;
        this.props.dispatch({ type: 'contracts/info'});
    }


    confirm() {
        if (this.state.labelname == "") {
            EasyToast.show('请输入标签名称');
            return;
          }
        if (this.state.address == "") {
            EasyToast.show('请输入收款人地址');
            return;
        }
        const { dispatch } = this.props;
        this.props.dispatch({ type: 'contracts/saveWallet', payload: { address: this.state.address, labelname: this.state.labelname }});
       
        this._setModalVisible();

        this.componentDidMount();

    }
    renderRow = (rowData, sectionID, rowID) => { // cell样式

        let map = this.state.selectMap;
        let isChecked = map.has(parseInt(rowID))
        // 选中的时候, 判断上一个索引不等于rowID的时候,不让他选中   **** 单选逻辑 ****
        // let isChecked = parseInt(rowID) == this.state.preIndex ?  map.has(parseInt(rowID)) : false; // 将rowID转成Int,然后将Int类型的ID当做Key传给Map

        return (
            <View style={{width: width, height: 60, backgroundColor:UColor.secdColor,  marginTop:5,marginBottom: 5, alignItems:"center", justifyContent:'center', paddingLeft: this.state.isEdit ? 54 : 0}}>
               { this.state.isEdit ?
                       <TouchableOpacity style={{position:'absolute', left:3,}} onPress={() => this.selectItem(parseInt(rowID), rowData.labelname, isChecked)}>
                           <Image source={isChecked ? UImage.aab1:UImage.aab2} style={{width:30,height:30,}}/>
                       </TouchableOpacity> : null
               }
               <View style={{width: width-20, height: 84, backgroundColor:"#586888",  marginBottom: 10, paddingLeft:10, alignItems:"flex-start", justifyContent:'center',}}>
                    <Text style={{color:'#EFEFEF',fontSize:15,}}>{rowData.labelname}</Text>
                    <Text style={{color:'#8696B0',fontSize:15,}}>{rowData.address}</Text>
               </View>
           </View>
        )
    }

    render() {
        let temp = [...this.state.selectMap.values()];
        let isChecked = temp.length === this.state.dataSource._cachedRowCount;

        console.log(temp, '......')
        return (
            <View style={{flex:1, backgroundColor: UColor.secdColor,paddingTop:5,}}>
            {/* enableEmptySections = {true} */}
                <ListView renderRow={this.renderRow}  enableEmptySections = {true}  dataSource={this.state.dataSource.cloneWithRows((this.props.contracts == null ? [] : this.props.contracts))}></ListView> 
                { this.state.isShowBottom == false ? 
                <View style={{width: width, backgroundColor: UColor.secdColor, justifyContent:"space-between", flexDirection:'column', alignItems:"center"}}>
                    <TouchableOpacity onPress={this.newlyAddedClick.bind(this)} style={{width: width-20,height:45,backgroundColor:'#65CAFF',justifyContent:'center',alignItems:'center',margin:10,borderRadius:5}}>
                        <Text style={{fontSize:17,color:'#fff'}}>新增地址</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => this.editClick()} style={{width: width-20,height:45,backgroundColor:'#65CAFF',justifyContent:'center',alignItems:'center',margin:10,borderRadius:5}}>
                        <Text style={{fontSize:17,color:'#fff'}}>管理地址</Text>
                    </TouchableOpacity>                 
                </View> : null
                }             
                { this.state.isShowBottom == true ? 
                <View style={{width: width,  backgroundColor: UColor.secdColor, justifyContent:"space-between", flexDirection:'column', alignItems:"center"}}>                         
                    <TouchableOpacity onPress={() => this.deleteItem()} style={{width: width-20,height:45,backgroundColor:'#EF4F4F',justifyContent:'center',alignItems:'center',margin:10,borderRadius:5}}>
                        <Text style={{fontSize:17,color:'#fff'}}>删除地址</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={{flexDirection:'row'}} onPress={() => this.editClick()} style={{width: width-20,height:45,backgroundColor:'#65CAFF',justifyContent:'center',alignItems:'center',margin:10,borderRadius:5}}>                              
                        <Text style={{fontSize:17,color:'#fff'}}>完成</Text>
                    </TouchableOpacity>
                </View> : null
                }
                 <View style={styles.pupuo}>  
                    <Modal  animationType='slide'  transparent={true}  visible={this.state.show}  onShow={() => {}}  onRequestClose={() => {}} >  
                        <View style={styles.modalStyle}>                           
                            <View style={styles.subView} >  
                                <Button style={styles.buttonView} onPress={this._setModalVisible.bind(this)}>  
                                    <Text style={{width:30,height:30,marginBottom:0,color:'#CBCBCB',fontSize:28,}}>×</Text>                                          
                                </Button>  
                                <Text style={styles.titleText}>添加地址</Text> 
                                <View style={{ paddingLeft:20, height: 40,  marginBottom: 10,  justifyContent:'center', }} >
                                    <TextInput  value={this.state.labelname} 
                                      onChangeText={(labelname) => this.setState({ labelname })} returnKeyType="next" selectionColor="#65CAFF" style={{ color: '#999999', fontSize: 14, height: 50, paddingLeft: 2 }} placeholderTextColor="#8696B0" placeholder="输入标签名称" underlineColorAndroid="transparent" keyboardType="phone-pad" maxLength={20}/>
                                </View>    
                                <View style={{ paddingLeft:20, height: 40,  marginBottom: 10,  justifyContent:'center', }} >
                                    <TextInput value={this.state.address}
                                     onChangeText={(address) => this.setState({ address })} returnKeyType="next" selectionColor="#65CAFF" style={{ color: '#999999', fontSize: 14, height: 50, paddingLeft: 2 }} placeholderTextColor="#8696B0" placeholder="粘贴收款人地址" underlineColorAndroid="transparent" keyboardType="phone-pad" />
                                </View>                               
                                                                                                        
                                <Button onPress={() => this.confirm() }>
                                    <View style={{ margin:10 ,height: 40, borderRadius: 6,  backgroundColor: '#65CAFF', justifyContent: 'center', alignItems: 'center' }}>
                                        <Text style={{ fontSize: 16, color: '#fff' }}>确认</Text>
                                    </View>
                                </Button>
                            </View>  
                        </View>  
                    </Modal>  
                </View>    
            </View>
        );
    }

    

    editClick = () => { // 管理地址
        this.setState({
            isEdit: !this.state.isEdit,
            selectMap: new Map()
        }, () => {
            this.setState({
                isShowBottom: this.state.isEdit ? true : false
            })
        })    
        const { dispatch } = this.props;
        this.props.dispatch({ type: 'contracts/info'});   
    };

    deleteItem = () => { // 删除地址
        let {selectMap} = this.state;
        // let valueArr = [...selectMap.values()];
        let keyArr = [...selectMap.keys()];
        const { dispatch } = this.props;
        this.props.dispatch({ type: 'contracts/delWallet', payload: { keyArr: keyArr}});
       
    };

    // allSelect = (isChecked) => { // 全选
    //     this.setState({
    //         isAllSelect: !isChecked
    //     });
    //     if (isChecked) { // 如果已经勾选了,则取消选中
    //         let {selectMap} = this.state;
    //         selectMap = new Map();
    //         this.setState({selectMap})
    //     } else { // 没有勾选的, 全部勾选
    //         let newMap = new Map();
    //         for (let key = 0; key < collectionArray.length; key++) {
    //             let value = collectionArray[key].collectItem; // 拿到数组的collectItem
    //             newMap.set(key, value) // 第一个key, 第二个是value
    //         }
    //         this.setState({selectMap: newMap})
    //     }
    // }

    selectItem = (key, value, isChecked) => { // 单选
        this.setState({
            isChecked: !this.state.isChecked,
            // preIndex: key  //  **** 单选逻辑 ****
        }, () => {
            let map = this.state.selectMap;
            if (isChecked) {
                map.delete(key, value) // 再次点击的时候,将map对应的key,value删除
            } else {
                // map = new Map() // ------>   **** 单选逻辑 ****
                map.set(key, value) // 勾选的时候,重置一下map的key和value
            }
            this.setState({selectMap: map})
        })
    }
};

const styles = StyleSheet.create({
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
        marginBottom:10,  
        fontSize:18,  
        fontWeight:'bold',  
        textAlign:'center',  
      },  
      // 内容  
      contentText:{ 
        marginLeft:15,
        marginRight:15, 
        lineHeight:30, 
        fontSize:14,  
        textAlign:'left', 
      
      },  
      // 按钮  
      buttonView:{  
        alignItems: 'flex-end', 
      },  
  
})

export default Thin;