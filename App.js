import 'react-native-gesture-handler';
import React, {useState, useEffect, useMemo} from 'react';
import { LogBox, StatusBar } from 'react-native';
import Loading from './src/components/AppLoading';
import AdmobBanner from './src/components/AdmobBanner';
import { Asset } from 'expo-asset';
import AppLoading from 'expo-app-loading';
import LanguageContext from './src/languages/LanguageContext';
import Preferences from './src/context/Preferences';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Provider as PaperProvider, DefaultTheme as DefaultThemePaper, DarkTheme as DarkThemePaper } from 'react-native-paper';
import { NavigationContainer, DefaultTheme as DefaultThemeNav, DarkTheme as DarkThemeNav } from '@react-navigation/native';
import DrawerNavigation from './src/navigation/DrawerNavigation';
import GuestNavigation from './src/navigation/GuestNavigation';
import ColorsApp from './src/config/ColorsApp';
import ConfigApp from './src/config/ConfigApp';
import firebase from './src/config/ConfigFirebase';
import MaterialIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import moment from 'moment';
import 'moment/locale/es';
import 'moment/locale/ar';

DarkThemePaper.colors.primary = ColorsApp.PRIMARY;
DarkThemePaper.colors.accent = ColorsApp.PRIMARY;
DarkThemePaper.roundness = 6;

DefaultThemePaper.colors.primary = ColorsApp.PRIMARY;
DefaultThemePaper.colors.accent = ColorsApp.PRIMARY;
DefaultThemePaper.roundness = 6;
DefaultThemeNav.colors.background = "#fff";

LogBox.ignoreAllLogs();

const cacheImages = (images) => {

  return images.map(image => {
    if (typeof image === 'string') {
      return Image.prefetch(image);
    } else {
      return Asset.fromModule(image).downloadAsync();
    }
  });
}

  const loadAssetsAsync = async () => {

    const imageAssets = cacheImages([
      require('./assets/male.jpg'),
      require('./assets/female.jpg'),
      require('./assets/logo.png'),
      require('./assets/bg.jpg'),
      require('./assets/logo-white.png')
    ]);

    await Promise.all([...imageAssets]);
  }

const App = () => {

  const [theme, setTheme] = useState(ConfigApp.THEMEMODE);
  const [isLogged, setIsLogged] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [language, setLanguage] = useState(ConfigApp.DEFAULTLANG);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
    AsyncStorage.setItem('themeSetting', theme);
  }

  const preference = useMemo(
    () => ({
    toggleTheme, theme
  }),
  [theme],
  );

  const updateValue = (lang) => {
    setLanguage(lang);
    AsyncStorage.setItem('language', lang)
  }

  useEffect(() => {

    async function checkTheme() {
      
      await AsyncStorage.getItem('themeSetting')
      .then((value) => {
        if (value) {
          setTheme(value === "dark" ? "light" : "dark");
        }
      });
    }
  
    checkTheme();
  
  }, []);

  useEffect(() => {

    async function checkUser() {
      
      await firebase.auth().onAuthStateChanged((user) => {
        if(user !== null) {
          setIsLogged(true);
          setLoaded(true);
    
        } else {
          setIsLogged(false);
          setLoaded(true);

        }
      })
    }
  
    checkUser();
  
  }, []);

  useEffect(() => {

    LogBox.ignoreLogs(['VirtualizedLists should never be nested']);

    AsyncStorage.getItem('language')
      .then((lang) => {
        if (lang) {
          setLanguage(lang);
        }
      });

  }, []);

  useEffect(() => {

      if(language === 'es' || language === 'ar'){
        moment.locale(language);
      }else{
        moment.locale('en');
      }

  }, [language]);

    if (!isReady) {
      return (
        <AppLoading
          startAsync={loadAssetsAsync}
          onFinish={() => setIsReady(true)}
          onError={console.warn}
        />
      );
    }

    if (!loaded) {
      return (
        <Loading/>
        );
    }

    if (loaded && isReady) {
      return (
      <Preferences.Provider value={preference}>
      <LanguageContext.Provider value={{ language, updateValue }}>
      <PaperProvider theme={theme === "dark" ? DarkThemePaper : DefaultThemePaper} settings={{ icon: props => <MaterialIcons {...props} />, }}>
      <StatusBar translucent backgroundColor="transparent" barStyle={theme === "dark" ? "light-content" : "dark-content"}/>
      <NavigationContainer theme={theme === "dark" ? DarkThemeNav : DefaultThemeNav}>
      {isLogged ? <DrawerNavigation/> : <GuestNavigation/>}
      {isLogged ? <AdmobBanner/> : null}
      </NavigationContainer>
      </PaperProvider>
      </LanguageContext.Provider>
      </Preferences.Provider>
        );
    }

    };

    export default App;