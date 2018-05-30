an eos wallet

## Build project:<br> 
cd wallet <br> 
npm i <br> 

### fix react-native-smart-barcode build error:<br>
/node_modules/react-native-smart-barcode/Barcode.js<br>

error:<br>
``` javascript
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
```

correct:<br>
``` javascript
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
```

### run android:<br>
npm run android/react-native run-android

### run ios:<br>
npm run ios/react-native run-ios

<br>
npm version:3.10.10 <br>
node version:v6.11.2 <br>
