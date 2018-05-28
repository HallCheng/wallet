import Request from '../utils/RequestUtil';
import {newsList,newsDown,newsUp,newsShare,newsView} from '../utils/Api';
import store from 'react-native-simple-store';
import { EasyToast } from '../components/Toast';

export default {
    namespace: 'news',
    state: {
        newsData:{},
        newsRefresh:false,
        updateTime:"",
    },
    effects: {
      *list({payload},{call,put}) {
        try{
            yield put({type:'upstatus',payload});
            const resp = yield call(Request.request,newsList+payload.type+"?page="+payload.page,'get');
            yield put({type:'upstatus',payload:{newsRefresh:false}});
            if(resp.code=='0'){
                let dts = new Array();
                resp.data.map((item)=>{
                    item.row=3;
                    dts.push(item);
                });
                yield put({type:'update',payload:{data:dts,...payload}});
            }else{
                EasyToast.show(resp.msg);
            }
        } catch (error) {
            yield put({type:'upstatus',payload:{newsRefresh:false}});
            EasyToast.show('网络发生错误，请重试');
        }
      },
      *up({payload},{call,put}) {
        try{
            const up = yield call(store.get, "news_up_"+payload.news.id);
            if(up=="1"){
                EasyToast.show("您已赞过了哦");
                return;
            }
            yield call(store.save, "news_up_"+payload.news.id,"1");
            const resp = yield call(Request.request,newsUp+payload.news.id,'get');
            if(resp.code==0){
                payload.news.up=payload.news.up+1;
                yield put({type:'updateAction',...payload});
            }else{
                EasyToast.show(resp.msg);
            }
        } catch (error) {
            EasyToast.show('网络发生错误，请重试');
        }
      },
      *down({payload},{call,put}) {
        try{
            const up = yield call(store.get, "news_down_"+payload.news.id);
            if(up=="1"){
                EasyToast.show("您已踩过了哦");
                return;
            }
            yield call(store.save, "news_down_"+payload.news.id,"1");
            const resp = yield call(Request.request,newsDown+payload.news.id,'get');
            if(resp.code==0){
                payload.news.down=payload.news.down+1;
                yield put({type:'updateAction',...payload});
            }else{
                EasyToast.show(resp.msg);
            }
        } catch (error) {
            EasyToast.show('网络发生错误，请重试');
        }
      },
      *view({payload},{call,put}) {
        try{
            const resp = yield call(Request.request,newsView+payload.news.id,'get');
            if(resp.code==0){
                payload.news.view=payload.news.view+1;
                yield put({type:'updateAction',...payload});
            }else{
                EasyToast.show(resp.msg);
            }
        } catch (error) {
            EasyToast.show('网络发生错误，请重试');
        }
      },
      *share({payload},{call,put}) {
        try{
            const resp = yield call(Request.request,newsShare+payload.news.id,'get');
            if(resp.code==0){
                payload.news.share=payload.news.share+1;
                yield put({type:'updateAction',...payload});
            }else{
                EasyToast.show(resp.msg);
            }
        } catch (error) {
            EasyToast.show('网络发生错误，请重试');
        }
      },
      *openView({payload},{call,put}) {
        yield put({type:'open',...payload});
      },
    },
   
    reducers: {
        update(state, action) {
            let newsData = state.newsData;
            if(action.payload.page==1){
                newsData[action.payload.type]=action.payload.data;
            }else{
                newsData[action.payload.type]= newsData[action.payload.type].concat(action.payload.data)
            }
            return {...state,newsData,updateTime:Date.parse(new Date())};
        },
        open(state, action) {
            
            let newsData = state.newsData;

            let dts = new Array();
           
            newsData[action.key].map((item)=>{
                if(item.id==action.nid){
                    if(item.row==3){
                        item.row=1000;
                    }else{
                        item.row=3;
                    }
                }
                dts.push(item);
            });
            newsData[action.key]=dts;

            return {...state,newsData,updateTime:Date.parse(new Date())};
        },
        upstatus(state,action){
            return {...state,...action.payload};
        },
        updateAction(state,action){
            let n = action.news;
            let newsData = state.newsData;
            let list = newsData[n.tid];
            list.map((item, i) => {
                if(item.id==n.id){
                    item=n;
                }
            })
            state.something = Date.parse(new Date());
            newsData[n.tid] = list;
            return {...state,newsData};
        },
        
    }
  }
  