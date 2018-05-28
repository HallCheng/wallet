import Request from '../utils/RequestUtil';
import { line, coinInfo } from '../utils/Api';
import store from 'react-native-simple-store';
import { EasyToast } from '../components/Toast';

export default {
    namespace: 'coinLine',
    state: {
        lineDatas: {},
        info: {}
    },
    effects: {
        *list({ payload }, { call, put }) {
            try {
                const resp = yield call(Request.request, line + payload.coin + "?type=" + payload.type, 'get');
                if (resp.code == '0') {
                    yield put({ type: 'update', payload: { data: resp.data, ...payload } });
                } else {
                    EasyToast.show(resp.msg);
                }
            } catch (error) {
                EasyToast.show('网络发生错误，请重试');
            }
        },
        *info({ payload }, { call, put }) {
            try {
                const resp = yield call(Request.request, coinInfo + payload.id, 'get');
                if (resp.code == '0') {
                    yield put({ type: 'updateInfo', payload: { info: resp.data, ...payload } });
                } else {
                    EasyToast.show(resp.msg);
                }
            } catch (error) {
                EasyToast.show('网络发生错误，请重试');
            }
        }
    },
    reducers: {
        update(state, action) {
            let lineDatas = combine(action.payload.data);
            return { ...state, lineDatas };
        },
        updateInfo(state, action) {
            return { ...state, ...action.payload };
        }
    }
}


function combine(data) {
    return  {
        color: ['#556E95','#6CDAFF'],
        grid: {
            top: '3%',
            left: '2%',
            right: '3%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: [
            {
                type: 'category',
                data: data.x,
                axisTick: {
                    alignWithLabel: true
                },
                axisTick: {
                    show: true
                },
                axisLine: {
                    lineStyle: {
                        color: "#586D8F"
                    }
                },
                axisLabel: {
                    color: "#96BAF0"
                },
            }
        ],
        yAxis: [
            {
                show: false,
                type: 'value',
                splitLine: {
                    show: false
                },
                axisLine: {
                    lineStyle: {
                        color: "#586D8F"
                    }
                },
                axisTick: {
                    show: false
                },
                axisLabel: {
                    show: false,
                    formatter: '',
                    color: "#93B5EE"
                }
            },
            {
                position: "left",
                type: 'value',
                splitLine: {
                    show: false
                },
                axisLine: {
                    lineStyle: {
                        color: "#586D8F"
                    }
                },
                axisTick: {
                    show: false
                },
                axisLabel: {
                    show: false,
                    formatter: '',
                    color: "#93B5EE"
                }
            }
        ],
        series: [
            {
                yAxisIndex: 0,
                name: '交易量',
                type: 'bar',
                barWidth: '50%',
                data: data.txs
            },
            {
                yAxisIndex: 1,
                name: "价格走势",
                data: data.ps,
                type: 'line',
                itemStyle: {
                    borderWidth: 0,
                    color: '#6CDAFF'
                },
            }
        ]
    }
}
