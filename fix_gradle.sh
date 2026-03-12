#!/bin/bash
echo "=== Fixing all gradle files ==="

# 1. Fix ALL jcenter() references across all packages
find node_modules -name "*.gradle" | while read f; do
  if grep -q "jcenter()" "$f"; then
    perl -i -pe 's/jcenter\(\)/mavenCentral()\n        google()/g' "$f"
  fi
done

# 2. Fix react-native-fast-image old gradle plugin 2.3.3
perl -i -pe 's/com\.android\.tools\.build:gradle:2\.3\.3/com.android.tools.build:gradle:3.5.3/g' \
  node_modules/react-native-fast-image/android/build.gradle

# 3. Fix WheelPicker missing dependency
perl -i -ne 'print unless /cn\.aigestudio\.wheelpicker/' \
  node_modules/react-native-wheel-picker/android/build.gradle

# 4. Fix react-native-video - overwrite file completely with fixed version
for f in \
  "node_modules/react-native-video/android-exoplayer/build.gradle" \
  "node_modules/react-native-gifted-chat/node_modules/react-native-video/android-exoplayer/build.gradle"; do
  if [ -f "$f" ]; then
    echo "Overwriting $f"
    python3 - "$f" << 'PYEOF'
import sys
f = sys.argv[1]
content = """apply plugin: 'com.android.library'

def safeExtGet(prop, fallback) {
    rootProject.ext.has(prop) ? rootProject.ext.get(prop) : fallback
}

repositories {
    google()
    mavenCentral()
    jcenter()
}

android {
    compileSdkVersion safeExtGet('compileSdkVersion', 28)
    buildToolsVersion safeExtGet('buildToolsVersion', '28.0.3')
    compileOptions {
        targetCompatibility JavaVersion.VERSION_1_8
        sourceCompatibility JavaVersion.VERSION_1_8
    }
    defaultConfig {
        minSdkVersion safeExtGet('minSdkVersion', 16)
        targetSdkVersion safeExtGet('targetSdkVersion', 28)
        versionCode 1
        versionName "1.0"
    }
}

dependencies {
    implementation "com.facebook.react:react-native:${safeExtGet('reactNativeVersion', '+')}"
    implementation('com.google.android.exoplayer:exoplayer:2.9.3') {
        exclude group: 'com.android.support'
    }
    implementation "com.android.support:support-annotations:${safeExtGet('supportLibVersion', '28.0.0')}"
    implementation "com.android.support:support-compat:${safeExtGet('supportLibVersion', '28.0.0')}"
    implementation "com.android.support:support-media-compat:${safeExtGet('supportLibVersion', '28.0.0')}"
    implementation('com.google.android.exoplayer:extension-okhttp:2.9.3') {
        exclude group: 'com.squareup.okhttp3', module: 'okhttp'
    }
    implementation 'com.squareup.okhttp3:okhttp:3.12.1'
}
"""
open(f, 'w').write(content)
print('Fixed ' + f)
PYEOF
  fi
done

echo "=== All fixes applied ==="

# 5. Remove react-native-video from android settings
sed -i '' "/react-native-video/d" ../android/settings.gradle
sed -i '' "/react-native-video/d" ../android/app/build.gradle
