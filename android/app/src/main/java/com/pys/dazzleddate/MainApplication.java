package com.pys.dazzleddate;

import android.app.Application;

import com.facebook.react.ReactApplication;
<<<<<<< HEAD
import com.zmxv.RNSound.RNSoundPackage;
import com.quickblox.reactnative.RNQbReactnativePackage;
import io.wazo.callkeep.RNCallKeepPackage;
import com.reactnativecommunity.asyncstorage.AsyncStoragePackage;
import com.zyu.ReactNativeWheelPickerPackage;
import com.henninghall.date_picker.DatePickerPackage;
=======
>>>>>>> d560d4782725f6adaef8daaa058bfdb8f6d6ff8f
import com.dylanvann.fastimage.FastImageViewPackage;
import com.dooboolab.RNIap.RNIapPackage;
import com.agontuk.RNFusedLocation.RNFusedLocationPackage;
import com.swmansion.gesturehandler.react.RNGestureHandlerPackage;
import com.evollu.react.fcm.FIRMessagingPackage;
import io.invertase.firebase.RNFirebasePackage;
import io.invertase.firebase.notifications.RNFirebaseNotificationsPackage;
import io.invertase.firebase.messaging.RNFirebaseMessagingPackage;
import com.learnium.RNDeviceInfo.RNDeviceInfo;
import com.brentvatne.react.ReactVideoPackage;
<<<<<<< HEAD
=======
import com.zyu.ReactNativeWheelPickerPackage;
>>>>>>> d560d4782725f6adaef8daaa058bfdb8f6d6ff8f
import com.rnfs.RNFSPackage;
import org.reactnative.camera.RNCameraPackage;
import com.reactnativecommunity.asyncstorage.AsyncStoragePackage;
import com.imagepicker.ImagePickerPackage;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;
<<<<<<< HEAD
=======
import com.oney.WebRTCModule.WebRTCModulePackage;
>>>>>>> d560d4782725f6adaef8daaa058bfdb8f6d6ff8f
import java.util.Arrays;
import java.util.List;

public class MainApplication extends Application implements ReactApplication {

  private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
    @Override
    public boolean getUseDeveloperSupport() {
      return BuildConfig.DEBUG;
    }

    @Override
    protected List<ReactPackage> getPackages() {
      return Arrays.<ReactPackage>asList(
          new MainReactPackage(),
<<<<<<< HEAD
            new RNSoundPackage(),
            new RNQbReactnativePackage(),
            new RNCallKeepPackage(),
            new AsyncStoragePackage(),
            new ReactNativeWheelPickerPackage(),
            new DatePickerPackage(),
=======
          new WebRTCModulePackage(),
>>>>>>> d560d4782725f6adaef8daaa058bfdb8f6d6ff8f
            new FastImageViewPackage(),
            new RNIapPackage(),
            new RNFusedLocationPackage(),
            new RNGestureHandlerPackage(),
            new FIRMessagingPackage(),
            new RNFirebasePackage(),
            new RNFirebaseNotificationsPackage(),
            new RNFirebaseMessagingPackage(),
            new RNDeviceInfo(),
            new ReactVideoPackage(),
<<<<<<< HEAD
            new RNFSPackage(),
            new RNCameraPackage(),
=======
            new ReactNativeWheelPickerPackage(),
            new RNFSPackage(),
            new RNCameraPackage(),
            new AsyncStoragePackage(),
>>>>>>> d560d4782725f6adaef8daaa058bfdb8f6d6ff8f
            new ImagePickerPackage()
      );
    }

    @Override
    protected String getJSMainModuleName() {
      return "index";
    }
  };

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {
    super.onCreate();
    SoLoader.init(this, /* native exopackage */ false);
  }
}
