import React, {Component} from "react";
import {Alert, BackHandler, Image, Platform, StatusBar, StyleSheet, TouchableOpacity, AsyncStorage ,View, Text} from "react-native";

import {Actions, Reducer, Router, Scene} from "react-native-router-flux";
import Login from "./Main/Login";
import Main from "./Main/Main";
import API from "../services/API"
import Spinner from "react-native-loading-spinner-overlay";
import SplashScreen from 'react-native-splash-screen'
import StorageControl from "./Record/StorageControl";

global.mainColor='#ff8888'
global.backgroundColor="#ffb56d10"
global.userConfig = {
    uid:null,
    pushToken:null,
}

/*
 Scene props = {
 tabBarStyle: ViewPropTypes.style,
 tabBarSelectedItemStyle: ViewPropTypes.style,
 tabBarIconContainerStyle: ViewPropTypes.style,
 tabBarShadowStyle: ViewPropTypes.style,
 tabSceneStyle: ViewPropTypes.style,
 tabStyle: ViewPropTypes.style,
 tabTitleStyle: Text.propTypes.style,
 tabSelectedTitleStyle: Text.propTypes.style,
 tabTitle: PropTypes.string,
 };
 */
class App extends Component {
    constructor(props){
        super(props)
        this.state={
            onLoading : true,
            authState : false
        }
    }

    componentWillMount(){
        API.getAuth()
            .then( (data) => {
                if(data.result){
                    console.log("GET AUTH:",data)
                    this.setState({authState:true, onLoading:false})
                } else{
                    console.log('NO AUTH:',data)
                    this.setState({authState:false, onLoading:false})
                }
            })
    }

    componentDidMount(prevProps,prevState){
        setInterval( ()=>SplashScreen.hide(),1000);
    }

    render(){
        if(this.state.onLoading){
            return (
                <Spinner visible={true}/>
            )
        }

        return(
            <Router navigationBarStyle={styles.navBar}
                    sceneStyle = {styles.scene}
                    titleStyle={styles.title}
                    createReducer={(params)=>this.reducerCreate(params)}
                    backAndroidHandler={()=>this.onBackHandler()} >

                <Scene key="root">

                    <Scene
                        key="login"
                        component={Login}
                        hideNavBar={true}
                        sceneStyle ={{marginTop:0}}
                        initial={!this.state.authState}
                    />

                    <Scene
                        key="main"
                        component={Main}
                        getTitle={(props)=>props.title}
                        hideNavBar={true}
                        renderBackButton={()=>null}
                        panHandlers={null} // this prop handling gesture
                        initial={this.state.authState}
                    />
                </Scene>
            </Router>
        )
    }

    backButton(){
        return (
            <TouchableOpacity
                onPress={()=>Actions.pop()}
                style={{}}>
                <Image
                    style={{width:25,height:25,}}
                    source={require('../img/backButton.png')}
                    resizeMode={Image.resizeMode.contain}
                />
            </TouchableOpacity>
        )
    }
    onBackHandler() {
        console.log('BackHandler:this.sceneKey:' + this.sceneKey);
        if (this.sceneKey === "main" || this.sceneKey === "login") {
            Alert.alert(
                '알림',
                '앱을 종료하시겠습니까?', [{
                    text: '네',
                    onPress: () => BackHandler.exitApp()
                },
                    {
                        text: '아니요'
                    }
                ]
            );
            return true; //remain in app
        } else {
            try {
                Actions.pop();
                return true;
            } catch (e) {
                console.log('onBackHandler:pop failed -maybe at root?');
                return false;
            }
        }
    }

    reducerCreate(params) {
        const defaultReducer = Reducer(params);
        console.log("PARAM:",params);
        return (state, action) => {
            //console.log("ACTION:", action);
            if (action.scene)
                console.log("ACTION:", [action.scene.sceneKey, action.scene.type]);
            if (action.scene && action.scene.sceneKey === 'main' &&
                (action.scene.type === 'REACT_NATIVE_ROUTER_FLUX_PUSH' || action.scene.type === 'REACT_NATIVE_ROUTER_FLUX_REFRESH')) {
                console.log('catch back to main');
            }
            this.sceneKey = action.scene ? action.scene.sceneKey : '';
            return defaultReducer(state, action);
        }
    }
}

const styles = StyleSheet.create({
    navBar:{
        backgroundColor : global.mainColor,
        borderBottomColor:'#ffffff00'
    },
    welcome: {
        fontSize: 20,
        textAlign: 'center',
        margin: 10,
        color: '#ffffff',
    },
    scene: {
        flex :1,
        //marginTop : (Platform.OS === 'ios') ? 64 : 54
    },
    title: {
        fontSize: 17,
        fontWeight: "600",
        color:'white',
    }
});

export default App;

console.ignoredYellowBox = ['Setting a timer'];