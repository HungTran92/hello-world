//LIB
React = require('react-native');

var {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  Image,
  ToolbarAndroid,
  TouchableOpacity,
  Dimensions,
  DrawerLayoutAndroid,
  Navigator,
  BackAndroid,
  DeviceEventEmitter ,
  IntentAndroid,
  NativeModules,
  // Linking,
} = React;
var Button = require('react-native-button');

import { connect } from 'react-redux/native'
const SideMenu = require('react-native-side-menu');
var {
  Router, Route, Schema, Animations, TabBar, Actions
} = require('react-native-router-flux');
var SensorManager = NativeModules.SensorManager;
var GiftedSpinner = require('react-native-gifted-spinner');
var StatusBarAndroid = require('react-native-android-statusbar');
var SQLite = require('react-native-sqlite-storage');
SQLite.DEBUG(true);
SQLite.enablePromise(true);

var RNIntent = NativeModules.RNIntent;
var RNHotUpdate = NativeModules.RNHotUpdate;

// action
var UserActions_MiddleWare=require('../actions/UserActions_MiddleWare');
var ServerConnectionActions_MiddleWare=require('../actions/ServerConnectionActions_MiddleWare');
var StoreActions_MiddleWare=require('../actions/StoreActions_MiddleWare');
var SQLiteActions_MiddleWare=require('../actions/SQLiteActions_MiddleWare');
var FootballActions_MiddleWare=require('../actions/FootballActions_MiddleWare');
var NotifyActions_MiddleWare=require('../actions/NotifyActions_MiddleWare');
var NotifyActions=require('../actions/NotifyActions');
var NavigatorActions = require('../actions/NavigatorActions');


//Component
var Debug = require('../Util/Debug');
var Define = require('../Define');var Include = require('../Include');

var {reduxManager}= require('../components/modules/ReduxManager');
var {deepLinkManager}= require('../components/modules/DeepLinkManager');
var ReduxActions = require('../actions/Actions');
var {Popup,popupActions} = require('../components/popups/Popup');
var {socketConnection} = require('../components/modules/ConnectionsManager');

var NavigatorNavigationBarStyles = require('./NavigatorNavigationBarStyles');

var SCTVSideMenu = require('../components/elements/SCTVSideMenu');


// var {SQLiteManager} = require('../components/modules/SQLiteManager');
//Screen
var HomeScreen = require('../components/screens/HomeScreen');
// var MatchDetailScreen = require('../components/screens/MatchDetailScreen');
var ProScreen = require('../components/screens/ProScreen');
var ResultScreen = require('../components/screens/ResultScreen');
var ResultByLeagueScreen = require('../components/screens/ResultByLeagueScreen');
var NewsScreen = require('../components/screens/NewsScreen');
var NewsDetailScreen = require('../components/screens/NewsDetailScreen');
var AcountInfoScreen = require('../components/screens/AcountInfoScreen');
var PasswordChangeScreen = require('../components/screens/PasswordChangeScreen');
// var ChannelScreen = require('../components/screens/ChannelScreen');
var RuleScreen = require('../components/screens/RuleScreen');
var ConsultativeNewsScreen = require('../components/screens/ConsultativeNewsScreen');
var ConsultativeNewsDetailScreen = require('../components/screens/ConsultativeNewsDetailScreen');
var ScheduleScreen = require('../components/screens/ScheduleScreen');
var ClipScreen = require('../components/screens/ClipScreen');
var ClipDetailScreen = require('../components/screens/ClipDetailScreen');
var ExactlyPredictScreen = require('../components/screens/ExactlyPredictScreen');
var HistoryScreen = require('../components/screens/HistoryScreen');
var ServiceScreen = require('../components/screens/ServiceScreen');
var TutorialScreen = require('../components/screens/TutorialScreen');


var TestScreen = require('../components/screens/TestScreen');

//popup
var CannotConnectToServerPopup = require('../components/popups/CannotConnectToServerPopup');
var AlarmSettingPopup = require('../components/popups/AlarmSettingPopup');
var VideoPopup = require('../components/popups/VideoPopup');
var BeatPopup = require('../components/popups/BeatPopup');
//variable
var navBarHeight = NavigatorNavigationBarStyles.General.NavBarHeight;
var widthScreen = Dimensions.get('window').width;
var heightScreen = Define.constants.availableHeightScreen;

