#!/bin/bash
echo "=== Fixing all gradle files ==="

# Fix all jcenter references
find node_modules -name "*.gradle" | while read f; do
  if grep -q "jcenter()" "$f"; then
    echo "Fixing jcenter in $f"
    perl -i -pe 's/jcenter\(\)/mavenCentral()\n        google()/g' "$f"
  fi
done

# Fix react-native-fast-image old gradle plugin
perl -i -pe 's/com\.android\.tools\.build:gradle:2\.3\.3/com.android.tools.build:gradle:3.5.3/g' \
  node_modules/react-native-fast-image/android/build.gradle

# Fix WheelPicker missing dependency
perl -i -ne 'print unless /cn\.aigestudio\.wheelpicker/' \
  node_modules/react-native-wheel-picker/android/build.gradle

# Fix exoplayer version in all video packages
for f in \
  node_modules/react-native-video/android-exoplayer/build.gradle \
  node_modules/react-native-gifted-chat/node_modules/react-native-video/android-exoplayer/build.gradle; do
  if [ -f "$f" ]; then
    echo "Fixing exoplayer in $f"
    perl -i -pe 's/(exoplayer:)[0-9.]+/$1 . "2.9.6"/ge' "$f"
    perl -i -pe 's/(extension-okhttp:)[0-9.]+/$1 . "2.9.6"/ge' "$f"
  fi
done

echo "=== All fixes applied ==="
