# wallet
a open resource eos wallet

Build:
cd wallet 
npm i

modify react-native-smart-barcode build error:
/node_modules/react-native-smart-barcode/Barcode.js

error:
import React, {
    PropTypes,
    Component,
} from 'react'
import {
    View,
    requireNativeComponent,
    NativeModules,
    AppState,
    Platform,
} from 'react-native'

correct:
import React, {
    Component,
} from 'react'
import {
    View,
    requireNativeComponent,
    NativeModules,
    AppState,
    Platform,
} from 'react-native'
import PropTypes from 'prop-types'

android:
npm run android

ios:
npm run ios