//
var App = React.createClass({

  db:null,

  populateDB(tx) {
      var that = this;

      // tx.executeSql('DROP TABLE IF EXISTS AlarmList;');
      // tx.executeSql('DROP TABLE IF EXISTS FootballTeams;');

      // create table in database
      tx.executeSql('CREATE TABLE IF NOT EXISTS AlarmList( '
          + 'id TEXT PRIMARY KEY NOT NULL, '
          + 'type TEXT , '
          + 'name TEXT , '
          + 'description TEXT , '
          + 'deepLink TEXT , '
          + 'time INTEGER , '  //
          + 'timeAlarm INTEGER NOT NULL, '  //
          + 'alarm INTEGER NOT NULL, ' // bool
          + 'bell INTEGER NOT NULL, '  // bool
          + 'vibrator INTEGER NOT NULL '  // bool
          + ');').catch((error) => {
          Debug.log(error);
      });

      // tx.executeSql('CREATE TABLE IF NOT EXISTS FootballTeams( '
      //     + 'id TEXT PRIMARY KEY NOT NULL, '
      //     + 'name TEXT , '
      //     + 'logo TEXT'  //
      //     + ');').catch((error) => {
      //     Debug.log(error);
      // });

  },




 renderSideMenu:function(){
   var self=this;
    return(
      <SCTVSideMenu rootView={self}/>
    )
  },
  drawSideMenu:function(flag=true){
    var self = this;
    var {dispatch,user}= self.props;
    // Debug.log('drawSideMenu:'+flag)
    // if (flag) {
      // get user info
      // if (user.signin.signinState) {
      //   dispatch(UserActions_MiddleWare.getInfo());
      // }
    // }
    if (this.sideMenu) {
      this.sideMenu.openMenu(flag);
    }

  },
  processDeepLinkFromNotify:function(){
    // check intent (start from link or notify)
    Debug.log('Process deeplink when start app from notity')
    var idIn = undefined;
    var typeIn=undefined;
    var deepLinkIn=undefined;

    RNIntent.getIntentExtra('DEEP_LINK')
    .then((arg)=>{
      Debug.log(arg);deepLinkIn=arg.DEEP_LINK;
      RNIntent.getIntentExtra('TYPE')
      .then((arg)=>{
        Debug.log(arg);typeIn=arg.TYPE;
        RNIntent.getIntentExtra('ID')
        .then((arg)=>{
          Debug.log(arg);idIn=arg.ID;
          Debug.log('SUCCESS get extra from intent')
          if (typeIn === 'football') {
            deepLinkManager.processLink({
              link:deepLinkIn,
              extra:{
                id:idIn,
              }
            })
          }
          else if (typeIn === 'football-channel') {
            var parseId = idIn.split('-');
            var id=parseId.length>0? parseId[0]:undefined;
            var channelId=parseId.length>1 ?parseId[1]:undefined;
            deepLinkManager.processLink({
              link:deepLinkIn,
              extra:{
                id:id,
                channelId:channelId,
              }
            })
          }
          else if (typeIn === 'channel') {
            var parseId = idIn.split('-');
            var channelId=parseId.length>1?parseId[0]:undefined;
            deepLinkManager.processLink({
              link:deepLinkIn,
              extra:{
                channelId:channelId,
              }
            })
          }
        })
        .catch((err)=>{Debug.log(err);})
      })
      .catch((err)=>{Debug.log(err);})
    })
    .catch((err)=>{Debug.log(err);})
  },

  processNotify:function(){
    var self = this;
    var {dispatch,user}= self.props;
    dispatch(NotifyActions_MiddleWare.recent());


  },
  preProcessWhenStart:function(){
    var self = this;
    var {dispatch,user}= self.props;

    Debug.log('preProcessWhenStart');

    // if (!__DEV__) {

      RNHotUpdate.checkUpdate(Define.constants.serverAddr + '/update/latest')
      .then((arg)=>{
        Debug.log('checkUpdate:done');
        Debug.log(arg);
        if ((arg.currentHybridVersion < arg.newHybridVersion ) && !arg.mandatory ) {
          // ask user
          popupActions.setRenderContentAndShow(()=>{
            return(
              <DefaultPopup
                  disableClose={false}
                  title={'UPDATE'}
                  description={'Có phiên bản mới ' +arg.newHybridVersion + '(hiện tại:' + arg.currentHybridVersion + ' )'
                                    + arg.description
                                    + ', bạn có muốn cập nhật'}
                  buttonTitle={'Đồng ý'}
                  onPress={()=>{
                    popupActions.popPopup();
                    RNHotUpdate.update()
                    .then(()=>{
                      popupActions.setRenderContentAndShow(()=>{
                        return(
                          <DefaultPopup
                              title={'CẬP NHẬT THÀNH CÔNG'}
                              description={'Cập nhật sẽ được áp dụng trong lần khởi động sau'}
                              onPressPopup={()=>{popupActions.popPopup()}}/>
                        )
                      })
                    })
                    .catch((err)=>{
                      popupActions.setRenderContentAndShow(()=>{
                        return(
                          <DefaultPopup
                              title={'CẬP NHẬT THẤT BẠI'}
                              description={err}
                              onPressPopup={()=>{popupActions.popPopup()}}/>
                        )
                      })
                    })
                  }}/>
            )
          })
          // RNHotUpdate.update();
        }
      })
      .catch((err)=>{Debug.log(err);})
    // }

    if (!user.signin.signinState) {
      // not login yet
      dispatch(UserActions_MiddleWare.useTokenFromStore())
      .then(()=>{
        dispatch(UserActions_MiddleWare.reSignin())
        .then(()=>{self.processDeepLinkFromNotify();self.processNotify();})
        .catch(()=>{self.processDeepLinkFromNotify();/*self.processNotify();*/})
      })
      .catch(()=>{
        self.processDeepLinkFromNotify();
      }) ;

    }

    socketConnection.onStable('notification', notification => {
      dispatch(NotifyActions.addOnRequest({res:notification}));
    });




  },
  componentWillMount : function(){
    var self = this;
    const { dispatch,state,user  } = this.props;

    // var defaultHandler = ErrorUtils._globalHandler;
    // ErrorUtils._globalHandler = function(...args){
    //   defaultHandler(...args);
    //   Debug.log('!!!!!!!!!!!!!!GLOBAL ERROR HANDLER!!!!!!!!!!!!!!!!!!!!!!');
    //   Debug.log(args);
    //   Debug.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
    //   NativeModules.BridgeReloader.reload();
    // };
    if (!Define.constants.debug) {
      ErrorUtils.setGlobalHandler(error => {
        Debug.log('!!!!!!!!!!!!!!GLOBAL ERROR HANDLER!!!!!!!!!!!!!!!!!!!!!!');
        Debug.log(error);
        Debug.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
        NativeModules.BridgeReloader.reload()
      });
    }

    deepLinkManager.setRootView(self);
    reduxManager.setDispatchAndState(dispatch,state);
    reduxManager.dispatch(ServerConnectionActions_MiddleWare.connectToServer());

    // gen screen list
    var screenNameList=[

      HomeScreen,
      // MatchDetailScreen,
      ProScreen,
      ResultScreen,
      ResultByLeagueScreen,
      NewsScreen,
      NewsDetailScreen,
      AcountInfoScreen,
      PasswordChangeScreen,
      // ChannelScreen,
      RuleScreen,
      ConsultativeNewsScreen,
      ScheduleScreen,
      ClipDetailScreen,
      ClipScreen,
      ExactlyPredictScreen,
      HistoryScreen,
      ServiceScreen,
      TutorialScreen,
      ConsultativeNewsDetailScreen,
    ];

    self.screenList= screenNameList.map((current,index)=>{

      return(
        <Route
          key={index}
          name={current.nameScreen}
          schema='default'
          component={current}
          bodyStyle={styles.bodyView}
          initial={index===0?true:false}
          wrapRouter={true}
          renderLeftButton = {current.renderLeftButton}
          renderRightButton = {current.renderRightButton}
          renderTitle = {current.renderTitle}
          navigationBarStyle = {[{padding:0,height:navBarHeight,backgroundColor:'#303030'},Debug.styles.border]}
          navigationStyles={NavigatorNavigationBarStyles}
          rootView={self}
        />
      )
    })


    // prepair database
    Include.SQLiteManager.getDB().transaction(self.populateDB).then(() =>{
    });
    // SQLite.openDatabase(Define.constants.dataBase, '1.0', 'SQLite SCTV Database', 200000).then((DB) => {
    //         self.db = DB;
    //         Debug.log("Database OPEN");
    //
    //         self.db.transaction(self.populateDB).then(() =>{
    //         });
    //
    //     }).catch((error) => {
    //         Debug.log(error);
    //     });

    // pre load config from store
    // dispatch(StoreActions_MiddleWare.set('test','123'));
    // dispatch(StoreActions_MiddleWare.get('test'));

    // test SQLite

    // dispatch(SQLiteActions_MiddleWare.set({
    //                         table:'FootballTeams',
    //                         id:'test',
    //                         value:{
    //                           name:'456',
    //                           logo:'789',
    //                         }}));
    //

    // dispatch(SQLiteActions_MiddleWare.get({
    //                             table:'FootballTeams',
    //                           }));

    // dispatch(FootballActions_MiddleWare.fetchTeamsInfo({loadFromSQLite:true}));



    // register listener for callback
    BackAndroid.addEventListener('hardwareBackPress',
       function() {

         if (popupActions.popPopup()) {
           return true;
         }
         else if(popupActions.getPopupStackSize(0)>0){
           popupActions.popPopup(0,true,0);
           return true;
         }
         else if (self.sideMenu && self.sideMenu.isOpen) {
           self.drawSideMenu(false);
           return true;
         }
         else if (!self.splashScreen ) {
            if(Actions.pop()) {
               return true;
             }
            //  else{
            //    if (popupActions.getPopupStackSize()>0) {
            //      if (popupActions.popPopup(1)) {
            //        return true;
            //      }
            //      else{
            //        return false;
            //      }
            //    }
            //    else{
            //     return false;
            //    }
            //  }
          }
          return false;
        });

    DeviceEventEmitter.addListener('hardwareMenuPress', (e: Event)=>{
      self.drawSideMenu();
    });

    DeviceEventEmitter.addListener('activityOnPause', (e: Event)=>{
      // check connection status to re connect
      Debug.log('activityOnPause');

      if (popupActions.accelerometerListener) {
        popupActions.accelerometerListener.remove();
      }
     SensorManager.stopAccelerometer();

    });

     DeviceEventEmitter.addListener('activityOnResume', (e: Event)=>{
       // check connection status to re connect
       Debug.log('activityOnResume');

       if (!socketConnection.getConnectState()) {
         dispatch(ServerConnectionActions_MiddleWare.connectToServer())
         .then(()=>{
           var {user } = this.props;
           if (user.signin.signinState) {
             dispatch(UserActions_MiddleWare.reSignin());
           }
         });
       }

       //
     })
   },

  // for first time render view (for popup init)
  firstStartup:true,
  // for not display spinner at first time connect to server
  firstTime:true,

  splashScreen:true,

  screenList:[],

  sideMenuState:false,

  render:function(){
    const { dispatch,state ,user } = this.props;

    var self = this;
    // Debug.log('App state');
    // Debug.log(state);

    // dispatch(ServerConnectionActions.connectToServer());
    // Debug.log(this.props);

    var content;

    var test = false;
    var spinner = null;
    if (state.connected == false && state.connecting==true && self.firstTime==false) {
      // display spinner after first time
      spinner=
      <View pointerEvents={'auto'} style={{position:'absolute',top:0,bottom:0,left:0,right:0,justifyContent: 'center', alignItems: 'center',}}>
        <GiftedSpinner styleAttr={'Inverse'}  style={{height: 50,width:50}} />
      </View>
        ;
    }

    if (state.connected == false && state.connecting==false && self.firstStartup==false) {
      // display popup when connect false
      popupActions.popAllPopup(2,true,2);
      popupActions.setRenderContentAndShow(
        ()=>{
        return(
          <CannotConnectToServerPopup/>
        )
      },self.splashScreen?  {backgroundColor:'rgba(0,0,0,0)'}:null,{tapToExit:false,priority:2});
      self.firstTime = false;
    }

    if (test) {
      // for test
      content=(
        <View style={{flex:1,width:widthScreen,height:heightScreen}}>
          <TestScreen/>
        </View>
      )
    }
    else if(state.connected == false && self.splashScreen==true){

      content=(
        <View style={{flex:1,justifyContent: 'center', alignItems: 'center',}}>
          <View style={{position:'absolute',top:0,bottom:0,left:0,right:0}}>
            <Include.CustomImage resizeMode={'stretch'} style={{width:widthScreen,height:heightScreen}} source={Define.assets.splash_icon.splash}/>
          </View>
        </View>
      )
    }
    else{
      self.splashScreen = false;

      content=(
        <SideMenu
            ref={(sideMenu)=>{this.sideMenu=sideMenu;}}
            onChange={(state)=>{
              self.sideMenuState=state;
              if (state) {
                popupActions.popAllPopup(0,true,0);
                popupActions.popAllPopup(0,true,1);
                if (user.signin.signinState) {
                  dispatch(UserActions_MiddleWare.getInfo());
                }
              }

            }}
            openMenuOffset={widthScreen*4/5}
            isOpen={self.sideMenuState}
            menu={self.renderSideMenu()}>
          <Router onDidFocus={(arg)=>{dispatch(NavigatorActions.navigated(arg.route.name));  }} hideNavBar='true' name='mainRouter' >
            <Schema name='default' sceneConfig={Navigator.SceneConfigs.FloatFromRight}/>
            <Schema name="withoutAnimation"/>
            {self.screenList}
          </Router>
        </SideMenu>
      )
    }


    return(
      <View style={{flex:1}}>
        {content}
        <Popup rootView={self}/>
        {spinner}
      </View>
    )
  },

  componentDidMount : function(){

   //  dispatch(ServerConnectionActions.connectToServer());
   //  this.drawSideMenu();
     // Actions.ResultScreen();
     var self = this;
    //  const { dispatch,state  } = self.props;
    //  reduxManager.setDispatchAndState(dispatch,state);
     self.firstStartup = false;
     StatusBarAndroid.setHexColor('#303030');

     // util connected
     if (socketConnection.getConnectState()) {
       self.preProcessWhenStart();
     }
     else{
       socketConnection.on('connect', function(){
           self.preProcessWhenStart();
         });
     }

    //  StatusBarAndroid.hideStatusBar();
    //  var videoSize={
    //    width: widthScreen,
    //    height:  (widthScreen/Define.constants.videoWidth*Define.constants.videoHeight ),
    //  }



    //  popupActions.setRenderContentAndShow(()=>{
    //                                              return(
    //                                                <VideoPopup style={{width: videoSize.width,height:  videoSize.height,}}/>
    //                                              )
    //                                            },
    //                                        {
    //                                          backgroundColor:'transparent',
    //                                          flexDirection:'column',
    //                                          justifyContent:'flex-start',
    //                                          top:Define.constants.navBarHeight,
    //                                          width: videoSize.width,
    //                                          height:  videoSize.height,
     //
    //                                        },false,true);
      //  popupActions.setRenderContentAndShow(()=> <BeatPopup/>) ;

  },
})



var styles = {

  bodyView:{
    justifyContent: 'flex-start',
    top: navBarHeight,
    bottom:0,
    right:0,
    left:0,
    position: 'absolute',
    backgroundColor: '#e0e0e0',
    elevation:Define.constants.elevation,
    borderColor:'#000',
  },
}


function selectActions(todos) {
  // Debug.log('todos');
  // Debug.log(todos);
  return {
    user: todos.User,
    state: todos.ServerConnection,
  }
}

module.exports = connect(selectActions)(App);
// module.exports = App;
