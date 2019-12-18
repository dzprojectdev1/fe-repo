package com.pys.dazzleddate;

<<<<<<< HEAD
import androidx.annotation.NonNull;

import io.wazo.callkeep.RNCallKeepModule;
=======
>>>>>>> d560d4782725f6adaef8daaa058bfdb8f6d6ff8f
import com.facebook.react.ReactActivity;
import com.facebook.react.ReactActivityDelegate;
import com.facebook.react.ReactRootView;
import com.swmansion.gesturehandler.react.RNGestureHandlerEnabledRootView;

public class MainActivity extends ReactActivity {

    /**
<<<<<<< HEAD
     * Returns the name of the main component registered from JavaScript. This is
     * used to schedule rendering of the component.
=======
     * Returns the name of the main component registered from JavaScript.
     * This is used to schedule rendering of the component.
>>>>>>> d560d4782725f6adaef8daaa058bfdb8f6d6ff8f
     */
    @Override
    protected String getMainComponentName() {
        return "DazzledDate";
    }

    @Override
    protected ReactActivityDelegate createReactActivityDelegate() {
<<<<<<< HEAD
        return new ReactActivityDelegate(this, getMainComponentName()) {
            @Override
            protected ReactRootView createRootView() {
                return new RNGestureHandlerEnabledRootView(MainActivity.this);
            }
        };
    }

    // Permission results
    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        switch (requestCode) {
            case RNCallKeepModule.REQUEST_READ_PHONE_STATE:
                RNCallKeepModule.onRequestPermissionsResult(requestCode, permissions, grantResults);
                break;
        }
=======
    return new ReactActivityDelegate(this, getMainComponentName()) {
        @Override
        protected ReactRootView createRootView() {
        return new RNGestureHandlerEnabledRootView(MainActivity.this);
        }
    };
>>>>>>> d560d4782725f6adaef8daaa058bfdb8f6d6ff8f
    }
}
